import { Package } from "./domain";
import { pipe } from "fp-ts/function";
import { array } from "fp-ts";

const featuredPackages = [
  "all-emojis",
  "lorem",
  "greek-letters-improved",
  "html-utils-package",
  "math-symbols",
  "shruggie",
  "spanish-accent",
  "espanso-dice",
];

export const isFeatured: (p: Package) => boolean = (p) =>
  pipe(
    featuredPackages,
    array.exists((featured) => featured === p.name)
  );
