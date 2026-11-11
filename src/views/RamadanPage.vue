<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/more" text="" />
        </ion-buttons>
        <ion-title>Ramadan</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <p v-if="!info" class="muted">Dates du Ramadan indisponibles.</p>
        <template v-else>
          <section class="hero">
            <h2>Ramadan {{ info.hijriYear }}</h2>
            <p class="status">{{ status }}</p>
            <p class="range">
              Du {{ fmt(days[0].date) }} au {{ fmt(lastDay.date) }}
              <span class="small">({{ lastDay.n }} jours)</span>
            </p>
            <p class="note">
              Les dates suivent le calendrier d'Oumm al-Qora ; elles peuvent varier d'un jour selon
              l'observation de la lune dans ton pays.
            </p>

            <div class="start-edit">
              <label for="ramadan-start">Premier jour du Ramadan</label>
              <input
                id="ramadan-start"
                type="date"
                :value="startKey"
                :min="minKey"
                :max="maxKey"
                @change="onStartChange"
              />
              <button v-if="info.overridden" type="button" class="link" @click="resetStart">
                Revenir au calendrier ({{ fmt(info.calendarStart) }})
              </button>
              <p class="note">Tu peux décaler la date de 3 jours au plus, selon l'annonce de ton pays.</p>
            </div>
          </section>

          <details
            v-for="block in RAMADAN_BLOCKS"
            :key="block.id"
            class="block"
            :class="progressOf(block).state"
            :open="progressOf(block).state !== 'done'"
          >
            <summary>
              <span class="b-title">
                <strong>{{ block.title }}</strong>
                <span class="b-ar" dir="rtl" lang="ar">{{ block.arabic }}</span>
              </span>
              <span class="b-meta">
                {{ block.range }} ·
                <template v-if="progressOf(block).state === 'done'">terminé ✓</template>
                <template v-else-if="progressOf(block).state === 'current'">
                  {{ progressOf(block).elapsed }} / {{ progressOf(block).total }} jours
                </template>
                <template v-else>à venir</template>
              </span>
            </summary>
            <div class="grid">
              <component
                :is="day.exists ? 'router-link' : 'div'"
                v-for="day in blockOf(days, block.from, block.to)"
                :key="day.n"
                :to="day.exists ? `/tabs/ramadan/${day.n}` : undefined"
                class="day"
                :class="[stateOf(day), { missing: !day.exists }]"
              >
                <span class="n">{{ day.n }}</span>
                <span class="g">{{ short(day.date) }}</span>
                <span v-if="stateOf(day) === 'today'" class="now">Aujourd'hui</span>
                <span v-else-if="stateOf(day) === 'past' && day.exists" class="tick">✓</span>
                <span v-if="day.oddLastTen && day.exists" class="star" title="Nuit impaire des dix derniers jours">★</span>
              </component>
            </div>
            <p v-if="block.id === 1" class="note">Touche un jour pour voir les prières surérogatoires à faire.</p>
            <p v-if="block.id === 3" class="note">
              ★ Nuits impaires des dix derniers jours : on y recherche la nuit du Destin (Laylat al-Qadr).
              Le 30ᵉ jour n'existe que si le mois compte 30 jours.
            </p>
          </details>
          <p class="note phases-note">
            Les trois phases (miséricorde, pardon, affranchissement du Feu) sont une répartition
            traditionnelle ; le hadith qui la rapporte est jugé faible par de nombreux savants.
          </p>
        </template>
      </div>

      <ScrollTopButton slot="fixed" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import ScrollTopButton from '@/components/ScrollTopButton.vue';
import { computed } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { useSettingsStore } from '@/stores/settings';
import { MONTHS_FR } from '@/utils/calendar';
import {
  RAMADAN_BLOCKS,
  blockOf,
  blockProgress,
  dayState,
  MAX_START_SHIFT_DAYS,
  daysBetween,
  ramadanDays,
  resolveRamadan,
  toKey,
  type RamadanDay,
} from '@/utils/ramadan';

