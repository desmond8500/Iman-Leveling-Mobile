import { loadJson, saveJson } from './storage';

/*
 * Hadiths de l'Encyclopédie des paroles prophétiques traduites (HadeethEnc.com), chargés à la
 * demande puis gardés sur l'appareil. Le texte n'est pas saisi dans le code : il vient de cette
 * source, qui indique aussi l'attribution et le degré d'authenticité de chaque hadith.
 *
 * Les adresses et le format des réponses viennent de la documentation du service mais n'ont pas pu
 * être essayés depuis l'environnement de développement : l'analyse est donc tolérante, et les
 * tests décrivent le format attendu. À confirmer sur l'appareil.
 */

export const API_BASE = 'https://hadeethenc.com/api/v1';
export const LANGUAGE = 'fr';
export const PAGE_SIZE = 20;

export interface HadeethCategory {
  id: string;
  title: string;
  count: number;
  parentId: string | null;
}

export interface HadeethSummary {
  id: string;
  title: string;
}

export interface HadeethPage {
  items: HadeethSummary[];
  page: number;
  lastPage: number;
}

export interface Hadeeth {
  id: string;
  title: string;
  /** Texte du hadith. */
  text: string;
  explanation: string;
  hints: string[];
  attribution: string;
  grade: string;
}

export type HadeethFailure = 'network' | 'format';

export class HadeethError extends Error {
  constructor(
    message: string,
    public reason: HadeethFailure,
  ) {
    super(message);
    this.name = 'HadeethError';
  }
}

export const categoriesUrl = () => `${API_BASE}/categories/list/?language=${LANGUAGE}`;
export const listUrl = (categoryId: string, page = 1) =>
  `${API_BASE}/hadeeths/list/?language=${LANGUAGE}&category_id=${encodeURIComponent(categoryId)}&page=${page}&per_page=${PAGE_SIZE}`;
export const oneUrl = (id: string) => `${API_BASE}/hadeeths/one/?language=${LANGUAGE}&id=${encodeURIComponent(id)}`;

const str = (v: unknown): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');
const int = (v: unknown, fallback: number): number => {
  const n = typeof v === 'string' ? Number.parseInt(v, 10) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : fallback;
};

export function parseCategories(body: unknown): HadeethCategory[] {
  if (!Array.isArray(body)) throw new HadeethError('Réponse inattendue du service.', 'format');
  const out: HadeethCategory[] = [];
  for (const c of body as Record<string, unknown>[]) {
    const id = str(c?.id);
    const title = str(c?.title);
    if (!id || !title) continue;
    out.push({ id, title, count: int(c.hadeeths_count, 0), parentId: str(c.parent_id) || null });
  }
  if (!out.length) throw new HadeethError('Aucune catégorie dans la réponse.', 'format');
  return out;
}

export function parseHadeethPage(body: unknown): HadeethPage {
  const b = body as { data?: unknown; meta?: Record<string, unknown> } | null;
  if (!b || !Array.isArray(b.data)) throw new HadeethError('Réponse inattendue du service.', 'format');
  const items: HadeethSummary[] = [];
  for (const h of b.data as Record<string, unknown>[]) {
    const id = str(h?.id);
    const title = str(h?.title);
    if (id && title) items.push({ id, title });
  }
  return { items, page: int(b.meta?.current_page, 1), lastPage: Math.max(1, int(b.meta?.last_page, 1)) };
}

export function parseHadeeth(body: unknown): Hadeeth {
  const h = body as Record<string, unknown> | null;
  const id = str(h?.id);
  const text = str(h?.hadeeth);
  if (!h || !id || !text) throw new HadeethError('Hadith introuvable dans la réponse.', 'format');
  return {
    id,
    title: str(h.title),
    text,
    explanation: str(h.explanation),
    hints: Array.isArray(h.hints) ? (h.hints as unknown[]).map(str).filter(Boolean) : [],
    attribution: str(h.attribution),
    grade: str(h.grade),
  };
}

async function getJson(url: string, fetchFn: typeof fetch = (...a) => fetch(...a)): Promise<unknown> {
  let response: Response;
  try {
    response = await fetchFn(url);
  } catch {
    throw new HadeethError('Impossible de joindre le service. Vérifie ta connexion.', 'network');
  }
  if (!response.ok) throw new HadeethError('Le service a répondu avec une erreur.', 'network');
  return response.json().catch(() => null);
}

/** Lit le cache, sinon interroge le service et garde le résultat. */
async function cached<T>(key: string, fetcher: () => Promise<T>, valid: (v: unknown) => boolean): Promise<T> {
  const hit = await loadJson<unknown>(key, null);
  if (hit !== null && valid(hit)) return hit as T;
  const value = await fetcher();
  try {
    await saveJson(key, value);
  } catch {
    // Cache indisponible : on continue sans.
  }
  return value;
}

