/*
 * Décors des lieux du parcours, en vector art vu de dessus (vue « trois quarts » des RPG mobiles).
 * Tout est décrit par des données : le sol d'abord, puis des éléments posés au sol (bâtiments,
 * arbres, voitures…) que la vue trie par profondeur avec les personnages.
 */
import type { Terrain } from '@/utils/rpg';
import { circle, ellipse, INK, line, outline, path, rect, shade, stroke, text, tint, type Shape } from '@/utils/vector';

export const SCENE_W = 360;
export const SCENE_H = 300;
/**
 * Bande de sol au-dessus du décor (y négatifs) : elle passe sous le HUD de l'écran de jeu,
 * pour que les bâtiments restent visibles en dessous.
 */
export const SCENE_TOP = -62;
/** `viewBox` complet d'une scène, bande du haut comprise. */
export const SCENE_VIEWBOX = `0 ${SCENE_TOP} ${SCENE_W} ${SCENE_H - SCENE_TOP}`;

export interface Point {
  x: number;
  y: number;
}

/** Élément posé au sol, dessiné autour de son pied (0, 0) puis déplacé en (x, y) et agrandi de `s`. */
export interface Prop {
  id: string;
  x: number;
  y: number;
  s: number;
  shapes: Shape[];
}

export interface Scene {
  ground: Shape[];
  props: Prop[];
  /** Place du joueur à l'arrivée. */
  start: Point;
  /** Une place par rencontre, dans l'ordre. */
  spots: Point[];
}

const SHADOW = { fill: '#000000', opacity: 0.18 };

/* ------------------------------------------------------------------ Éléments de décor */

export function tree(color = '#4f9a43'): Shape[] {
  const dark = shade(color, 0.75);
  const light = tint(color, 0.25);
  return [
    ellipse(0, 0, 20, 7, SHADOW),
    path('M-4 0 L-3 -18 L3 -18 L4 0 Z', { fill: '#7a4f2e', ...outline(1.4) }),
    circle(-11, -26, 13, { fill: dark, ...outline() }),
    circle(11, -26, 13, { fill: dark, ...outline() }),
    circle(0, -38, 16, { fill: color, ...outline() }),
    circle(-8, -27, 10, { fill: color }),
    circle(8, -27, 10, { fill: color }),
    circle(-5, -43, 5.5, { fill: light }),
    circle(6, -32, 3, { fill: light }),
  ];
}

export function pine(color = '#2f7a4a'): Shape[] {
  const dark = shade(color, 0.72);
  return [
    ellipse(0, 0, 15, 5, SHADOW),
    rect(-3, -12, 6, 12, { fill: '#6b4428', ...outline(1.3) }),
    path('M-17 -10 L0 -34 L17 -10 Z', { fill: dark, ...outline() }),
    path('M-14 -24 L0 -46 L14 -24 Z', { fill: color, ...outline() }),
    path('M-10 -38 L0 -56 L10 -38 Z', { fill: tint(color, 0.15), ...outline() }),
  ];
}

export function palm(): Shape[] {
  const leaf = { fill: '#4fae4a', ...outline(1.3) };
  return [
    ellipse(4, 0, 18, 5, SHADOW),
    path('M-3 0 Q-6 -24 2 -46 L7 -45 Q1 -24 4 0 Z', { fill: '#a8743d', ...outline(1.3) }),
    path('M-2 -10 h6 M-3 -20 h6 M-2 -30 h6 M0 -39 h6', stroke(shade('#a8743d', 0.7), 1)),
    path('M4 -46 Q-14 -56 -30 -44 Q-14 -50 4 -44 Z', leaf),
    path('M4 -46 Q22 -58 36 -44 Q20 -50 4 -44 Z', leaf),
    path('M4 -47 Q-6 -66 -20 -66 Q-6 -60 3 -45 Z', { ...leaf, fill: '#3f9a3e' }),
    path('M5 -47 Q16 -68 30 -64 Q16 -60 5 -45 Z', { ...leaf, fill: '#3f9a3e' }),
    path('M4 -46 Q2 -64 6 -72 Q8 -60 6 -45 Z', { ...leaf, fill: '#5cc255' }),
    circle(2, -45, 2.6, { fill: '#6b4428' }),
    circle(7, -44, 2.6, { fill: '#6b4428' }),
  ];
}

