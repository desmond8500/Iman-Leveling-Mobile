import type { PrayerId } from '@/types';

/*
 * Repères pratiques sur la prière. Contenu général et consensuel : les détails (gestes, textes à
 * réciter, cas particuliers) varient selon les écoles ; à compléter auprès d'un imam ou d'un
 * enseignant qualifié.
 */

/** Nombre de rak'ahs de la prière obligatoire (fard). */
export const FARD_RAKAAT: Record<PrayerId, number> = {
  fajr: 2,
  dhuhr: 4,
  asr: 4,
  maghrib: 3,
  isha: 4,
};

export interface GuideStep {
  title: string;
  text: string;
}

export const WUDU_STEPS: GuideStep[] = [
  { title: 'Intention et Bismillah', text: "Avoir l'intention de faire les ablutions, puis dire « Bismillah »." },
  { title: 'Les mains', text: 'Laver les deux mains jusqu\'aux poignets, 3 fois.' },
  { title: 'La bouche', text: "Se rincer la bouche, 3 fois." },
  { title: 'Le nez', text: "Aspirer de l'eau dans le nez puis la rejeter, 3 fois." },
  { title: 'Le visage', text: 'Laver tout le visage, du front au menton et d\'une oreille à l\'autre, 3 fois.' },
  { title: 'Les bras', text: "Laver les bras jusqu'aux coudes inclus, le droit d'abord, 3 fois chacun." },
  { title: 'La tête et les oreilles', text: 'Passer les mains mouillées sur la tête, puis sur les oreilles, une fois.' },
  { title: 'Les pieds', text: "Laver les pieds jusqu'aux chevilles incluses, le droit d'abord, 3 fois chacun." },
];

export const PRAYER_STEPS: GuideStep[] = [
  { title: 'Se préparer', text: 'Être en état de pureté, vêtu correctement, face à la qibla, avec l\'intention de la prière.' },
  { title: "Takbir d'ouverture", text: 'Lever les mains et dire « Allahu akbar ».' },
  { title: 'Récitation', text: "Réciter Al-Fatiha, puis une sourate aux deux premières rak'ahs." },
  { title: "Rukû' (inclinaison)", text: 'S\'incliner en disant « Subhana Rabbiyal-\'Adhim ».' },
  { title: 'Se redresser', text: 'Dire « Sami\'a Allahu liman hamidah », puis « Rabbana wa lakal-hamd ».' },
  { title: 'Sujûd (prosternation)', text: 'Se prosterner en disant « Subhana Rabbiyal-A\'la », s\'asseoir un instant, puis se prosterner une seconde fois.' },
  { title: 'Enchaîner les rak\'ahs', text: "Se relever pour la rak'ah suivante. Le tachahhoud se récite à la deuxième rak'ah et à la dernière." },
  { title: 'Taslim', text: 'Terminer en saluant à droite puis à gauche : « As-salamu \'alaykum wa rahmatullah ».' },
];

export interface GuideInvocation {
  id: string;
  title: string;
  /** Quand la réciter. */
  when: string;
  count: number;
  source: string;
  arabic: string;
  phonetic: string;
  french: string;
}

/*
 * Invocations liées à la prière. Textes issus des recueils classiques (Hisn al-Muslim, Sahih
 * Muslim). À faire relire par une personne qualifiée avant toute diffusion large.
 */
export const WUDU_INVOCATIONS: GuideInvocation[] = [
  {
    id: 'wudu-before',
    title: 'Avant les ablutions',
    when: 'En commençant les ablutions',
    count: 1,
    source: 'Abou Daoud',
    arabic: 'بِسْمِ اللَّهِ',
    phonetic: 'Bismillah.',
    french: "Au nom d'Allah.",
  },
  {
    id: 'wudu-after',
    title: 'Après les ablutions',
    when: 'Une fois les ablutions terminées',
    count: 1,
    source: 'Sahih Muslim 234',
    arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    phonetic: "Ash-hadu an la ilaha illallah, wahdahu la sharika lah, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh.",
    french: "J'atteste qu'il n'y a de divinité qu'Allah, seul, sans associé, et j'atteste que Muhammad est Son serviteur et Son messager.",
  },
];

export const AFTER_PRAYER_INVOCATIONS: GuideInvocation[] = [
  {
    id: 'after-istighfar',
    title: 'Demander pardon',
    when: 'Juste après le taslim',
    count: 3,
    source: 'Sahih Muslim 591',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    phonetic: 'Astaghfirullah.',
    french: "Je demande pardon à Allah.",
  },
  {
    id: 'after-salam',
    title: 'Allahumma anta as-salam',
    when: 'Après avoir demandé pardon',
    count: 1,
    source: 'Sahih Muslim 591',
    arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    phonetic: "Allahumma antas-salam, wa minkas-salam, tabarakta ya dhal-jalali wal-ikram.",
    french: "Ô Allah, Tu es la Paix et de Toi vient la paix. Béni sois-Tu, ô Détenteur de la majesté et de la générosité.",
  },
  {
    id: 'after-tasbih',
    title: 'Glorifier, louer, magnifier',
    when: 'Après la prière',
    count: 33,
    source: 'Sahih Muslim 595',
    arabic: 'سُبْحَانَ اللَّهِ ، الْحَمْدُ لِلَّهِ ، اللَّهُ أَكْبَرُ',
    phonetic: "Subhanallah, alhamdulillah, Allahu akbar.",
    french: "Gloire à Allah, louange à Allah, Allah est le plus grand. Chacune 33 fois.",
  },
  {
    id: 'after-tawhid',
    title: 'Complétion à cent',
    when: 'Pour compléter le décompte',
    count: 1,
    source: 'Sahih Muslim 597',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    phonetic: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir.",
    french: "Il n'y a de divinité qu'Allah, seul, sans associé. À Lui la royauté et la louange, et Il est capable de toute chose.",
  },
];
