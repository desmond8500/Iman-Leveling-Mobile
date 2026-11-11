<template>
  <ion-fab ref="root" vertical="bottom" horizontal="end" :class="{ visible }" :aria-hidden="!visible">
    <ion-fab-button size="small" aria-label="Remonter en haut" :tabindex="visible ? 0 : -1" @click="scrollTop">
      <ion-icon :icon="chevronUpOutline" />
    </ion-fab-button>
  </ion-fab>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { IonFab, IonFabButton, IonIcon } from '@ionic/vue';
import { chevronUpOutline } from 'ionicons/icons';

/**
 * Bouton « remonter en haut ». À placer dans un <ion-content> avec slot="fixed" ; il s'affiche
 * quand on a défilé de plus de `threshold` pixels.
 */
const props = withDefaults(defineProps<{ threshold?: number }>(), { threshold: 400 });

const root = ref<{ $el: HTMLElement } | null>(null);
const visible = ref(false);
let content: (HTMLElement & { scrollToTop?: (ms?: number) => Promise<void>; scrollEvents?: boolean }) | null = null;

function onScroll(event: Event) {
  visible.value = ((event as CustomEvent).detail?.scrollTop ?? 0) > props.threshold;
}

function scrollTop() {
  void content?.scrollToTop?.(300);
}

onMounted(() => {
  content = root.value?.$el.closest('ion-content') ?? null;
  if (!content) return;
  content.scrollEvents = true;
  content.addEventListener('ionScroll', onScroll);
});

onBeforeUnmount(() => content?.removeEventListener('ionScroll', onScroll));
</script>

<style scoped>
ion-fab {
  margin: 0 8px 8px 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}
ion-fab.visible {
  opacity: 1;
  pointer-events: auto;
}
</style>
