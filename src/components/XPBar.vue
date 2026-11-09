<template>
  <div class="xp-bar">
    <div class="xp-track" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
      <div class="xp-fill" :style="{ width: percent + '%' }" />
    </div>
    <div class="xp-label">{{ xpIntoLevel }} / {{ xpForNext }} XP</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ xpIntoLevel: number; xpForNext: number }>();

const percent = computed(() =>
  props.xpForNext > 0 ? Math.min(100, Math.round((props.xpIntoLevel / props.xpForNext) * 100)) : 0,
);
</script>

<style scoped>
.xp-track {
  height: 14px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.xp-fill {
  height: 100%;
  border-radius: 7px;
  background: linear-gradient(90deg, var(--iman-emerald), var(--iman-gold));
  transition: width 0.5s ease;
}
.xp-label {
  margin-top: 6px;
  font-size: 12px;
  color: var(--iman-text-soft);
  text-align: right;
}
</style>
