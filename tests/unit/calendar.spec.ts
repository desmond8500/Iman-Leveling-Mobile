import {
  buildMonthGrid,
  dayNumber,
  formatLong,
  lastDays,
  monthLabel,
  shiftMonth,
  weekdayShort,
} from '../../src/utils/calendar';

describe('lastDays', () => {
  it('renvoie les n derniers jours, aujourd\'hui en dernier', () => {
    expect(lastDays('2026-11-09', 3)).toEqual(['2026-11-07', '2026-11-08', '2026-11-09']);
  });

  it('traverse les changements de mois', () => {
    expect(lastDays('2026-03-02', 4)).toEqual([
      '2026-02-27',
      '2026-02-28',
      '2026-03-01',
      '2026-03-02',
    ]);
  });
});

describe('buildMonthGrid', () => {
  it('commence la semaine le lundi (novembre 2026 débute un dimanche)', () => {
    const grid = buildMonthGrid(2026, 10);
    expect(grid[0].slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(grid[0][6]).toBe('2026-11-01');
    expect(grid[1][0]).toBe('2026-11-02');
  });

  it('a des semaines de 7 cases et contient tous les jours du mois', () => {
    const grid = buildMonthGrid(2026, 10);
    expect(grid.every((w) => w.length === 7)).toBe(true);
    const days = grid.flat().filter(Boolean);
    expect(days).toHaveLength(30);
    expect(days[29]).toBe('2026-11-30');
  });

  it('gère février d\'une année bissextile', () => {
    const days = buildMonthGrid(2028, 1).flat().filter(Boolean);
    expect(days).toHaveLength(29);
  });

  it('ne laisse pas de ligne vide quand le mois tient en 4 semaines', () => {
    // Février 2027 : commence un lundi, 28 jours.
    const grid = buildMonthGrid(2027, 1);
    expect(grid).toHaveLength(4);
    expect(grid[0][0]).toBe('2027-02-01');
  });
});

describe('formats', () => {
  it('formate en français', () => {
    expect(formatLong('2026-11-09')).toBe('lundi 9 novembre');
    expect(weekdayShort('2026-11-09')).toBe('lun');
    expect(dayNumber('2026-11-09')).toBe(9);
    expect(monthLabel(2026, 10)).toBe('novembre 2026');
  });

  it('décale les mois en changeant d\'année', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });
});
