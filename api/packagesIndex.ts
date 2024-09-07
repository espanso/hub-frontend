import flatCache from "flat-cache";
import { array, either } from "fp-ts";
import { pipe } from "fp-ts/function";
import { PackagesIndex } from "./domain";

const PACKAGE_INDEX_URL = process.env.PACKAGE_INDEX_URL || "";

const PACKAGE_INDEX_CACHE_ID = "packagesIndex";
const CACHE_DIR = process.env.PACKAGE_INDEX_CACHE_DIR || undefined;

async function fetchPackagesIndex(url: string): Promise<PackagesIndex> {
  const response = await fetch(url);
  const json = await response.json();

  return pipe(
    PackagesIndex.decode(json),
    either.map((x) => ({
      ...x,
      packages: pipe(
        x.packages,
        array.filter((p) => p.name !== "dummy-package")
      ),
    })),
    either.fold(
      (e) => Promise.reject(e),
      (x) => Promise.resolve(x)
    )
  );
}

export async function getPackagesIndex(): Promise<PackagesIndex> {
  const cache = flatCache.load(PACKAGE_INDEX_CACHE_ID, CACHE_DIR);
  const cachedPackagesIndex = cache.getKey(PACKAGE_INDEX_URL);
  if (cachedPackagesIndex) {
    return cachedPackagesIndex;
  }

  const packagesIndex = await fetchPackagesIndex(PACKAGE_INDEX_URL);

  cache.setKey(PACKAGE_INDEX_URL, packagesIndex);
  cache.save();
  return cache.getKey(PACKAGE_INDEX_URL);
}

// export const getPackagesIndex: TaskEither<Error, PackagesIndex> =
//   taskEither.tryCatch(fetchPackagesIndexOrCache, either.toError);
