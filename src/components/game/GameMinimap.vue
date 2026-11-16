<template>
  <router-link to="/tabs/rpg" class="minimap" aria-label="Ouvrir la carte du parcours">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <rect width="100" height="100" fill="#cfd8c0" />
      <path d="M0 30 H100 M0 70 H100 M30 0 V100 M70 0 V100" stroke="#ffffff" stroke-width="7" />
      <rect x="6" y="6" width="18" height="18" rx="2" fill="#9fc98a" />
      <rect x="76" y="40" width="18" height="24" rx="2" fill="#9fc98a" />
      <rect x="40" y="76" width="22" height="18" rx="2" fill="#b9c4d8" />
      <polyline :points="route" fill="none" stroke="#ffb84d" stroke-width="3" stroke-dasharray="4 3" stroke-linecap="round" />
      <g v-for="(p, i) in places" :key="p.id">
        <rect :x="p.map.x - 7" :y="p.map.y - 7" width="14" height="14" rx="3" :class="['spot', statusOf(i)]" />
      </g>
      <circle v-if="here" :cx="here.x" :cy="here.y" r="5" class="me" />
    </svg>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RpgPlace } from '@/utils/rpg';

/** Petite carte du parcours (en haut à droite de l'écran de jeu) : un point clignotant indique où tu es. */
const props = defineProps<{ places: readonly RpgPlace[]; statusOf: (i: number) => string; currentId?: string }>();

const route = computed(() => props.places.map((p) => `${p.map.x},${p.map.y}`).join(' '));
const here = computed(() => props.places.find((p) => p.id === props.currentId)?.map ?? null);
</script>

<style scoped>
.minimap {
  display: block;
  width: 62px;
  height: 62px;
  border: 2px solid #e9ecf7;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 0 2px rgba(14, 20, 48, 0.7), 0 6px 14px rgba(0, 0, 0, 0.4);
}
svg {
  display: block;
  width: 100%;
  height: 100%;
}
.spot {
  fill: #8e93a8;
  stroke: #2b1b17;
  stroke-width: 1.5;
}
.spot.open {
  fill: #ffd34d;
}
.spot.cleared {
  fill: #4fbf6a;
}
.me {
  fill: #e2302f;
  stroke: #fff;
  stroke-width: 2;
  animation: blink 1s steps(2) infinite;
}
@keyframes blink {
  50% {
    opacity: 0.25;
  }
}
@media (prefers-reduced-motion: reduce) {
  .me {
    animation: none;
  }
}
</style>
