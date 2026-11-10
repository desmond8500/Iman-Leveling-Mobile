import { ALL_SUNNAH, PRAYERS } from '../../src/data/prayers';

describe('données des prières', () => {
  it('contient les 5 prières obligatoires dans l\'ordre', () => {
    expect(PRAYERS.map((p) => p.id)).toEqual(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']);
  });

  it('place les sunnas avant ou après selon la prière', () => {
    const byId = Object.fromEntries(PRAYERS.map((p) => [p.id, p]));
    expect(byId.fajr.before.map((s) => s.id)).toEqual(['fajr-before']);
    expect(byId.fajr.after).toEqual([]);
    expect(byId.dhuhr.before.map((s) => s.id)).toEqual(['dhuhr-before']);
    expect(byId.dhuhr.after.map((s) => s.id)).toEqual(['dhuhr-after']);
    expect(byId.asr.before.map((s) => s.id)).toEqual(['asr-before']);
    expect(byId.maghrib.before).toEqual([]);
    expect(byId.maghrib.after.map((s) => s.id)).toEqual(['maghrib-after']);
    expect(byId.isha.after.map((s) => s.id)).toEqual(['isha-after', 'witr']);
  });

  it('a des identifiants de sunna uniques', () => {
    const ids = ALL_SUNNAH.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(7);
  });
});
