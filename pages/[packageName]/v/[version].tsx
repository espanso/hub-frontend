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
  ShareIcon,
  SideSheet,
  Table,
} from "evergreen-ui";
import { array, either, nonEmptyArray, option, task, taskEither } from "fp-ts";
import { sequenceS } from "fp-ts/Apply";
import { constant, flow, pipe } from "fp-ts/function";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { Option } from "fp-ts/Option";
import { GetStaticPropsContext } from "next";
import { useRouter } from "next/router";
import React from "react";
import {
  FileAsString,
  OrderedByVersion,
  PackageRepo,
} from "../../../api/domain";
import { isFeatured } from "../../../api/packageFeatured";
import { fetchPackageRepo } from "../../../api/packageRepo";
import { fetchPackagesIndex } from "../../../api/packagesIndex";
import { usePackageSearch } from "../../../api/search";
import { taskEitherLogError } from "../../../api/utils";
import {
  CodeBlock,
  ContentRow,
  FeaturedBadge,
  MDXRenderer,
  Navbar,
  Stack,
  TagBadgeGroup,
  useTabs,
} from "../../../components";
import { useResponsive } from "../../../components/layout/useResponsive";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serializeReadme } from "../../../api/serializeReadme";

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
    taskEitherLogError,
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

const YamlShowcase = (props: { files: NonEmptyArray<FileAsString> }) => {
  const tabs = pipe(
    props.files,
    nonEmptyArray.map((f) => ({
      id: f.name,
      label: f.name,
      render: () => <CodeBlock content={f.content} syntax="yaml" />,
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
      render: () => <CodeBlock content={f.content} syntax="yaml" />,
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
        <Pane display="flex">
          <Stack units={3} alignItems="baseline">
            <Heading
              size={foldDevices({
                desktop: () => 900,
                tablet: () => 800,
                mobile: () => 600,
              })}
            >
              {currentRepo.package.name}
            </Heading>
            {isFeatured(currentRepo.package) && <FeaturedBadge />}
          </Stack>

          <Pane flexGrow={1} />
          <Stack units={1} alignItems="center">
            {pipe(
              currentRepo.manifest.homepage,
              option.map((homepage) => (
                <IconButton
                  icon={ShareIcon}
                  appearance="minimal"
                  onClick={() => {
                    window.open(homepage, "_blank");
                  }}
                />
              )),
              option.toNullable
            )}

            {pipe(
              currentVersion,
              option.map((version) => (
                <SelectMenu
                  height="auto"
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
              Copy and past to install this package
            </Paragraph>

            <CodeBlock
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

  const tabDescriptionContent = pipe(
    props.packageRepo,
    option.map((packageRepo) => (
      <MDXRenderer mdxSource={packageRepo.serializedReadme} />
    )),
    option.getOrElse(constant(<></>)),
    tabContentWrapper
  );

  const tabSourceContentDesktop = pipe(
    props.packageRepo,
    option.map((p) => p.packageYml),
    option.map((files) => <YamlShowcase files={files} />),
    option.getOrElse(constant(<></>)),
    (content) => <Pane>{content}</Pane>,
    tabContentWrapper
  );

  const tabSourceContentMobile = pipe(
    props.packageRepo,
    option.map((p) => p.packageYml),
    option.map((files) => <YamlShowcaseMobile files={files} />),
    option.getOrElse(constant(<></>)),
    (content) => <Pane>{content}</Pane>
  );

  const [tabsHeader, tabsContent] = useTabs(
    [
      {
        id: "description",
        label: "Description",
        icon: <ManualIcon />,
        render: () => tabDescriptionContent,
      },
      {
        id: "source",
        label: `Source`,
        icon: <CodeIcon />,
        render: () => tabSourceContentDesktop,
      },
    ],
    "topbar"
  );

  const [tabsHeaderMobile, tabsContentMobile] = useTabs(
    [
      {
        id: "description",
        label: "Description",
        icon: <ManualIcon />,
        render: () => tabDescriptionContent,
      },
      {
        id: "source",
        label: `Source`,
        icon: <CodeIcon />,
        render: () => tabSourceContentMobile,
      },
    ],
    "topbar"
  );

  const packageSearch = usePackageSearch({
    searchPathname: "/search",
  });

  const packagePage = (currentRepo: PackageRepo) => (
    <Pane display="flex" flexDirection="column">
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
      <ContentRow background="gray200">
        {isDesktop ? tabsContent : tabsContentMobile}
      </ContentRow>
    </Pane>
  );

  return pipe(props.packageRepo, option.map(packagePage), option.toNullable);
};

export default VersionedPackagePage;
