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

  const onEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (event.currentTarget.value !== undefined) {
        packageSearch.setQuery(option.some(event.currentTarget.value));
      }
    }
  };

  return (
    <Pane display="flex" flexDirection="column">
      <FullHeightSection
        backgroundImage="url(/images/landing_bg.svg)"
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
          <Stack units={2} direction="column" alignItems="center">
            <Pane display="flex">
              <Heading
                size={1000}
                color={espansoTheme.colors.white}
                fontFamily="Quicksand"
              >
                espanso
              </Heading>
              <Heading
                size={1000}
                color={espansoTheme.colors.green200}
                fontFamily="Quicksand"
              >
                hub
              </Heading>
            </Pane>
            <Heading size={900} color={espansoTheme.colors.white}>
              Find espanso packages that fit you
            </Heading>
            <Pane elevation={2}>
              <TextInput
                width={600}
                height={50}
                placeholder="Search for wonderful packages!"
                onKeyDown={onEnter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchValue(e.target.value)
                }
                value={searchValue}
              />
            </Pane>
            <Paragraph size={600} color={espansoTheme.colors.white}>
              or{" "}
              <Link
                href="/search"
                size={600}
                className="link-white-override"
                textDecoration="underline"
              >
                browse the hub
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
      <FullHeightSection
        backgroundImage="url(/images/landing_footer_bg_copy.svg)"
        backgroundSize="cover"
        backgroundPosition="bottom"
      >
        <ContentRow>
          <Footer />
        </ContentRow>
      </FullHeightSection>
    </Pane>
  );
};

export default Index;
