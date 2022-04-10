import { Pane } from "evergreen-ui";
import { either, nonEmptyArray, option, task, taskEither } from "fp-ts";
import { constant, flow, pipe } from "fp-ts/function";
import { InferGetStaticPropsType } from "next";
import { GroupedByVersion } from "../api/domain";
import {
  clearPackagesIndexCache,
  fetchPackagesIndex,
} from "../api/packagesIndex";
import { ContentRow, Navbar, PackagesGrid } from "../components";

export const getStaticProps = pipe(
  taskEither.fromTask(clearPackagesIndexCache),
  taskEither.chainW(() => fetchPackagesIndex),
  task.map(either.fold(constant(option.none), option.some)),
  task.map((packagesIndex) => ({
    props: {
      packagesIndex,
    },
  }))
);

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const Index = (props: Props) => {
  return (
    <Pane display="flex" flexDirection="column">
      <ContentRow background="green500">
        <Navbar />
      </ContentRow>

      <ContentRow background="tint2">
        {pipe(
          props.packagesIndex,
          option.map((index) => index.packages),
          option.chain(nonEmptyArray.fromArray),
          option.chain(flow(GroupedByVersion.decode, option.fromEither)),
          option.map((packages) => <PackagesGrid packages={packages} />),
          option.toNullable
        )}
      </ContentRow>
    </Pane>
  );
};

export default Index;
