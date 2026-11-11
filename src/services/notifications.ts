import { Capacitor } from '@capacitor/core';
import { buildSchedule, type NotificationSettings } from '@/utils/notifications';
import type { CalcOptions, Coordinates } from '@/utils/prayerTimes';

/**
 * Notifications locales (Android / iOS uniquement). Sur le web, elles ne sont pas disponibles :
 * toutes les fonctions renvoient alors un résultat neutre.
 *
 * Le son de l'adhan n'est pas fourni : voir README (« Appel du muezzin »).
 */
export const notificationsSupported = () => Capacitor.isNativePlatform();

async function plugin() {
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  return LocalNotifications;
}

/** Demande l'autorisation d'afficher des notifications. `true` si accordée. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  const ln = await plugin();
  const current = await ln.checkPermissions();
  if (current.display === 'granted') return true;
  const asked = await ln.requestPermissions();
  return asked.display === 'granted';
}

/** Remplace toutes les notifications programmées par celles des prochains jours. */
export async function rescheduleNotifications(
  coords: Coordinates | null,
  calc: CalcOptions,
  settings: NotificationSettings,
  now: Date = new Date(),
): Promise<number> {
  if (!notificationsSupported()) return 0;
  const ln = await plugin();
  const pending = await ln.getPending();
  if (pending.notifications.length) await ln.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
  if (!coords || !settings.enabled) return 0;
  const plan = buildSchedule(now, coords, calc, settings);
  if (!plan.length) return 0;
  await ln.schedule({
    notifications: plan.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      schedule: { at: n.at, allowWhileIdle: true },
    })),
  });
  return plan.length;
}
