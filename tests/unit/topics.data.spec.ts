import { TOPICS, topicById } from '../../src/data/topics';

describe('rubriques de culture islamique', () => {
  it('identifiants uniques et rubriques renseignées', () => {
    expect(new Set(TOPICS.map((t) => t.id)).size).toBe(TOPICS.length);
    for (const t of TOPICS) {
      expect(t.title.length).toBeGreaterThan(2);
      expect(t.intro.length).toBeGreaterThan(20);
      expect(t.source.length).toBeGreaterThan(5);
      expect(t.items.length).toBeGreaterThan(0);
      for (const item of t.items) expect(item.text.length).toBeGreaterThan(10);
    }
  });
  it('les liens internes pointent vers des pages existantes', () => {
    const pages = ['/tabs/names', '/tabs/prayer', '/tabs/zakat', '/tabs/ramadan', '/tabs/quran', '/tabs/adhkar'];
    for (const t of TOPICS) for (const i of t.items) if (i.href) expect(pages).toContain(i.href);
  });
  it('les liens vers les noms d\'Allah visent une page existante', () => {
    const hrefs = TOPICS.flatMap((t) => t.items.map((i) => i.href)).filter(Boolean);
    expect(hrefs).toContain('/tabs/names');
  });
  it('topicById retrouve une rubrique, undefined sinon', () => {
    expect(topicById('piliers-islam')?.items).toHaveLength(5);
    expect(topicById('piliers-foi')?.items).toHaveLength(6);
    expect(topicById('inconnue')).toBeUndefined();
  });
});

describe('portes du paradis et de l\'enfer', () => {
  it('huit portes au paradis, sept à l\'enfer, et ar-Rayyan est citée', () => {
    const paradise = topicById('portes-paradis')!;
    expect(paradise.intro).toContain('huit portes');
    expect(paradise.items.some((i) => i.arabic === 'الريان')).toBe(true);
    expect(topicById('portes-enfer')!.items[0].text).toContain('sept portes');
  });
});
