import { array, either, nonEmptyArray, option, record } from "fp-ts";
import { flow, pipe } from "fp-ts/lib/function";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import {
  GroupedByVersion,
  OrderedByVersion,
  Package,
  PackageRepo,
  PackagesIndex,
} from "./domain";
import { fetchPackageRepo } from "./packageRepo";

export type PackageDetails = {
  packageRepo:
    | (PackageRepo & {
        serializedReadme: MDXRemoteSerializeResult<
          Record<string, unknown>
        > | null;
      })
    | null;
  versions: Array<string>;
};

export async function resolvePackage(
  packagesIndex: PackagesIndex,
  packageName?: string,
  version?: string
): Promise<PackageDetails> {
  const packages = packagesIndex.packages.filter((p) => p.name === packageName);
  const orderedPackages = pipe(
    OrderedByVersion.decode(packages),
    either.fold(
      () => {
        throw new Error("Failed to order packages by version");
      },
      (packages) => packages
    )
  );

  const orderedVersions = orderedPackages.map((p) => p.version);

  const currentVersion = pipe(
    orderedPackages,
    version ? array.findFirst((p) => p.version === version) : array.head,
    option.toNullable
  );

  if (!currentVersion) {
    // TODO: Omit entire package details page if version not found
    throw new Error("Version not found");
  }

  const packageRepoEither = await fetchPackageRepo(currentVersion)();
  const packageRepo = pipe(
    packageRepoEither,
    either.mapLeft(console.error),
    option.fromEither,
    option.toNullable
  );

  if (!packageRepo) {
    return {
      packageRepo: null,
      versions: orderedVersions,
    };
  }

  // See https://github.com/espanso/hub-frontend/issues/6
  const fixLiteralHTML = (html: string) =>
    html
      .replaceAll("<br>", "<br/>")
      .replaceAll("<kbd>", "`")
      .replaceAll("</kbd>", "`");

  const serializedReadme = await serialize(fixLiteralHTML(packageRepo.readme), {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
    },
  }).catch((e) => {
    console.error(`
      Failed to serialize readme for ${currentVersion.name}
      ${e}`);
    return null;
  });

  return {
    packageRepo: {
      ...packageRepo,
      serializedReadme,
    },
    versions: orderedVersions,
  };
}

export const groupByVersion = (packages: Package[]) =>
  pipe(
    packages,
    GroupedByVersion.decode,
    either.map<GroupedByVersion, Package[]>(
      flow(record.map(nonEmptyArray.head), Object.values)
    ),
    option.fromEither
  );
