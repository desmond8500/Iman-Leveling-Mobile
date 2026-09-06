<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  IonPage,
  IonContent,
  IonInput,
  IonText,
  IonButton,
} from "@ionic/vue";

const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

async function handleLogin() {
  errorMessage.value = "";
  loading.value = true;

  try {
    await auth.login(email.value, password.value);

    await router.replace("/home");
  } 
  
  catch (error: any) {
    console.error("ERREUR LOGIN :", error);
    console.error("RESPONSE :", error.response);
    console.error("DATA :", error.response?.data);

    errorMessage.value =
        error.response?.data?.message ||
        error.message ||
        "Impossible de se connecter.";
    }
  finally {
    loading.value = false;
  }
}
</script>

<template>
  <ion-page>
    <ion-content class="ion-padding">

      <h1>Iman Leveling</h1>
      {{ email }} - {{ password }}

      <ion-input
        v-model="email"
        label="Email"
        label-placement="floating"
        type="email"
      />

      <ion-input
        v-model="password"
        label="Mot de passe"
        label-placement="floating"
        type="text"
      />

      <ion-text color="danger" v-if="errorMessage">
        <p>{{ errorMessage }}</p>
      </ion-text>

      <ion-button
        expand="block"
        :disabled="loading"
        @click="handleLogin"
      >
        {{ loading ? "Connexion..." : "Se connecter" }}
      </ion-button>

    </ion-content>
  </ion-page>
</template>