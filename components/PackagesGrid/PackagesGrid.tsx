import {
  Badge,
  Card,
  Heading,
  majorScale,
  Pane,
  Paragraph,
} from "evergreen-ui";
import { array, nonEmptyArray, option, record } from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import { GroupedByVersion, Package } from "../../api/domain";
import { Stack } from "../layout";

type Props = {
  packages: GroupedByVersion;
};

const PackageCard = (props: { package: Package }) => (
  <Card
    className="package-card"
    display="flex"
    flexDirection="column"
    width={320}
    elevation={0}
    float="left"
    margin={majorScale(1)}
    padding={majorScale(2)}
    backgroundColor="white"
    hoverElevation={2}
    onClick={() => {
      window.location.href = props.package.name;
    }}
  >
    <Heading>{props.package.title}</Heading>
    <Paragraph>{props.package.description}</Paragraph>
    <Stack units={1} flexWrap="wrap" marginTop={majorScale(1)}>
      {pipe(
        props.package.tags,
        nonEmptyArray.map((t) => (
          <Badge
            key={`${props.package.id}-${t}`}
            color="neutral"
            marginTop={majorScale(2)}
            isInteractive
          >
            {t}
          </Badge>
        ))
      )}
    </Stack>
  </Card>
);

export const PackagesGrid = (props: Props) => (
  <Pane display="flex" justifyContent="center">
    {pipe(
      props.packages,
      record.keys,
      array.chunksOf(Math.ceil(record.size(props.packages) / 3)),
      array.map((chunk) => (
        <Pane
          key={pipe(chunk, nonEmptyArray.head)}
          display="flex"
          flexDirection="column"
        >
          {pipe(
            chunk,
            nonEmptyArray.map((k) => record.lookup(k, props.packages)),
            nonEmptyArray.map(
              flow(
                option.map(nonEmptyArray.head),
                option.map((p) => <PackageCard key={p.id} package={p} />),
                option.toNullable
              )
            )
          )}
        </Pane>
      ))
    )}
  </Pane>
);
