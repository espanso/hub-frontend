import { array, number, string } from "fp-ts";
import { pipe } from "fp-ts/function";
import { contramap, Ord, reverse } from "fp-ts/Ord";
import { Package } from "./domain";

type TagCount = {
  tag: string;
  count: number;
};

const tagsCountOrd: Ord<TagCount> = pipe(
  number.Ord,
  contramap((t: TagCount) => t.count),
  reverse
);

export const tagsCount: (packages: Array<Package>) => Array<TagCount> = (
  packages
) =>
  pipe(
    packages,
    array.map((p) => p.tags),
    array.flatten,
    array.uniq(string.Eq),
    array.reduce([] as Array<TagCount>, (acc, tag) => [
      ...acc,
      {
        tag,
        count: pipe(
          packages,
          array.filter((p) => p.tags.includes(tag)),
          array.size
        ),
      },
    ]),
    array.sort(tagsCountOrd)
  );
