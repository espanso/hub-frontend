import {
  Button,
  Card,
  ChevronRightIcon,
  CodeIcon,
  Heading,
  IconButton,
  Link,
  majorScale,
  ManualIcon,
  Pane,
  Paragraph,
  Position,
  SelectMenu,
  SideSheet,
  Text,
} from "evergreen-ui";
import { array, boolean, nonEmptyArray, option, string } from "fp-ts";
import { sequenceS } from "fp-ts/Apply";
import { constant, flow, identity, pipe } from "fp-ts/function";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { GetStaticPropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { GithubURL } from "../../../api/assets";
import { FileAsString, PackageRepo } from "../../../api/domain";
import { PackageDetails, resolvePackage } from "../../../api/package";
import { isFeatured } from "../../../api/packageFeatured";
import { getPackagesIndex } from "../../../api/packagesIndex";
import { usePackageSearch } from "../../../api/search";
import { splitLines } from "../../../api/utils";
import {
  BetaBanner,
  CodeBlock,
  ContentRow,
  espansoTheme,
  FeaturedBadge,
  Footer,
  GithubIcon,
  MDXRenderer,
  Navbar,
  NextjsLink,
  PackageNamer,
  ShareButton,
  Stack,
  TabProps,
  TagBadgeGroup,
  useResponsive,
  useTabs,
} from "../../../components";

export type Props = PackageDetails;

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const packagesIndex = await getPackagesIndex();
  const packageName = context.params?.packageName;
  const version = context.params?.version;

  const props = await resolvePackage(
    packagesIndex,
    Array.isArray(packageName) ? packageName[0] : packageName,
    Array.isArray(version) ? version[0] : version
  );

  return {
    props,
  };
};

export const getStaticPaths = async () => {
  const packagesIndex = await getPackagesIndex();
  return {
    paths: packagesIndex.packages.map((p) => ({
      params: { packageName: p.name, version: p.version },
    })),
    fallback: false,
  };
};

const N_LINES_INCREMENTAL_CODE_BLOCK = 100;

const YamlShowcase = (props: { files: NonEmptyArray<FileAsString> }) => {
  const tabs = pipe(
    props.files,
    nonEmptyArray.map((f) => ({
      id: f.name,
      label: f.name,
      render: () => (
        <CodeBlock
          variant="incremental"
          syntax="yaml"
          content={pipe(f.content, splitLines(N_LINES_INCREMENTAL_CODE_BLOCK))}
        />
      ),
    }))
  );

  const [header, content] = useTabs(tabs, "sidebar");

  return (
    <Pane display="flex">
      <Pane marginRight={majorScale(2)}>{header}</Pane>
      {content}
    </Pane>
  );
};

const YamlShowcaseMobile = (props: { files: NonEmptyArray<FileAsString> }) => {
  const tabs = pipe(
    props.files,
    nonEmptyArray.map((f) => ({
      id: f.name,
      label: f.name,
      render: () => (
        <CodeBlock
          variant="incremental"
          syntax="yaml"
          content={pipe(f.content, splitLines(N_LINES_INCREMENTAL_CODE_BLOCK))}
        />
      ),
    }))
  );

  const [header, content, selectedTab] = useTabs(tabs, "sidebar");
  const [showSideSheet, setShowSideSheet] = React.useState(false);

  return (
    <>
      <React.Fragment>
        <SideSheet
          position={Position.LEFT}
          isShown={showSideSheet}
          onCloseComplete={() => setShowSideSheet(false)}
          width="80%"
        >
          <Pane onClick={() => setShowSideSheet(false)}>{header}</Pane>
        </SideSheet>
      </React.Fragment>

      <Stack units={2} direction="column" marginTop={majorScale(2)}>
        <Stack
          onClick={() => setShowSideSheet(true)}
          units={1}
          alignItems="center"
        >
          <ChevronRightIcon color="green500" />
          <Link>{selectedTab.label}</Link>
        </Stack>
        {content}
      </Stack>
    </>
  );
};

