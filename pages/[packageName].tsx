import { constant, flow, pipe } from "fp-ts/function";
import { option, array, task, either } from "fp-ts";
import { InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { Package } from "../api/Package";
import { Pane, majorScale, Heading, Paragraph, Card } from "evergreen-ui";
import { ContentRow, useTabs, InstallPackage } from "../components";

type QueryParams = {
  params: {
    packageName: string;
  };
};

export const getStaticProps = pipe(
  fetchPackagesIndex,
  task.map(either.fold(constant(option.none), option.some)),
  task.map((packagesIndex) => ({
    props: {
      packagesIndex,
    },
  }))
);

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

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const PackagePage = (props: Props) => {
  const router = useRouter();
  const { packageName } = router.query;
  const currentPackage = pipe(
    props.packagesIndex,
    option.map((index) => index.packages),
    option.chain(array.findFirst((p) => p.name === packageName))
  );

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

        <InstallPackage packageName={currentPackage.name} />
      </Pane>
    </Pane>
  );

  const tabContentWrapper = (content: JSX.Element) => (
    <Card
      marginTop={majorScale(6)}
      marginBottom={majorScale(6)}
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
      render: () => tabContentWrapper(<>Description</>),
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

  return pipe(currentPackage, option.map(packageDetails), option.toNullable);
};

export default PackagePage;
