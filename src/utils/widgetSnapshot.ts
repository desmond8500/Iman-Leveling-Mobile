/*
 * Instantané des données affichées par les widgets Android. L'application le construit puis le
 * confie au code natif (voir services/widgetBridge.ts) : les widgets n'ont donc aucune logique
 * métier à dupliquer, ils choisissent seulement quoi afficher selon l'heure.
 */
import { ADHKAR_KEYS, PERIODS, adhkarFor, adhkarKey } from '@/data/adhkar';
import { NAMES } from '@/data/names';
import { PRAYERS } from '@/data/prayers';
import type { DayRecord, Period } from '@/types';
import { toDateKey } from './date';
import { formatHijri, toHijri } from './hijri';
import { PRAYER_KEYS, prayerWindows, computePrayerTimes, type CalcOptions, type Coordinates } from './prayerTimes';
import { ramadanDays, resolveRamadan } from './ramadan';

export const SNAPSHOT_VERSION = 1;

export interface SnapshotSunnah {
  id: string;
  name: string;
  rakaat: number;
  done: boolean;
}

/** Temps de validité d'une prière, pour un jour donné. Les heures sont des millisecondes epoch. */
export interface SnapshotSlot {
  dateKey: string;
  id: string;
  name: string;
  arabic: string;
  start: number;
  end: number;
  done: boolean;
  sunnah: SnapshotSunnah[];
}

export interface SnapshotDhikr {
  id: string;
  title: string;
  arabic: string;
  count: number;
  done: boolean;
}

export interface SnapshotRamadan {
  /** Minuit local du premier jour. */
  startMs: number;
  /** 29 ou 30. */
  total: number;
  /** Jours jeûnés enregistrés. */
  fasted: number;
  /** Heures du coucher du soleil (rupture) d'aujourd'hui et de demain ; vide sans position. */
  maghrib: number[];
}

export interface WidgetSnapshot {
  version: number;
  generatedAt: number;
  /** Jour local au moment de la génération (« AAAA-MM-JJ »). */
  dateKey: string;
  dateLabel: string;
  hijriLabel: string;
  /** Faux sans position : les widgets invitent alors à ouvrir l'application. */
  hasLocation: boolean;
  slots: SnapshotSlot[];
  adhkar: Record<Period, SnapshotDhikr[]>;
  ramadan: SnapshotRamadan | null;
  /** [arabe, transcription, sens] des 99 noms, dans l'ordre. */
  names: [string, string, string][];
}

export interface SnapshotInput {
  now: Date;
  days: Record<string, DayRecord>;
  location: Coordinates | null;
  options: CalcOptions;
  ramadanStart: string | null;
}

const DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

function ramadanSnapshot(input: SnapshotInput): SnapshotRamadan | null {
  const info = resolveRamadan(input.now, input.ramadanStart);
  if (!info) return null;
  const list = ramadanDays(info.start).filter((d) => d.exists);
  const fasted = list.filter((d) => input.days[toDateKey(d.date)]?.fasting?.fast).length;
  const maghrib: number[] = [];
  if (input.location) {
    for (const offset of [0, 1]) {
      const day = new Date(input.now.getFullYear(), input.now.getMonth(), input.now.getDate() + offset);
      const t = computePrayerTimes(day, input.location, input.options).maghrib;
      if (t) maghrib.push(t.getTime());
    }
  }
  return { startMs: info.start.getTime(), total: list.length, fasted, maghrib };
}

export function buildWidgetSnapshot(input: SnapshotInput): WidgetSnapshot {
  const { now, days, location, options } = input;
  const todayKey = toDateKey(now);
  const day = (key: string): DayRecord | undefined => days[key];

  // Hier (pour Isha après minuit), aujourd'hui et demain.
  const slots: SnapshotSlot[] = [];
  if (location) {
    for (const offset of [-1, 0, 1]) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      const key = toDateKey(date);
      const record = day(key);
      const windows = prayerWindows(date, location, options);
      for (const id of PRAYER_KEYS) {
        const w = windows[id];
        const prayer = PRAYERS.find((p) => p.id === id);
        if (!w || !prayer) continue;
        slots.push({
          dateKey: key,
          id,
          name: prayer.name,
          arabic: prayer.arabic,
          start: w.start.getTime(),
          end: w.end.getTime(),
          done: !!record?.prayers?.[id],
          sunnah: [...prayer.before, ...prayer.after].map((s) => ({
            id: s.id,
            name: s.name,
            rakaat: s.rakaat,
            done: !!record?.sunnah?.[s.id],
          })),
        });
      }
    }
  }

  const today = day(todayKey);
  const adhkar = Object.fromEntries(
    PERIODS.map((period) => [
      period,
      adhkarFor(period).map((d) => ({
        id: d.id,
        title: d.title,
        arabic: d.arabic,
        count: d.count,
        done: !!today?.adhkar?.[adhkarKey(period, d.id)],
      })),
    ]),
  ) as Record<Period, SnapshotDhikr[]>;

  return {
    version: SNAPSHOT_VERSION,
    generatedAt: now.getTime(),
    dateKey: todayKey,
    dateLabel: DATE_FORMAT.format(now),
    hijriLabel: formatHijri(toHijri(now)),
    hasLocation: !!location,
    slots,
    adhkar,
    ramadan: ramadanSnapshot(input),
    names: NAMES.map((n) => [n.arabic, n.translit, n.french]),
  };
}

// --- Actions faites depuis un widget, à appliquer dans l'application ---

export type WidgetAction =
  | { type: 'prayer'; id: string; dateKey: string }
  | { type: 'sunnah'; id: string; dateKey: string }
  | { type: 'dhikr'; id: string; period: Period; dateKey: string };

const KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const PRAYER_IDS = new Set<string>(PRAYER_KEYS);
const SUNNAH_IDS = new Set<string>(PRAYERS.flatMap((p) => [...p.before, ...p.after]).map((s) => s.id));

/** Ne garde que les actions bien formées et connues (les données viennent du stockage natif). */
export function sanitizeWidgetActions(raw: unknown): WidgetAction[] {
  if (!Array.isArray(raw)) return [];
  const out: WidgetAction[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const { type, id, period, dateKey } = item as Record<string, unknown>;
    if (typeof id !== 'string' || typeof dateKey !== 'string' || !KEY_RE.test(dateKey)) continue;
    if (type === 'prayer' && PRAYER_IDS.has(id)) out.push({ type, id, dateKey });
    else if (type === 'sunnah' && SUNNAH_IDS.has(id)) out.push({ type, id, dateKey });
    else if (
      type === 'dhikr' &&
      (period === 'morning' || period === 'evening') &&
      ADHKAR_KEYS.includes(adhkarKey(period, id))
    ) {
      out.push({ type, id, period, dateKey });
    }
  }
  return out;
}

/** Texte de l'état d'une journée, utile aux tests : clés de prières faites. */
export const doneKeysOf = (slots: SnapshotSlot[], dateKey: string) =>
  slots.filter((s) => s.dateKey === dateKey && s.done).map((s) => s.id);

