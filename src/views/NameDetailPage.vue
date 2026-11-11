<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/names" text="Noms" />
        </ion-buttons>
        <ion-title>Nom {{ number }} / {{ NAMES.length }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div v-if="name" class="wrap">
        <section class="hero">
          <p class="arabic" dir="rtl" lang="ar">{{ name.arabic }}</p>
          <h1 class="translit">{{ name.translit }}</h1>
          <p class="french">{{ name.french }}</p>
        </section>

        <section class="card">
          <h2>Explication</h2>
          <p>{{ name.explanation }}</p>
        </section>

        <section v-if="partner" class="card">
          <h2>À citer avec</h2>
          <router-link class="pair" :to="`/tabs/names/${partner.n}`">
            <span class="num">{{ partner.n }}</span>
            <span class="text">
              <span class="p-translit">{{ partner.translit }}</span>
              <span class="p-french">{{ partner.french }}</span>
            </span>
            <span class="p-arabic" dir="rtl" lang="ar">{{ partner.arabic }}</span>
          </router-link>
          <p class="hint">Ces deux noms se complètent : on les mentionne ensemble.</p>
        </section>

        <section class="card">
          <h2>Invoquer par ce nom</h2>
          <p class="verse-ar" dir="rtl" lang="ar">{{ NAMES_VERSE.arabic }}</p>
          <p>{{ NAMES_VERSE.french }}</p>
          <p class="hint">{{ NAMES_VERSE.reference }}</p>
        </section>

        <nav class="nav">
          <ion-button fill="outline" size="small" :disabled="number <= 1" @click="go(number - 1)">
            <ion-icon slot="start" :icon="chevronBack" /> Précédent
          </ion-button>
          <ion-button
            fill="outline"
            size="small"
            :disabled="number >= NAMES.length"
            @click="go(number + 1)"
          >
            Suivant <ion-icon slot="end" :icon="chevronForward" />
          </ion-button>
        </nav>
      </div>

      <p v-else class="missing">Ce nom n'existe pas.</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { NAMES, NAMES_VERSE, nameByNumber } from '@/data/names';

// Le numéro arrive en prop (route avec `props: true`) : il reste fixe pour cette vue,
// même quand Ionic garde la page en pile pendant qu'on en ouvre une autre.
const props = defineProps<{ n: string }>();
const router = useRouter();

const number = computed(() => Number.parseInt(props.n, 10));
const name = computed(() => nameByNumber(number.value));
const partner = computed(() => (name.value?.pair ? nameByNumber(name.value.pair) : undefined));

function go(target: number) {
  if (target >= 1 && target <= NAMES.length) router.push(`/tabs/names/${target}`);
}
</script>

<style scoped>
.wrap {
  max-width: 560px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hero {
  padding: 24px 16px;
  border: 1px solid rgba(242, 201, 76, 0.25);
  border-radius: 20px;
  background: var(--iman-card);
  text-align: center;
}
.arabic {
  margin: 0;
  font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', 'Geeza Pro', serif;
  font-size: 56px;
  line-height: 1.6;
  color: var(--iman-gold);
}
.translit {
  margin: 4px 0 0;
  font-size: 24px;
}
.french {
  margin: 6px 0 0;
  color: var(--iman-text-soft);
}
.card {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: var(--iman-card);
}
.card h2 {
  margin: 0 0 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--iman-gold);
}
.card p {
  margin: 0;
  line-height: 1.55;
}
.hint {
  margin-top: 8px !important;
  font-size: 12px;
  color: var(--iman-text-soft);
}
.verse-ar {
  margin-bottom: 8px !important;
  font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', 'Geeza Pro', serif;
  font-size: 22px;
  line-height: 1.9;
  text-align: center;
}
.pair {
  display: flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}
.num {
  flex: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(242, 201, 76, 0.15);
  color: var(--iman-gold);
  font-size: 13px;
  font-weight: 700;
}
.text {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.p-translit {
  font-weight: 700;
}
.p-french {
  font-size: 12px;
  color: var(--iman-text-soft);
}
.p-arabic {
  font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', 'Geeza Pro', serif;
  font-size: 24px;
}
.nav {
  display: flex;
  justify-content: space-between;
}
.missing {
  padding: 32px;
  text-align: center;
  color: var(--iman-text-soft);
}
</style>
