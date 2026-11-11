<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Invocations</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment :value="period" @ionChange="onPeriod">
          <ion-segment-button value="morning">
            <ion-label>Matin</ion-label>
          </ion-segment-button>
          <ion-segment-button value="evening">
            <ion-label>Soir</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <div class="section-title">
          <h2>{{ period === 'morning' ? 'Invocations du matin' : 'Invocations du soir' }}</h2>
          <span class="count">{{ done }} / {{ items.length }}</span>
        </div>

        <div class="list">
          <DhikrCard
            v-for="dhikr in items"
            :key="period + dhikr.id"
            :dhikr="dhikr"
            :done="store.isDhikrDone(period, dhikr.id)"
            @toggle="onToggle(dhikr.id)"
          />
        </div>

        <p class="tip">
          Chaque invocation faite rapporte {{ ADHKAR_HASANAT }} Hasanat. Les textes sont issus des
          recueils classiques ; vérifie-les auprès d'une personne de confiance.
        </p>
      </div>

      <ion-toast
        :is-open="toast.open"
        :message="toast.message"
        :duration="1500"
        position="top"
        @didDismiss="toast.open = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import {
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/vue';
import DhikrCard from '@/components/DhikrCard.vue';
import { adhkarFor } from '@/data/adhkar';
import { useProgressStore } from '@/stores/progress';
import type { Period } from '@/types';
import { ADHKAR_HASANAT } from '@/utils/hasanat';

const store = useProgressStore();

// Matin avant 15 h, soir ensuite.
const period = ref<Period>(new Date().getHours() < 15 ? 'morning' : 'evening');
const items = computed(() => adhkarFor(period.value));
const done = computed(() => store.adhkarDoneCount(period.value));

const toast = reactive({ open: false, message: '' });

function onPeriod(event: CustomEvent) {
  const value = event.detail.value;
  if (value === 'morning' || value === 'evening') period.value = value;
}

async function onToggle(id: string) {
  const { hasanatDelta, leveledUp } = await store.toggleDhikr(period.value, id);
  toast.message = leveledUp
    ? `Niveau ${store.levelInfo.level} atteint !`
    : `${hasanatDelta > 0 ? '+' : ''}${hasanatDelta} Hasanat`;
  toast.open = true;
}
</script>

<style scoped>
.wrap {
  margin: 0 auto;
  padding: 16px;
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 8px 4px 12px;
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
  gap: 14px;
}
.tip {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--iman-text-soft);
}
</style>
