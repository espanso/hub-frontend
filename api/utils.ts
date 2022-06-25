import { taskEither, string, array, readonlyNonEmptyArray as rnea } from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import { TaskEither } from "fp-ts/TaskEither";

const logMiddleware = <E>(error: E) => {
  console.error(error);
  return error;
};

export const taskEitherLogError: <E, A>(
  taskEither: TaskEither<E, A>
) => TaskEither<E, A> = taskEither.mapLeft(logMiddleware);

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
