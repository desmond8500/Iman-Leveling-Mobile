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
/* Fenêtre de jeu de rôle tactique : dégradé bleu nuit, double liseré clair, titre en onglet. */
.win {
  position: relative;
  padding: 16px 14px 14px;
  border: 2px solid #c9d1ff;
  border-radius: 10px;
  background: linear-gradient(180deg, #2a3b8f 0%, #16215a 55%, #0c1337 100%);
  box-shadow:
    0 0 0 2px #25326f,
    inset 0 0 0 2px rgba(255, 255, 255, 0.12),
    0 6px 16px rgba(0, 0, 0, 0.45);
  color: #f4f6ff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.6);
}
.plate {
  position: absolute;
  top: -12px;
  left: 14px;
  padding: 1px 10px;
  border: 2px solid #c9d1ff;
  border-radius: 6px;
  background: #16215a;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #ffe08a;
}
.body {
  position: relative;
}
</style>
