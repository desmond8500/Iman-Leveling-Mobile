import {
  COUNTRY_CODES,
  countryName,
  countryOptions,
  isCountryCode,
  normalizeText,
} from '../../src/data/countries';

describe('pays', () => {
  it('a des codes ISO uniques sur deux lettres', () => {
    expect(new Set(COUNTRY_CODES).size).toBe(COUNTRY_CODES.length);
    expect(COUNTRY_CODES.every((c) => /^[A-Z]{2}$/.test(c))).toBe(true);
    expect(COUNTRY_CODES.length).toBeGreaterThan(220);
  });

  it('reconnaît les codes valides uniquement', () => {
    expect(isCountryCode('FR')).toBe(true);
    expect(isCountryCode('SN')).toBe(true);
    expect(isCountryCode('fr')).toBe(false);
    expect(isCountryCode('XX')).toBe(false);
    expect(isCountryCode(null)).toBe(false);
  });

  it('donne les noms en français', () => {
    expect(countryName('FR')).toBe('France');
    expect(countryName('SN')).toBe('Sénégal');
    expect(countryName('MA')).toBe('Maroc');
  });

  it('liste les pays triés, avec un nom pour chacun', () => {
    const options = countryOptions('fr');
    expect(options).toHaveLength(COUNTRY_CODES.length);
    expect(options.every((o) => o.name.trim() !== '')).toBe(true);
    const names = options.map((o) => o.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'fr')));
  });

  it('cherche sans tenir compte des accents ni de la casse', () => {
    expect(normalizeText('Sénégal')).toBe('senegal');
    expect(normalizeText("Côte d'Ivoire")).toBe("cote d'ivoire");
  });
});