export function bush(color = '#3f8f3c'): Shape[] {
  return [
    ellipse(0, 0, 16, 5, SHADOW),
    circle(-8, -7, 8, { fill: shade(color, 0.85), ...outline(1.4) }),
    circle(8, -7, 8, { fill: shade(color, 0.85), ...outline(1.4) }),
    circle(0, -11, 9.5, { fill: color, ...outline(1.4) }),
    circle(-3, -14, 3, { fill: tint(color, 0.3) }),
  ];
}

export function flowers(colors = ['#ff6b8a', '#ffd34d', '#ffffff']): Shape[] {
  const shapes: Shape[] = [];
  const spots = [
    [-10, -2],
    [0, -5],
    [10, -1],
    [-4, 3],
    [6, 4],
  ];
  spots.forEach(([x, y], i) => {
    shapes.push(line(x, y, x, y + 4, stroke('#2f6b2a', 1)), circle(x, y, 2.6, { fill: colors[i % colors.length], ...outline(0.9) }), circle(x, y, 0.9, { fill: '#ffb43a' }));
  });
  return shapes;
}

export function lamp(): Shape[] {
  return [
    ellipse(0, 0, 6, 2.5, SHADOW),
    rect(-1.6, -44, 3.2, 44, { fill: '#3b4256', ...outline(1.2) }),
    path('M-7 -44 L7 -44 L4 -52 L-4 -52 Z', { fill: '#3b4256', ...outline(1.2) }),
    circle(0, -42, 3, { fill: '#ffe08a' }),
    circle(0, -42, 8, { fill: '#ffe08a', opacity: 0.25 }),
  ];
}

export function bench(): Shape[] {
  return [
    ellipse(0, 1, 22, 4, SHADOW),
    rect(-18, -6, 3, 7, { fill: '#3b4256' }),
    rect(15, -6, 3, 7, { fill: '#3b4256' }),
    rect(-21, -12, 42, 6, { fill: '#b07a45', rx: 1.5, ...outline(1.3) }),
    rect(-21, -21, 42, 6, { fill: '#c58b52', rx: 1.5, ...outline(1.3) }),
  ];
}

export function well(): Shape[] {
  return [
    ellipse(0, 0, 22, 7, SHADOW),
    path('M-17 -14 L-17 -2 Q0 6 17 -2 L17 -14 Z', { fill: '#a3a8bc', ...outline() }),
    path('M-17 -8 Q0 0 17 -8 M-6 -11 v8 M6 -11 v8', stroke(shade('#a3a8bc', 0.7), 1)),
    ellipse(0, -14, 17, 6, { fill: '#8e93a8', ...outline() }),
    ellipse(0, -14, 12, 3.6, { fill: '#2f5fa8' }),
    path('M-15 -14 L-15 -42 M15 -14 L15 -42', stroke(INK, 4.4)),
    path('M-15 -14 L-15 -42 M15 -14 L15 -42', stroke('#7a4f2e', 2.6)),
    path('M-21 -38 L0 -52 L21 -38 Z', { fill: '#b5523b', ...outline() }),
  ];
}

export function flagPole(color = '#2f9a5a'): Shape[] {
  return [
    ellipse(0, 0, 8, 3, SHADOW),
    rect(-1.5, -70, 3, 70, { fill: '#d8dce8', ...outline(1.1) }),
    circle(0, -71, 2.6, { fill: '#ffd34d', ...outline(1) }),
    path('M1.5 -68 Q14 -72 26 -66 Q14 -60 1.5 -56 Z', { fill: color, ...outline(1.2) }),
  ];
}

export function car(color = '#c93a3a'): Shape[] {
  const dark = shade(color, 0.72);
  return [
    ellipse(0, 2, 30, 7, SHADOW),
    rect(-24, -8, 8, 10, { fill: INK, rx: 2 }),
    rect(16, -8, 8, 10, { fill: INK, rx: 2 }),
    path('M-30 -2 Q-30 -14 -22 -16 L22 -16 Q30 -14 30 -2 Q30 3 24 3 L-24 3 Q-30 3 -30 -2 Z', { fill: color, ...outline() }),
    path('M-16 -16 Q-13 -28 -6 -29 L10 -29 Q17 -28 19 -16 Z', { fill: dark, ...outline() }),
    path('M-12 -17 Q-10 -25 -5 -26 L1 -26 L1 -17 Z M4 -17 L4 -26 L9 -26 Q14 -25 15 -17 Z', { fill: '#a9dcf5' }),
    rect(-29, -9, 4, 4, { fill: '#ffe9a8', rx: 1 }),
    path('M-22 -6 h44', stroke(tint(color, 0.35), 1.4)),
  ];
}

