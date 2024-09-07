import {
  ChevronDownIcon,
  Heading,
  majorScale,
  Pane,
  Paragraph,
} from "evergreen-ui";
import { array, nonEmptyArray, option } from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import { InferGetStaticPropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import React, { useState } from "react";
import { isFeatured, ordFeatured } from "../api/packageFeatured";
import { getPackagesIndex } from "../api/packagesIndex";
import { usePackageSearch } from "../api/search";
import {
  ContentRow,
  espansoTheme,
  FeaturedShowcase,
  Footer,
  Navbar,
  NextjsLink,
  SearchBar,
  Stack,
} from "../components";
import { useResponsive } from "../components/layout/useResponsive";
// Landing bg images generated from https://app.haikei.app/
import notOptimizedImageLoader from "../api/notOptimizedImageLoader";
import { groupByVersion } from "../api/package";
import landingBg from "../public/images/landing_bg.svg";

export const getStaticProps = async () => {
  const packagesIndex = await getPackagesIndex();

  return {
    props: {
      packages: groupByVersion(packagesIndex.packages),
    },
  };
};

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const FullHeightSection = (props: React.ComponentProps<typeof Pane>) => (
  <Pane display="flex" minHeight="100vh" flexDirection="column" {...props}>
    {props.children}
  </Pane>
);

const BackgroundImage = (props: React.ComponentProps<typeof Image>) => {
  const { children, ...imageProps } = props;
  return (
    <div style={{ zIndex: -1, height: "100%" }}>
      <Image
        layout="fill"
        objectFit="cover"
        {...imageProps}
        loader={notOptimizedImageLoader}
        unoptimized
      />
    </div>
  );
};

const Index = (props: Props) => {
  const packageSearch = usePackageSearch({
    searchPathname: "/search",
  });

  const [searchValue, _] = useState<string | undefined>(undefined);

  const { foldDevices } = useResponsive();

  const metaInfo = {
    title: "Espanso Hub | Enhance your workflows with espanso packages",
    description: `\
Enhance your workflows with espanso packages from the Espanso Hub. \
Emoji, code-snippets, mathematical notations, accents and more. \
Explore the hub to find packages that fits you. \
Look up the featured packages specifically selected by the Espanso team. \
Not finding what fits you? Create your own package or join the Reddit community to find \
inspiration.`,
  };

  return (
    <Pane display="flex" flexDirection="column">
      <Head>
        <title>{metaInfo.title}</title>
        <meta name="description" content={metaInfo.description} />
        <meta property="og:title" content={metaInfo.title} />
        <meta property="og:description" content={metaInfo.description} />
      </Head>
      <FullHeightSection>
        <BackgroundImage src={landingBg} />
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
                <Heading
                  size={1000}
                  color={espansoTheme.colors.white}
                  textAlign="center"
                >
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
              <NextjsLink
                href="/search"
                size={600}
                className="link-white-override"
                textDecoration="underline"
              >
                explore the hub
              </NextjsLink>
            </Paragraph>
          </Stack>
        </ContentRow>
        <Pane flex={4} display="flex" justifyContent="center" alignItems="end">
          <NextjsLink href="#featured_showcase">
            <ChevronDownIcon
              size={majorScale(2)}
              color={espansoTheme.colors.white}
              marginBottom={majorScale(4)}
            />
          </NextjsLink>
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
        <Footer showAuthor color={espansoTheme.colors.muted} />
      </ContentRow>
    </Pane>
  );
};

export default Index;
