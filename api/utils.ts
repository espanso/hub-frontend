import { taskEither } from "fp-ts";
import { identity, pipe } from "fp-ts/function";
import { TaskEither } from "fp-ts/TaskEither";

export const taskEitherLogError: <E, A>(
  taskEither: TaskEither<E, A>
) => TaskEither<E, A> = (taskEtiher) =>
  pipe(
    taskEtiher,
    taskEither.bimap((error) => {
      process.env.NODE_ENV === "development" && console.error(error);
      return error;
    }, identity)
  );
