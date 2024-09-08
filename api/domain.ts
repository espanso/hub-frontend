import { compareVersions } from "compare-versions";
import {
  array,
  boolean,
  either,
  nonEmptyArray,
  option,
  predicate,
  record,
  string,
} from "fp-ts";
import { constant, flow, identity, pipe } from "fp-ts/function";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { fromCompare, Ord } from "fp-ts/Ord";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
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

const arrayValidate: (ctx: t.Context) => <T>(a: unknown) => t.Validation<T[]> = ctx => a =>
  Array.isArray(a) ? t.success(a) : t.failure(a, ctx, "Not an array")

// This codec creates an Array of Package ignoring non valid Package.
// Decode errors are reported by console.error per each Package.
// https://github.com/espanso/hub-frontend/issues/28
export const PackageArray = new t.Type<Array<Package>>(
  "PackageArray",
  (input): input is Array<Package> => Array.isArray(input) && input.every(Package.is),
  (input, ctx) =>
    pipe(
      input,
      arrayValidate(ctx),
      either.map(
        array.filterMapWithIndex((i, p) => pipe(
          p,
          Package.decode,
          validation => pipe(
            validation,
            either.fold(
              () => pipe(
                `[>>>>] warn - Package decode failure: ignoring
                  ${JSON.stringify((input as Array<unknown>)[i])}
                  because
                  ${PathReporter.report(validation).join('\n')}`,
                console.error,
                () => option.none
              ),
              option.some
            ))
        ))
      )),
  identity
);

export type PackageArray = t.TypeOf<typeof PackageArray>;

export const PackagesIndex = t.type(
  {
    last_update: t.number,
    packages: PackageArray,
  },
  "PackagesIndex"
);

export type PackagesIndex = t.TypeOf<typeof PackagesIndex>;

export const PackageManifest = t.type(
  {
    author: t.string,
    description: t.string,
    name: t.string,
    title: t.string,
    version: t.string,
    homepage: tp.optionFromNullable(t.string),
    tags: tp.nonEmptyArray(t.string),
  },
  "PackageManifest"
);

export type PackageManifest = t.TypeOf<typeof PackageManifest>;

const FileAsString = t.type({
  name: t.string,
  content: t.string,
});

export type FileAsString = t.TypeOf<typeof FileAsString>;

const PackageRepo = t.type(
  {
    package: Package,
    manifest: PackageManifest,
    readme: t.string,
    packageYml: tp.nonEmptyArray(FileAsString),
    license: tp.optionFromNullable(t.string),
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
      flow(Package.decode, either.fold(constant(false), constant(true)))
    ),
  (input, ctx) =>
    pipe(
      Array.isArray(input) &&
      input.every(
        flow(Package.decode, either.fold(constant(false), constant(true)))
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

interface TextSearchBrand {
  readonly TextSearch: unique symbol;
}

export const TextSearch = t.brand(
  t.string,
  (s): s is t.Branded<string, TextSearchBrand> =>
    predicate.not(string.isEmpty)(s),
  "TextSearch"
);

export type TextSearch = t.TypeOf<typeof TextSearch>;
