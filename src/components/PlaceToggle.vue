<template>
  <div class="place" role="group" aria-label="Lieu de la prière">
    <span class="label">Lieu</span>
    <button
      type="button"
      class="opt"
      :class="{ on: !mosque }"
      :aria-pressed="!mosque"
      :disabled="disabled"
      @click="mosque && $emit('toggle')"
    >
      <ion-icon :icon="homeOutline" /> Maison <b>+{{ PRAYER_HOME_HASANAT }}</b>
    </button>
    <button
      type="button"
      class="opt"
      :class="{ on: mosque }"
      :aria-pressed="mosque"
      :disabled="disabled"
      @click="!mosque && $emit('toggle')"
    >
      <ion-icon :icon="businessOutline" /> Mosquée <b>+{{ PRAYER_MOSQUE_HASANAT }}</b>
    </button>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { businessOutline, homeOutline } from 'ionicons/icons';
import { PRAYER_HOME_HASANAT, PRAYER_MOSQUE_HASANAT } from '@/utils/hasanat';

defineProps<{ mosque: boolean; disabled?: boolean }>();
defineEmits<{ (e: 'toggle'): void }>();
</script>

<style scoped>
.place {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 28px;
}
.label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--iman-text-soft);
}
.opt {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: transparent;
  color: var(--iman-text-soft);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.opt b {
  color: var(--iman-gold);
}
.opt.on {
  border-color: var(--iman-emerald);
  background: rgba(46, 204, 154, 0.15);
  color: inherit;
}
.opt:disabled {
  cursor: default;
}
</style>
