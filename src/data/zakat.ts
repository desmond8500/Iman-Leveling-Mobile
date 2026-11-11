/*
 * Repères sur la zakat. Contenu général ; les détails (bijoux, dettes, commerce, montant de la
 * zakat al-Fitr) varient selon les écoles et les pays. À faire relire par une personne qualifiée.
 */

export interface ZakatSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export const ZAKAT_SECTIONS: ZakatSection[] = [
  {
    id: 'definition',
    title: "Qu'est-ce que la zakat ?",
    paragraphs: [
      "La zakat est le troisième pilier de l'islam : une part obligatoire de certains biens, donnée à des bénéficiaires précis. Elle purifie les biens et soutient la communauté.",
      'Il existe deux zakats : la zakat al-Maal (sur le patrimoine) et la zakat al-Fitr (à la fin du Ramadan).',
    ],
  },
  {
    id: 'maal',
    title: 'Zakat al-Maal',
    paragraphs: [
      "Elle est due par celui dont le patrimoine net atteint le nisab (l'équivalent de 85 g d'or, ou 595 g d'argent selon la référence choisie) et qu'il détient depuis une année lunaire complète.",
      "Le taux est de 2,5 % du patrimoine : argent liquide, épargne, or et argent détenus, marchandises destinées au commerce, placements, créances dont le remboursement est attendu, moins les dettes à rembourser.",
      "Ne sont généralement pas comptés : la résidence principale, les vêtements, le véhicule et les objets d'usage personnel. Pour les bijoux portés, les écoles divergent.",
    ],
  },
  {
    id: 'fitr',
    title: 'Zakat al-Fitr',
    paragraphs: [
      "Elle est due par chaque musulman pour lui-même et pour les personnes dont il a la charge, enfants compris, à la fin du Ramadan : un sa' (environ 2 à 3 kg) de la denrée de base du pays, ou sa valeur selon l'avis suivi.",
      "Elle se donne avant la prière de l'Aïd. On peut la verser un ou deux jours avant l'Aïd.",
    ],
  },
  {
    id: 'beneficiaires',
    title: 'Qui peut la recevoir ?',
    paragraphs: [
      "Le Coran (9:60) cite huit catégories : les pauvres (fuqara'), les indigents (masakin), ceux qui œuvrent à la collecte et à la distribution, ceux dont on cherche à rapprocher les cœurs, l'affranchissement des captifs, les endettés, ceux qui œuvrent dans la voie d'Allah, et le voyageur en difficulté.",
    ],
  },
];
