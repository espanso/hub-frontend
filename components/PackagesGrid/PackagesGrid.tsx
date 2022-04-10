import { Card, Heading, majorScale, Pane, Paragraph } from "evergreen-ui";
import { pipe } from "fp-ts/function";
import { Package } from "../../api/model";
import { array } from "fp-ts";

type Props = {
  packages: Package[];
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
  <Pane display="flex" background="tint2">
    {pipe(
      props.packages,
      array.partitionWithIndex((index) => index > props.packages.length / 3),
      ({ left, right }) => {
        const separated = pipe(
          right,
          array.partitionWithIndex((index) => index > right.length / 2)
        );
        return [left, separated.left, separated.right];
      },
      array.map((packages) => (
        <Pane display="flex" flexDirection="column">
          {pipe(
            packages,
            array.map((p) => <PackageCard package={p} />)
          )}
        </Pane>
      ))
    )}
  </Pane>
);
