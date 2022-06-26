import { Card, Heading, majorScale, Pane, Text } from "evergreen-ui";
import { Package } from "../api/domain";
import { isFeatured } from "../api/packageFeatured";
import { TagBadgeGroup } from "./Tags/TagBadgeGroup";
import { FeaturedBadge } from "./featured";
import { Stack } from "./layout";
import { record } from "fp-ts";
import { pipe } from "fp-ts/function";
import { NextjsLink } from "./NextjsLink";

type Props = {
  package: Package;
  onTagClick: (tag: string) => unknown;
  hideFeaturedBadge?: boolean;
};

const propsKeys = ["package", "onTagClick", "hideFeaturedBadge"];

export const PackageCard = (
  props: Props & React.ComponentProps<typeof Card>
) => (
  <NextjsLink href={`/${props.package.name}`}>
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
      justifyContent="space-between"
      minHeight={majorScale(15)}
      {...pipe(
        props,
        record.filterWithIndex((k, v) => !propsKeys.includes(k))
      )}
    >
      <Stack units={1} direction="column">
        <Pane display="flex">
          <Heading flex={1}>{props.package.title}</Heading>
          {props.hideFeaturedBadge ||
            (isFeatured(props.package) && <FeaturedBadge />)}
        </Pane>
        <Text>{props.package.description}</Text>
      </Stack>
      <TagBadgeGroup tags={props.package.tags} onClick={props.onTagClick} />
    </Card>
  </NextjsLink>
);
