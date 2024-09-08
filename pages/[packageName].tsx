import { GetStaticPropsContext } from "next";
import { resolvePackage } from "../api/package";
import { getPackagesIndex } from "../api/packagesIndex";
import VersionedPackagePage, { Props } from "./[packageName]/v/[version]";

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const packagesIndex = await getPackagesIndex();
  const packageName = context.params?.packageName;
  const version = context.params?.version;

  const props = await resolvePackage(
    packagesIndex,
    Array.isArray(packageName) ? packageName[0] : packageName,
    Array.isArray(version) ? version[0] : version
  );

  return {
    props,
  };
};

export const getStaticPaths = async () => {
  const packagesIndex = await getPackagesIndex();
  return {
    paths: packagesIndex.packages.map((p) => ({
      params: { packageName: p.name },
    })),
    fallback: false,
  };
};

const LatestPackagePage = (props: Props) => <VersionedPackagePage {...props} />;

export default LatestPackagePage;
