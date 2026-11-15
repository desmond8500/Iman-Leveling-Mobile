import { emptyHeirs, sanitizeHeirs, type EstateInput, type Heirs } from './inheritance';
import { parseAmount } from './zakat';

export interface AssetRow {
  label: string;
  /** Valeur saisie en texte (« 12 000,50 »). */
  value: string;
}

export interface EstateForm {
  heirs: Heirs;
  assets: AssetRow[];
  debts: string;
  funeral: string;
  bequest: string;
  currency: string;
}

export const MAX_ASSETS = 50;

export const emptyEstateForm = (): EstateForm => ({
  heirs: emptyHeirs(),
  assets: [{ label: '', value: '' }],
  debts: '',
  funeral: '',
  bequest: '',
  currency: '',
});

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

/** Formulaire relu du stockage : textes courts, nombre de biens limité. */
export function sanitizeEstateForm(value: unknown): EstateForm {
  const v = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>;
  const assets = Array.isArray(v.assets)
    ? (v.assets as Record<string, unknown>[])
        .filter((a) => typeof a === 'object' && a !== null)
        .slice(0, MAX_ASSETS)
        .map((a) => ({ label: text(a.label, 60), value: text(a.value, 24) }))
    : [];
  return {
    heirs: sanitizeHeirs(v.heirs),
    assets: assets.length ? assets : [{ label: '', value: '' }],
    debts: text(v.debts, 24),
    funeral: text(v.funeral, 24),
    bequest: text(v.bequest, 24),
    currency: text(v.currency, 8),
  };
}

export function estateInputFromForm(form: EstateForm): EstateInput {
  return {
    assets: form.assets.map((a) => ({ label: a.label, value: parseAmount(a.value) })),
    debts: parseAmount(form.debts),
    funeral: parseAmount(form.funeral),
    bequest: parseAmount(form.bequest),
  };
}
