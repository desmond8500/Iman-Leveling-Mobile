import { NAFILA_PRAYERS, QADR_DUA } from '../../src/data/nafilaPrayers';

describe('prières surérogatoires du Ramadan', () => {
  it('identifiants uniques et champs renseignés', () => {
    expect(new Set(NAFILA_PRAYERS.map((p) => p.id)).size).toBe(NAFILA_PRAYERS.length);
    for (const p of NAFILA_PRAYERS) {
      expect(p.title.length).toBeGreaterThan(2);
      expect(p.rakaat.length).toBeGreaterThan(0);
      expect(p.when.length).toBeGreaterThan(2);
      expect(p.description.length).toBeGreaterThan(5);
    }
  });
  it('inclut Tarawih, Witr et Tahajjud', () => {
    const ids = NAFILA_PRAYERS.map((p) => p.id);
    expect(ids).toEqual(expect.arrayContaining(['taraweeh', 'witr', 'tahajjud', 'duha']));
  });
  it('invocation de la nuit du Destin complète', () => {
    expect(QADR_DUA.arabic).toMatch(/[؀-ۿ]/);
    expect(QADR_DUA.phonetic).toContain("'afuwwun");
    expect(QADR_DUA.source.length).toBeGreaterThan(0);
  });
});
