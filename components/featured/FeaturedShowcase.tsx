import { majorScale, Pane, Heading, Link } from "evergreen-ui";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { Package } from "../../api/domain";
import { pipe } from "fp-ts/function";
import { nonEmptyArray, option } from "fp-ts";
import { PackageCard } from "../PackageCard";
import { usePackageSearch } from "../../api/search";
import { FeaturedBadge } from "./FeaturedBadge";
import { Stack } from "../layout";

type Props = {
  packages: NonEmptyArray<Package>;
};

export const FeaturedShowcase = (props: Props) => {
  const packageSearch = usePackageSearch({
    searchPathname: "/search",
  });

  return (
    <Pane
      display="flex"
      flexDirection="column"
      marginTop={majorScale(6)}
      marginBottom={majorScale(6)}
    >
      <Stack units={2}>
        <Heading size={800}>Featured Packages</Heading>
        <FeaturedBadge />
      </Stack>
      <Pane
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="space-between"
      >
        {pipe(
          props.packages,
          nonEmptyArray.map((p) => (
            <Pane
              key={p.id}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexBasis="30%"
              marginTop={majorScale(6)}
            >
              <PackageCard
                package={p}
                onTagClick={(tag) => packageSearch.setTags(option.some([tag]))}
                hideDescription
                hideFeaturedBadge
              />
            </Pane>
          ))
        )}
      </Pane>

      <Link marginTop={majorScale(6)} href="/search" alignSelf="flex-end">
        See all packages {">"}
      </Link>
    </Pane>
  );
};
