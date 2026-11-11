import { CITADELLE, CITADELLE_COUNT } from '../../src/data/citadelle';

describe('Citadelle du musulman (sélection)', () => {
  const all = CITADELLE.flatMap((c) => c.duas);
  it('identifiants uniques', () => {
    expect(new Set(all.map((d) => d.id)).size).toBe(all.length);
    expect(new Set(CITADELLE.map((c) => c.id)).size).toBe(CITADELLE.length);
    expect(CITADELLE_COUNT).toBe(all.length);
  });
  it('chaque invocation a arabe, phonétique, français et source', () => {
    for (const d of all) {
      expect(d.arabic).toMatch(/[؀-ۿ]/);
      expect(d.phonetic.length).toBeGreaterThan(3);
      expect(d.french.length).toBeGreaterThan(3);
      expect(d.source.length).toBeGreaterThan(0);
    }
  });
  it('aucune catégorie vide', () => {
    for (const c of CITADELLE) expect(c.duas.length).toBeGreaterThan(0);
  });
});
