import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';

/** Compteur d'images pour une animation de sprite. Reste sur la première image si « réduire les animations » est actif. */
export function useFrame(count: Ref<number>, interval: Ref<number>, phase = 0) {
  const frame = ref(0);
  let timer: ReturnType<typeof setInterval> | undefined;

  const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function restart() {
    if (timer) clearInterval(timer);
    frame.value = count.value > 0 ? phase % count.value : 0;
    if (reduced() || count.value < 2) {
      frame.value = 0;
      return;
    }
    timer = setInterval(() => {
      frame.value = (frame.value + 1) % count.value;
    }, interval.value);
  }

  onMounted(restart);
  watch([count, interval], restart);
  onBeforeUnmount(() => timer && clearInterval(timer));
  return frame;
}
