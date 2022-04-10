import { Pane } from "evergreen-ui";
import { either, nonEmptyArray, option, string, task } from "fp-ts";
import { constant, flow, pipe } from "fp-ts/function";
import { Eq } from "fp-ts/Eq";
import { InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { GroupedByVersion, Package } from "../api/domain";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { ContentRow, Navbar, PackagesGrid } from "../components";
import { search } from "../api/search";

export const getStaticProps = () =>
  pipe(
    fetchPackagesIndex,
    task.map(either.fold(constant(option.none), option.some)),
    task.map((packagesIndex) => ({
      props: {
        packagesIndex,
      },
    }))
  )();

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const tagEq: Eq<string> = {
  equals: (x, y) => x.toLocaleLowerCase() === y.toLocaleLowerCase(),
};

const Search = (props: Props) => {
  const router = useRouter();

  const query = pipe(
    router.query.q,
    option.fromNullable,
    option.map((v) => (Array.isArray(v) ? v[0] : v))
  );

  const tags = pipe(
    router.query.tags,
    option.fromNullable,
    option.map((v) => (Array.isArray(v) ? v[0] : v)),
    option.map(decodeURIComponent),
    option.map(string.split(","))
  );

  const filterBySearch: (packages: Array<Package>) => Array<Package> = (
    packages
  ) =>
    pipe(
      query,
      option.map(search(packages)),
      option.getOrElseW(constant(packages))
    );

  return (
    <Pane display="flex" flexDirection="column">
      <ContentRow background="green500">
        {router.isReady && (
          <Navbar searchInitialValue={pipe(query, option.toUndefined)} />
        )}
      </ContentRow>

      <ContentRow background="tint2">
        {pipe(
          props.packagesIndex,
          option.map((index) => index.packages),
          option.map(filterBySearch),
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
