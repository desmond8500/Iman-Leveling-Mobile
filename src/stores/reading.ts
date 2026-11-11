import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { loadJson, saveJson } from '@/services/storage';
import { toDateKey } from '@/utils/date';
import {
  emptyReading,
  markRead,
  monthKeyOf,
  monthlyGoal,
  sanitizeReading,
  setBookmark,
  versesReadInSurah,
  type ReadingData,
} from '@/utils/readingProgress';

const KEY = 'iman.quran.reading.v1';

/**
 * Lecture du Coran : marque-page automatique et suivi du mois. Gardé sur l'appareil seulement
 * (non synchronisé avec le serveur pour l'instant).
 */
export const useReadingStore = defineStore('reading', () => {
  const data = ref<ReadingData>(emptyReading());
  const loaded = ref(false);
  const today = ref(toDateKey(new Date()));

  const bookmark = computed(() => data.value.bookmark);
  const goal = computed(() => monthlyGoal(data.value, today.value));

  async function load() {
    data.value = sanitizeReading(await loadJson<unknown>(KEY, null));
    today.value = toDateKey(new Date());
    loaded.value = true;
  }

  async function persist() {
    await saveJson(KEY, data.value);
  }

  /** Enregistre le marque-page (dernier verset atteint) et les versets lus jusque-là. */
  async function record(surah: number, bookmarkVerse: number, readFrom: number, readTo: number) {
    // Charger d'abord : sinon on écraserait la lecture déjà enregistrée.
    if (!loaded.value) await load();
    today.value = toDateKey(new Date());
    let next = setBookmark(data.value, surah, bookmarkVerse);
    // Rien n'est compté comme lu tant qu'aucun verset n'a été dépassé (readTo < readFrom).
    if (readTo >= readFrom) next = markRead(next, monthKeyOf(today.value), surah, readFrom, readTo);
    data.value = next;
    await persist();
  }

  const readInSurah = (surah: number) => versesReadInSurah(data.value, monthKeyOf(today.value), surah);

  return { data, loaded, bookmark, goal, load, record, readInSurah };
});
