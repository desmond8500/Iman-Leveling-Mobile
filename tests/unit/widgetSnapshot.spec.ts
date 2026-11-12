import { buildWidgetSnapshot, sanitizeWidgetActions } from '../../src/utils/widgetSnapshot';

const paris = { lat: 48.8566, lon: 2.3522 };
const options = { method: 'MWL' as const, timeZone: 1 };
const now = new Date(2026, 0, 15, 13, 0); // 15 janvier 2026, 13 h

const base = { now, days: {}, location: paris, options, ramadanStart: null };

describe('buildWidgetSnapshot', () => {
  it('donne 5 prières pour hier, aujourd\'hui et demain', () => {
    const s = buildWidgetSnapshot(base);
    expect(s.slots).toHaveLength(15);
    expect(s.hasLocation).toBe(true);
    expect(s.dateKey).toBe('2026-01-15');
    expect(s.slots.every((x) => x.end > x.start)).toBe(true);
  });

  it('sans position : pas de créneaux, mais le reste est présent', () => {
    const s = buildWidgetSnapshot({ ...base, location: null });
    expect(s.slots).toEqual([]);
    expect(s.hasLocation).toBe(false);
    expect(s.names).toHaveLength(99);
    expect(s.adhkar.morning.length).toBeGreaterThan(0);
    expect(s.ramadan?.maghrib).toEqual([]);
  });

  it('un créneau couvre l\'instant présent (Dhuhr à 13 h)', () => {
    const s = buildWidgetSnapshot(base);
    const current = s.slots.filter((x) => x.start <= now.getTime() && now.getTime() < x.end);
    expect(current.map((x) => x.id)).toEqual(['dhuhr']);
    expect(current[0].dateKey).toBe('2026-01-15');
    expect(current[0].sunnah.map((x) => x.id)).toEqual(['dhuhr-before', 'dhuhr-after']);
  });

  it('reporte l\'état fait / non fait', () => {
    const s = buildWidgetSnapshot({
      ...base,
      days: {
        '2026-01-15': {
          prayers: { dhuhr: true },
          sunnah: { 'dhuhr-before': true },
          adhkar: { 'morning:kursi': true },
        },
        '2026-01-14': { prayers: { isha: true } },
      },
    });
    const dhuhr = s.slots.find((x) => x.dateKey === '2026-01-15' && x.id === 'dhuhr')!;
    expect(dhuhr.done).toBe(true);
    expect(dhuhr.sunnah.map((x) => x.done)).toEqual([true, false]);
    expect(s.slots.find((x) => x.dateKey === '2026-01-14' && x.id === 'isha')!.done).toBe(true);
    expect(s.slots.find((x) => x.dateKey === '2026-01-15' && x.id === 'asr')!.done).toBe(false);
    const kursi = s.adhkar.morning.find((x) => x.id === 'kursi');
    if (kursi) expect(kursi.done).toBe(true);
  });

  it('Isha d\'hier est encore valable après minuit', () => {
    const night = new Date(2026, 0, 15, 1, 0);
    const s = buildWidgetSnapshot({ ...base, now: night });
    const current = s.slots.filter((x) => x.start <= night.getTime() && night.getTime() < x.end);
    expect(current.map((x) => `${x.dateKey}:${x.id}`)).toEqual(['2026-01-14:isha']);
  });

  it('Ramadan : début, durée, jours jeûnés et heures de rupture', () => {
    const during = new Date(2026, 1, 25, 12, 0);
    const s = buildWidgetSnapshot({
      ...base,
      now: during,
      days: { '2026-02-18': { prayers: {}, fasting: { fast: true } }, '2026-02-19': { prayers: {}, fasting: { fast: true } } },
    });
    expect(s.ramadan).not.toBeNull();
    expect(new Date(s.ramadan!.startMs).getDate()).toBe(18);
    expect([29, 30]).toContain(s.ramadan!.total);
    expect(s.ramadan!.fasted).toBe(2);
    expect(s.ramadan!.maghrib).toHaveLength(2);
    expect(s.ramadan!.maghrib[1]).toBeGreaterThan(s.ramadan!.maghrib[0]);
  });
});

describe('sanitizeWidgetActions', () => {
  it('garde les actions connues et écarte le reste', () => {
    const out = sanitizeWidgetActions([
      { type: 'prayer', id: 'fajr', dateKey: '2026-01-15' },
      { type: 'prayer', id: 'nope', dateKey: '2026-01-15' },
      { type: 'sunnah', id: 'dhuhr-before', dateKey: '2026-01-15' },
      { type: 'dhikr', id: 'kursi', period: 'night', dateKey: '2026-01-15' },
      { type: 'prayer', id: 'fajr', dateKey: 'hier' },
      null,
      'x',
    ]);
    expect(out).toEqual([
      { type: 'prayer', id: 'fajr', dateKey: '2026-01-15' },
      { type: 'sunnah', id: 'dhuhr-before', dateKey: '2026-01-15' },
    ]);
  });
  it('accepte une invocation connue', () => {
    const first = buildWidgetSnapshot(base).adhkar.evening[0];
    expect(sanitizeWidgetActions([{ type: 'dhikr', id: first.id, period: 'evening', dateKey: '2026-01-15' }])).toHaveLength(1);
  });
  it('refuse autre chose qu\'une liste', () => {
    expect(sanitizeWidgetActions({})).toEqual([]);
    expect(sanitizeWidgetActions(null)).toEqual([]);
  });
});
