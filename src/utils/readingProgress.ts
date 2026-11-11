import { TOTAL_VERSES, surahByNumber } from '@/data/surahs';

/** Plages de versets lus d'une sourate : [[début, fin], ...], triées, sans chevauchement. */
export type Ranges = Array<[number, number]>;

export interface Bookmark {
  surah: number;
  verse: number;
}

export interface ReadingData {
  version: 1;
  /** Dernier endroit lu : sert à « Reprendre la lecture ». */
  bookmark: Bookmark | null;
  /** Versets lus, par mois (« AAAA-MM »), puis par sourate. */
  months: Record<string, Record<string, Ranges>>;
}

export const emptyReading = (): ReadingData => ({ version: 1, bookmark: null, months: {} });

/** « 2026-11 » à partir d'une date locale AAAA-MM-JJ. */
export const monthKeyOf = (dateKey: string): string => dateKey.slice(0, 7);

/** Ajoute les versets de `from` à `to` aux plages (fusionne les plages voisines). */
export function addRange(ranges: Ranges, from: number, to: number): Ranges {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const merged: Ranges = [];
  let current: [number, number] = [lo, hi];
  for (const [a, b] of [...ranges].sort((x, y) => x[0] - y[0])) {
    if (b < current[0] - 1) merged.push([a, b]);
    else if (a > current[1] + 1) {
      merged.push(current);
      current = [a, b];
    } else current = [Math.min(a, current[0]), Math.max(b, current[1])];
  }
  merged.push(current);
  return merged.sort((x, y) => x[0] - y[0]);
}

export const countRanges = (ranges: Ranges): number => ranges.reduce((n, [a, b]) => n + (b - a + 1), 0);

/** Marque un ou plusieurs versets comme lus ce mois-ci. Ignore les versets qui n'existent pas. */
export function markRead(data: ReadingData, month: string, surah: number, from: number, to: number = from): ReadingData {
  const info = surahByNumber(surah);
  if (!info) return data;
  const lo = Math.max(1, Math.min(from, to));
  const hi = Math.min(info.verses, Math.max(from, to));
  if (lo > hi) return data;
  const monthData = data.months[month] ?? {};
  const next = addRange(monthData[String(surah)] ?? [], lo, hi);
  return { ...data, months: { ...data.months, [month]: { ...monthData, [String(surah)]: next } } };
}

export function setBookmark(data: ReadingData, surah: number, verse: number): ReadingData {
  const info = surahByNumber(surah);
  if (!info || verse < 1 || verse > info.verses) return data;
  return { ...data, bookmark: { surah, verse } };
}

export const versesReadInMonth = (data: ReadingData, month: string): number =>
  Object.values(data.months[month] ?? {}).reduce((n, ranges) => n + countRanges(ranges), 0);

export const versesReadInSurah = (data: ReadingData, month: string, surah: number): number =>
  countRanges(data.months[month]?.[String(surah)] ?? []);

export interface MonthlyGoal {
  read: number;
  total: number;
  percent: number;
  remaining: number;
  /** Jours restants, aujourd'hui compris. */
  daysLeft: number;
  /** Versets à lire chaque jour restant pour finir le mois (0 si c'est fait). */
  perDay: number;
}

/** Objectif du mois : lire le Coran en entier (une khatma par mois). */
export function monthlyGoal(data: ReadingData, dateKey: string): MonthlyGoal {
  const [y, m, d] = dateKey.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const daysLeft = daysInMonth - d + 1;
  const read = Math.min(TOTAL_VERSES, versesReadInMonth(data, monthKeyOf(dateKey)));
  const remaining = TOTAL_VERSES - read;
  return {
    read,
    total: TOTAL_VERSES,
    percent: Math.floor((read / TOTAL_VERSES) * 100),
    remaining,
    daysLeft,
    perDay: Math.ceil(remaining / daysLeft),
  };
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Remet en forme des données lues du stockage : tout ce qui est invalide est ignoré. */
export function sanitizeReading(input: unknown): ReadingData {
  const out = emptyReading();
  if (!isObject(input)) return out;

  const b = input.bookmark;
  if (isObject(b) && Number.isInteger(b.surah) && Number.isInteger(b.verse)) {
    out.bookmark = setBookmark(out, b.surah as number, b.verse as number).bookmark;
  }

  if (isObject(input.months)) {
    for (const [month, surahs] of Object.entries(input.months)) {
      if (!/^\d{4}-\d{2}$/.test(month) || !isObject(surahs)) continue;
      let data = out;
      for (const [surah, ranges] of Object.entries(surahs)) {
        if (!Array.isArray(ranges)) continue;
        for (const r of ranges) {
          if (Array.isArray(r) && Number.isInteger(r[0]) && Number.isInteger(r[1])) {
            data = markRead(data, month, Number(surah), r[0], r[1]);
          }
        }
      }
      out.months = data.months;
    }
  }
  return out;
}
