<template>
  <div class="hasanat-bar">
    <div class="track" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
      <div class="fill" :style="{ width: percent + '%' }" />
    </div>
    <div class="label">{{ hasanatIntoLevel }} / {{ hasanatForNext }} Hasanat</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ hasanatIntoLevel: number; hasanatForNext: number }>();

const percent = computed(() =>
  props.hasanatForNext > 0
    ? Math.min(100, Math.round((props.hasanatIntoLevel / props.hasanatForNext) * 100))
    : 0,
);
</script>

<style scoped>
.track {
  height: 14px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 7px;
  background: linear-gradient(90deg, var(--iman-emerald), var(--iman-gold));
  transition: width 0.5s ease;
}
.label {
  margin-top: 6px;
  font-size: 12px;
  color: var(--iman-text-soft);
  text-align: right;
}
</style>
