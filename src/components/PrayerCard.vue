<template>
  <button
    class="prayer"
    :class="{ done: prayer.done }"
    type="button"
    :disabled="disabled"
    @click="$emit('toggle')"
  >
    <ion-icon class="prayer-icon" :icon="icons[prayer.id]" />
    <span class="prayer-text">
      <span class="prayer-name">
        {{ prayer.name }}
        <span class="prayer-arabic" dir="rtl" lang="ar">{{ prayer.arabic }}</span>
      </span>
      <span class="prayer-hint">{{ prayer.hint }}</span>
    </span>
    <span v-if="time" class="prayer-time">{{ time }}</span>
    <span class="reward">+{{ prayer.reward }}</span>
    <ion-icon class="check" :icon="prayer.done ? checkmarkCircle : ellipseOutline" />
  </button>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import {
  checkmarkCircle,
  cloudyOutline,
  ellipseOutline,
  moonOutline,
  partlySunnyOutline,
  starOutline,
  sunnyOutline,
} from 'ionicons/icons';
import type { PrayerId } from '@/types';

defineProps<{
  prayer: {
    id: PrayerId;
    name: string;
    arabic: string;
    hint: string;
    done: boolean;
    reward: number;
  };
  /** Heure de la prière (« 05:48 »), quand la position est connue. */
  time?: string | null;
  disabled?: boolean;
}>();
defineEmits<{ (e: 'toggle'): void }>();

const icons: Record<PrayerId, string> = {
  fajr: partlySunnyOutline,
  dhuhr: sunnyOutline,
  asr: cloudyOutline,
  maghrib: moonOutline,
  isha: starOutline,
};
</script>

<style scoped>
.prayer {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: var(--iman-card);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.1s ease, background 0.2s ease, border-color 0.2s ease;
}
.prayer:active:not(:disabled) {
  transform: scale(0.98);
}
.prayer:disabled {
  cursor: default;
}
.prayer.done {
  background: var(--iman-card-done);
  border-color: var(--iman-emerald);
}
.prayer-icon {
  flex: none;
  font-size: 26px;
  color: var(--iman-gold);
}
.prayer-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.prayer-name {
  font-size: 17px;
  font-weight: 700;
}
.prayer-arabic {
  margin-left: 6px;
  font-size: 15px;
  font-weight: 400;
  color: var(--iman-text-soft);
}
.prayer-hint {
  font-size: 12px;
  color: var(--iman-text-soft);
}
.prayer-time {
  flex: none;
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.reward {
  flex: none;
  font-size: 12px;
  font-weight: 700;
  color: var(--iman-gold);
}
.check {
  flex: none;
  font-size: 28px;
  color: var(--iman-text-soft);
}
.prayer.done .check {
  color: var(--iman-emerald);
}
</style>
