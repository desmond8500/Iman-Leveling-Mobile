/**
 * Suivi de lecture pendant le défilement d'une sourate. Pur (sans DOM) pour pouvoir être testé :
 * la page lui transmet les changements de visibilité des versets.
 *
 * - Marque-page : le premier verset visible.
 * - Lus : un verset est lu quand il est sorti de l'écran par le haut (on a défilé au-delà), ou
 *   quand le dernier verset de la sourate apparaît (fin atteinte).
 */
export interface TrackerSnapshot {
  /** Premier verset visible (marque-page), ou null si rien n'est visible. */
  bookmark: number | null;
  /** Début de la lecture de cette session (plus petit verset vu). */
  from: number;
  /** Dernier verset lu (0 si aucun). */
  to: number;
}

export function createReadingTracker(totalVerses: number) {
  const visible = new Set<number>();
  let from = 0;
  let to = 0;

  return {
    /** `aboveViewport` : le verset est sorti par le haut de l'écran. */
    update(verse: number, intersecting: boolean, aboveViewport = false) {
      if (!Number.isInteger(verse) || verse < 1 || verse > totalVerses) return;
      if (intersecting) {
        visible.add(verse);
        if (from === 0 || verse < from) from = verse;
        if (verse === totalVerses) to = totalVerses;
      } else {
        visible.delete(verse);
        if (aboveViewport) to = Math.max(to, verse);
      }
    },
    snapshot(): TrackerSnapshot {
      return { bookmark: visible.size ? Math.min(...visible) : null, from, to };
    },
    reset() {
      visible.clear();
      from = 0;
      to = 0;
    },
  };
}
