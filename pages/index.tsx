import { Pane } from "evergreen-ui";
import { option, either, task, taskEither, array, nonEmptyArray } from "fp-ts";
import { constant, pipe } from "fp-ts/function";
import { InferGetStaticPropsType } from "next";
import {
  clearPackagesIndexCache,
  fetchPackagesIndex,
} from "../api/packagesIndex";
import { PackagesGrid, Navbar, ContentRow } from "../components";

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
          option.map((packages) => <PackagesGrid packages={packages} />),
          option.toNullable
        )}
      </ContentRow>
    </Pane>
  );
};

export default Index;
