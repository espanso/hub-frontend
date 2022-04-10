import { Pane } from "evergreen-ui";
import { either, option, task, taskEither } from "fp-ts";
import { constant, pipe } from "fp-ts/function";
import { InferGetStaticPropsType } from "next";
import {
  clearPackagesIndexCache,
  fetchPackagesIndex,
} from "../api/packagesIndex";
import { ContentRow, Navbar } from "../components";

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
    </Pane>
  );
};

export default Index;
