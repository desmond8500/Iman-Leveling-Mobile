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
                <stop offset="0" stop-color="#16316b" />
                <stop offset="1" stop-color="#081538" />
              </linearGradient>
              <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#e3cf95" />
                <stop offset="1" stop-color="#b79a5b" />
              </linearGradient>
              <radialGradient id="glow">
                <stop offset="0" stop-color="#ffe08a" stop-opacity="0.8" />
                <stop offset="1" stop-color="#ffe08a" stop-opacity="0" />
              </radialGradient>
            </defs>
            <rect width="100" height="100" fill="url(#sea)" />
            <g class="waves" aria-hidden="true">
              <path d="M6 14 q4 -2 8 0 t8 0" />
              <path d="M70 90 q4 -2 8 0 t8 0" />
              <path d="M80 10 q4 -2 8 0 t8 0" />
            </g>
            <path d="M4 78 C6 56 12 46 26 40 C34 24 56 12 72 22 C88 30 96 46 94 64 C92 84 70 92 48 90 C26 94 8 92 4 78 Z" fill="url(#land)" stroke="#f6ebc5" stroke-width="0.8" />
            <g aria-hidden="true">
              <path d="M62 46 L68 36 L72 41 L76 34 L84 46 Z" fill="#8e93a8" stroke="#2b1b17" stroke-width="0.5" stroke-linejoin="round" />
              <path d="M68 36 L66.5 39 L69.5 39 Z M76 34 L74 37.5 L78 37.5 Z" fill="#f4f6ff" />
              <g v-for="d in MAP_DECOR" :key="d.id" :transform="`translate(${d.x} ${d.y}) scale(${d.s})`">
                <VectorShapes :shapes="d.shapes" />
              </g>
            </g>
            <g class="cloud c1" aria-hidden="true"><ellipse cx="10" cy="20" rx="6" ry="2.6" /><ellipse cx="14" cy="18.6" rx="4" ry="2.6" /></g>
            <g class="cloud c2" aria-hidden="true"><ellipse cx="62" cy="10" rx="7" ry="2.8" /><ellipse cx="66" cy="8.4" rx="4.4" ry="2.8" /></g>

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
              <circle :cx="place.map.x" :cy="place.map.y - 3" r="11" class="hit" />
              <circle v-if="store.statusOf(i) === 'open'" :cx="place.map.x" :cy="place.map.y" r="13" fill="url(#glow)" class="pulse" />
              <ellipse :cx="place.map.x" :cy="place.map.y + 4" rx="11" ry="3.6" class="disc" />
              <g :transform="`translate(${place.map.x} ${place.map.y + 4}) scale(${iconScale(place.id)})`" class="building">
                <VectorShapes :shapes="placeIcon(place.id)" />
              </g>
              <g v-if="store.statusOf(i) === 'cleared'">
                <circle :cx="place.map.x + 9" :cy="place.map.y - 9" r="3" class="ok" />
                <text :x="place.map.x + 9" :y="place.map.y - 7.6" class="badge">✓</text>
              </g>
              <text v-else-if="store.statusOf(i) === 'locked'" :x="place.map.x + 9" :y="place.map.y - 7" class="badge">🔒</text>
              <text :x="place.map.x" :y="place.map.y + 12" class="label">{{ place.title }}</text>
            </g>

            <!-- Ton avatar : il marche d'un lieu à l'autre -->
            <g class="avatar" :class="{ walking }" :transform="`translate(${pos.x} ${pos.y - 10})`" aria-hidden="true">
              <ellipse cx="0" cy="10" rx="4" ry="1.6" class="shadow" />
              <VectorSprite :look="avatarLook(avatar.id)" :anim="walking ? 'walk' : 'idle'" :facing="facing" :px="0.6" :x="-4.8" y="-5" />
            </g>
          </svg>

          <!-- HUD -->
          <div class="overlay">
            <GameHud class="hud-card" />
            <div class="hud">
              <div class="ring" :style="{ '--p': percent }" role="progressbar" aria-label="Parcours accompli" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
                <span>{{ percent }}%</span>
              </div>
            </div>
          </div>
        </div>

        <FftWindow title="Destination">
          <template v-if="selected">
            <h2 class="place-title">{{ selected.emoji }} {{ selected.title }}</h2>
            <p class="intro">{{ selected.intro }}</p>
            <p class="meta">{{ statusLabel(selectedIndex) }}</p>
            <button v-if="selectedStatus !== 'locked'" type="button" class="go" :disabled="walking" @click="enter">
              {{ walking ? 'En route…' : selectedStatus === 'cleared' ? '↻ Revisiter' : '▶ Y aller' }}
            </button>
            <p v-else class="meta">Termine le lieu précédent pour l'ouvrir.</p>
          </template>
        </FftWindow>

        <FftWindow title="Personnage">
          <ul class="avatars" role="radiogroup" aria-label="Choisir ton personnage">
            <li v-for="(a, i) in AVATARS" :key="a.id">
              <button type="button" class="pick" :class="{ on: avatar.id === a.id }" :style="{ '--tone': RIBBONS[i % RIBBONS.length] }" role="radio" :aria-checked="avatar.id === a.id" :aria-label="a.label" @click="avatar.choose(a.id)">
                <VectorSprite :look="avatarLook(a.id)" :anim="avatar.id === a.id ? 'walk' : 'idle'" :phase="i" :px="3" aria-hidden="true" />
                <span class="ribbon">{{ a.label }}</span>
              </button>
            </li>
          </ul>
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
import { useRouter } from 'vue-router';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import FftWindow from '@/components/FftWindow.vue';
import VectorShapes from '@/components/VectorShapes.vue';
import VectorSprite from '@/components/VectorSprite.vue';
import GameHud from '@/components/game/GameHud.vue';
import { avatarLook } from '@/data/sprites';
import { useWalker } from '@/composables/useWalker';
import { useAvatarStore } from '@/stores/avatar';
import { useRpgStore } from '@/stores/rpg';
import { AVATARS } from '@/utils/avatar';
import { placeClearedCount } from '@/utils/rpg';
import { bush, mosque, palm, pine, placeIcon, tree } from '@/utils/vectorScene';

