import type { ProgressData } from '../../src/types';
import { mergeProgress, sanitizeProgress } from '../../src/utils/merge';

const data = (days: ProgressData['days']): ProgressData => ({ version: 1, days });

describe('mergeProgress', () => {
  it('réunit les jours des deux côtés', () => {
    const local = data({ '2026-11-08': { prayers: { fajr: true } } });
    const remote = data({ '2026-11-09': { prayers: { dhuhr: true } } });
    const merged = mergeProgress(local, remote);
    expect(Object.keys(merged.days).sort()).toEqual(['2026-11-08', '2026-11-09']);
  });

  it('garde une case cochée d\'un côté ou de l\'autre', () => {
    const local = data({ '2026-11-09': { prayers: { fajr: true, dhuhr: false } } });
    const remote = data({ '2026-11-09': { prayers: { dhuhr: true, asr: true } } });
    expect(mergeProgress(local, remote).days['2026-11-09'].prayers).toEqual({
      fajr: true,
      dhuhr: true,
      asr: true,
    });
  });

  it('fusionne aussi les sunnas et les invocations', () => {
    const local = data({ '2026-11-09': { prayers: {}, sunnah: { witr: true } } });
    const remote = data({
      '2026-11-09': { prayers: {}, sunnah: { 'fajr-before': true }, adhkar: { 'morning:kursi': true } },
    });
    const day = mergeProgress(local, remote).days['2026-11-09'];
    expect(day.sunnah).toEqual({ witr: true, 'fajr-before': true });
    expect(day.adhkar).toEqual({ 'morning:kursi': true });
  });

  it('est symétrique et idempotent', () => {
    const a = data({ '2026-11-09': { prayers: { fajr: true } } });
    const b = data({ '2026-11-09': { prayers: { isha: true } }, '2026-11-08': { prayers: {} } });
    expect(mergeProgress(a, b)).toEqual(mergeProgress(b, a));
    const once = mergeProgress(a, b);
    expect(mergeProgress(once, b)).toEqual(once);
  });

  it('ne modifie pas ses arguments', () => {
    const local = data({ '2026-11-09': { prayers: { fajr: true } } });
    const remote = data({ '2026-11-09': { prayers: { isha: true } } });
    const snapshot = JSON.stringify([local, remote]);
    mergeProgress(local, remote);
    expect(JSON.stringify([local, remote])).toBe(snapshot);
  });
});

describe('sanitizeProgress', () => {
  it('accepte des données valides', () => {
    const input = { version: 1, days: { '2026-11-09': { prayers: { fajr: true }, adhkar: { 'a:b': true } } } };
    expect(sanitizeProgress(input).days['2026-11-09']).toEqual({
      prayers: { fajr: true },
      adhkar: { 'a:b': true },
    });
  });

  it.each([[null], [undefined], [42], ['texte'], [[]], [{ days: null }], [{ days: [] }]])(
    'renvoie une progression vide pour %j',
    (input) => {
      expect(sanitizeProgress(input)).toEqual({ version: 1, days: {} });
    },
  );

  it('ignore les clés de jour invalides et les valeurs qui ne sont pas des booléens', () => {
    const out = sanitizeProgress({
      days: {
        'pas-une-date': { prayers: { fajr: true } },
        '2026-11-09': { prayers: { fajr: true, dhuhr: 'oui', asr: 1 } },
        '2026-11-10': 'cassé',
      },
    });
    expect(Object.keys(out.days)).toEqual(['2026-11-09']);
    expect(out.days['2026-11-09'].prayers).toEqual({ fajr: true });
  });
});