export function house(): Shape[] {
  return [
    path('M-70 0 L70 0 L78 8 L-62 8 Z', { fill: '#000', opacity: 0.16 }),
    rect(-64, -62, 128, 62, { fill: '#f1e3c4', ...outline() }),
    rect(30, -62, 34, 62, { fill: '#e0cfa9' }),
    rect(-64, -8, 128, 8, { fill: '#c9b48a', ...outline(1.2) }),
    rect(-64, -62, 128, 62, { fill: 'none', ...outline() }),
    // Toit en tuiles
    path('M-76 -58 L-56 -104 L56 -104 L76 -58 Z', { fill: '#b5523b', ...outline() }),
    path('M-70 -70 L70 -70 M-65 -82 L65 -82 M-60 -94 L60 -94', stroke(shade('#b5523b', 0.72), 1.3)),
    path('M-56 -104 L56 -104', stroke(INK, 3)),
    rect(30, -118, 13, 20, { fill: '#a3a8bc', ...outline(1.4) }),
    // Porte arrondie et fenêtres à volets
    path('M-12 0 L-12 -24 Q-12 -36 0 -36 Q12 -36 12 -24 L12 0 Z', { fill: '#7a4a2b', ...outline() }),
    path('M0 -36 L0 0', stroke(shade('#7a4a2b', 0.7), 1.2)),
    circle(5, -16, 1.6, { fill: '#ffd34d' }),
    ...[-44, 44].flatMap((cx) => [
      rect(cx - 20, -48, 8, 24, { fill: '#3f8f6a', ...outline(1.2) }),
      rect(cx + 12, -48, 8, 24, { fill: '#3f8f6a', ...outline(1.2) }),
      rect(cx - 12, -48, 24, 24, { fill: '#9fd3f0', ...outline(1.4) }),
      path(`M${cx} -48 V-24 M${cx - 12} -36 H${cx + 12}`, stroke(INK, 1.2)),
      path(`M${cx - 9} -45 l6 -0`, stroke('#ffffff', 1.6, { opacity: 0.8 })),
    ]),
    // Croissant au-dessus de la porte
    path('M-3 -46 a5 5 0 1 0 6 6 a4 4 0 1 1 -6 -6 Z', { fill: '#ffd34d', ...outline(0.8) }),
  ];
}

export function school(): Shape[] {
  const wall = '#f4efe2';
  return [
    path('M-120 0 L120 0 L128 8 L-112 8 Z', { fill: '#000', opacity: 0.16 }),
    rect(-114, -66, 228, 66, { fill: wall, ...outline() }),
    rect(-114, -10, 228, 10, { fill: '#c9573f', ...outline(1.2) }),
    path('M-124 -62 L-104 -92 L104 -92 L124 -62 Z', { fill: '#3a6fb8', ...outline() }),
    path('M-116 -72 L116 -72 M-110 -82 L110 -82', stroke(shade('#3a6fb8', 0.72), 1.3)),
    // Fronton central avec horloge et enseigne
    path('M-30 -66 L-30 -100 L0 -122 L30 -100 L30 -66 Z', { fill: wall, ...outline() }),
    path('M-36 -98 L0 -126 L36 -98', stroke('#3a6fb8', 6)),
    circle(0, -100, 9, { fill: '#ffffff', ...outline(1.4) }),
    path('M0 -100 V-106 M0 -100 H4', stroke(INK, 1.3)),
    rect(-26, -86, 52, 14, { fill: '#2f5fa8', rx: 3, ...outline(1.3) }),
    text(0, -75.5, 'ÉCOLE', { fill: '#ffffff', 'font-size': 10, 'font-weight': 800, 'text-anchor': 'middle', 'letter-spacing': 1.5, 'font-family': 'system-ui, sans-serif' }),
    // Portes vitrées
    rect(-16, -40, 32, 40, { fill: '#2f5fa8', ...outline() }),
    path('M0 -40 V0', stroke(INK, 1.3)),
    rect(-12, -36, 9, 22, { fill: '#a9dcf5' }),
    rect(3, -36, 9, 22, { fill: '#a9dcf5' }),
    ...[-92, -62, 46, 76].flatMap((x) => [rect(x, -52, 22, 26, { fill: '#a9dcf5', ...outline(1.4) }), path(`M${x + 11} -52 V-26 M${x} -39 H${x + 22}`, stroke(INK, 1.1))]),
  ];
}

