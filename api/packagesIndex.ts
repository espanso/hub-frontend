import { either, option, task, taskEither } from "fp-ts";
import { constant, pipe } from "fp-ts/function";
import { PackagesIndex } from "./Package";
import { TaskEither } from "fp-ts/TaskEither";
import { Task } from "fp-ts/Task";

export const fetchPackagesIndex: TaskEither<Error, PackagesIndex> = pipe(
  taskEither.tryCatch(
    () =>
      fetch(
        "https://github.com/espanso/hub/releases/download/v1.0.0/package_index.json"
      ),
    either.toError
  ),
  taskEither.chain((response) =>
    taskEither.tryCatch(() => response.json(), either.toError)
  )
);

export const fetchPackagesIndexAsOption: Task<option.Option<PackagesIndex>> =
  pipe(
    fetchPackagesIndex,
    task.map(either.fold(constant(option.none), option.some))
  );
