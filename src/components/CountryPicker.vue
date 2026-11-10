<template>
  <ion-modal :is-open="open" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Choisir un pays</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Fermer</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          :value="query"
          placeholder="Rechercher"
          :debounce="100"
          @ionInput="query = String($event.detail.value ?? '')"
        />
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content">
      <ion-list lines="full">
        <ion-item
          v-for="c in filtered"
          :key="c.code"
          button
          :detail="false"
          @click="$emit('select', c.code)"
        >
          <ion-label>{{ c.name }}</ion-label>
          <ion-icon v-if="c.code === selected" slot="end" :icon="checkmarkCircle" color="primary" />
        </ion-item>
      </ion-list>
      <p v-if="filtered.length === 0" class="empty">Aucun pays trouvé.</p>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { checkmarkCircle } from 'ionicons/icons';
import { countryOptions, normalizeText } from '@/data/countries';

defineProps<{ open: boolean; selected: string | null }>();
defineEmits<{
  (e: 'select', code: string): void;
  (e: 'close'): void;
}>();

const query = ref('');
const all = countryOptions('fr');

const filtered = computed(() => {
  const q = normalizeText(query.value.trim());
  return q ? all.filter((c) => normalizeText(c.name).includes(q)) : all;
});
</script>

<style scoped>
.empty {
  padding: 24px;
  text-align: center;
  color: var(--iman-text-soft);
}
</style>
