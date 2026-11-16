/*
 * Briques du « vector art » : chaque dessin est une liste de formes SVG décrites par des données
 * (aucune image à charger, donc 100 % hors ligne). Les vues n'ont plus qu'à les afficher.
 */

export type ShapeTag = 'path' | 'circle' | 'ellipse' | 'rect' | 'line' | 'polygon' | 'text';

export interface Shape {
  tag: ShapeTag;
  attrs: Record<string, string | number>;
  /** Contenu d'une forme `text`. */
  text?: string;
}

/** Couleur du contour des dessins (brun très sombre, plus doux qu'un noir pur). */
export const INK = '#2b1b17';

/** Assombrit (facteur < 1) ou éclaircit (facteur > 1) une couleur « #rrggbb ». */
export function shade(hex: string, factor: number): string {
  const n = Number.parseInt(hex.slice(1, 7), 16);
  if (!/^#[0-9a-f]{6}$/i.test(hex) || Number.isNaN(n)) return hex;
  const c = (shift: number) => Math.max(0, Math.min(255, Math.round(((n >> shift) & 255) * factor)));
  return `#${[16, 8, 0].map((s) => c(s).toString(16).padStart(2, '0')).join('')}`;
}

/** Mélange une couleur avec du blanc (t = 0 : couleur, t = 1 : blanc). */
export function tint(hex: string, t: number): string {
  const n = Number.parseInt(hex.slice(1, 7), 16);
  if (!/^#[0-9a-f]{6}$/i.test(hex) || Number.isNaN(n)) return hex;
  const c = (shift: number) => Math.round(((n >> shift) & 255) + (255 - ((n >> shift) & 255)) * t);
  return `#${[16, 8, 0].map((s) => c(s).toString(16).padStart(2, '0')).join('')}`;
}

/* Raccourcis pour écrire les dessins sans répéter `tag` et `attrs`. */
export const path = (d: string, attrs: Shape['attrs'] = {}): Shape => ({ tag: 'path', attrs: { d, ...attrs } });
export const circle = (cx: number, cy: number, r: number, attrs: Shape['attrs'] = {}): Shape => ({ tag: 'circle', attrs: { cx, cy, r, ...attrs } });
export const ellipse = (cx: number, cy: number, rx: number, ry: number, attrs: Shape['attrs'] = {}): Shape => ({
  tag: 'ellipse',
  attrs: { cx, cy, rx, ry, ...attrs },
});
export const rect = (x: number, y: number, width: number, height: number, attrs: Shape['attrs'] = {}): Shape => ({
  tag: 'rect',
  attrs: { x, y, width, height, ...attrs },
});
export const line = (x1: number, y1: number, x2: number, y2: number, attrs: Shape['attrs'] = {}): Shape => ({
  tag: 'line',
  attrs: { x1, y1, x2, y2, ...attrs },
});
export const text = (x: number, y: number, content: string, attrs: Shape['attrs'] = {}): Shape => ({
  tag: 'text',
  attrs: { x, y, ...attrs },
  text: content,
});

/** Contour standard (trait arrondi). */
export const outline = (width = 1.6): Shape['attrs'] => ({
  stroke: INK,
  'stroke-width': width,
  'stroke-linejoin': 'round',
  'stroke-linecap': 'round',
});

/** Trait sans remplissage. */
export const stroke = (color: string, width: number, extra: Shape['attrs'] = {}): Shape['attrs'] => ({
  fill: 'none',
  stroke: color,
  'stroke-width': width,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  ...extra,
});
