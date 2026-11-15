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
        <FftWindow :title="`${place.emoji} ${place.title}`">
          <p class="intro">{{ place.intro }}</p>
        </FftWindow>

        <p v-if="locked" class="warn">Ce lieu est verrouillé : termine d'abord le lieu précédent.</p>

        <template v-else>
          <div class="stage">
            <svg :viewBox="`0 0 ${stage.width} ${stage.height}`" role="group" :aria-label="`Terrain : ${place.title}`">
              <g v-for="t in stage.tiles" :key="`${t.gx}-${t.gy}`" class="tile">
                <polygon :points="leftFace(t.gx, t.gy, t.level, stage.cols)" :fill="side(t.level, 0.7)" />
                <polygon :points="rightFace(t.gx, t.gy, t.level, stage.cols)" :fill="side(t.level, 0.55)" />
                <polygon :points="topFace(t.gx, t.gy, t.level, stage.cols)" :fill="top(t.level)" />
              </g>

              <!-- Toi, au premier plan -->
              <g class="unit player" aria-hidden="true">
                <ellipse :cx="playerPoint.x" :cy="playerPoint.y" rx="13" ry="6" class="shadow" />
                <text :x="playerPoint.x" :y="playerPoint.y - 2" class="sprite">🚶</text>
                <text :x="playerPoint.x" :y="playerPoint.y + 14" class="name">Toi</text>
              </g>

              <g
                v-for="u in units"
                :key="u.encounter.id"
                class="unit npc"
                :class="{ cleared: store.cleared(u.encounter.id) }"
                role="button"
                tabindex="0"
                :aria-label="`${u.encounter.who} : ${u.encounter.topic}${store.cleared(u.encounter.id) ? ' (réussi)' : ''}`"
                @click="go(u.encounter.id)"
                @keydown.enter.prevent="go(u.encounter.id)"
                @keydown.space.prevent="go(u.encounter.id)"
              >
                <circle :cx="u.point.x" :cy="u.point.y - 14" r="26" class="hit" />
                <ellipse :cx="u.point.x" :cy="u.point.y" rx="13" ry="6" class="shadow" />
                <text :x="u.point.x" :y="u.point.y - 2" class="sprite">{{ u.encounter.emoji }}</text>
                <text :x="u.point.x" :y="u.point.y + 14" class="name">{{ u.encounter.who }}</text>
                <g v-if="store.cleared(u.encounter.id)">
                  <circle :cx="u.point.x + 13" :cy="u.point.y - 26" r="7" class="ok" />
                  <text :x="u.point.x + 13" :y="u.point.y - 23" class="okmark">✓</text>
                </g>
                <g v-else>
                  <rect :x="u.point.x - 7" :y="u.point.y - 40" width="14" height="14" rx="4" class="bubble" />
                  <text :x="u.point.x" :y="u.point.y - 29" class="qmark">?</text>
                </g>
              </g>

              <text v-if="target" :x="target.point.x" :y="target.point.y - 46" class="arrow" aria-hidden="true">▼</text>
            </svg>
          </div>

          <FftWindow title="Rencontres">
            <ul class="menu">
              <li v-for="e in place.encounters" :key="e.id">
                <router-link :to="`/tabs/rpg/q/${e.id}`" class="row" :class="{ done: store.cleared(e.id) }">
                  <span class="cursor-mark" aria-hidden="true">▶</span>
                  <span class="emoji" aria-hidden="true">{{ e.emoji }}</span>
                  <span class="text"><strong>{{ e.who }}</strong><small>{{ e.topic }}</small></span>
                  <span class="state">{{ store.cleared(e.id) ? '✓' : '?' }}</span>
                </router-link>
              </li>
            </ul>
          </FftWindow>

          <FftWindow v-if="cleared" title="Victoire">
            <p class="win-text">Lieu terminé !</p>
            <router-link class="cmd" to="/tabs/rpg"><span class="cursor-mark" aria-hidden="true">▶</span> Retour à la carte</router-link>
          </FftWindow>
        </template>
      </div>
      <div v-else class="wrap"><p class="warn">Lieu introuvable.</p></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import FftWindow from '@/components/FftWindow.vue';
import { useRpgStore } from '@/stores/rpg';
import { buildStage, leftFace, rightFace, topFace, unitPoint } from '@/utils/iso';
import { isPlaceCleared, type Terrain } from '@/utils/rpg';

const props = defineProps<{ id: string }>();
const store = useRpgStore();
const router = useRouter();

