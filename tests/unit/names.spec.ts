import { NAMES, NAMES_VERSE, nameByNumber, searchNames } from '../../src/data/names';

describe('noms d\'Allah', () => {
  it('en compte 99, numérotés de 1 à 99', () => {
    expect(NAMES).toHaveLength(99);
    expect(NAMES.map((n) => n.n)).toEqual(Array.from({ length: 99 }, (_, i) => i + 1));
  });

  it('a pour chaque nom de l\'arabe, une transcription latine, un sens et une explication', () => {
    const arabic = /[؀-ۿ]/;
    for (const name of NAMES) {
      expect(arabic.test(name.arabic)).toBe(true);
      expect(arabic.test(name.translit)).toBe(false);
      expect(name.translit.trim()).not.toBe('');
      expect(name.french.trim()).not.toBe('');
      expect(name.explanation.trim().length).toBeGreaterThan(15);
    }
  });

  it('commence par Ar-Rahman, Ar-Rahim et finit par As-Sabur', () => {
    expect(nameByNumber(1)?.translit).toBe('Ar-Rahman');
    expect(nameByNumber(2)?.translit).toBe('Ar-Rahim');
    expect(nameByNumber(99)?.translit).toBe('As-Sabur');
    expect(nameByNumber(100)).toBeUndefined();
  });

  it('place les noms connus au bon numéro', () => {
    expect(nameByNumber(62)?.translit).toBe('Al-Hayy');
    expect(nameByNumber(63)?.translit).toBe('Al-Qayyum');
    expect(nameByNumber(67)?.translit).toBe('Al-Ahad');
    expect(nameByNumber(68)?.translit).toBe('As-Samad');
    expect(nameByNumber(93)?.translit).toBe('An-Nur');
  });

  it('n\'a pas de doublon de transcription, sauf Al-Majid (n° 48 et 65)', () => {
    const seen = new Map<string, number[]>();
    for (const n of NAMES) seen.set(n.translit, [...(seen.get(n.translit) ?? []), n.n]);
    const duplicates = [...seen].filter(([, ns]) => ns.length > 1);
    expect(duplicates).toEqual([['Al-Majid', [48, 65]]]);
  });

  it('a des noms associés réciproques et valides', () => {
    for (const name of NAMES) {
      if (!name.pair) continue;
      const other = nameByNumber(name.pair);
      expect(other).toBeDefined();
      expect(other!.pair).toBe(name.n);
    }
    expect(nameByNumber(20)?.pair).toBe(21);
    expect(nameByNumber(91)?.pair).toBe(92);
  });

  it('contient le verset 7:180', () => {
    expect(NAMES_VERSE.reference).toBe('Coran 7:180');
    expect(NAMES_VERSE.arabic).toContain('الْأَسْمَاءُ الْحُسْنَىٰ');
  });
});

describe('searchNames', () => {
  it('renvoie tout sans recherche', () => {
    expect(searchNames('')).toHaveLength(99);
    expect(searchNames('   ')).toHaveLength(99);
  });

  it('cherche par transcription, sans tenir compte de la casse, des tirets ni des apostrophes', () => {
    expect(searchNames('rahman').map((n) => n.n)).toContain(1);
    expect(searchNames('AR RAHIM').map((n) => n.n)).toEqual([]); // l'espace compte
    expect(searchNames("al-'alim").map((n) => n.n)).toContain(19);
    expect(searchNames('alalim').map((n) => n.n)).toContain(19);
  });

  it('cherche par sens en français, sans accents', () => {
    expect(searchNames('createur').map((n) => n.n)).toContain(11);
    expect(searchNames('Omniscient').map((n) => n.n)).toEqual([19]);
  });

  it('cherche par numéro et par arabe', () => {
    expect(searchNames('99').map((n) => n.n)).toEqual([99]);
    expect(searchNames('الصَّبُورُ').map((n) => n.n)).toEqual([99]);
  });

  it('renvoie une liste vide quand rien ne correspond', () => {
    expect(searchNames('zzzz')).toEqual([]);
  });
});
