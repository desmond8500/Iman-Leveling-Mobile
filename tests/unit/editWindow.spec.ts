import { FALLBACK_CUTOFF_HOUR, canEditDay, editCutoff } from '../../src/utils/editWindow';
import { computePrayerTimes } from '../../src/utils/prayerTimes';

describe('canEditDay', () => {
  const today = '2026-11-12';
  const cutoff = new Date(2026, 10, 12, 5, 30).getTime();
  const before = new Date(2026, 10, 12, 4, 0).getTime();
  const after = new Date(2026, 10, 12, 6, 0).getTime();

  it('aujourd\'hui est toujours modifiable', () => {
    expect(canEditDay(today, today, after, cutoff)).toBe(true);
    expect(canEditDay(today, today, after, null)).toBe(true);
  });
  it('hier est modifiable jusqu\'à Fajr', () => {
    expect(canEditDay('2026-11-11', today, before, cutoff)).toBe(true);
    expect(canEditDay('2026-11-11', today, cutoff - 1, cutoff)).toBe(true);
  });
  it('hier se ferme à l\'heure de Fajr', () => {
    expect(canEditDay('2026-11-11', today, cutoff, cutoff)).toBe(false);
    expect(canEditDay('2026-11-11', today, after, cutoff)).toBe(false);
  });
  it('sans heure connue, hier reste en lecture seule', () => {
    expect(canEditDay('2026-11-11', today, before, null)).toBe(false);
  });
  it('les autres jours ne sont jamais modifiables', () => {
    expect(canEditDay('2026-11-10', today, before, cutoff)).toBe(false);
    expect(canEditDay('2026-11-13', today, before, cutoff)).toBe(false);
  });
  it('fonctionne au changement de mois et d\'année', () => {
    expect(canEditDay('2026-12-31', '2027-01-01', 0, 1)).toBe(true);
    expect(canEditDay('2026-10-31', '2026-11-01', 0, 1)).toBe(true);
  });
});

describe('editCutoff', () => {
  const dakar = { lat: 14.6928, lon: -17.4467 };
  const now = new Date(2026, 10, 12, 3, 0);

  it('vaut l\'heure de Fajr du jour avec une position', () => {
    const fajr = computePrayerTimes(now, dakar, { method: 'MWL' }).fajr!;
    expect(editCutoff(now, dakar, { method: 'MWL' }).getTime()).toBe(fajr.getTime());
  });
  it('sans position, 5 h du matin', () => {
    const c = editCutoff(now, null, { method: 'MWL' });
    expect(c.getHours()).toBe(FALLBACK_CUTOFF_HOUR);
    expect(c.getDate()).toBe(12);
  });
  it('repli aussi quand Fajr n\'existe pas', () => {
    const c = editCutoff(new Date(2026, 5, 21, 3), { lat: 80, lon: 10 }, { method: 'MWL' });
    expect(c.getHours()).toBeGreaterThanOrEqual(0);
    expect(Number.isNaN(c.getTime())).toBe(false);
  });
});
