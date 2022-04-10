import Fuse from "fuse.js";
import { Package } from "./domain";

const options = {
  keys: ["name", "author", "description", "title"],
};

export const search: (
  packages: Array<Package>
) => (query: string) => Array<Package> = (packages) => (query) => {
  const fuse = new Fuse(packages, options);
  return fuse.search(query).map((i) => i.item);
};
