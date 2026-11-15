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
        <FftWindow title="Raté…">
          <div class="speaker">
            <span class="portrait" aria-hidden="true">📖</span>
            <div>
              <p class="miss">Ce n'était pas la bonne réponse. Voici ce qu'il faut retenir :</p>
              <p class="prompt">{{ found.encounter.prompt }}</p>
            </div>
          </div>
        </FftWindow>

        <FftWindow title="La bonne réponse">
          <p class="correct">{{ correctText }}</p>
          <p class="text">{{ found.encounter.lesson.text }}</p>
          <small v-if="found.encounter.lesson.source">{{ found.encounter.lesson.source }}</small>
        </FftWindow>

        <FftWindow title="Commandes">
          <router-link class="cmd" :to="`/tabs/rpg/q/${found.encounter.id}`" replace>
            <span class="cursor-mark" aria-hidden="true">▶</span> Réessayer
          </router-link>
        </FftWindow>
      </div>
      <div v-else class="wrap"><p>Leçon introuvable.</p></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import FftWindow from '@/components/FftWindow.vue';
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
  gap: 22px;
}
.speaker {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.portrait {
  flex: none;
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  font-size: 32px;
  border-radius: 16px;
  background: radial-gradient(circle at 30% 25%, #3b4fb8, #0c1337);
  box-shadow: 0 0 0 1px rgba(201, 209, 255, 0.45), 0 0 14px rgba(120, 150, 255, 0.45);
}
.miss {
  margin: 0 0 6px;
  color: #ffe08a;
  font-weight: 700;
}
.prompt {
  margin: 0;
  font-weight: 600;
  line-height: 1.5;
}
.correct {
  margin: 0 0 8px;
  font-weight: 700;
  color: #8dffbd;
}
.text {
  margin: 0 0 8px;
  line-height: 1.5;
}
small {
  color: #b9c4ff;
  font-size: 11px;
}
.cmd {
  display: block;
  padding: 10px 12px;
  border: 1px solid #c9d1ff;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffe08a;
  font-weight: 700;
  text-decoration: none;
}
.cursor-mark {
  display: inline-block;
  width: 1.2em;
}
</style>
