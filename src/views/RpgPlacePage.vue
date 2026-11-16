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

    <ion-content class="game-content" :fullscreen="true">
      <div v-if="place" class="game">
        <p v-if="locked" class="warn">Ce lieu est verrouillé : termine d'abord le lieu précédent.</p>

        <template v-else>
          <!-- Écran de jeu : décor vu de dessus, HUD et mini-carte par-dessus -->
          <div class="stage">
            <svg :viewBox="SCENE_VIEWBOX" role="group" :aria-label="`Décor : ${place.title}`">
              <VectorShapes :shapes="scene.ground" />

              <template v-for="d in drawables" :key="d.key">
                <g v-if="d.kind === 'prop'" :transform="`translate(${d.prop.x} ${d.prop.y}) scale(${d.prop.s})`" aria-hidden="true">
                  <VectorShapes :shapes="d.prop.shapes" />
                </g>

                <g
                  v-else-if="d.kind === 'npc'"
                  class="unit npc"
                  :class="{ cleared: store.cleared(d.encounter.id) }"
                  role="button"
                  tabindex="0"
                  :aria-label="`${d.encounter.who} : ${d.encounter.topic}${store.cleared(d.encounter.id) ? ' (réussi)' : ''}`"
                  @click="go(d.index)"
                  @keydown.enter.prevent="go(d.index)"
                  @keydown.space.prevent="go(d.index)"
                >
                  <circle :cx="d.point.x" :cy="d.point.y - 22" r="26" class="hit" />
                  <ellipse :cx="d.point.x" :cy="d.point.y" rx="12" ry="4" class="shadow" />
                  <VectorSprite
                    :look="npcLook(d.encounter.id)"
                    :px="PX"
                    :phase="d.index"
                    :facing="d.point.x > scene.start.x ? -1 : 1"
                    :x="d.point.x - 8 * PX * d.k"
                    :y="d.point.y - 24 * PX * d.k"
                  />
                  <text :x="d.point.x" :y="d.point.y + 12" class="name">{{ d.encounter.who }}</text>
                  <g v-if="store.cleared(d.encounter.id)">
                    <circle :cx="d.point.x + 17" :cy="d.point.y - 38 * d.k" r="7" class="ok" />
                    <text :x="d.point.x + 17" :y="d.point.y - 38 * d.k + 3.5" class="okmark">✓</text>
                  </g>
                  <g v-else class="bubble-wrap">
                    <circle :cx="d.point.x + 17" :cy="d.point.y - 38 * d.k" r="7" class="bubble" />
                    <text :x="d.point.x + 17" :y="d.point.y - 38 * d.k + 4" class="qmark">!</text>
                  </g>
                </g>

                <g v-else class="unit player" aria-hidden="true">
                  <ellipse :cx="pos.x" :cy="pos.y" rx="12" ry="4" class="shadow" />
                  <VectorSprite :look="avatarLook(avatar.id)" :anim="walking ? 'walk' : 'idle'" :facing="facing" :px="PX" :x="pos.x - 8 * PX" :y="pos.y - 24 * PX" />
                  <text :x="pos.x" :y="pos.y + 12" class="name me">Toi</text>
                </g>
              </template>

              <text v-if="target && !walking" :x="target.point.x" :y="target.point.y - 50 * target.k - 4" class="arrow" aria-hidden="true">▼</text>
            </svg>

            <div class="overlay">
              <GameHud class="hud-card" />
              <GameMinimap :places="store.places" :status-of="store.statusOf" :current-id="place.id" />
            </div>
          </div>

          <!-- Console du bas : commandes à gauche, dialogue à droite -->
          <div class="console">
            <CommandMenu :items="commands" @select="onCommand" />
            <GameDialog :name="dialog.name" :text="dialog.text" :look="dialog.look" :emoji="dialog.emoji" />
          </div>

          <FftWindow v-if="showList" title="Rencontres">
            <ul class="menu">
              <li v-for="(e, i) in place.encounters" :key="e.id">
                <a href="#" class="row" :class="{ done: store.cleared(e.id) }" @click.prevent="go(i)">
                  <span class="cursor-mark" aria-hidden="true">▶</span>
                  <span class="mini"><VectorSprite :look="npcLook(e.id)" portrait :size="38" /></span>
                  <span class="text"><strong>{{ e.who }}</strong><small>{{ e.topic }}</small></span>
                  <span class="state">{{ store.cleared(e.id) ? '✓' : '!' }}</span>
                </a>
              </li>
            </ul>
          </FftWindow>

          <FftWindow v-if="cleared" title="Victoire">
            <p class="win-text">Lieu terminé !</p>
            <router-link class="cmd" to="/tabs/rpg"><span class="cursor-mark" aria-hidden="true">▶</span> Retour à la carte</router-link>
          </FftWindow>
        </template>
      </div>
      <div v-else class="game"><p class="warn">Lieu introuvable.</p></div>
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
import CommandMenu from '@/components/game/CommandMenu.vue';
import GameDialog from '@/components/game/GameDialog.vue';
import GameHud from '@/components/game/GameHud.vue';
import GameMinimap from '@/components/game/GameMinimap.vue';
import type { Command } from '@/components/game/types';
import { avatarLook, npcLook } from '@/data/sprites';
import { useWalker } from '@/composables/useWalker';
import { useAvatarStore } from '@/stores/avatar';
import { useRpgStore } from '@/stores/rpg';
import { isPlaceCleared, type RpgEncounter } from '@/utils/rpg';
import type { Look } from '@/utils/sprite';
import { approachPath, buildScene, SCENE_VIEWBOX, type Point, type Prop } from '@/utils/vectorScene';

