/*
 * Parcours (mini RPG) : logique pure de la progression. Le parcours est une suite de lieux ; chaque
 * lieu contient des rencontres (questions à choix multiples). Une bonne réponse valide la rencontre ;
 * une mauvaise renvoie vers une leçon, puis on retente. Un lieu s'ouvre quand le précédent est terminé.
 * Seule la progression sur la carte compte : pas de Hasanat ni de niveau.
 */

export interface RpgChoice {
  id: string;
  text: string;
}

export interface RpgLesson {
  /** La bonne réponse, expliquée. */
  text: string;
  source?: string;
}

export interface RpgEncounter {
  /** Unique dans tout le parcours. */
  id: string;
  /** Personne rencontrée ou situation (« Papa », « Ton patron »). */
  who: string;
  emoji: string;
  /** Sujet de la rencontre (« Les parents »). */
  topic: string;
  prompt: string;
  choices: RpgChoice[];
  correct: string;
  lesson: RpgLesson;
}

export interface RpgPlace {
  id: string;
  title: string;
  emoji: string;
  intro: string;
  encounters: RpgEncounter[];
}

export interface RpgProgress {
  /** Identifiants des rencontres réussies. */
  cleared: string[];
  /** Nombre de mauvaises réponses par rencontre. */
  mistakes: Record<string, number>;
}

export const emptyProgress = (): RpgProgress => ({ cleared: [], mistakes: {} });

export const isCleared = (progress: RpgProgress, id: string) => progress.cleared.includes(id);

export const placeClearedCount = (place: RpgPlace, progress: RpgProgress) =>
  place.encounters.filter((e) => isCleared(progress, e.id)).length;

export const isPlaceCleared = (place: RpgPlace, progress: RpgProgress) =>
  place.encounters.length > 0 && placeClearedCount(place, progress) === place.encounters.length;

export type PlaceStatus = 'locked' | 'open' | 'cleared';

/** Un lieu est ouvert si tous les lieux précédents sont terminés. */
export function placeStatus(places: RpgPlace[], index: number, progress: RpgProgress): PlaceStatus {
  const place = places[index];
  if (!place) return 'locked';
  for (let i = 0; i < index; i++) if (!isPlaceCleared(places[i], progress)) return 'locked';
  return isPlaceCleared(place, progress) ? 'cleared' : 'open';
}

export function overall(places: RpgPlace[], progress: RpgProgress): { done: number; total: number } {
  const total = places.reduce((n, p) => n + p.encounters.length, 0);
  const done = places.reduce((n, p) => n + placeClearedCount(p, progress), 0);
  return { done, total };
}

/** Premier lieu ouvert (celui où l'on en est), ou `null` si le parcours est terminé. */
export function currentPlace(places: RpgPlace[], progress: RpgProgress): RpgPlace | null {
  return places.find((_, i) => placeStatus(places, i, progress) === 'open') ?? null;
}

export function findEncounter(places: RpgPlace[], id: string): { place: RpgPlace; encounter: RpgEncounter; index: number } | null {
  for (let index = 0; index < places.length; index++) {
    const encounter = places[index].encounters.find((e) => e.id === id);
    if (encounter) return { place: places[index], encounter, index };
  }
  return null;
}

/** Une rencontre n'est jouable que si son lieu est ouvert ou terminé. */
export const canPlay = (places: RpgPlace[], id: string, progress: RpgProgress): boolean => {
  const found = findEncounter(places, id);
  return !!found && placeStatus(places, found.index, progress) !== 'locked';
};

export interface AnswerResult {
  correct: boolean;
  progress: RpgProgress;
}

/** Enregistre une réponse. Une rencontre déjà réussie reste réussie. Une réponse inconnue est une erreur. */
export function answer(progress: RpgProgress, encounter: RpgEncounter, choiceId: string): AnswerResult {
  const correct = choiceId === encounter.correct && encounter.choices.some((c) => c.id === choiceId);
  if (correct) {
    return { correct, progress: isCleared(progress, encounter.id) ? progress : { ...progress, cleared: [...progress.cleared, encounter.id] } };
  }
  return {
    correct,
    progress: { ...progress, mistakes: { ...progress.mistakes, [encounter.id]: (progress.mistakes[encounter.id] ?? 0) + 1 } },
  };
}

// --- Mélange déterministe des choix ---

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ordre des choix : stable pour une même rencontre et un même nombre d'erreurs, différent après une erreur. */
export function shuffledChoices(encounter: RpgEncounter, mistakes: number): RpgChoice[] {
  const rand = mulberry32(hash(`${encounter.id}:${mistakes}`));
  const out = [...encounter.choices];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Progression relue du stockage : seuls les identifiants connus sont gardés. */
export function sanitizeProgress(value: unknown, places: RpgPlace[]): RpgProgress {
  const known = new Set(places.flatMap((p) => p.encounters.map((e) => e.id)));
  const v = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>;
  const cleared = Array.isArray(v.cleared)
    ? [...new Set((v.cleared as unknown[]).filter((id): id is string => typeof id === 'string' && known.has(id)))]
    : [];
  const mistakes: Record<string, number> = {};
  if (typeof v.mistakes === 'object' && v.mistakes !== null) {
    for (const [id, n] of Object.entries(v.mistakes as Record<string, unknown>)) {
      if (known.has(id) && typeof n === 'number' && Number.isInteger(n) && n > 0) mistakes[id] = Math.min(n, 999);
    }
  }
  return { cleared, mistakes };
}
