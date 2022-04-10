import { array, boolean, either } from "fp-ts";
import { flow, identity, pipe } from "fp-ts/function";
import { Either } from "fp-ts/Either";
import * as t from "io-ts";

const GITHUB_DOMAIN = "github.com";
const GITHUB_USER_CONTENT_DOMAIN = "githubusercontent.com";

interface GithubURLBrand {
  readonly GithubURL: unique symbol;
}

export const GithubURL = t.brand(
  t.string,
  (s): s is t.Branded<string, GithubURLBrand> => s.includes(GITHUB_DOMAIN),
  "GithubURL"
);

export type GithubURL = t.TypeOf<typeof GithubURL>;

interface GithubURLRawBrand {
  readonly GithubURLRaw: unique symbol;
  readonly GithubUserContentURL: unique symbol;
}

const GithubURLRaw = t.brand(
  t.string,
  (s): s is t.Branded<string, GithubURLRawBrand> =>
    GithubURL.is(s) && s.includes("/raw/"),
  "GithubURLRaw"
);

export type GithubURLRaw = t.TypeOf<typeof GithubURLRaw>;

const GithubUserContentURL = t.brand(
  t.string,
  (s): s is t.Branded<string, GithubURLRawBrand> =>
    s.includes(GITHUB_USER_CONTENT_DOMAIN),
  "GithubUserContentURL"
);

export type GithubUserContentURL = t.TypeOf<typeof GithubUserContentURL>;

interface GithubURLBlobBrand {
  readonly GithubURLBlob: unique symbol;
}

const GithubURLBlob = t.brand(
  t.string,
  (s): s is t.Branded<string, GithubURLBlobBrand> =>
    GithubURL.is(s) && s.includes("/blob/"),
  "GithubURLBlob"
);

export type GithubURLBlob = t.TypeOf<typeof GithubURLBlob>;

const GithubLocalAsset = t.type(
  {
    repositoryHomepage: GithubURL,
    relativePath: t.string,
  },
  "GithubLocalAsset"
);

export type GithubLocalAsset = t.TypeOf<typeof GithubLocalAsset>;

const GithubURLRawFromBlob = new t.Type<GithubURLRaw, GithubURLRaw, string>(
  "GithubURLRawFromBlob",
  (input): input is GithubURLRaw => typeof input === "string",
  (input, ctx) =>
    pipe(
      GithubURLBlob.validate(input, ctx),
      either.fold(
        () =>
          t.failure(
            input,
            ctx,
            `GithubURLRawFromBlob failure: input is not a GithubURLBlob`
          ),
        (url) => t.success(url.replace("/blob/", "/raw/") as GithubURLRaw)
      )
    ),
  identity
);

const GithubURLRawFromLocalAsset = new t.Type<
  GithubURLRaw,
  GithubURLRaw,
  unknown
>(
  "GithubURLRawFromLocalAsset",
  (input): input is GithubURLRaw => typeof input === "string",
  (input, ctx) =>
    pipe(
      GithubLocalAsset.validate(input, ctx),
      either.fold(
        () =>
          t.failure(
            input,
            ctx,
            `GithubURLRawFromLocalAsset failure: input is not a GithubLocalAsset`
          ),
        (asset) =>
          pipe(
            asset.relativePath.startsWith("http://") ||
              asset.relativePath.startsWith("https://"),
            boolean.fold(
              () =>
                t.success(
                  `${asset.repositoryHomepage}/raw/master/${asset.relativePath}` as GithubURLRaw
                ),
              () =>
                t.failure(
                  input,
                  ctx,
                  `asset.relativePath is not a relative path`
                )
            )
          )
      )
    ),
  identity
);

const eitherFromValidation = either.mapLeft(
  flow(
    array.reduce(
      "",
      (acc, curr: t.ValidationError) =>
        `${JSON.stringify(curr.value)}: ${curr.message}\n${acc}`
    ),
    Error
  )
);

const chainLeftToRight: <E1, A, E2>(
  f: (e: E1) => Either<E2, A>
) => (ma: Either<E1, A>) => Either<E2, A> = (f) =>
  flow(
    either.match(
      flow(f, either.matchW(either.left, either.right)),
      either.right
    )
  );

/**
 * GithubUserContentURL
 * GithubURL => GithubURLRaw
 * GithubURL => GithubURLBlob => GithubURLRawFromBlob => GithubURLRaw
 * GithubURLRawFromLocalAsset => GithubURLRaw
 */
export const fromGithub =
  (repositoryHomepage: string) => (localAssetOrBlob: string) =>
    pipe(
      localAssetOrBlob,
      GithubUserContentURL.decode,
      chainLeftToRight(() => GithubURLRaw.decode(localAssetOrBlob)),
      chainLeftToRight(() => GithubURLRawFromBlob.decode(localAssetOrBlob)),
      chainLeftToRight(() =>
        GithubURLRawFromLocalAsset.decode({
          repositoryHomepage,
          relativePath: localAssetOrBlob,
        })
      ),
      eitherFromValidation
    );
