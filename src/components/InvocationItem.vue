<template>
  <article class="invoc">
    <h4>{{ item.title }}</h4>
    <p class="arabic" dir="rtl" lang="ar">{{ item.arabic }}</p>
    <p class="phonetic">{{ item.phonetic }}</p>
    <p class="french">{{ item.french }}</p>
    <span class="source">{{ item.source }}</span>
    <CountControl v-if="counterKey" :counter-key="counterKey" :target="item.count" />
  </article>
</template>

<script setup lang="ts">
import CountControl from '@/components/CountControl.vue';

defineProps<{
  item: { title: string; arabic: string; phonetic: string; french: string; source: string; count?: number };
  /** Si renseignée, affiche le compteur + / − (clé propre à l'invocation). */
  counterKey?: string;
}>();
</script>

<style scoped>
.invoc {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: var(--iman-card);
}
h4 {
  margin: 0;
  font-size: 15px;
}
.arabic {
  margin: 10px 0;
  font-size: 22px;
  line-height: 1.9;
  text-align: right;
}
.phonetic {
  margin: 0 0 6px;
  font-style: italic;
  color: var(--iman-emerald);
}
.french {
  margin: 0 0 6px;
}
.source {
  font-size: 12px;
  color: var(--iman-text-soft);
}
</style>
