/*
 * Partage de l'héritage selon les règles du fiqh sunnite (Coran 4:11-12 et 4:176), pour les cas
 * courants : conjoint, parents, enfants, petits-enfants par un fils, frères et sœurs.
 *
 * Non couverts : grands-parents, oncles, cousins, héritiers éloignés, enfants disparus, héritiers
 * de sexe ou de statut incertain. Les écoles divergent sur certains cas (restitution au conjoint,
 * « himariyya », parts du père avec le conjoint…) : le calcul suit l'avis majoritaire et le signale.
 * Il aide à estimer ; pour une succession réelle, un notaire et un savant sont indispensables.
 */

// --- Fractions exactes ---

export interface Frac {
  n: number;
  d: number;
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const frac = (n: number, d = 1): Frac => {
  const g = gcd(n, d) || 1;
  return { n: n / g, d: d / g };
};
const add = (a: Frac, b: Frac) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a: Frac, b: Frac) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a: Frac, b: Frac) => frac(a.n * b.n, a.d * b.d);
const div = (a: Frac, b: Frac) => frac(a.n * b.d, a.d * b.n);
const cmp = (a: Frac, b: Frac) => a.n * b.d - b.n * a.d;
const ZERO = frac(0);
const ONE = frac(1);
export const fracValue = (f: Frac) => f.n / f.d;
export const fracText = (f: Frac) => (f.n === 0 ? '0' : f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);

// --- Héritiers ---

export type HeirId =
  | 'husband'
  | 'wives'
  | 'father'
  | 'mother'
  | 'sons'
  | 'daughters'
  | 'sonsSons'
  | 'sonsDaughters'
  | 'fullBrothers'
  | 'fullSisters'
  | 'paternalBrothers'
  | 'paternalSisters'
  | 'uterine';

export type Sex = 'male' | 'female';

export interface Heirs {
  /** Sexe du défunt : il détermine si le conjoint est un mari ou des épouses. */
  deceased: Sex;
  husband: boolean;
  wives: number;
  father: boolean;
  mother: boolean;
  sons: number;
  daughters: number;
  /** Fils d'un fils décédé. */
  sonsSons: number;
  /** Filles d'un fils décédé. */
  sonsDaughters: number;
  fullBrothers: number;
  fullSisters: number;
  /** Demi-frères et demi-sœurs du côté du père. */
  paternalBrothers: number;
  paternalSisters: number;
  /** Demi-frères et demi-sœurs du côté de la mère (frères et sœurs confondus). */
  uterine: number;
}

export const MAX_PER_KIND = 30;

export const emptyHeirs = (deceased: Sex = 'male'): Heirs => ({
  deceased,
  husband: false,
  wives: 0,
  father: false,
  mother: false,
  sons: 0,
  daughters: 0,
  sonsSons: 0,
  sonsDaughters: 0,
  fullBrothers: 0,
  fullSisters: 0,
  paternalBrothers: 0,
  paternalSisters: 0,
  uterine: 0,
});

const COUNT_KEYS = [
  'sons', 'daughters', 'sonsSons', 'sonsDaughters', 'fullBrothers', 'fullSisters', 'paternalBrothers', 'paternalSisters', 'uterine',
] as const;

/** Valeurs ramenées à des entiers valides ; un mari n'existe que si le défunt est une femme, des épouses que s'il est un homme. */
export function sanitizeHeirs(value: unknown): Heirs {
  const v = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>;
  const out = emptyHeirs(v.deceased === 'female' ? 'female' : 'male');
  const int = (x: unknown, max: number) => (typeof x === 'number' && Number.isFinite(x) ? Math.min(max, Math.max(0, Math.floor(x))) : 0);
  for (const k of COUNT_KEYS) out[k] = int(v[k], MAX_PER_KIND);
  out.father = v.father === true;
  out.mother = v.mother === true;
  if (out.deceased === 'female') out.husband = v.husband === true;
  else out.wives = int(v.wives, 4);
  return out;
}

export type Basis = 'fard' | 'asaba' | 'radd' | 'awl';

export interface Share {
  id: HeirId;
  count: number;
  /** Part totale du groupe, en fraction de la succession. */
  fraction: Frac;
  basis: Basis[];
}

export interface BlockedHeir {
  id: HeirId;
  count: number;
  reason: string;
}

export interface InheritanceResult {
  shares: Share[];
  blocked: BlockedHeir[];
  awl: boolean;
  radd: boolean;
  warnings: string[];
  /** Faux si aucun héritier couvert n'a été saisi. */
  covered: boolean;
}

