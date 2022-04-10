import { taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { PackageRepo } from "../api/domain";

// See https://github.com/espanso/hub-frontend/issues/6
const fixLiteralHTML = (html: string) =>
  html
    .replaceAll("<br>", "<br/>")
    .replaceAll("<kbd>", "`")
    .replaceAll("</kbd>", "`");

export const serializeReadme = taskEither.chain((packageRepo: PackageRepo) =>
  pipe(
    taskEither.tryCatch(
      () =>
        serialize(fixLiteralHTML(packageRepo.readme), {
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
