<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Invocations</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment :value="tab" @ionChange="onTab">
          <ion-segment-button value="morning">
            <ion-label>Matin</ion-label>
          </ion-segment-button>
          <ion-segment-button value="evening">
            <ion-label>Soir</ion-label>
          </ion-segment-button>
          <ion-segment-button value="citadelle">
            <ion-label>Citadelle</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <template v-if="tab === 'citadelle'">
          <div class="section-title">
            <h2>La Citadelle du musulman</h2>
            <span class="count">{{ CITADELLE_COUNT }}</span>
          </div>
          <p class="tip">
            Sélection d'invocations du quotidien, par situation. Ce n'est pas le recueil complet ;
            d'autres invocations seront ajoutées.
          </p>
          <ion-searchbar
            :value="query"
            placeholder="Rechercher une invocation (français, phonétique, arabe)"
            :debounce="100"
            @ionInput="query = String($event.detail.value ?? '')"
          />
          <p v-if="!citadelleResults.length" class="tip">Aucune invocation trouvée.</p>
          <section v-for="cat in citadelleResults" :key="cat.id" class="cat">
            <h3>{{ cat.title }}</h3>
            <InvocationItem v-for="dua in cat.duas" :key="dua.id" :item="dua" />
          </section>
        </template>

        <template v-else>
        <div class="section-title">
          <h2>{{ period === 'morning' ? 'Invocations du matin' : 'Invocations du soir' }}</h2>
          <span class="count">{{ done }} / {{ items.length }}</span>
        </div>

        <div class="list">
          <DhikrCard
            v-for="dhikr in items"
            :key="period + dhikr.id"
            :dhikr="dhikr"
            :done="store.isDhikrDone(period, dhikr.id)"
            :counter-key="adhkarKey(period, dhikr.id)"
            @toggle="onToggle(dhikr.id)"
          />
        </div>

        <p class="tip">
          Chaque invocation faite rapporte {{ ADHKAR_HASANAT }} Hasanat. Les textes sont issus des
          recueils classiques ; vérifie-les auprès d'une personne de confiance.
        </p>
        </template>
      </div>

      <ion-toast
        :is-open="toast.open"
        :message="toast.message"
        :duration="1500"
        position="top"
        @didDismiss="toast.open = false"
      />

      <ScrollTopButton slot="fixed" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import ScrollTopButton from '@/components/ScrollTopButton.vue';
import { computed, reactive, ref } from 'vue';
import {
  IonContent,
  IonHeader,
  IonLabel,
  IonPage,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/vue';
import DhikrCard from '@/components/DhikrCard.vue';
import InvocationItem from '@/components/InvocationItem.vue';
import { CITADELLE_COUNT, searchCitadelle } from '@/data/citadelle';
import { adhkarFor, adhkarKey } from '@/data/adhkar';
import { useProgressStore } from '@/stores/progress';
import type { Period } from '@/types';
import { ADHKAR_HASANAT } from '@/utils/hasanat';

const store = useProgressStore();

// Matin avant 15 h, soir ensuite.
const tab = ref<'morning' | 'evening' | 'citadelle'>(new Date().getHours() < 15 ? 'morning' : 'evening');
const query = ref('');
const citadelleResults = computed(() => searchCitadelle(query.value));
const period = computed<Period>(() => (tab.value === 'evening' ? 'evening' : 'morning'));
const items = computed(() => adhkarFor(period.value));
const done = computed(() => store.adhkarDoneCount(period.value));

const toast = reactive({ open: false, message: '' });

function onTab(event: CustomEvent) {
  const value = event.detail.value;
  if (value === 'morning' || value === 'evening' || value === 'citadelle') tab.value = value;
}

async function onToggle(id: string) {
  const { hasanatDelta, leveledUp } = await store.toggleDhikr(period.value, id);
  toast.message = leveledUp
    ? `Niveau ${store.levelInfo.level} atteint !`
    : `${hasanatDelta > 0 ? '+' : ''}${hasanatDelta} Hasanat`;
  toast.open = true;
}
</script>

<style scoped>
.cat {
  margin-top: 20px;
}
.cat h3 {
  margin: 0 4px 10px;
  font-size: 15px;
  color: var(--iman-gold);
}
.cat :deep(.invoc) {
  margin-bottom: 12px;
}
.wrap {
  margin: 0 auto;
  padding: 16px;
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 8px 4px 12px;
}
.section-title h2 {
  margin: 0;
  font-size: 18px;
}
.count {
  color: var(--iman-gold);
  font-weight: 700;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.tip {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--iman-text-soft);
}
</style>
