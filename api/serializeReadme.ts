import { taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { PackageRepo } from "../api/domain";

export const serializeReadme = taskEither.chain((packageRepo: PackageRepo) =>
  pipe(
    taskEither.tryCatch(
      () =>
        serialize(packageRepo.readme, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }),
      (r) =>
        new Error(
          `${packageRepo.package.id}: Failing to seriliaze readme markdown: ${r}`
        )
    ),
    taskEither.map((serializedReadme) => ({
      ...packageRepo,
      serializedReadme,
    }))
  )
);
