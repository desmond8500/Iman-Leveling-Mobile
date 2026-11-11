<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/more" text="" />
        </ion-buttons>
        <ion-title>Zakat</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <section v-for="s in ZAKAT_SECTIONS" :key="s.id" class="card">
          <h2>{{ s.title }}</h2>
          <p v-for="(p, i) in s.paragraphs" :key="i">{{ p }}</p>
        </section>
        <p class="note">
          Ces repères sont généraux. En cas de doute, demande à un savant ou à une institution de confiance.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { ZAKAT_SECTIONS } from '@/data/zakat';
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
