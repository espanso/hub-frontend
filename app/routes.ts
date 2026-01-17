import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("search", "routes/search.tsx"),
  route(":packageName", "routes/package.tsx"),
  route(":packageName/v/:version", "routes/package.tsx", {
    id: "package-version",
  }),
] satisfies RouteConfig;
