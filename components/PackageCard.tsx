import { Badge, Card, Heading, majorScale, Paragraph } from "evergreen-ui";
import { nonEmptyArray } from "fp-ts";
import { pipe } from "fp-ts/function";
import { Package } from "../api/domain";
import { Stack } from "./layout";

type Props = {
  package: Package;
};

export const PackageCard = (props: Props) => (
  <Card
    className="package-card"
    display="flex"
    flexDirection="column"
    elevation={0}
    float="left"
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
