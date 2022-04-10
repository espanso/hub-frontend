import { array, nonEmptyArray, option, record, string } from "fp-ts";
import { identity, pipe } from "fp-ts/function";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { Option } from "fp-ts/Option";
import Fuse from "fuse.js";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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

export const usePackageSearch = () => {
  const router = useRouter();

  const [query, setQuery] = useState<Option<string>>(
    pipe(
      router.query.q,
      option.fromNullable,
      option.map((v) => (Array.isArray(v) ? v[0] : v)),
      option.map(decodeURIComponent)
    )
  );

  const [tags, setTags] = useState<Option<NonEmptyArray<string>>>(
    pipe(
      router.query.t,
      option.fromNullable,
      option.map((v) => (Array.isArray(v) ? v[0] : v)),
      option.map(decodeURIComponent),
      option.map((a) => a.split(",")),
      option.chain(nonEmptyArray.fromArray)
    )
  );

  useEffect(() => {
    if (router.isReady) {
      const params = {
        q: pipe(query, option.map(encodeURIComponent)),
        t: pipe(
          tags,
          option.map(array.sort(string.Ord)),
          option.map((t) => t.join(",")),
          option.map(encodeURIComponent)
        ),
      };

      router.push({
        pathname: "/search",
        query: pipe(params, record.filterMap(identity)),
      });
    }
  }, [query, tags]);

  return { query, setQuery, tags, setTags, isReady: router.isReady };
};
