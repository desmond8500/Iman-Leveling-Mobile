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
