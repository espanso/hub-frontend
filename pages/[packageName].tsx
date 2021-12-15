import { constant, flow, pipe } from "fp-ts/function";
import { option, array, task, either, taskEither } from "fp-ts";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { Package, PackageRepo } from "../api/Package";
import { Pane, majorScale, Heading, Paragraph, Card } from "evergreen-ui";
import { ContentRow, useTabs, CodeBlock, Markdown } from "../components";
import { Option } from "fp-ts/Option";
import { fetchPackageRepo } from "../api/packageRepo";

type QueryParams = {
  params: {
    packageName: string;
  };
};

export const getStaticProps = (context: QueryParams) =>
  pipe(
    fetchPackagesIndex,
    taskEither.chain((packagesIndex) =>
      pipe(
        packagesIndex.packages,
        array.findFirst((p) => p.name === context.params.packageName),
        taskEither.fromOption(constant(new Error("Package not found")))
      )
    ),
    taskEither.chain(fetchPackageRepo),
    task.map(either.fold(constant(option.none), option.some)),
    task.map((p) => ({
      props: {
        packageRepo: p,
      },
    }))
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
  packageRepo: Option<PackageRepo>;
};

const PackagePage = (props: Props) => {
  const header = (currentPackage: Package) => (
    <Pane display="flex">
      <Pane display="flex" flexDirection="column" flex={2}>
        <Heading size={900}>{currentPackage.name}</Heading>
        <Paragraph size={500} marginTop={12}>
          {currentPackage.description}
        </Paragraph>
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

  const [tabsHeader, tabsContent] = useTabs([
    {
      id: "description",
      label: "Description",
      render: () =>
        tabContentWrapper(
          pipe(
            props.packageRepo,
            option.map((p) => <Markdown content={p.readme} />),
            option.getOrElse(() => <></>)
          )
        ),
    },
    {
      id: "code",
      label: "Code",
      render: () => tabContentWrapper(<>Code</>),
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
    props.packageRepo,
    option.map((p) => p.package),
    option.map(packageDetails),
    option.toNullable
  );
};

export default PackagePage;
