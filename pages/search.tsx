import { Pane } from "evergreen-ui";
import {
  array,
  either,
  nonEmptyArray,
  option,
  record,
  string,
  task,
} from "fp-ts";
import { constant, flow, pipe } from "fp-ts/function";
import { Eq } from "fp-ts/Eq";
import { InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { GroupedByVersion, Package } from "../api/domain";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { ContentRow, Navbar, PackageCard, Stack } from "../components";
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

  const renderSearchResults = (packages: Array<Package>) => (
    <Stack units={2} direction="column">
      {pipe(
        packages,
        array.map((p) => <PackageCard package={p} />)
      )}
    </Stack>
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
          option.chain(flow(GroupedByVersion.decode, option.fromEither)),
          option.map(flow(record.map(nonEmptyArray.head), Object.values)),
          option.map(filterBySearch),
          option.map(renderSearchResults),
          option.toNullable
        )}
      </ContentRow>
    </Pane>
  );
};

export default Search;
