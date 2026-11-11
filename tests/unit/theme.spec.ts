import { applyTheme, isThemeSetting, resolveTheme } from '../../src/utils/theme';

describe('resolveTheme', () => {
  const friday = new Date(2026, 10, 13);
  const monday = new Date(2026, 10, 9);

  it('auto : bleu le vendredi, émeraude les autres jours', () => {
    expect(resolveTheme('auto', friday)).toBe('blue');
    expect(resolveTheme('auto', monday)).toBe('emerald');
  });
  it('un choix explicite l\'emporte', () => {
    expect(resolveTheme('emerald', friday)).toBe('emerald');
    expect(resolveTheme('blue', monday)).toBe('blue');
  });
  it('reconnaît les valeurs valides', () => {
    expect(isThemeSetting('auto')).toBe(true);
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
    applyTheme('emerald', doc);
    expect(classes.has('theme-blue')).toBe(false);
    expect(attrs.content).toBe('#0b1d1a');
  });
});
