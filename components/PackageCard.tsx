import { Card, Heading, majorScale, Pane, Paragraph } from "evergreen-ui";
import { Package } from "../api/domain";
import { isFeatured } from "../api/packageFeatured";
import { TagBadgeGroup } from "./Tags/TagBadgeGroup";
import { FeaturedBadge } from "./featured";
import { Stack } from "./layout";

type Props = {
  package: Package;
  onTagClick: (tag: string) => unknown;
  hideDescription?: boolean;
  hideFeaturedBadge?: boolean;
};

export const PackageCard = (props: Props) => (
  <Card
    className="clickable"
    display="flex"
    width="100%"
    flexDirection="column"
    float="left"
    padding={majorScale(2)}
    backgroundColor="white"
    hoverElevation={2}
    border
    onClick={() => {
      window.location.href = props.package.name;
    }}
  >
    <Stack units={3} direction="column">
      <Pane>
        <Pane display="flex">
          <Heading flex={1}>{props.package.title}</Heading>
          {props.hideFeaturedBadge ||
            (isFeatured(props.package) && <FeaturedBadge />)}
        </Pane>
        {props.hideDescription || (
          <Paragraph>{props.package.description}</Paragraph>
        )}
      </Pane>
      <TagBadgeGroup tags={props.package.tags} onClick={props.onTagClick} />
    </Stack>
  </Card>
);
