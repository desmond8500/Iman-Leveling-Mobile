import {
  ABLUTION_CHOICES,
  WHITE_DAY_REMINDER_HOUR,
  buildSchedule,
  buildWhiteDaySchedule,
  normalizeNotificationSettings,
} from '../../src/utils/notifications';
import { computePrayerTimes, prayerWindows } from '../../src/utils/prayerTimes';
import { fastingInfo } from '../../src/utils/fasting';
import { toHijri } from '../../src/utils/hijri';

const coords = { lat: 14.6928, lon: -17.4467 };
const calc = { method: 'MWL' as const };
const on = { enabled: true, ablutionMinutes: 15, endMinutes: 0, whiteDays: false };

describe('buildSchedule', () => {
  const morning = new Date(2026, 10, 10, 0, 5);

  it('ne programme rien si les rappels sont désactivés', () => {
    expect(buildSchedule(morning, coords, calc, { enabled: false, ablutionMinutes: 15, endMinutes: 15, whiteDays: false })).toEqual([]);
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
    const plan = buildSchedule(morning, coords, calc, { enabled: true, ablutionMinutes: 0, endMinutes: 0, whiteDays: false }, 1);
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
  const withEnd = { enabled: true, ablutionMinutes: 0, endMinutes: 20, whiteDays: false };

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
    const plan = buildSchedule(morning, coords, calc, { enabled: true, ablutionMinutes: 15, endMinutes: 15, whiteDays: false });
    expect(new Set(plan.map((n) => n.id)).size).toBe(plan.length);
    expect(plan).toHaveLength(45);
  });
});

describe('normalizeNotificationSettings', () => {
  it('valeurs par défaut pour des données invalides', () => {
    expect(normalizeNotificationSettings(null)).toEqual({ enabled: false, ablutionMinutes: 15, endMinutes: 15, whiteDays: false });
    expect(normalizeNotificationSettings({ enabled: 'oui', ablutionMinutes: 7, endMinutes: 5, whiteDays: false })).toEqual({ enabled: false, ablutionMinutes: 15, endMinutes: 15, whiteDays: false });
  });
  it('conserve des valeurs valides', () => {
    for (const m of ABLUTION_CHOICES) {
      expect(normalizeNotificationSettings({ enabled: true, ablutionMinutes: m, endMinutes: 30, whiteDays: false })).toEqual({ enabled: true, ablutionMinutes: m, endMinutes: 30, whiteDays: false });
    }
  });
});

describe('rappel des jours blancs', () => {
  const now = new Date(2026, 10, 10, 9, 0);
  const off = { enabled: false, ablutionMinutes: 15, endMinutes: 15, whiteDays: false };
  const white = { ...off, whiteDays: true };

  it('ne programme rien si le rappel est désactivé', () => {
    expect(buildWhiteDaySchedule(now, off)).toEqual([]);
  });

  it('prévient la veille au soir de chaque jour blanc, sans dépendre des rappels de prière', () => {
    const plan = buildWhiteDaySchedule(now, white);
    // Sur 35 jours, au moins une série complète de trois jours blancs.
    expect(plan.length).toBeGreaterThanOrEqual(3);
    for (const n of plan) {
      expect(n.kind).toBe('white');
      expect(n.prayer).toBeUndefined();
      expect(n.at.getHours()).toBe(WHITE_DAY_REMINDER_HOUR);
      expect(n.at.getMinutes()).toBe(0);
      const day = new Date(n.at.getFullYear(), n.at.getMonth(), n.at.getDate() + 1);
      expect(fastingInfo(day).white).toBe(true);
      expect([13, 14, 15]).toContain(toHijri(day).day);
      expect(n.at.getTime()).toBeGreaterThan(now.getTime());
    }
  });

  it('titre le premier jour de la série et des identifiants distincts des prières', () => {
    const plan = buildWhiteDaySchedule(now, white);
    const first = plan.find((n) => toHijri(new Date(n.at.getFullYear(), n.at.getMonth(), n.at.getDate() + 1)).day === 13)!;
    expect(first.title).toBe('Demain commencent les jours blancs');
    expect(new Set(plan.map((n) => n.id)).size).toBe(plan.length);
    const prayers = buildSchedule(now, coords, calc, { ...white, enabled: true });
    const ids = new Set(prayers.map((n) => n.id));
    expect(plan.some((n) => ids.has(n.id))).toBe(false);
  });

  it('écarte le rappel déjà passé (veille après 20 h)', () => {
    const plan = buildWhiteDaySchedule(now, white);
    const late = new Date(plan[0].at.getTime() + 60000);
    expect(buildWhiteDaySchedule(late, white).some((n) => n.at.getTime() === plan[0].at.getTime())).toBe(false);
  });

  it('jamais pendant le Ramadan', () => {
    const plan = buildWhiteDaySchedule(new Date(2027, 0, 20, 9, 0), white, 60);
    for (const n of plan) {
      const day = new Date(n.at.getFullYear(), n.at.getMonth(), n.at.getDate() + 1);
      expect(toHijri(day).month).not.toBe(9);
    }
  });
});

describe('normalizeNotificationSettings : jours blancs', () => {
  it('ne garde le rappel que pour un vrai booléen', () => {
    expect(normalizeNotificationSettings({ whiteDays: true }).whiteDays).toBe(true);
    expect(normalizeNotificationSettings({ whiteDays: 'oui' }).whiteDays).toBe(false);
  });
});
