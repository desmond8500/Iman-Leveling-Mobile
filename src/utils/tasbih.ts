/*
 * Chapelet (tasbih) : logique pure du compteur. Un « modèle » est une suite d'étapes ; chaque étape
 * a un objectif (ou aucun, pour un compteur libre). Atteindre l'objectif passe à l'étape suivante,
 * et finir la dernière étape termine une série.
 */

export interface TasbihPhrase {
  arabic: string;
  translit: string;
  french: string;
}

export interface TasbihStep extends TasbihPhrase {
  /** Nombre de récitations visé ; `null` = compteur libre. */
  target: number | null;
}

export interface TasbihPreset {
  id: string;
  title: string;
  /** Texte sur lequel s'appuie le modèle, s'il y en a un. */
  source?: string;
  steps: TasbihStep[];
}

const SUBHANALLAH: TasbihPhrase = { arabic: 'سُبْحَانَ اللَّهِ', translit: 'Subhana Llah', french: 'Gloire à Allah' };
const ALHAMDULILLAH: TasbihPhrase = { arabic: 'الْحَمْدُ لِلَّهِ', translit: 'Al-hamdu li-Llah', french: 'Louange à Allah' };
const ALLAHU_AKBAR: TasbihPhrase = { arabic: 'اللَّهُ أَكْبَرُ', translit: 'Allahu akbar', french: 'Allah est le plus grand' };
const LA_ILAHA: TasbihPhrase = { arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', translit: 'La ilaha illa Llah', french: "Il n'y a de divinité digne d'adoration qu'Allah" };
const ISTIGHFAR: TasbihPhrase = { arabic: 'أَسْتَغْفِرُ اللَّهَ', translit: 'Astaghfiru Llah', french: "Je demande pardon à Allah" };
const SALAWAT: TasbihPhrase = { arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', translit: 'Allahumma salli ʿala Muhammad', french: 'Ô Allah, prie sur Muhammad' };

const free = (id: string, title: string, phrase: TasbihPhrase, target: number | null): TasbihPreset => ({
  id,
  title,
  steps: [{ ...phrase, target }],
});

export const TASBIH_PRESETS: TasbihPreset[] = [
  {
    id: 'after-prayer',
    title: 'Après la prière',
    source: 'Muslim 596 : 33 tasbih, 33 tahmid et 34 takbir',
    steps: [
      { ...SUBHANALLAH, target: 33 },
      { ...ALHAMDULILLAH, target: 33 },
      { ...ALLAHU_AKBAR, target: 34 },
    ],
  },
  free('subhanallah', 'Subhana Llah', SUBHANALLAH, 33),
  free('alhamdulillah', 'Al-hamdu li-Llah', ALHAMDULILLAH, 33),
  free('allahu-akbar', 'Allahu akbar', ALLAHU_AKBAR, 34),
  free('la-ilaha', 'La ilaha illa Llah', LA_ILAHA, 100),
  free('istighfar', 'Istighfar', ISTIGHFAR, 100),
  free('salawat', 'Salat sur le Prophète ﷺ', SALAWAT, 100),
  free('libre', 'Compteur libre', { arabic: '', translit: 'Compteur libre', french: 'Sans objectif' }, null),
];

export const DEFAULT_PRESET = TASBIH_PRESETS[0].id;
export const MAX_COUNT = 99999;

export const presetById = (id: string): TasbihPreset | undefined => TASBIH_PRESETS.find((p) => p.id === id);

export interface TasbihState {
  preset: string;
  step: number;
  count: number;
  /** Séries entièrement terminées avec ce modèle. */
  rounds: number;
}

export const initialState = (preset: string = DEFAULT_PRESET): TasbihState => ({ preset, step: 0, count: 0, rounds: 0 });

export type TapEvent = 'step' | 'round' | null;

/** Une récitation de plus. L'événement indique si une étape ou une série vient de se terminer. */
export function tap(state: TasbihState): { state: TasbihState; event: TapEvent } {
  const preset = presetById(state.preset);
  if (!preset) return { state, event: null };
  const step = preset.steps[state.step];
  if (!step || state.count >= MAX_COUNT) return { state, event: null };

  const count = state.count + 1;
  if (step.target === null || count < step.target) return { state: { ...state, count }, event: null };

  if (state.step + 1 < preset.steps.length) return { state: { ...state, step: state.step + 1, count: 0 }, event: 'step' };
  return { state: { ...state, step: 0, count: 0, rounds: state.rounds + 1 }, event: 'round' };
}

/** Annule la dernière récitation, même si elle avait terminé une étape ou une série. */
export function undo(state: TasbihState): TasbihState {
  const preset = presetById(state.preset);
  if (!preset) return state;
  if (state.count > 0) return { ...state, count: state.count - 1 };

  if (state.step > 0) {
    const prev = preset.steps[state.step - 1];
    return { ...state, step: state.step - 1, count: Math.max(0, (prev.target ?? 1) - 1) };
  }
  if (state.rounds > 0) {
    const last = preset.steps.length - 1;
    return { ...state, rounds: state.rounds - 1, step: last, count: Math.max(0, (preset.steps[last].target ?? 1) - 1) };
  }
  return state;
}

/** Remet le compteur à zéro (les séries terminées sont aussi remises à zéro). */
export const reset = (state: TasbihState): TasbihState => initialState(state.preset);

/** Change de modèle en repartant de zéro. Un identifiant inconnu est ignoré. */
export function choosePreset(state: TasbihState, id: string): TasbihState {
  return presetById(id) ? initialState(id) : state;
}

/** Total de récitations de la série en cours (étapes terminées + étape en cours). */
export function doneInRound(state: TasbihState): number {
  const preset = presetById(state.preset);
  if (!preset) return 0;
  const before = preset.steps.slice(0, state.step).reduce((sum, s) => sum + (s.target ?? 0), 0);
  return before + state.count;
}

export const roundTotal = (preset: TasbihPreset): number | null =>
  preset.steps.every((s) => s.target !== null) ? preset.steps.reduce((sum, s) => sum + (s.target as number), 0) : null;

/** État relu du stockage : ramené à des valeurs valides. */
export function sanitizeState(value: unknown): TasbihState {
  if (typeof value !== 'object' || value === null) return initialState();
  const v = value as Partial<TasbihState>;
  const preset = typeof v.preset === 'string' ? presetById(v.preset) : undefined;
  if (!preset) return initialState();
  const int = (n: unknown, max: number) => (typeof n === 'number' && Number.isInteger(n) && n >= 0 ? Math.min(n, max) : 0);
  const step = int(v.step, preset.steps.length - 1);
  const target = preset.steps[step].target;
  const count = int(v.count, target === null ? MAX_COUNT : target - 1);
  return { preset: preset.id, step, count, rounds: int(v.rounds, MAX_COUNT) };
}
