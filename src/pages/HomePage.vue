<script setup lang="ts">
import { onMounted } from "vue";
import api from "@/services/api";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

onMounted(async () => {
  const { data } = await api.get("/me");
  userStore.setProfile(data);
});
</script>

<template>
  <ion-page>
    <ion-content class="ion-padding">

      <h1>Iman Leveling</h1>

      <div v-if="userStore.profile">

        <h2>{{ userStore.profile.name }}</h2>

        <p>Niveau {{ userStore.profile.level }}</p>

        <p>XP : {{ userStore.profile.xp }}</p>

        <p>Gemmes : {{ userStore.profile.gems }}</p>

        <p>Tickets : {{ userStore.profile.tickets }}</p>

      </div>

    </ion-content>
  </ion-page>
</template>