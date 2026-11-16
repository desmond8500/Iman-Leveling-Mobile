/*
 * Personnages en « vector art » (style chibi : grosse tête, contour sombre, ombres franches).
 * Même description `Look` que l'ancien pixel art, donc les apparences existantes restent valables.
 * Le dessin est découpé en groupes animés séparément (jambes, bras, yeux) par le composant.
 */
import type { Look } from '@/utils/sprite';
import { circle, ellipse, INK, outline, path, shade, stroke, tint, type Shape } from '@/utils/vector';

/** Repère du dessin : même proportion que l'ancien sprite (16 × 25). */
export const VS_W = 64;
export const VS_H = 100;
/** Cadrage « buste » pour les portraits (HUD, dialogues). */
export const PORTRAIT_BOX = { x: 4, y: 3, size: 56 } as const;

/** Points d'attache des membres (pour les rotations pendant la marche). */
export const PIVOTS = {
  legL: { x: 26, y: 72 },
  legR: { x: 38, y: 72 },
  armL: { x: 16, y: 50 },
  armR: { x: 48, y: 50 },
  eyes: { x: 32, y: 33 },
} as const;

export interface SpriteParts {
  legL: Shape[];
  legR: Shape[];
  /** Torse, hanches ou robe. */
  body: Shape[];
  armL: Shape[];
  armR: Shape[];
  /** Tête sans les yeux (visage, cheveux, voile, barbe…). */
  head: Shape[];
  /** Yeux : clignent. */
  eyes: Shape[];
  /** Par-dessus les yeux (lunettes). */
  top: Shape[];
}

const EYE = '#22192b';
const MOUTH = '#8a3b33';
const BLUSH = '#ff7a7a';

function legs(look: Look): Pick<SpriteParts, 'legL' | 'legR'> {
  const shoe = { fill: look.shoes, ...outline(1.4) };
  if (look.robe) {
    // Sous une longue tenue, seules les chaussures dépassent.
    return {
      legL: [ellipse(25, 94.5, 5.6, 3, shoe)],
      legR: [ellipse(39, 94.5, 5.6, 3, shoe)],
    };
  }
  const pants = { fill: look.pants, ...outline() };
  return {
    legL: [path('M22 70 h8 v19 q0 3 -4 3 q-4 0 -4 -3 z', pants), ellipse(25, 93, 6, 3.6, shoe), path('M21.5 92 q3 -2 7 -1', stroke(tint(look.shoes, 0.45), 1))],
    legR: [path('M34 70 h8 v19 q0 3 -4 3 q-4 0 -4 -3 z', pants), ellipse(39, 93, 6, 3.6, shoe), path('M35.5 92 q3 -2 7 -1', stroke(tint(look.shoes, 0.45), 1))],
  };
}

function body(look: Look): Shape[] {
  const top = look.top;
  const dark = shade(top, 0.78);
  const shapes: Shape[] = [];
  if (look.robe) {
    const robe = 'M18.5 54 Q19 46 27 45.5 L37 45.5 Q45 46 45.5 54 L49 92 Q32 96 15 92 Z';
    shapes.push(
      path(robe, { fill: top }),
      path('M38 46 Q45 46.5 45.5 54 L49 92 Q44 93.6 38.5 94.3 Z', { fill: dark }),
      path('M32 52 L32 93', stroke(dark, 1)),
      path(robe, { fill: 'none', ...outline() }),
    );
  } else {
    const torso = 'M19 54 Q19 46 27 45.5 L37 45.5 Q45 46 45 54 L46 73 Q32 76 18 73 Z';
    shapes.push(
      path('M19 69 L45 69 L46 76 Q32 78.5 18 76 Z', { fill: look.pants, ...outline() }),
      path(torso, { fill: top }),
      path('M38 46 Q45 46.5 45 54 L46 73 Q42 74.3 38 74.6 Z', { fill: dark }),
      path('M19.5 66 Q32 69 44.5 66', stroke(dark, 1.2)),
      path(torso, { fill: 'none', ...outline() }),
    );
  }
  // Col en V : on voit le cou.
  shapes.push(path('M27.5 45.6 L32 51 L36.5 45.6 Z', { fill: look.skin, ...outline(1.2) }));
  if (look.tie) {
    shapes.push(
      path('M27.5 45.6 L31.4 50.6 L29 52.4 Z', { fill: '#ffffff', ...outline(1) }),
      path('M36.5 45.6 L32.6 50.6 L35 52.4 Z', { fill: '#ffffff', ...outline(1) }),
      path('M30.8 50.4 L33.2 50.4 L34.4 61 L32 64 L29.6 61 Z', { fill: look.tie, ...outline(1) }),
    );
  }
  return shapes;
}

