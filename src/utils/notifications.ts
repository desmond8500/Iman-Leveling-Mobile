import { fastingInfo } from './fasting';
import { formatHijri, toHijri } from './hijri';
import { PRAYER_KEYS, formatTime, prayerWindows, type CalcOptions, type Coordinates, type PrayerKey } from './prayerTimes';

export interface NotificationSettings {
  enabled: boolean;
  /** Rappel des ablutions avant la prière, en minutes ; 0 = désactivé. */
  ablutionMinutes: number;
  /** Rappel avant la fin du temps de la prière, en minutes ; 0 = désactivé. */
  endMinutes: number;
  /** Rappel la veille de chaque jour blanc (jeûne recommandé). Indépendant des rappels de prière. */
  whiteDays: boolean;
}

export const defaultNotificationSettings = (): NotificationSettings => ({
  enabled: false,
  ablutionMinutes: 15,
  endMinutes: 15,
  whiteDays: false,
});

export const ABLUTION_CHOICES = [0, 10, 15, 20, 30];
export const END_CHOICES = [0, 10, 15, 20, 30, 45];

export function normalizeNotificationSettings(value: unknown): NotificationSettings {
  const base = defaultNotificationSettings();
  if (typeof value !== 'object' || value === null) return base;
  const v = value as Partial<NotificationSettings>;
  return {
    enabled: v.enabled === true,
    ablutionMinutes: ABLUTION_CHOICES.includes(v.ablutionMinutes as number) ? (v.ablutionMinutes as number) : base.ablutionMinutes,
    endMinutes: END_CHOICES.includes(v.endMinutes as number) ? (v.endMinutes as number) : base.endMinutes,
    whiteDays: v.whiteDays === true,
  };
}

export interface PlannedNotification {
  id: number;
  at: Date;
  title: string;
  body: string;
  kind: 'ablution' | 'prayer' | 'ending' | 'white';
  /** Prière concernée (absent pour les rappels des jours blancs). */
  prayer?: Exclude<PrayerKey, 'sunrise'>;
}

export const PRAYER_LABELS: Record<Exclude<PrayerKey, 'sunrise'>, string> = {
  fajr: 'Soubh',
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
    const windows = prayerWindows(day, coords, calc);
    PRAYER_KEYS.forEach((prayer, index) => {
      const window = windows[prayer];
      if (!window) return;
      const time = window.start;
      const base = offset * 20 + index * 3 + 1;
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
      if (settings.endMinutes > 0) {
        const at = new Date(window.end.getTime() - settings.endMinutes * 60000);
        // Le rappel n'a de sens que s'il tombe pendant le temps de la prière.
        if (at.getTime() > now.getTime() && at.getTime() > time.getTime()) {
          out.push({
            id: base + 2,
            at,
            title: `${label} : bientôt la fin`,
            body: `Il reste ${settings.endMinutes} min pour prier ${label} (jusqu'à ${formatTime(window.end)}).`,
            kind: 'ending',
            prayer,
          });
        }
      }
    });
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}

/** Heure (locale) du rappel des jours blancs, la veille au soir. */
export const WHITE_DAY_REMINDER_HOUR = 20;

/** Jours couverts à l'avance : un peu plus d'un mois, pour toujours inclure la prochaine série. */
export const WHITE_DAYS_AHEAD = 35;

/** Identifiants réservés aux rappels des jours blancs (ceux des prières restent sous 100). */
const WHITE_ID_BASE = 1000;

const WHITE_RANK = ['1er', '2e', '3e'];

/**
 * Rappels des jours blancs (13, 14 et 15 du mois hégirien, hors Ramadan et jours de fête) :
 * une notification la veille à {@link WHITE_DAY_REMINDER_HOUR} h, pour penser à l'intention et au
 * souhour. Ne dépend pas de la position. Les moments déjà passés sont écartés.
 */
export function buildWhiteDaySchedule(
  now: Date,
  settings: NotificationSettings,
  days: number = WHITE_DAYS_AHEAD,
): PlannedNotification[] {
  if (!settings.whiteDays) return [];
  const out: PlannedNotification[] = [];
  // offset 0 = aujourd'hui : son rappel serait tombé hier, il est donc ignoré.
  for (let offset = 1; offset <= days; offset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    if (!fastingInfo(day).white) continue;
    const at = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1, WHITE_DAY_REMINDER_HOUR, 0);
    if (at.getTime() <= now.getTime()) continue;
    const h = toHijri(day);
    const rank = WHITE_RANK[h.day - 13] ?? '';
    out.push({
      id: WHITE_ID_BASE + offset,
      at,
      title: h.day === 13 ? 'Demain commencent les jours blancs' : `Demain, ${rank} jour blanc`,
      body: `${formatHijri(h)} : jeûne recommandé. Pense à l'intention et au souhour.`,
      kind: 'white',
    });
  }
  return out;
}
