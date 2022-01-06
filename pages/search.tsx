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
import { ComponentProps } from "react";
import { GroupedByVersion, Package } from "../api/domain";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { tagsSearch, textSearch, usePackageSearch } from "../api/search";
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
  const packageSearch = usePackageSearch();

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
              packageSearch.tags,
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
      packageSearch.query,
      option.map(textSearch(packages)),
      option.getOrElseW(constant(packages))
    );

  const filterByTags: (packages: Array<Package>) => Array<Package> = (
    packages
  ) =>
    pipe(
      packageSearch.tags,
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

  const onCheckboxesChange = (items: Record<string, CheckboxItem>) =>
    packageSearch.setTags(
      pipe(
        items,
        record.filter((v) => v.checked),
        record.collect(string.Ord)((k, v) => k),
        nonEmptyArray.fromArray
      )
    );

  return (
    <Pane display="flex" flexDirection="column">
      <ContentRow background="green500">
        <Navbar
          searchInitialValue={pipe(
            packageSearch.query,
            option.getOrElseW(constant(""))
          )}
          onSearchEnter={flow(option.of, packageSearch.setQuery)}
        />
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
