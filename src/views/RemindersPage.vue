<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Rappels</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment :value="tab" @ionChange="onTab">
          <ion-segment-button value="daily"><ion-label>Du jour</ion-label></ion-segment-button>
          <ion-segment-button value="browse"><ion-label>Parcourir</ion-label></ion-segment-button>
          <ion-segment-button value="favorites"><ion-label>Favoris</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <p v-if="error" class="error">{{ error }}</p>

        <section v-if="tab === 'daily'" class="stack">
          <p v-if="loading" class="hint">Chargement…</p>
          <HadeethCard v-if="current" :hadeeth="current" :favorite="isFavorite(current.id)" @toggle-favorite="onFavorite" />
          <button type="button" class="btn" :disabled="loading" @click="another">Un autre hadith</button>
        </section>

        <section v-else-if="tab === 'browse'" class="stack">
          <template v-if="!category">
            <p v-if="loading" class="hint">Chargement…</p>
            <ul class="list">
              <li v-for="c in categories" :key="c.id">
                <button type="button" class="row" @click="openCategory(c)">
                  <span class="label">{{ c.title }}</span>
                  <span class="count">{{ c.count }}</span>
                </button>
              </li>
            </ul>
          </template>
          <template v-else>
            <button type="button" class="link" @click="closeCategory">← Catégories</button>
            <h2 class="cat-title">{{ category.title }}</h2>
            <p v-if="loading" class="hint">Chargement…</p>
            <ul class="list">
              <li v-for="item in items" :key="item.id">
                <button type="button" class="row" @click="openHadeeth(item.id)">
                  <span class="label">{{ item.title }}</span>
                </button>
                <HadeethCard
                  v-if="opened[item.id]"
                  :hadeeth="opened[item.id]"
                  :favorite="isFavorite(item.id)"
                  @toggle-favorite="onFavorite"
                />
              </li>
            </ul>
            <button v-if="page < lastPage" type="button" class="btn" :disabled="loading" @click="more">Voir plus</button>
          </template>
        </section>

        <section v-else class="stack">
          <p v-if="!favorites.length" class="hint">Aucun favori pour l'instant.</p>
          <HadeethCard v-for="h in favorites" :key="h.id" :hadeeth="h" :favorite="true" @toggle-favorite="onFavorite" />
        </section>

        <p class="note">
          Hadiths de l'Encyclopédie des paroles prophétiques traduites (hadeethenc.com), avec leur degré
          d'authenticité tel qu'indiqué par la source. Les textes sont chargés en ligne puis gardés sur l'appareil.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { IonContent, IonHeader, IonLabel, IonPage, IonSegment, IonSegmentButton, IonTitle, IonToolbar } from '@ionic/vue';
import HadeethCard from '@/components/HadeethCard.vue';
import {
  HadeethError, dailyHadeeth, loadCategories, loadFavorites, loadHadeeth, loadHadeethPage, pickHadeeth, toggleFavorite,
  type Hadeeth, type HadeethCategory, type HadeethSummary,
} from '@/services/hadeeth';
import { toDateKey } from '@/utils/date';

type Tab = 'daily' | 'browse' | 'favorites';
const tab = ref<Tab>('daily');
const loading = ref(false);
const error = ref('');

const current = ref<Hadeeth | null>(null);
const categories = ref<HadeethCategory[]>([]);
const category = ref<HadeethCategory | null>(null);
const items = ref<HadeethSummary[]>([]);
const page = ref(1);
const lastPage = ref(1);
const opened = reactive<Record<string, Hadeeth>>({});
const favorites = ref<Hadeeth[]>([]);

const isFavorite = (id: string) => favorites.value.some((h) => h.id === id);

async function run(task: () => Promise<void>) {
  loading.value = true;
  error.value = '';
  try {
    await task();
  } catch (e) {
    error.value = e instanceof HadeethError ? e.message : 'Une erreur est survenue.';
  } finally {
    loading.value = false;
  }
}

async function onTab(event: CustomEvent) {
  const value = event.detail.value as Tab;
  if (value === tab.value) return;
  tab.value = value;
  error.value = '';
  if (value === 'daily' && !current.value) await run(async () => void (current.value = await dailyHadeeth(toDateKey(new Date()))));
  if (value === 'browse' && !categories.value.length) await run(async () => void (categories.value = await loadCategories()));
  if (value === 'favorites') favorites.value = await loadFavorites();
}

const another = () => run(async () => void (current.value = await pickHadeeth(String(Math.random()))));

async function openCategory(c: HadeethCategory) {
  category.value = c;
  items.value = [];
  page.value = 1;
  lastPage.value = 1;
  await run(async () => {
    const first = await loadHadeethPage(c.id, 1);
    items.value = first.items;
    lastPage.value = first.lastPage;
  });
}

function closeCategory() {
  category.value = null;
  error.value = '';
}

const more = () =>
  run(async () => {
    if (!category.value) return;
    const next = await loadHadeethPage(category.value.id, page.value + 1);
    page.value += 1;
    lastPage.value = next.lastPage;
    items.value = [...items.value, ...next.items];
  });

const openHadeeth = (id: string) =>
  run(async () => {
    if (opened[id]) {
      delete opened[id];
      return;
    }
    opened[id] = await loadHadeeth(id);
  });

async function onFavorite(h: Hadeeth) {
  favorites.value = await toggleFavorite(h);
}

onMounted(async () => {
  favorites.value = await loadFavorites();
  await run(async () => void (current.value = await dailyHadeeth(toDateKey(new Date()))));
});
</script>

<style scoped>
.wrap {
  margin: 0 auto;
  padding: 16px;
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.list li {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 0;
  border-radius: 14px;
  background: var(--iman-card);
  color: inherit;
  text-align: left;
}
.count {
  color: var(--iman-text-soft);
}
.btn {
  padding: 12px;
  border: 0;
  border-radius: 14px;
  background: var(--iman-gold);
  color: #0f2a4a;
  font-weight: 700;
}
.btn:disabled {
  opacity: 0.6;
}
.link {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: none;
  color: var(--iman-gold);
}
.cat-title {
  margin: 0;
  font-size: 18px;
}
.hint,
.note {
  color: var(--iman-text-soft);
  font-size: 13px;
}
.error {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(220, 70, 70, 0.15);
}
</style>
