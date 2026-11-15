<template>
  <div class="confetti" aria-hidden="true">
    <i v-for="n in 28" :key="n" :style="style(n)" />
  </div>
</template>

<script setup lang="ts">
const COLORS = ['#ffe08a', '#8dffbd', '#9db4ff', '#ff9ec7', '#ffffff'];
/** Pluie de confettis : positions déterministes (pas d'aléatoire, rendu stable). */
function style(n: number) {
  return {
    left: `${(n * 37) % 100}%`,
    background: COLORS[n % COLORS.length],
    animationDelay: `${((n * 53) % 60) / 100}s`,
    animationDuration: `${1.4 + ((n * 29) % 10) / 10}s`,
    transform: `rotate(${(n * 47) % 360}deg)`,
  };
}
</script>

<style scoped>
.confetti {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 50;
}
i {
  position: absolute;
  top: -14px;
  width: 8px;
  height: 14px;
  border-radius: 2px;
  animation: fall linear forwards;
}
@keyframes fall {
  to {
    top: 105%;
    opacity: 0.2;
  }
}
@media (prefers-reduced-motion: reduce) {
  .confetti {
    display: none;
  }
}
</style>
