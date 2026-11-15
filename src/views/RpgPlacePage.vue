<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/rpg" text="" />
        </ion-buttons>
        <ion-title>{{ place?.title ?? 'Lieu' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div v-if="place" class="wrap">
        <section class="card">
          <p class="emoji" aria-hidden="true">{{ place.emoji }}</p>
          <p>{{ place.intro }}</p>
        </section>

        <p v-if="locked" class="warn">Ce lieu est verrouillé : termine d'abord le lieu précédent.</p>
        <ul v-else class="list">
          <li v-for="e in place.encounters" :key="e.id">
            <router-link :to="`/tabs/rpg/q/${e.id}`" class="row" :class="{ done: store.cleared(e.id) }">
              <span class="emoji" aria-hidden="true">{{ e.emoji }}</span>
              <span class="text">
                <strong>{{ e.who }}</strong>
                <small>{{ e.topic }}</small>
              </span>
              <span class="state">{{ store.cleared(e.id) ? '✓' : '?' }}</span>
            </router-link>
          </li>
        </ul>

        <p v-if="!locked && cleared" class="done">
          Lieu terminé !
          <router-link to="/tabs/rpg">Retour à la carte</router-link>
        </p>
      </div>
      <div v-else class="wrap"><p class="warn">Lieu introuvable.</p></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { useRpgStore } from '@/stores/rpg';
import { isPlaceCleared } from '@/utils/rpg';

const props = defineProps<{ id: string }>();
const store = useRpgStore();

const index = computed(() => store.places.findIndex((p) => p.id === props.id));
const place = computed(() => store.places[index.value]);
const locked = computed(() => index.value >= 0 && store.statusOf(index.value) === 'locked');
const cleared = computed(() => !!place.value && isPlaceCleared(place.value, store.progress));

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
  text-align: center;
}
.card p {
  margin: 0 0 6px;
  line-height: 1.5;
}
.emoji {
  font-size: 34px;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 16px;
  background: var(--iman-card);
  color: inherit;
  text-decoration: none;
}
.row.done {
  background: var(--iman-card-done);
}
.text {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.text small {
  color: var(--iman-text-soft);
}
.state {
  font-weight: 700;
  color: var(--iman-gold);
}
.warn,
.done {
  color: var(--iman-gold);
  font-size: 14px;
}
</style>
