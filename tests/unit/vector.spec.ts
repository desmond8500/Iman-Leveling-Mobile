import { AVATAR_LOOKS, NPC_LOOKS } from '../../src/data/sprites';
import { RPG_PLACES } from '../../src/data/rpg';
import { shade, tint } from '../../src/utils/vector';
import { flatShapes, spriteParts } from '../../src/utils/vectorSprite';
import { approachPath, buildScene, placeIcon, SCENE_H, SCENE_TOP, SCENE_W } from '../../src/utils/vectorScene';

const looks = { ...NPC_LOOKS, ...AVATAR_LOOKS };

describe('vector art : couleurs', () => {
  test('shade assombrit, tint éclaircit', () => {
    expect(shade('#808080', 0.5)).toBe('#404040');
    expect(shade('#ffffff', 2)).toBe('#ffffff');
    expect(tint('#000000', 1)).toBe('#ffffff');
    expect(tint('#204060', 0)).toBe('#204060');
  });
  test('une couleur invalide est rendue telle quelle', () => {
    expect(shade('red', 0.5)).toBe('red');
  });
});

describe('vector art : personnages', () => {
  for (const [name, look] of Object.entries(looks)) {
    test(`${name} : formes valides, sans valeur manquante`, () => {
      const parts = spriteParts(look);
      expect(parts.legL.length).toBeGreaterThan(0);
      expect(parts.legR.length).toBeGreaterThan(0);
      expect(parts.eyes.length).toBe(4);
      for (const s of flatShapes(parts)) {
        for (const v of Object.values(s.attrs)) {
          expect(String(v)).not.toMatch(/undefined|NaN/);
        }
      }
    });
  }

  test('lunettes seulement si demandées, pas de jambes visibles sous une robe', () => {
    expect(spriteParts({ ...AVATAR_LOOKS.marcheur, glasses: false }).top).toHaveLength(0);
    expect(spriteParts({ ...AVATAR_LOOKS.marcheur, glasses: true }).top.length).toBeGreaterThan(0);
    expect(spriteParts({ ...AVATAR_LOOKS.marcheur, robe: true }).legL).toHaveLength(1);
  });
});

describe('vector art : décors', () => {
  for (const place of RPG_PLACES) {
    test(`${place.id} : une place par rencontre, dans le décor et bien espacées`, () => {
      const scene = buildScene(place.id, place.encounters.length, place.terrain);
      expect(scene.spots).toHaveLength(place.encounters.length);
      for (const s of scene.spots) {
        expect(s.x).toBeGreaterThan(20);
        expect(s.x).toBeLessThan(SCENE_W - 20);
        expect(s.y).toBeGreaterThan(SCENE_TOP + 60);
        expect(s.y).toBeLessThan(SCENE_H);
        // Assez loin du point de départ du joueur.
        expect(Math.hypot(s.x - scene.start.x, s.y - scene.start.y)).toBeGreaterThan(40);
      }
      for (let i = 0; i < scene.spots.length; i++) {
        for (let j = i + 1; j < scene.spots.length; j++) {
          const a = scene.spots[i];
          const b = scene.spots[j];
          expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(50);
        }
      }
      expect(placeIcon(place.id).length).toBeGreaterThan(0);
    });
  }

  test('un lieu inconnu a quand même un décor et assez de places', () => {
    const scene = buildScene('inconnu', 9, 'sand');
    expect(scene.spots).toHaveLength(9);
    expect(scene.props.length).toBeGreaterThan(0);
  });

  test('le chemin rejoint la hauteur de la personne puis s’arrête à côté', () => {
    const path = approachPath({ x: 180, y: 284 }, { x: 100, y: 150 });
    expect(path[0]).toEqual({ x: 180, y: 284 });
    expect(path[1]).toEqual({ x: 180, y: 152 });
    expect(path[2]).toEqual({ x: 122, y: 152 });
    // Déjà à la bonne hauteur : un seul segment.
    expect(approachPath({ x: 40, y: 152 }, { x: 100, y: 150 })).toHaveLength(2);
  });
});
