import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { RPG_PLACES } from '@/data/rpg';
import { loadJson, saveJson } from '@/services/storage';
import {
  answer as answerEncounter, canPlay, currentPlace, emptyProgress, findEncounter, isCleared, overall, placeStatus, sanitizeProgress,
  type RpgProgress,
} from '@/utils/rpg';

const KEY = 'iman.rpg.v1';

/** Parcours : progression gardée sur l'appareil (fonctionne sans connexion). */
export const useRpgStore = defineStore('rpg', () => {
  const progress = ref<RpgProgress>(emptyProgress());
  const loaded = ref(false);

  const places = RPG_PLACES;
  const totals = computed(() => overall(places, progress.value));
  const current = computed(() => currentPlace(places, progress.value));
  const finished = computed(() => totals.value.total > 0 && totals.value.done === totals.value.total);

  const persist = () => saveJson(KEY, progress.value).catch(() => undefined);

  async function load() {
    progress.value = sanitizeProgress(await loadJson<unknown>(KEY, null), places);
    loaded.value = true;
  }

  const statusOf = (index: number) => placeStatus(places, index, progress.value);
  const cleared = (id: string) => isCleared(progress.value, id);
  const playable = (id: string) => canPlay(places, id, progress.value);
  const mistakesOf = (id: string) => progress.value.mistakes[id] ?? 0;

  /** Répond à une rencontre. Renvoie `null` si elle n'existe pas ou n'est pas encore accessible. */
  function answer(id: string, choiceId: string): boolean | null {
    const found = findEncounter(places, id);
    if (!found || !playable(id)) return null;
    const result = answerEncounter(progress.value, found.encounter, choiceId);
    progress.value = result.progress;
    void persist();
    return result.correct;
  }

  function reset() {
    progress.value = emptyProgress();
    void persist();
  }

  return { progress, loaded, places, totals, current, finished, load, statusOf, cleared, playable, mistakesOf, answer, reset };
});
