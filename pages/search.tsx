import {
  ChevronRightIcon,
  Heading,
  majorScale,
  Pane,
  Position,
  SideSheet,
  Strong,
  Text,
} from "evergreen-ui";
import { array, boolean, nonEmptyArray, option } from "fp-ts";
import { Eq } from "fp-ts/Eq";
import { constant, flow, pipe } from "fp-ts/function";
import { InferGetStaticPropsType } from "next";
import Head from "next/head";
import React, { ComponentProps } from "react";
import { Package } from "../api/domain";
import { groupByVersion } from "../api/package";
import { getPackagesIndex } from "../api/packagesIndex";
import { tagsSearch, textSearch, usePackageSearch } from "../api/search";
import { tagsCount } from "../api/tags";
import {
  BetaBanner,
  CheckboxGroup,
  CheckboxItem,
  ContentRow,
  EmptyResultsIcon,
  Footer,
  Navbar,
  NextjsLink,
  PackageCard,
  Stack,
  TagBadgeGroup,
} from "../components";
import { espansoTheme } from "../components/EspansoThemeProvider";
import { useResponsive } from "../components/layout/useResponsive";

export const getStaticProps = async () => {
  const packagesIndex = await getPackagesIndex();

  return {
    props: {
      packages: groupByVersion(packagesIndex.packages),
    },
  };
};

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const tagEq: Eq<string> = {
  equals: (x, y) => x.toLocaleLowerCase() === y.toLocaleLowerCase(),
};

const Search = (props: Props) => {
  const packageSearch = usePackageSearch();
  const { foldDevices } = useResponsive();
  const isDesktop = foldDevices({
    mobile: () => false,
    tablet: () => false,
    desktop: () => true,
  });

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
      key="additional-search-result-wrapper"
    >
      {children}
    </Pane>
  );

  const createPackageSuggestion = (preamble: string, label: string) => (
    <Stack units={1} direction="column" alignItems="center">
      <Text size={500} color="muted">
        {preamble}
      </Text>
      <NextjsLink
        size={500}
        href="https://espanso.org/docs/next/packages/creating-a-package/"
      >
        {label}
      </NextjsLink>
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
                  "Can't find what you're looking for?",
                  "create your own package!"
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

  const [showSideSheet, setShowSideSheet] = React.useState(false);

  const filters = isDesktop ? (
    <Pane display="flex" flex={1}>
      <CheckboxGroup
        title="Tags"
        items={tagsCheckboxes}
        onChange={onCheckboxesChange}
        limit={15}
      />
    </Pane>
  ) : (
    <React.Fragment>
      <SideSheet
        position={Position.LEFT}
        isShown={showSideSheet}
        onCloseComplete={() => setShowSideSheet(false)}
        width="80%"
      >
        <Pane
          marginLeft={majorScale(3)}
          marginTop={majorScale(3)}
          onClick={() => setShowSideSheet(false)}
        >
          <CheckboxGroup
            title="Tags"
            items={tagsCheckboxes}
            onChange={onCheckboxesChange}
          />
        </Pane>
      </SideSheet>
    </React.Fragment>
  );

  const makeResultsSummary = (query: string) => (
    <Stack units={1}>
      {pipe(
        results,
        option.map((r) => (
          <Text color="muted">
            {r.length} results for{" "}
            {<Strong color="muted">{`"${query}".`}</Strong>}
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
  );

  const makeStackableBlock = (item: React.ReactNode) => (
    <Pane marginBottom={majorScale(2)}>{item}</Pane>
  );

  const showFiltersBtnMobile = (
    <Stack units={1} alignItems="center">
      <ChevronRightIcon color="muted" onClick={() => setShowSideSheet(true)} />
      <Text
        color="muted"
        className="clickable"
        onClick={() => setShowSideSheet(true)}
      >
        Filter by tags
      </Text>
    </Stack>
  );

  const metaInfo = {
    title: "Explore Espanso's packages | Espanso Hub",
    description: `Navigate packages in the explore section. \
Search for keywords or filter out by tags.`,
  };

  return (
    <Pane display="flex" flexDirection="column" minHeight="100vh">
      <Head>
        <title>{metaInfo.title}</title>
        <meta name="description" content={metaInfo.description} />
        <meta property="og:title" content={metaInfo.title} />
        <meta property="og:description" content={metaInfo.description} />
      </Head>
      <ContentRow background="blueTint">
        <BetaBanner />
      </ContentRow>

      <ContentRow background="green500" elevation={2} zIndex={1}>
        <Navbar
          searchInitialValue={pipe(
            packageSearch.query,
            option.getOrElseW(constant(""))
          )}
          onSearchEnter={flow(option.of, packageSearch.setQuery)}
        />
      </ContentRow>

      <ContentRow background="tint2" flexGrow={1}>
        <Pane display="flex" marginTop={majorScale(isDesktop ? 6 : 2)}>
          {filters}

          <Pane flex={3}>
            {pipe(
              packageSearch.query,
              option.map(flow(makeResultsSummary, makeStackableBlock)),
              option.toNullable
            )}

            {!isDesktop && makeStackableBlock(showFiltersBtnMobile)}

            {pipe(
              packageSearch.tags,
              option.map(
                flow(
                  (tags) => (
                    <TagBadgeGroup
                      tags={tags}
                      onRemove={(tags) =>
                        packageSearch.setTags(
                          pipe(tags, nonEmptyArray.fromArray)
                        )
                      }
                      onClick={onTagClick}
                    />
                  ),
                  makeStackableBlock
                )
              ),
              option.toNullable
            )}

            {pipe(
              results,
              option.map(renderSearchResultsOrEmpty),
              option.toNullable
            )}
          </Pane>
        </Pane>
      </ContentRow>

      <ContentRow background="green600">
        <Footer showAuthor color={espansoTheme.colors.green500} />
      </ContentRow>
    </Pane>
  );
};

export default Search;
