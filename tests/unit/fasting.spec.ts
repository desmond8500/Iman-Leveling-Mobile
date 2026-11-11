import { fastingInfo, isForbiddenFastDay } from '../../src/utils/fasting';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('jours blancs', () => {
  it('13, 14 et 15 du mois hégirien', () => {
    // 1er Rajab 1448 = 1er Rajab ... on part d'une date connue : 1er Ramadan 1447 = 18 févr. 2026
    // donc 13 Cha'ban 1447 = 18 févr. - 17 jours = 1er févr. 2026 (si Cha'ban a 30 jours : 13 = 2 févr.)
    const days = Array.from({ length: 31 }, (_, i) => d(2026, 1, 1 + i)).filter((x) => fastingInfo(x).white);
    expect(days).toHaveLength(3);
    const [a, b, c] = days;
    expect(b.getTime() - a.getTime()).toBe(86400000);
    expect(c.getTime() - b.getTime()).toBe(86400000);
  });
  it('pas de jours blancs pendant Ramadan (tout le mois est jeûné)', () => {
    expect(fastingInfo(d(2026, 3, 3)).white).toBe(false); // ~15 Ramadan 1447
    expect(fastingInfo(d(2026, 3, 3)).ramadan).toBe(true);
  });
  it('pas de jour blanc un jour où le jeûne est interdit', () => {
    expect(fastingInfo(d(2026, 5, 27)).forbidden).toBe(true); // Aïd al-Adha
    expect(fastingInfo(d(2026, 5, 27)).white).toBe(false);
  });
});

describe('jours interdits', () => {
  it('Aïd al-Fitr et Aïd al-Adha avec tachriq', () => {
    expect(isForbiddenFastDay(10, 1)).toBe(true);
    expect(isForbiddenFastDay(10, 2)).toBe(false);
    for (const day of [10, 11, 12, 13]) expect(isForbiddenFastDay(12, day)).toBe(true);
    expect(isForbiddenFastDay(12, 9)).toBe(false);
    expect(isForbiddenFastDay(12, 14)).toBe(false);
  });
  it('1er Chawwal 1447 (20 mars 2026)', () => {
    expect(fastingInfo(d(2026, 3, 20)).forbidden).toBe(true);
  });
});

describe('lundi et jeudi', () => {
  it('recommandés, sauf jour interdit', () => {
    expect(fastingInfo(d(2026, 11, 9)).weekly).toBe(true); // lundi
    expect(fastingInfo(d(2026, 11, 12)).weekly).toBe(true); // jeudi
    expect(fastingInfo(d(2026, 11, 10)).weekly).toBe(false); // mardi
    expect(fastingInfo(d(2026, 11, 14)).weekly).toBe(false); // samedi
    expect(fastingInfo(d(2026, 5, 28)).forbidden).toBe(true); // 11 Dhou al-hijja, un jeudi
    expect(fastingInfo(d(2026, 5, 28)).weekly).toBe(false);
  });
});
