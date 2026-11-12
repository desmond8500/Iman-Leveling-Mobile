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

describe('Amana Rassoul', () => {
  it('est présente, avec arabe, phonétique, français et source 2:285-286', () => {
    const dua = CITADELLE.flatMap((c) => c.duas).find((d) => d.id === 'amana-rassoul')!;
    expect(dua).toBeDefined();
    expect(dua.source).toContain('2:285-286');
    expect(dua.arabic.startsWith('آمَنَ الرَّسُولُ')).toBe(true);
    expect(dua.arabic).toContain('الْكَافِرِينَ');
    expect(dua.count).toBe(1);
  });
});

import { foldForSearch, searchCitadelle } from '../../src/data/citadelle';

describe('recherche dans la Citadelle', () => {
  const ids = (q: string) => searchCitadelle(q).flatMap((c) => c.duas.map((d) => d.id));

  it('sans recherche, tout est renvoyé', () => {
    expect(searchCitadelle('')).toHaveLength(CITADELLE.length);
    expect(searchCitadelle('   ')).toHaveLength(CITADELLE.length);
  });
  it('cherche dans le titre, le français et la phonétique, sans accents ni casse', () => {
    expect(ids('TOILETTES')).toContain('toilettes-entrer');
    expect(ids('eternuement')).toEqual(['eternuement']);
    expect(ids('ghufranaka')).toContain('toilettes-sortir');
    expect(ids('pluie bénéfique')).toEqual(['pluie']);
  });
  it('cherche en arabe, avec ou sans voyelles', () => {
    expect(ids('غفرانك')).toContain('toilettes-sortir');
    expect(ids('حسبنا الله')).toContain('difficulte');
    expect(ids('بِسْمِ اللَّهِ')).toContain('avant-repas');
  });
  it('tous les mots doivent correspondre', () => {
    expect(ids('pluie toilettes')).toEqual([]);
    expect(ids('zzzz')).toEqual([]);
  });
  it('retire les catégories vides', () => {
    const result = searchCitadelle('repas');
    expect(result.every((c) => c.duas.length > 0)).toBe(true);
    expect(result.map((c) => c.id)).toContain('repas');
  });
  it('foldForSearch', () => {
    expect(foldForSearch("Ghufrâna-ka  ")).toBe('ghufrana ka');
    expect(foldForSearch('أَعُوذُ')).toBe('اعوذ');
  });
});