export function office(): Shape[] {
  const wall = '#d7dbe6';
  const glass = '#7fbbe0';
  const windows: Shape[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 6; col++) {
      const x = -84 + col * 28 + (col >= 3 ? 8 : 0);
      const y = -112 + row * 26;
      windows.push(rect(x, y, 20, 18, { fill: glass, ...outline(1.2) }), path(`M${x + 3} ${y + 14} L${x + 12} ${y + 3}`, stroke('#ffffff', 1.4, { opacity: 0.5 })));
    }
  }
  return [
    path('M-100 0 L100 0 L108 8 L-92 8 Z', { fill: '#000', opacity: 0.16 }),
    rect(-96, -126, 192, 126, { fill: wall, ...outline() }),
    rect(50, -126, 46, 126, { fill: shade(wall, 0.9) }),
    rect(-96, -126, 192, 126, { fill: 'none', ...outline() }),
    rect(-100, -132, 200, 8, { fill: '#5a6178', ...outline(1.4) }),
    ...windows,
    rect(-40, -36, 80, 13, { fill: '#2f3445', rx: 3, ...outline(1.2) }),
    text(0, -26.5, 'BUREAU', { fill: '#ffe08a', 'font-size': 9.5, 'font-weight': 800, 'text-anchor': 'middle', 'letter-spacing': 1.5, 'font-family': 'system-ui, sans-serif' }),
    rect(-18, -20, 36, 20, { fill: '#3a4a68', ...outline() }),
    rect(-15, -17, 13, 17, { fill: glass }),
    rect(2, -17, 13, 17, { fill: glass }),
    // Auvent rayé
    path('M-28 -22 L28 -22 L32 -16 L-32 -16 Z', { fill: '#c93a3a', ...outline(1.2) }),
    path('M-18 -22 l-2 6 M-6 -22 l-1 6 M6 -22 l1 6 M18 -22 l2 6', stroke('#ffffff', 2)),
  ];
}

export function mosque(): Shape[] {
  const wall = '#f4efe2';
  return [
    path('M-56 0 L56 0 L62 6 L-50 6 Z', { fill: '#000', opacity: 0.16 }),
    // Minaret
    rect(34, -98, 14, 98, { fill: wall, ...outline() }),
    rect(31, -78, 20, 5, { fill: '#2f9a8a', ...outline(1.2) }),
    path('M34 -98 Q41 -116 48 -98 Z', { fill: '#2f9a8a', ...outline(1.2) }),
    line(41, -110, 41, -120, stroke(INK, 1.4)),
    path('M38.5 -124 a3.5 3.5 0 1 0 5 4 a2.8 2.8 0 1 1 -5 -4 Z', { fill: '#ffd34d', ...outline(0.8) }),
    // Salle et coupole
    rect(-44, -44, 76, 44, { fill: wall, ...outline() }),
    path('M-30 -44 Q-30 -82 -6 -86 Q18 -82 18 -44 Z', { fill: '#2f9a8a', ...outline() }),
    path('M-20 -60 Q-14 -74 -6 -78', stroke('#ffffff', 2, { opacity: 0.35 })),
    line(-6, -86, -6, -96, stroke(INK, 1.4)),
    path('M-8.5 -100 a3.5 3.5 0 1 0 5 4 a2.8 2.8 0 1 1 -5 -4 Z', { fill: '#ffd34d', ...outline(0.8) }),
    path('M-16 0 L-16 -20 Q-16 -30 -6 -30 Q4 -30 4 -20 L4 0 Z', { fill: '#2f6b5a', ...outline() }),
    ...[-36, 14].map((x) => path(`M${x} -14 L${x} -26 Q${x} -32 ${x + 5} -32 Q${x + 10} -32 ${x + 10} -26 L${x + 10} -14 Z`, { fill: '#a9dcf5', ...outline(1.2) })),
  ];
}

/* ------------------------------------------------------------------ Sols */

