<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="home" />
          <ion-label>Accueil</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="adhkar" href="/tabs/adhkar">
          <ion-icon :icon="bookOutline" />
          <ion-label>Invocations</ion-label>
        </ion-tab-button>
        <ion-tab-button v-if="settings.simpleMode" tab="quran" href="/tabs/quran">
          <ion-icon :icon="libraryOutline" />
          <ion-label>Coran</ion-label>
        </ion-tab-button>
        <ion-tab-button v-if="!settings.simpleMode" tab="names" href="/tabs/names">
          <ion-icon :icon="sparklesOutline" />
          <ion-label>Noms d'Allah</ion-label>
        </ion-tab-button>
        <ion-tab-button v-if="!settings.simpleMode" tab="more" href="/tabs/more">
          <ion-icon :icon="gridOutline" />
          <ion-label>Plus</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="settings" href="/tabs/settings">
          <ion-icon :icon="settingsOutline" />
          <ion-label>Paramètres</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { useSettingsStore } from '@/stores/settings';
import { bookOutline, gridOutline, home, libraryOutline, settingsOutline, sparklesOutline } from 'ionicons/icons';

const settings = useSettingsStore();
</script>
