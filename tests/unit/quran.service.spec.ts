import { QuranError, loadSurah, parseSurahResponse, surahUrl, fetchSurah } from '../../src/services/quran';

const edition = (identifier: string, texts: string[]) => ({
  edition: { identifier },
  ayahs: texts.map((text, i) => ({ numberInSurah: i + 1, text })),
});
const body = (n = 3) => ({
  code: 200,
  data: [
    edition('quran-uthmani', Array.from({ length: n }, (_, i) => `ar${i + 1}`)),
    edition('fr.hamidullah', Array.from({ length: n }, (_, i) => `fr${i + 1}`)),
    edition('en.transliteration', Array.from({ length: n }, (_, i) => `ph${i + 1}`)),
  ],
});
const ok = (b: unknown) => (async () => ({ ok: true, json: async () => b })) as unknown as typeof fetch;

describe('parseSurahResponse', () => {
  it('fusionne arabe, phonétique et français par numéro de verset', () => {
    expect(parseSurahResponse(body(2), 2)).toEqual([
      { n: 1, arabic: 'ar1', phonetic: 'ph1', french: 'fr1' },
      { n: 2, arabic: 'ar2', phonetic: 'ph2', french: 'fr2' },
    ]);
  });
  it('ordre des éditions indifférent', () => {
    const b = body(2);
    b.data.reverse();
    expect(parseSurahResponse(b)[0].arabic).toBe('ar1');
  });
  it('tolère une traduction manquante', () => {
    const b = body(2);
    b.data = b.data.filter((e) => e.edition.identifier !== 'fr.hamidullah');
    expect(parseSurahResponse(b)[0].french).toBe('');
  });
  it('refuse les réponses invalides ou incomplètes', () => {
    for (const bad of [null, {}, { data: 'x' }, { data: [] }]) {
      expect(() => parseSurahResponse(bad)).toThrow(QuranError);
    }
    expect(() => parseSurahResponse(body(2), 3)).toThrow('incomplète');
  });
});

describe('fetchSurah / loadSurah', () => {
  it('construit l\'URL avec les trois éditions', () => {
    expect(surahUrl(18)).toBe('https://api.alquran.cloud/v1/surah/18/editions/quran-uthmani,fr.hamidullah,en.transliteration');
  });
  it('erreur réseau', async () => {
    const f = (async () => { throw new Error('x'); }) as unknown as typeof fetch;
    await expect(fetchSurah(1, 3, f)).rejects.toMatchObject({ reason: 'network' });
    const f2 = (async () => ({ ok: false })) as unknown as typeof fetch;
    await expect(fetchSurah(1, 3, f2)).rejects.toMatchObject({ reason: 'network' });
  });
  it('met en cache puis relit hors ligne', async () => {
    const first = await loadSurah(103, 3, ok(body(3)));
    expect(first.fromCache).toBe(false);
    const offline = (async () => { throw new Error('hors ligne'); }) as unknown as typeof fetch;
    const second = await loadSurah(103, 3, offline);
    expect(second.fromCache).toBe(true);
    expect(second.verses).toHaveLength(3);
  });
});
