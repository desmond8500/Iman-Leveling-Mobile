<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Noms d'Allah</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          :value="query"
          placeholder="Rechercher un nom, un sens, un numéro"
          :debounce="100"
          @ionInput="query = String($event.detail.value ?? '')"
        />
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <section class="verse">
          <p class="verse-ar" dir="rtl" lang="ar">{{ NAMES_VERSE.arabic }}</p>
          <p class="verse-fr">{{ NAMES_VERSE.french }}</p>
          <p class="verse-ref">{{ NAMES_VERSE.reference }}</p>
        </section>

        <ul class="list">
          <li v-for="name in results" :key="name.n">
            <router-link class="row" :to="`/tabs/names/${name.n}`">
              <span class="num">{{ name.n }}</span>
              <span class="text">
                <span class="translit">{{ name.translit }}</span>
                <span class="french">{{ name.french }}</span>
              </span>
              <span class="arabic" dir="rtl" lang="ar">{{ name.arabic }}</span>
            </router-link>
          </li>
        </ul>

        <p v-if="results.length === 0" class="empty">Aucun nom trouvé.</p>

        <p class="note">
          Liste selon l'énumération transmise par At-Tirmidhi. Les savants discutent de cette
          énumération, et certaines listes diffèrent légèrement.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { IonContent, IonHeader, IonPage, IonSearchbar, IonTitle, IonToolbar } from '@ionic/vue';
import { NAMES_VERSE, searchNames } from '@/data/names';

const query = ref('');
const results = computed(() => searchNames(query.value));
</script>

<style scoped>
.wrap {
  max-width: 560px;
  margin: 0 auto;
  padding: 16px;
}
.verse {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid rgba(242, 201, 76, 0.25);
  border-radius: 18px;
  background: var(--iman-card);
  text-align: center;
}
.verse-ar {
  margin: 0 0 8px;
  font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', 'Geeza Pro', serif;
  font-size: 22px;
  line-height: 1.9;
}
.verse-fr {
  margin: 0;
  font-size: 14px;
}
.verse-ref {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--iman-gold);
}
.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: var(--iman-card);
  color: inherit;
  text-decoration: none;
}
.num {
  flex: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(242, 201, 76, 0.15);
  color: var(--iman-gold);
  font-size: 13px;
  font-weight: 700;
}
.text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.translit {
  font-weight: 700;
}
.french {
  font-size: 12px;
  color: var(--iman-text-soft);
}
.arabic {
  flex: none;
  font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', 'Geeza Pro', serif;
  font-size: 24px;
}
.empty,
.note {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--iman-text-soft);
}
</style>