function grassGround(): Shape[] {
  const tufts: Shape[] = [];
  for (let i = 0; i < 26; i++) {
    const x = (i * 97) % SCENE_W;
    const y = 130 + ((i * 53) % 165);
    tufts.push(path(`M${x} ${y} l2 -5 l2 5 l2 -4 l1 4`, stroke('#4f9a43', 1.2)));
  }
  return [
    rect(0, SCENE_TOP, SCENE_W, SCENE_H - SCENE_TOP, { fill: '#7cc863' }),
    ellipse(60, -30, 80, 26, { fill: '#8fd673' }),
    ellipse(70, 230, 70, 34, { fill: '#8fd673' }),
    ellipse(300, 150, 60, 26, { fill: '#8fd673' }),
    ellipse(290, 268, 50, 22, { fill: '#6db955' }),
    // Allée en pierres de la porte jusqu'en bas
    path(`M163 118 L197 118 L205 ${SCENE_H} L155 ${SCENE_H} Z`, { fill: '#dcc79a', ...outline(1.2) }),
    ...[132, 150, 170, 192, 216, 242, 270].map((y, i) =>
      ellipse(i % 2 ? 188 : 172, y, 9, 5, { fill: '#c9b07a', stroke: shade('#c9b07a', 0.75), 'stroke-width': 1 }),
    ),
    // Haie et barrière à l'arrière
    rect(0, 100, 92, 18, { fill: '#3f8f3c', rx: 8, ...outline(1.4) }),
    rect(268, 100, 92, 18, { fill: '#3f8f3c', rx: 8, ...outline(1.4) }),
    ...tufts,
  ];
}

function stoneGround(): Shape[] {
  const tiles: Shape[] = [];
  for (let y = 132; y < SCENE_H; y += 24) tiles.push(line(0, y, SCENE_W, y, stroke('#b3ad9f', 1)));
  for (let x = 0; x < SCENE_W; x += 30) tiles.push(line(x, 118, x, SCENE_H, stroke('#b3ad9f', 1)));
  // Marelle peinte au sol
  const hop: Shape[] = [];
  [0, 1, 2, 3].forEach((i) => hop.push(rect(166, 268 - i * 16, 28, 16, { fill: 'none', ...stroke('#ffffff', 1.4, { opacity: 0.7 }) })));
  return [
    rect(0, SCENE_TOP, SCENE_W, SCENE_H - SCENE_TOP, { fill: '#cfc9bb' }),
    rect(0, SCENE_TOP, SCENE_W, 118 - SCENE_TOP, { fill: '#9ccf7a' }),
    ...tiles,
    rect(150, 114, 60, SCENE_H - 114, { fill: '#dcd6c8' }),
    ...hop,
    circle(250, 266, 14, { fill: 'none', ...stroke('#ffd34d', 2, { opacity: 0.6 }) }),
  ];
}

function sandGround(): Shape[] {
  const dashes: Shape[] = [];
  for (let x = 6; x < SCENE_W; x += 30) dashes.push(rect(x, 158, 16, 3, { fill: '#ffd34d' }));
  const zebra: Shape[] = [];
  for (let x = 156; x < 206; x += 10) zebra.push(rect(x, 138, 6, 44, { fill: '#f4f6ff', opacity: 0.85 }));
  return [
    rect(0, SCENE_TOP, SCENE_W, SCENE_H - SCENE_TOP, { fill: '#e8d09a' }),
    rect(0, SCENE_TOP, SCENE_W, 110 - SCENE_TOP, { fill: '#b9bfcf' }),
    // Trottoir du haut, route, trottoir du bas
    rect(0, 106, SCENE_W, 28, { fill: '#cfd3de', ...outline(1.2) }),
    rect(0, 134, SCENE_W, 52, { fill: '#4a4f5e' }),
    ...dashes,
    ...zebra,
    rect(0, 186, SCENE_W, 22, { fill: '#cfd3de', ...outline(1.2) }),
    ...[0, 40, 80, 120, 160, 200, 240, 280, 320].flatMap((x) => [line(x, 106, x, 134, stroke('#b3b8c6', 1)), line(x + 20, 186, x + 20, 208, stroke('#b3b8c6', 1))]),
    ellipse(80, 258, 60, 20, { fill: '#dcc07f' }),
    ellipse(290, 270, 50, 16, { fill: '#dcc07f' }),
  ];
}

/* ------------------------------------------------------------------ Lieux */

interface Layout {
  ground: () => Shape[];
  props: Omit<Prop, 'id'>[];
  spots: Point[];
}

const P = (x: number, y: number, shapes: Shape[], s = 1): Omit<Prop, 'id'> => ({ x, y, s, shapes });

