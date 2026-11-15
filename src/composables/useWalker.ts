import { onBeforeUnmount, ref } from 'vue';
import type { Point } from '@/utils/iso';
import { easeInOut, pathLength, pointAlong } from '@/utils/walk';

/**
 * Déplace un avatar le long d'une ligne brisée (animation requestAnimationFrame).
 * `speed` est en unités de la carte par seconde. Si l'utilisateur préfère moins
 * d'animations, l'avatar saute directement à l'arrivée.
 */
export function useWalker(initial: Point) {
  const pos = ref<Point>({ ...initial });
  const walking = ref(false);
  const facing = ref<1 | -1>(1);
  let frame = 0;

  const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function place(p: Point) {
    cancelAnimationFrame(frame);
    walking.value = false;
    pos.value = { ...p };
  }

  function walk(points: Point[], speed: number): Promise<void> {
    cancelAnimationFrame(frame);
    if (points.length < 2 || reduced()) {
      if (points.length) pos.value = { ...points[points.length - 1] };
      walking.value = false;
      return Promise.resolve();
    }
    const duration = Math.max(0.35, pathLength(points) / speed) * 1000;
    const startX = points[0].x;
    walking.value = true;
    return new Promise((resolve) => {
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const p = pointAlong(points, easeInOut(t));
        if (Math.abs(p.x - pos.value.x) > 0.01) facing.value = p.x >= pos.value.x ? 1 : -1;
        pos.value = p;
        if (t < 1) frame = requestAnimationFrame(step);
        else {
          walking.value = false;
          resolve();
        }
      };
      pos.value = { x: startX, y: points[0].y };
      frame = requestAnimationFrame(step);
    });
  }

  onBeforeUnmount(() => cancelAnimationFrame(frame));
  return { pos, walking, facing, walk, place };
}
