import { taskEither, either } from "fp-ts";
import { Either } from "fp-ts/Either";
import { TaskEither } from "fp-ts/TaskEither";

const logMiddleware = <E>(error: E) => {
  console.error(error);
  return error;
};

export const taskEitherLogError: <E, A>(
  taskEither: TaskEither<E, A>
) => TaskEither<E, A> = taskEither.mapLeft(logMiddleware);
