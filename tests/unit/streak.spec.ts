import { addDays, toDateKey } from '../../src/utils/date';
import { computeStreak } from '../../src/utils/streak';

describe('date', () => {
  it('formate une date locale en AAAA-MM-JJ', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('ajoute et retire des jours en passant les fins de mois et d\'année', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('computeStreak', () => {
  const complete = (keys: string[]) => (key: string) => keys.includes(key);

  it('vaut 0 sans aucune journée complète', () => {
    expect(computeStreak('2026-11-09', complete([]))).toBe(0);
  });

  it('compte les jours consécutifs jusqu\'à aujourd\'hui inclus', () => {
    const days = ['2026-11-07', '2026-11-08', '2026-11-09'];
    expect(computeStreak('2026-11-09', complete(days))).toBe(3);
  });

  it('garde la série d\'hier tant qu\'aujourd\'hui n\'est pas terminé', () => {
    const days = ['2026-11-07', '2026-11-08'];
    expect(computeStreak('2026-11-09', complete(days))).toBe(2);
  });

  it('retombe à 0 si hier et aujourd\'hui sont incomplets', () => {
    expect(computeStreak('2026-11-09', complete(['2026-11-06']))).toBe(0);
  });

  it('s\'arrête au premier jour manquant', () => {
    const days = ['2026-11-05', '2026-11-08', '2026-11-09'];
    expect(computeStreak('2026-11-09', complete(days))).toBe(2);
  });
});
