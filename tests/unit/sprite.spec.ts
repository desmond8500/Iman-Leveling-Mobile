import { AVATARS } from '../../src/utils/avatar';
import { AVATAR_LOOKS, FALLBACK_LOOK, NPC_LOOKS, avatarLook, npcLook } from '../../src/data/sprites';
import { RPG_PLACES } from '../../src/data/rpg';
import { SPRITE_H, SPRITE_W, spriteFrames, spritePaths, spritePalette, toPaths, type Look, type SpriteAnim } from '../../src/utils/sprite';

const ANIMS: SpriteAnim[] = ['idle', 'walk'];
const HEADS = ['hair', 'hijab', 'turban', 'kufi'] as const;
const looks: Record<string, Look> = { ...NPC_LOOKS, ...Object.fromEntries(Object.entries(AVATAR_LOOKS).map(([k, v]) => [`avatar:${k}`, v])) };

describe('sprites : grilles', () => {
  for (const [name, look] of Object.entries(looks)) {
    test(`${name} : toutes les images font ${SPRITE_W} × ${SPRITE_H} et n'utilisent que des couleurs connues`, () => {
      const known = new Set(['.', ...Object.keys(spritePalette(look))]);
      for (const anim of ANIMS) {
        for (const rows of spriteFrames(look, anim)) {
          expect(rows.length).toBe(SPRITE_H);
          for (const row of rows) {
            expect(row.length).toBe(SPRITE_W);
            for (const ch of row) expect(known.has(ch)).toBe(true);
          }
        }
      }
    });
  }

  test('les quatre styles de tête avec toutes les options restent valides', () => {
    for (const head of HEADS) {
      for (const opt of [{}, { beard: true }, { glasses: true }, { robe: true }, { tie: '#fff' }, { beard: true, glasses: true, robe: true, tie: '#fff' }]) {
        const look: Look = { skin: '#fa0', hair: '#111', top: '#22a', pants: '#333', shoes: '#444', head, ...opt };
        for (const anim of ANIMS) for (const rows of spriteFrames(look, anim)) {
          expect(rows.length).toBe(SPRITE_H);
          expect(rows.every((r) => r.length === SPRITE_W)).toBe(true);
        }
      }
    }
  });

  test('animations : 2 images au repos, 4 en marchant, et la marche change réellement', () => {
    const look = avatarLook('marcheur');
    expect(spriteFrames(look, 'idle').length).toBe(2);
    const walk = spriteFrames(look, 'walk');
    expect(walk.length).toBe(4);
    expect(walk[0].join('')).not.toBe(walk[2].join(''));
    expect(walk[0].join('')).not.toBe(walk[1].join(''));
  });
});

describe('sprites : tracés', () => {
  test('le nombre de pixels dessinés correspond à la grille', () => {
    const look = avatarLook('sage');
    const rows = spriteFrames(look, 'idle')[0];
    const expected = rows.join('').replace(/\./g, '').length;
    const paths = toPaths(rows, spritePalette(look));
    const drawn = paths.reduce((n, p) => n + [...p.d.matchAll(/h(\d+)v1/g)].reduce((m, x) => m + Number(x[1]), 0), 0);
    expect(drawn).toBe(expected);
  });
  test('spritePaths est mis en cache', () => {
    const look = avatarLook('soeur');
    expect(spritePaths(look, 'walk')).toBe(spritePaths(look, 'walk'));
  });
});

describe('sprites : données', () => {
  test('chaque rencontre du parcours a son personnage', () => {
    for (const place of RPG_PLACES) for (const e of place.encounters) expect(NPC_LOOKS[e.id]).toBeDefined();
  });
  test('chaque avatar jouable a son apparence, et les inconnus retombent sur un défaut', () => {
    for (const a of AVATARS) expect(AVATAR_LOOKS[a.id]).toBeDefined();
    expect(npcLook('inconnu')).toBe(FALLBACK_LOOK);
    expect(avatarLook('inconnu')).toBe(AVATAR_LOOKS.marcheur);
  });
});
