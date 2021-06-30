<template>
  <div>
    <div class="scoreboard">
      score: {{ score }} plays: {{ playCount }}
      <button @click="toggleFullscreen" v-if="!isFullscreen">fullscreen</button>
      <button @click="reset">reset</button>
    </div>
    <GameBoard :state="game" :playable="playable" @restart="reset" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import GameBoard from "./components/GameBoard.vue";
import { PHASE } from "./gameplay";
import { useFullscreen, useKey, useParam, useSeed } from "./hooks";
import { Twenty48 } from "./gamemode";

export default defineComponent({
  name: "App",

  components: {
    GameBoard,
  },

  setup() {
    const seed = useParam("seed");
    const { reset: resetSeed } = useSeed(seed);
    const { toggleFullscreen, isFullscreen } = useFullscreen();
    const playCount = ref(0);

    const zgame = new Twenty48();

    function play(phase: PHASE) {
      playCount.value++;
      zgame.play(phase);
    }

    useKey("ArrowUp", () => play(PHASE.UP));
    useKey("ArrowDown", () => play(PHASE.DOWN));
    useKey("ArrowLeft", () => play(PHASE.LEFT));
    useKey("ArrowRight", () => play(PHASE.RIGHT));

    return {
      reset: () => {
        resetSeed();
        zgame.reset();
      },
      game: zgame.game,
      playable: zgame.playable,
      score: zgame.score,
      toggleFullscreen,
      isFullscreen,
      playCount,
    };
  },
});
</script>

<style>
body,
#app {
  background: #efefef;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

#app {
  display: grid;
  place-items: center;
}

.scoreboard {
  font-size: 24px;
  margin: 8px 0;
}
</style>