const VersionedPackagePage = (props: Props) => {
  const { device, foldDevices } = useResponsive();
  const isDesktop = device === "desktop";
  const router = useRouter();
  const packagesSearch = usePackageSearch({
    searchPathname: "/search",
  });

  const currentVersion = pipe(
    props.packageRepo,
    option.fromNullable,
    option.map((p) => p.package.version)
  );

  const latestVersion = pipe(props.versions, array.head);

  const dividerProps = isDesktop
    ? {
        paddingRight: majorScale(2),
        borderRight: true,
      }
    : {};

  const header = (currentRepo: PackageRepo) => (
    <Pane display="flex">
      <Stack units={2} direction="column" flex={2} {...dividerProps}>
        <Stack units={1} direction="column">
          <Pane display="flex">
            <Stack units={3} alignItems="baseline">
              <Heading
                size={foldDevices({
                  desktop: () => 900,
                  tablet: () => 800,
                  mobile: () => 600,
                })}
              >
                {currentRepo.package.title}
              </Heading>
              {isFeatured(currentRepo.package) && <FeaturedBadge />}
            </Stack>

            <Pane flexGrow={1} />
            <Stack units={1} alignItems="center">
              <ShareButton package={currentRepo.package} />
              {pipe(
                currentRepo.manifest.homepage,
                option.map((url) => (
                  <NextjsLink href={url} external>
                    <IconButton
                      icon={GithubIcon}
                      iconSize={18}
                      appearance="minimal"
                      color={espansoTheme.colors.gray700}
                    />
                  </NextjsLink>
                )),
                option.toNullable
              )}

              {pipe(
                currentVersion,
                option.map((version) => (
                  <SelectMenu
                    height={pipe(
                      props.versions,
                      array.reduce(40, (acc) => acc + 33)
                    )}
                    position={Position.BOTTOM_RIGHT}
                    title="Select version"
                    options={props.versions.map((v) => ({
                      label: `v${v}`,
                      value: v,
                    }))}
                    hasFilter={false}
                    closeOnSelect={true}
                    selected={version}
                    onSelect={(item) =>
                      pipe(
                        props.versions,
                        array.findFirst((v) => v === item.value),
                        option.chain((v) =>
                          pipe(
                            props.packageRepo,
                            option.fromNullable,
                            option.map((p) => p.package.name),
                            option.map((n) => `/${n}/v/${v}`),
                            option.map((pathname) => ({ pathname }))
                          )
                        ),
                        option.map((url) => router.push(url)),
                        option.toUndefined
                      )
                    }
                  >
                    <Button>{`v${version}`}</Button>
                  </SelectMenu>
                )),
                option.toNullable
              )}
            </Stack>
          </Pane>

          <Text
            size={foldDevices({
              desktop: () => 400,
              tablet: () => 300,
              mobile: () => 300,
            })}
            color={espansoTheme.colors.muted}
          >
            <PackageNamer package={currentRepo.package} />
          </Text>
          <Text
            size={foldDevices({
              desktop: () => 400,
              tablet: () => 300,
              mobile: () => 300,
            })}
            color={espansoTheme.colors.muted}
          >
            By {currentRepo.manifest.author}
          </Text>
        </Stack>
        <Paragraph
          size={foldDevices({
            desktop: () => 500,
            tablet: () => 400,
            mobile: () => 300,
          })}
        >
          {currentRepo.package.description}
        </Paragraph>
        <Pane />
        <TagBadgeGroup
          tags={currentRepo.package.tags}
          onClick={(tag) => packagesSearch.setTags(option.some([tag]))}
        />
      </Stack>

      {isDesktop && (
        <>
          <Pane width={36} />
          <Pane
            display="flex"
            flexDirection="column"
            flex={1}
            justifyContent="center"
          >
            <Paragraph size={400} color="muted" marginBottom={majorScale(2)}>
              Paste this command in a terminal to install the package
            </Paragraph>

            {pipe(
              [currentVersion, latestVersion],
              array.compact,
              nonEmptyArray.fromArray,
              option.map(([current, latest]) =>
                current === latest
                  ? option.some("")
                  : option.some(` --version ${current}`)
              ),
              option.flatten,
              option.map((installationOptions) => (
                <CodeBlock
                  variant="default"
                  content={`espanso install ${currentRepo.package.name}${installationOptions}`}
                  syntax="shell"
                  showCopyButton
                />
              )),
              option.toNullable
            )}
          </Pane>
        </>
      )}
    </Pane>
  );

  const tabContentWrapper = (content: JSX.Element) => (
    <Card
      marginTop={majorScale(6)}
      marginBottom={majorScale(6)}
      padding={majorScale(5)}
      background="white"
      elevation={1}
    >
      {content}
    </Card>
  );

  const tabDescription = pipe(
    option.fromNullable(props.packageRepo),
    option.chain((packageRepo) =>
      pipe(
        packageRepo.readme,
        string.isEmpty,
        boolean.fold(
          () => option.some(packageRepo),
          () => option.none
        )
      )
    ),
    option.map((packageRepo) => ({
      mdxSource: option.fromNullable(packageRepo.serializedReadme),
      repositoryHomepage: pipe(
        packageRepo.manifest.homepage,
        option.map(GithubURL.decode),
        option.flatMap(option.fromEither)
      ),
    })),
    option.chain(sequenceS(option.Apply)),
    option.map((props) => <MDXRenderer {...props} />),
    option.map((content) => ({
      id: "description",
      label: "Description",
      icon: <ManualIcon />,
      render: () => tabContentWrapper(content),
    }))
  );

  const tabSourceDesktop = pipe(
    props.packageRepo,
    option.fromNullable,
    option.map((packageRepo) => ({
      id: "source",
      label: `Source`,
      icon: <CodeIcon />,
      render: () =>
        tabContentWrapper(
          <Pane>
            <YamlShowcase files={packageRepo.packageYml} />
          </Pane>
        ),
    }))
  );

  const fallbackTab = {
    id: "fallback",
    label: "Description",
    render: () => tabContentWrapper(<Text>No data available</Text>),
  };

  const tabs = pipe(
    [tabDescription, tabSourceDesktop],
    array.compact,
    nonEmptyArray.fromArray,
    option.fold(() => nonEmptyArray.of(fallbackTab), identity)
  ) as NonEmptyArray<TabProps>;

  const [tabsHeader, tabsContent] = useTabs(tabs, "topbar");

  const tabSourceMobile = pipe(
    props.packageRepo,
    option.fromNullable,
    option.map((packageRepo) => ({
      id: "source",
      label: `Source`,
      icon: <CodeIcon />,
      render: () =>
        tabContentWrapper(
          <Pane>
            <YamlShowcaseMobile files={packageRepo.packageYml} />
          </Pane>
        ),
    }))
  );

  const tabsMobile = pipe(
    [tabDescription, tabSourceMobile],
    array.compact,
    nonEmptyArray.fromArray,
    option.fold(() => nonEmptyArray.of(fallbackTab), identity)
  ) as NonEmptyArray<TabProps>;

  const [tabsHeaderMobile, tabsContentMobile] = useTabs(tabsMobile, "topbar");

  const packageSearch = usePackageSearch({
    searchPathname: "/search",
  });

  const metaInfo = !props.packageRepo
    ? {}
    : {
        title: `${props.packageRepo.package.name} ${props.packageRepo.package.version} | Espanso Hub`,
        description: `Paste in a terminal to install the \
${props.packageRepo.package.name} package (v${props.packageRepo.package.version}): \
${props.packageRepo.package.description}`,
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

      <ContentRow elevation={1} zIndex={1} paddingTop={majorScale(4)}>
        <Stack units={4} direction="column">
          {props.packageRepo && header(props.packageRepo)}
          {isDesktop ? tabsHeader : tabsHeaderMobile}
        </Stack>
      </ContentRow>

      <ContentRow background="gray200" flexGrow={1}>
        {isDesktop ? tabsContent : tabsContentMobile}
      </ContentRow>

      <ContentRow background="green600">
        <Footer showAuthor color={espansoTheme.colors.green500} />
      </ContentRow>
    </Pane>
  );
};

export default VersionedPackagePage;
