import { Card, Heading, majorScale, Pane, Paragraph } from "evergreen-ui";
import { flow, pipe } from "fp-ts/function";
import { GroupedByVersion, Package } from "../../api/domain";
import { array, nonEmptyArray, option, record } from "fp-ts";

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
      window.location.pathname = props.package.name;
    }}
  >
    <Heading>{props.package.title}</Heading>
    <Paragraph>{props.package.description}</Paragraph>
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
                option.map((p) => (
                  <PackageCard key={`${p.name}_${p.author}`} package={p} />
                )),
                option.toNullable
              )
            )
          )}
        </Pane>
      ))
    )}
  </Pane>
);
