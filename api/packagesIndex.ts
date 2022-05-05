import flatCache from "flat-cache";
import { array, either, option, taskEither } from "fp-ts";
import { constant, flow, pipe } from "fp-ts/function";
import { TaskEither } from "fp-ts/TaskEither";
import { PackagesIndex } from "./domain";
import { taskEitherLogError } from "./utils";

const PACKAGE_INDEX_URL =
  process.env.PACKAGE_INDEX_URL ||
  "https://github.com/espanso/hub/releases/download/v1.0.0/package_index.json";

const PACKAGE_INDEX_CACHE_ID = "packagesIndex";
const CACHE_DIR = process.env.PACKAGE_INDEX_CACHE_DIR || undefined;

const fetchPackagesIndexInternal = (cache: flatCache.Cache) =>
  pipe(
    cache.getKey(PACKAGE_INDEX_URL),
    option.fromNullable,
    option.fold(
      () =>
        pipe(
          taskEither.tryCatch(
            constant(fetch(PACKAGE_INDEX_URL)),
            either.toError
          ),
          taskEither.chain((response) =>
            taskEither.tryCatch(constant(response.json()), either.toError)
          ),
          taskEither.chain(
            flow(
              PackagesIndex.decode,
              either.mapLeft(either.toError),
              taskEither.fromEither
            )
          ),
          taskEither.map((packagesIndex) => {
            const noDummyPackage: PackagesIndex = {
              ...packagesIndex,
              packages: pipe(
                packagesIndex.packages,
                array.filter((p) => p.name !== "dummy-package")
              ),
            };
            cache.setKey(PACKAGE_INDEX_URL, noDummyPackage);
            cache.save();
            return cache.getKey(PACKAGE_INDEX_URL);
          })
        ),
      taskEither.of
    ),
    taskEitherLogError
  );

export const fetchPackagesIndex: TaskEither<Error, PackagesIndex> = pipe(
  flatCache.load(PACKAGE_INDEX_CACHE_ID, CACHE_DIR),
  fetchPackagesIndexInternal
);
