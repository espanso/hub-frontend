import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";

interface PackageVersionBrand {
  readonly PackageVersion: unique symbol;
}

const PackageVersion = t.brand(
  t.string,
  (s): s is t.Branded<string, PackageVersionBrand> => /^\d+\.\d+\.\d+$/.test(s),
  "PackageVersion"
);

export type PackageVersion = t.TypeOf<typeof PackageVersion>;

const Package = t.type(
  {
    name: t.string,
    author: t.string,
    description: t.string,
    title: t.string,
    version: PackageVersion,
    archive_url: t.string,
    archive_sha256_url: t.string,
  },
  "Package"
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

const PackageRepo = t.type({
  package: Package,
  readme: t.string,
});

export type PackageRepo = t.TypeOf<typeof PackageRepo>;
