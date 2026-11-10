import type { DayRecord, ProgressData } from '../types';

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Ne garde que des booléens dans une table de cases cochées. */
function cleanFlags(value: unknown): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (!isObject(value)) return out;
  for (const [k, v] of Object.entries(value)) if (typeof v === 'boolean') out[k] = v;
  return out;
}

/** Remet en forme des données reçues d'un serveur : tout ce qui n'a pas la bonne forme est ignoré. */
export function sanitizeProgress(input: unknown): ProgressData {
  const days: Record<string, DayRecord> = {};
  const raw = isObject(input) && isObject(input.days) ? input.days : {};
  for (const [key, day] of Object.entries(raw)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !isObject(day)) continue;
    const record: DayRecord = { prayers: cleanFlags(day.prayers) };
    if (isObject(day.sunnah)) record.sunnah = cleanFlags(day.sunnah);
    if (isObject(day.adhkar)) record.adhkar = cleanFlags(day.adhkar);
    days[key] = record;
  }
  return { version: 1, days };
}

const orFlags = (a?: Record<string, boolean>, b?: Record<string, boolean>) => {
  const out: Record<string, boolean> = { ...a };
  for (const [k, v] of Object.entries(b ?? {})) out[k] = !!out[k] || v;
  return out;
};

function mergeDay(a?: DayRecord, b?: DayRecord): DayRecord {
  const merged: DayRecord = { prayers: orFlags(a?.prayers, b?.prayers) };
  if (a?.sunnah || b?.sunnah) merged.sunnah = orFlags(a?.sunnah, b?.sunnah);
  if (a?.adhkar || b?.adhkar) merged.adhkar = orFlags(a?.adhkar, b?.adhkar);
  return merged;
}

/**
 * Fusionne deux progressions (appareil et serveur) sans rien perdre : une case cochée d'un côté
 * reste cochée. Contrepartie : décocher sur un appareil ne se propage pas aux autres.
 */
export function mergeProgress(local: ProgressData, remote: ProgressData): ProgressData {
  const days: Record<string, DayRecord> = {};
  for (const key of new Set([...Object.keys(local.days), ...Object.keys(remote.days)])) {
    days[key] = mergeDay(local.days[key], remote.days[key]);
  }
  return { version: 1, days };
}
