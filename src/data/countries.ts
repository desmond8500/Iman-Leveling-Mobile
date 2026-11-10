/** Codes pays ISO 3166-1 alpha-2 (territoires inhabités exclus). */
export const COUNTRY_CODES: string[] = (
  'AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW ' +
  'BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ' +
  'ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL ' +
  'IM IN IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA ' +
  'MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU ' +
  'NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL ' +
  'SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE ' +
  'VG VI VN VU WF WS YE YT ZA ZM ZW'
).split(' ');

const CODE_SET = new Set(COUNTRY_CODES);

export const isCountryCode = (value: unknown): value is string =>
  typeof value === 'string' && CODE_SET.has(value);

/** Nom d'un pays dans la langue demandée ; à défaut, le code lui-même. */
export function countryName(code: string, locale = 'fr'): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

export interface CountryOption {
  code: string;
  name: string;
}

/** Tous les pays avec leur nom, triés par ordre alphabétique. */
export function countryOptions(locale = 'fr'): CountryOption[] {
  return COUNTRY_CODES.map((code) => ({ code, name: countryName(code, locale) })).sort((a, b) =>
    a.name.localeCompare(b.name, locale),
  );
}

/** Minuscules sans accents, pour la recherche. */
export const normalizeText = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
