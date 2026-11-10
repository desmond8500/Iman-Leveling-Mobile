<template>
  <ion-app>
    <ion-router-outlet />
    <SplashScreen />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import SplashScreen from '@/components/SplashScreen.vue';
</script>
