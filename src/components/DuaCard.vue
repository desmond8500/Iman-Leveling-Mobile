<template>
  <figure class="dua">
    <figcaption>{{ dua.title }}</figcaption>
    <p class="arabic" dir="rtl" lang="ar">{{ dua.arabic }}</p>
    <p v-if="dua.translit" class="translit">{{ dua.translit }}</p>
    <p class="french">{{ dua.french }}</p>
    <p class="source">{{ dua.source }}</p>
  </figure>
</template>

<script setup lang="ts">
import type { EventDua } from '@/data/events';

defineProps<{ dua: EventDua }>();
</script>

<style scoped>
.dua {
  margin: 0 0 10px;
  padding: 12px;
  border: 1px solid rgba(242, 201, 76, 0.25);
  border-radius: 14px;
  background: var(--iman-card-done);
}
figcaption {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--iman-gold);
}
p {
  margin: 0 0 6px;
  line-height: 1.5;
}
.arabic {
  font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', 'Geeza Pro', serif;
  font-size: 22px;
  line-height: 1.9;
}
.translit {
  font-style: italic;
  font-size: 14px;
}
.french {
  font-size: 14px;
}
.source {
  margin: 0;
  font-size: 11px;
  color: var(--iman-text-soft);
}
</style>
