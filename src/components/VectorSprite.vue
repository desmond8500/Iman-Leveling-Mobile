<template>
  <svg
    class="vsprite"
    :class="[anim, { still: portrait }]"
    :viewBox="viewBox"
    :width="w"
    :height="h"
    :style="{ '--d': `${-phase * 0.37}s` }"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >
    <g :transform="facing < 0 ? `translate(${VS_W} 0) scale(-1 1)` : undefined">
      <g class="leg l"><VectorShapes :shapes="parts.legL" /></g>
      <g class="leg r"><VectorShapes :shapes="parts.legR" /></g>
      <g class="upper">
        <VectorShapes :shapes="parts.body" />
        <g class="arm l"><VectorShapes :shapes="parts.armL" /></g>
        <g class="arm r"><VectorShapes :shapes="parts.armR" /></g>
        <VectorShapes :shapes="parts.head" />
        <g class="eyes"><VectorShapes :shapes="parts.eyes" /></g>
        <VectorShapes :shapes="parts.top" />
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VectorShapes from '@/components/VectorShapes.vue';
import type { Look, SpriteAnim } from '@/utils/sprite';
import { PORTRAIT_BOX, spriteParts, VS_H, VS_W } from '@/utils/vectorSprite';

/**
 * Personnage en vector art. Mêmes réglages que l'ancien sprite en pixel art : `px` fixe la taille
 * (largeur = 16 × px, hauteur = 25 × px), `facing` = -1 le retourne, `phase` décale les animations.
 * `portrait` cadre la tête et les épaules dans un carré de `size` pixels.
 */
const props = withDefaults(
  defineProps<{ look: Look; anim?: SpriteAnim; px?: number; facing?: 1 | -1; phase?: number; label?: string; portrait?: boolean; size?: number }>(),
  {
    anim: 'idle',
    px: 3,
    facing: 1,
    phase: 0,
    label: undefined,
    portrait: false,
    size: undefined,
  },
);

const parts = computed(() => spriteParts(props.look));
const k = computed(() => props.px * (props.look.scale ?? 1));
const viewBox = computed(() =>
  props.portrait ? `${PORTRAIT_BOX.x} ${PORTRAIT_BOX.y} ${PORTRAIT_BOX.size} ${PORTRAIT_BOX.size}` : `0 0 ${VS_W} ${VS_H}`,
);
const w = computed(() => (props.portrait ? (props.size ?? 16 * props.px) : 16 * k.value));
const h = computed(() => (props.portrait ? (props.size ?? 16 * props.px) : 25 * k.value));
</script>

<style scoped>
.vsprite {
  overflow: visible;
}
.vsprite g {
  transform-box: view-box;
}
.leg.l {
  transform-origin: 26px 72px;
}
.leg.r {
  transform-origin: 38px 72px;
}
.arm.l {
  transform-origin: 16px 50px;
}
.arm.r {
  transform-origin: 48px 50px;
}
.eyes {
  transform-origin: 32px 33px;
  animation: blink 4.6s infinite;
  animation-delay: var(--d);
}
.idle .upper {
  animation: breathe 1.6s ease-in-out infinite alternate;
  animation-delay: var(--d);
}
.idle .arm.l {
  animation: sway 1.6s ease-in-out infinite alternate;
  animation-delay: var(--d);
}
.idle .arm.r {
  animation: sway 1.6s ease-in-out infinite alternate-reverse;
  animation-delay: var(--d);
}
.walk .upper {
  animation: bounce 0.26s ease-in-out infinite alternate;
}
.walk .leg.l,
.walk .arm.r {
  animation: swing 0.52s ease-in-out infinite alternate;
}
.walk .leg.r,
.walk .arm.l {
  animation: swing 0.52s ease-in-out infinite alternate-reverse;
}
.still .upper,
.still .arm {
  animation: none;
}
@keyframes breathe {
  to {
    transform: translateY(0.9px);
  }
}
@keyframes bounce {
  to {
    transform: translateY(-1.6px);
  }
}
@keyframes sway {
  from {
    transform: rotate(-2deg);
  }
  to {
    transform: rotate(2deg);
  }
}
@keyframes swing {
  from {
    transform: rotate(-16deg);
  }
  to {
    transform: rotate(16deg);
  }
}
@keyframes blink {
  0%,
  94%,
  100% {
    transform: scaleY(1);
  }
  97% {
    transform: scaleY(0.1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .vsprite g {
    animation: none !important;
  }
}
</style>
