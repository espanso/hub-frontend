import { Pane } from "evergreen-ui";
import {
  array,
  either,
  nonEmptyArray,
  option,
  readonlyNonEmptyArray,
  string,
  task,
} from "fp-ts";
import { constant, flow, pipe } from "fp-ts/function";
import { InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { GroupedByVersion, Package } from "../api/domain";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { ContentRow, Navbar, PackagesGrid } from "../components";

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

const Search = (props: Props) => {
  const router = useRouter();

  const query = pipe(
    router.query.q,
    option.fromNullable,
    option.map((v) => (Array.isArray(v) ? v[0] : v))
  );
  const queryTerms = pipe(query, option.map(string.split(" ")));

  const packagesFilter = (p: Package) =>
    pipe(queryTerms, option.isSome) &&
    pipe(
      Object.values(p),
      array.filter((value) => typeof value === "string"),
      array.filter((value) =>
        pipe(
          queryTerms,
          option.chain(
            flow(
              readonlyNonEmptyArray.filter((q) =>
                value.toLocaleLowerCase().includes(q.toLocaleLowerCase())
              )
            )
          ),
          option.fold(
            () => false,
            (foundTerms) => foundTerms.length > 0
          )
        )
      ),
      array.isNonEmpty
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
