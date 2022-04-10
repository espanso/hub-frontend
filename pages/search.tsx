import { Pane, Text, Link, majorScale, Heading, Strong } from "evergreen-ui";
import {
  array,
  boolean,
  either,
  nonEmptyArray,
  option,
  record,
  task,
  taskEither,
} from "fp-ts";
import { Eq } from "fp-ts/Eq";
import { constant, flow, pipe } from "fp-ts/function";
import { InferGetStaticPropsType } from "next";
import React, { ComponentProps } from "react";
import { GroupedByVersion, Package } from "../api/domain";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { tagsSearch, textSearch, usePackageSearch } from "../api/search";
import { tagsCount } from "../api/tags";
import {
  CheckboxGroup,
  CheckboxItem,
  ContentRow,
  Navbar,
  PackageCard,
  Stack,
  TagBadgeGroup,
  EmptyResultsIcon,
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
        tagsCount,
        array.reduce([] as Array<CheckboxItem>, (acc, curr) => [
          ...acc,
          {
            key: curr.tag,
            label: `${curr.tag} (${curr.count})`,
            checked: pipe(
              packageSearch.tags,
              option.chain(array.findFirst((x) => tagEq.equals(x, curr.tag))),
              option.fold(constant(false), constant(true))
            ),
          },
        ])
      )
    ),
    option.getOrElseW(constant([]))
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

  const onTagClick = (tag: string) => packageSearch.setTags(option.some([tag]));

  const additionalSearchResultWrapper = (children: React.ReactNode) => (
    <Pane
      display="flex"
      justifyContent="center"
      marginTop={majorScale(4)}
      marginBottom={majorScale(4)}
    >
      {children}
    </Pane>
  );

  const createPackageSuggestion = (preamble: string, label: string) => (
    <Stack units={1}>
      <Text size={500} color="muted">
        {preamble}
      </Text>
      <Link
        size={500}
        href="https://espanso.org/docs/next/packages/creating-a-package/"
      >
        {label}
      </Link>
    </Stack>
  );

  const renderSearchResults = (packages: Array<Package>) => (
    <Stack units={2} direction="column">
      {pipe(
        packages,
        array.map((p) => (
          <PackageCard key={p.id} package={p} onTagClick={onTagClick} />
        )),
        array.concat([
          additionalSearchResultWrapper(
            createPackageSuggestion(
              "Nothing fits you?",
              "Create your own package!"
            )
          ),
        ])
      )}
    </Stack>
  );

  const renderSearchResultsOrEmpty = (packages: Array<Package>) =>
    pipe(
      packages,
      array.isEmpty,
      boolean.fold(
        constant(renderSearchResults(packages)),
        constant(
          additionalSearchResultWrapper(
            <Stack units={3} direction="column" alignItems="center">
              <Text color="muted">
                <EmptyResultsIcon />
              </Text>
              <Stack units={1} direction="column" alignItems="center">
                <Heading size={700}>{`Sorry! No results found! `}</Heading>
                {createPackageSuggestion(
                  "If you can’t find what you’re looking for,",
                  "create a new package!"
                )}
              </Stack>
            </Stack>
          )
        )
      )
    );

  const onCheckboxesChange = (items: Array<CheckboxItem>) =>
    packageSearch.setTags(
      pipe(
        items,
        array.filterMap((v) => (v.checked ? option.some(v.key) : option.none)),
        nonEmptyArray.fromArray
      )
    );

  const results = pipe(
    props.packages,
    option.map(filterBySearch),
    option.map(filterByTags)
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
          <Pane display="flex" flex={1}>
            <CheckboxGroup
              items={tagsCheckboxes}
              onChange={onCheckboxesChange}
            />
          </Pane>
          <Stack
            units={1}
            direction="column"
            flex={3}
            marginTop={majorScale(2)}
          >
            {pipe(
              packageSearch.query,
              option.map((q) => (
                <Stack units={1}>
                  {pipe(
                    results,
                    option.map((r) => (
                      <Text color="muted">
                        {r.length} results for{" "}
                        {<Strong color="muted">{`"${q}".`}</Strong>}
                      </Text>
                    )),
                    option.toNullable
                  )}
                  <Text
                    color="muted"
                    textDecoration="underline"
                    className="clickable"
                    onClick={() => packageSearch.setQuery(option.none)}
                  >
                    Clear search
                  </Text>
                </Stack>
              )),
              option.toNullable
            )}

            <TagBadgeGroup
              tags={pipe(packageSearch.tags, option.getOrElseW(constant([])))}
              onRemove={(tags) =>
                packageSearch.setTags(pipe(tags, nonEmptyArray.fromArray))
              }
              onClick={onTagClick}
            />
            {pipe(
              results,
              option.map(renderSearchResultsOrEmpty),
              option.toNullable
            )}
          </Stack>
        </Pane>
      </ContentRow>
    </Pane>
  );
};

export default Search;
