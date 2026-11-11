import { loadJson, saveJson } from './storage';

/*
 * Texte du Coran, chargé à la demande depuis l'API publique alquran.cloud puis gardé sur
 * l'appareil pour une lecture hors ligne. Le texte n'est volontairement pas saisi dans le code :
 * il vient d'une source établie, pour éviter toute erreur.
 *
 * Éditions demandées : texte arabe uthmani, traduction française (Hamidullah) et translittération
 * latine (phonétique). Le format de la réponse n'a pas pu être vérifié depuis l'environnement de
 * développement : voir les tests de `parseSurahResponse` et corriger au besoin.
 */

export const API_BASE = 'https://api.alquran.cloud/v1';
export const EDITIONS = { arabic: 'quran-uthmani', french: 'fr.hamidullah', phonetic: 'en.transliteration' } as const;

export interface Verse {
  /** Numéro du verset dans la sourate. */
  n: number;
  arabic: string;
  phonetic: string;
  french: string;
}

export type QuranFailure = 'network' | 'format';

export class QuranError extends Error {
  constructor(
    message: string,
    public reason: QuranFailure,
  ) {
    super(message);
    this.name = 'QuranError';
  }
}

export const surahUrl = (n: number) => `${API_BASE}/surah/${n}/editions/${Object.values(EDITIONS).join(',')}`;

interface ApiAyah {
  numberInSurah?: unknown;
  text?: unknown;
}
interface ApiEdition {
  edition?: { identifier?: unknown };
  ayahs?: unknown;
}

/** Fusionne les trois éditions d'une sourate en une liste de versets. */
export function parseSurahResponse(body: unknown, expectedVerses?: number): Verse[] {
  const data = (body as { data?: unknown } | null)?.data;
  if (!Array.isArray(data)) throw new QuranError('Réponse inattendue du service.', 'format');

  const byId = new Map<string, ApiAyah[]>();
  for (const entry of data as ApiEdition[]) {
    const id = entry?.edition?.identifier;
    if (typeof id === 'string' && Array.isArray(entry.ayahs)) byId.set(id, entry.ayahs as ApiAyah[]);
  }
  const arabic = byId.get(EDITIONS.arabic);
  if (!arabic?.length) throw new QuranError('Texte arabe introuvable dans la réponse.', 'format');

  const textsOf = (id: string) => {
    const map = new Map<number, string>();
    for (const a of byId.get(id) ?? []) {
      if (typeof a.numberInSurah === 'number' && typeof a.text === 'string') map.set(a.numberInSurah, a.text);
    }
    return map;
  };
  const fr = textsOf(EDITIONS.french);
  const ph = textsOf(EDITIONS.phonetic);

  const verses: Verse[] = [];
  for (const a of arabic) {
    if (typeof a.numberInSurah !== 'number' || typeof a.text !== 'string') continue;
    verses.push({ n: a.numberInSurah, arabic: a.text, french: fr.get(a.numberInSurah) ?? '', phonetic: ph.get(a.numberInSurah) ?? '' });
  }
  if (!verses.length) throw new QuranError('Aucun verset dans la réponse.', 'format');
  if (expectedVerses !== undefined && verses.length !== expectedVerses) {
    throw new QuranError('Sourate incomplète dans la réponse.', 'format');
  }
  return verses;
}

export async function fetchSurah(
  n: number,
  expectedVerses?: number,
  fetchFn: typeof fetch = (...args) => fetch(...args),
): Promise<Verse[]> {
  let response: Response;
  try {
    response = await fetchFn(surahUrl(n));
  } catch {
    throw new QuranError('Impossible de joindre le service. Vérifie ta connexion.', 'network');
  }
  if (!response.ok) throw new QuranError('Le service a répondu avec une erreur.', 'network');
  return parseSurahResponse(await response.json().catch(() => null), expectedVerses);
}

const cacheKey = (n: number) => `iman.quran.v1.${n}`;

/** Sourate depuis le cache local, sinon depuis le service (puis mise en cache). */
export async function loadSurah(
  n: number,
  expectedVerses?: number,
  fetchFn?: typeof fetch,
): Promise<{ verses: Verse[]; fromCache: boolean }> {
  const cached = await loadJson<Verse[] | null>(cacheKey(n), null);
  if (Array.isArray(cached) && cached.length && (expectedVerses === undefined || cached.length === expectedVerses)) {
    return { verses: cached, fromCache: true };
  }
  const verses = await fetchSurah(n, expectedVerses, fetchFn);
  try {
    await saveJson(cacheKey(n), verses);
  } catch {
    // Cache plein ou indisponible : la lecture continue sans.
  }
  return { verses, fromCache: false };
}
