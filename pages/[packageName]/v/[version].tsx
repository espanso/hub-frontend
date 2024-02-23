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
import {
  array,
  boolean,
  either,
  nonEmptyArray,
  option,
  string,
  task,
  taskEither,
} from "fp-ts";
import { sequenceS } from "fp-ts/Apply";
import { constant, flow, pipe, identity } from "fp-ts/function";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { Option } from "fp-ts/Option";
import { GetStaticPropsContext } from "next";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { GithubURL } from "../../../api/assets";
import {
  FileAsString,
  OrderedByVersion,
  PackageRepo,
} from "../../../api/domain";
import { isFeatured } from "../../../api/packageFeatured";
import { fetchPackageRepo } from "../../../api/packageRepo";
import { fetchPackagesIndex } from "../../../api/packagesIndex";
import { usePackageSearch } from "../../../api/search";
import { serializeReadme } from "../../../api/serializeReadme";
import {
  BetaBanner,
  CodeBlock,
  ContentRow,
  espansoTheme,
  FeaturedBadge,
  Footer,
  MDXRenderer,
  Navbar,
  NextjsLink,
  PackageNamer,
  Stack,
  TabProps,
  TagBadgeGroup,
  useTabs,
  useResponsive,
  ShareButton,
  GithubIcon
} from "../../../components";
import { splitLines } from "../../../api/utils"

export type Props = {
  packageRepo: Option<
    PackageRepo & {
      serializedReadme: MDXRemoteSerializeResult<Record<string, unknown>>;
    }
  >;
  versions: Array<string>;
};

export const getStaticProps = (context: GetStaticPropsContext) =>
  pipe(
    fetchPackagesIndex,
    taskEither.chain((packagesIndex) =>
      pipe(
        packagesIndex.packages,
        array.filter(
          (p) =>
            context.params !== undefined &&
            p.name === context.params.packageName
        ),
        OrderedByVersion.decode,
        either.mapLeft(
          flow(
            array.reduce("", (acc, curr) => `${acc}, ${curr.message}`),
            either.toError
          )
        ),
        taskEither.fromEither
      )
    ),
    taskEither.chain((packages) =>
      sequenceS(taskEither.ApplyPar)({
        packageRepo: pipe(
          packages,
          array.findFirst(
            (p) =>
              context.params !== undefined &&
              p.version === context.params.version
          ),
          option.map(fetchPackageRepo),
          taskEither.fromOption(
            () => new Error(`Version ${context.params?.version} not found`)
          ),
          taskEither.flatten,
          serializeReadme
        ),
        versions: pipe(
          packages,
          nonEmptyArray.map((p) => p.version),
          taskEither.right
        ),
      })
    ),
    task.map((props) => ({
      props: pipe(
        props,
        either.foldW(
          () => ({
            packageRepo: option.none,
            versions: [],
          }),
          (v) => ({
            packageRepo: option.some(v.packageRepo),
            versions: v.versions,
          })
        )
      ),
    }))
  )();

export const getStaticPaths = pipe(
  fetchPackagesIndex,
  task.map(
    flow(
      either.map((d) => d.packages),
      either.map(
        array.map((p) => ({
          params: { packageName: p.name, version: p.version },
        }))
      ),
      either.getOrElseW(constant([]))
    )
  ),
  task.map((paths) => ({
    paths,
    fallback: false,
  }))
);

const N_LINES_INCREMENTAL_CODE_BLOCK = 100;

const YamlShowcase = (props: { files: NonEmptyArray<FileAsString> }) => {
  const tabs = pipe(
    props.files,
    nonEmptyArray.map((f) => ({
      id: f.name,
      label: f.name,
      render: () => 
        <CodeBlock 
          variant="incremental"
          syntax="yaml"
          content={pipe(
            f.content, 
            splitLines(N_LINES_INCREMENTAL_CODE_BLOCK))}/>,
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
      render: () => 
        <CodeBlock 
          variant="incremental"
          syntax="yaml"
          content={pipe(
            f.content, 
            splitLines(N_LINES_INCREMENTAL_CODE_BLOCK))}/>,
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
    option.map((p) => p.package.version)
  );

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
              <ShareButton package={currentRepo.package}/>
              {pipe(
                currentRepo.manifest.homepage,
                option.map(url => 
                  <NextjsLink href={url} external>
                    <IconButton 
                      icon={GithubIcon} 
                      iconSize={18}
                      appearance="minimal" 
                      color={espansoTheme.colors.gray700}/>
                  </NextjsLink>),
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

            <CodeBlock
              variant="default"
              content={`espanso install ${currentRepo.package.name}`}
              syntax="shell"
              showCopyButton
            />
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
    props.packageRepo,
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
      mdxSource: option.some(packageRepo.serializedReadme),
      repositoryHomepage: pipe(
        packageRepo.manifest.homepage,
        option.chain(
          flow(
            GithubURL.decode,
            either.fold(
              () => option.none,
              (url) => option.some(url)
            )
          )
        )
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
    option.map((p) => p.packageYml),
    option.map((files) => (
      <Pane>
        <YamlShowcase files={files} />
      </Pane>
    )),
    option.map((content) => ({
      id: "source",
      label: `Source`,
      icon: <CodeIcon />,
      render: () => tabContentWrapper(content),
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
    option.map((p) => p.packageYml),
    option.map((files) => (
      <Pane>
        <YamlShowcaseMobile files={files} />
      </Pane>
    )),
    option.map((content) => ({
      id: "source",
      label: `Source`,
      icon: <CodeIcon />,
      render: () => tabContentWrapper(content),
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

  const packagePage = (currentRepo: PackageRepo) => {
    const metaInfo = {
      title: `${currentRepo.package.name} ${currentRepo.package.version} | Espanso Hub`,
      description: `Past in a terminal to install the \
${currentRepo.package.name} package (v ${currentRepo.package.version}): \
${currentRepo.package.description}`,
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
            {header(currentRepo)}
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

  return pipe(props.packageRepo, option.map(packagePage), option.toNullable);
};

export default VersionedPackagePage;
