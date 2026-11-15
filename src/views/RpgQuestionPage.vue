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

    <ion-content class="iman-content" :fullscreen="true">
      <div v-if="found" class="wrap">
        <p v-if="!playable" class="warn">Ce lieu est verrouillé : termine d'abord le lieu précédent.</p>

        <template v-else>
          <section class="card">
            <p class="emoji" aria-hidden="true">{{ found.encounter.emoji }}</p>
            <p class="topic">{{ found.encounter.topic }}</p>
            <p class="prompt">{{ found.encounter.prompt }}</p>
          </section>

          <section v-if="solved" class="card success" aria-live="polite">
            <h2>✓ Bonne réponse</h2>
            <p class="correct">{{ correctText }}</p>
            <p>{{ found.encounter.lesson.text }}</p>
            <small v-if="found.encounter.lesson.source">{{ found.encounter.lesson.source }}</small>
            <router-link class="btn" :to="`/tabs/rpg/place/${found.place.id}`">Continuer</router-link>
          </section>

          <ul v-else class="choices">
            <li v-for="c in choices" :key="c.id">
              <button type="button" class="choice" @click="onChoose(c.id)">{{ c.text }}</button>
            </li>
          </ul>
        </template>
      </div>
      <div v-else class="wrap"><p class="warn">Rencontre introuvable.</p></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
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

function onChoose(choiceId: string) {
  const result = store.answer(props.id, choiceId);
  // Mauvaise réponse : on est redirigé vers la leçon, puis on retente.
  if (result === false) void router.push(`/tabs/rpg/lesson/${props.id}`);
}

onMounted(() => {
  if (!store.loaded) void store.load();
});
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
  font-size: 40px;
  text-align: center;
}
.topic {
  font-size: 12px;
  color: var(--iman-gold);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.prompt {
  font-size: 17px;
  font-weight: 600;
}
.choices {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.choice {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(242, 201, 76, 0.3);
  border-radius: 14px;
  background: var(--iman-card);
  color: inherit;
  font: inherit;
  text-align: left;
}
.choice:active {
  background: var(--iman-card-done);
}
.success {
  border: 2px solid var(--iman-emerald);
}
.success h2 {
  margin: 0 0 8px;
  font-size: 18px;
  color: var(--iman-emerald);
}
.correct {
  font-weight: 700;
}
.success small {
  display: block;
  margin-bottom: 12px;
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
.warn {
  color: var(--iman-gold);
}
</style>
