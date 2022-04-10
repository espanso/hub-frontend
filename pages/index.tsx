import {
  ChevronDownIcon,
  Heading,
  Link,
  majorScale,
  Pane,
  Paragraph,
  TextInput,
} from "evergreen-ui";
import {
  array,
  either,
  nonEmptyArray,
  option,
  record,
  task,
  taskEither,
} from "fp-ts";
import { constant, flow, pipe } from "fp-ts/function";
import { InferGetStaticPropsType } from "next";
import Head from "next/head";
import React, { useState } from "react";
import { GroupedByVersion, Package } from "../api/domain";
import { isFeatured, ordFeatured } from "../api/packageFeatured";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { usePackageSearch } from "../api/search";
import {
  ContentRow,
  espansoTheme,
  FeaturedShowcase,
  Footer,
  Navbar,
  SearchBar,
  Stack,
} from "../components";
import { useResponsive } from "../components/layout/useResponsive";

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

// Landing bg images generated from https://app.haikei.app/
const FullHeightSection = (props: React.ComponentProps<typeof Pane>) => (
  <Pane display="flex" minHeight="100vh" flexDirection="column" {...props}>
    {props.children}
  </Pane>
);

const Index = (props: Props) => {
  const packageSearch = usePackageSearch({
    searchPathname: "/search",
  });

  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);

  const { foldDevices } = useResponsive();

  return (
    <Pane display="flex" flexDirection="column">
      <Head>
        <title>
          Espanso Hub | Enhance your workflows with espanso packages
        </title>
      </Head>
      <FullHeightSection
        backgroundImage={foldDevices({
          mobile: () => "url(/images/landing_bg_mobile.svg)",
          tablet: () => "url(/images/landing_bg.svg)",
          desktop: () => "url(/images/landing_bg.svg)",
        })}
        backgroundSize="cover"
        backgroundPosition="bottom"
      >
        <ContentRow>
          <Navbar
            variant="landing"
            onSearchEnter={flow(option.of, packageSearch.setQuery)}
          />
        </ContentRow>
        <ContentRow justifyContent="center" flex={6}>
          <Stack units={6} direction="column" alignItems="center">
            <Stack units={3} direction="column" alignItems="center">
              <Pane display="flex" alignContent="center">
                <Heading size={1000} color={espansoTheme.colors.white}>
                  Enhance your workflows with espanso packages
                </Heading>
              </Pane>
              <Heading
                size={600}
                color={espansoTheme.colors.white}
                textAlign="center"
              >
                Emoji, code-snippets, mathematical notations, accents and more.{" "}
              </Heading>
            </Stack>
            <SearchBar
              width={foldDevices({
                mobile: () => "100%",
                tablet: () => "600px",
                desktop: () => "600px",
              })}
              height={50}
              placeholder="Already got an idea? Search it here..."
              onSearch={flow(option.some, packageSearch.setQuery)}
              value={searchValue}
            ></SearchBar>
            <Paragraph size={600} color={espansoTheme.colors.white}>
              or{" "}
              <Link
                href="/search"
                size={600}
                className="link-white-override"
                textDecoration="underline"
              >
                explore the hub
              </Link>
            </Paragraph>
          </Stack>
        </ContentRow>
        <Pane flex={4} display="flex" justifyContent="center" alignItems="end">
          <Link href="#featured_showcase">
            <ChevronDownIcon
              size={majorScale(2)}
              color={espansoTheme.colors.white}
              marginBottom={majorScale(4)}
            />
          </Link>
        </Pane>
      </FullHeightSection>
      <FullHeightSection
        justifyContent="center"
        id="featured_showcase"
        minHeight="90vh"
      >
        <ContentRow>
          {pipe(
            props.packages,
            option.map(array.filter(isFeatured)),
            option.map(array.sort(ordFeatured)),
            option.chain(nonEmptyArray.fromArray),
            option.map((pcks) => <FeaturedShowcase packages={pcks} />),
            option.toNullable
          )}
        </ContentRow>
      </FullHeightSection>
      <ContentRow background="default">
        <Footer />
      </ContentRow>
    </Pane>
  );
};

export default Index;
