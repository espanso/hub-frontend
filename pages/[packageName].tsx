import {
  Card,
  Heading,
  IconButton,
  majorScale,
  Pane,
  Paragraph,
  ShareIcon,
} from "evergreen-ui";
import { array, either, nonEmptyArray, option, task, taskEither } from "fp-ts";
import { constant, flow, identity, pipe } from "fp-ts/function";
import { GetStaticPropsContext } from "next";
import { Package, PackageRepo } from "../api/domain";
import { fetchPackageRepo } from "../api/packageRepo";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { usePackageSearch } from "../api/search";
import {
  CodeBlock,
  ContentRow,
  Markdown,
  TagBadgeGroup,
  useTabs,
} from "../components";

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
        nonEmptyArray.fromArray,
        taskEither.fromOption(constant(new Error("Package not found")))
      )
    ),
    taskEither.chain((packages) =>
      pipe(
        packages,
        nonEmptyArray.map(fetchPackageRepo),
        nonEmptyArray.sequence(taskEither.taskEither)
      )
    ),
    task.map((results) =>
      pipe(results, either.foldW(constant([]), identity), (p) => ({
        props: {
          packageRepo: p as Array<PackageRepo>,
        },
      }))
    )
  )();

export const getStaticPaths = pipe(
  fetchPackagesIndex,
  task.map(
    flow(
      either.map((d) => d.packages),
      either.map(array.map((p) => ({ params: { packageName: p.name } }))),
      either.getOrElseW(constant([]))
    )
  ),
  task.map((paths) => ({
    paths,
    fallback: false,
  }))
);

type Props = {
  packageRepo: Array<PackageRepo>;
};

const PackagePage = (props: Props) => {
  const packagesSearch = usePackageSearch({
    searchPathname: "/search",
  });
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
          <Heading display="flex" flexGrow={1} size={900}>
            {currentRepo.package.name}
          </Heading>
          <IconButton
            icon={ShareIcon}
            appearance="minimal"
            onClick={() => {
              window.open(currentRepo.manifest.homepage, "_blank");
            }}
          />
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

  const packageRepo = pipe(props.packageRepo, array.head);
  const [tabsHeader, tabsContent] = useTabs([
    {
      id: "description",
      label: "Description",
      render: () =>
        tabContentWrapper(
          pipe(
            packageRepo,
            option.map((p) => <Markdown content={p.readme} />),
            option.getOrElse(() => <></>)
          )
        ),
    },
    {
      id: "content",
      label: "Content",
      render: () =>
        tabContentWrapper(
          pipe(
            packageRepo,
            option.map((p) => <CodeBlock content={p.packageYml} />),
            option.getOrElse(() => <></>)
          )
        ),
    },
  ]);

  const packageDetails = (currentRepo: PackageRepo) => (
    <Pane display="flex" flexDirection="column">
      <ContentRow marginTop={majorScale(4)} marginBottom={majorScale(4)}>
        {header(currentRepo)}
      </ContentRow>
      <ContentRow>{tabsHeader}</ContentRow>
      <ContentRow background="gray200">{tabsContent}</ContentRow>
    </Pane>
  );

  return pipe(packageRepo, option.map(packageDetails), option.toNullable);
};

export default PackagePage;
