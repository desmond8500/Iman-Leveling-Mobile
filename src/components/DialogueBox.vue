<template>
  <div class="scene" :class="terrain" @click="skip">
    <!-- Le décor du lieu, assombri, derrière la conversation -->
    <svg v-if="backdrop" class="backdrop" :viewBox="SCENE_VIEWBOX" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <VectorShapes :shapes="backdrop.ground" />
      <g v-for="p in backdrop.props" :key="p.id" :transform="`translate(${p.x} ${p.y}) scale(${p.s})`"><VectorShapes :shapes="p.shapes" /></g>
    </svg>
    <div class="lights" aria-hidden="true">
      <i v-for="n in 14" :key="n" :style="fly(n)" />
    </div>

    <!-- Grand portrait de la personne qui parle, qui dépasse sur le côté -->
    <div class="portrait" aria-hidden="true">
      <span class="glow" />
      <VectorSprite v-if="look" class="sprite" :look="look" :px="8" />
      <span v-else class="face">{{ portrait }}</span>
    </div>

    <div class="box" role="group" :aria-label="`${name} dit`">
      <span class="plate">{{ name }}</span>
      <span class="gem left" aria-hidden="true" />
      <span class="gem right" aria-hidden="true" />
      <p class="sr">{{ text }}</p>
      <p class="line" aria-hidden="true">{{ shown }}<span v-if="!finished" class="caret">▍</span></p>
      <span v-if="finished" class="next" aria-hidden="true" />
    </div>

    <div v-if="finished" class="after"><slot /></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import VectorShapes from '@/components/VectorShapes.vue';
import VectorSprite from '@/components/VectorSprite.vue';
import type { Look } from '@/utils/sprite';
import type { Terrain } from '@/utils/rpg';
import { buildScene, SCENE_VIEWBOX } from '@/utils/vectorScene';
import { revealLength } from '@/utils/typewriter';

const props = withDefaults(defineProps<{ name: string; text: string; portrait: string; look?: Look; terrain?: Terrain; placeId?: string; speed?: number }>(), {
  look: undefined,
  terrain: 'grass',
  placeId: undefined,
  speed: 55,
});
const emit = defineEmits<{ finished: [] }>();

/** Décor du lieu en fond (sans les personnages). */
const backdrop = computed(() => (props.placeId ? buildScene(props.placeId, 0, props.terrain) : null));

const count = ref(0);
let frame = 0;
const shown = computed(() => props.text.slice(0, count.value));
const finished = computed(() => count.value >= props.text.length);

const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function start() {
  cancelAnimationFrame(frame);
  if (reduced()) {
    count.value = props.text.length;
    return;
  }
  count.value = 0;
  const t0 = performance.now();
  const step = (now: number) => {
    count.value = revealLength(now - t0, props.speed, props.text.length);
    if (count.value < props.text.length) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
}

/** Un toucher sur la scène affiche tout le texte d'un coup. */
function skip() {
  if (!finished.value) {
    cancelAnimationFrame(frame);
    count.value = props.text.length;
  }
}

/** Lucioles : positions déterministes. */
function fly(n: number) {
  return {
    left: `${(n * 41) % 96}%`,
    top: `${(n * 23) % 70}%`,
    animationDelay: `${((n * 37) % 40) / 10}s`,
    animationDuration: `${3 + ((n * 17) % 30) / 10}s`,
  };
}

watch(() => props.text, start, { immediate: true });
watch(finished, (f) => f && emit('finished'));
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<style scoped>
.scene {
  position: relative;
  min-height: calc(100dvh - 130px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 14px;
  padding: 16px 14px 28px;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 22%, rgba(255, 170, 70, 0.35), transparent 38%),
    radial-gradient(circle at 70% 12%, rgba(255, 190, 90, 0.22), transparent 34%),
    linear-gradient(180deg, #1c2a1a 0%, #14200f 55%, #0b1408 100%);
}
.scene.stone {
  background:
    radial-gradient(circle at 18% 22%, rgba(255, 170, 70, 0.3), transparent 38%),
    linear-gradient(180deg, #2a2d3d 0%, #1b1d2b 55%, #0d0e18 100%);
}
.scene.sand {
  background:
    radial-gradient(circle at 18% 22%, rgba(255, 190, 90, 0.4), transparent 38%),
    linear-gradient(180deg, #3b2c18 0%, #2a1e10 55%, #150f08 100%);
}
.backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: blur(1.5px) brightness(0.55) saturate(0.9);
  transform: scale(1.04);
}
.scene::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(11, 16, 48, 0.1) 0%, rgba(11, 16, 48, 0.75) 75%);
  pointer-events: none;
}
.lights {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.lights,
.portrait,
.box,
.after {
  z-index: 1;
}
.lights i {
  position: absolute;
  width: 5px;
  height: 5px;
  background: #ffd98a;
  box-shadow: 0 0 10px 3px rgba(255, 210, 120, 0.7);
  animation: float ease-in-out infinite alternate;
}
.portrait {
  position: relative;
  align-self: flex-end;
  width: 200px;
  height: 240px;
  margin-bottom: -46px;
  display: grid;
  place-items: end center;
  pointer-events: none;
  animation: slide 0.45s ease-out both;
}
.glow {
  position: absolute;
  inset: 10% 0 0;
  border-radius: 50% 50% 0 0;
  background: radial-gradient(circle at 50% 40%, rgba(255, 190, 110, 0.55), transparent 70%);
}
.sprite {
  position: relative;
  filter: drop-shadow(0 8px 0 rgba(0, 0, 0, 0.35));
}
.face {
  position: relative;
  font-size: 150px;
  line-height: 1;
  filter: drop-shadow(0 10px 0 rgba(0, 0, 0, 0.35));
}
.box {
  position: relative;
  z-index: 2;
  padding: 26px 22px 22px;
  min-height: 108px;
  background: rgba(14, 20, 48, 0.9);
  border: 2px solid #e9ecf7;
  border-radius: 8px;
  box-shadow:
    0 0 0 3px rgba(14, 20, 48, 0.8),
    0 10px 20px rgba(0, 0, 0, 0.45);
  color: #f4f6ff;
}
.plate {
  position: absolute;
  top: -22px;
  left: 28px;
  padding: 3px 22px;
  border: 2px solid #e9ecf7;
  border-radius: 6px;
  background: #1c2550;
  box-shadow: 0 0 0 2px rgba(14, 20, 48, 0.8);
  color: #7fb2ff;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 14px;
}
.gem {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: #ffd34d;
  border: 2px solid #e9ecf7;
  transform: translateY(-50%) rotate(45deg);
}
.gem.left {
  left: -14px;
}
.gem.right {
  right: -14px;
}
.line {
  margin: 0;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 17px;
  line-height: 1.55;
  white-space: pre-wrap;
}
.caret {
  opacity: 0.5;
}
.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  margin: 0;
}
.next {
  position: absolute;
  right: 14px;
  bottom: 12px;
  width: 0;
  height: 0;
  border-left: 14px solid #e9ecf7;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  animation: nudge 0.8s ease-in-out infinite;
}
.after {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: slide 0.3s ease-out both;
}
@keyframes float {
  from {
    transform: translate(0, 0);
    opacity: 0.2;
  }
  to {
    transform: translate(10px, -14px);
    opacity: 1;
  }
}
@keyframes slide {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes nudge {
  50% {
    transform: translateX(4px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .lights i,
  .portrait,
  .after,
  .next {
    animation: none;
  }
}
</style>
