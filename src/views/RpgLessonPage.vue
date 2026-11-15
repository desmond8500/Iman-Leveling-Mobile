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

    <ion-content class="scene-content" :fullscreen="true">
      <p v-if="!found" class="warn">Leçon introuvable.</p>
      <DialogueBox v-else name="Leçon" :text="dialogue" portrait="📖" :terrain="found.place.terrain">
        <small v-if="found.encounter.lesson.source" class="source">{{ found.encounter.lesson.source }}</small>
        <router-link class="choice" :to="`/tabs/rpg/q/${found.encounter.id}`" replace>▶ Réessayer</router-link>
      </DialogueBox>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import DialogueBox from '@/components/DialogueBox.vue';
import { useRpgStore } from '@/stores/rpg';
import { findEncounter } from '@/utils/rpg';

const props = defineProps<{ id: string }>();
const store = useRpgStore();

const found = computed(() => findEncounter(store.places, props.id));
const correctText = computed(() => found.value?.encounter.choices.find((c) => c.id === found.value?.encounter.correct)?.text ?? '');
const dialogue = computed(() =>
  found.value ? `Ce n'était pas la bonne réponse.\n\nLa bonne réponse : ${correctText.value}\n\n${found.value.encounter.lesson.text}` : '',
);
</script>

<style scoped>
.scene-content {
  --background: #0b1408;
}
.warn {
  padding: 16px;
  color: var(--iman-gold);
}
.choice {
  display: block;
  padding: 12px 16px;
  border: 3px solid #3c4a68;
  border-radius: 6px;
  background: linear-gradient(180deg, #f6eed8, #ebdfc0);
  box-shadow: 0 0 0 2px #aab8cf, 0 5px 0 2px rgba(0, 0, 0, 0.35);
  color: #3a2d2a;
  font-weight: 800;
  text-align: center;
  text-decoration: none;
}
.source {
  color: #b9c4ff;
  font-size: 11px;
}
</style>
