import { Pane } from "evergreen-ui";
import {
  array,
  either,
  nonEmptyArray,
  option,
  record,
  string,
  task,
  taskEither,
} from "fp-ts";
import { Eq } from "fp-ts/Eq";
import { constant, flow, pipe } from "fp-ts/function";
import { InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { ComponentProps } from "react";
import { GroupedByVersion, Package } from "../api/domain";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { tagsSearch, textSearch } from "../api/search";
import {
  CheckboxGroup,
  CheckboxItem,
  ContentRow,
  Navbar,
  PackageCard,
  Stack,
} from "../components";

export const getStaticProps = () =>
  pipe(
    fetchPackagesIndex,
    taskEither.map((index) => index.packages),
    taskEither.chain(
      flow(
        GroupedByVersion.decode,
        either.mapLeft(either.toError),
        taskEither.fromEither
      )
    ),
    taskEither.map<GroupedByVersion, Package[]>(
      flow(record.map(nonEmptyArray.head), Object.values)
    ),
    task.map(either.fold(constant(option.none), option.some)),
    task.map((packages) => ({
      props: {
        packages,
      },
    }))
  )();

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const tagEq: Eq<string> = {
  equals: (x, y) => x.toLocaleLowerCase() === y.toLocaleLowerCase(),
};

const Search = (props: Props) => {
  const router = useRouter();

  const query = pipe(
    router.query.q,
    option.fromNullable,
    option.map((v) => (Array.isArray(v) ? v[0] : v))
  );

  const tags = pipe(
    router.query.t,
    option.fromNullable,
    option.map((v) => (Array.isArray(v) ? v[0] : v)),
    option.map(decodeURIComponent),
    option.map(string.split(",")),
    option.map(nonEmptyArray.fromReadonlyNonEmptyArray)
  );

  const tagsCheckboxes: ComponentProps<typeof CheckboxGroup>["items"] = pipe(
    props.packages,
    option.map(
      flow(
        array.map((p) => p.tags),
        array.flatten,
        array.uniq(string.Eq),
        array.reduce({}, (acc, curr) => ({
          ...acc,
          [curr]: {
            label: curr,
            checked: pipe(
              tags,
              option.chain(array.findFirst((x) => tagEq.equals(x, curr))),
              option.fold(constant(false), constant(true))
            ),
          },
        }))
      )
    ),
    option.getOrElseW(constant({}))
  );

  const filterBySearch: (packages: Array<Package>) => Array<Package> = (
    packages
  ) =>
    pipe(
      query,
      option.map(textSearch(packages)),
      option.getOrElseW(constant(packages))
    );

  const filterByTags: (packages: Array<Package>) => Array<Package> = (
    packages
  ) =>
    pipe(
      tags,
      option.map(tagsSearch(packages)),
      option.getOrElseW(constant(packages))
    );

  const renderSearchResults = (packages: Array<Package>) => (
    <Stack units={2} direction="column">
      {pipe(
        packages,
        array.map((p) => <PackageCard key={p.id} package={p} />)
      )}
    </Stack>
  );

  const onCheckboxesChange = (items: Record<string, CheckboxItem>) => {
    const tags = pipe(
      items,
      record.filter((v) => v.checked),
      record.collect(string.Ord)((k, v) => k)
    ).join(",");

    router.push({
      pathname: "/search",
      query: pipe(
        query,
        option.map((q) => ({ q, t: tags })),
        option.getOrElse(constant({ t: tags }))
      ),
    });
  };

  return (
    <Pane display="flex" flexDirection="column">
      <ContentRow background="green500">
        {router.isReady && (
          <Navbar searchInitialValue={pipe(query, option.toUndefined)} />
        )}
      </ContentRow>

      <ContentRow background="tint2">
        <Pane display="flex">
          <Pane display="flex" flexGrow={1}>
            <CheckboxGroup
              items={tagsCheckboxes}
              onChange={onCheckboxesChange}
            />
          </Pane>
          <Pane display="flex" flexDirection="column" flexGrow={2}>
            {pipe(
              props.packages,
              option.map(filterBySearch),
              option.map(filterByTags),
              option.map(renderSearchResults),
              option.toNullable
            )}
          </Pane>
        </Pane>
      </ContentRow>
    </Pane>
  );
};

export default Search;
