import { getRandomElement, getZeroIndexes, uuidv4 } from "./util";

export enum PHASE {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export type Tile = {
  value: number;
  id: string;
};

export type Matrix = {
  data: Tile[];
  size: {
    x: number;
    y: number;
  };
};

function isInverted(phase: PHASE): boolean {
  return [PHASE.RIGHT, PHASE.DOWN].includes(phase);
}

function isColumnar(phase: PHASE): boolean {
  return [PHASE.UP, PHASE.DOWN].includes(phase);
}

export function clone(game: Matrix): Matrix {
  return {
    size: { ...game.size },
    data: game.data.map((el) => ({ ...el })),
  };
}

export function createGame(x = 4, y = 4): Matrix {
  const game: Matrix = {
    size: { x, y },
    data: toTiles(Array(x * y).fill(0)),
  };

  return game;
}

type Pair = [number, number];

interface InsertRandomConfig {
  times: number;
  probability: Pair[];
}

export function probably(probabilities: Pair[]): number {
  const VALUE = 0;
  const WEIGHT = 1;

  const totalWeight = probabilities.reduce((mem, el) => mem + el[WEIGHT], 0);
  const lookup = probabilities
    .sort((a, b) => b[WEIGHT] - a[WEIGHT])
    .reduce((mem: Pair[], el): Pair[] => {
      const n: Pair = [el[VALUE], el[WEIGHT] / totalWeight];
      return [...mem, n];
    }, []);

  const weights = lookup.map((el) => el[1]);
  const results = lookup.map((el) => el[0]);

  const num = Math.random(),
    lastIndex = weights.length - 1;
  let s = 0;
  let result = results[lastIndex];

  for (let i = 0; i < lastIndex; ++i) {
    s += weights[i];
    if (num < s) {
      result = results[i];

      break;
    }
  }

  return result;
}

export function insertRandom(
  matrix: Matrix,
  config: Partial<InsertRandomConfig> = {}
): Matrix {
  const _config: InsertRandomConfig = {
    times: 1,
    probability: [
      [4, 1],
      [2, 9],
    ],
    ...config,
  };

  const data = [...matrix.data];

  for (let i = 0; i < _config.times; i++) {
    const zeroIndexes = getZeroIndexes(data.map((v) => v.value));
    const randIdx = getRandomElement(zeroIndexes);

    const value = probably(_config.probability);

    data[randIdx].value = value;
  }

  return {
    ...matrix,
    data,
  };
}

export function equal(a: Matrix, b: Matrix): boolean {
  return !a.data.some((v, i) => v.value !== b.data[i].value);
}

function toTiles(lst: number[], id: () => string = uuidv4): Tile[] {
  return lst.map((v) => ({ value: v, id: id() }));
}

export function mergeRow(lst: Tile[], phase: PHASE): Tile[] {
  const invert = isInverted(phase);
  const offset = !invert ? 1 : -1;
  const res: Tile[] = toTiles(Array(lst.length).fill(0));

  const maxIdx = lst.length - 1;

  for (let i = 0, cursor = 0; i < lst.length; i++) {
    // Invert the pointers when phase is inverted.
    const idx = !invert ? i : maxIdx - i;
    const curs = !invert ? cursor : maxIdx - cursor;

    // Calculate the adjacent index.
    let nextIdx = idx + offset;
    while (lst[nextIdx]?.value === 0) {
      nextIdx += offset;
    }

    const currTile = lst[idx];
    const nextTile = lst[nextIdx];

    if (currTile?.value !== 0) {
      res[curs] = currTile;
    }

    if (currTile?.value === nextTile?.value) {
      res[curs].value += nextTile.value;
      i += Math.abs(idx - nextIdx);
    }

    if (res[curs].value !== 0) {
      cursor++;
    }
  }

  return res;
}

export function splitGroups(matrix: Matrix, phase: PHASE): Tile[][] {
  const columnar = isColumnar(phase);
  const width = columnar ? matrix.size.x : matrix.size.y;

  const groups: Tile[][] = matrix.data.reduce((mem: Tile[][], v, i) => {
    const row = getY(i, width);
    const col = getX(i, width);
    const x = columnar ? col : row;
    const y = columnar ? row : col;

    if (mem[x] == null) mem[x] = [];

    mem[x][y] = v;

    return mem;
  }, []);

  return groups;
}

export function flattenGroups(groups: Tile[][], phase: PHASE): Tile[] {
  const columnar = isColumnar(phase);
  const size = groups.length * groups[0].length;

  const res = [];

  for (let i = 0; i < size; i++) {
    const row = getY(i, groups[0].length);
    const col = getX(i, groups[0].length);
    const x = columnar ? col : row;
    const y = columnar ? row : col;

    res[i] = groups[x][y];
  }
  return res;
}

export function merge(matrix: Matrix, phase: PHASE): Matrix {
  const groups = splitGroups(matrix, phase);
  const merged = groups.map((row) => mergeRow(row, phase));
  const data = flattenGroups(merged, phase);
  return { ...matrix, data };
}

export function getIdx(x: number, y: number, width = 4): number {
  return y * width + x;
}

export function getX(idx: number, width = 4): number {
  return idx % width;
}

export function getY(idx: number, width = 4): number {
  return Math.floor(idx / width);
}
