import { array, either, option, taskEither } from "fp-ts";
import { pipe, flow } from "fp-ts/function";
import { TaskEither } from "fp-ts/TaskEither";
import { unzip, ZipEntry, ZipInfo } from "unzipit";
import { Eq } from "fp-ts/string";
import { Package, PackageRepo } from "./Package";
import { SHA256 } from "crypto-js";

const taskEitherChainTryCatch = <A, T>(g: (a: A) => Promise<T>) =>
  taskEither.chain((a: A) => taskEither.tryCatch(() => g(a), either.toError));

export const fetchPackageRepo: (p: Package) => TaskEither<Error, PackageRepo> =
  (p: Package) =>
    pipe(
      taskEither.tryCatch(() => fetch(p.archive_url), either.toError),
      taskEitherChainTryCatch((res) => res.arrayBuffer()),
      taskEitherChainTryCatch((buff) => unzip(buff)),
      taskEither.map<ZipInfo, ZipEntry[]>((info) =>
        Object.values(info.entries)
      ),
      taskEither.chain(
        flow(
          array.findFirst((entry) => {
            return Eq.equals(entry.name, "README.md");
          }),
          option.chain(option.fromNullable),
          option.fold(
            () => taskEither.left(new Error("README.md not found")),
            (entry) => taskEither.tryCatch(() => entry.text(), either.toError)
          )
        )
      ),
      taskEither.map((readme) => ({
        package: p,
        readme,
      }))
    );
