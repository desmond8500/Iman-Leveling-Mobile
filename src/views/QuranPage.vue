<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="settings.simpleMode ? '/tabs/home' : '/tabs/more'" text="" />
        </ion-buttons>
        <ion-title>Coran</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          :value="query"
          placeholder="Rechercher une sourate ou un numéro"
          :debounce="100"
          @ionInput="query = String($event.detail.value ?? '')"
        />
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <section class="goal" aria-label="Lecture du mois">
          <div class="goal-head">
            <strong>Lecture du mois</strong>
            <span>{{ reading.goal.read }} / {{ reading.goal.total }} versets</span>
          </div>
          <div class="bar" role="progressbar" :aria-valuenow="reading.goal.percent" aria-valuemin="0" aria-valuemax="100">
            <div class="fill" :style="{ width: reading.goal.percent + '%' }" />
          </div>
          <p class="goal-note">
            <template v-if="reading.goal.remaining === 0">Objectif atteint ce mois-ci, qu'Allah l'accepte.</template>
            <template v-else>
              Pour lire tout le Coran ce mois-ci : environ {{ reading.goal.perDay }} versets par jour
              ({{ reading.goal.daysLeft }} jours restants). Un verset est compté quand tu le dépasses en défilant.
            </template>
          </p>
          <router-link v-if="resume" :to="resume.link" class="resume">
            Reprendre : {{ resume.name }}, verset {{ resume.verse }} →
          </router-link>
        </section>

        <ul class="list">
          <li v-for="s in results" :key="s.number">
            <router-link :to="`/tabs/quran/${s.number}`" class="item">
              <span class="num">{{ s.number }}</span>
              <span class="text">
                <strong>{{ s.name }}</strong>
                <small>{{ s.verses }} versets</small>
              </span>
              <span class="ar" dir="rtl" lang="ar">{{ s.arabic }}</span>
            </router-link>
          </li>
        </ul>
        <p v-if="!results.length" class="empty">Aucune sourate trouvée.</p>
        <p class="note">
          Le texte est chargé depuis le service alquran.cloud à la première ouverture de chaque
          sourate, puis conservé sur l'appareil pour une lecture hors ligne.
        </p>
      </div>

      <ScrollTopButton slot="fixed" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import ScrollTopButton from '@/components/ScrollTopButton.vue';
import { computed, ref } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonSearchbar, IonTitle, IonToolbar } from '@ionic/vue';
import { searchSurahs, surahByNumber } from '@/data/surahs';
import { useReadingStore } from '@/stores/reading';
import { useSettingsStore } from '@/stores/settings';

const settings = useSettingsStore();
const reading = useReadingStore();
const resume = computed(() => {
  const b = reading.bookmark;
  const s = b && surahByNumber(b.surah);
  return b && s ? { name: s.name, verse: b.verse, link: `/tabs/quran/${b.surah}?v=${b.verse}` } : null;
});
const query = ref('');
const results = computed(() => searchSurahs(query.value));
</script>

<style scoped>
.goal {
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 16px;
  background: var(--iman-card);
}
.goal-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.goal-head span,
.goal-note {
  color: var(--iman-text-soft);
  font-size: 13px;
}
.bar {
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}
.fill {
  height: 100%;
  background: var(--iman-emerald);
  transition: width 0.3s;
}
.goal-note {
  margin: 8px 0 0;
}
.resume {
  display: inline-block;
  margin-top: 10px;
  color: var(--iman-gold);
  font-weight: 700;
  text-decoration: none;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}
@media (min-width: 900px) {
  .list {
    grid-template-columns: 1fr 1fr;
  }
}
.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--iman-card);
  color: inherit;
  text-decoration: none;
}
.num {
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--iman-card-done);
  color: var(--iman-gold);
  font-weight: 700;
  font-size: 13px;
}
.text {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.text small,
.note,
.empty {
  color: var(--iman-text-soft);
}
.ar {
  font-size: 20px;
}
.note {
  margin-top: 16px;
  font-size: 12px;
}
</style>
