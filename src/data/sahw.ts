/*
 * Sujûd as-sahw (prosternations de l'oubli) et correction de la prière.
 * Contenu tiré des hadiths authentiques (Bukhari, Muslim) et des positions connues des quatre
 * écoles. Les détails varient selon les écoles : à vérifier auprès d'un imam ou d'un enseignant.
 */

export type SchoolId = 'maliki' | 'hanafi' | 'shafii' | 'hanbali';

export interface School {
  id: SchoolId;
  label: string;
  /** Règle générale de l'école, en une phrase. */
  rule: string;
}

export const SCHOOLS: School[] = [
  {
    id: 'maliki',
    label: 'Malikite',
    rule: "Avant le salam s'il manque quelque chose, après le salam s'il y a eu un ajout. Manque et ajout ensemble : avant le salam.",
  },
  {
    id: 'hanafi',
    label: 'Hanafite',
    rule: 'Toujours après le salam : un seul salam à droite, les deux prosternations, puis le tachahhoud et le salam final.',
  },
  {
    id: 'shafii',
    label: 'Chafiite',
    rule: 'Toujours avant le salam, après le tachahhoud final et la prière sur le Prophète ﷺ.',
  },
  {
    id: 'hanbali',
    label: 'Hanbalite',
    rule: "Avant le salam, sauf deux cas venus dans les hadiths : salam donné avant la fin de la prière, et doute tranché par l'avis le plus probable.",
  },
];

export const DEFAULT_SCHOOL: SchoolId = 'maliki';
export const isSchoolId = (v: unknown): v is SchoolId => SCHOOLS.some((s) => s.id === v);

/** Nature de l'erreur : elle décide du moment des prosternations. */
export type SahwKind =
  /** Il manque un acte (premier tachahhoud…). */
  | 'manque'
  /** Un acte a été ajouté par erreur (rak'ah, prosternation en trop…). */
  | 'ajout'
  /** Salam donné avant la fin, puis prière complétée. */
  | 'salam-tot'
  /** Doute sur le nombre de rak'ahs, sans penchant : on bâtit sur le plus petit nombre. */
  | 'doute-certitude'
  /** Doute avec un penchant net pour un nombre. */
  | 'doute-penchant'
  /** Pas de prosternation de l'oubli. */
  | 'aucune'
  /** La prière est à recommencer. */
  | 'recommencer';

export type SahwTiming = 'avant' | 'apres' | 'aucune' | 'recommencer';

/** Moment des deux prosternations selon l'école. */
export function sahwTiming(kind: SahwKind, school: SchoolId): SahwTiming {
  if (kind === 'aucune' || kind === 'recommencer') return kind;
  switch (school) {
    case 'hanafi':
      return 'apres';
    case 'shafii':
      return 'avant';
    case 'hanbali':
      return kind === 'salam-tot' || kind === 'doute-penchant' ? 'apres' : 'avant';
    case 'maliki':
      // Le doute laisse peut-être une rak'ah en trop : c'est un ajout possible.
      return kind === 'manque' ? 'avant' : 'apres';
  }
}

export interface SahwCase {
  id: string;
  title: string;
  /** Ce qui s'est passé, vu par la personne qui prie. */
  situation: string;
  kind: SahwKind;
  /** Que faire maintenant, étape par étape. */
  fix: string[];
  /** Précision propre à une école, si besoin. */
  schoolNotes?: Partial<Record<SchoolId, string>>;
  source: string;
}

