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
            <text x="30" y="58" class="deco" aria-hidden="true">🌲</text>
            <text x="64" y="44" class="deco" aria-hidden="true">⛰️</text>
            <text x="44" y="78" class="deco" aria-hidden="true">🌾</text>
            <text x="76" y="84" class="deco" aria-hidden="true">🌴</text>
            <text class="cloud c1" x="8" y="20" aria-hidden="true">☁️</text>
            <text class="cloud c2" x="60" y="10" aria-hidden="true">☁️</text>

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
              <circle v-if="store.statusOf(i) === 'open'" :cx="place.map.x" :cy="place.map.y" r="12" fill="url(#glow)" class="pulse" />
              <circle :cx="place.map.x" :cy="place.map.y" r="8" class="disc" />
              <text :x="place.map.x" :y="place.map.y + 3" class="icon">{{ place.emoji }}</text>
              <text v-if="store.statusOf(i) === 'cleared'" :x="place.map.x + 7" :y="place.map.y - 5" class="badge">✓</text>
              <text v-else-if="store.statusOf(i) === 'locked'" :x="place.map.x + 7" :y="place.map.y - 5" class="badge">🔒</text>
              <text :x="place.map.x" :y="place.map.y + 14" class="label">{{ place.title }}</text>
            </g>

            <!-- Ton avatar : il marche d'un lieu à l'autre -->
            <g class="avatar" :class="{ walking }" :transform="`translate(${pos.x} ${pos.y - 10})`" aria-hidden="true">
              <ellipse cx="0" cy="10" rx="4" ry="1.6" class="shadow" />
              <PixelSprite :look="avatarLook(avatar.id)" :anim="walking ? 'walk' : 'idle'" :facing="facing" :px="0.46" :x="-3.7" y="-1" />
            </g>
          </svg>

          <!-- HUD -->
          <div class="hud" aria-live="polite">
            <div class="ring" :style="{ '--p': percent }" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
              <span>{{ percent }}%</span>
            </div>
            <div class="hud-text">
              <strong>{{ selected?.title ?? 'Parcours' }}</strong>
              <small>{{ store.totals.done }} / {{ store.totals.total }} rencontres</small>
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
            <li v-for="a in AVATARS" :key="a.id">
              <button type="button" class="pick" :class="{ on: avatar.id === a.id }" role="radio" :aria-checked="avatar.id === a.id" :aria-label="a.label" @click="avatar.choose(a.id)">
                <PixelSprite :look="avatarLook(a.id)" :px="1.8" aria-hidden="true" />
                <small>{{ a.label }}</small>
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
import PixelSprite from '@/components/PixelSprite.vue';
import { avatarLook } from '@/data/sprites';
import { useWalker } from '@/composables/useWalker';
import { useAvatarStore } from '@/stores/avatar';
import { useRpgStore } from '@/stores/rpg';
import { AVATARS } from '@/utils/avatar';
import { placeClearedCount } from '@/utils/rpg';

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
.deco {
  font-size: 7px;
  opacity: 0.9;
}
.cloud {
  font-size: 9px;
  opacity: 0.55;
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
  stroke-width: 2.4;
}
.pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: pulse 1.8s ease-in-out infinite;
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
.avatar {
  pointer-events: none;
}
.shadow {
  fill: rgba(0, 0, 0, 0.35);
}
.hud {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px 6px 6px;
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
.avatars {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.pick {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  border: 1px solid rgba(201, 209, 255, 0.3);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  color: #f4f6ff;
  font: inherit;
}
.pick small {
  font-size: 11px;
  color: #b9c4ff;
}
.pick.on {
  border-color: #ffe08a;
  background: rgba(255, 224, 138, 0.16);
  box-shadow: 0 0 12px rgba(255, 224, 138, 0.45);
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
