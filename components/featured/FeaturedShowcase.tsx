import { majorScale, Pane, Heading, Link } from "evergreen-ui";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { Package } from "../../api/domain";
import { pipe } from "fp-ts/function";
import { nonEmptyArray, option } from "fp-ts";
import { PackageCard } from "../PackageCard";
import { usePackageSearch } from "../../api/search";
import { FeaturedBadge } from "./FeaturedBadge";
import { Stack } from "../layout";
import { useResponsive } from "../layout/useResponsive";

type Props = {
  packages: NonEmptyArray<Package>;
};

export const FeaturedShowcase = (props: Props) => {
  const { foldDevices } = useResponsive();
  const packageSearch = usePackageSearch({
    searchPathname: "/search",
  });

  const makeCommonLayout = (cardWidthPerc: string) => (
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
            flexBasis={cardWidthPerc}
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
  );

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

      {foldDevices({
        mobile: () => (
          <Pane display="flex" flexDirection="column">
            {pipe(
              props.packages,
              nonEmptyArray.map((p) => (
                <Pane
                  key={p.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  marginTop={majorScale(3)}
                >
                  <PackageCard
                    package={p}
                    onTagClick={(tag) =>
                      packageSearch.setTags(option.some([tag]))
                    }
                    hideDescription
                    hideFeaturedBadge
                  />
                </Pane>
              ))
            )}
          </Pane>
        ),
        tablet: () => makeCommonLayout("45%"),
        desktop: () => makeCommonLayout("30%"),
      })}

      <Link marginTop={majorScale(6)} href="/search" alignSelf="flex-end">
        See all packages {">"}
      </Link>
    </Pane>
  );
};
