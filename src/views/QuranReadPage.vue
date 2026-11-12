<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/quran" text="" />
        </ion-buttons>
        <ion-title>{{ surah ? surah.name : 'Sourate' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="iman-content" :fullscreen="true">
      <div class="wrap">
        <p v-if="!surah" class="state">Sourate introuvable.</p>
        <template v-else>
          <header class="head">
            <p class="ar" dir="rtl" lang="ar">{{ surah.arabic }}</p>
            <p class="meta">Sourate {{ surah.number }} · {{ surah.verses }} versets</p>
          </header>

          <div class="options" role="group" aria-label="Affichage">
            <button
              v-for="o in OPTIONS"
              :key="o.key"
              type="button"
              class="chip"
              :class="{ on: show[o.key] }"
              :aria-pressed="show[o.key]"
              @click="show[o.key] = !show[o.key]"
            >
              {{ o.label }}
            </button>
          </div>

          <div v-if="loading" class="state"><ion-spinner name="dots" /> Chargement…</div>
          <div v-else-if="error" class="state error" role="alert">
            <p>{{ error }}</p>
            <ion-button size="small" @click="load">Réessayer</ion-button>
          </div>
          <ol v-else ref="listEl" class="verses">
            <li v-for="v in verses" :key="v.n" class="verse" :data-n="v.n">
              <span class="vn">{{ v.n }}</span>
              <p v-if="show.arabic" class="v-ar" dir="rtl" lang="ar">{{ v.arabic }}</p>
              <p v-if="show.phonetic && v.phonetic" class="v-ph">{{ v.phonetic }}</p>
              <p v-if="show.french && v.french" class="v-fr">{{ v.french }}</p>
            </li>
          </ol>

          <nav class="nav">
            <ion-button v-if="prev" fill="outline" size="small" :router-link="`/tabs/quran/${prev.number}`">
              ← {{ prev.name }}
            </ion-button>
            <span class="spacer" />
            <ion-button v-if="next" fill="outline" size="small" :router-link="`/tabs/quran/${next.number}`">
              {{ next.name }} →
            </ion-button>
          </nav>
        </template>
      </div>

      <ScrollTopButton slot="fixed" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import ScrollTopButton from '@/components/ScrollTopButton.vue';
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  onIonViewWillLeave,
} from '@ionic/vue';
import { surahByNumber } from '@/data/surahs';
import { loadSurah, QuranError, type Verse } from '@/services/quran';
import { useReadingStore } from '@/stores/reading';
import { createReadingTracker } from '@/utils/readingTracker';

// Le numéro arrive par la route (props: true) : plus fiable que useRoute dans les onglets Ionic.
const props = defineProps<{ n: string | number; v?: string | number }>();

const number = computed(() => Number(props.n));
const surah = computed(() => surahByNumber(number.value));
const prev = computed(() => surahByNumber(number.value - 1));
const next = computed(() => surahByNumber(number.value + 1));

const OPTIONS = [
  { key: 'arabic', label: 'Arabe' },
  { key: 'phonetic', label: 'Phonétique' },
  { key: 'french', label: 'Français' },
] as const;
const show = reactive({ arabic: true, phonetic: true, french: true });

const reading = useReadingStore();
const verses = ref<Verse[]>([]);
const listEl = ref<HTMLElement | null>(null);
const loading = ref(false);
const error = ref('');

async function load() {
  const s = surah.value;
  if (!s) return;
  loading.value = true;
  error.value = '';
  verses.value = [];
  const requested = s.number;
  try {
    const result = await loadSurah(s.number, s.verses);
    if (requested === number.value) {
      verses.value = result.verses;
      // La liste n'est affichée (v-else) qu'une fois `loading` à faux : sinon `listEl` est encore
      // vide et ni le suivi ni la reprise au marque-page ne démarrent.
      loading.value = false;
      await nextTick();
      resumeAtBookmark();
      startTracking();
    }
  } catch (e) {
    if (requested === number.value) {
      error.value = e instanceof QuranError ? e.message : 'Chargement impossible.';
    }
  } finally {
    if (requested === number.value) loading.value = false;
  }
}

// --- Marque-page automatique et suivi de lecture ---
// La logique (premier verset visible = marque-page ; verset dépassé par le haut = lu) est dans
// utils/readingTracker.ts ; ici on ne fait que lui transmettre ce que voit le navigateur.
let observer: IntersectionObserver | null = null;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let tracker = createReadingTracker(0);
let lastSaved = '';

function resumeAtBookmark() {
  const target = Number(props.v);
  if (!Number.isInteger(target) || target < 1) return;
  listEl.value?.querySelector(`li[data-n="${target}"]`)?.scrollIntoView({ block: 'start' });
}

/** Enregistre le marque-page et les versets lus, si quelque chose a changé. */
function flush() {
  clearTimeout(saveTimer);
  const s = surah.value;
  const snap = tracker.snapshot();
  if (!s || snap.bookmark === null) return;
  const signature = `${s.number}:${snap.bookmark}:${snap.from}:${snap.to}`;
  if (signature === lastSaved) return;
  lastSaved = signature;
  void reading.record(s.number, snap.bookmark, snap.from, snap.to);
}

function onEntries(entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    const n = Number((entry.target as HTMLElement).dataset.n);
    tracker.update(n, entry.isIntersecting, entry.boundingClientRect.top < 0);
  }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 800);
}

function stopTracking() {
  flush();
  observer?.disconnect();
  observer = null;
  tracker.reset();
  lastSaved = '';
}

function startTracking() {
  stopTracking();
  tracker = createReadingTracker(verses.value.length);
  if (typeof IntersectionObserver === 'undefined' || !listEl.value) return;
  observer = new IntersectionObserver(onEntries, { threshold: 0 });
  listEl.value.querySelectorAll('li[data-n]').forEach((el) => observer?.observe(el));
}

// La page reste en mémoire quand on change d'onglet : on enregistre dès qu'on la quitte.
onIonViewWillLeave(flush);

watch(number, () => {
  stopTracking();
  void load();
}, { immediate: true });
onBeforeUnmount(stopTracking);
</script>

<style scoped>
.head {
  text-align: center;
  margin-bottom: 12px;
}
.head .ar {
  margin: 0;
  font-size: 30px;
}
.meta {
  margin: 4px 0 0;
  color: var(--iman-text-soft);
  font-size: 13px;
}
.options {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}
.chip {
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  background: transparent;
  color: var(--iman-text-soft);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.chip.on {
  background: var(--iman-card-done);
  border-color: var(--iman-emerald);
  color: inherit;
}
.state {
  text-align: center;
  color: var(--iman-text-soft);
}
.state.error {
  color: #ff8a80;
}
.verses {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.verse {
  position: relative;
  padding: 14px 14px 14px 46px;
  border-radius: 14px;
  background: var(--iman-card);
}
.vn {
  position: absolute;
  left: 12px;
  top: 14px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--iman-card-done);
  color: var(--iman-gold);
  font-size: 11px;
  font-weight: 700;
}
.verse p {
  margin: 0 0 8px;
}
.verse p:last-child {
  margin-bottom: 0;
}
.v-ar {
  font-size: 26px;
  line-height: 2;
  text-align: right;
}
.v-ph {
  font-style: italic;
  color: var(--iman-emerald);
}
.nav {
  display: flex;
  margin-top: 20px;
}
.spacer {
  flex: 1;
}
</style>
