import {
  ADHKAR_HASANAT,
  ALL_PRAYERS_BONUS,
  SUNNAH_HASANAT,
  hasanatForDay,
  hasanatToNextLevel,
  levelFromHasanat,
  prayerReward,
} from '../../src/utils/hasanat';

describe('prayerReward', () => {
  it('homme : 27 à la mosquée, 1 à la maison', () => {
    expect(prayerReward('male', true)).toBe(27);
    expect(prayerReward('male', false)).toBe(1);
  });

  it('femme : 27, quel que soit le lieu', () => {
    expect(prayerReward('female', false)).toBe(27);
    expect(prayerReward('female', true)).toBe(27);
  });

  it('genre non renseigné : 27', () => {
    expect(prayerReward(null, false)).toBe(27);
  });
});

describe('hasanatForDay', () => {
  const base = { prayerHasanat: 0, done: 0, total: 5, sunnah: 0, adhkar: 0 };

  it('vaut 0 sans rien de fait', () => {
    expect(hasanatForDay(base)).toBe(0);
  });

  it('additionne les Hasanat des prières', () => {
    expect(hasanatForDay({ ...base, prayerHasanat: 54, done: 2 })).toBe(54);
  });

  it(`ajoute ${ALL_PRAYERS_BONUS} de bonus quand les 5 prières sont faites`, () => {
    expect(hasanatForDay({ ...base, prayerHasanat: 135, done: 5 })).toBe(185);
    expect(hasanatForDay({ ...base, prayerHasanat: 5, done: 5 })).toBe(55);
  });

  it('pas de bonus si une prière manque', () => {
    expect(hasanatForDay({ ...base, prayerHasanat: 108, done: 4 })).toBe(108);
  });

  it(`compte ${SUNNAH_HASANAT} par sunna et ${ADHKAR_HASANAT} par invocation`, () => {
    expect(hasanatForDay({ ...base, sunnah: 2 })).toBe(54);
    expect(hasanatForDay({ ...base, adhkar: 3 })).toBe(15);
    expect(hasanatForDay({ prayerHasanat: 27, done: 1, total: 5, sunnah: 1, adhkar: 1 })).toBe(59);
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
