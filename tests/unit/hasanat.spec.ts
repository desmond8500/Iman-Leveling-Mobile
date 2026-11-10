import {
  hasanatForDay,
  hasanatToNextLevel,
  levelFromHasanat,
  sunnahReward,
} from '../../src/utils/hasanat';

describe('hasanatForDay', () => {
  it('donne 20 Hasanat par prière', () => {
    expect(hasanatForDay(0, 5)).toBe(0);
    expect(hasanatForDay(3, 5)).toBe(60);
  });

  it('ajoute 50 Hasanat de bonus quand les 5 prières sont faites', () => {
    expect(hasanatForDay(5, 5)).toBe(150);
  });

  it('ajoute les Hasanat des sunnas', () => {
    expect(hasanatForDay(1, 5, 15)).toBe(35);
    expect(hasanatForDay(5, 5, 60)).toBe(210);
  });

  it('ajoute 5 Hasanat par invocation', () => {
    expect(hasanatForDay(0, 5, 0, 3)).toBe(15);
    expect(hasanatForDay(5, 5, 10, 2)).toBe(170);
  });
});

describe('sunnahReward', () => {
  it('10 pour une sunna confirmée, 5 sinon', () => {
    expect(sunnahReward(true)).toBe(10);
    expect(sunnahReward(false)).toBe(5);
  });
});

describe('levelFromHasanat', () => {
  it('démarre au niveau 1 avec 100 Hasanat à gagner', () => {
    expect(levelFromHasanat(0)).toEqual({ level: 1, hasanatIntoLevel: 0, hasanatForNext: 100 });
  });

  it('passe au niveau 2 à 100 Hasanat', () => {
    expect(levelFromHasanat(100)).toEqual({ level: 2, hasanatIntoLevel: 0, hasanatForNext: 150 });
    expect(levelFromHasanat(99).level).toBe(1);
  });

  it('cumule les seuils (100 puis 150 puis 200)', () => {
    expect(levelFromHasanat(250).level).toBe(3);
    expect(levelFromHasanat(449).level).toBe(3);
    expect(levelFromHasanat(450).level).toBe(4);
    expect(hasanatToNextLevel(3)).toBe(200);
  });

  it('ignore les valeurs négatives', () => {
    expect(levelFromHasanat(-20).level).toBe(1);
  });
});
