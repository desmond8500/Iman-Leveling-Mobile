import { ADHKAR_KEYS, PERIODS, adhkarFor } from '../../src/data/adhkar';

describe('invocations', () => {
  it.each(PERIODS)('chaque invocation du %s a arabe, phonétique, français et source', (period) => {
    const items = adhkarFor(period);
    expect(items.length).toBeGreaterThan(5);
    for (const d of items) {
      expect(d.title.trim()).not.toBe('');
      expect(d.arabic.trim()).not.toBe('');
      expect(d.phonetic.trim()).not.toBe('');
      expect(d.french.trim()).not.toBe('');
      expect(d.source.trim()).not.toBe('');
      expect(d.count).toBeGreaterThanOrEqual(1);
    }
  });

  it('le texte arabe contient bien de l\'arabe, la phonétique et le français n\'en contiennent pas', () => {
    const arabic = /[؀-ۿ]/;
    for (const period of PERIODS) {
      for (const d of adhkarFor(period)) {
        expect(arabic.test(d.arabic)).toBe(true);
        expect(arabic.test(d.phonetic)).toBe(false);
        expect(arabic.test(d.french)).toBe(false);
      }
    }
  });

  it('a des identifiants uniques dans chaque période', () => {
    for (const period of PERIODS) {
      const ids = adhkarFor(period).map((d) => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('adapte le texte au matin et au soir', () => {
    const morning = adhkarFor('morning').find((d) => d.id === 'mulk')!;
    const evening = adhkarFor('evening').find((d) => d.id === 'mulk')!;
    expect(morning.phonetic.startsWith('Asbahna')).toBe(true);
    expect(evening.phonetic.startsWith('Amsayna')).toBe(true);
    expect(morning.arabic).not.toBe(evening.arabic);
    expect(morning.french).toContain('matin');
    expect(evening.french).toContain('soir');
  });

  it('réserve certaines invocations à une seule période', () => {
    expect(adhkarFor('evening').some((d) => d.id === 'kalimat')).toBe(true);
    expect(adhkarFor('morning').some((d) => d.id === 'kalimat')).toBe(false);
    expect(adhkarFor('morning').some((d) => d.id === 'tawhid')).toBe(true);
  });

  it('expose une clé de suivi unique par période et invocation', () => {
    expect(new Set(ADHKAR_KEYS).size).toBe(ADHKAR_KEYS.length);
    expect(ADHKAR_KEYS).toContain('morning:kursi');
    expect(ADHKAR_KEYS).toContain('evening:kursi');
  });
});
