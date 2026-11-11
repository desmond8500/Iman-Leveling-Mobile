/*
 * Calculs de la zakat. Les seuils (nisab) et le taux sont ceux généralement retenus ; les prix de
 * l'or, de l'argent et des denrées sont saisis par l'utilisateur. Cet outil aide à estimer : en cas
 * de doute (bijoux, dettes, commerce, plusieurs devises), demander à un savant ou à une institution.
 */

export const GOLD_NISAB_GRAMS = 85;
export const SILVER_NISAB_GRAMS = 595;
export const ZAKAT_RATE = 0.025;

/** Poids d'un sa' de denrée par personne pour la zakat al-Fitr : l'usage va d'environ 2 à 3 kg. */
export const FITR_DEFAULT_KG = 2.5;

/** Lit un nombre saisi à la française (« 1 234,5 »). Renvoie 0 si vide, invalide ou négatif. */
export function parseAmount(input: string | number | null | undefined): number {
  if (typeof input === 'number') return Number.isFinite(input) && input > 0 ? input : 0;
  if (!input) return 0;
  const cleaned = input.replace(/[\s  ]/g, '').replace(',', '.');
  if (!/^\d*\.?\d*$/.test(cleaned) || cleaned === '' || cleaned === '.') return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function formatMoney(amount: number, currency = ''): string {
  const text = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(round2(amount));
  return currency.trim() ? `${text} ${currency.trim()}` : text;
}

export type NisabBasis = 'gold' | 'silver';

export interface MaalInput {
  cash: number;
  savings: number;
  investments: number;
  tradeGoods: number;
  /** Créances dont le remboursement est attendu. */
  receivables: number;
  goldGrams: number;
  silverGrams: number;
  goldPricePerGram: number;
  silverPricePerGram: number;
  /** Dettes à rembourser prochainement. */
  debts: number;
}

export interface MaalResult {
  assets: number;
  debts: number;
  net: number;
  nisab: number;
  /** Faux si le prix du métal choisi comme référence n'est pas renseigné : le seuil est inconnu. */
  nisabKnown: boolean;
  nisabReached: boolean;
  due: number;
}

export const emptyMaalInput = (): MaalInput => ({
  cash: 0,
  savings: 0,
  investments: 0,
  tradeGoods: 0,
  receivables: 0,
  goldGrams: 0,
  silverGrams: 0,
  goldPricePerGram: 0,
  silverPricePerGram: 0,
  debts: 0,
});

/**
 * Zakat al-Maal : 2,5 % du patrimoine net s'il atteint le nisab (85 g d'or ou 595 g d'argent)
 * et a été détenu pendant une année lunaire. La condition de l'année n'est pas vérifiable ici.
 */
export function zakatMaal(input: MaalInput, basis: NisabBasis = 'gold'): MaalResult {
  const metals = input.goldGrams * input.goldPricePerGram + input.silverGrams * input.silverPricePerGram;
  const assets = input.cash + input.savings + input.investments + input.tradeGoods + input.receivables + metals;
  const net = Math.max(0, assets - input.debts);

  const price = basis === 'gold' ? input.goldPricePerGram : input.silverPricePerGram;
  const grams = basis === 'gold' ? GOLD_NISAB_GRAMS : SILVER_NISAB_GRAMS;
  const nisabKnown = price > 0;
  const nisab = nisabKnown ? grams * price : 0;
  const nisabReached = nisabKnown && net >= nisab;

  return {
    assets: round2(assets),
    debts: round2(input.debts),
    net: round2(net),
    nisab: round2(nisab),
    nisabKnown,
    nisabReached,
    due: nisabReached ? round2(net * ZAKAT_RATE) : 0,
  };
}

export interface FitrResult {
  perPerson: number;
  total: number;
  totalKg: number;
}

/** Zakat al-Fitr : un sa' de denrée de base par personne à charge (soi-même, enfants, etc.). */
export function zakatFitr(persons: number, kgPerPerson: number, pricePerKg: number): FitrResult {
  const count = Math.max(0, Math.floor(persons));
  const perPerson = round2(kgPerPerson * pricePerKg);
  return { perPerson, total: round2(perPerson * count), totalKg: round2(kgPerPerson * count) };
}
