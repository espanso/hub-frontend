import { Pane } from "evergreen-ui";
import {
  array,
  either,
  nonEmptyArray,
  option,
  record,
  task,
  taskEither,
} from "fp-ts";
import { constant, flow, pipe } from "fp-ts/function";
import { InferGetStaticPropsType } from "next";
import { GroupedByVersion, Package } from "../api/domain";
import { isFeatured } from "../api/packageFeatured";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { usePackageSearch } from "../api/search";
import { ContentRow, Navbar, FeaturedShowcase } from "../components";

export const getStaticProps = () =>
  pipe(
    fetchPackagesIndex,
    taskEither.map((index) => index.packages),
    taskEither.chain(
      flow(
        GroupedByVersion.decode,
        either.mapLeft(either.toError),
        taskEither.fromEither
      )
    ),
    taskEither.map<GroupedByVersion, Package[]>(
      flow(record.map(nonEmptyArray.head), Object.values)
    ),
    task.map(either.fold(constant(option.none), option.some)),
    task.map((packages) => ({
      props: {
        packages,
      },
    }))
  )();

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const Index = (props: Props) => {
  const packageSearch = usePackageSearch({
    searchPathname: "/search",
  });

  return (
    <Pane display="flex" flexDirection="column">
      <ContentRow background="green500" elevation={2} zIndex={1}>
        <Navbar onSearchEnter={flow(option.of, packageSearch.setQuery)} />
      </ContentRow>
      <ContentRow background="tint2">
        {pipe(
          props.packages,
          option.map(array.filter(isFeatured)),
          option.chain(nonEmptyArray.fromArray),
          option.map((pcks) => <FeaturedShowcase packages={pcks} />),
          option.toNullable
        )}
      </ContentRow>
    </Pane>
  );
};

export default Index;
