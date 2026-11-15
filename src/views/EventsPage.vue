<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/more" text="" />
        </ion-buttons>
        <ion-title>Événements</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <ul class="menu">
          <li v-for="e in rows" :key="e.id">
            <router-link :to="`/tabs/events/${e.id}`" class="item">
              <span class="text">
                <strong>{{ e.title }}</strong>
                <small>{{ e.subtitle }}</small>
                <small v-if="e.when" class="when">{{ e.when }}</small>
              </span>
              <span v-if="e.arabic" class="arabic" dir="rtl" lang="ar">{{ e.arabic }}</span>
              <ion-icon :icon="chevronForward" class="chev" />
            </router-link>
          </li>
        </ul>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { chevronForward } from 'ionicons/icons';
import { EVENTS } from '@/data/events';
import { daysUntilLabel, nextHijriOccurrence } from '@/utils/events';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const rows = computed(() => {
  const now = new Date();
  return EVENTS.map((e) => {
    const next = e.hijri ? nextHijriOccurrence(now, e.hijri.month, e.hijri.day) : null;
    return {
      id: e.id,
      title: e.title,
      subtitle: e.subtitle,
      arabic: e.arabic,
      when: next ? `Prochain : ${dateFormat.format(next)} (${daysUntilLabel(now, next)})` : '',
    };
  });
});
</script>

<style scoped>
.wrap {
  margin: 0 auto;
  padding: 16px;
}
.menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: var(--iman-card);
  color: inherit;
  text-decoration: none;
}
.text {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.text small,
.chev {
  color: var(--iman-text-soft);
}
.when {
  color: var(--iman-gold) !important;
}
.arabic {
  font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', 'Geeza Pro', serif;
  font-size: 20px;
  color: var(--iman-gold);
}
</style>
