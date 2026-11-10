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

const store = useProgressStore();

// Si l'app reste ouverte au-delà de minuit, on repart sur la nouvelle journée.
function onVisible() {
  if (document.visibilityState === 'visible') store.refreshToday();
}

// Les données sont chargées ici : l'accueil comme les invocations en ont besoin.
onMounted(() => {
  store.load();
  document.addEventListener('visibilitychange', onVisible);
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisible);
});
</script>
