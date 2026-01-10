import * as v from "valibot";

// Package version schema - validates semver format
export const PackageVersionSchema = v.pipe(
  v.string(),
  v.regex(/^\d+\.\d+\.\d+$/, 'Must be valid semver (e.g., "1.0.0")'),
);

export type PackageVersion = v.InferOutput<typeof PackageVersionSchema>;

// Raw package schema (without id)
export const RawPackageSchema = v.object({
  name: v.string(),
  author: v.string(),
  description: v.string(),
  title: v.string(),
  version: PackageVersionSchema,
  archive_url: v.string(),
  archive_sha256_url: v.string(),
  tags: v.array(v.string()),
  files: v.optional(v.record(v.string(), v.string())),
  repositoryHome: v.optional(v.string()),
});

export type RawPackage = v.InferOutput<typeof RawPackageSchema>;

// Package schema with generated id
export const PackageSchema = v.pipe(
  RawPackageSchema,
  v.transform((pkg) => ({
    ...pkg,
    id: `${pkg.name}-${pkg.version}`,
  })),
);

export type Package = v.InferOutput<typeof PackageSchema>;

// Packages index schema
export const PackagesIndexSchema = v.object({
  last_update: v.number(),
  packages: v.array(PackageSchema),
});

export type PackagesIndex = v.InferOutput<typeof PackagesIndexSchema>;

export const featuredPackages: string[] = [
  "all-emojis",
  "html-utils-package",
  "lorem",
  "spanish-accent",
  "greek-letters-improved",
  "math-symbols",
  "medical-docs",
  "shruggie",
  "espanso-dice",
];

export function isFeatured(p: Package): boolean {
  return featuredPackages.includes(p.name);
}
