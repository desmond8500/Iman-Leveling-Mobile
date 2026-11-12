<template>
  <article class="card">
    <h3 v-if="hadeeth.title" class="title">{{ hadeeth.title }}</h3>
    <p class="text">{{ hadeeth.text }}</p>
    <p v-if="hadeeth.attribution" class="meta">{{ hadeeth.attribution }}</p>
    <p v-if="hadeeth.grade" class="grade">Degré : {{ hadeeth.grade }}</p>
    <template v-if="expanded">
      <p v-if="hadeeth.explanation" class="explanation">{{ hadeeth.explanation }}</p>
      <ul v-if="hadeeth.hints.length" class="hints">
        <li v-for="(hint, i) in hadeeth.hints" :key="i">{{ hint }}</li>
      </ul>
    </template>
    <div class="actions">
      <button v-if="hadeeth.explanation || hadeeth.hints.length" type="button" class="link" @click="expanded = !expanded">
        {{ expanded ? "Masquer l'explication" : "Voir l'explication" }}
      </button>
      <button type="button" class="link" @click="$emit('toggle-favorite', hadeeth)">
        {{ favorite ? '★ Retirer des favoris' : '☆ Ajouter aux favoris' }}
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Hadeeth } from '@/services/hadeeth';

defineProps<{ hadeeth: Hadeeth; favorite: boolean }>();
defineEmits<{ (e: 'toggle-favorite', hadeeth: Hadeeth): void }>();

const expanded = ref(false);
</script>

<style scoped>
.card {
  padding: 16px;
  border-radius: 16px;
  background: var(--iman-card);
}
.title {
  margin: 0 0 8px;
  font-size: 15px;
  color: var(--iman-gold);
}
.text {
  margin: 0 0 8px;
  line-height: 1.5;
}
.meta,
.grade {
  margin: 0 0 4px;
  font-size: 12px;
  color: var(--iman-text-soft);
}
.explanation {
  margin: 10px 0 6px;
  font-size: 14px;
  line-height: 1.5;
}
.hints {
  margin: 0 0 6px;
  padding-left: 18px;
  font-size: 13px;
  color: var(--iman-text-soft);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 10px;
}
.link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--iman-gold);
  font-size: 13px;
}
</style>
