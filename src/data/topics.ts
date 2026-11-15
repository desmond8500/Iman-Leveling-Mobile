/*
 * Rubriques de culture islamique : un titre, une introduction, une liste d'éléments et la source
 * du texte. Contenu volontairement court et sourcé ; à faire relire par une personne qualifiée
 * avant toute diffusion large.
 */

export interface TopicItem {
  title: string;
  arabic?: string;
  text: string;
  /** Page de l'application liée à cet élément (ex. « /tabs/prayer »). */
  href?: string;
  linkLabel?: string;
}

export interface Topic {
  id: string;
  title: string;
  subtitle: string;
  intro: string;
  /** Référence du texte sur lequel s'appuie la rubrique. */
  source: string;
  items: TopicItem[];
  note?: string;
}

export const TOPICS: Topic[] = [
  {
    id: 'piliers-islam',
    title: "Piliers de l'islam",
    subtitle: 'Les cinq bases de la pratique',
    intro:
      "Le Prophète ﷺ a dit : « L'islam est bâti sur cinq (piliers) : témoigner qu'il n'y a de divinité digne d'adoration qu'Allah et que Muhammad est le messager d'Allah, accomplir la prière, s'acquitter de la zakat, faire le pèlerinage à la Maison et jeûner le Ramadan. »",
    source: "Hadith d'Ibn ʿUmar, rapporté par al-Bukhari (8) et Muslim (16)",
    items: [
      {
        title: 'La profession de foi',
        arabic: 'الشهادتان',
        text: "Témoigner qu'il n'y a de divinité digne d'adoration qu'Allah et que Muhammad est Son messager. C'est l'entrée en islam et la base de tout le reste.",
      },
      {
        title: 'La prière',
        arabic: 'الصلاة',
        text: 'Les cinq prières quotidiennes : Fajr, Dhuhr, Asr, Maghrib et Isha, à leur heure.',
        href: '/tabs/prayer',
        linkLabel: 'Voir la page Prière',
      },
      {
        title: 'La zakat',
        arabic: 'الزكاة',
        text: "L'aumône obligatoire que doit verser le musulman dont les biens atteignent le seuil (nisab), au profit des catégories de bénéficiaires citées dans le Coran (9:60).",
        href: '/tabs/zakat',
        linkLabel: 'Voir la page Zakat',
      },
      {
        title: 'Le jeûne du Ramadan',
        arabic: 'صوم رمضان',
        text: "S'abstenir de manger, de boire et des rapports conjugaux de l'aube au coucher du soleil durant le mois de Ramadan (Coran 2:183-185).",
        href: '/tabs/ramadan',
        linkLabel: 'Voir la page Ramadan',
      },
      {
        title: 'Le pèlerinage',
        arabic: 'الحج',
        text: "Se rendre à la Maison sacrée de La Mecque, une fois dans sa vie, pour celui qui en a la capacité (Coran 3:97).",
      },
    ],
  },
  {
    id: 'piliers-foi',
    title: 'Piliers de la foi',
    subtitle: 'Les six articles de la croyance',
    intro:
      "À l'ange Jibril qui l'interrogeait sur la foi (iman), le Prophète ﷺ a répondu : « C'est que tu croies en Allah, en Ses anges, en Ses livres, en Ses messagers, au Jour dernier, et que tu croies au destin, bon ou mauvais. »",
    source: 'Hadith de ʿUmar ibn al-Khattab, rapporté par Muslim (8)',
    items: [
      {
        title: 'Croire en Allah',
        arabic: 'الإيمان بالله',
        text: "Croire qu'Allah existe, qu'Il est le Seigneur et le Créateur de toute chose, qu'Il est seul digne d'adoration et qu'Il possède les plus beaux noms et les attributs les plus parfaits.",
        href: '/tabs/names',
        linkLabel: "Voir les noms d'Allah",
      },
      {
        title: 'Croire aux anges',
        arabic: 'الإيمان بالملائكة',
        text: "Les anges sont des créatures honorées, créées de lumière, qui obéissent à Allah et exécutent ce qu'Il leur ordonne (Coran 66:6). Parmi eux, Jibril chargé de la révélation.",
      },
      {
        title: 'Croire aux livres',
        arabic: 'الإيمان بالكتب',
        text: "Croire aux livres qu'Allah a révélés à Ses messagers, dont la Torah, l'Évangile, les Psaumes et les feuillets d'Ibrahim, et au Coran, dernier livre révélé, qui est préservé (Coran 15:9).",
        href: '/tabs/quran',
        linkLabel: 'Voir le Coran',
      },
      {
        title: 'Croire aux messagers',
        arabic: 'الإيمان بالرسل',
        text: "Croire à tous les prophètes et messagers envoyés par Allah, sans les distinguer (Coran 2:285), et que Muhammad ﷺ est le dernier d'entre eux (Coran 33:40).",
      },
      {
        title: 'Croire au Jour dernier',
        arabic: 'الإيمان باليوم الآخر',
        text: "Croire à la mort et à ce qui la suit, à la résurrection, au rassemblement, au jugement et à la rétribution, puis au Paradis et à l'Enfer.",
      },
      {
        title: 'Croire au destin',
        arabic: 'الإيمان بالقدر',
        text: "Croire qu'Allah sait toute chose, l'a consignée avant sa venue, qu'Elle n'advient que par Sa volonté et qu'Il en est le Créateur, tout en sachant que l'être humain choisit et répond de ses actes.",
      },
    ],
  },
  {
    id: 'portes-paradis',
    title: 'Portes du paradis',
    subtitle: 'Huit portes, dont ar-Rayyan',
    intro:
      "Allah dit au sujet des bienheureux : « Quand ils y arriveront, et que ses portes seront ouvertes… » (Coran 39:73). Le Prophète ﷺ a précisé que le Paradis a huit portes.",
    source: "Coran 39:73 ; hadith de Sahl ibn Saʿd (al-Bukhari 3257, Muslim 1152) ; hadith d'Abu Hurayra (al-Bukhari 1897, Muslim 1027)",
    items: [
      {
        title: 'Huit portes',
        text: "« Le Paradis a huit portes, et l'une d'elles s'appelle ar-Rayyan : seuls les jeûneurs y entreront. »",
      },
      {
        title: 'Ar-Rayyan, la porte des jeûneurs',
        arabic: 'الريان',
        text: "Réservée à ceux qui jeûnent. Une fois qu'ils sont entrés, elle est refermée et nul autre n'y passe.",
        href: '/tabs/ramadan',
        linkLabel: 'Voir la page Ramadan',
      },
      {
        title: 'La porte de la prière',
        text: "Le Prophète ﷺ a dit que celui qui était assidu dans la prière serait appelé par la porte de la prière.",
        href: '/tabs/prayer',
        linkLabel: 'Voir la page Prière',
      },
      {
        title: "La porte de l'aumône",
        text: "Celui qui était des gens de l'aumône (sadaqa) sera appelé par la porte de l'aumône.",
        href: '/tabs/zakat',
        linkLabel: 'Voir la page Zakat',
      },
      {
        title: 'La porte du jihad',
        text: "Celui qui s'est distingué dans l'effort et le combat dans le sentier d'Allah sera appelé par la porte du jihad.",
      },
    ],
    note: "Les textes authentiques ci-dessus ne nomment que ces quatre portes. D'autres noms circulent (pèlerinage, retenue de la colère, etc.) dans des récits dont l'authenticité varie : ils ne sont pas repris ici.",
  },
  {
    id: 'portes-enfer',
    title: "Portes de l'enfer",
    subtitle: 'Sept portes, noms cités dans le Coran',
    intro:
      "Allah dit : « La Géhenne sera leur lieu de rendez-vous à tous. Elle a sept portes, et chaque porte aura sa part d'entre eux. » (Coran 15:43-44)",
    source: 'Coran 15:43-44',
    items: [
      {
        title: 'Sept portes',
        text: "Le Coran indique que l'Enfer a sept portes. Aucun texte authentique n'en donne la liste ni l'ordre.",
      },
      {
        title: "Les noms de l'Enfer dans le Coran",
        text: "Le Coran désigne l'Enfer par plusieurs noms : Jahannam (la Géhenne), Laza (70:15), al-Hutama (104:4-5), Saʿir (67:5), Saqar (74:26-27), al-Jahim (2:119) et al-Hawiya (101:9-11). Certains savants les ont rapprochés des sept portes, mais ce rapprochement ne repose pas sur un texte authentique.",
      },
      {
        title: "Se protéger de l'Enfer",
        text: "Le Prophète ﷺ a dit : « Protégez-vous du Feu, ne serait-ce qu'avec une moitié de datte donnée en aumône. » Le rappel de l'Enfer invite à la prière, à l'aumône et au repentir.",
      },
    ],
    note: 'Référence du hadith : al-Bukhari 1417, Muslim 1016.',
  },
];

export const topicById = (id: string): Topic | undefined => TOPICS.find((t) => t.id === id);
