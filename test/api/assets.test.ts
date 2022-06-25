import { fromGithub } from "../../api/assets";
import { either } from "fp-ts";

describe("assets API", () => {
  describe("fromGithub", () => {
    const repositoryHomepage = "https://github.com/user/repo";
    const relativePath = "path/to/asset.png";
    const raw = `${repositoryHomepage}/raw/master/${relativePath}`;

    test("converts a blob URL into a raw URL", () => {
      const blob = `${repositoryHomepage}/blob/master/${relativePath}`;
      expect(fromGithub(repositoryHomepage)(blob)).toStrictEqual(
        either.right(raw)
      );
    });

    test("converts a local asset into a raw URL", () => {
      expect(fromGithub(repositoryHomepage)(relativePath)).toStrictEqual(
        either.right(raw)
      );
    });

    test("does nothing with a raw URL", () => {
      expect(fromGithub(repositoryHomepage)(raw)).toStrictEqual(
        either.right(raw)
      );
    });

    test("does nothing with a user content raw URL", () => {
      const rawusercontent = "https://camo.githubusercontent.com/something";
      expect(fromGithub(repositoryHomepage)(rawusercontent)).toStrictEqual(
        either.right(rawusercontent)
      );
    });

    test("returns left with a non-Github URL", () => {
      expect(
        either.isLeft(
          fromGithub(repositoryHomepage)("https://example.com/resource")
        )
      ).toBe(true);
    });
  });
});
