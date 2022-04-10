import {
  Heading,
  Pane,
  TextInput,
  TextInputAppearance,
  Text,
  Link,
  ChevronDownIcon,
  majorScale,
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
import { isFeatured } from "../api/packageFeatured";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { usePackageSearch } from "../api/search";
import {
  ContentRow,
  espansoTheme,
  FeaturedShowcase,
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
            <Stack units={1}>
              <Heading
                size={900}
                color={espansoTheme.colors.white}
                fontFamily="Quicksand"
              >
                Find
              </Heading>
              <Heading size={900} color={espansoTheme.colors.green200}>
                espanso
              </Heading>
              <Heading size={900} color={espansoTheme.colors.white}>
                packages that fit you
              </Heading>
            </Stack>
            <Pane elevation={2}>
              <TextInput
                width={600}
                height={50}
                placeholder="Type here for wonderful packages!"
                appearance={"landing" as TextInputAppearance}
                onKeyDown={onEnter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchValue(e.target.value)
                }
                value={searchValue}
              />
            </Pane>
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
            option.chain(nonEmptyArray.fromArray),
            option.map((pcks) => <FeaturedShowcase packages={pcks} />),
            option.toNullable
          )}
        </ContentRow>
      </FullHeightSection>
      <FullHeightSection
        backgroundImage="url(/images/landing_footer_bg.svg)"
        backgroundSize="cover"
        backgroundPosition="bottom"
      />
    </Pane>
  );
};

export default Index;
