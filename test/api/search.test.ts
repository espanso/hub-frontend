import { Package } from "../../api/domain";
import { tagsSearch } from "../../api/search";
import { flow, pipe } from "fp-ts/function";
import {
  array,
  either,
} from "fp-ts";
import * as A from 'fp-ts/Array'

describe("search API", () => {
  const generatePackageWithTags = (tags: Array<string>) => {
    return {
      "tags": tags,
      "name": "",
      "author": "",
      "description": "",
      "title": "",
      "version": "1.2.3",
      "archive_url": "",
      "archive_sha256_url": ""
    }
  };

  test("selecting multiple tags combines all possible results", () => {
    const packagesJson = [
      generatePackageWithTags(["a"]),
      generatePackageWithTags(["b"]),
    ]

    pipe(
      packagesJson,
      A.map(Package.decode),
      A.map(either.fold(
        flow( // decode fail
          array.reduce("", (acc, curr) => `${acc}\n${curr.message}`),
          x => { console.error(x); return x },
          either.left
        ),
        pckg => either.right(pckg) // decode success; extract
      )),

      // transform Array<Either<E,T>> into Either<E, T[]>
      array.sequence(either.Applicative),

      either.fold(
        (e) => console.log(e), // at least 1 element is left
        (packages) => pipe( // all elements are right, so T[]
          packages,
          (packages) => tagsSearch(packages)(["a", "b"]),
          (filtered) => expect(filtered.length).toEqual(2)
        )
      )
    )

  })
});