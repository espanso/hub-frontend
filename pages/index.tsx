import { Pane } from "evergreen-ui";
import { option, either, task, taskEither, array } from "fp-ts";
import { constant, pipe } from "fp-ts/function";
import { InferGetStaticPropsType } from "next";
import {
  clearPackagesIndexCache,
  fetchPackagesIndex,
} from "../api/packagesIndex";
import { PackagesGrid } from "../components";

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
    <Pane clearfix>
      {pipe(
        props.packagesIndex,
        option.map((index) => index.packages),
        option.map((packages) => <PackagesGrid packages={packages} />),
        option.toNullable
      )}
    </Pane>
  );
};

export default Index;
