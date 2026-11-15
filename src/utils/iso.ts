/*
 * Terrain isométrique du parcours : une grille de tuiles de hauteurs variées, vue de dessus en
 * perspective. Fonctions pures : le dessin se fait dans la vue (SVG).
 */

export const TILE_W = 64;
export const TILE_H = 32;
/** Hauteur visuelle d'un niveau de relief, en pixels. */
export const LEVEL_H = 12;
export const MAX_LEVEL = 2;

export interface Point {
  x: number;
  y: number;
}

export interface GridPos {
  gx: number;
  gy: number;
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Relief d'une tuile (0 à 2) : lisse, donc des collines plutôt que du bruit. Stable pour un même lieu. */
export function tileLevel(gx: number, gy: number, seed: string): number {
  const s = hash(seed) % 1000;
  const v = Math.sin(gx * 0.9 + s) + Math.cos(gy * 0.7 + s * 0.37) + Math.sin((gx + gy) * 0.5 + s * 0.11);
  const normalized = (v + 3) / 6; // 0..1
  return Math.max(0, Math.min(MAX_LEVEL, Math.floor(normalized * (MAX_LEVEL + 1))));
}

/** Sommet haut (centre de la face supérieure) d'une tuile, dans le repère du dessin. */
export function project(gx: number, gy: number, level: number, cols: number): Point {
  const originX = (cols * TILE_W) / 2; // le coin (0,0) est en haut au centre (grille carrée)
  return {
    x: originX + (gx - gy) * (TILE_W / 2),
    y: (gx + gy) * (TILE_H / 2) - level * LEVEL_H + MAX_LEVEL * LEVEL_H + TILE_H / 2,
  };
}

/** Losange de la face supérieure d'une tuile, sous forme de points « x,y x,y … ». */
export function topFace(gx: number, gy: number, level: number, cols: number): string {
  const c = project(gx, gy, level, cols);
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;
  return `${c.x},${c.y - hh} ${c.x + hw},${c.y} ${c.x},${c.y + hh} ${c.x - hw},${c.y}`;
}

/** Face gauche (côté sud-ouest) d'une tuile, de la face supérieure jusqu'au sol. */
export function leftFace(gx: number, gy: number, level: number, cols: number): string {
  const c = project(gx, gy, level, cols);
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;
  const drop = (level + 1) * LEVEL_H;
  return `${c.x - hw},${c.y} ${c.x},${c.y + hh} ${c.x},${c.y + hh + drop} ${c.x - hw},${c.y + drop}`;
}

/** Face droite (côté sud-est) d'une tuile. */
export function rightFace(gx: number, gy: number, level: number, cols: number): string {
  const c = project(gx, gy, level, cols);
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;
  const drop = (level + 1) * LEVEL_H;
  return `${c.x + hw},${c.y} ${c.x},${c.y + hh} ${c.x},${c.y + hh + drop} ${c.x + hw},${c.y + drop}`;
}

export interface Stage {
  cols: number;
  rows: number;
  width: number;
  height: number;
  /** Tuiles dans l'ordre de dessin (de l'arrière vers l'avant). */
  tiles: { gx: number; gy: number; level: number }[];
  /** Case de départ du joueur (au premier plan). */
  start: GridPos;
  /** Une case par rencontre, dans l'ordre. */
  spots: GridPos[];
}

/**
 * Terrain d'un lieu : le joueur part du premier plan et chaque rencontre occupe une case à l'écart
 * des autres. Le placement est déterminé par `seed`, donc identique à chaque visite.
 */
export function buildStage(seed: string, encounters: number, cols = 6, rows = 6): Stage {
  const tiles: Stage['tiles'] = [];
  for (let s = 0; s <= cols + rows - 2; s++) {
    for (let gx = 0; gx < cols; gx++) {
      const gy = s - gx;
      if (gy >= 0 && gy < rows) tiles.push({ gx, gy, level: tileLevel(gx, gy, seed) });
    }
  }

  const start: GridPos = { gx: cols - 1, gy: rows - 1 };
  const rand = mulberry32(hash(`spots:${seed}`));
  const candidates: GridPos[] = [];
  for (let gx = 0; gx < cols; gx++) {
    for (let gy = 0; gy < rows; gy++) {
      // On évite le bord de départ et les cases collées au joueur.
      if (Math.abs(gx - start.gx) + Math.abs(gy - start.gy) >= 3) candidates.push({ gx, gy });
    }
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const spots: GridPos[] = [];
  // D'abord des cases bien espacées, puis, s'il en manque, les premières restantes.
  for (const minDistance of [3, 2, 1]) {
    for (const c of candidates) {
      if (spots.length >= encounters) break;
      if (spots.some((s) => s.gx === c.gx && s.gy === c.gy)) continue;
      if (spots.every((s) => Math.abs(s.gx - c.gx) + Math.abs(s.gy - c.gy) >= minDistance)) spots.push(c);
    }
  }

  return {
    cols,
    rows,
    width: (cols + rows) * (TILE_W / 2),
    height: (cols + rows) * (TILE_H / 2) + (MAX_LEVEL + 2) * LEVEL_H + TILE_H,
    tiles,
    start,
    spots,
  };
}

/** Position d'une unité debout sur une case (centre de la face supérieure). */
export function unitPoint(stage: Stage, pos: GridPos, seed: string): Point {
  return project(pos.gx, pos.gy, tileLevel(pos.gx, pos.gy, seed), stage.cols);
}
