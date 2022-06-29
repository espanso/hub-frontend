import { pipe } from "fp-ts/function"
import { splitLines } from "../../api/utils"

describe("utils API", () => {
    test("split a string by lines", () => {
        const s = `first line
second line
third line`;

        pipe(
            s,
            splitLines(-1),
            x => expect(x).toStrictEqual(["first line", "second line", "third line"])
        )

        pipe(
            s,
            splitLines(1),
            x => expect(x).toStrictEqual(["first line", "second line", "third line"])
        )

        pipe(
            s,
            splitLines(2),
            x => expect(x).toStrictEqual(["first line\nsecond line", "third line"])
        )

        pipe(
            s,
            splitLines(3),
            x => expect(x).toStrictEqual(["first line\nsecond line\nthird line"])
        )
    })
})
