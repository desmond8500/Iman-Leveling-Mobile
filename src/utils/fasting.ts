import { RAMADAN, toHijri } from './hijri';

export type FastingKind = 'ramadan' | 'white' | 'monday' | 'thursday';

export interface FastingInfo {
  /** Jeûne interdit : Aïd al-Fitr, Aïd al-Adha et jours de tachriq. */
  forbidden: boolean;
  /** Jour de Ramadan (jeûne obligatoire). */
  ramadan: boolean;
  /** Jours blancs (ayyam al-bid) : 13, 14 et 15 de chaque mois hégirien. */
  white: boolean;
}

/** Jours où le jeûne est interdit : 1er Chawwal, 10 à 13 Dhou al-hijja. */
export function isForbiddenFastDay(month: number, day: number): boolean {
  return (month === 10 && day === 1) || (month === 12 && day >= 10 && day <= 13);
}

export const WHITE_DAYS = [13, 14, 15];

export function fastingInfo(date: Date): FastingInfo {
  const h = toHijri(date);
  const forbidden = isForbiddenFastDay(h.month, h.day);
  return {
    forbidden,
    ramadan: h.month === RAMADAN,
    white: !forbidden && h.month !== RAMADAN && WHITE_DAYS.includes(h.day),
  };
}
