import { Card, Heading, majorScale, Paragraph } from "evergreen-ui";
import { Package } from "../api/domain";
import { TagBadgeGroup } from "./Tags/TagBadgeGroup";

type Props = {
  package: Package;
  onTagClick: (tag: string) => unknown;
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
    <TagBadgeGroup tags={props.package.tags} onClick={props.onTagClick} />
  </Card>
);
