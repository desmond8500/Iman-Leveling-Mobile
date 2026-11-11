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
          </section>

          <section v-for="block in RAMADAN_BLOCKS" :key="block.id" class="block">
            <h3>{{ block.title }}</h3>
            <div class="grid">
              <div
                v-for="day in blockOf(days, block.from, block.to)"
                :key="day.n"
                class="day"
                :class="{ today: isToday(day), past: isPast(day), missing: !day.exists }"
              >
                <span class="n">{{ day.n }}</span>
                <span class="g">{{ short(day.date) }}</span>
                <span v-if="day.oddLastTen && day.exists" class="star" title="Nuit impaire des dix derniers jours">★</span>
              </div>
            </div>
            <p v-if="block.id === 3" class="note">
              ★ Nuits impaires des dix derniers jours : on y recherche la nuit du Destin (Laylat al-Qadr).
              Le 30ᵉ jour n'existe que si le mois compte 30 jours.
            </p>
          </section>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { MONTHS_FR } from '@/utils/calendar';
import {
  RAMADAN_BLOCKS,
  blockOf,
  currentOrNextRamadan,
  daysBetween,
  ramadanDays,
  type RamadanDay,
} from '@/utils/ramadan';

const today = new Date();
const info = computed(() => currentOrNextRamadan(today));
const days = computed(() => (info.value ? ramadanDays(info.value.start) : []));
const lastDay = computed(() => [...days.value].reverse().find((d) => d.exists) ?? days.value[0]);

const fmt = (d: Date) => `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
const short = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
const isToday = (d: RamadanDay) => daysBetween(today, d.date) === 0;
const isPast = (d: RamadanDay) => daysBetween(today, d.date) < 0;

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
.block {
  margin-top: 20px;
}
.block h3 {
  margin: 0 4px 8px;
  font-size: 15px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.day {
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
}
.day.today {
  border-color: var(--iman-gold);
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
