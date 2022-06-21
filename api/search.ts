import { array, boolean, nonEmptyArray, option, record, string } from "fp-ts";
import { constVoid, flow, identity, pipe } from "fp-ts/function";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { Option } from "fp-ts/Option";
import Fuse from "fuse.js";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Package, TextSearch } from "./domain";

const textSearchOptions: Fuse.IFuseOptions<Package> = {
  useExtendedSearch: true, // enables '|' OR and ' ' AND operators
  keys: ["name", "author", "description", "title"],
};

export const textSearch: (
  packages: Array<Package>
) => (query: string) => Array<Package> = (packages) => (query) =>
  new Fuse(packages, textSearchOptions).search(query).map((i) => i.item);

export const tagsSearch: (
  packages: Array<Package>
) => (tags: NonEmptyArray<string>) => Array<Package> = (packages) => (tags) =>
  pipe(
    packages,
    array.filter((pckg) => pckg.tags.some(
      (t) => tags.includes(t))
    )
  );

type Props = {
  searchPathname?: string;
};

type SearchParams = {
  query: Option<TextSearch>;
  tags: Option<NonEmptyArray<string>>;
};

export const usePackageSearch = (props?: Props) => {
  const router = useRouter();
  const searchPathname = pipe(
    props,
    option.fromNullable,
    option.map((p) => p.searchPathname),
    option.chain(option.fromNullable)
  );
  const [params, setParams] = useState<SearchParams>({
    query: option.none,
    tags: option.none,
  });

  useEffect(() => {
    pipe(
      router.isReady,
      boolean.fold(constVoid, () =>
        setParams({
          query: pipe(
            router.query.q,
            option.fromNullable,
            option.map((v) => (Array.isArray(v) ? v.join(" ") : v)),
            option.map(decodeURIComponent),
            option.chain(flow(TextSearch.decode, option.fromEither))
          ),
          tags: pipe(
            router.query.t,
            option.fromNullable,
            option.map((v) => (Array.isArray(v) ? v.join(",") : v)),
            option.map(decodeURIComponent),
            option.map((a) => a.split(",")),
            option.chain(nonEmptyArray.fromArray)
          ),
        })
      )
    );
  }, [router.isReady]);

  const search: (params: SearchParams) => void = (params) => {
    setParams(params);

    if (!router.isReady) {
      return;
    }

    const optionalParams = {
      q: pipe(params.query, option.map(encodeURIComponent)),
      t: pipe(
        params.tags,
        option.map(array.sort(string.Ord)),
        option.map((t) => t.join(",")),
        option.map(encodeURIComponent)
      ),
    };

    const newParams = pipe(optionalParams, record.filterMap(identity));
    const newUrl = pipe(
      {
        pathname: searchPathname,
        query: option.some(newParams),
      },
      record.filterMap<Option<any>, any>(identity)
    );

    router.push(newUrl);
  };

  const setQuery = (query: Option<string>) =>
    search({
      ...params,
      query: pipe(
        query,
        option.map(TextSearch.decode),
        option.chain(option.fromEither)
      ),
    });

  const setTags = (tags: Option<NonEmptyArray<string>>) =>
    search({
      ...params,
      tags,
    });

  return { ...params, setQuery, setTags, search };
};
