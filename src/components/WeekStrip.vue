<template>
  <div class="strip">
    <button
      v-for="d in days"
      :key="d.key"
      type="button"
      class="day"
      :class="[d.level, { selected: d.key === selected, today: d.key === today }]"
      :aria-label="d.label"
      :aria-pressed="d.key === selected"
      @click="$emit('select', d.key)"
    >
      <span class="weekday">{{ d.weekday }}</span>
      <span class="num">{{ d.num }}</span>
    </button>

    <button type="button" class="day more" aria-label="Ouvrir le calendrier" @click="$emit('open-calendar')">
      <ion-icon :icon="calendarOutline" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import { calendarOutline } from 'ionicons/icons';
import type { DayLevel } from '@/types';
import { dayNumber, formatLong, lastDays, weekdayShort } from '@/utils/calendar';

const props = defineProps<{
  today: string;
  selected: string;
  levelOf: (key: string) => DayLevel;
}>();
defineEmits<{
  (e: 'select', key: string): void;
  (e: 'open-calendar'): void;
}>();

const days = computed(() =>
  lastDays(props.today, 7).map((key) => ({
    key,
    weekday: weekdayShort(key),
    num: dayNumber(key),
    level: props.levelOf(key),
    label: formatLong(key),
  })),
);
</script>

<style scoped>
.strip {
  display: flex;
  gap: 6px;
  margin-top: 16px;
}
.day {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 0;
  border: 2px solid transparent;
  border-radius: 14px;
  background: var(--iman-card);
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.weekday {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--iman-text-soft);
}
.num {
  font-size: 16px;
  font-weight: 700;
}
/* Niveau d'accomplissement : trait coloré sous le chiffre */
.day.full {
  background: var(--iman-card-done);
  box-shadow: inset 0 -4px 0 var(--iman-emerald);
}
.day.partial {
  box-shadow: inset 0 -4px 0 var(--iman-gold);
}
.day.selected {
  border-color: var(--iman-gold);
}
.day.today .num {
  color: var(--iman-gold);
}
.more {
  flex: 0 0 44px;
  justify-content: center;
  font-size: 20px;
  color: var(--iman-gold);
}
</style>