const today = new Date();
const settings = useSettingsStore();
const info = computed(() => resolveRamadan(today, settings.ramadanStart));
const startKey = computed(() => (info.value ? toKey(info.value.start) : ''));
const shiftKey = (delta: number) =>
  info.value ? toKey(new Date(info.value.calendarStart.getFullYear(), info.value.calendarStart.getMonth(), info.value.calendarStart.getDate() + delta)) : '';
const minKey = computed(() => shiftKey(-MAX_START_SHIFT_DAYS));
const maxKey = computed(() => shiftKey(MAX_START_SHIFT_DAYS));

function onStartChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  if (value) void settings.setRamadanStart(value);
}
const resetStart = () => void settings.setRamadanStart(null);
const days = computed(() => (info.value ? ramadanDays(info.value.start) : []));
const lastDay = computed(() => [...days.value].reverse().find((d) => d.exists) ?? days.value[0]);

const fmt = (d: Date) => `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
const short = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
const stateOf = (d: RamadanDay) => dayState(d, today);
const progressOf = (block: (typeof RAMADAN_BLOCKS)[number]) => blockProgress(blockOf(days.value, block.from, block.to), today);
const isToday = (d: RamadanDay) => daysBetween(today, d.date) === 0;

const status = computed(() => {
  if (!days.value.length) return '';
  const toStart = daysBetween(today, days.value[0].date);
  if (toStart > 0) return toStart === 1 ? 'Commence demain' : `Commence dans ${toStart} jours`;
  const current = days.value.find(isToday);
  if (current?.exists) return `Aujourd'hui : jour ${current.n} sur ${lastDay.value.n}`;
  return 'Ramadan terminé';
});
</script>

<style scoped>
.hero {
  padding: 16px;
  border-radius: 20px;
  background: var(--iman-card);
  border: 1px solid rgba(242, 201, 76, 0.25);
}
.hero h2 {
  margin: 0 0 4px;
  font-size: 22px;
}
.status {
  margin: 0;
  color: var(--iman-gold);
  font-weight: 700;
}
.range {
  margin: 8px 0 0;
}
.small,
.muted {
  color: var(--iman-text-soft);
}
.note {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--iman-text-soft);
}
.start-edit {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.start-edit label {
  font-size: 13px;
  font-weight: 600;
}
.start-edit input {
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: var(--iman-bg-top);
  color: inherit;
  font: inherit;
  color-scheme: dark;
}
.link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--iman-gold);
  font: inherit;
  font-size: 13px;
  text-decoration: underline;
  cursor: pointer;
}
.block {
  margin-top: 20px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.day {
  color: inherit;
  text-decoration: none;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 2px;
  border-radius: 12px;
  background: var(--iman-card);
  border: 2px solid transparent;
}
.day .n {
  font-size: 18px;
  font-weight: 700;
}
.day .g {
  font-size: 11px;
  color: var(--iman-text-soft);
}
.day.past {
  background: var(--iman-card-done);
  opacity: 0.75;
}
.day.today {
  border-color: var(--iman-gold);
  background: rgba(242, 201, 76, 0.15);
}
.now {
  font-size: 9px;
  font-weight: 700;
  color: var(--iman-gold);
}
.tick {
  font-size: 10px;
  color: var(--iman-emerald);
}
summary {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
  padding: 0 4px;
  cursor: pointer;
  list-style: none;
}
summary::-webkit-details-marker {
  display: none;
}
.b-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 16px;
}
.b-ar {
  font-size: 18px;
  color: var(--iman-gold);
}
.b-meta {
  font-size: 12px;
  color: var(--iman-text-soft);
}
.block.current .b-meta {
  color: var(--iman-gold);
}
.phases-note {
  margin: 16px 4px 0;
}
.day.missing {
  opacity: 0.3;
}
.star {
  position: absolute;
  top: 2px;
  right: 5px;
  font-size: 10px;
  color: var(--iman-gold);
}
</style>
