import { array, either, nonEmptyArray, option, task, taskEither } from "fp-ts";
import { constant, flow, pipe } from "fp-ts/function";
import { sequenceS } from "fp-ts/lib/Apply";
import { GetStaticPropsContext } from "next";
import { OrderedByVersion } from "../api/domain";
import { fetchPackageRepo } from "../api/packageRepo";
import { fetchPackagesIndex } from "../api/packagesIndex";
import { serializeReadme } from "../api/serializeReadme";
import VersionedPackagePage, { Props } from "./[packageName]/v/[version]";

export const getStaticProps = (context: GetStaticPropsContext) =>
  pipe(
    fetchPackagesIndex,
    taskEither.chain((packagesIndex) =>
      pipe(
        packagesIndex.packages,
        array.filter(
          (p) =>
            context.params !== undefined &&
            p.name === context.params.packageName
        ),
        OrderedByVersion.decode,
        either.mapLeft(
          flow(
            array.reduce("", (acc, curr) => `${acc}, ${curr.message}`),
            either.toError
          )
        ),
        taskEither.fromEither
      )
    ),
    taskEither.chain((packages) =>
      sequenceS(taskEither.ApplyPar)({
        packageRepo: pipe(
          packages,
          array.head,
          option.map(fetchPackageRepo),
          taskEither.fromOption(
            () => new Error(`Version ${context.params?.version} not found`)
          ),
          taskEither.flatten,
          serializeReadme
        ),
        versions: pipe(
          packages,
          nonEmptyArray.map((p) => p.version),
          taskEither.right
        ),
      })
    ),
    task.map((props) => ({
      props: pipe(
        props,
        either.foldW(
          () => ({
            packageRepo: option.none,
            versions: [],
          }),
          (v) => ({
            packageRepo: option.some(v.packageRepo),
            versions: v.versions,
          })
        )
      ),
    }))
  )();

export const getStaticPaths = pipe(
  fetchPackagesIndex,
  task.map(
    flow(
      either.map((d) => d.packages),
      either.map(array.map((p) => ({ params: { packageName: p.name } }))),
      either.getOrElseW(constant([]))
    )
  ),
  task.map((paths) => ({
    paths,
    fallback: false,
  }))
);

const LatestPackagePage = (props: Props) => <VersionedPackagePage {...props} />;

export default LatestPackagePage;
