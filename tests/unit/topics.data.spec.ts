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
    const pages = ['/tabs/prayer', '/tabs/zakat', '/tabs/ramadan', '/tabs/quran', '/tabs/adhkar'];
    for (const t of TOPICS) for (const i of t.items) if (i.href) expect(pages).toContain(i.href);
  });
  it('topicById retrouve une rubrique, undefined sinon', () => {
    expect(topicById('piliers-islam')?.items).toHaveLength(5);
    expect(topicById('inconnue')).toBeUndefined();
  });
});
