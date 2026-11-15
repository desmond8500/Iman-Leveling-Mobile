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
];

export const topicById = (id: string): Topic | undefined => TOPICS.find((t) => t.id === id);
