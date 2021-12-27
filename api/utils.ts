import { taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import { TaskEither } from "fp-ts/TaskEither";

export const taskEitherLogError: <E, A>(
  taskEither: TaskEither<E, A>
) => TaskEither<E, A> = (taskEtiher) =>
  pipe(
    taskEtiher,
    taskEither.fold(
      (error) => {
        process.env.NODE_ENV === "development" && console.error(error);
        return taskEither.left(error);
      },
      (value) => taskEither.right(value)
    )
  );
