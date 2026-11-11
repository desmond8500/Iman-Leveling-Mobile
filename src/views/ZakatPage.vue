<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/more" text="" />
        </ion-buttons>
        <ion-title>Zakat</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment :value="tab" @ionChange="onTab">
          <ion-segment-button value="overview"><ion-label>Aperçu</ion-label></ion-segment-button>
          <ion-segment-button value="fitr"><ion-label>Al-Fitr</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <template v-if="tab === 'overview'">
          <section v-for="s in ZAKAT_SECTIONS" :key="s.id" class="card">
            <h2>{{ s.title }}</h2>
            <p v-for="(p, i) in s.paragraphs" :key="i">{{ p }}</p>
          </section>
        </template>
        <ZakatFitrCalculator v-else-if="tab === 'fitr'" />
        <p class="note">
          Ces repères sont généraux. En cas de doute, demande à un savant ou à une institution de confiance.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import ZakatFitrCalculator from '@/components/ZakatFitrCalculator.vue';
import { ZAKAT_SECTIONS } from '@/data/zakat';

type Tab = 'overview' | 'fitr';
const tab = ref<Tab>('overview');

function onTab(event: CustomEvent) {
  const value = event.detail.value;
  if (value === 'overview' || value === 'fitr') tab.value = value;
}
</script>

<style scoped>
.card {
  margin-bottom: 14px;
  padding: 16px;
  border-radius: 18px;
  background: var(--iman-card);
}
h2 {
  margin: 0 0 8px;
  font-size: 17px;
}
p {
  margin: 0 0 8px;
}
.note {
  margin: 6px 4px 0;
  font-size: 12px;
  color: var(--iman-text-soft);
}
</style>
