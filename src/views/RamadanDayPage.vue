<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/ramadan" text="" />
        </ion-buttons>
        <ion-title>Jour {{ dayNumber }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <p v-if="!day" class="muted">Jour introuvable.</p>
        <template v-else>
          <section class="hero">
            <h2>{{ phase?.title }} · jour {{ day.n }}</h2>
            <p class="date">{{ longDate }}</p>
            <p v-if="day.oddLastTen" class="odd">★ Nuit impaire des dix derniers jours : on y recherche la nuit du Destin.</p>
          </section>

          <section v-if="day.oddLastTen" class="card qadr">
            <h3>{{ QADR_DUA.title }}</h3>
            <p class="arabic" dir="rtl" lang="ar">{{ QADR_DUA.arabic }}</p>
            <p class="phonetic">{{ QADR_DUA.phonetic }}</p>
            <p>{{ QADR_DUA.french }}</p>
            <span class="source">{{ QADR_DUA.source }}</span>
          </section>

          <h3 class="list-title">Prières surérogatoires à faire</h3>
          <ul class="list">
            <li v-for="p in NAFILA_PRAYERS" :key="p.id" class="card">
              <div class="head">
                <strong>{{ p.title }}</strong>
                <span class="rakaat">{{ p.rakaat }} rak'ah{{ p.rakaat === '2' ? 's' : '' }}</span>
              </div>
              <p class="when">{{ p.when }}</p>
              <p>{{ p.description }}</p>
              <span v-if="p.source" class="source">{{ p.source }}</span>
            </li>
          </ul>
          <p class="note">
            Le nombre de rak'ahs varie selon les écoles : en cas de doute, suis l'avis de ton imam.
          </p>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { NAFILA_PRAYERS, QADR_DUA } from '@/data/nafilaPrayers';
import { useSettingsStore } from '@/stores/settings';
import { WEEKDAYS_LONG, MONTHS_FR } from '@/utils/calendar';
import { RAMADAN_BLOCKS, ramadanDays, resolveRamadan } from '@/utils/ramadan';

// Le numéro du jour arrive par la route (props: true).
const props = defineProps<{ n: string | number }>();

const settings = useSettingsStore();
const dayNumber = computed(() => Number(props.n));
const info = computed(() => resolveRamadan(new Date(), settings.ramadanStart));
const day = computed(() => {
  if (!info.value) return null;
  const found = ramadanDays(info.value.start).find((d) => d.n === dayNumber.value);
  return found?.exists ? found : null;
});
const phase = computed(() => RAMADAN_BLOCKS.find((b) => day.value && day.value.n >= b.from && day.value.n <= b.to));
const longDate = computed(() => {
  const d = day.value?.date;
  return d ? `${WEEKDAYS_LONG[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}` : '';
});
</script>

<style scoped>
.hero,
.card {
  padding: 16px;
  border-radius: 18px;
  background: var(--iman-card);
}
.hero h2 {
  margin: 0;
  font-size: 20px;
}
.date,
.when,
.note,
.source,
.muted {
  color: var(--iman-text-soft);
}
.date {
  margin: 4px 0 0;
  text-transform: capitalize;
}
.odd {
  margin: 8px 0 0;
  color: var(--iman-gold);
  font-size: 13px;
}
.qadr {
  margin-top: 16px;
  border: 1px solid rgba(242, 201, 76, 0.35);
}
.qadr h3,
.list-title {
  margin: 0 0 8px;
  font-size: 16px;
}
.list-title {
  margin: 20px 4px 10px;
}
.arabic {
  margin: 6px 0;
  font-size: 22px;
  line-height: 1.9;
  text-align: right;
}
.phonetic {
  font-style: italic;
  color: var(--iman-emerald);
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card p {
  margin: 4px 0;
}
.head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.rakaat {
  flex: none;
  color: var(--iman-gold);
  font-weight: 700;
  font-size: 13px;
}
.when,
.source {
  font-size: 12px;
}
.note {
  margin: 14px 4px 0;
  font-size: 12px;
}
</style>
