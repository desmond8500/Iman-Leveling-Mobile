<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/more" text="" />
        </ion-buttons>
        <ion-title>Chapelet</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <div class="chips" role="tablist" aria-label="Modèle de chapelet">
          <button
            v-for="p in TASBIH_PRESETS"
            :key="p.id"
            type="button"
            role="tab"
            class="chip"
            :class="{ active: p.id === store.preset.id }"
            :aria-selected="p.id === store.preset.id"
            @click="store.selectPreset(p.id)"
          >
            {{ p.title }}
          </button>
        </div>

        <section class="phrase">
          <p v-if="store.step.arabic" class="arabic" dir="rtl" lang="ar">{{ store.step.arabic }}</p>
          <p class="translit">{{ store.step.translit }}</p>
          <p class="french">{{ store.step.french }}</p>
        </section>

        <button type="button" class="dial" aria-label="Compter une récitation" @click="onTap">
          <span class="count">{{ store.state.count }}</span>
          <span v-if="store.step.target !== null" class="target">/ {{ store.step.target }}</span>
        </button>

        <div v-if="store.preset.steps.length > 1" class="dots" aria-hidden="true">
          <span
            v-for="(s, i) in store.preset.steps"
            :key="i"
            class="dot"
            :class="{ done: i < store.state.step, current: i === store.state.step }"
          />
        </div>

        <p class="summary">
          <template v-if="store.total !== null">Série : {{ store.progress }} / {{ store.total }} · </template>
          {{ store.state.rounds }} série{{ store.state.rounds > 1 ? 's' : '' }} terminée{{ store.state.rounds > 1 ? 's' : '' }}
        </p>

        <div class="actions">
          <button type="button" class="ghost" @click="store.undo()">− Annuler</button>
          <button type="button" class="ghost" @click="store.reset()">Remettre à zéro</button>
        </div>

        <p v-if="store.preset.source" class="note">{{ store.preset.source }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { useTasbihStore } from '@/stores/tasbih';
import { TASBIH_PRESETS } from '@/utils/tasbih';

const store = useTasbihStore();

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Pas de vibreur : sans importance.
  }
}

function onTap() {
  const event = store.tap();
  vibrate(event === 'round' ? [80, 60, 80] : event === 'step' ? 60 : 10);
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
  align-items: center;
  gap: 16px;
}
.chips {
  display: flex;
  gap: 8px;
  width: 100%;
  overflow-x: auto;
  padding-bottom: 4px;
}
.chip {
  flex: none;
  padding: 8px 14px;
  border: 1px solid rgba(242, 201, 76, 0.3);
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-size: 13px;
}
.chip.active {
  background: var(--iman-gold);
  border-color: var(--iman-gold);
  color: #0f2a4a;
  font-weight: 700;
}
.phrase {
  text-align: center;
}
.phrase p {
  margin: 0;
}
.arabic {
  font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', 'Geeza Pro', serif;
  font-size: 34px;
  line-height: 1.7;
  color: var(--iman-gold);
}
.translit {
  font-size: 18px;
  font-weight: 700;
}
.french {
  font-size: 13px;
  color: var(--iman-text-soft);
}
.dial {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: min(72vw, 260px);
  height: min(72vw, 260px);
  border: 4px solid var(--iman-gold);
  border-radius: 50%;
  background: var(--iman-card);
  color: inherit;
  touch-action: manipulation;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.dial:active {
  transform: scale(0.97);
}
.count {
  font-size: 64px;
  font-weight: 800;
  line-height: 1;
}
.target {
  margin-top: 4px;
  font-size: 16px;
  color: var(--iman-text-soft);
}
.dots {
  display: flex;
  gap: 8px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}
.dot.done {
  background: var(--iman-gold);
}
.dot.current {
  outline: 2px solid var(--iman-gold);
  outline-offset: 2px;
}
.summary,
.note {
  margin: 0;
  font-size: 13px;
  color: var(--iman-text-soft);
  text-align: center;
}
.actions {
  display: flex;
  gap: 12px;
}
.ghost {
  padding: 10px 16px;
  border: 1px solid rgba(242, 201, 76, 0.3);
  border-radius: 12px;
  background: transparent;
  color: inherit;
}
</style>
