import { PRAYER_KEYS, computePrayerTimes, type CalcOptions, type Coordinates, type PrayerKey } from './prayerTimes';

export interface NotificationSettings {
  enabled: boolean;
  /** Rappel des ablutions avant la prière, en minutes ; 0 = désactivé. */
  ablutionMinutes: number;
}

export const defaultNotificationSettings = (): NotificationSettings => ({ enabled: false, ablutionMinutes: 15 });

export const ABLUTION_CHOICES = [0, 10, 15, 20, 30];

export function normalizeNotificationSettings(value: unknown): NotificationSettings {
  const base = defaultNotificationSettings();
  if (typeof value !== 'object' || value === null) return base;
  const v = value as Partial<NotificationSettings>;
  return {
    enabled: v.enabled === true,
    ablutionMinutes: ABLUTION_CHOICES.includes(v.ablutionMinutes as number) ? (v.ablutionMinutes as number) : base.ablutionMinutes,
  };
}

export interface PlannedNotification {
  id: number;
  at: Date;
  title: string;
  body: string;
  kind: 'ablution' | 'prayer';
  prayer: Exclude<PrayerKey, 'sunrise'>;
}

export const PRAYER_LABELS: Record<Exclude<PrayerKey, 'sunrise'>, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

/** Jours planifiés à l'avance (Android limite le nombre d'alarmes en attente). */
export const DAYS_AHEAD = 3;

/**
 * Liste les notifications à programmer à partir de `now` : un rappel d'ablutions (optionnel)
 * et une notification à l'heure de chaque prière. Les moments déjà passés sont écartés.
 * Les identifiants sont stables pour un même instant de planification.
 */
export function buildSchedule(
  now: Date,
  coords: Coordinates,
  calc: CalcOptions,
  settings: NotificationSettings,
  days: number = DAYS_AHEAD,
): PlannedNotification[] {
  if (!settings.enabled) return [];
  const out: PlannedNotification[] = [];
  for (let offset = 0; offset < days; offset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const times = computePrayerTimes(day, coords, calc);
    PRAYER_KEYS.forEach((prayer, index) => {
      const time = times[prayer];
      if (!time) return;
      const base = offset * 10 + index * 2 + 1;
      const label = PRAYER_LABELS[prayer];
      if (settings.ablutionMinutes > 0) {
        const at = new Date(time.getTime() - settings.ablutionMinutes * 60000);
        if (at.getTime() > now.getTime()) {
          out.push({
            id: base,
            at,
            title: 'Ablutions',
            body: `${label} dans ${settings.ablutionMinutes} min : prépare tes ablutions.`,
            kind: 'ablution',
            prayer,
          });
        }
      }
      if (time.getTime() > now.getTime()) {
        out.push({ id: base + 1, at: time, title: label, body: `C'est l'heure de la prière de ${label}.`, kind: 'prayer', prayer });
      }
    });
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}
