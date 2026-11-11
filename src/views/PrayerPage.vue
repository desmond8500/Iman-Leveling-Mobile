<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/more" text="" />
        </ion-buttons>
        <ion-title>Prière</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <section class="card">
          <h2>Les 5 prières</h2>
          <ul class="prayers">
            <li v-for="p in PRAYERS" :key="p.id">
              <div class="p-head">
                <strong>{{ p.name }}</strong>
                <span class="ar" dir="rtl" lang="ar">{{ p.arabic }}</span>
                <span v-if="timeOf(p.id)" class="time">{{ timeOf(p.id) }}</span>
              </div>
              <p class="detail">
                {{ FARD_RAKAAT[p.id] }} rak'ahs obligatoires
                <template v-if="p.before.length || p.after.length">
                  ·
                  <template v-for="(s, i) in [...p.before, ...p.after]" :key="s.id">
                    {{ i ? ', ' : '' }}{{ s.name.toLowerCase() }} ({{ s.rakaat }})
                  </template>
                </template>
              </p>
            </li>
          </ul>
          <p class="hint">
            Le nombre de rak'ahs des sunnas varie selon les écoles. Les heures dépendent de ta
            position (voir Paramètres).
          </p>
        </section>

        <section class="card">
          <h2>Les ablutions (woudou')</h2>
          <ol class="steps">
            <li v-for="s in WUDU_STEPS" :key="s.title">
              <strong>{{ s.title }}</strong>
              <span>{{ s.text }}</span>
            </li>
          </ol>
        </section>

        <section class="card">
          <h2>Invocations des ablutions</h2>
          <ul class="invocs">
            <li v-for="i in WUDU_INVOCATIONS" :key="i.id" class="invoc">
              <div class="i-head">
                <strong>{{ i.title }}</strong>
                <span v-if="i.count > 1" class="count">×{{ i.count }}</span>
              </div>
              <span class="when">{{ i.when }}</span>
              <p class="arabic" dir="rtl" lang="ar">{{ i.arabic }}</p>
              <p class="phonetic">{{ i.phonetic }}</p>
              <p class="french">{{ i.french }}</p>
              <span class="source">{{ i.source }}</span>
            </li>
          </ul>
        </section>

        <section class="card">
          <h2>Déroulement de la prière</h2>
          <ol class="steps">
            <li v-for="s in PRAYER_STEPS" :key="s.title">
              <strong>{{ s.title }}</strong>
              <span>{{ s.text }}</span>
            </li>
          </ol>
          <p class="hint">
            Ce résumé ne remplace pas un apprentissage auprès d'une personne qualifiée.
          </p>
        </section>

        <section class="card">
          <h2>Invocations après la prière</h2>
          <ul class="invocs">
            <li v-for="i in AFTER_PRAYER_INVOCATIONS" :key="i.id" class="invoc">
              <div class="i-head">
                <strong>{{ i.title }}</strong>
                <span v-if="i.count > 1" class="count">×{{ i.count }}</span>
              </div>
              <span class="when">{{ i.when }}</span>
              <p class="arabic" dir="rtl" lang="ar">{{ i.arabic }}</p>
              <p class="phonetic">{{ i.phonetic }}</p>
              <p class="french">{{ i.french }}</p>
              <span class="source">{{ i.source }}</span>
            </li>
          </ul>
          <p class="hint">
            Tu peux aussi réciter Ayat al-Kursi après chaque prière (voir l'onglet Invocations).
          </p>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { PRAYERS } from '@/data/prayers';
import {
  AFTER_PRAYER_INVOCATIONS,
  FARD_RAKAAT,
  PRAYER_STEPS,
  WUDU_INVOCATIONS,
  WUDU_STEPS,
} from '@/data/prayerGuide';
import { useSettingsStore } from '@/stores/settings';
import type { PrayerId } from '@/types';
import { computePrayerTimes, formatTime } from '@/utils/prayerTimes';

const settings = useSettingsStore();
const times = computed(() =>
  settings.location ? computePrayerTimes(new Date(), settings.location, { method: settings.prayerMethod }) : null,
);
const timeOf = (id: PrayerId) => {
  const d = times.value?.[id];
  return d ? formatTime(d) : null;
};
</script>

<style scoped>
.card {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 18px;
  background: var(--iman-card);
}
h2 {
  margin: 0 0 12px;
  font-size: 18px;
}
.prayers,
.steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.steps {
  counter-reset: step;
}
.steps li {
  counter-increment: step;
  display: flex;
  flex-direction: column;
  padding-left: 34px;
  position: relative;
}
.steps li::before {
  content: counter(step);
  position: absolute;
  left: 0;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--iman-card-done);
  color: var(--iman-gold);
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.steps span,
.detail,
.hint {
  color: var(--iman-text-soft);
  font-size: 13px;
}
.p-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.ar {
  font-size: 18px;
}
.time {
  margin-left: auto;
  color: var(--iman-gold);
  font-weight: 700;
}
.detail {
  margin: 2px 0 0;
}
.invocs {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.i-head {
  display: flex;
  justify-content: space-between;
}
.count {
  color: var(--iman-gold);
  font-weight: 700;
}
.when,
.source {
  font-size: 12px;
  color: var(--iman-text-soft);
}
.arabic {
  margin: 8px 0;
  font-size: 22px;
  line-height: 1.9;
  text-align: right;
}
.phonetic {
  margin: 0 0 4px;
  font-style: italic;
  color: var(--iman-emerald);
}
.french {
  margin: 0 0 4px;
}
.hint {
  margin: 12px 0 0;
}
</style>