/** Décor vectoriel de l'île (positions dans le repère 100 × 100 de la carte). */
const MAP_DECOR = [
  { id: 'pin1', x: 30, y: 60, s: 0.13, shapes: pine() },
  { id: 'pin2', x: 34, y: 56, s: 0.11, shapes: pine() },
  { id: 'arbre1', x: 10, y: 84, s: 0.12, shapes: tree() },
  { id: 'arbre2', x: 46, y: 52, s: 0.1, shapes: tree('#5aa64a') },
  { id: 'buisson', x: 60, y: 86, s: 0.12, shapes: bush() },
  { id: 'mosquee', x: 40, y: 80, s: 0.1, shapes: mosque() },
  { id: 'palmier1', x: 76, y: 86, s: 0.13, shapes: palm() },
  { id: 'palmier2', x: 66, y: 76, s: 0.11, shapes: palm() },
  { id: 'arbre3', x: 38, y: 34, s: 0.1, shapes: tree() },
];
/** Bâtiments de la carte : environ 16 unités de large. */
const iconScale = (id: string) => (id === 'ecole' ? 0.07 : id === 'travail' ? 0.08 : 0.1);
/** Couleurs des rubans de la feuille de personnages. */
const RIBBONS = ['#2f5fa8', '#8a4a2b', '#2f7a4a', '#5a3a8a', '#9a3a3a', '#3a6a8a'];

const store = useRpgStore();
const avatar = useAvatarStore();
const router = useRouter();
const selectedId = ref<string>('');
/** Indice du lieu où se trouve l'avatar. */
const atIndex = ref(0);

const start = store.places[0]?.map ?? { x: 50, y: 50 };
const { pos, walking, facing, walk, place: teleport } = useWalker({ x: start.x, y: start.y });

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
  if (!walking.value) selectedId.value = id;
};

/** L'avatar suit la route (lieu par lieu) jusqu'à la destination, puis on entre. */
async function enter() {
  const target = selectedIndex.value;
  if (walking.value || !selected.value) return;
  const from = atIndex.value;
  const step = from <= target ? 1 : -1;
  const points: { x: number; y: number }[] = [];
  for (let i = from; i !== target + step; i += step) points.push({ x: store.places[i].map.x, y: store.places[i].map.y });
  await walk(points, 28);
  atIndex.value = target;
  void router.push(`/tabs/rpg/place/${selected.value.id}`);
}

function confirmReset() {
  if (window.confirm('Effacer ta progression sur le parcours ?')) store.reset();
}

function syncAvatar() {
  const i = Math.max(0, store.places.findIndex((p) => p.id === store.current?.id));
  atIndex.value = i;
  const p = store.places[i]?.map;
  if (p) teleport({ x: p.x, y: p.y });
}

// La destination affichée suit la progression ; l'avatar rejoint le lieu en cours.
watch(
  () => store.current?.id,
  (id) => {
    if (id) selectedId.value = id;
    if (!walking.value) syncAvatar();
  },
);

