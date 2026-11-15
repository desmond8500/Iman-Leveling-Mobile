import { daysUntilLabel, nextHijriOccurrence } from '../../src/utils/events';
import { toHijri } from '../../src/utils/hijri';

describe('nextHijriOccurrence', () => {
  it('trouve le 1er Chawwal (Aïd al-Fitr) et le 10 Dhou al-hijja (Aïd al-Adha)', () => {
    const from = new Date(2026, 10, 15);
    const fitr = nextHijriOccurrence(from, 10, 1)!;
    expect(toHijri(fitr)).toMatchObject({ month: 10, day: 1 });
    expect(fitr.getTime()).toBeGreaterThanOrEqual(from.getTime());
    expect(fitr.getTime() - from.getTime()).toBeLessThan(400 * 86400000);

    const adha = nextHijriOccurrence(from, 12, 10)!;
    expect(toHijri(adha)).toMatchObject({ month: 12, day: 10 });
    expect(adha.getTime()).toBeGreaterThan(fitr.getTime());
  });
  it('inclut le jour même', () => {
    const fitr = nextHijriOccurrence(new Date(2026, 10, 15), 10, 1)!;
    expect(nextHijriOccurrence(fitr, 10, 1)!.getTime()).toBe(fitr.getTime());
  });
});

describe('daysUntilLabel', () => {
  const now = new Date(2026, 10, 15, 22, 0);
  it('formule la distance en jours', () => {
    expect(daysUntilLabel(now, new Date(2026, 10, 15))).toBe("aujourd'hui");
    expect(daysUntilLabel(now, new Date(2026, 10, 16))).toBe('demain');
    expect(daysUntilLabel(now, new Date(2026, 10, 25))).toBe('dans 10 jours');
  });
});
