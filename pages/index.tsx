import { Heading, Pane, Text, Link } from "evergreen-ui";
import { option, readonlyArray, either, task, taskEither } from "fp-ts";
import { constant, constNull, pipe } from "fp-ts/function";
import { InferGetStaticPropsType } from "next";
import {
  clearPackagesIndexCache,
  fetchPackagesIndex,
} from "../api/packagesIndex";
import { DateFromTimestamp } from "../api/model";

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
    <Pane>
      <Heading>Espanso Hub</Heading>
      {pipe(
        props.packagesIndex,
        option.map((x) => x.last_update),
        option.getOrElseW(constNull),
        DateFromTimestamp.decode,
        either.map((date) => <Text>{date.toDateString()}</Text>),
        either.getOrElseW(constNull)
      )}

      <ul>
        {pipe(
          props.packagesIndex,
          option.map((x) => x.packages),
          option.map(
            readonlyArray.mapWithIndex((i, pack) => (
              <li key={`${pack.name}-${i}`}>
                <Link href={`/${pack.name}`}>{`${i} - ${pack.name}`}</Link>
              </li>
            ))
          ),
          option.toNullable
        )}
      </ul>
    </Pane>
  );
};

export default Index;
