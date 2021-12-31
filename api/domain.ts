import compareVersions from "compare-versions";
import { array, boolean, either, nonEmptyArray, option, record } from "fp-ts";
import { constant, flow, pipe } from "fp-ts/function";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { fromCompare, Ord } from "fp-ts/Ord";
import * as t from "io-ts";
import * as tp from "io-ts-types";

interface PackageVersionBrand {
  readonly PackageVersion: unique symbol;
}

const PackageVersion = t.brand(
  t.string,
  (s): s is t.Branded<string, PackageVersionBrand> => /^\d+\.\d+\.\d+$/.test(s),
  "PackageVersion"
);

export type PackageVersion = t.TypeOf<typeof PackageVersion>;

const RawPackage = t.type(
  {
    name: t.string,
    author: t.string,
    description: t.string,
    title: t.string,
    version: PackageVersion,
    archive_url: t.string,
    archive_sha256_url: t.string,
    tags: tp.nonEmptyArray(t.string),
  },
  "PackageRaw"
);

export type RawPackage = t.TypeOf<typeof RawPackage>;

const PackageWithId = t.intersection(
  [t.type({ id: t.string }), RawPackage],
  "PackageWithId"
);

type PackageWithId = t.TypeOf<typeof PackageWithId>;

export const Package = new t.Type<PackageWithId, PackageWithId, unknown>(
  "Package",
  (input: any): input is PackageWithId => PackageWithId.is(input),
  (input, ctx) =>
    pipe(
      RawPackage.validate(input, ctx),
      either.map((p) => ({ id: `${p.name}-${p.version}`, ...p }))
    ),
  (p) => p
);

export type Package = t.TypeOf<typeof Package>;

export const DateFromTimestamp = new t.Type<Date, number, unknown>(
  "DateFromTimestamp",
  (input): input is Date => input instanceof Date,
  (input, ctx) =>
    pipe(
      t.number.validate(input, ctx),
      either.chain((n) => {
        const d = new Date(n * 1000);
        return isNaN(d.getTime()) ? t.failure(n, ctx) : t.success(d);
      })
    ),
  (date) => Math.round(new Date(date).getTime() / 1000)
);

export type DateFromTimestamp = t.TypeOf<typeof DateFromTimestamp>;

export const PackagesIndex = t.type(
  {
    last_update: t.number,
    packages: t.array(Package),
  },
  "PackagesIndex"
);

export type PackagesIndex = t.TypeOf<typeof PackagesIndex>;

export const PackageManifest = t.type(
  {
    author: t.string,
    description: t.string,
    homepage: t.string,
    name: t.string,
    title: t.string,
    version: t.string,
  },
  "PackageManifest"
);

export type PackageManifest = t.TypeOf<typeof PackageManifest>;

const PackageRepo = t.type(
  {
    package: Package,
    manifest: PackageManifest,
    readme: t.string,
    packageYml: t.string,
  },
  "PackageRepo"
);

export type PackageRepo = t.TypeOf<typeof PackageRepo>;

export const OrdByVersion: Ord<Package> = fromCompare(
  (first, second) => compareVersions(second.version, first.version) // descending
);

export const OrderedByVersion = new t.Type<
  NonEmptyArray<Package>,
  NonEmptyArray<Package>,
  Array<Package>
>(
  "OrderedByVersion",
  (input): input is NonEmptyArray<Package> =>
    Array.isArray(input) &&
    input.every(
      flow(Package.decode, either.fold(constant(true), constant(false)))
    ),
  (input, ctx) =>
    pipe(
      Array.isArray(input) &&
        input.every(
          flow(Package.decode, either.fold(constant(true), constant(false)))
        ),
      boolean.fold(constant(t.failure(input, ctx)), () =>
        pipe(
          input,
          array.sort(OrdByVersion),
          nonEmptyArray.fromArray,
          option.fold(
            () => t.failure(input, ctx),
            (v) => t.success(v)
          )
        )
      )
    ),
  (ordered) => ordered
);

export type OrderedByVersion = t.TypeOf<typeof OrderedByVersion>;

export const GroupedByVersion = new t.Type<
  Record<string, OrderedByVersion>,
  Record<string, OrderedByVersion>,
  Array<Package>
>(
  "GroupedByVersion",
  (input): input is Record<string, OrderedByVersion> =>
    input instanceof Object &&
    Object.keys(input).every(
      (key) =>
        OrderedByVersion.is((input as any)[key]) &&
        pipe(
          (input as any)[key],
          OrderedByVersion.decode,
          either.fold(constant(false), flow(array.every((p) => p.name === key)))
        )
    ),
  (input, ctx) =>
    pipe(
      input,
      nonEmptyArray.fromArray,
      either.fromOption(constant(new Error("Input array is empty"))),
      either.map(nonEmptyArray.groupBy((p: Package) => p.name)),
      either.map(record.map(nonEmptyArray.sort(OrdByVersion))),
      either.fold((e) => t.failure(e, ctx), t.success)
    ),
  (grouped) => grouped
);

export type GroupedByVersion = t.TypeOf<typeof GroupedByVersion>;
