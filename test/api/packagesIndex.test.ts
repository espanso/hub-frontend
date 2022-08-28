import { PackageArray } from "../../api/domain";
import { pipe } from "fp-ts/function";
import { either } from "fp-ts";

describe("packagesIndex API", () => {
    test("ignore single package decode failure", () => {
        const valid = {
            name: "name",
            author: "author",
            description: "description",
            title: "title",
            version: "0.0.1",
            tags: [
                "tag1",
                "tag2",
                "tag3",
            ],
            archive_url: "archive_url",
            archive_sha256_url: "archive_sha256_url"
        };

        const missingProperty = {
            name: "name",
            author: "author",
            description: "description",
            title: "title",
            version: "x.x.x",
            archive_url: "archive_url",
            archive_sha256_url: "archive_sha256_url"
        }

        const invalidProperty = {
            name: 3,
            author: "author",
            description: "description",
            title: "title",
            version: "x.x.x",
            tags: [
                "tag1",
                "tag2",
                "tag3",
            ],
            archive_url: "archive_url",
            archive_sha256_url: "archive_sha256_url"
        }

        const packagesIndex = [valid, missingProperty, invalidProperty];

        pipe(
            packagesIndex,
            PackageArray.decode,
            x => expect(x).toStrictEqual(either.right([{
                ...valid,
                id: "name-0.0.1"
            }]))
        )
    })
});
