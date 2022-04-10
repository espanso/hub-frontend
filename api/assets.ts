import { array, boolean, either } from "fp-ts";
import { flow, identity, pipe } from "fp-ts/function";
import * as t from "io-ts";

const GITHUB_DOMAIN = "https://github.com/";

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
}

const GithubURLRaw = t.brand(
  t.string,
  (s): s is t.Branded<string, GithubURLRawBrand> =>
    GithubURL.is(s) && s.includes("/raw/"),
  "GithubURLRaw"
);

export type GithubURLRaw = t.TypeOf<typeof GithubURLRaw>;

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

const GithubURLRawFromBlob = new t.Type<GithubURLRaw, GithubURLRaw, unknown>(
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
          t.success(
            `${asset.repositoryHomepage}/raw/master/${asset.relativePath}` as GithubURLRaw
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

export const fromGithub =
  (repositoryHomepage: string) => (localAssetOrBlob: string) =>
    pipe(
      GithubURLBlob.decode(localAssetOrBlob),
      either.fold(
        () => GithubURLRaw.decode(localAssetOrBlob),
        GithubURLRawFromBlob.decode
      ),
      either.fold(
        () =>
          GithubURLRawFromLocalAsset.decode({
            repositoryHomepage,
            relativePath: localAssetOrBlob,
          }),
        t.success
      ),
      eitherFromValidation,
      either.map(GithubURLRaw.encode)
    );
