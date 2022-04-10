import { option } from "fp-ts";
import { Option } from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { GetServerSideProps } from "next";
import { PackagesIndex } from "./Package";

export type WithPackagesIndex = {
  packagesIndex: Option<PackagesIndex>;
};

export const withPackagesIndex: GetServerSideProps<WithPackagesIndex> =
  async () => {
    const res = await fetch(
      "https://github.com/espanso/hub/releases/download/v1.0.0/package_index.json"
    );
    const data = await res.json();
    return pipe(
      data,
      PackagesIndex.decode,
      option.fromEither,
      (packagesIndex) => ({
        props: {
          packagesIndex,
        },
      })
    );
  };
