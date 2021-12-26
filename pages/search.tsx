import { Pane } from "evergreen-ui";
import {
  option,
  either,
  task,
  taskEither,
  array,
  nonEmptyArray,
  string,
  readonlyNonEmptyArray,
} from "fp-ts";
import { constant, flow, pipe } from "fp-ts/function";
import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { PackagesGrid, Navbar, ContentRow } from "../components";
import { Package, GroupedByVersion, PackagesIndex } from "../api/domain";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const getStaticProps = (context: GetStaticPropsContext) =>
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
