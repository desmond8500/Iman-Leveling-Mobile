<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Iman Leveling</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <PlayerHeader
          :level="store.levelInfo.level"
          :xp-into-level="store.levelInfo.xpIntoLevel"
          :xp-for-next="store.levelInfo.xpForNext"
          :total-xp="store.totalXp"
          :streak="store.streak"
        />

        <div class="section-title">
          <h2>Prières du jour</h2>
          <span class="count">{{ store.doneToday }} / {{ store.todayPrayers.length }}</span>
        </div>

        <div class="list">
          <PrayerCard
            v-for="prayer in store.todayPrayers"
            :key="prayer.id"
            :prayer="prayer"
            @toggle="onToggle(prayer.id)"
          />
        </div>

        <p class="tip">Les 5 prières accomplies rapportent un bonus de 50 XP.</p>
      </div>

      <ion-toast
        :is-open="toast.open"
        :message="toast.message"
        :duration="1800"
        position="top"
        @didDismiss="toast.open = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from 'vue';
import { IonContent, IonHeader, IonPage, IonTitle, IonToast, IonToolbar } from '@ionic/vue';
import PlayerHeader from '@/components/PlayerHeader.vue';
import PrayerCard from '@/components/PrayerCard.vue';
import { useProgressStore } from '@/stores/progress';
import type { PrayerId } from '@/types';

const store = useProgressStore();
const toast = reactive({ open: false, message: '' });

async function onToggle(id: PrayerId) {
  const { xpDelta, leveledUp } = await store.togglePrayer(id);
  if (leveledUp) {
    toast.message = `Niveau ${store.levelInfo.level} atteint !`;
  } else if (xpDelta > 0) {
    toast.message = `+${xpDelta} XP`;
  } else {
    toast.message = `${xpDelta} XP`;
  }
  toast.open = true;
}

// Si l'app reste ouverte au-delà de minuit, on repart sur la nouvelle journée.
function onVisible() {
  if (document.visibilityState === 'visible') store.refreshToday();
}

onMounted(() => {
  store.load();
  document.addEventListener('visibilitychange', onVisible);
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisible);
});
</script>

<style scoped>
.wrap {
  max-width: 560px;
  margin: 0 auto;
  padding: 16px;
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 24px 4px 12px;
}
.section-title h2 {
  margin: 0;
  font-size: 18px;
}
.count {
  color: var(--iman-gold);
  font-weight: 700;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tip {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--iman-text-soft);
}
</style>
