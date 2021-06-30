import { computed, ComputedRef, reactive, watch } from "vue";
import {
  Matrix,
  PHASE,
  createGame,
  equal,
  merge,
  insertRandom,
  clone,
} from "./gameplay";
import { getZeroIndexes } from "./util";

const calcScore = (game: Matrix) =>
  game.data.reduce((mem, { value }) => mem + value, 0);

export class Twenty48 {
  public game: Matrix;
  public playable: ComputedRef<boolean>;
  public score: ComputedRef<number>;

  constructor() {
    this.game = reactive<Matrix>(this.create());
    this.playable = computed(() => this.isPlayable());
    this.score = computed(() => calcScore(clone(this.game)));

    watch(this.score, (currScore, prevScore) => {
      if (currScore <= prevScore) {
        console.error(`Error ${prevScore}->${currScore}`);
      }
    });
  }

  create(): Matrix {
    let g = createGame();
    g = insertRandom(g, {
      times: 2,
    });

    return g;
  }

  reset(): void {
    Object.assign(this.game, this.create());
  }

  play(phase: PHASE, dryrun = false): Matrix {
    let nextGame = merge(clone(this.game), phase);

    if (!equal(nextGame, this.game)) {
      nextGame = insertRandom(nextGame);
    }

    if (!dryrun) Object.assign(this.game, nextGame);
    return nextGame;
  }

  isPlayable(): boolean {
    if (getZeroIndexes(this.game.data.map((v) => v.value)).length > 0)
      return true;
    return [PHASE.UP, PHASE.RIGHT, PHASE.DOWN, PHASE.LEFT].some(
      (phase) => !equal(this.game, this.play(phase, true))
    );
  }
}

export class Compress extends Twenty48 {
  create(): Matrix {
    const size = 4;
    let g: Matrix | undefined;

    // Alternate
    // const validScore = (Math.log(calcScore(game)) / Math.log(2)) % 1 !== 0;
    const validScore = (game: Matrix) => calcScore(game) !== 512;

    do {
      g = createGame(size, size);
      g = insertRandom(g, {
        times: size ** 2,
        probability: [
          [2, 6],
          [4, 2],
          [8, 1],
          [16, 0.5],
          [32, 0.25],
          [64, 0.125],
          [128, 0.125],
        ],
      });
    } while (validScore(g));

    if (g != null) {
      return g;
    } else {
      throw new Error("could not find a game");
    }
  }

  play(phase: PHASE, dryrun = false): Matrix {
    const nextGame = merge(clone(this.game), phase);
    if (!dryrun) Object.assign(this.game, nextGame);
    return nextGame;
  }

  isPlayable(): boolean {
    return true;
  }
}