export const SAHW_CASES: SahwCase[] = [
  {
    id: 'tachahhoud',
    title: 'Oubli du premier tachahhoud',
    situation: "Je me suis levé pour la 3e rak'ah sans m'asseoir pour le premier tachahhoud.",
    kind: 'manque',
    fix: [
      "Si tu ne t'es pas encore complètement redressé : rassieds-toi et fais le tachahhoud.",
      'Si tu es déjà debout : ne reviens pas en arrière, continue ta prière normalement.',
      'Fais les deux prosternations de l’oubli au moment indiqué.',
    ],
    source: "Bukhari 1224 et Muslim 570 (hadith d'Abdallah ibn Buhayna) ; Abou Daoud 1036 (al-Mughira)",
  },
  {
    id: 'ajout',
    title: "Rak'ah ou geste en trop",
    situation: "J'ai prié une rak'ah de plus, ou fait une inclinaison ou une prosternation en trop.",
    kind: 'ajout',
    fix: [
      "Si tu t'en rends compte pendant la rak'ah en trop : assieds-toi tout de suite, sans la terminer.",
      'Récite le tachahhoud final si ce n’est pas fait.',
      "Fais les deux prosternations de l'oubli au moment indiqué. Ta prière est valable.",
    ],
    source: "Bukhari 1226 et Muslim 572 (le Prophète ﷺ pria cinq rak'ahs au dhuhr)",
  },
  {
    id: 'salam-tot',
    title: 'Salam avant la fin',
    situation: "J'ai fait le salam après 2 ou 3 rak'ahs au lieu de 4 (ou 3).",
    kind: 'salam-tot',
    fix: [
      "Si peu de temps est passé : relève-toi avec l'intention de compléter, sans refaire le takbir d'ouverture.",
      "Prie les rak'ahs qui manquent, puis le tachahhoud final.",
      "Fais les deux prosternations de l'oubli au moment indiqué.",
      'Si beaucoup de temps est passé (ou si tu as quitté le lieu, mangé, parlé longuement) : recommence la prière.',
    ],
    source: 'Bukhari 1229 et Muslim 573 (hadith de Dhul-Yadayn)',
  },
  {
    id: 'doute-certitude',
    title: "Doute sur le nombre de rak'ahs",
    situation: "Je ne sais plus si j'ai prié 3 ou 4 rak'ahs, et aucun des deux ne me paraît plus probable.",
    kind: 'doute-certitude',
    schoolNotes: {
      hanafi: 'Pour les hanafites, un tout premier doute de ce genre fait recommencer la prière.',
    },
    fix: [
      'Écarte le doute et retiens le plus petit nombre, celui dont tu es sûr (ici 3).',
      'Complète la prière à partir de ce nombre.',
      "Fais les deux prosternations de l'oubli au moment indiqué.",
    ],
    source: "Muslim 571 (hadith d'Abou Sa'id al-Khudri)",
  },
  {
    id: 'doute-penchant',
    title: 'Doute avec un penchant',
    situation: "J'hésite sur le nombre de rak'ahs, mais l'un des deux me paraît nettement plus probable.",
    kind: 'doute-penchant',
    fix: [
      'Retiens le nombre qui te paraît le plus probable et termine la prière sur cette base.',
      "Fais les deux prosternations de l'oubli au moment indiqué.",
    ],
    schoolNotes: {
      maliki: 'Les malikites ne suivent pas le penchant : on retient toujours le plus petit nombre, comme pour le doute sans penchant.',
      hanafi: "Pour les hanafites, un tout premier doute de ce genre fait recommencer la prière ; ensuite on suit le penchant.",
    },
    source: "Bukhari 401 et Muslim 572 (hadith d'Ibn Mas'oud : « qu'il recherche ce qui est juste »)",
  },
  {
    id: 'pilier',
    title: "Oubli d'un pilier",
    situation: "J'ai oublié un pilier : une prosternation, l'inclinaison, ou la Fatiha d'une rak'ah.",
    kind: 'ajout',
    fix: [
      "Si tu n'as pas encore atteint le même pilier dans la rak'ah suivante : reviens le faire, puis reprends la suite.",
      "Sinon, la rak'ah incomplète ne compte pas : la suivante la remplace, et tu ajoutes une rak'ah à la fin.",
      "Si tu t'en rends compte peu après le salam : complète ce qui manque (souvent une rak'ah entière), puis le tachahhoud. Après un long moment, recommence la prière.",
      "Fais les deux prosternations de l'oubli au moment indiqué.",
    ],
    schoolNotes: {
      maliki: "Chez les malikites, on peut revenir au pilier oublié tant qu'on ne s'est pas relevé de l'inclinaison de la rak'ah suivante.",
    },
    source: "Règle commune des quatre écoles, fondée sur les hadiths de Dhul-Yadayn et d'Ibn Mas'oud",
  },
  {
    id: 'takbir',
    title: "Oubli du takbir d'ouverture",
    situation: "J'ai commencé la prière sans dire « Allahu akbar » au départ.",
    kind: 'recommencer',
    fix: [
      "Sans le takbir d'ouverture, la prière n'a pas commencé : la prosternation de l'oubli ne suffit pas.",
      "Recommence la prière depuis le début avec le takbir d'ouverture.",
    ],
    source: "Abou Daoud 61 et Tirmidhi 3 : « elle commence par le takbir et se termine par le salam »",
  },
  {
    id: 'doute-apres',
    title: 'Doute après la prière',
    situation: "J'ai un doute alors que la prière est déjà terminée, ou je doute très souvent.",
    kind: 'aucune',
    fix: [
      "Un doute qui arrive après la fin de la prière ne compte pas : ta prière est valable.",
      "Si tu doutes presque à chaque prière, ne t'y arrête pas : c'est une suggestion à écarter (waswas).",
      "Seule une certitude d'erreur (« je sais que j'ai oublié ») demande une correction.",
    ],
    source: "Avis de la majorité des savants",
  },
];

