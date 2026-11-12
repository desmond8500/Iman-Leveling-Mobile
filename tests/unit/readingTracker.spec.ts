import { createReadingTracker } from '../../src/utils/readingTracker';

describe('createReadingTracker', () => {
  it('au départ : rien de visible, rien de lu', () => {
    expect(createReadingTracker(10).snapshot()).toEqual({ bookmark: null, from: 0, to: 0 });
  });

  it('le marque-page est le premier verset visible', () => {
    const t = createReadingTracker(10);
    [3, 4, 5].forEach((n) => t.update(n, true));
    expect(t.snapshot()).toEqual({ bookmark: 3, from: 3, to: 0 });
  });

  it('un verset sorti par le haut est lu, et le marque-page avance', () => {
    const t = createReadingTracker(10);
    [1, 2, 3].forEach((n) => t.update(n, true));
    t.update(1, false, true);
    t.update(4, true);
    expect(t.snapshot()).toEqual({ bookmark: 2, from: 1, to: 1 });
    t.update(2, false, true);
    expect(t.snapshot()).toEqual({ bookmark: 3, from: 1, to: 2 });
  });

  it('un verset sorti par le bas (on remonte) n\'est pas lu', () => {
    const t = createReadingTracker(10);
    [5, 6].forEach((n) => t.update(n, true));
    t.update(6, false, false);
    expect(t.snapshot().to).toBe(0);
  });

  it('atteindre le dernier verset compte la fin de la sourate comme lue', () => {
    const t = createReadingTracker(5);
    [4, 5].forEach((n) => t.update(n, true));
    expect(t.snapshot()).toEqual({ bookmark: 4, from: 4, to: 5 });
  });

  it('ignore les versets inexistants et se remet à zéro', () => {
    const t = createReadingTracker(5);
    t.update(0, true);
    t.update(6, true);
    t.update(1.5, true);
    expect(t.snapshot().bookmark).toBeNull();
    t.update(2, true);
    t.reset();
    expect(t.snapshot()).toEqual({ bookmark: null, from: 0, to: 0 });
  });
});
