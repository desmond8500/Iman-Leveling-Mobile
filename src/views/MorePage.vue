<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Plus</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <ul class="menu">
          <li v-for="item in items" :key="item.href">
            <router-link :to="item.href" class="item">
              <ion-icon :icon="item.icon" />
              <span class="text">
                <strong>{{ item.title }}</strong>
                <small>{{ item.subtitle }}</small>
              </span>
              <ion-icon :icon="chevronForward" class="chev" />
            </router-link>
          </li>
        </ul>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { bookmarkOutline, chatbubbleEllipsesOutline, cashOutline, libraryOutline, chevronForward, moonOutline } from 'ionicons/icons';

const items = [
  { href: '/tabs/zakat', title: 'Zakat', subtitle: 'Comprendre, calculer al-Maal et al-Fitr', icon: cashOutline },
  { href: '/tabs/quran', title: 'Coran', subtitle: 'Les 114 sourates, arabe, phonétique et français', icon: libraryOutline },
  { href: '/tabs/prayer', title: 'Prière', subtitle: 'Les 5 prières, ablutions, déroulement', icon: bookmarkOutline },
  { href: '/tabs/reminders', title: 'Rappels', subtitle: 'Hadiths du jour, par thème, favoris', icon: chatbubbleEllipsesOutline },
  { href: '/tabs/ramadan', title: 'Ramadan', subtitle: 'Calendrier des 30 jours', icon: moonOutline },
];
</script>

<style scoped>
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
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background: var(--iman-card);
  color: inherit;
  text-decoration: none;
}
.item > ion-icon:first-child {
  font-size: 24px;
  color: var(--iman-gold);
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
</style>