onMounted(async () => {
  void avatar.load();
  if (!store.loaded) await store.load();
  selectedId.value = store.current?.id ?? store.places[0]?.id ?? '';
  syncAvatar();
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
  position: relative;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(201, 209, 255, 0.35), 0 0 26px rgba(90, 120, 255, 0.3), 0 12px 28px rgba(0, 0, 0, 0.5);
}
svg {
  display: block;
  width: 100%;
  height: auto;
}
.waves path {
  fill: none;
  stroke: rgba(255, 255, 255, 0.22);
  stroke-width: 0.5;
  animation: drift 6s ease-in-out infinite alternate;
}
.cloud {
  fill: #ffffff;
  opacity: 0.6;
  animation: cloud 28s linear infinite;
}
.cloud.c2 {
  animation-duration: 38s;
  animation-delay: -14s;
}
.route {
  fill: none;
  stroke: #ffe08a;
  stroke-width: 1.2;
  stroke-dasharray: 2.5 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 1.5px rgba(255, 224, 138, 0.9));
  animation: flow 1.2s linear infinite;
}
.node {
  cursor: pointer;
  outline: none;
}
.node .hit {
  fill: transparent;
}
.node .disc {
  fill: rgba(22, 33, 90, 0.45);
  stroke: #c9d1ff;
  stroke-width: 0.6;
}
.node.open .disc {
  stroke: #ffe08a;
  stroke-width: 0.9;
}
.node.cleared .disc {
  fill: rgba(29, 90, 58, 0.6);
  stroke: #8be3a9;
}
.node.locked .building {
  filter: grayscale(0.85) brightness(0.8);
}
.node.locked {
  opacity: 0.75;
}
.node.selected .disc,
.node:focus-visible .disc {
  stroke: #ffffff;
  stroke-width: 1.2;
}
.node .ok {
  fill: #1d8a50;
  stroke: #fff;
  stroke-width: 0.6;
}
.pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: pulse 1.8s ease-in-out infinite;
}
.badge {
  font-size: 4px;
  font-weight: 800;
  text-anchor: middle;
  fill: #fff;
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
.avatar {
  pointer-events: none;
}
.shadow {
  fill: rgba(0, 0, 0, 0.35);
}
.overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.hud-card {
  width: min(230px, 66%);
}
.hud {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px;
  border-radius: 999px;
  background: rgba(12, 19, 55, 0.62);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: 0 0 0 1px rgba(201, 209, 255, 0.35);
  color: #f4f6ff;
}
.ring {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: conic-gradient(#ffe08a calc(var(--p) * 1%), rgba(255, 255, 255, 0.15) 0);
  position: relative;
}
.ring::before {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: #0c1337;
}
.ring span {
  position: relative;
  font-size: 10px;
  font-weight: 800;
}
.hud-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.hud-text strong {
  font-size: 13px;
}
.hud-text small {
  font-size: 11px;
  color: #b9c4ff;
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
  margin: 0 0 10px;
  font-size: 12px;
  color: #b9c4ff;
}
.go {
  width: 100%;
  padding: 13px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(90deg, #ffe08a, #ffb84d);
  box-shadow: 0 4px 16px rgba(255, 184, 77, 0.45);
  color: #1a2150;
  font: inherit;
  font-weight: 800;
  letter-spacing: 0.03em;
}
.go:active {
  transform: scale(0.98);
}
.go:disabled {
  opacity: 0.7;
}
.bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #8dffbd, #ffe08a);
  box-shadow: 0 0 10px rgba(141, 255, 189, 0.6);
  transition: width 0.6s ease;
}
.bar + .meta {
  margin-top: 8px;
}
.win-text {
  color: #ffe08a;
  font-weight: 700;
}
.how {
  line-height: 1.5;
}
.reset {
  padding: 8px 12px;
  border: 1px solid rgba(201, 209, 255, 0.5);
  border-radius: 10px;
  background: transparent;
  color: #f4f6ff;
  font: inherit;
  font-size: 12px;
}
/* Feuille de personnages : chaque héros sur fond sombre, avec son ruban de nom. */
.avatars {
  list-style: none;
  margin: 0;
  padding: 10px 4px 4px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px 8px;
  border-radius: 12px;
  background: #1b2036;
}
.pick {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 6px 2px 0;
  border: 0;
  border-radius: 12px;
  background: radial-gradient(ellipse at 50% 85%, rgba(255, 255, 255, 0.08), transparent 60%);
  color: #f4f6ff;
  font: inherit;
}
.pick svg {
  filter: drop-shadow(0 4px 0 rgba(0, 0, 0, 0.35));
}
.ribbon {
  position: relative;
  width: 92%;
  padding: 3px 0;
  background: var(--tone);
  clip-path: polygon(8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%, 0 50%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-align: center;
}
.pick.on {
  background: radial-gradient(ellipse at 50% 80%, rgba(255, 224, 138, 0.35), transparent 65%);
}
.pick.on .ribbon {
  background: linear-gradient(90deg, #ffb84d, #ffe08a);
  color: #1a2150;
}
@keyframes flow {
  to {
    stroke-dashoffset: -9;
  }
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(0.85);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}
@keyframes drift {
  to {
    transform: translateX(3px);
  }
}
@keyframes cloud {
  from {
    transform: translateX(-20px);
  }
  to {
    transform: translateX(120px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .route,
  .pulse,
  .waves path,
  .cloud {
    animation: none;
  }
}
</style>
