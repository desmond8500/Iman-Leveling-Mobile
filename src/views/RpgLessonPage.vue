<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/tabs/rpg/q/${id}`" text="" />
        </ion-buttons>
        <ion-title>Apprendre</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div v-if="found" class="wrap">
        <section class="card">
          <p class="emoji" aria-hidden="true">📖</p>
          <p class="miss">Ce n'était pas la bonne réponse. Voici ce qu'il faut retenir :</p>
          <p class="prompt">{{ found.encounter.prompt }}</p>
        </section>

        <section class="card good">
          <h2>La bonne réponse</h2>
          <p class="correct">{{ correctText }}</p>
          <p>{{ found.encounter.lesson.text }}</p>
          <small v-if="found.encounter.lesson.source">{{ found.encounter.lesson.source }}</small>
        </section>

        <router-link class="btn" :to="`/tabs/rpg/q/${found.encounter.id}`" replace>Réessayer</router-link>
      </div>
      <div v-else class="wrap"><p>Leçon introuvable.</p></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { useRpgStore } from '@/stores/rpg';
import { findEncounter } from '@/utils/rpg';

const props = defineProps<{ id: string }>();
const store = useRpgStore();

const found = computed(() => findEncounter(store.places, props.id));
const correctText = computed(() => found.value?.encounter.choices.find((c) => c.id === found.value?.encounter.correct)?.text ?? '');
</script>

<style scoped>
.wrap {
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card {
  padding: 16px;
  border-radius: 16px;
  background: var(--iman-card);
}
.card p {
  margin: 0 0 8px;
  line-height: 1.5;
}
.emoji {
  font-size: 36px;
  text-align: center;
}
.miss {
  color: var(--iman-gold);
}
.prompt {
  font-weight: 600;
}
.good {
  border: 2px solid var(--iman-emerald);
}
.good h2 {
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--iman-emerald);
}
.correct {
  font-weight: 700;
}
.good small {
  color: var(--iman-text-soft);
  font-size: 11px;
}
.btn {
  display: block;
  padding: 12px;
  border-radius: 14px;
  background: var(--iman-gold);
  color: #0f2a4a;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
}
</style>
