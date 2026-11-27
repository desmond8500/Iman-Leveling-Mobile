import { applyTheme, isFeastDay, isThemeSetting, resolveTheme } from '../../src/utils/theme';
import { fastingInfo } from '../../src/utils/fasting';
import { toHijri } from '../../src/utils/hijri';

/** Premier jour, à partir de `from`, qui vérifie `test` (cherche sur un an et demi). */
function findDay(from: Date, test: (d: Date) => boolean): Date {
  for (let i = 0; i < 550; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    if (test(d)) return d;
  }
  throw new Error('jour introuvable');
}

describe('resolveTheme', () => {
  const friday = new Date(2026, 10, 13);
  const monday = new Date(2026, 10, 9);

  it('auto : bleu le vendredi, émeraude les autres jours', () => {
    expect(resolveTheme('auto', friday)).toBe('blue');
    expect(resolveTheme('auto', monday)).toBe('emerald');
  });
  it('auto : jaune les jours blancs, même un vendredi', () => {
    const white = findDay(new Date(2026, 10, 1), (d) => fastingInfo(d).white);
    expect(resolveTheme('auto', white)).toBe('yellow');
    const whiteFriday = findDay(new Date(2026, 10, 1), (d) => fastingInfo(d).white && d.getDay() === 5);
    expect(resolveTheme('auto', whiteFriday)).toBe('yellow');
  });
  it('auto : or les jours de fête (Aïd al-Fitr, Aïd al-Adha, tachriq)', () => {
    const fitr = findDay(new Date(2026, 10, 1), (d) => { const h = toHijri(d); return h.month === 10 && h.day === 1; });
    const adha = findDay(new Date(2026, 10, 1), (d) => { const h = toHijri(d); return h.month === 12 && h.day === 10; });
    const tashriq13 = new Date(adha.getFullYear(), adha.getMonth(), adha.getDate() + 3);
    for (const d of [fitr, adha, tashriq13]) {
      expect(isFeastDay(d)).toBe(true);
      expect(resolveTheme('auto', d)).toBe('gold');
    }
    const after = new Date(adha.getFullYear(), adha.getMonth(), adha.getDate() + 4);
    expect(isFeastDay(after)).toBe(false);
  });
  it('un choix explicite l\'emporte', () => {
    expect(resolveTheme('emerald', friday)).toBe('emerald');
    expect(resolveTheme('blue', monday)).toBe('blue');
    expect(resolveTheme('yellow', friday)).toBe('yellow');
    expect(resolveTheme('gold', monday)).toBe('gold');
  });
  it('reconnaît les valeurs valides', () => {
    expect(isThemeSetting('auto')).toBe(true);
    expect(isThemeSetting('yellow')).toBe(true);
    expect(isThemeSetting('gold')).toBe(true);
    expect(isThemeSetting('rouge')).toBe(false);
  });
});

describe('applyTheme', () => {
  it('pose la classe et la couleur de la barre', () => {
    const attrs: Record<string, string> = {};
    const classes = new Set<string>();
    const doc = {
      documentElement: { classList: { toggle: (c: string, on: boolean) => (on ? classes.add(c) : classes.delete(c)) } },
      querySelector: () => ({ setAttribute: (k: string, v: string) => (attrs[k] = v) }),
    } as unknown as Document;
    applyTheme('blue', doc);
    expect(classes.has('theme-blue')).toBe(true);
    expect(attrs.content).toBe('#0b1a33');
    applyTheme('gold', doc);
    expect(classes.has('theme-blue')).toBe(false);
    expect(classes.has('theme-gold')).toBe(true);
    applyTheme('yellow', doc);
    expect([...classes]).toEqual(['theme-yellow']);
    applyTheme('emerald', doc);
    expect(classes.size).toBe(0);
    expect(attrs.content).toBe('#0b1d1a');
  });
});