function arms(look: Look): Pick<SpriteParts, 'armL' | 'armR'> {
  const sleeve = { fill: look.top, ...outline() };
  const hand = { fill: look.skin, ...outline(1.4) };
  return {
    armL: [path('M15 48 Q12 48 11.5 52 L10.5 64 Q10.5 67 14 67.5 Q17.5 68 18 64.5 L19.5 52 Q19.5 48 15 48 Z', sleeve), circle(14, 68, 3.4, hand)],
    armR: [
      path('M49 48 Q52 48 52.5 52 L53.5 64 Q53.5 67 50 67.5 Q46.5 68 46 64.5 L44.5 52 Q44.5 48 49 48 Z', { fill: shade(look.top, 0.85), ...outline() }),
      circle(50, 68, 3.4, hand),
    ],
  };
}

function head(look: Look): Shape[] {
  const skin = look.skin;
  const hair = look.hair;
  const accent = look.accent ?? '#e8e2d0';
  const accentDark = shade(accent, 0.74);
  const brow = shade(hair, 0.7);
  const shapes: Shape[] = [];
  const hijab = look.head === 'hijab';

  if (hijab) {
    // Le voile encadre le visage et retombe sur les épaules.
    shapes.push(
      path('M32 9 Q54 9 54.5 32 Q55 46 51 52 Q56 60 52 64 Q32 70 12 64 Q8 60 13 52 Q9 46 9.5 32 Q10 9 32 9 Z', { fill: accent, ...outline() }),
      path('M38 10.5 Q53 13 53.5 32 Q54 46 50 52 Q55 60 51.5 63.5 Q46 65.5 40 66.5 Q47 56 45 46 Z', { fill: accentDark, opacity: 0.55 }),
      path('M18 52 Q32 60 46 52', stroke(accentDark, 1.2)),
      ellipse(32, 32, 14.5, 14.5, { fill: skin }),
      ellipse(32, 32, 14.5, 14.5, { fill: 'none', stroke: accentDark, 'stroke-width': 2.2 }),
    );
  } else {
    shapes.push(
      circle(14.5, 32, 3.6, { fill: skin, ...outline(1.4) }),
      circle(49.5, 32, 3.6, { fill: skin, ...outline(1.4) }),
      ellipse(32, 30, 17.5, 16.5, { fill: skin, ...outline() }),
      // Ombre douce du côté droit du visage.
      path('M40 15.5 Q49.5 20 49.5 30 Q49.5 42 40 46 Q46 38 46 30 Q46 21 40 15.5 Z', { fill: shade(skin, 0.88) }),
    );
  }

  if (look.beard && !hijab) {
    shapes.push(
      path('M14.5 31 Q14 49 32 49.5 Q50 49 49.5 31 Q47.5 39.5 43 40.5 Q38.5 44.8 32 44.8 Q25.5 44.8 21 40.5 Q16.5 39.5 14.5 31 Z', { fill: hair, ...outline(1.4) }),
      path('M27.5 39.2 Q32 37 36.5 39.2 Q32 40.4 27.5 39.2 Z', { fill: hair }),
    );
  }

  // Traits du visage.
  shapes.push(
    ellipse(21.5, 38.2, 2.6, 1.4, { fill: BLUSH, opacity: 0.35 }),
    ellipse(42.5, 38.2, 2.6, 1.4, { fill: BLUSH, opacity: 0.35 }),
    path('M32 35.6 Q33.1 36.7 32 37.6', stroke(shade(skin, 0.7), 1)),
    path('M29.5 40.2 Q32 42.4 34.5 40.2', stroke(MOUTH, 1.3)),
    path('M22.5 27.3 Q25.5 26 28.5 27.3', stroke(hijab ? shade(skin, 0.45) : brow, 1.3)),
    path('M35.5 27.3 Q38.5 26 41.5 27.3', stroke(hijab ? shade(skin, 0.45) : brow, 1.3)),
  );

  const shortHair = path(
    'M14 31 Q12 12 32 11.5 Q52 12 50 31 Q49 24 45 21.5 Q42 26 35 24.5 Q30 27 24 23.5 Q19 24.5 17 22.5 Q15 26 14 31 Z',
    { fill: hair, ...outline() },
  );
  const shine = path('M22 15.5 Q28 13 34 13.5', stroke('#ffffff', 1.6, { opacity: 0.28 }));

  if (look.head === 'hair') shapes.push(shortHair, shine);
  if (look.head === 'kufi') {
    shapes.push(
      shortHair,
      path('M17.5 21 Q17.5 9.5 32 9.5 Q46.5 9.5 46.5 21 Q32 17.5 17.5 21 Z', { fill: accent, ...outline() }),
      path('M19.5 17.6 Q32 14.2 44.5 17.6', stroke(accentDark, 1, { 'stroke-dasharray': '1.6 1.6' })),
      path('M22 13.5 Q32 10.5 42 13.5', stroke(accentDark, 1, { 'stroke-dasharray': '1.6 1.6' })),
    );
  }
  if (look.head === 'turban') {
    shapes.push(
      path('M13.5 27 Q12 7 32 7 Q52 7 50.5 27 Q32 20 13.5 27 Z', { fill: accent, ...outline() }),
      path('M15.5 21 Q32 13 48.5 21', stroke(accentDark, 1.1)),
      path('M19 13.5 Q32 8.5 45 13.5', stroke(accentDark, 1.1)),
      ellipse(32, 19.6, 3, 2.4, { fill: accentDark, ...outline(1) }),
    );
  }
  if (hijab) shapes.push(path('M24 12.5 Q32 10.5 40 12.5', stroke('#ffffff', 1.6, { opacity: 0.3 })));
  return shapes;
}

