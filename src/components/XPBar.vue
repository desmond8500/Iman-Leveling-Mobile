<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  xp: number;
  nextLevelXp: number;
}>();

const percentage = computed(() => {
  return Math.min((props.xp / props.nextLevelXp) * 100, 100);
});
</script>

<template>
  <div class="xp-container">
    <div class="xp-label">
      {{ xp }} / {{ nextLevelXp }} XP
    </div>

    <div class="xp-track">
      <div
        class="xp-fill"
        :style="{ width: percentage + '%' }"
      />
    </div>
  </div>
</template>

<style scoped>
.xp-track {
  height: 12px;
  border-radius: 999px;
  background: #29443a;
  overflow: hidden;
}

.xp-fill {
  height: 100%;
  background: linear-gradient(to right, #16a34a, #d4af37);
  transition: width .4s ease;
}

.xp-label{
  margin-bottom:6px;
  color:#d4af37;
  font-size:14px;
}
</style>