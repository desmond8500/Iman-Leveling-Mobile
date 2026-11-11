import {
  ABLUTION_CHOICES,
  buildSchedule,
  normalizeNotificationSettings,
} from '../../src/utils/notifications';
import { computePrayerTimes, prayerWindows } from '../../src/utils/prayerTimes';

const coords = { lat: 14.6928, lon: -17.4467 };
const calc = { method: 'MWL' as const };
const on = { enabled: true, ablutionMinutes: 15, endMinutes: 0 };

describe('buildSchedule', () => {
  const morning = new Date(2026, 10, 10, 0, 5);

  it('ne programme rien si les rappels sont désactivés', () => {
    expect(buildSchedule(morning, coords, calc, { enabled: false, ablutionMinutes: 15, endMinutes: 15 })).toEqual([]);
  });

  it('crée un rappel d\'ablutions et une notification par prière', () => {
    const plan = buildSchedule(morning, coords, calc, on, 1);
    expect(plan).toHaveLength(10);
    expect(plan.filter((n) => n.kind === 'ablution')).toHaveLength(5);
    const times = computePrayerTimes(new Date(2026, 10, 10), coords, calc);
    const dhuhr = plan.find((n) => n.prayer === 'dhuhr' && n.kind === 'prayer')!;
    const wudu = plan.find((n) => n.prayer === 'dhuhr' && n.kind === 'ablution')!;
    expect(dhuhr.at.getTime()).toBe(times.dhuhr!.getTime());
    expect(dhuhr.at.getTime() - wudu.at.getTime()).toBe(15 * 60000);
  });

  it('sans minutes d\'ablutions, seules les prières sont notifiées', () => {
    const plan = buildSchedule(morning, coords, calc, { enabled: true, ablutionMinutes: 0, endMinutes: 0 }, 1);
    expect(plan).toHaveLength(5);
    expect(plan.every((n) => n.kind === 'prayer')).toBe(true);
  });

  it('écarte les moments déjà passés', () => {
    const times = computePrayerTimes(new Date(2026, 10, 10), coords, calc);
    const now = new Date(times.dhuhr!.getTime() - 5 * 60000); // l'ablution de Dhuhr est passée
    const plan = buildSchedule(now, coords, calc, on, 1);
    expect(plan.some((n) => n.prayer === 'fajr')).toBe(false);
    expect(plan.some((n) => n.prayer === 'dhuhr' && n.kind === 'ablution')).toBe(false);
    expect(plan.some((n) => n.prayer === 'dhuhr' && n.kind === 'prayer')).toBe(true);
  });

  it('couvre plusieurs jours, triés par heure, avec des identifiants uniques', () => {
    const plan = buildSchedule(morning, coords, calc, on);
    expect(plan).toHaveLength(30);
    const stamps = plan.map((n) => n.at.getTime());
    expect([...stamps].sort((a, b) => a - b)).toEqual(stamps);
    expect(new Set(plan.map((n) => n.id)).size).toBe(plan.length);
    expect(plan.every((n) => Number.isInteger(n.id) && n.id > 0)).toBe(true);
  });
});

describe('rappel de fin de temps', () => {
  const morning = new Date(2026, 10, 10, 0, 5);
  const withEnd = { enabled: true, ablutionMinutes: 0, endMinutes: 20 };

  it('programme un rappel avant la fin de chaque prière', () => {
    const plan = buildSchedule(morning, coords, calc, withEnd, 1);
    const endings = plan.filter((n) => n.kind === 'ending');
    expect(endings).toHaveLength(5);
    const windows = prayerWindows(new Date(2026, 10, 10), coords, calc);
    const dhuhr = endings.find((n) => n.prayer === 'dhuhr')!;
    expect(windows.dhuhr!.end.getTime() - dhuhr.at.getTime()).toBe(20 * 60000);
    expect(dhuhr.at.getTime()).toBeGreaterThan(windows.dhuhr!.start.getTime());
  });
  it('oublie le rappel si la fin est déjà trop proche', () => {
    const windows = prayerWindows(new Date(2026, 10, 10), coords, calc);
    const now = new Date(windows.asr!.end.getTime() - 5 * 60000);
    const plan = buildSchedule(now, coords, calc, withEnd, 1);
    expect(plan.some((n) => n.prayer === 'asr' && n.kind === 'ending')).toBe(false);
  });
  it('identifiants uniques sur plusieurs jours', () => {
    const plan = buildSchedule(morning, coords, calc, { enabled: true, ablutionMinutes: 15, endMinutes: 15 });
    expect(new Set(plan.map((n) => n.id)).size).toBe(plan.length);
    expect(plan).toHaveLength(45);
  });
});

describe('normalizeNotificationSettings', () => {
  it('valeurs par défaut pour des données invalides', () => {
    expect(normalizeNotificationSettings(null)).toEqual({ enabled: false, ablutionMinutes: 15, endMinutes: 15 });
    expect(normalizeNotificationSettings({ enabled: 'oui', ablutionMinutes: 7, endMinutes: 5 })).toEqual({ enabled: false, ablutionMinutes: 15, endMinutes: 15 });
  });
  it('conserve des valeurs valides', () => {
    for (const m of ABLUTION_CHOICES) {
      expect(normalizeNotificationSettings({ enabled: true, ablutionMinutes: m, endMinutes: 30 })).toEqual({ enabled: true, ablutionMinutes: m, endMinutes: 30 });
    }
  });
});
