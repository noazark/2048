import { isRef, onMounted, onUnmounted, Ref, ref, watch } from "vue";
import seedrandom from "seedrandom";
import { uuidv4 } from "./util";

export function useKey(key: string, cb: () => void): void {
  const conditionalCb = (evt: KeyboardEvent) => {
    if (evt.key === key) {
      cb();
    }
  };

  onMounted(() => {
    document.addEventListener("keyup", conditionalCb);
  });

  onUnmounted(() => {
    document.removeEventListener("keyup", conditionalCb);
  });
}

interface FullscreenHookResult {
  toggleFullscreen: () => void;
  isFullscreen: Ref<boolean>;
}

export function useFullscreen(): FullscreenHookResult {
  const isFullscreen = ref(!!document.fullscreenElement);

  const cb = () => {
    isFullscreen.value = !!document.fullscreenElement;
  };

  onMounted(() => {
    document.addEventListener("fullscreenchange", cb);
  });

  onUnmounted(() => {
    document.removeEventListener("fullscreenchange", cb);
  });

  function toggleFullscreen() {
    const elem = document.querySelector("#app");

    if (elem && !document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        alert(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
    } else {
      document.exitFullscreen();
    }
  }

  return {
    toggleFullscreen,
    isFullscreen,
  };
}

interface SeedHookResult {
  seed: Ref<string | undefined>;
  reset: (v?: string) => string;
}
export function useSeed(v?: Ref<string | undefined> | string): SeedHookResult {
  const seed = ref(v || uuidv4());

  function reset(v?: string): string {
    const s = v || uuidv4();

    if (isRef(seed)) {
      seed.value = s;
    }

    seedrandom(s, { global: true });

    return s;
  }

  reset(seed.value);

  return {
    seed,
    reset,
  };
}

export function useParam(name: string): Ref<string | undefined> {
  const qps = new URLSearchParams(window.location.search);
  const seed = ref(qps.get(name) || undefined);

  watch(
    seed,
    (val) => {
      if (val) qps.set(name, val);
      else qps.delete(name);

      const url = window.location.pathname + "?" + qps.toString();
      window.history.replaceState(null, "", url);
    },
    { immediate: true }
  );

  return seed;
}
