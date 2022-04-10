import { taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { PackageRepo } from "../api/domain";

// Fix for https://github.com/angelorpt/espanso-git/blob/main/README.md?plain=1
// See https://github.com/espanso/hub-frontend/issues/6
const fixBreakTag = (html: string) => html.replaceAll("<br>", "<br/>");

export const serializeReadme = taskEither.chain((packageRepo: PackageRepo) =>
  pipe(
    taskEither.tryCatch(
      () =>
        serialize(fixBreakTag(packageRepo.readme), {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }),
      (r) =>
        new Error(
          `${packageRepo.package.id}: Failing to serialize readme markdown: ${r}`
        )
    ),
    taskEither.map((serializedReadme) => ({
      ...packageRepo,
      serializedReadme,
    }))
  )
);
