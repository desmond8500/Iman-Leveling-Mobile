/**
 * Personnages en pixel art, dessinés par le code (aucune image à charger, donc 100 % hors ligne).
 * Chaque personnage est une grille de 16 × 25 caractères ; chaque caractère désigne une couleur.
 */
export const SPRITE_W = 16;
export const SPRITE_H = 25;

export type HeadStyle = 'hair' | 'hijab' | 'turban' | 'kufi';
export type SpriteAnim = 'idle' | 'walk';

export interface Look {
  skin: string;
  hair: string;
  /** Haut (veste, chemise…). */
  top: string;
  pants: string;
  shoes: string;
  head: HeadStyle;
  /** Couleur du voile, turban ou calot. */
  accent?: string;
  beard?: boolean;
  glasses?: boolean;
  /** Longue tenue (gandoura, robe) à la place du pantalon. */
  robe?: boolean;
  /** Cravate : couleur. */
  tie?: string;
  /** Taille relative (petite sœur = 0.82). */
  scale?: number;
}

const BLANK = '.'.repeat(SPRITE_W);

/** Rangées de la tête (10) selon le style. Les yeux sont en rangées 5 et 6. */
const HEADS: Record<HeadStyle, string[]> = {
  hair: [
    '....OOOOOOOO....',
    '...OHHHHHHHHO...',
    '..OHHHHHHHHHHO..',
    '..OHHSSSSSSHHO..',
    '..OHSSSSSSSSHO..',
    '..OSSESSSSESSO..',
    '..OSSESSSSESSO..',
    '..OSSSSMMSSSSO..',
    '...OSSSSSSSSO...',
    '....OOSSSSOO....',
  ],
  hijab: [
    '....OOOOOOOO....',
    '...OAAAAAAAAO...',
    '..OAAAAAAAAAAO..',
    '..OAASSSSSSAAO..',
    '..OAASSSSSSAAO..',
    '..OAASESSESAAO..',
    '..OAASESSESAAO..',
    '..OAASSMMSSAAO..',
    '..OAAASSSSAAAO..',
    '...OAAAAAAAAO...',
  ],
  turban: [
    '...OOOOOOOOOO...',
    '..OAAAAAAAAAAO..',
    '..OAAaAAAAaAAO..',
    '..OAAAAAAAAAAO..',
    '..OSSSSSSSSSSO..',
    '..OSSESSSSESSO..',
    '..OSSESSSSESSO..',
    '..OSSSSMMSSSSO..',
    '...OSSSSSSSSO...',
    '....OOSSSSOO....',
  ],
  kufi: [
    '....OAAAAAAO....',
    '...OAAAAAAAAO...',
    '..OHHHHHHHHHHO..',
    '..OHHSSSSSSHHO..',
    '..OHSSSSSSSSHO..',
    '..OSSESSSSESSO..',
    '..OSSESSSSESSO..',
    '..OSSSSMMSSSSO..',
    '...OSSSSSSSSO...',
    '....OOSSSSOO....',
  ],
};

const TORSO = [
  '...OCCCCCCCCO...',
  '..OCCCCCCCCCCO..',
  '..ODCCCCCCCCDO..',
  '..ODCCCCCCCCDO..',
  '..OSDCCCCCCDSO..',
  '...OOCCCCCCOO...',
  '....OPPPPPPO....',
];

const LEGS_STAND = ['....OPPOOPPO....', '....OPPOOPPO....', '....OPPOOPPO....', '....OPPOOPPO....', '....OBBOOBBO....', '...OBBBOOBBBO...', BLANK];
const FOOT_A = '...OBBBO..OOO...';
const FOOT_B = '...OOO..OBBBO...';

function replaceAt(row: string, col: number, ch: string): string {
  return row.slice(0, col) + ch + row.slice(col + 1);
}

function head(look: Look): string[] {
  const rows = [...HEADS[look.head]];
  if (look.glasses) rows[5] = [4, 6, 9, 11].reduce((r, c) => replaceAt(r, c, 'G'), rows[5]);
  if (look.beard && look.head !== 'hijab') {
    // Barbe : joues, menton (la bouche reste visible).
    rows[6] = [3, 4, 11, 12].reduce((r, c) => replaceAt(r, c, 'H'), rows[6]);
    rows[7] = rows[7].replace(/S/g, 'H');
    rows[8] = rows[8].replace(/S/g, 'H');
  }
  return rows;
}

