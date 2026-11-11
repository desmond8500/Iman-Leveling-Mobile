<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/more" text="" />
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
import { searchSurahs } from '@/data/surahs';

const query = ref('');
const results = computed(() => searchSurahs(query.value));
</script>

<style scoped>
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