function eyes(): Shape[] {
  return [
    ellipse(25.5, 33, 2.5, 3.3, { fill: EYE }),
    ellipse(38.5, 33, 2.5, 3.3, { fill: EYE }),
    circle(26.3, 31.7, 0.95, { fill: '#ffffff' }),
    circle(39.3, 31.7, 0.95, { fill: '#ffffff' }),
  ];
}

function glasses(look: Look): Shape[] {
  if (!look.glasses) return [];
  const frame = { fill: '#ffffff', 'fill-opacity': 0.18, stroke: '#232634', 'stroke-width': 1.4 };
  return [circle(25.5, 33, 4.6, frame), circle(38.5, 33, 4.6, frame), path('M30.1 33 Q32 31.8 33.9 33', stroke('#232634', 1.3))];
}

const cache = new Map<string, SpriteParts>();

/** Toutes les formes d'un personnage, regroupées pour l'animation (mises en cache). */
export function spriteParts(look: Look): SpriteParts {
  const key = JSON.stringify(look);
  let hit = cache.get(key);
  if (!hit) {
    hit = { ...legs(look), body: body(look), ...arms(look), head: head(look), eyes: eyes(), top: glasses(look) };
    cache.set(key, hit);
  }
  return hit;
}

/** Toutes les formes, dans l'ordre de dessin (utile pour un rendu statique ou les tests). */
export function flatShapes(parts: SpriteParts): Shape[] {
  return [...parts.legL, ...parts.legR, ...parts.body, ...parts.armL, ...parts.armR, ...parts.head, ...parts.eyes, ...parts.top];
}

export { INK };
