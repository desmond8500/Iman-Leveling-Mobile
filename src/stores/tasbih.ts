import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { loadJson, saveJson } from '@/services/storage';
import {
  TASBIH_PRESETS,
  choosePreset,
  doneInRound,
  initialState,
  presetById,
  reset as resetState,
  roundTotal,
  sanitizeState,
  tap as tapState,
  undo as undoState,
  type TapEvent,
  type TasbihState,
} from '@/utils/tasbih';

const KEY = 'iman.tasbih.v1';

/** Chapelet : l'état du compteur est gardé sur l'appareil, pour reprendre où on s'était arrêté. */
export const useTasbihStore = defineStore('tasbih', () => {
  const state = ref<TasbihState>(initialState());
  const loaded = ref(false);

  const preset = computed(() => presetById(state.value.preset) ?? TASBIH_PRESETS[0]);
  const step = computed(() => preset.value.steps[state.value.step] ?? preset.value.steps[0]);
  const progress = computed(() => doneInRound(state.value));
  const total = computed(() => roundTotal(preset.value));

  const persist = () => saveJson(KEY, state.value).catch(() => undefined);

  async function load() {
    state.value = sanitizeState(await loadJson<unknown>(KEY, null));
    loaded.value = true;
  }

  function tap(): TapEvent {
    const result = tapState(state.value);
    state.value = result.state;
    void persist();
    return result.event;
  }

  function undo() {
    state.value = undoState(state.value);
    void persist();
  }

  function reset() {
    state.value = resetState(state.value);
    void persist();
  }

  function selectPreset(id: string) {
    state.value = choosePreset(state.value, id);
    void persist();
  }

  return { state, loaded, preset, step, progress, total, load, tap, undo, reset, selectPreset };
});
