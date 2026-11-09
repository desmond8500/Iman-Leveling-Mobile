import { levelFromXp, xpForDay, xpToNextLevel } from '../../src/utils/xp';

describe('xpForDay', () => {
  it('donne 20 XP par prière', () => {
    expect(xpForDay(0, 5)).toBe(0);
    expect(xpForDay(3, 5)).toBe(60);
  });

  it('ajoute 50 XP de bonus quand les 5 prières sont faites', () => {
    expect(xpForDay(5, 5)).toBe(150);
  });
});

describe('levelFromXp', () => {
  it('démarre au niveau 1 avec 100 XP à gagner', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForNext: 100 });
  });

  it('passe au niveau 2 à 100 XP', () => {
    expect(levelFromXp(100)).toEqual({ level: 2, xpIntoLevel: 0, xpForNext: 150 });
    expect(levelFromXp(99).level).toBe(1);
  });

  it('cumule les seuils (100 puis 150 puis 200)', () => {
    expect(levelFromXp(250).level).toBe(3);
    expect(levelFromXp(449).level).toBe(3);
    expect(levelFromXp(450).level).toBe(4);
    expect(xpToNextLevel(3)).toBe(200);
  });

  it('ignore les valeurs négatives', () => {
    expect(levelFromXp(-20).level).toBe(1);
  });
});
