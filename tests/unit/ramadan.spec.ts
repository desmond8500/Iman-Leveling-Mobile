import { RAMADAN_BLOCKS, blockOf, blockProgress, dayState, currentOrNextRamadan, daysBetween, parseStartKey, ramadanDays, ramadanStart, resolveRamadan, toKey } from '../../src/utils/ramadan';
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

describe('date de début choisie par l\'utilisateur', () => {
  const today = d(2026, 1, 10); // avant le Ramadan 1447 (début calendrier : 18 février 2026)

  it('sans choix : la date du calendrier', () => {
    const r = resolveRamadan(today, null)!;
    expect(toKey(r.start)).toBe('2026-02-18');
    expect(r.overridden).toBe(false);
  });
  it('décale d\'un jour', () => {
    const r = resolveRamadan(today, '2026-02-19')!;
    expect(toKey(r.start)).toBe('2026-02-19');
    expect(r.overridden).toBe(true);
    expect(toKey(r.calendarStart)).toBe('2026-02-18');
    expect(toKey(ramadanDays(r.start)[0].date)).toBe('2026-02-19');
  });
  it('ignore une date très éloignée ou invalide', () => {
    expect(resolveRamadan(today, '2026-04-01')!.overridden).toBe(false);
    expect(toKey(resolveRamadan(today, '2026-04-01')!.start)).toBe('2026-02-18');
    expect(resolveRamadan(today, 'n\'importe quoi')!.overridden).toBe(false);
  });
  it('analyse les dates', () => {
    expect(parseStartKey('2026-02-30')).toBeNull();
    expect(parseStartKey('2026-2-1')).toBeNull();
    expect(parseStartKey(null)).toBeNull();
    expect(toKey(parseStartKey('2027-02-08')!)).toBe('2027-02-08');
  });
});

describe('phases et avancement', () => {
  const days = ramadanDays(d(2026, 2, 18));
  const block = (i: number) => blockOf(days, RAMADAN_BLOCKS[i].from, RAMADAN_BLOCKS[i].to);

  it('trois phases nommées', () => {
    expect(RAMADAN_BLOCKS.map((b) => b.title)).toEqual(['Miséricorde', 'Pardon', 'Affranchissement du Feu']);
  });
  it('état d\'un jour', () => {
    expect(dayState(days[0], d(2026, 2, 18))).toBe('today');
    expect(dayState(days[0], d(2026, 2, 19))).toBe('past');
    expect(dayState(days[1], d(2026, 2, 18))).toBe('upcoming');
  });
  it('avant le Ramadan : tout est à venir', () => {
    for (let i = 0; i < 3; i++) expect(blockProgress(block(i), d(2026, 2, 1))).toMatchObject({ state: 'upcoming', elapsed: 0 });
  });
  it('au 4e jour : premier bloc en cours', () => {
    expect(blockProgress(block(0), d(2026, 2, 21))).toEqual({ state: 'current', elapsed: 4, total: 10 });
    expect(blockProgress(block(1), d(2026, 2, 21)).state).toBe('upcoming');
  });
  it('au 15e jour : premier bloc terminé, deuxième en cours', () => {
    const t = d(2026, 3, 4);
    expect(blockProgress(block(0), t).state).toBe('done');
    expect(blockProgress(block(1), t)).toMatchObject({ state: 'current', elapsed: 5 });
  });
  it('après le mois : tout est terminé', () => {
    for (let i = 0; i < 3; i++) expect(blockProgress(block(i), d(2026, 4, 30)).state).toBe('done');
  });
});
