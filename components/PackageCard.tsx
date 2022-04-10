import { Card, Heading, majorScale, Pane, Paragraph } from "evergreen-ui";
import { Package } from "../api/domain";
import { isFeatured } from "../api/packageFeatured";
import { TagBadgeGroup } from "./Tags/TagBadgeGroup";
import { FeaturedBadge } from "./featured";
import { Stack } from "./layout";
import { record } from "fp-ts";
import { pipe } from "fp-ts/function";

type Props = {
  package: Package;
  onTagClick: (tag: string) => unknown;
  hideFeaturedBadge?: boolean;
};

const propsKeys = ["package", "onTagClick", "hideFeaturedBadge"];

export const PackageCard = (
  props: Props & React.ComponentProps<typeof Card>
) => (
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
    justifyContent="space-between"
    minHeight={majorScale(15)}
    {...pipe(
      props,
      record.filterWithIndex((k, v) => k in propsKeys)
    )}
  >
    <Stack units={1} direction="column">
      <Pane display="flex">
        <Heading flex={1}>{props.package.title}</Heading>
        {props.hideFeaturedBadge ||
          (isFeatured(props.package) && <FeaturedBadge />)}
      </Pane>
      <Paragraph>{props.package.description}</Paragraph>
    </Stack>
    <TagBadgeGroup tags={props.package.tags} onClick={props.onTagClick} />
  </Card>
);
