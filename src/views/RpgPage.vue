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
        <div class="world">
          <svg viewBox="0 0 100 100" role="group" aria-label="Carte du parcours">
            <defs>
              <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#1b3b7a" />
                <stop offset="1" stop-color="#0b1d45" />
              </linearGradient>
              <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#d9c58b" />
                <stop offset="1" stop-color="#b79a5b" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#sea)" />
            <path d="M4 78 C6 56 12 46 26 40 C34 24 56 12 72 22 C88 30 96 46 94 64 C92 84 70 92 48 90 C26 94 8 92 4 78 Z" fill="url(#land)" stroke="#f1e3b4" stroke-width="0.8" />
            <text x="30" y="58" class="deco" aria-hidden="true">🌲</text>
            <text x="64" y="44" class="deco" aria-hidden="true">⛰️</text>
            <text x="44" y="78" class="deco" aria-hidden="true">🌾</text>
            <text x="76" y="84" class="deco" aria-hidden="true">🌴</text>

            <polyline :points="routePoints" class="route" />

            <g
              v-for="(place, i) in store.places"
              :key="place.id"
              class="node"
              :class="[store.statusOf(i), { selected: selectedId === place.id }]"
              role="button"
              tabindex="0"
              :aria-label="`${place.title} : ${statusLabel(i)}`"
              @click="select(place.id)"
              @keydown.enter.prevent="select(place.id)"
              @keydown.space.prevent="select(place.id)"
            >
              <circle :cx="place.map.x" :cy="place.map.y" r="8" class="disc" />
              <text :x="place.map.x" :y="place.map.y + 3" class="icon">{{ place.emoji }}</text>
              <text v-if="store.statusOf(i) === 'cleared'" :x="place.map.x + 7" :y="place.map.y - 5" class="badge">✓</text>
              <text v-else-if="store.statusOf(i) === 'locked'" :x="place.map.x + 7" :y="place.map.y - 5" class="badge">🔒</text>
              <text :x="place.map.x" :y="place.map.y + 14" class="label">{{ place.title }}</text>
            </g>

            <text v-if="store.current" :x="store.current.map.x" :y="store.current.map.y - 11" class="cursor" aria-hidden="true">▼</text>
          </svg>
        </div>

        <FftWindow title="Destination">
          <template v-if="selected">
            <h2 class="place-title">{{ selected.emoji }} {{ selected.title }}</h2>
            <p class="intro">{{ selected.intro }}</p>
            <p class="meta">{{ statusLabel(selectedIndex) }}</p>
            <router-link v-if="selectedStatus !== 'locked'" class="cmd" :to="`/tabs/rpg/place/${selected.id}`">
              <span class="cursor-mark" aria-hidden="true">▶</span> {{ selectedStatus === 'cleared' ? 'Revisiter' : 'Entrer' }}
            </router-link>
            <p v-else class="meta">Termine le lieu précédent pour l'ouvrir.</p>
          </template>
        </FftWindow>

        <FftWindow title="Progression">
          <div class="bar" role="progressbar" :aria-valuenow="store.totals.done" aria-valuemin="0" :aria-valuemax="store.totals.total">
            <span :style="{ width: percent + '%' }" />
          </div>
          <p class="meta">{{ store.totals.done }} / {{ store.totals.total }} rencontres réussies</p>
          <p v-if="store.finished" class="win-text">Bravo, tu as terminé le parcours. Qu'Allah accepte ton effort !</p>
          <p class="meta how">Réponds juste pour avancer. Une mauvaise réponse te renvoie vers une leçon, puis tu retentes.</p>
          <button v-if="store.totals.done > 0" type="button" class="reset" @click="confirmReset">Recommencer le parcours</button>
        </FftWindow>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import FftWindow from '@/components/FftWindow.vue';
import { useRpgStore } from '@/stores/rpg';
import { placeClearedCount } from '@/utils/rpg';

const store = useRpgStore();
const selectedId = ref<string>('');

const routePoints = computed(() => store.places.map((p) => `${p.map.x},${p.map.y}`).join(' '));
const percent = computed(() => (store.totals.total ? Math.round((store.totals.done / store.totals.total) * 100) : 0));

const selectedIndex = computed(() => Math.max(0, store.places.findIndex((p) => p.id === selectedId.value)));
const selected = computed(() => store.places[selectedIndex.value]);
const selectedStatus = computed(() => store.statusOf(selectedIndex.value));

function statusLabel(i: number) {
  const place = store.places[i];
  if (!place) return '';
  const status = store.statusOf(i);
  if (status === 'locked') return 'verrouillé';
  const n = placeClearedCount(place, store.progress);
  return `${status === 'cleared' ? 'terminé' : 'ouvert'} · ${n} / ${place.encounters.length} rencontres`;
}

const select = (id: string) => {
  selectedId.value = id;
};

function confirmReset() {
  if (window.confirm('Effacer ta progression sur le parcours ?')) store.reset();
}

// La destination affichée suit la progression tant que le joueur n'a rien choisi.
watch(
  () => store.current?.id,
  (id) => {
    if (id) selectedId.value = id;
  },
);

onMounted(async () => {
  if (!store.loaded) await store.load();
  selectedId.value = store.current?.id ?? store.places[0]?.id ?? '';
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
.world {
  border: 3px solid #c9d1ff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 0 2px #25326f, 0 6px 16px rgba(0, 0, 0, 0.45);
}
svg {
  display: block;
  width: 100%;
  height: auto;
}
.deco {
  font-size: 7px;
  opacity: 0.85;
}
.route {
  fill: none;
  stroke: #ffe08a;
  stroke-width: 1.2;
  stroke-dasharray: 2.5 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.node {
  cursor: pointer;
  outline: none;
}
.node .disc {
  fill: #16215a;
  stroke: #c9d1ff;
  stroke-width: 1.2;
}
.node.open .disc {
  stroke: #ffe08a;
  stroke-width: 1.8;
}
.node.cleared .disc {
  fill: #1d5a3a;
  stroke: #8be3a9;
}
.node.locked {
  opacity: 0.55;
}
.node.selected .disc,
.node:focus-visible .disc {
  stroke: #ffffff;
  stroke-width: 2.2;
}
.icon {
  font-size: 8px;
  text-anchor: middle;
}
.badge {
  font-size: 5px;
}
.label {
  font-size: 4.4px;
  font-weight: 700;
  text-anchor: middle;
  fill: #fff;
  paint-order: stroke;
  stroke: #0c1337;
  stroke-width: 1.2px;
}
.cursor {
  font-size: 6px;
  text-anchor: middle;
  fill: #ffe08a;
  animation: bob 1s ease-in-out infinite;
}
@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .cursor {
    animation: none;
  }
}
.place-title {
  margin: 0 0 6px;
  font-size: 18px;
}
.intro {
  margin: 0 0 8px;
  line-height: 1.5;
  font-size: 14px;
}
.meta {
  margin: 0 0 8px;
  font-size: 12px;
  color: #b9c4ff;
}
.how {
  margin-top: 10px;
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
  margin-right: 6px;
}
.bar {
  height: 10px;
  border: 1px solid #c9d1ff;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #ffd45e, #ffe9a8);
  transition: width 0.3s ease;
}
.win-text {
  margin: 0;
  color: #ffe08a;
  font-weight: 700;
}
.reset {
  margin-top: 6px;
  padding: 6px 12px;
  border: 1px solid #c9d1ff;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 12px;
}
</style>
