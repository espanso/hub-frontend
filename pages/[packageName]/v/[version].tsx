import {
  Button,
  Card,
  Heading,
  IconButton,
  majorScale,
  Pane,
  Paragraph,
  SelectMenu,
  ShareIcon,
} from "evergreen-ui";
import { array, either, nonEmptyArray, option, task, taskEither } from "fp-ts";
import { sequenceS } from "fp-ts/Apply";
import { constant, flow, pipe } from "fp-ts/function";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { Option } from "fp-ts/Option";
import { GetStaticPropsContext } from "next";
import { useRouter } from "next/router";
import {
  FileAsString,
  OrderedByVersion,
  PackageRepo,
} from "../../../api/domain";
import { fetchPackageRepo } from "../../../api/packageRepo";
import { fetchPackagesIndex } from "../../../api/packagesIndex";
import { usePackageSearch } from "../../../api/search";
import { taskEitherLogError } from "../../../api/utils";
import {
  CodeBlock,
  ContentRow,
  Markdown,
  Navbar,
  Stack,
  TagBadgeGroup,
  useTabs,
} from "../../../components";

export type Props = {
  packageRepo: Option<PackageRepo>;
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
          taskEither.flatten
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

const VersionedPackagePage = (props: Props) => {
  const router = useRouter();
  const packagesSearch = usePackageSearch({
    searchPathname: "/search",
  });

  const currentVersion = pipe(
    props.packageRepo,
    option.map((p) => p.package.version)
  );

  const header = (currentRepo: PackageRepo) => (
    <Pane display="flex">
      <Pane
        display="flex"
        flexDirection="column"
        flex={2}
        paddingRight={majorScale(2)}
        borderRight={true}
      >
        <Pane display="flex">
          <Heading size={900}>{currentRepo.package.name}</Heading>

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
        <Paragraph size={500} marginTop={12}>
          {currentRepo.package.description}
        </Paragraph>
        <TagBadgeGroup
          tags={currentRepo.package.tags}
          onClick={(tag) => packagesSearch.setTags(option.some([tag]))}
        />
      </Pane>
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

  const [tabsHeader, tabsContent] = useTabs([
    {
      id: "description",
      label: "Description",
      render: () =>
        tabContentWrapper(
          pipe(
            props.packageRepo,
            option.map((p) => (
              <Markdown
                // TODO: Avoid rendering specific package that fails next.js build
                content={p.package.name === "foreign-thanks" ? "" : p.readme}
              />
            )),
            option.getOrElse(constant(<></>))
          )
        ),
    },
    {
      id: "content",
      label: "Content",
      render: () =>
        tabContentWrapper(
          <Pane>
            {pipe(
              props.packageRepo,
              option.map((p) => p.packageYml),
              option.map((files) => <YamlShowcase files={files} />),
              option.getOrElse(constant(<></>))
            )}
          </Pane>
        ),
    },
  ]);

  const packageSearch = usePackageSearch({
    searchPathname: "/search",
  });

  const packagePage = (currentRepo: PackageRepo) => (
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

      <ContentRow marginTop={majorScale(4)} marginBottom={majorScale(4)}>
        {header(currentRepo)}
      </ContentRow>
      <ContentRow>{tabsHeader}</ContentRow>
      <ContentRow background="gray200">{tabsContent}</ContentRow>
    </Pane>
  );

  return pipe(props.packageRepo, option.map(packagePage), option.toNullable);
};

export default VersionedPackagePage;
