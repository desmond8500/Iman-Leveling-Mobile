<template>
  <ion-app>
    <ion-router-outlet />
    <SplashScreen />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import SplashScreen from '@/components/SplashScreen.vue';
import { useProgressStore } from '@/stores/progress';
import { useReadingStore } from '@/stores/reading';
import { useSettingsStore } from '@/stores/settings';
import { rescheduleNotifications } from '@/services/notifications';
import { applyTheme, resolveTheme } from '@/utils/theme';

const store = useProgressStore();
const settings = useSettingsStore();
const reading = useReadingStore();

// Le thème dépend du réglage et du jour (bleu le vendredi en mode auto).
const refreshTheme = () => applyTheme(resolveTheme(settings.theme, new Date()));
watch(() => settings.theme, refreshTheme);

// Les rappels sont reprogrammés quand la position, la méthode ou les réglages changent,
// et à chaque retour au premier plan (pour couvrir les jours suivants).
async function refreshNotifications() {
  if (!settings.loaded) return;
  try {
    await rescheduleNotifications(settings.location, { method: settings.prayerMethod }, settings.notifications);
  } catch {
    // Les notifications sont un confort : une erreur ne doit pas bloquer l'application.
  }
}
watch(
  () => [settings.location, settings.prayerMethod, settings.notifications],
  () => void refreshNotifications(),
  { deep: true },
);

// Si l'app reste ouverte au-delà de minuit, on repart sur la nouvelle journée.
function onVisible() {
  if (document.visibilityState === 'visible') {
    store.refreshToday();
    refreshTheme();
    void refreshNotifications();
  }
}

// Les données sont chargées ici : tous les onglets en ont besoin.
onMounted(async () => {
  document.addEventListener('visibilitychange', onVisible);
  await Promise.all([store.load(), settings.load(), reading.load()]);
  refreshTheme();
  void refreshNotifications();
  // Compte lié : on resynchronise au lancement (sans bloquer l'affichage, erreurs gérées par le store).
  if (settings.isLinked) void settings.syncNow();
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisible);
});
</script>
