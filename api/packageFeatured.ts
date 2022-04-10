import { Package } from "./domain";
import { pipe } from "fp-ts/function";
import { array, number } from "fp-ts";
import { contramap, Ord } from "fp-ts/Ord";

const featuredPackages = [
  "all-emojis",
  "html-utils-package",
  "lorem",
  "spanish-accent",
  "greek-letters-improved",
  "math-symbols",
  "medical-docs",
  "shruggie",
  "espanso-dice",
];

export const isFeatured: (p: Package) => boolean = (p) =>
  pipe(
    featuredPackages,
    array.exists((featured) => featured === p.name)
  );

export const ordFeatured: Ord<Package> = pipe(
  number.Ord,
  contramap((p: Package) => featuredPackages.indexOf(p.name))
);
