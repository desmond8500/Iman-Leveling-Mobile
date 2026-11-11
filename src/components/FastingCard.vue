<template>
  <section class="fast" :class="{ done: fasted, forbidden: info.forbidden }">
    <div class="text">
      <strong>Jeûne</strong>
      <small>{{ hint }}</small>
    </div>
    <button
      type="button"
      class="check"
      :class="{ on: fasted }"
      :disabled="disabled || info.forbidden"
      :aria-pressed="fasted"
      :aria-label="fasted ? 'Jeûné : décocher' : 'Marquer comme jeûné'"
      @click="$emit('toggle')"
    >
      <ion-icon :icon="fasted ? checkmarkCircle : ellipseOutline" />
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import { checkmarkCircle, ellipseOutline } from 'ionicons/icons';
import type { FastingInfo } from '@/utils/fasting';
import { FAST_HASANAT } from '@/utils/hasanat';

const props = defineProps<{ info: FastingInfo; fasted: boolean; disabled?: boolean }>();
defineEmits<{ (e: 'toggle'): void }>();

const hint = computed(() => {
  const i = props.info;
  if (i.forbidden) return "Jeûne interdit ce jour (Aïd et jours de tachriq).";
  const gain = `+${FAST_HASANAT}`;
  if (i.ramadan) return `Jeûne de Ramadan (obligatoire) · ${gain}`;
  if (i.white) return `Jour blanc : jeûne recommandé · ${gain}`;
  if (i.weekly) return `Lundi ou jeudi : jeûne recommandé · ${gain}`;
  return `Jeûne surérogatoire · ${gain}`;
});
</script>

<style scoped>
.fast {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 16px;
  background: var(--iman-card);
  border: 1px solid transparent;
}
.fast.done {
  background: var(--iman-card-done);
  border-color: var(--iman-emerald);
}
.fast.forbidden {
  opacity: 0.6;
}
.text {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.text small {
  color: var(--iman-text-soft);
}
.check {
  background: none;
  border: 0;
  padding: 0;
  font-size: 30px;
  color: var(--iman-text-soft);
  cursor: pointer;
}
.check.on {
  color: var(--iman-emerald);
}
.check:disabled {
  cursor: default;
}
</style>
