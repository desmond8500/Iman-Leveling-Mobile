<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/more" text="" />
        </ion-buttons>
        <ion-title>Parcours</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <section class="card top">
          <p class="lead">
            Avance de lieu en lieu en répondant juste. Une mauvaise réponse te renvoie vers une leçon, puis tu retentes.
          </p>
          <div class="bar" role="progressbar" :aria-valuenow="store.totals.done" aria-valuemin="0" :aria-valuemax="store.totals.total">
            <span :style="{ width: percent + '%' }" />
          </div>
          <p class="count">{{ store.totals.done }} / {{ store.totals.total }} rencontres réussies</p>
          <router-link v-if="store.current" class="btn" :to="`/tabs/rpg/place/${store.current.id}`">
            {{ store.totals.done ? 'Reprendre : ' : 'Commencer : ' }}{{ store.current.title }}
          </router-link>
          <p v-else-if="store.finished" class="done">Bravo, tu as terminé le parcours. Qu'Allah accepte ton effort !</p>
        </section>

        <ol class="path">
          <li v-for="(place, i) in store.places" :key="place.id" :class="store.statusOf(i)">
            <component :is="store.statusOf(i) === 'locked' ? 'div' : 'router-link'" :to="`/tabs/rpg/place/${place.id}`" class="node">
              <span class="emoji" aria-hidden="true">{{ place.emoji }}</span>
              <span class="text">
                <strong>{{ place.title }}</strong>
                <small>{{ statusText(i) }}</small>
              </span>
              <span class="state" aria-hidden="true">{{ store.statusOf(i) === 'cleared' ? '✓' : store.statusOf(i) === 'locked' ? '🔒' : '▶' }}</span>
            </component>
          </li>
        </ol>

        <button v-if="store.totals.done > 0" type="button" class="ghost" @click="confirmReset">Recommencer le parcours</button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { useRpgStore } from '@/stores/rpg';
import { placeClearedCount } from '@/utils/rpg';

const store = useRpgStore();
const percent = computed(() => (store.totals.total ? Math.round((store.totals.done / store.totals.total) * 100) : 0));

function statusText(i: number) {
  const status = store.statusOf(i);
  const place = store.places[i];
  if (status === 'locked') return 'Termine le lieu précédent pour l\'ouvrir';
  return `${placeClearedCount(place, store.progress)} / ${place.encounters.length} rencontres`;
}

function confirmReset() {
  if (window.confirm('Effacer ta progression sur le parcours ?')) store.reset();
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
  gap: 14px;
}
.card {
  padding: 16px;
  border-radius: 16px;
  background: var(--iman-card);
}
.lead {
  margin: 0 0 12px;
  font-size: 14px;
}
.bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  background: var(--iman-gold);
  transition: width 0.3s ease;
}
.count {
  margin: 6px 0 12px;
  font-size: 12px;
  color: var(--iman-text-soft);
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
.done {
  margin: 0;
  color: var(--iman-gold);
  font-weight: 700;
}
.path {
  list-style: none;
  margin: 0;
  padding: 0 0 0 18px;
  border-left: 3px dashed rgba(242, 201, 76, 0.4);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.node {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: var(--iman-card);
  color: inherit;
  text-decoration: none;
}
.open .node {
  border: 2px solid var(--iman-gold);
}
.cleared .node {
  background: var(--iman-card-done);
}
.locked .node {
  opacity: 0.55;
}
.emoji {
  font-size: 30px;
}
.text {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.text small {
  color: var(--iman-text-soft);
}
.ghost {
  align-self: center;
  padding: 8px 14px;
  border: 1px solid rgba(242, 201, 76, 0.3);
  border-radius: 12px;
  background: transparent;
  color: inherit;
}
</style>
