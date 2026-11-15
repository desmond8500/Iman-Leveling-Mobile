/** Nombre de caractères visibles après `elapsedMs` (machine à écrire), borné à [0, total]. */
export function revealLength(elapsedMs: number, charsPerSecond: number, total: number): number {
  if (total <= 0 || charsPerSecond <= 0) return Math.max(0, total);
  return Math.min(total, Math.max(0, Math.floor((elapsedMs / 1000) * charsPerSecond)));
}
