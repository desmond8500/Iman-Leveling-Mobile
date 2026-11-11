/*
 * Prières surérogatoires (nafila) proposées pour un jour de Ramadan. Contenu général :
 * le nombre de rak'ahs et certains détails varient selon les écoles ; à faire relire par
 * une personne qualifiée avant toute diffusion large.
 */

export interface NafilaPrayer {
  id: string;
  title: string;
  /** Nombre de rak'ahs, en texte libre (« 2 », « 8 ou 20 »). */
  rakaat: string;
  when: string;
  description: string;
  source?: string;
}

export const NAFILA_PRAYERS: NafilaPrayer[] = [
  {
    id: 'rawatib',
    title: 'Sunnas liées aux prières obligatoires',
    rakaat: '12',
    when: 'Autour des 5 prières',
    description:
      "2 avant Soubh, 4 avant Dhuhr et 2 après, 2 après Maghrib, 2 après Isha. Elles sont déjà dans la liste des prières de l'accueil.",
    source: 'Mouslim 728',
  },
  {
    id: 'tahiyyat',
    title: 'Salutation de la mosquée',
    rakaat: '2',
    when: 'En entrant à la mosquée, avant de s\'asseoir',
    description: 'Deux rak\'ahs avant de s\'asseoir dans la mosquée.',
    source: 'Al-Boukhari 444, Mouslim 714',
  },
  {
    id: 'duha',
    title: 'Prière de Duha (matinée)',
    rakaat: '2 à 8',
    when: "Environ 15 à 20 minutes après le lever du soleil, jusqu'avant le zénith",
    description: 'Deux rak\'ahs au minimum, par séries de deux.',
    source: 'Mouslim 720',
  },
  {
    id: 'wudu',
    title: 'Prière après les ablutions',
    rakaat: '2',
    when: 'Après avoir fait ses ablutions',
    description: 'Deux rak\'ahs après les ablutions.',
    source: 'Al-Boukhari 1149, Mouslim 2404',
  },
  {
    id: 'taraweeh',
    title: 'Tarawih (prière de nuit du Ramadan)',
    rakaat: '8 ou 20, puis le Witr',
    when: "Après Isha, jusqu'à l'aube",
    description:
      "Prière de nuit propre au Ramadan, accomplie par séries de deux rak'ahs, souvent à la mosquée en groupe. Le nombre de rak'ahs varie selon les écoles.",
    source: 'Al-Boukhari 37, Mouslim 759',
  },
  {
    id: 'witr',
    title: 'Witr',
    rakaat: '1 à 11 (nombre impair)',
    when: 'Après Isha et la prière de nuit, avant l\'aube',
    description: 'Dernière prière de la nuit, en nombre impair de rak\'ahs.',
    source: 'Al-Boukhari 998, Mouslim 749',
  },
  {
    id: 'tahajjud',
    title: 'Tahajjud (prière du dernier tiers de la nuit)',
    rakaat: '2 et plus, par séries de deux',
    when: 'Dans la nuit, de préférence le dernier tiers, avant le Soubh',
    description: 'Prière de nuit surérogatoire, de préférence après un moment de sommeil.',
    source: 'Coran 17:79',
  },
];

/** Invocation à multiplier dans les nuits impaires des dix derniers jours. */
export const QADR_DUA = {
  title: 'Invocation de la nuit du Destin',
  arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
  phonetic: "Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'anni.",
  french: "Ô Allah, Tu es Celui qui pardonne et Tu aimes le pardon : pardonne-moi.",
  source: 'At-Tirmidhi 3513, Ibn Majah 3850',
};