const index = computed(() => store.places.findIndex((p) => p.id === props.id));
const place = computed(() => store.places[index.value]);
const locked = computed(() => index.value >= 0 && store.statusOf(index.value) === 'locked');
const cleared = computed(() => !!place.value && isPlaceCleared(place.value, store.progress));

const stage = computed(() => buildStage(props.id, place.value?.encounters.length ?? 0));
const playerPoint = computed(() => unitPoint(stage.value, stage.value.start, props.id));
const units = computed(() =>
  (place.value?.encounters ?? []).map((encounter, i) => ({
    encounter,
    point: unitPoint(stage.value, stage.value.spots[i] ?? stage.value.start, props.id),
  })),
);
/** La prochaine rencontre à faire : une flèche la désigne. */
const target = computed(() => units.value.find((u) => !store.cleared(u.encounter.id)) ?? null);

// --- Couleurs du sol, par nature de terrain et par niveau de relief ---
const BASE: Record<Terrain, string[]> = {
  grass: ['#4f9a43', '#63b152', '#7cc863'],
  stone: ['#8e93a8', '#a3a8bc', '#babfd0'],
  sand: ['#cfae6a', '#dcbf80', '#e8d09a'],
};

function shade(hex: string, factor: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const c = (shift: number) => Math.round(((n >> shift) & 255) * factor);
  return `rgb(${c(16)}, ${c(8)}, ${c(0)})`;
}
const terrain = computed<Terrain>(() => place.value?.terrain ?? 'grass');
const top = (level: number) => BASE[terrain.value][Math.min(level, 2)];
const side = (level: number, factor: number) => shade(BASE[terrain.value][Math.min(level, 2)], factor);

const go = (id: string) => void router.push(`/tabs/rpg/q/${id}`);

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
.intro {
  margin: 0;
  line-height: 1.5;
  font-size: 14px;
}
.stage {
  border: 3px solid #c9d1ff;
  border-radius: 12px;
  overflow: hidden;
  background: radial-gradient(circle at 50% 30%, #2a3b8f, #0c1337);
  box-shadow: 0 0 0 2px #25326f, 0 6px 16px rgba(0, 0, 0, 0.45);
}
svg {
  display: block;
  width: 100%;
  height: auto;
}
.tile polygon {
  stroke: rgba(0, 0, 0, 0.28);
  stroke-width: 0.8;
  stroke-linejoin: round;
}
.shadow {
  fill: rgba(0, 0, 0, 0.35);
}
.sprite {
  font-size: 26px;
  text-anchor: middle;
}
.name {
  font-size: 10px;
  font-weight: 700;
  text-anchor: middle;
  fill: #fff;
  paint-order: stroke;
  stroke: #0c1337;
  stroke-width: 3px;
}
.npc {
  cursor: pointer;
  outline: none;
}
.npc.cleared {
  opacity: 0.8;
}
.hit {
  fill: transparent;
}
.npc:focus-visible .hit {
  stroke: #ffffff;
  stroke-width: 2;
}
.ok {
  fill: #1d8a50;
  stroke: #fff;
  stroke-width: 1.5;
}
.okmark {
  font-size: 10px;
  font-weight: 700;
  text-anchor: middle;
  fill: #fff;
}
.bubble {
  fill: #fff;
  stroke: #25326f;
  stroke-width: 1.5;
}
.qmark {
  font-size: 11px;
  font-weight: 800;
  text-anchor: middle;
  fill: #25326f;
}
.arrow {
  font-size: 14px;
  text-anchor: middle;
  fill: #ffe08a;
  stroke: #0c1337;
  stroke-width: 1px;
  animation: bob 1s ease-in-out infinite;
}
@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .arrow {
    animation: none;
  }
}
.menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
}
.row:hover,
.row:focus-visible,
.row:active {
  background: rgba(255, 255, 255, 0.12);
}
.cursor-mark {
  color: #ffe08a;
  visibility: hidden;
}
.row:hover .cursor-mark,
.row:focus-visible .cursor-mark,
.row:active .cursor-mark {
  visibility: visible;
}
.row.done {
  opacity: 0.75;
}
.emoji {
  font-size: 22px;
}
.text {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.text small {
  color: #b9c4ff;
  font-size: 12px;
}
.state {
  font-weight: 800;
  color: #ffe08a;
}
.win-text {
  margin: 0 0 8px;
  color: #ffe08a;
  font-weight: 700;
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
.warn {
  color: var(--iman-gold);
}
</style>
