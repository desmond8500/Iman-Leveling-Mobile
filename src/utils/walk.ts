import type { GridPos, Point } from './iso';

/** Chemin en « L » sur la grille : d'abord en x, puis en y (une case par pas). */
export function walkPath(from: GridPos, to: GridPos): GridPos[] {
  const path: GridPos[] = [{ gx: from.gx, gy: from.gy }];
  let { gx, gy } = from;
  while (gx !== to.gx) {
    gx += Math.sign(to.gx - gx);
    path.push({ gx, gy });
  }
  while (gy !== to.gy) {
    gy += Math.sign(to.gy - gy);
    path.push({ gx, gy });
  }
  return path;
}

/** Longueur d'une ligne brisée. */
export function pathLength(points: Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  return total;
}

/** Point situé à la fraction t (0..1) de la ligne brisée. */
export function pointAlong(points: Point[], t: number): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1 || t <= 0) return { ...points[0] };
  const total = pathLength(points);
  if (t >= 1 || total === 0) return { ...points[points.length - 1] };
  let remaining = t * total;
  for (let i = 1; i < points.length; i++) {
    const seg = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    if (remaining <= seg) {
      const k = seg === 0 ? 0 : remaining / seg;
      return {
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * k,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * k,
      };
    }
    remaining -= seg;
  }
  return { ...points[points.length - 1] };
}

/** Courbe d'accélération douce (départ et arrivée ralentis). */
export const easeInOut = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