interface FardEntry {
  id: HeirId;
  count: number;
  frac: Frac;
}
interface AsabaGroup {
  id: HeirId;
  count: number;
  /** 2 pour un homme, 1 pour une femme : la part d'un homme vaut le double. */
  weight: number;
  rank: number;
}

export function computeShares(input: Heirs): InheritanceResult {
  const h = sanitizeHeirs(input);
  const blocked: BlockedHeir[] = [];
  const warnings: string[] = [];
  const block = (id: HeirId, count: number, reason: string) => {
    if (count > 0) blocked.push({ id, count, reason });
  };

  // --- Petits-enfants par un fils ---
  let sonsSons = h.sonsSons;
  let sonsDaughters = h.sonsDaughters;
  if (h.sons > 0) {
    block('sonsSons', sonsSons, 'Exclu(s) par le fils');
    block('sonsDaughters', sonsDaughters, 'Exclue(s) par le fils');
    sonsSons = 0;
    sonsDaughters = 0;
  } else if (h.daughters >= 2 && sonsSons === 0) {
    block('sonsDaughters', sonsDaughters, 'Exclue(s) : les filles ont déjà les deux tiers');
    sonsDaughters = 0;
  }

  const maleDesc = h.sons > 0 || sonsSons > 0;
  const anyDesc = maleDesc || h.daughters > 0 || sonsDaughters > 0;
  const hasSpouse = h.husband || h.wives > 0;
  const siblingsTotal = h.fullBrothers + h.fullSisters + h.paternalBrothers + h.paternalSisters + h.uterine;

  const fards: FardEntry[] = [];
  const asaba: AsabaGroup[] = [];
  const fard = (id: HeirId, count: number, f: Frac) => {
    if (count > 0) fards.push({ id, count, frac: f });
  };

  // --- Conjoint ---
  let spouseFrac = ZERO;
  if (h.husband) {
    spouseFrac = anyDesc ? frac(1, 4) : frac(1, 2);
    fard('husband', 1, spouseFrac);
  }
  if (h.wives > 0) {
    spouseFrac = anyDesc ? frac(1, 8) : frac(1, 4);
    fard('wives', h.wives, spouseFrac);
  }

  // --- Parents ---
  if (h.father) {
    if (anyDesc) fard('father', 1, frac(1, 6));
    if (!maleDesc) asaba.push({ id: 'father', count: 1, weight: 1, rank: 3 });
  }
  if (h.mother) {
    if (anyDesc || siblingsTotal >= 2) {
      fard('mother', 1, frac(1, 6));
    } else if (h.father && hasSpouse && siblingsTotal === 0) {
      // Cas d'« al-Oumariyyatayn » : la mère reçoit le tiers de ce qui reste après le conjoint.
      fard('mother', 1, mul(frac(1, 3), sub(ONE, spouseFrac)));
      warnings.push("Cas dit « al-Oumariyyatayn » : la mère reçoit le tiers de ce qui reste après le conjoint (avis majoritaire).");
    } else {
      fard('mother', 1, frac(1, 3));
    }
  }

  // --- Enfants ---
  if (h.sons > 0) {
    asaba.push({ id: 'sons', count: h.sons, weight: 2, rank: 1 });
    if (h.daughters > 0) asaba.push({ id: 'daughters', count: h.daughters, weight: 1, rank: 1 });
  } else if (h.daughters > 0) {
    fard('daughters', h.daughters, h.daughters === 1 ? frac(1, 2) : frac(2, 3));
  }

  // --- Petits-enfants par un fils ---
  if (sonsSons > 0) {
    asaba.push({ id: 'sonsSons', count: sonsSons, weight: 2, rank: 2 });
    if (sonsDaughters > 0) asaba.push({ id: 'sonsDaughters', count: sonsDaughters, weight: 1, rank: 2 });
  } else if (sonsDaughters > 0 && h.sons === 0) {
    if (h.daughters === 0) fard('sonsDaughters', sonsDaughters, sonsDaughters === 1 ? frac(1, 2) : frac(2, 3));
    else if (h.daughters === 1) fard('sonsDaughters', sonsDaughters, frac(1, 6));
  }

  // --- Frères et sœurs germains ---
  let fb = h.fullBrothers;
  let fs = h.fullSisters;
  const fullEligible = !maleDesc && !h.father;
  if (!fullEligible) {
    const why = h.father ? 'le père' : 'les fils ou petits-fils';
    block('fullBrothers', fb, `Exclu(s) par ${why}`);
    block('fullSisters', fs, `Exclue(s) par ${why}`);
    fb = 0;
    fs = 0;
  } else if (fb > 0) {
    asaba.push({ id: 'fullBrothers', count: fb, weight: 2, rank: 4 });
    if (fs > 0) asaba.push({ id: 'fullSisters', count: fs, weight: 1, rank: 4 });
  } else if (fs > 0) {
    if (anyDesc) asaba.push({ id: 'fullSisters', count: fs, weight: 1, rank: 4 }); // avec les filles
    else fard('fullSisters', fs, fs === 1 ? frac(1, 2) : frac(2, 3));
  }

  // --- Demi-frères et demi-sœurs du côté du père ---
  let pb = h.paternalBrothers;
  let ps = h.paternalSisters;
  const paternalEligible = !maleDesc && !h.father && fb === 0 && !(fs > 0 && anyDesc);
  if (!paternalEligible) {
    const why = h.father ? 'le père' : maleDesc ? 'les fils ou petits-fils' : 'les frères et sœurs germains';
    block('paternalBrothers', pb, `Exclu(s) par ${why}`);
    block('paternalSisters', ps, `Exclue(s) par ${why}`);
    pb = 0;
    ps = 0;
  } else if (pb > 0) {
    asaba.push({ id: 'paternalBrothers', count: pb, weight: 2, rank: 5 });
    if (ps > 0) asaba.push({ id: 'paternalSisters', count: ps, weight: 1, rank: 5 });
  } else if (ps > 0) {
    if (anyDesc) asaba.push({ id: 'paternalSisters', count: ps, weight: 1, rank: 5 });
    else if (fs >= 2) block('paternalSisters', ps, 'Exclue(s) : les sœurs germaines ont déjà les deux tiers');
    else if (fs === 1) fard('paternalSisters', ps, frac(1, 6));
    else fard('paternalSisters', ps, ps === 1 ? frac(1, 2) : frac(2, 3));
  }

  // --- Demi-frères et demi-sœurs du côté de la mère ---
  if (!anyDesc && !h.father) fard('uterine', h.uterine, h.uterine === 1 ? frac(1, 6) : frac(1, 3));
  else block('uterine', h.uterine, h.father ? 'Exclu(s) par le père' : 'Exclu(s) par les descendants');

  // --- Calcul des parts ---
  const totals = new Map<HeirId, { count: number; frac: Frac; basis: Set<Basis> }>();
  const credit = (id: HeirId, count: number, f: Frac, basis: Basis) => {
    const cur = totals.get(id) ?? { count, frac: ZERO, basis: new Set<Basis>() };
    cur.frac = add(cur.frac, f);
    cur.basis.add(basis);
    totals.set(id, cur);
  };

  const sumFards = fards.reduce((s, f) => add(s, f.frac), ZERO);
  let awl = false;
  let radd = false;

  if (cmp(sumFards, ONE) > 0) {
    awl = true;
    for (const f of fards) credit(f.id, f.count, div(f.frac, sumFards), 'fard');
    for (const f of fards) totals.get(f.id)!.basis.add('awl');
    warnings.push("Les parts fixes dépassent la succession : on applique la règle de l'« awl » (réduction proportionnelle de chaque part).");
    for (const g of asaba) block(g.id, g.count, "N'hérite rien : les parts fixes épuisent la succession");
  } else {
    for (const f of fards) credit(f.id, f.count, f.frac, 'fard');
    const residue = sub(ONE, sumFards);
    const topRank = asaba.length ? Math.min(...asaba.map((g) => g.rank)) : 0;
    const groups = asaba.filter((g) => g.rank === topRank);
    for (const g of asaba.filter((a) => a.rank !== topRank)) block(g.id, g.count, 'Exclu(s) par un héritier plus proche');

    if (groups.length && residue.n > 0) {
      const units = groups.reduce((s, g) => s + g.count * g.weight, 0);
      for (const g of groups) credit(g.id, g.count, mul(residue, frac(g.count * g.weight, units)), 'asaba');
    } else if (groups.length) {
      for (const g of groups) {
        if (!totals.has(g.id)) block(g.id, g.count, "N'hérite rien : les parts fixes épuisent la succession");
      }
      if (!h.father && !anyDesc && h.husband && h.mother && h.uterine >= 2 && h.fullBrothers > 0) {
        warnings.push("Cas dit « al-Himariyya » : les frères germains n'ont rien selon l'avis majoritaire ; les malikites et chafiites les associent au tiers des utérins.");
      }
    } else if (residue.n > 0 && fards.length) {
      radd = true;
      const receivers = fards.filter((f) => f.id !== 'husband' && f.id !== 'wives');
      const pool = receivers.length ? receivers : fards;
      const poolSum = pool.reduce((s, f) => add(s, f.frac), ZERO);
      for (const f of pool) credit(f.id, f.count, mul(residue, div(f.frac, poolSum)), 'radd');
      if (!receivers.length) {
        warnings.push("Le conjoint est seul héritier : il reçoit le reste selon certains savants ; d'autres le versent au trésor public.");
      } else {
        warnings.push("Il reste une part sans héritier « asaba » : elle est redistribuée entre les héritiers à part fixe, sauf le conjoint (« radd »).");
      }
    }
  }

  const shares: Share[] = [...totals.entries()]
    .map(([id, t]) => ({ id, count: t.count, fraction: t.frac, basis: [...t.basis] }))
    .filter((s) => s.fraction.n > 0);

  return { shares, blocked, awl, radd, warnings, covered: shares.length > 0 };
}