/** Taille des personnages dans le décor (32 × 50 unités). */
const PX = 2;

const props = defineProps<{ id: string }>();
const store = useRpgStore();
const avatar = useAvatarStore();
const router = useRouter();

const index = computed(() => store.places.findIndex((p) => p.id === props.id));
const place = computed(() => store.places[index.value]);
const locked = computed(() => index.value >= 0 && store.statusOf(index.value) === 'locked');
const cleared = computed(() => !!place.value && isPlaceCleared(place.value, store.progress));

const scene = computed(() => buildScene(props.id, place.value?.encounters.length ?? 0, place.value?.terrain));

interface Unit {
  encounter: RpgEncounter;
  index: number;
  point: Point;
  /** Taille relative du personnage (enfants plus petits). */
  k: number;
}
const units = computed<Unit[]>(() =>
  (place.value?.encounters ?? []).map((encounter, i) => ({
    encounter,
    index: i,
    point: scene.value.spots[i] ?? scene.value.start,
    k: npcLook(encounter.id).scale ?? 1,
  })),
);
/** La prochaine rencontre à faire : une flèche la désigne. */
const target = computed(() => units.value.find((u) => !store.cleared(u.encounter.id)) ?? null);

// --- Déplacement : l'avatar marche jusqu'à la personne, puis la conversation s'ouvre ---
const { pos, walking, facing, walk, place: teleport } = useWalker(scene.value.start);
watch(
  () => props.id,
  () => teleport(scene.value.start),
);

/** Décor et personnages triés par profondeur : ce qui est plus bas passe devant. */
type Drawable =
  | { kind: 'prop'; key: string; y: number; prop: Prop }
  | ({ kind: 'npc'; key: string; y: number } & Unit)
  | { kind: 'player'; key: string; y: number };
const drawables = computed<Drawable[]>(() =>
  [
    ...scene.value.props.map((prop): Drawable => ({ kind: 'prop', key: prop.id, y: prop.y, prop })),
    ...units.value.map((u): Drawable => ({ kind: 'npc', key: u.encounter.id, y: u.point.y, ...u })),
    { kind: 'player', key: 'player', y: pos.value.y } as Drawable,
  ].sort((a, b) => a.y - b.y),
);

async function go(i: number) {
  const unit = units.value[i];
  if (!unit || walking.value) return;
  await walk(approachPath(pos.value, unit.point), 120);
  void router.push(`/tabs/rpg/q/${unit.encounter.id}`);
}

