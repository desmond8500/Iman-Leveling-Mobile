import { RAMADAN_BLOCKS, blockOf, currentOrNextRamadan, daysBetween, ramadanDays, ramadanStart } from '../../src/utils/ramadan';
import { toHijri } from '../../src/utils/hijri';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('ramadanStart', () => {
  it('trouve le 1er Ramadan 1447 (18 février 2026)', () => {
    const s = ramadanStart(1447, d(2026, 1, 10))!;
    expect(toHijri(s)).toEqual({ year: 1447, month: 9, day: 1 });
    expect(s.getFullYear()).toBe(2026);
    expect(s.getMonth()).toBe(1);
    expect(s.getDate()).toBe(18);
  });
});

describe('currentOrNextRamadan', () => {
  it('après le Ramadan : le suivant', () => {
    const r = currentOrNextRamadan(d(2026, 11, 11))!;
    expect(r.hijriYear).toBe(1448);
    expect(r.start.getFullYear()).toBe(2027);
  });
  it('pendant le Ramadan : celui en cours', () => {
    expect(currentOrNextRamadan(d(2026, 3, 3))!.hijriYear).toBe(1447);
  });
  it('avant le Ramadan : celui de l\'année', () => {
    expect(currentOrNextRamadan(d(2026, 1, 5))!.hijriYear).toBe(1447);
  });
});

describe('ramadanDays', () => {
  const days = ramadanDays(d(2026, 2, 18));
  it('30 jours consécutifs', () => {
    expect(days).toHaveLength(30);
    expect(days[0].n).toBe(1);
    expect(daysBetween(days[0].date, days[29].date)).toBe(29);
  });
  it('les 29 premiers existent toujours', () => {
    expect(days.slice(0, 29).every((x) => x.exists)).toBe(true);
  });
  it('trois blocs de dix', () => {
    for (const b of RAMADAN_BLOCKS) expect(blockOf(days, b.from, b.to)).toHaveLength(10);
  });
  it('nuits impaires des dix derniers jours', () => {
    expect(days.filter((x) => x.oddLastTen).map((x) => x.n)).toEqual([21, 23, 25, 27, 29]);
  });
});
