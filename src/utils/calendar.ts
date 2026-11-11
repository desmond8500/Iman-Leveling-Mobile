import { addDays, toDateKey } from './date';

export const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

export const WEEKDAYS_LONG = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const WEEKDAYS_SHORT = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];

/** En-têtes d'une semaine commençant le lundi. */
export const WEEK_HEADER = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Les `n` derniers jours, du plus ancien au plus récent, `todayKey` inclus. */
export function lastDays(todayKey: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(todayKey, i - (n - 1)));
}

/**
 * Grille d'un mois, semaines du lundi au dimanche. Les cases hors du mois valent `null`.
 * `month` est compris entre 0 (janvier) et 11 (décembre).
 */
export function buildMonthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toDateKey(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function monthLabel(year: number, month: number): string {
  return `${MONTHS_FR[month]} ${year}`;
}

/** « lundi 9 novembre » */
export function formatLong(key: string): string {
  const date = parseKey(key);
  return `${WEEKDAYS_LONG[date.getDay()]} ${date.getDate()} ${MONTHS_FR[date.getMonth()]}`;
}

/** « lun » */
export function weekdayShort(key: string): string {
  return WEEKDAYS_SHORT[parseKey(key).getDay()];
}

export function dayNumber(key: string): number {
  return parseKey(key).getDate();
}

/** Décale un couple (année, mois) de `delta` mois. */
export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}