export interface SahwStep {
  title: string;
  text: string;
}

/** Déroulé des deux prosternations, selon le moment. */
export function sahwSteps(timing: 'avant' | 'apres', school: SchoolId): SahwStep[] {
  const prostrations: SahwStep[] = [
    { title: 'Première prosternation', text: '« Allahu akbar », puis prosterne-toi en disant « Subhana Rabbiyal-A\'la », comme dans la prière.' },
    { title: 'Assise', text: "« Allahu akbar », assieds-toi un instant, comme entre deux prosternations." },
    { title: 'Deuxième prosternation', text: '« Allahu akbar », prosterne-toi une seconde fois de la même façon, puis « Allahu akbar » en te redressant.' },
  ];
  if (timing === 'avant') {
    const steps: SahwStep[] = [
      { title: 'Tachahhoud final', text: 'Termine la dernière assise : tachahhoud et prière sur le Prophète ﷺ.' },
      ...prostrations,
    ];
    if (school === 'maliki') steps.push({ title: 'Tachahhoud', text: 'Les malikites récitent de nouveau le tachahhoud.' });
    steps.push({ title: 'Salam', text: 'Termine la prière par le salam.' });
    return steps;
  }
  const first: SahwStep =
    school === 'hanafi'
      ? { title: 'Un salam', text: 'Après le tachahhoud final, fais un seul salam, à droite.' }
      : { title: 'Salam', text: 'Termine la prière par le salam habituel.' };
  const steps: SahwStep[] = [first, ...prostrations];
  if (school === 'maliki' || school === 'hanafi') {
    steps.push({ title: 'Tachahhoud', text: 'Assieds-toi et récite le tachahhoud (les hanafites y ajoutent la prière sur le Prophète ﷺ et une invocation).' });
  }
  steps.push({ title: 'Salam', text: 'Fais de nouveau le salam pour terminer.' });
  return steps;
}

/** Corriger l'imam et prier derrière lui. */
export const IMAM_RULES: SahwStep[] = [
  { title: "Alerter l'imam", text: "Si l'imam se trompe, les hommes disent « Subhanallah » et les femmes frappent le dos d'une main sur la paume de l'autre." },
  { title: "Suivre l'imam", text: "Quand l'imam fait les prosternations de l'oubli, tu les fais avec lui, même si tu n'as rien oublié." },
  { title: 'Ta propre erreur', text: "Derrière l'imam, une petite erreur de ta part (hors pilier) ne demande pas de prosternation selon la majorité : l'imam la porte." },
  { title: 'Retardataire', text: "Si tu es arrivé en retard, suis l'imam dans ses prosternations, puis complète ce qui te manque." },
];

export const IMAM_SOURCE = "Bukhari 1203-1204 et Muslim 422 : « Le Subhanallah est pour les hommes, le battement des mains pour les femmes »";

/** Points à retenir. */
export const SAHW_BASICS: string[] = [
  "Les prosternations de l'oubli sont deux prosternations, comme celles de la prière, qui réparent une erreur commise sans le vouloir.",
  "Elles réparent un manque, un ajout ou un doute. Elles ne remplacent pas un pilier oublié : il faut le refaire.",
  "On y dit la même formule que dans toute prosternation : « Subhana Rabbiyal-A'la » (Gloire à mon Seigneur le Très-Haut).",
  "Si plusieurs erreurs ont eu lieu dans la même prière, deux prosternations suffisent pour toutes.",
  "Elles concernent les erreurs commises par oubli. Laisser volontairement un acte de la prière est un autre cas, à voir avec un imam.",
];
