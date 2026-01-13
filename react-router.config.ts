import type { Config } from "@react-router/dev/config";
import {
  getUniquePackageNames,
  getAllPackageVersionPaths,
} from "./app/services/packages";

export default {
  basename: "/hub-frontend",
  ssr: false,
  async prerender() {
    const packageNames = await getUniquePackageNames();
    const versionPaths = await getAllPackageVersionPaths();

    const paths = [
      "/",
      "/search",
      ...packageNames.map((name) => `/${name}`),
      ...versionPaths,
    ];

    console.log(
      `Prerendering ${paths.length} routes (${packageNames.length} packages, ${versionPaths.length} versions)`,
    );

    return paths;
  },
} satisfies Config;
