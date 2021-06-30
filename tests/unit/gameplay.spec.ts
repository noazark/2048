import {
  getIdx,
  getX,
  getY,
  mergeRow,
  PHASE,
  merge,
  equal,
  splitGroups,
  insertRandom,
  createGame,
  Tile,
  Matrix,
} from "@/gameplay";

const defaultMatrix = createGame();

export function toTiles(lst: number[]): Tile[] {
  return lst.map((v) => ({ value: v, id: "42" }));
}

expect.extend({
  toEqualMatrix(received: Matrix, actual: Matrix): jest.CustomMatcherResult {
    const dataReceived = received.data.map((el: Tile) => el.value);
    const dataActual = actual.data.map((el: Tile) => el.value);

    const equal = this.equals(dataReceived, dataActual);

    return {
      message: () => `expected ${dataReceived} to equal ${dataActual}`,
      pass: equal,
    };
  },
  toEqualMatrixTiles(
    received: Tile[],
    actual: Tile[]
  ): jest.CustomMatcherResult {
    const dataReceived = received.map((el: Tile) => el.value);
    const dataActual = actual.map((el: Tile) => el.value);

    const equal = this.equals(dataReceived, dataActual);

    return {
      message: () => `expected ${dataReceived} to equal ${dataActual}`,
      pass: equal,
    };
  },
});

describe("getX", () => {
  it.each`
    idx   | x
    ${0}  | ${0}
    ${5}  | ${1}
    ${7}  | ${3}
    ${14} | ${2}
  `("returns the x component of a given index (idx = %i)", ({ idx, x }) => {
    expect(getX(idx)).toEqual(x);
  });

  it("works with different matrix widths", () => {
    expect(getX(43, 5)).toEqual(3);
  });
});

describe("getY", () => {
  it.each`
    idx   | y
    ${0}  | ${0}
    ${4}  | ${1}
    ${7}  | ${1}
    ${14} | ${3}
  `("returns the x component of a given index (idx = %i)", ({ idx, y }) => {
    expect(getY(idx)).toEqual(y);
  });

  it("works with different matrix widths", () => {
    expect(getY(43, 5)).toEqual(8);
  });
});

describe("getIdx", () => {
  it.each`
    x    | y    | idx
    ${0} | ${0} | ${0}
    ${1} | ${3} | ${13}
  `(
    "returns the index for a given coordinate (x = %i, y = %i)",
    ({ x, y, idx }) => {
      expect(getIdx(x, y)).toEqual(idx);
    }
  );

  it("works with different matrix widths", () => {
    expect(getIdx(3, 8, 5)).toEqual(43);
  });
});

describe("splitGroups", () => {
  it("groups", () => {
    expect(
      splitGroups(
        {
          data: toTiles([0, 1, 2, 3]),
          size: { x: 2, y: 2 },
        },
        PHASE.UP
      )
    ).toEqual([toTiles([0, 2]), toTiles([1, 3])]);
  });

  it("groups", () => {
    expect(
      splitGroups(
        {
          data: toTiles([0, 1, 2, 3]),
          size: { x: 2, y: 2 },
        },
        PHASE.LEFT
      )
    ).toEqual([toTiles([0, 1]), toTiles([2, 3])]);
  });
});

describe("mergeRow", () => {
  it.each`
    input                       | output
    ${[2, 2, 4, 2]}             | ${[4, 4, 2, 0]}
    ${[4, 0, 0, 8]}             | ${[4, 8, 0, 0]}
    ${[0, 2, 2, 1, 0, 2, 2, 1]} | ${[4, 1, 4, 1, 0, 0, 0, 0]}
    ${[2, 0, 2, 4]}             | ${[4, 4, 0, 0]}
  `("merge left", ({ input, output }) => {
    input = toTiles(input);
    output = toTiles(output);

    expect(mergeRow(input, PHASE.LEFT)).toEqualMatrixTiles(output);
  });

  it.each`
    input           | output
    ${[2, 2, 4, 2]} | ${[0, 4, 4, 2]}
    ${[4, 4, 2, 0]} | ${[0, 0, 8, 2]}
    ${[4, 0, 4, 2]} | ${[0, 0, 8, 2]}
    ${[2, 0, 2, 4]} | ${[0, 0, 4, 4]}
  `("merge right", ({ input, output }) => {
    input = toTiles(input);
    output = toTiles(output);
    expect(mergeRow(input, PHASE.RIGHT)).toEqualMatrixTiles(output);
  });
});