// --- Console du bas ---
const showList = ref(false);
const commands = computed<Command[]>(() => [
  { id: 'talk', label: 'Parler', disabled: !target.value || walking.value },
  { id: 'list', label: 'Rencontres' },
  { id: 'map', label: 'Carte' },
  { id: 'home', label: 'Accueil' },
]);

function onCommand(id: string) {
  if (id === 'talk' && target.value) void go(target.value.index);
  if (id === 'list') showList.value = !showList.value;
  if (id === 'map') void router.push('/tabs/rpg');
  if (id === 'home') void router.push('/tabs/home');
}

const dialog = computed<{ name: string; text: string; look?: Look; emoji?: string }>(() => {
  const p = place.value;
  if (!p) return { name: '', text: '' };
  if (cleared.value) {
    return { name: 'Narrateur', emoji: '🏆', text: 'Bravo, tu as réussi toutes les rencontres de ce lieu ! Touche « Carte » pour continuer ton chemin.' };
  }
  const nothingDone = p.encounters.every((e) => !store.cleared(e.id));
  if (nothingDone) return { name: p.title, emoji: p.emoji, text: p.intro };
  const t = target.value;
  if (!t) return { name: p.title, emoji: p.emoji, text: p.intro };
  return {
    name: t.encounter.who,
    look: npcLook(t.encounter.id),
    text: `Salam ! Viens me voir, j'ai une question pour toi : « ${t.encounter.topic} ». Touche « Parler » ou touche-moi.`,
  };
});

onMounted(() => {
  if (!store.loaded) void store.load();
  void avatar.load();
});
</script>

<style scoped>
ion-content.game-content {
  --background: radial-gradient(circle at 50% 0%, #1f2b66, #0b1030 70%);
}
.game {
  margin: 0 auto;
  max-width: 560px;
  padding: 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.stage {
  position: relative;
  overflow: hidden;
  border-bottom: 2px solid #e9ecf7;
}
svg {
  display: block;
  width: 100%;
  height: auto;
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
  pointer-events: none;
}
.overlay > * {
  pointer-events: auto;
}
.hud-card {
  width: min(230px, 64%);
}
.console {
  display: grid;
  grid-template-columns: 112px 1fr;
  gap: 8px;
  padding: 0 8px;
  align-items: stretch;
}
.shadow {
  fill: rgba(0, 0, 0, 0.25);
}
.name {
  font-size: 9px;
  font-weight: 800;
  text-anchor: middle;
  fill: #fff;
  paint-order: stroke;
  stroke: #0e1430;
  stroke-width: 3px;
}
.name.me {
  fill: #ffd34d;
}
.npc {
  cursor: pointer;
  outline: none;
}
.npc.cleared {
  opacity: 0.85;
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
  font-weight: 800;
  text-anchor: middle;
  fill: #fff;
}
.bubble {
  fill: #ffffff;
  stroke: #2b1b17;
  stroke-width: 1.5;
}
.qmark {
  font-size: 11px;
  font-weight: 900;
  text-anchor: middle;
  fill: #e2562f;
}
.bubble-wrap {
  animation: bob 1.2s ease-in-out infinite;
}
.arrow {
  font-size: 14px;
  text-anchor: middle;
  fill: #ffd34d;
  stroke: #2b1b17;
  stroke-width: 1px;
  animation: bob 1s ease-in-out infinite;
}
@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .arrow,
  .bubble-wrap {
    animation: none;
  }
}
.game > :deep(.win) {
  margin: 10px 8px 0;
}
.menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
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
  color: #ffd34d;
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
.mini {
  flex: none;
  width: 38px;
  height: 38px;
  border: 2px solid #e9ecf7;
  border-radius: 6px;
  overflow: hidden;
  background: linear-gradient(180deg, #5b7fd6, #2a3a7a);
}
.mini svg {
  display: block;
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
  font-weight: 900;
  color: #ffd34d;
}
.win-text {
  margin: 0 0 8px;
  color: #ffd34d;
  font-weight: 700;
}
.cmd {
  display: block;
  padding: 10px 12px;
  border: 1px solid #c9d1ff;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffd34d;
  font-weight: 700;
  text-decoration: none;
}
.warn {
  margin: 16px;
  color: var(--iman-gold);
}
</style>