function torso(look: Look): string[] {
  const rows = [...TORSO];
  if (look.head === 'hijab') {
    // Le voile retombe sur les épaules.
    rows[0] = rows[0].replace(/C/g, 'A');
    rows[1] = rows[1].replace(/C/g, 'A');
  }
  if (look.tie) {
    rows[0] = replaceAt(replaceAt(rows[0], 6, 'W'), 9, 'W');
    for (const i of [1, 2, 3, 4]) rows[i] = replaceAt(replaceAt(rows[i], 7, 'T'), 8, 'T');
  }
  if (look.robe) rows[6] = '....OCCCCCCO....';
  return rows;
}

function legs(look: Look, foot: 'stand' | 'A' | 'B'): string[] {
  const rows = [...LEGS_STAND];
  if (look.robe) {
    for (let i = 0; i < 4; i++) rows[i] = '....OCCCCCCO....';
    rows[3] = '...OCCCCCCCCO...';
    rows[4] = '...OCCCCCCCCO...';
  }
  if (foot === 'A') rows[5] = FOOT_A;
  if (foot === 'B') rows[5] = FOOT_B;
  return rows;
}

/** Un « rebond » : la tête monte d'un pixel et le torse s'étire (respiration / pas). */
function bob(rows: string[]): string[] {
  const t = 15;
  return [...rows.slice(1, t + 1), rows[t], ...rows.slice(t + 1)];
}

function base(look: Look, foot: 'stand' | 'A' | 'B'): string[] {
  return [BLANK, ...head(look), ...torso(look), ...legs(look, foot)];
}

/** Les images (grilles) de l'animation demandée. */
export function spriteFrames(look: Look, anim: SpriteAnim): string[][] {
  const stand = base(look, 'stand');
  if (anim === 'idle') return [stand, bob(stand)];
  return [base(look, 'A'), bob(stand), base(look, 'B'), bob(stand)];
}

/** Durée d'une image en millisecondes. */
export const frameInterval = (anim: SpriteAnim): number => (anim === 'walk' ? 130 : 600);

function shade(hex: string, factor: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const c = (shift: number) => Math.min(255, Math.round(((n >> shift) & 255) * factor));
  return `#${[16, 8, 0].map((s) => c(s).toString(16).padStart(2, '0')).join('')}`;
}

/** Correspondance caractère → couleur pour un personnage. */
export function spritePalette(look: Look): Record<string, string> {
  const accent = look.accent ?? '#e8e2d0';
  return {
    O: '#2b1b17',
    S: look.skin,
    H: look.hair,
    A: accent,
    a: shade(accent, 0.75),
    C: look.top,
    D: shade(look.top, 0.78),
    P: look.robe ? look.top : look.pants,
    B: look.shoes,
    E: '#1a1a1a',
    M: '#a8433b',
    G: '#232634',
    T: look.tie ?? '#b33a3a',
    W: '#ffffff',
  };
}

export interface PixelPath {
  fill: string;
  d: string;
}

/** Convertit une grille en tracés SVG : un tracé par couleur, des segments horizontaux d'un pixel de haut. */
export function toPaths(rows: string[], palette: Record<string, string>): PixelPath[] {
  const byColor = new Map<string, string>();
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === '.' || !palette[ch]) {
        x++;
        continue;
      }
      let end = x;
      while (end + 1 < row.length && row[end + 1] === ch) end++;
      const fill = palette[ch];
      byColor.set(fill, `${byColor.get(fill) ?? ''}M${x} ${y}h${end - x + 1}v1h-${end - x + 1}z`);
      x = end + 1;
    }
  });
  return [...byColor].map(([fill, d]) => ({ fill, d }));
}

const cache = new Map<string, PixelPath[][]>();

/** Images prêtes à dessiner (mises en cache). */
export function spritePaths(look: Look, anim: SpriteAnim): PixelPath[][] {
  const key = `${anim}|${JSON.stringify(look)}`;
  let hit = cache.get(key);
  if (!hit) {
    const palette = spritePalette(look);
    hit = spriteFrames(look, anim).map((rows) => toPaths(rows, palette));
    cache.set(key, hit);
  }
  return hit;
}
