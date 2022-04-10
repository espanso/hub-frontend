import {
  array,
  boolean,
  either,
  nonEmptyArray,
  option,
  record,
  taskEither,
} from "fp-ts";
import { sequenceS } from "fp-ts/Apply";
import { constant, flow, pipe } from "fp-ts/function";
import { TaskEither } from "fp-ts/TaskEither";
import { unzip } from "unzipit";
import * as yaml from "yaml";
import { Package, PackageManifest, PackageRepo } from "./domain";
import { taskEitherLogError } from "./utils";

// https://espanso.org/docs/next/packages/package-specification/
const mandatoryFilenames = {
  readme: "README.md",
  manifest: "_manifest.yml",
  packageYml: "package.yml",
};
const optionalFilenames = {
  license: "LICENSE",
};

const taskEitherChainTryCatch = <A, T>(g: (a: A) => Promise<T>) =>
  taskEither.chain((a: A) => taskEither.tryCatch(() => g(a), either.toError));

export const fetchPackageRepo: (
  p: Package
) => TaskEither<Error, PackageRepo> = (p: Package) =>
  pipe(
    taskEither.tryCatch(() => fetch(p.archive_url), either.toError),
    taskEitherChainTryCatch((res) => res.arrayBuffer()),
    taskEitherChainTryCatch((buff) => unzip(buff)),
    taskEither.chain((zipInfo) =>
      pipe(
        zipInfo.entries,
        record.map((zipEntry) =>
          taskEither.tryCatch(() => zipEntry.text(), either.toError)
        ),
        sequenceS(taskEither.ApplyPar)
      )
    ),
    taskEither.chain((fileContent: Record<string, string>) =>
      pipe(
        fileContent,
        record.lookup(mandatoryFilenames.manifest),
        either.fromOption(
          () => new Error(`Missing ${mandatoryFilenames.readme}`)
        ),
        either.map(yaml.parse),
        either.chain(
          flow(
            PackageManifest.decode,
            either.mapLeft(
              flow(
                array.reduce("", (acc, curr) => `${acc} ${curr.value}`),
                Error
              )
            )
          )
        ),
        either.map((manifest) => ({
          package: either.right(p),
          manifest: either.right(manifest),
          readme: pipe(
            fileContent,
            record.lookup(mandatoryFilenames.readme),
            either.fromOption(
              () => new Error(`Missing ${mandatoryFilenames.readme}`)
            )
          ),
          packageYml: pipe(
            fileContent,
            record.lookup(mandatoryFilenames.packageYml),
            option.map((packageYml) => ({
              name: mandatoryFilenames.packageYml,
              content: packageYml,
            })),
            option.map(nonEmptyArray.of),
            option.map(
              nonEmptyArray.concat(
                pipe(
                  fileContent,
                  record.filterMapWithIndex((k, v) =>
                    pipe(
                      [
                        Object.values(mandatoryFilenames),
                        Object.values(optionalFilenames),
                      ],
                      array.flatten,
                      array.exists((filename) => filename !== k),
                      boolean.fold(
                        constant(option.none),
                        constant(
                          option.some({
                            name: k,
                            content: v,
                          })
                        )
                      )
                    )
                  ),
                  Object.values
                )
              )
            ),
            either.fromOption(
              () => new Error(`Missing ${mandatoryFilenames.readme}`)
            )
          ),
          license: pipe(
            fileContent,
            record.lookup(optionalFilenames.license),
            either.right
          ),
        })),
        either.chain(sequenceS(either.Apply)),
        taskEither.fromEither
      )
    ),
    taskEitherLogError
  );
