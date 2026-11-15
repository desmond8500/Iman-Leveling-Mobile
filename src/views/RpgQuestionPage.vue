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
          <FftWindow :title="found.encounter.who">
            <div class="speaker">
              <span class="portrait" aria-hidden="true">{{ found.encounter.emoji }}</span>
              <div>
                <p class="topic">{{ found.encounter.topic }}</p>
                <p class="prompt">{{ found.encounter.prompt }}</p>
              </div>
            </div>
          </FftWindow>

          <FftWindow v-if="solved" title="Réussi" aria-live="polite">
            <p class="good">✓ Bonne réponse</p>
            <p class="correct">{{ correctText }}</p>
            <p class="text">{{ found.encounter.lesson.text }}</p>
            <small v-if="found.encounter.lesson.source">{{ found.encounter.lesson.source }}</small>
            <router-link class="cmd" :to="`/tabs/rpg/place/${found.place.id}`">
              <span class="cursor-mark" aria-hidden="true">▶</span> Continuer
            </router-link>
          </FftWindow>

          <FftWindow v-else title="Commandes">
            <ul class="menu">
              <li v-for="c in choices" :key="c.id">
                <button type="button" class="cmd" @click="onChoose(c.id)">
                  <span class="cursor-mark" aria-hidden="true">▶</span> {{ c.text }}
                </button>
              </li>
            </ul>
          </FftWindow>
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
import FftWindow from '@/components/FftWindow.vue';
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
  border: 2px solid #c9d1ff;
  border-radius: 8px;
  background: #0c1337;
}
.topic {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #ffe08a;
}
.prompt {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
}
.menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cmd {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #f4f6ff;
  font: inherit;
  text-align: left;
  text-decoration: none;
  text-shadow: inherit;
}
.cmd:hover,
.cmd:focus-visible,
.cmd:active {
  border-color: #c9d1ff;
  background: rgba(255, 255, 255, 0.12);
}
.cursor-mark {
  display: inline-block;
  width: 1.2em;
  color: #ffe08a;
  visibility: hidden;
}
.cmd:hover .cursor-mark,
.cmd:focus-visible .cursor-mark,
.cmd:active .cursor-mark {
  visibility: visible;
}
.good {
  margin: 0 0 6px;
  color: #8dffbd;
  font-weight: 800;
}
.correct {
  margin: 0 0 8px;
  font-weight: 700;
}
.text {
  margin: 0 0 8px;
  line-height: 1.5;
}
small {
  display: block;
  margin-bottom: 10px;
  color: #b9c4ff;
  font-size: 11px;
}
.warn {
  color: var(--iman-gold);
}
</style>
