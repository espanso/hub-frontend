import { Heading, Pane, Text } from "evergreen-ui";
import { option, readonlyArray, either } from "fp-ts";
import { constNull, pipe, flow } from "fp-ts/function";
import { InferGetServerSidePropsType } from "next";
import { DateFromTimestamp } from "../api/Package";
import { withPackagesIndex } from "../api/withPackagesIndex";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const Index = (props: Props) => (
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
        option.getOrElse(() => readonlyArray.fromArray([])),
        readonlyArray.mapWithIndex((i, pack) => (
          <li key={`${pack.name}-${i}`}>
            <Text>{`${i} - ${pack.name}`}</Text>
          </li>
        ))
      )}
    </ul>
  </Pane>
);

export const getServerSideProps = withPackagesIndex;

export default Index;
