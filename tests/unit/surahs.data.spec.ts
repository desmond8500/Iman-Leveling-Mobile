import { SURAHS, TOTAL_VERSES, searchSurahs, surahByNumber } from '../../src/data/surahs';

describe('sourates', () => {
  it('114 sourates numérotées de 1 à 114', () => {
    expect(SURAHS).toHaveLength(114);
    SURAHS.forEach((s, i) => expect(s.number).toBe(i + 1));
  });
  it('6236 versets au total (contrôle des nombres de versets)', () => {
    expect(TOTAL_VERSES).toBe(6236);
  });
  it('valeurs de référence', () => {
    expect(surahByNumber(2)).toMatchObject({ name: 'Al-Baqara', verses: 286 });
    expect(surahByNumber(18)).toMatchObject({ name: 'Al-Kahf', verses: 110 });
    expect(surahByNumber(114)).toMatchObject({ name: 'An-Nas', verses: 6 });
    expect(surahByNumber(115)).toBeUndefined();
  });
  it('recherche par nom, par numéro et en arabe', () => {
    expect(searchSurahs('kahf')[0].number).toBe(18);
    expect(searchSurahs("al-ikhlas")[0].number).toBe(112);
    expect(searchSurahs('36')[0].number).toBe(36);
    expect(searchSurahs('الكهف')[0].number).toBe(18);
    expect(searchSurahs('')).toHaveLength(114);
    expect(searchSurahs('zzzz')).toHaveLength(0);
  });
  it('noms et textes renseignés', () => {
    for (const s of SURAHS) {
      expect(s.name.length).toBeGreaterThan(1);
      expect(s.arabic).toMatch(/[؀-ۿ]/);
    }
  });
});
