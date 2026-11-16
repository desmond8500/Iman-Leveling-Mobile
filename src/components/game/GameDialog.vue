<template>
  <div class="dlg" role="group" :aria-label="`${name} dit`" @click="skip">
    <div class="face" aria-hidden="true">
      <VectorSprite v-if="look" :look="look" portrait :size="54" />
      <span v-else class="emoji">{{ emoji }}</span>
    </div>
    <div class="body">
      <strong class="who">{{ name }} :</strong>
      <p class="sr">{{ text }}</p>
      <p class="line" aria-hidden="true">{{ shown }}</p>
    </div>
    <span v-if="finished" class="next" aria-hidden="true">▼</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import VectorSprite from '@/components/VectorSprite.vue';
import type { Look } from '@/utils/sprite';
import { revealLength } from '@/utils/typewriter';

/** Boîte de dialogue compacte de l'écran de jeu : portrait, nom, texte qui s'écrit. Un toucher affiche tout. */
const props = withDefaults(defineProps<{ name: string; text: string; look?: Look; emoji?: string; speed?: number }>(), {
  look: undefined,
  emoji: '✨',
  speed: 45,
});

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

function skip() {
  cancelAnimationFrame(frame);
  count.value = props.text.length;
}

watch(() => props.text, start, { immediate: true });
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<style scoped>
.dlg {
  position: relative;
  display: flex;
  gap: 9px;
  min-height: 100%;
  padding: 8px 10px 18px 8px;
  border: 2px solid #e9ecf7;
  border-radius: 8px;
  background: rgba(14, 20, 48, 0.88);
  box-shadow: 0 0 0 2px rgba(14, 20, 48, 0.7), 0 6px 14px rgba(0, 0, 0, 0.4);
  color: #f4f6ff;
}
.face {
  flex: none;
  width: 54px;
  height: 54px;
  border: 2px solid #e9ecf7;
  border-radius: 6px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #f0b86a, #b5523b);
}
.face svg {
  display: block;
}
.emoji {
  font-size: 30px;
}
.body {
  min-width: 0;
}
.who {
  display: block;
  margin-bottom: 2px;
  color: #7fb2ff;
  font-size: 14px;
}
.line {
  margin: 0;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 1.45;
  white-space: pre-wrap;
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
  left: 50%;
  bottom: 2px;
  font-size: 10px;
  color: #e9ecf7;
  animation: nudge 0.8s ease-in-out infinite;
}
@keyframes nudge {
  50% {
    transform: translateY(2px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .next {
    animation: none;
  }
}
</style>
