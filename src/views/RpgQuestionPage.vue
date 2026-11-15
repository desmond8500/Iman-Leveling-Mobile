<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="found ? `/tabs/rpg/place/${found.place.id}` : '/tabs/rpg'" text="" />
        </ion-buttons>
        <ion-title>{{ found?.encounter.who ?? 'Rencontre' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="scene-content" :fullscreen="true">
      <p v-if="found && !playable" class="warn">Ce lieu est verrouillé : termine d'abord le lieu précédent.</p>
      <p v-else-if="!found" class="warn">Rencontre introuvable.</p>

      <template v-else-if="found">
        <Confetti v-if="celebrate" />
        <DialogueBox :key="solved ? 'ok' : 'q'" :name="found.encounter.who" :text="dialogue" :portrait="found.encounter.emoji" :look="npcLook(found.encounter.id)" :terrain="found.place.terrain">
          <template v-if="solved">
            <small v-if="found.encounter.lesson.source" class="source">{{ found.encounter.lesson.source }}</small>
            <router-link class="choice go" :to="`/tabs/rpg/place/${found.place.id}`">▶ Continuer</router-link>
          </template>
          <template v-else>
            <button v-for="c in choices" :key="c.id" type="button" class="choice" @click="onChoose(c.id)">{{ c.text }}</button>
          </template>
        </DialogueBox>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import Confetti from '@/components/Confetti.vue';
import DialogueBox from '@/components/DialogueBox.vue';
import { npcLook } from '@/data/sprites';
import { useRpgStore } from '@/stores/rpg';
import { findEncounter, shuffledChoices } from '@/utils/rpg';

const props = defineProps<{ id: string }>();
const store = useRpgStore();
const router = useRouter();

const found = computed(() => findEncounter(store.places, props.id));
const playable = computed(() => store.playable(props.id));
const solved = computed(() => store.cleared(props.id));
const choices = computed(() => (found.value ? shuffledChoices(found.value.encounter, store.mistakesOf(props.id)) : []));
const correctText = computed(() => found.value?.encounter.choices.find((c) => c.id === found.value?.encounter.correct)?.text ?? '');

/** Avant la réponse : la question. Après : la bonne réponse et la leçon. */
const dialogue = computed(() => {
  if (!found.value) return '';
  return solved.value ? `✓ ${correctText.value}\n\n${found.value.encounter.lesson.text}` : found.value.encounter.prompt;
});

/** Les confettis ne partent qu'à la réponse juste, pas en revenant sur une rencontre déjà réussie. */
const celebrate = ref(false);

function onChoose(choiceId: string) {
  const result = store.answer(props.id, choiceId);
  if (result === true) {
    celebrate.value = true;
    try {
      navigator.vibrate?.(60);
    } catch {
      /* vibration indisponible */
    }
    setTimeout(() => (celebrate.value = false), 3000);
  }
  // Mauvaise réponse : on est redirigé vers la leçon, puis on retente.
  if (result === false) void router.push(`/tabs/rpg/lesson/${props.id}`);
}

onMounted(() => {
  if (!store.loaded) void store.load();
});
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
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  border: 3px solid #3c4a68;
  border-radius: 6px;
  background: linear-gradient(180deg, #f6eed8, #ebdfc0);
  box-shadow: 0 0 0 2px #aab8cf, 0 5px 0 2px rgba(0, 0, 0, 0.35);
  color: #3a2d2a;
  font: inherit;
  font-weight: 600;
  text-align: left;
  text-decoration: none;
}
.choice:active,
.choice:focus-visible {
  background: #ffe9a8;
  transform: translateY(2px);
}
.go {
  text-align: center;
  font-weight: 800;
}
.source {
  color: #b9c4ff;
  font-size: 11px;
}
</style>
