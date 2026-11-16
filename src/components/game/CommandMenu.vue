<template>
  <nav class="cmds" aria-label="Commandes">
    <button
      v-for="(c, i) in items"
      :key="c.id"
      type="button"
      class="cmd"
      :class="{ on: active === i }"
      :disabled="c.disabled"
      @pointerenter="active = i"
      @focus="active = i"
      @click="$emit('select', c.id)"
    >
      <span class="cursor" aria-hidden="true">▶</span>{{ c.label }}
    </button>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Command } from './types';

/** Menu de commandes façon RPG (curseur ▶ sur la commande pointée). */
defineProps<{ items: readonly Command[] }>();
defineEmits<{ select: [id: string] }>();
const active = ref(0);
</script>

<style scoped>
.cmds {
  display: flex;
  flex-direction: column;
  padding: 6px 4px;
  border: 2px solid #e9ecf7;
  border-radius: 8px;
  background: rgba(14, 20, 48, 0.88);
  box-shadow: 0 0 0 2px rgba(14, 20, 48, 0.7), 0 6px 14px rgba(0, 0, 0, 0.4);
}
.cmd {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 6px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #f4f6ff;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  text-align: left;
  letter-spacing: 0.02em;
}
.cursor {
  width: 12px;
  font-size: 10px;
  color: #ffd34d;
  visibility: hidden;
}
.cmd.on .cursor {
  visibility: visible;
}
.cmd.on {
  background: rgba(255, 255, 255, 0.1);
}
.cmd:disabled {
  opacity: 0.4;
}
</style>