// --- Succession : biens, dettes, testament ---

export interface Asset {
  label: string;
  value: number;
}

export interface EstateInput {
  assets: Asset[];
  /** Dettes à régler. */
  debts: number;
  /** Frais d'obsèques. */
  funeral: number;
  /** Legs voulu par le défunt, pour des non-héritiers. */
  bequest: number;
}

export interface EstateResult {
  total: number;
  debts: number;
  funeral: number;
  afterDebts: number;
  /** Legs retenu : au plus le tiers de ce qui reste après les dettes. */
  bequest: number;
  bequestCapped: boolean;
  /** Montant à partager entre les héritiers. */
  net: number;
  /** Vrai si les dettes dépassent les biens. */
  insolvent: boolean;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const pos = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

export function computeEstate(input: EstateInput): EstateResult {
  const total = round2(input.assets.reduce((s, a) => s + pos(a.value), 0));
  const debts = round2(pos(input.debts));
  const funeral = round2(pos(input.funeral));
  const rawAfter = total - funeral - debts;
  const afterDebts = round2(Math.max(0, rawAfter));
  const asked = pos(input.bequest);
  const limit = round2(afterDebts / 3);
  const bequest = round2(Math.min(asked, limit));
  return {
    total,
    debts,
    funeral,
    afterDebts,
    bequest,
    bequestCapped: asked > limit,
    net: round2(afterDebts - bequest),
    insolvent: rawAfter < 0,
  };
}

export interface DistributionRow {
  id: HeirId;
  count: number;
  fraction: Frac;
  amount: number;
  perPerson: number;
  basis: Basis[];
}

/** Montants revenant à chaque groupe d'héritiers pour un net donné. */
export function distribute(net: number, result: InheritanceResult): DistributionRow[] {
  return result.shares.map((s) => {
    const amount = round2(net * fracValue(s.fraction));
    return {
      id: s.id,
      count: s.count,
      fraction: s.fraction,
      amount,
      perPerson: round2(amount / Math.max(1, s.count)),
      basis: s.basis,
    };
  });
}

export const HEIR_LABELS: Record<HeirId, { one: string; many: string }> = {
  husband: { one: 'Mari', many: 'Maris' },
  wives: { one: 'Épouse', many: 'Épouses' },
  father: { one: 'Père', many: 'Pères' },
  mother: { one: 'Mère', many: 'Mères' },
  sons: { one: 'Fils', many: 'Fils' },
  daughters: { one: 'Fille', many: 'Filles' },
  sonsSons: { one: "Petit-fils (fils d'un fils)", many: "Petits-fils (fils d'un fils)" },
  sonsDaughters: { one: "Petite-fille (fille d'un fils)", many: "Petites-filles (filles d'un fils)" },
  fullBrothers: { one: 'Frère germain', many: 'Frères germains' },
  fullSisters: { one: 'Sœur germaine', many: 'Sœurs germaines' },
  paternalBrothers: { one: 'Demi-frère (même père)', many: 'Demi-frères (même père)' },
  paternalSisters: { one: 'Demi-sœur (même père)', many: 'Demi-sœurs (même père)' },
  uterine: { one: 'Demi-frère ou demi-sœur (même mère)', many: 'Demi-frères et demi-sœurs (même mère)' },
};

export const heirLabel = (id: HeirId, count: number) => (count > 1 ? HEIR_LABELS[id].many : HEIR_LABELS[id].one);
