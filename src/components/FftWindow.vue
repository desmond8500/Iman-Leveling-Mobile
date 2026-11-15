<template>
  <section class="win" :aria-label="title || undefined">
    <span v-if="title" class="plate">{{ title }}</span>
    <div class="body"><slot /></div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>();
</script>

<style scoped>
/* Panneau de jeu moderne : verre dépoli sombre, liseré dégradé lumineux, titre en pastille. */
.win {
  position: relative;
  padding: 18px 16px 16px;
  border-radius: 18px;
  background: linear-gradient(160deg, rgba(40, 58, 140, 0.72), rgba(12, 19, 55, 0.82));
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  box-shadow:
    0 0 0 1px rgba(201, 209, 255, 0.35),
    0 0 22px rgba(90, 120, 255, 0.28),
    0 10px 24px rgba(0, 0, 0, 0.45);
  color: #f4f6ff;
  animation: rise 0.35s ease-out both;
}
.plate {
  position: absolute;
  top: -11px;
  left: 16px;
  padding: 2px 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, #ffe08a, #ffb84d);
  box-shadow: 0 2px 8px rgba(255, 184, 77, 0.5);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1a2150;
}
.body {
  position: relative;
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .win {
    animation: none;
  }
}
</style>
