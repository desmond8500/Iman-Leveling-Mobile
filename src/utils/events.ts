import { toHijri } from './hijri';

/**
 * Prochaine date grégorienne (à partir de `from`, jour inclus) où tombe un jour du calendrier
 * hégirien, par exemple 1er Chawwal (`month` 10, `day` 1). `null` si introuvable (ne devrait pas arriver).
 * Date prévue par le calendrier : l'observation de la lune peut la décaler d'un jour.
 */
export function nextHijriOccurrence(from: Date, month: number, day: number): Date | null {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 0; i <= 400; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const h = toHijri(d);
    if (h.month === month && h.day === day) return d;
  }
  return null;
}

/** « dans 12 jours », « demain », « aujourd'hui ». */
export function daysUntilLabel(from: Date, target: Date): string {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const days = Math.round((b - a) / 86400000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return 'demain';
  return `dans ${days} jours`;
}
