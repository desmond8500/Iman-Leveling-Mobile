<template>
  <ion-app>
    <ion-router-outlet />
    <SplashScreen />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import SplashScreen from '@/components/SplashScreen.vue';
import { useProgressStore } from '@/stores/progress';
import { useSettingsStore } from '@/stores/settings';

const store = useProgressStore();
const settings = useSettingsStore();

// Si l'app reste ouverte au-delà de minuit, on repart sur la nouvelle journée.
function onVisible() {
  if (document.visibilityState === 'visible') store.refreshToday();
}

// Les données sont chargées ici : tous les onglets en ont besoin.
onMounted(async () => {
  document.addEventListener('visibilitychange', onVisible);
  await Promise.all([store.load(), settings.load()]);
  // Compte lié : on resynchronise au lancement (sans bloquer l'affichage, erreurs gérées par le store).
  if (settings.isLinked) void settings.syncNow();
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisible);
});
</script>
