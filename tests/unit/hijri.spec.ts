import { formatHijri, hijriMonthName, hijriRangeLabel, tabularHijri, toHijri } from '../../src/utils/hijri';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('toHijri (Oumm al-Qora)', () => {
  it('dates connues', () => {
    expect(toHijri(d(2026, 2, 18))).toEqual({ year: 1447, month: 9, day: 1 }); // 1er Ramadan 1447
    expect(toHijri(d(2026, 3, 20))).toEqual({ year: 1447, month: 10, day: 1 }); // 1er Chawwal 1447
    expect(toHijri(d(2026, 5, 27))).toEqual({ year: 1447, month: 12, day: 10 }); // Aïd al-Adha 1447
  });
});

describe('tabularHijri (repli)', () => {
  it('reste à ±1 jour du calendrier réel', () => {
    const cases: [Date, number, number][] = [
      [d(2026, 2, 18), 9, 1],
      [d(2026, 3, 20), 10, 1],
      [d(2026, 5, 27), 12, 10],
    ];
    for (const [date, month, day] of cases) {
      const t = tabularHijri(date);
      expect(t.year).toBe(1447);
      expect(t.month).toBe(month);
      expect(Math.abs(t.day - day)).toBeLessThanOrEqual(1);
    }
  });
  it('1er Mouharram 1 AH', () => {
    expect(tabularHijri(d(622, 7, 19))).toEqual({ year: 1, month: 1, day: 1 });
  });
});

describe('affichage', () => {
  it('nomme les mois et formate la date', () => {
    expect(hijriMonthName(9)).toBe('Ramadan');
    expect(hijriMonthName(13)).toBe('');
    expect(formatHijri({ year: 1448, month: 5, day: 1 })).toBe('1 Joumada al-oula 1448');
  });
  it('résume les mois hégiriens d\'un mois grégorien', () => {
    expect(hijriRangeLabel(2026, 1)).toContain('Cha');
    expect(hijriRangeLabel(2026, 1)).toContain('Ramadan');
  });
});
