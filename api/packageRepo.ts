import { array, either, option, taskEither } from "fp-ts";
import { pipe, flow } from "fp-ts/function";
import { TaskEither } from "fp-ts/TaskEither";
import { unzip, ZipEntry, ZipInfo } from "unzipit";
import { Eq } from "fp-ts/string";
import { Package, PackageRepo } from "./Package";
import { promisify } from "util";
import { writeFile } from "fs";

const PATH_REPO_ZIP = "./packagesRepo/";

export const taskEitherWriteFile =
  (path: string) => (content: ReadableStream) =>
    taskEither.tryCatch(
      () => promisify(writeFile)(path, content),
      either.toError
    );

const fetchArchive: (
  path: string
) => (archiveUrl: string) => TaskEither<Error, string> =
  (path) => (archiveUrl) =>
    pipe(
      taskEither.tryCatch(() => fetch(archiveUrl), either.toError),
      taskEither.chain<Error, Response, ReadableStream>(
        flow(
          option.fromNullable,
          option.map((r) => r.body),
          option.chain(option.fromNullable),
          taskEither.fromOption(
            () => new Error(`${archiveUrl} failed to fetch`)
          )
        )
      ),
      taskEither.chain(taskEitherWriteFile(path)),
      taskEither.map(() => path)
    );

const readArchiviedFileAsText: (
  filename: string
) => (path: string) => TaskEither<Error, string> = (filename) => (path) =>
  pipe(
    taskEither.tryCatch(() => unzip(path), either.toError),
    taskEither.map<ZipInfo, ZipEntry[]>(Object.values),
    taskEither.chain(
      flow(
        array.findFirst((entry) => Eq.equals(entry.name, filename)),
        option.chain(option.fromNullable),
        option.fold(
          () => taskEither.left(new Error("README.md not found")),
          (entry) => taskEither.tryCatch(() => entry.text(), either.toError)
        )
      )
    )
  );

const fetchPackageRepo: (p: Package) => TaskEither<Error, PackageRepo> = (
  p: Package
) =>
  pipe(
    p.archive_url,
    fetchArchive(`${PATH_REPO_ZIP}/${p.name}`),
    taskEither.chain(readArchiviedFileAsText("README.md")),
    taskEither.map((readme) => ({
      name: p.name,
      readme,
    }))
  );
