import { Pane } from "evergreen-ui";
import { option, either, task, taskEither, array, nonEmptyArray } from "fp-ts";
import { constant, flow, pipe } from "fp-ts/function";
import { InferGetStaticPropsType } from "next";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { PackagesGrid, Navbar, ContentRow } from "../components";
import { useRouter } from "next/router";
import { Package, GroupedByVersion } from "../api/domain";

export const getStaticProps = pipe(
  fetchPackagesIndex,
  task.map(either.fold(constant(option.none), option.some)),
  task.map((packagesIndex) => ({
    props: {
      packagesIndex,
    },
  }))
);

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const Search = (props: Props) => {
  const router = useRouter();
  const { q } = router.query;
  const query = Array.isArray(q) ? q[0] : q;

  const packagesFilter = (p: Package) =>
    pipe(
      Object.values(p),
      array.filter((value) => typeof value === "string"),
      array.filter((values) =>
        query !== undefined && query !== ""
          ? values.toLocaleLowerCase().includes(query.toLocaleLowerCase())
          : true
      ),
      array.isNonEmpty
    );

  return (
    <Pane display="flex" flexDirection="column">
      <ContentRow background="green500">
        <Navbar searchInitialValue={query} />
      </ContentRow>

      <ContentRow background="tint2">
        {pipe(
          props.packagesIndex,
          option.map((index) => index.packages),
          option.map(array.filter(packagesFilter)),
          option.chain(nonEmptyArray.fromArray),
          option.chain(flow(GroupedByVersion.decode, option.fromEither)),
          option.map((grouped) => <PackagesGrid packages={grouped} />),
          option.toNullable
        )}
      </ContentRow>
    </Pane>
  );
};

export default Search;
