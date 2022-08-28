import { string, readonlyNonEmptyArray as rnea } from "fp-ts";
import { flow, pipe } from "fp-ts/function";

export const splitLines: (nLines: number) => (s: string) => rnea.ReadonlyNonEmptyArray<string> =
  (nLines) => (s) => pipe(
    s,
    string.split("\n"),
    rnea.chunksOf(nLines),
    rnea.map(flow(
      rnea.intersperse("\n"),
      rnea.reduce('', (acc, curr) => `${acc}${curr}`))
    )
  )
