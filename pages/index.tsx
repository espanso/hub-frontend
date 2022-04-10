import {
  ChevronDownIcon,
  Heading,
  Image,
  Link,
  majorScale,
  Pane,
  Paragraph,
  TextInput,
  Text,
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
import router from "next/router";
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

// Landing bg images generated from https://app.haikei.app/
const FullHeightSection = (props: React.ComponentProps<typeof Pane>) => (
  <Pane display="flex" minHeight="100vh" flexDirection="column" {...props}>
    {props.children}
  </Pane>
);

type FooterLinkProps = {
  children: React.ReactNode;
  href: string;
  external?: boolean;
  iconPath?: string;
};

const FooterLink = (props: FooterLinkProps) => (
  <Link
    href={props.href}
    target={props.external ? "_blank" : undefined}
    className="link-white-override"
  >
    {props.iconPath ? (
      <Stack units={1} alignItems="center">
        <Image src={props.iconPath} display="inline-block" height={20} />
        {props.children}
      </Stack>
    ) : (
      props.children
    )}
  </Link>
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
      >
        <ContentRow minHeight="50vh">
          <Pane display="flex" flexGrow={1} paddingTop={majorScale(8)}>
            <Pane
              flexGrow={1}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Image
                height={30}
                width={172}
                src="/images/navbar_logo.svg"
                alt="Espanso Hub"
                className="clickable"
                onClick={() => router.push("/")}
              />
              <Stack units={1}>
                <Text color={espansoTheme.colors.gray600}>Made with ❤️</Text>
                <Text color={espansoTheme.colors.gray600}>by️</Text>
                <Link
                  href="https://www.matteopellegrino.me/"
                  target="_blank"
                  className="link-pelle"
                >
                  Matteo Pellegrino
                </Link>
              </Stack>
            </Pane>
            <Stack flexGrow={1} units={1} direction="column">
              <Heading
                size={500}
                color={espansoTheme.colors.white}
                paddingBottom={majorScale(2)}
              >
                Navigation
              </Heading>
              <FooterLink href="https://espanso.org/docs/get-started/" external>
                Documetation
              </FooterLink>
              <FooterLink
                href="https://espanso.org/docs/next/packages/creating-a-package/"
                external
              >
                Create Package
              </FooterLink>
              <FooterLink href="/search">Explore</FooterLink>
            </Stack>
            <Stack flexGrow={1} units={1} direction="column">
              <Heading
                size={500}
                color={espansoTheme.colors.white}
                paddingBottom={majorScale(2)}
              >
                Community
              </Heading>
              <FooterLink
                href="https://www.reddit.com/r/espanso/"
                external
                iconPath="/images/reddit_logo.svg"
              >
                Reddit
              </FooterLink>

              <FooterLink
                href="https://github.com/espanso/hub-frontend/"
                external
                iconPath="/images/github_logo.png"
              >
                Contribute
              </FooterLink>

              <FooterLink
                href="https://espanso.org"
                external
                iconPath="/images/espanso_logo.svg"
              >
                Espanso
              </FooterLink>
            </Stack>
          </Pane>
        </ContentRow>
      </FullHeightSection>
    </Pane>
  );
};

export default Index;
