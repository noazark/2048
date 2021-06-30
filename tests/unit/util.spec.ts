import { getZeroIndexes } from "@/util";

describe("getZeroIndexes", () => {
  it.each`
    example         | expected
    ${[0, 1, 2, 0]} | ${[0, 3]}
    ${[0, 0, 0, 0]} | ${[0, 1, 2, 3]}
    ${[1, 2, 3, 4]} | ${[]}
  `(
    "returns a list contianing the indexes of all '0' values provided",
    ({ example, expected }) => {
      expect(getZeroIndexes(example)).toEqual(expected);
    }
  );
});
