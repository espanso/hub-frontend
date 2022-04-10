import { Heading, Pane, Text, Link } from "evergreen-ui";
import { option, readonlyArray, either, task } from "fp-ts";
import { constNull, pipe } from "fp-ts/function";
import { InferGetStaticPropsType } from "next";
import React from "react";
import { DateFromTimestamp } from "../api/Package";
import { fetchPackagesIndexAsOption } from "../api/packagesIndex";

type Props = InferGetStaticPropsType<typeof getStaticProps>;

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

export const getStaticProps = pipe(
  fetchPackagesIndexAsOption,
  task.map((packagesIndex) => ({
    props: {
      packagesIndex,
    },
  }))
);

export default Index;