export const loadCategories = (fetchFn?: typeof fetch) =>
  cached<HadeethCategory[]>(
    'iman.hadeeth.v1.categories',
    async () => parseCategories(await getJson(categoriesUrl(), fetchFn)),
    (v) => Array.isArray(v) && v.length > 0,
  );

export const loadHadeethPage = (categoryId: string, page = 1, fetchFn?: typeof fetch) =>
  cached<HadeethPage>(
    `iman.hadeeth.v1.list.${categoryId}.${page}`,
    async () => parseHadeethPage(await getJson(listUrl(categoryId, page), fetchFn)),
    (v) => !!v && Array.isArray((v as HadeethPage).items),
  );

export const loadHadeeth = (id: string, fetchFn?: typeof fetch) =>
  cached<Hadeeth>(
    `iman.hadeeth.v1.one.${id}`,
    async () => parseHadeeth(await getJson(oneUrl(id), fetchFn)),
    (v) => !!v && typeof (v as Hadeeth).text === 'string' && !!(v as Hadeeth).text,
  );

// --- Choix du hadith du jour et au hasard ---

/** Entier stable (0 à n - 1) dérivé d'un texte, pour que le « hadith du jour » ne change pas dans la journée. */
export function stableIndex(seed: string, n: number): number {
  if (n <= 0) return 0;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % n;
}

/**
 * Hadith d'un jour : on choisit une catégorie non vide puis un hadith de sa première page, sans
 * autre appel que ceux nécessaires. Le tirage dépend de `seed` (le jour, ou un texte aléatoire).
 */
export async function pickHadeeth(seed: string, fetchFn?: typeof fetch): Promise<Hadeeth> {
  const categories = (await loadCategories(fetchFn)).filter((c) => c.count > 0 && c.parentId !== null);
  const pool = categories.length ? categories : (await loadCategories(fetchFn)).filter((c) => c.count > 0);
  if (!pool.length) throw new HadeethError('Aucune catégorie disponible.', 'format');
  const category = pool[stableIndex(`c${seed}`, pool.length)];
  const page = await loadHadeethPage(category.id, 1, fetchFn);
  if (!page.items.length) throw new HadeethError('Catégorie vide.', 'format');
  const item = page.items[stableIndex(`h${seed}`, page.items.length)];
  return loadHadeeth(item.id, fetchFn);
}

const DAILY_KEY = 'iman.hadeeth.v1.daily';
const FAVORITES_KEY = 'iman.hadeeth.v1.favorites';

/** Hadith du jour (gardé pour la journée) ; en cas d'échec réseau, le dernier connu s'il existe. */
export async function dailyHadeeth(dayKey: string, fetchFn?: typeof fetch): Promise<Hadeeth> {
  const saved = await loadJson<{ day: string; hadeeth: Hadeeth } | null>(DAILY_KEY, null);
  if (saved?.day === dayKey && saved.hadeeth?.text) return saved.hadeeth;
  try {
    const hadeeth = await pickHadeeth(dayKey, fetchFn);
    await saveJson(DAILY_KEY, { day: dayKey, hadeeth }).catch(() => undefined);
    return hadeeth;
  } catch (error) {
    if (saved?.hadeeth?.text) return saved.hadeeth;
    throw error;
  }
}

/** Hadith gardé pour le jour, sans réseau (pour les widgets). */
export async function savedDailyHadeeth(dayKey: string): Promise<Hadeeth | null> {
  const saved = await loadJson<{ day: string; hadeeth: Hadeeth } | null>(DAILY_KEY, null);
  return saved?.day === dayKey && saved.hadeeth?.text ? saved.hadeeth : null;
}

// --- Favoris ---

export const loadFavorites = async (): Promise<Hadeeth[]> => {
  const list = await loadJson<unknown>(FAVORITES_KEY, []);
  return Array.isArray(list) ? (list as Hadeeth[]).filter((h) => h && typeof h.id === 'string' && typeof h.text === 'string') : [];
};

/** Ajoute ou retire un hadith des favoris. Renvoie la nouvelle liste. */
export async function toggleFavorite(hadeeth: Hadeeth): Promise<Hadeeth[]> {
  const list = await loadFavorites();
  const next = list.some((h) => h.id === hadeeth.id) ? list.filter((h) => h.id !== hadeeth.id) : [hadeeth, ...list];
  await saveJson(FAVORITES_KEY, next);
  return next;
}
