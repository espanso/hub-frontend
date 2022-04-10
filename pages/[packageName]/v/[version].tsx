import {
  Card,
  Heading,
  IconButton,
  majorScale,
  Pane,
  Paragraph,
  Select,
  ShareIcon,
} from "evergreen-ui";
import { array, either, nonEmptyArray, option, task, taskEither } from "fp-ts";
import { constant, flow, pipe } from "fp-ts/function";
import { sequenceS } from "fp-ts/lib/Apply";
import { Option } from "fp-ts/Option";
import { GetStaticPropsContext } from "next";
import { useRouter } from "next/router";
import { OrderedByVersion, PackageRepo } from "../../../api/domain";
import { fetchPackageRepo } from "../../../api/packageRepo";
import { fetchPackagesIndex } from "../../../api/packagesIndex";
import { usePackageSearch } from "../../../api/search";
import { taskEitherLogError } from "../../../api/utils";
import {
  CodeBlock,
  ContentRow,
  Markdown,
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
                <Select
                  size="small"
                  value={version}
                  onChange={(e) =>
                    pipe(
                      props.versions,
                      array.findFirst((v) => v === e.target.value),
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
                  {pipe(
                    props.versions,
                    array.map((v) => (
                      <option key={v} value={v}>
                        v{v}
                      </option>
                    ))
                  )}
                </Select>
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
        <Paragraph size={400} color="muted">
          Copy and past to install this package
        </Paragraph>

        <CodeBlock
          content={`espanso install ${currentRepo.package.name}`}
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
            option.getOrElse(() => <></>)
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
              option.getOrElseW(() => []),
              array.map((file) => <CodeBlock content={file.content} />)
            )}
          </Pane>
        ),
    },
  ]);

  const packagePage = (currentRepo: PackageRepo) => (
    <Pane display="flex" flexDirection="column">
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
