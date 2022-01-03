import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import Fuse from "fuse.js";
import { Package } from "./domain";

const textSearchOptions: Fuse.IFuseOptions<Package> = {
  keys: ["name", "author", "description", "title"],
};

export const textSearch: (
  packages: Array<Package>
) => (query: string) => Array<Package> = (packages) => (query) =>
  new Fuse(packages, textSearchOptions).search(query).map((i) => i.item);

const tagSearchOptions: Fuse.IFuseOptions<Package> = {
  useExtendedSearch: true, // enables '|' OR and ' ' AND operators
  threshold: 0.0, // exact match
  keys: ["tags"],
};

export const tagsSearch: (
  packages: Array<Package>
) => (tags: NonEmptyArray<string>) => Array<Package> = (packages) => (tags) =>
  new Fuse(packages, tagSearchOptions)
    .search(tags.join(" "))
    .map((i) => i.item);
