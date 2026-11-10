<template>
  <article class="dhikr" :class="{ done }">
    <header class="head">
      <h3 class="title">{{ dhikr.title }}</h3>
      <span class="count" :aria-label="`À répéter ${dhikr.count} fois`">×{{ dhikr.count }}</span>
    </header>

    <p class="arabic" dir="rtl" lang="ar">{{ dhikr.arabic }}</p>

    <section class="block">
      <span class="label">Phonétique</span>
      <p class="phonetic">{{ dhikr.phonetic }}</p>
    </section>

    <section class="block">
      <span class="label">Français</span>
      <p class="french">{{ dhikr.french }}</p>
    </section>

    <footer class="foot">
      <span class="source">{{ dhikr.source }}</span>
      <button type="button" class="check" :class="{ done }" :aria-pressed="done" @click="$emit('toggle')">
        <ion-icon :icon="done ? checkmarkCircle : ellipseOutline" />
        {{ done ? 'Fait' : 'Marquer comme fait' }}
      </button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { checkmarkCircle, ellipseOutline } from 'ionicons/icons';
import type { Dhikr } from '@/types';

defineProps<{ dhikr: Dhikr; done: boolean }>();
defineEmits<{ (e: 'toggle'): void }>();
</script>

<style scoped>
.dhikr {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: var(--iman-card);
  transition: background 0.2s ease, border-color 0.2s ease;
}
.dhikr.done {
  background: var(--iman-card-done);
  border-color: var(--iman-emerald);
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.title {
  margin: 0;
  font-size: 16px;
}
.count {
  flex: none;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(242, 201, 76, 0.18);
  color: var(--iman-gold);
  font-weight: 700;
  font-size: 13px;
}
.arabic {
  margin: 16px 0;
  font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', 'Geeza Pro', serif;
  font-size: 26px;
  line-height: 2;
  text-align: right;
}
.block {
  margin-top: 12px;
}
.label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--iman-gold);
}
.phonetic,
.french {
  margin: 4px 0 0;
  font-size: 14px;
  line-height: 1.5;
}
.phonetic {
  font-style: italic;
  color: var(--iman-text-soft);
}
.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}
.source {
  font-size: 11px;
  color: var(--iman-text-soft);
}
.check {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--iman-gold);
  border-radius: 999px;
  background: transparent;
  color: var(--iman-gold);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.check.done {
  border-color: var(--iman-emerald);
  background: var(--iman-emerald);
  color: #06100e;
}
</style>
