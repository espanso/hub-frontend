import { BadgeIcon, Card, majorScale, Small, Text } from "evergreen-ui";
import { Stack } from "../layout";

export const FeaturedBadge = () => (
  <Card
    display="flex"
    background="green25"
    padding={majorScale(1)}
    borderRadius={majorScale(2)}
  >
    <Stack units={1}>
      <BadgeIcon color="success" />
      <Text size={300} color="green700" textTransform="uppercase">
        <Small>featured</Small>
      </Text>
    </Stack>
  </Card>
);
