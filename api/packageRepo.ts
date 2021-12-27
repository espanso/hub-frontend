import { array, either, taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import { TaskEither } from "fp-ts/TaskEither";
import { unzip } from "unzipit";
import * as yaml from "yaml";
import { Package, PackageManifest, PackageRepo } from "./domain";
import { taskEitherLogError } from "./utils";

const ZIP_REPO_FILENAMES = {
  readme: "README.md",
  manifest: "_manifest.yml",
  packageYml: "package.yml",
};

const taskEitherChainTryCatch = <A, T>(g: (a: A) => Promise<T>) =>
  taskEither.chain((a: A) => taskEither.tryCatch(() => g(a), either.toError));

export const fetchPackageRepo: (p: Package) => TaskEither<Error, PackageRepo> =
  (p: Package) =>
    pipe(
      taskEither.tryCatch(() => fetch(p.archive_url), either.toError),
      taskEitherChainTryCatch((res) => res.arrayBuffer()),
      taskEitherChainTryCatch((buff) => unzip(buff)),
      taskEitherChainTryCatch(
        (zipInfo) =>
          pipe(
            Object.values(ZIP_REPO_FILENAMES),
            array.map((key) => zipInfo.entries[key].text()),
            Promise.all.bind(Promise)
          ) as Promise<Awaited<string>[]>
      ),
      taskEither.chain(([readme, manifest, packageYml]: string[]) =>
        pipe(
          yaml.parse(manifest),
          PackageManifest.decode,
          either.fold(
            () => taskEither.left(new Error("Invalid manifest")),
            (v) =>
              taskEither.right({
                readme,
                manifest: v,
                packageYml,
              })
          )
        )
      ),
      taskEither.map((repo) => ({
        package: p,
        ...repo,
      })),
      taskEitherLogError
    );
