import { Card, Heading, majorScale, Pane, Paragraph } from "evergreen-ui";
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
  const header = (currentPackage: Package) => (
    <Pane display="flex">
      <Pane display="flex" flexDirection="column" flex={2}>
        <Heading size={900}>{currentPackage.name}</Heading>
        <Paragraph size={500} marginTop={12}>
          {currentPackage.description}
        </Paragraph>
        <TagBadgeGroup
          tags={currentPackage.tags}
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
          content={`espanso install ${currentPackage.name}`}
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

  const packageDetails = (currentPackage: Package) => (
    <Pane display="flex" flexDirection="column">
      <ContentRow marginTop={majorScale(4)} marginBottom={majorScale(4)}>
        {header(currentPackage)}
      </ContentRow>
      <ContentRow>{tabsHeader}</ContentRow>
      <ContentRow background="gray200">{tabsContent}</ContentRow>
    </Pane>
  );

  return pipe(
    packageRepo,
    option.map((p) => p.package),
    option.map(packageDetails),
    option.toNullable
  );
};

export default PackagePage;
