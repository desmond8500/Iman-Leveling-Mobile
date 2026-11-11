import { ZAKAT_SECTIONS } from '../../src/data/zakat';

describe('repères sur la zakat', () => {
  it('sections uniques et renseignées', () => {
    expect(new Set(ZAKAT_SECTIONS.map((s) => s.id)).size).toBe(ZAKAT_SECTIONS.length);
    for (const s of ZAKAT_SECTIONS) {
      expect(s.title.length).toBeGreaterThan(2);
      expect(s.paragraphs.length).toBeGreaterThan(0);
    }
  });
  it('couvre al-Maal, al-Fitr et les bénéficiaires', () => {
    expect(ZAKAT_SECTIONS.map((s) => s.id)).toEqual(expect.arrayContaining(['maal', 'fitr', 'beneficiaires']));
  });
});
