import { RAMADAN, toHijri } from './hijri';

export interface RamadanDay {
  /** Numéro du jour, de 1 à 30. */
  n: number;
  date: Date;
  /** Faux si le mois ne compte que 29 jours (le « 30ᵉ » jour est alors le 1er Chawwal). */
  exists: boolean;
  /** Nuits impaires des dix derniers jours : on y recherche la nuit du Destin. */
  oddLastTen: boolean;
}

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Premier jour du Ramadan de l'année hégirienne `hijriYear`, en cherchant autour de `around`. */
export function ramadanStart(hijriYear: number, around: Date): Date | null {
  for (let i = -420; i <= 420; i++) {
    const day = addDays(around, i);
    const h = toHijri(day);
    if (h.year === hijriYear && h.month === RAMADAN && h.day === 1) return day;
  }
  return null;
}

/** Ramadan en cours, ou à défaut le prochain : année hégirienne, premier jour. */
export function currentOrNextRamadan(today: Date): { hijriYear: number; start: Date } | null {
  const h = toHijri(today);
  const year = h.month <= RAMADAN ? h.year : h.year + 1;
  const start = ramadanStart(year, today);
  return start ? { hijriYear: year, start } : null;
}

export function ramadanDays(start: Date): RamadanDay[] {
  return Array.from({ length: 30 }, (_, i) => {
    const date = addDays(start, i);
    const n = i + 1;
    return {
      n,
      date,
      exists: toHijri(date).month === RAMADAN,
      oddLastTen: n >= 21 && n % 2 === 1,
    };
  });
}

/** Les trois blocs de dix jours. */
export const RAMADAN_BLOCKS = [
  { id: 1, title: 'Jours 1 à 10', from: 1, to: 10 },
  { id: 2, title: 'Jours 11 à 20', from: 11, to: 20 },
  { id: 3, title: 'Jours 21 à 30', from: 21, to: 30 },
] as const;

export function blockOf(days: RamadanDay[], from: number, to: number): RamadanDay[] {
  return days.filter((d) => d.n >= from && d.n <= to);
}

const MS_DAY = 86400000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Jours entiers entre `from` et `to` (négatif si `to` est passé). */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to) - startOfDay(from)) / MS_DAY);
}
