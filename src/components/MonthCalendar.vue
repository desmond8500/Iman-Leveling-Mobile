<template>
  <div class="cal">
    <div class="nav">
      <button type="button" class="arrow" aria-label="Mois précédent" @click="go(-1)">
        <ion-icon :icon="chevronBack" />
      </button>
      <div class="title-box">
        <strong class="title">{{ label }}</strong>
        <span class="hijri-label">{{ hijriLabel }}</span>
      </div>
      <button
        type="button"
        class="arrow"
        aria-label="Mois suivant"
        :disabled="!canGoNext"
        @click="go(1)"
      >
        <ion-icon :icon="chevronForward" />
      </button>
    </div>

    <div class="grid head">
      <span v-for="(w, i) in WEEK_HEADER" :key="i">{{ w }}</span>
    </div>

    <div v-for="(week, wi) in weeks" :key="wi" class="grid">
      <template v-for="(key, di) in week" :key="di">
        <span v-if="!key" class="empty" />
        <button
          v-else
          type="button"
          class="cell"
          :class="[levelOf(key), { selected: key === selected, today: key === today }]"
          :disabled="key > today"
          :aria-label="formatLong(key)"
          @click="$emit('select', key)"
        >
          <span class="num">{{ dayNumber(key) }}</span>
          <span class="hj">{{ hijriDay(key) }}</span>
        </button>
      </template>
    </div>

    <ul class="legend">
      <li><span class="swatch full" /> 5 prières faites</li>
      <li><span class="swatch partial" /> Partiel</li>
      <li><span class="swatch none" /> Rien</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { IonIcon } from '@ionic/vue';
import { chevronBack, chevronForward } from 'ionicons/icons';
import type { DayLevel } from '@/types';
import { hijriMonthName, hijriRangeLabel, toHijri } from '@/utils/hijri';
import {
  WEEK_HEADER,
  buildMonthGrid,
  dayNumber,
  formatLong,
  monthLabel,
  parseKey,
  shiftMonth,
} from '@/utils/calendar';

const props = defineProps<{
  today: string;
  selected: string;
  levelOf: (key: string) => DayLevel;
}>();
defineEmits<{ (e: 'select', key: string): void }>();

// Le mois affiché démarre sur celui du jour sélectionné.
const start = parseKey(props.selected);
const view = ref({ year: start.getFullYear(), month: start.getMonth() });

const weeks = computed(() => buildMonthGrid(view.value.year, view.value.month));
const hijriLabel = computed(() => hijriRangeLabel(view.value.year, view.value.month));
/** Jour du mois hégirien ; le 1er du mois est écrit avec le nom du mois. */
const hijriDay = (key: string) => {
  const h = toHijri(parseKey(key));
  return h.day === 1 ? hijriMonthName(h.month).slice(0, 4) : String(h.day);
};
const label = computed(() => monthLabel(view.value.year, view.value.month));

const canGoNext = computed(() => {
  const t = parseKey(props.today);
  return view.value.year < t.getFullYear() ||
    (view.value.year === t.getFullYear() && view.value.month < t.getMonth());
});

function go(delta: number) {
  if (delta > 0 && !canGoNext.value) return;
  view.value = shiftMonth(view.value.year, view.value.month, delta);
}
</script>

<style scoped>
.cal {
  max-width: 420px;
  margin: 0 auto;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.title-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.title {
  text-transform: capitalize;
  font-size: 18px;
}
.hijri-label {
  font-size: 12px;
  color: var(--iman-gold);
}
.num {
  display: block;
  line-height: 1.1;
}
.hj {
  display: block;
  font-size: 10px;
  font-weight: 400;
  opacity: 0.75;
}
.arrow {
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: var(--iman-card);
  color: var(--iman-gold);
  font-size: 20px;
  cursor: pointer;
}
.arrow:disabled {
  opacity: 0.3;
  cursor: default;
}
.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 6px;
}
.head {
  text-align: center;
  font-size: 12px;
  color: var(--iman-text-soft);
}
.empty {
  aspect-ratio: 1;
}
.cell {
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 2px;
  background: var(--iman-card);
  color: inherit;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.cell.full {
  background: var(--iman-emerald);
  color: #06100e;
}
.cell.partial {
  background: rgba(242, 201, 76, 0.28);
}
.cell.selected {
  border-color: var(--iman-gold);
}
.cell.today {
  text-decoration: underline;
}
.cell:disabled {
  opacity: 0.25;
  cursor: default;
}
.legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  font-size: 12px;
  color: var(--iman-text-soft);
}
.legend li {
  display: flex;
  align-items: center;
  gap: 6px;
}
.swatch {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  background: var(--iman-card);
}
.swatch.full {
  background: var(--iman-emerald);
}
.swatch.partial {
  background: rgba(242, 201, 76, 0.5);
}
</style>
