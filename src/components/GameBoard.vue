<template>
  <transition-group
    name="tiles"
    tag="div"
    :style="{ '--size-x': state.size.x, '--size-y': state.size.y }"
    :class="['gameboard']"
  >
    <div
      :class="['tile', `tile-${tile.value}`]"
      v-for="(tile, i) in state.data"
      :key="tile.id"
      :title="tile.id"
      :style="{
        'grid-row': `${getY(i, state.size.x) + 1}`,
        'grid-column': `${getX(i, state.size.y) + 1}`,
      }"
    >
      {{ tile.value ? tile.value : "" }}
    </div>
    <div class="gameover" v-if="!playable">
      <div>
        <p>game over</p>
        <button @click="$emit('restart')">restart</button>
      </div>
    </div>
  </transition-group>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import { getX, getY, Matrix } from "@/gameplay";

export default defineComponent({
  props: {
    state: {
      type: Object as PropType<Matrix>,
    },
    playable: {
      default: true,
    },
  },
  setup() {
    return {
      getX,
      getY,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@use "sass:list";

.gameboard {
  --tile-size: 120px;
  --size-x: 4;
  --size-y: 4;

  display: grid;
  grid-template-columns: repeat(var(--size-y), var(--tile-size));
  grid-template-rows: repeat(var(--size-x), var(--tile-size));
  row-gap: 8px;
  column-gap: 8px;
  background-color: #fff;
  padding: 8px;
  border-radius: 8px;

  position: relative;
}

.gameover {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #00000044;
  border-radius: 8px;

  display: flex;
  justify-content: center;
  align-items: center;
}

.tile {
  border-radius: 4px;
  height: 100%;
  width: 100%;

  display: grid;
  place-items: center;

  font-size: calc(var(--tile-size) / var(--size-y));
}

$colors: #e3e7f5, #c7ceea, #daf5eb, #b5ead7, #f1f8e5, #e2f0cb, #ffede0, #ffdac1,
  #ffdbd9, #ffb7b2, #ffcdd1, #ff9aa2;

@for $i from 1 through 12 {
  .tile-#{math.pow(2, $i)} {
    background-color: list.nth($colors, $i);
    color: scale-color(
      list.nth($colors, $i),
      $lightness: -50%,
      $saturation: -30%
    );
  }
}

.tiles-enter-from {
  opacity: 0;
}

.tiles-enter-active {
  transition: all 0.25s ease;
}

.tiles-move {
  transition: transform 0.125s ease;
}
</style>