describe("equal", () => {
  it("compares two matrices", () => {
    expect(
      equal(
        { ...defaultMatrix, data: toTiles([1, 2, 3]) },
        { ...defaultMatrix, data: toTiles([1, 2, 3]) }
      )
    ).toBeTruthy();
    expect(
      equal(
        { ...defaultMatrix, data: toTiles([1, 2, 0]) },
        { ...defaultMatrix, data: toTiles([1, 2, 3]) }
      )
    ).toBeFalsy();
  });
});

describe("insertRandom", () => {
  beforeEach(() => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.spyOn(Math, "random").mockRestore();
  });

  it("randomly inserts a value (2 or 4) in an empty space", () => {
    /* eslint-disable */
    const input = {
      ...defaultMatrix,
      data: toTiles([
        0, 4, 0, 2,
        0, 4, 2, 4,
        4, 8, 8, 0,
        0, 0, 2, 0
      ]),
    };
    const output = {
      ...defaultMatrix,
      data: toTiles([
        0, 4, 0, 2,
        0, 4, 2, 4,
        4, 8, 8, 2, // <- inserted 2
        0, 0, 2, 0
      ]),
    };
    /* eslint-enable */

    expect(insertRandom(input)).toEqualMatrix(output);
  });

  it("randomly inserts a 4 when the probability is high enough", () => {
    /* eslint-disable */
    const input = {
      ...defaultMatrix,
      data: toTiles([
        0, 4, 0, 2,
        0, 4, 2, 4,
        4, 8, 8, 0,
        0, 0, 2, 0
      ]),
    };
    const output = {
      ...defaultMatrix,
      data: toTiles([
        0, 4, 0, 2,
        0, 4, 2, 4,
        4, 8, 8, 4, // <- inserted 4
        0, 0, 2, 0
      ]),
    };
    /* eslint-enable */

    expect(
      insertRandom(input, {
        probability: [
          [2, 1],
          [4, 1],
        ],
      })
    ).toEqualMatrix(output);
  });
});

describe("merge", () => {
  it("plays", () => {
    /* eslint-disable */
    const input = {
      ...defaultMatrix,
      data: toTiles([
        0, 4, 0, 2,
        0, 4, 2, 4,
        0, 2, 2, 4,
        0, 0, 2, 0
      ]),
    };
    const output = {
      ...defaultMatrix,
      data: toTiles([
        0, 8, 4, 2,
        0, 2, 2, 8,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]),
    };
    /* eslint-enable */

    expect(merge(input, PHASE.UP)).toEqualMatrix(output);
  });

  it("plays", () => {
    /* eslint-disable */
    const input = {
      ...defaultMatrix,
      data: toTiles([
        0, 4, 0, 2,
        0, 4, 2, 4,
        0, 2, 2, 4,
        0, 0, 2, 0
      ]),
    };
    const output = {
      ...defaultMatrix,
      data: toTiles([
        4, 2, 0, 0,
        4, 2, 4, 0,
        4, 4, 0, 0,
        2, 0, 0, 0
      ]),
    };
    /* eslint-enable */

    expect(merge(input, PHASE.LEFT)).toEqualMatrix(output);
  });
  it("plays", () => {
    /* eslint-disable */
    const input = {
      ...defaultMatrix,
      data: toTiles([
        0, 0, 0, 0,
        2, 0, 2, 4,
        0, 0, 8, 2,
        16, 64, 16, 8
      ]),
    };
    const output = {
      ...defaultMatrix,
      data: toTiles([
        0, 0, 0, 0,
        4, 4, 0, 0,
        8, 2, 0, 0,
        16, 64, 16, 8
      ]),
    };
    /* eslint-enable */

    expect(merge(input, PHASE.LEFT)).toEqualMatrix(output);
  });
});
