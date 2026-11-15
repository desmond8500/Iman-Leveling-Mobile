<template>
  <svg :viewBox="`0 0 ${SPRITE_W} ${SPRITE_H}`" :width="w" :height="h" shape-rendering="crispEdges" :role="label ? 'img' : undefined" :aria-label="label" :aria-hidden="label ? undefined : 'true'">
    <g :transform="facing < 0 ? `translate(${SPRITE_W} 0) scale(-1 1)` : undefined">
      <path v-for="p in current" :key="p.fill" :d="p.d" :fill="p.fill" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFrame } from '@/composables/useFrame';
import { frameInterval, SPRITE_H, SPRITE_W, spritePaths, type Look, type SpriteAnim } from '@/utils/sprite';

/** Personnage en pixel art. `px` = taille d'un pixel du dessin ; `facing` = -1 pour le retourner. */
const props = withDefaults(defineProps<{ look: Look; anim?: SpriteAnim; px?: number; facing?: 1 | -1; phase?: number; label?: string }>(), {
  anim: 'idle',
  px: 3,
  facing: 1,
  phase: 0,
  label: undefined,
});

const frames = computed(() => spritePaths(props.look, props.anim));
const count = computed(() => frames.value.length);
const interval = computed(() => frameInterval(props.anim));
const frame = useFrame(count, interval, props.phase);
const current = computed(() => frames.value[frame.value % frames.value.length]);

const k = computed(() => props.px * (props.look.scale ?? 1));
const w = computed(() => SPRITE_W * k.value);
const h = computed(() => SPRITE_H * k.value);
</script>
