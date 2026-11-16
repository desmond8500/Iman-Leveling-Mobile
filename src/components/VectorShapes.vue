<template>
  <g>
    <component :is="s.tag" v-for="(s, i) in shapes" :key="i" v-bind="s.attrs">{{ s.text ?? '' }}</component>
  </g>
</template>

<script setup lang="ts">
import type { Shape } from '@/utils/vector';

/** Affiche une liste de formes vectorielles (à placer dans un `<svg>`). */
defineProps<{ shapes: readonly Shape[] }>();
</script>
