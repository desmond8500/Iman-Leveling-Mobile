import {
  HadeethError, dailyHadeeth, loadFavorites, loadHadeeth, parseCategories, parseHadeeth, parseHadeethPage,
  pickHadeeth, savedDailyHadeeth, stableIndex, toggleFavorite, listUrl, oneUrl, categoriesUrl,
} from '../../src/services/hadeeth';

const cats = [
  { id: '1', title: 'Racine', hadeeths_count: '10' },
  { id: '2', title: 'Sous-catégorie', hadeeths_count: '5', parent_id: '1' },
  { id: '3', title: 'Vide', hadeeths_count: '0', parent_id: '1' },
];
const list = { data: [{ id: '10', title: 'A', translations: ['fr'] }, { id: '11', title: 'B' }], meta: { current_page: '1', last_page: 3, total_items: 50, per_page: '20' } };
const one = (id: string) => ({ id, title: `T${id}`, hadeeth: `Texte ${id}`, attribution: 'Rapporté par X', grade: 'Authentique', explanation: 'Expl', hints: ['a', 'b'] });

function fakeFetch(calls: string[] = []): typeof fetch {
  return (async (url: string) => {
    calls.push(url);
    const u = new URL(url);
    let body: unknown = null;
    if (u.pathname.endsWith('/categories/list/')) body = cats;
    else if (u.pathname.endsWith('/hadeeths/list/')) body = list;
    else if (u.pathname.endsWith('/hadeeths/one/')) body = one(u.searchParams.get('id')!);
    return { ok: body !== null, json: async () => body };
  }) as unknown as typeof fetch;
}

describe('adresses', () => {
  it('construit les URL attendues', () => {
    expect(categoriesUrl()).toBe('https://hadeethenc.com/api/v1/categories/list/?language=fr');
    expect(listUrl('2', 3)).toBe('https://hadeethenc.com/api/v1/hadeeths/list/?language=fr&category_id=2&page=3&per_page=20');
    expect(oneUrl('10')).toBe('https://hadeethenc.com/api/v1/hadeeths/one/?language=fr&id=10');
  });
});

describe('analyse des réponses', () => {
  it('catégories : nombres en texte acceptés, parent optionnel', () => {
    expect(parseCategories(cats)).toEqual([
      { id: '1', title: 'Racine', count: 10, parentId: null },
      { id: '2', title: 'Sous-catégorie', count: 5, parentId: '1' },
      { id: '3', title: 'Vide', count: 0, parentId: '1' },
    ]);
    expect(() => parseCategories({})).toThrow(HadeethError);
    expect(() => parseCategories([])).toThrow(HadeethError);
  });
  it('liste paginée', () => {
    expect(parseHadeethPage(list)).toEqual({ items: [{ id: '10', title: 'A' }, { id: '11', title: 'B' }], page: 1, lastPage: 3 });
    expect(() => parseHadeethPage(null)).toThrow(HadeethError);
  });
  it('un hadith', () => {
    expect(parseHadeeth(one('10'))).toEqual({ id: '10', title: 'T10', text: 'Texte 10', explanation: 'Expl', hints: ['a', 'b'], attribution: 'Rapporté par X', grade: 'Authentique' });
    expect(parseHadeeth({ id: '1', hadeeth: 'x' }).hints).toEqual([]);
    expect(() => parseHadeeth({ id: '1' })).toThrow(HadeethError);
  });
});

describe('chargement et cache', () => {
  it('un hadith est demandé une seule fois', async () => {
    const calls: string[] = [];
    const f = fakeFetch(calls);
    expect((await loadHadeeth('77', f)).text).toBe('Texte 77');
    await loadHadeeth('77', f);
    expect(calls.filter((c) => c.includes('/one/'))).toHaveLength(1);
  });
  it('erreur réseau et erreur de service', async () => {
    const down = (async () => { throw new Error('x'); }) as unknown as typeof fetch;
    await expect(loadHadeeth('500', down)).rejects.toMatchObject({ reason: 'network' });
    const bad = (async () => ({ ok: false, json: async () => null })) as unknown as typeof fetch;
    await expect(loadHadeeth('501', bad)).rejects.toMatchObject({ reason: 'network' });
  });
});

describe('hadith du jour', () => {
  it('stableIndex est stable et borné', () => {
    expect(stableIndex('2026-11-12', 7)).toBe(stableIndex('2026-11-12', 7));
    for (const s of ['a', 'b', 'c', '2026-01-01']) expect(stableIndex(s, 5)).toBeLessThan(5);
    expect(stableIndex('x', 0)).toBe(0);
  });
  it('ne tire que dans une sous-catégorie non vide', async () => {
    const calls: string[] = [];
    await pickHadeeth('graine', fakeFetch(calls));
    const listCall = calls.find((c) => c.includes('/hadeeths/list/'))!;
    expect(listCall).toContain('category_id=2');
  });
  it('est gardé pour la journée, et le dernier connu sert hors ligne', async () => {
    const calls: string[] = [];
    const first = await dailyHadeeth('2030-01-01', fakeFetch(calls));
    const n = calls.length;
    expect(await dailyHadeeth('2030-01-01', fakeFetch(calls))).toEqual(first);
    expect(calls.length).toBe(n);
    expect(await savedDailyHadeeth('2030-01-01')).toEqual(first);
    expect(await savedDailyHadeeth('2030-01-02')).toBeNull();
    const down = (async () => { throw new Error('x'); }) as unknown as typeof fetch;
    // Hors ligne : un hadith en cache ou le dernier connu, jamais une erreur.
    expect((await dailyHadeeth('2030-01-02', down)).text).toMatch(/^Texte /);
  });
});

describe('favoris', () => {
  it('ajoute puis retire', async () => {
    const h = parseHadeeth(one('900'));
    expect((await toggleFavorite(h)).map((x) => x.id)).toContain('900');
    expect((await loadFavorites()).map((x) => x.id)).toContain('900');
    expect((await toggleFavorite(h)).map((x) => x.id)).not.toContain('900');
  });
});