const LAYOUTS: Record<string, Layout> = {
  maison: {
    ground: grassGround,
    props: [
      P(180, 118, house()),
      P(36, 156, tree()),
      P(326, 150, tree('#5aa64a')),
      P(24, 278, tree('#5aa64a'), 0.9),
      P(338, 284, tree(), 0.9),
      P(312, 214, well(), 0.85),
      P(52, 214, bench(), 0.9),
      P(110, 124, bush()),
      P(252, 124, bush('#4a9a40')),
      P(140, 280, flowers()),
      P(222, 284, flowers(['#c88bd8', '#ffffff', '#ffd34d'])),
    ],
    spots: [
      { x: 118, y: 146 },
      { x: 244, y: 146 },
      { x: 96, y: 266 },
      { x: 270, y: 266 },
      { x: 124, y: 206 },
      { x: 238, y: 206 },
    ],
  },
  ecole: {
    ground: stoneGround,
    props: [
      P(180, 116, school()),
      P(28, 196, tree('#5aa64a')),
      P(334, 196, tree()),
      P(28, 286, pine(), 0.9),
      P(334, 290, pine(), 0.9),
      P(320, 120, flagPole()),
      P(76, 266, bench()),
      P(300, 274, bench()),
      P(30, 118, bush()),
    ],
    spots: [
      { x: 104, y: 152 },
      { x: 256, y: 152 },
      { x: 92, y: 226 },
      { x: 268, y: 222 },
    ],
  },
  travail: {
    ground: sandGround,
    props: [
      P(180, 110, office()),
      P(22, 112, palm(), 0.9),
      P(338, 112, palm(), 0.9),
      P(60, 128, lamp()),
      P(300, 128, lamp()),
      P(64, 166, car('#c93a3a')),
      P(300, 180, car('#3a7ac9')),
      P(36, 270, palm()),
      P(326, 282, palm()),
      P(250, 290, bush('#4a9a40'), 0.8),
    ],
    spots: [
      { x: 112, y: 126 },
      { x: 250, y: 124 },
      { x: 96, y: 238 },
      { x: 266, y: 240 },
    ],
  },
};

/** Lieu sans décor dédié : un jardin simple. */
const FALLBACK: Layout = {
  ground: grassGround,
  props: [P(180, 118, mosque()), P(40, 160, tree()), P(320, 160, tree())],
  spots: [
    { x: 110, y: 160 },
    { x: 250, y: 160 },
    { x: 90, y: 240 },
    { x: 270, y: 240 },
  ],
};

const GROUND_BY_TERRAIN: Record<Terrain, () => Shape[]> = { grass: grassGround, stone: stoneGround, sand: sandGround };

/** Points de repli quand un lieu a plus de rencontres que de places prévues. */
function extraSpot(i: number): Point {
  const col = i % 5;
  const row = Math.floor(i / 5) % 3;
  return { x: 60 + col * 60, y: 150 + row * 45 };
}

/** Décor complet d'un lieu, avec une place par rencontre. */
export function buildScene(placeId: string, encounters: number, terrain?: Terrain): Scene {
  const layout = LAYOUTS[placeId] ?? FALLBACK;
  const ground = !LAYOUTS[placeId] && terrain ? GROUND_BY_TERRAIN[terrain]() : layout.ground();
  const spots = Array.from({ length: encounters }, (_, i) => layout.spots[i] ?? extraSpot(i));
  return {
    ground,
    props: layout.props.map((p, i) => ({ ...p, id: `${placeId}-${i}` })),
    start: { x: 180, y: 284 },
    spots,
  };
}

/** Bâtiment qui représente un lieu sur la carte du parcours. */
export function placeIcon(placeId: string): Shape[] {
  if (placeId === 'maison') return house();
  if (placeId === 'ecole') return school();
  if (placeId === 'travail') return office();
  return mosque();
}

/**
 * Chemin de marche : on rejoint d'abord la hauteur de la personne, puis on s'arrête à côté d'elle,
 * du côté d'où l'on vient.
 */
export function approachPath(from: Point, to: Point, gap = 22): Point[] {
  const side = from.x <= to.x ? -1 : 1;
  const stop = { x: to.x + side * gap, y: to.y + 2 };
  const corner = { x: from.x, y: stop.y };
  const points = [from];
  if (Math.abs(corner.y - from.y) > 0.5) points.push(corner);
  if (Math.abs(stop.x - corner.x) > 0.5) points.push(stop);
  return points;
}
