<template>
  <button class="sunnah" :class="{ done: sunnah.done }" type="button" @click="$emit('toggle')">
    <span class="dot" />
    <span class="text">
      <span class="name">{{ sunnah.name }}</span>
      <span class="meta">{{ sunnah.rakaat }} rak'ah{{ sunnah.rakaat > 1 ? 's' : '' }}</span>
    </span>
    <span class="reward">+{{ reward }}</span>
    <ion-icon class="check" :icon="sunnah.done ? checkmarkCircle : ellipseOutline" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import { checkmarkCircle, ellipseOutline } from 'ionicons/icons';
import type { SunnahView } from '@/types';
import { sunnahReward } from '@/utils/hasanat';

const props = defineProps<{ sunnah: SunnahView }>();
defineEmits<{ (e: 'toggle'): void }>();

const reward = computed(() => sunnahReward(props.sunnah.emphasized));
</script>

<style scoped>
.sunnah {
  width: calc(100% - 28px);
  margin-left: 28px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border: 1px dashed rgba(242, 201, 76, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.sunnah.done {
  background: rgba(46, 204, 154, 0.12);
  border-style: solid;
  border-color: var(--iman-emerald);
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--iman-gold);
}
.text {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.name {
  font-size: 14px;
  font-weight: 600;
}
.meta {
  font-size: 11px;
  color: var(--iman-text-soft);
}
.reward {
  font-size: 12px;
  font-weight: 700;
  color: var(--iman-gold);
}
.check {
  font-size: 22px;
  color: var(--iman-text-soft);
}
.sunnah.done .check {
  color: var(--iman-emerald);
}
</style>
