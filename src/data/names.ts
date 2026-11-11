/*
 * Les 99 noms d'Allah (al-asma' al-husna), selon l'énumération transmise par At-Tirmidhi.
 * Les savants discutent de cette énumération elle-même, et certaines listes diffèrent légèrement.
 * Les sens et explications sont volontairement courts : à faire relire par une personne qualifiée
 * avant toute diffusion large.
 */

export interface AllahName {
  /** Numéro de 1 à 99. */
  n: number;
  arabic: string;
  /** Transcription en lettres latines. */
  translit: string;
  french: string;
  explanation: string;
  /** Numéro du nom à citer avec celui-ci (noms qui se complètent). */
  pair?: number;
}

/** [arabe, transcription, sens en français, explication, nom associé (numéro)] */
type Row = [string, string, string, string, number?];

const ROWS: Row[] = [
  ['الرَّحْمَٰنُ', 'Ar-Rahman', 'Le Tout Miséricordieux', "Celui dont la miséricorde est immense et embrasse toute la création."],
  ['الرَّحِيمُ', 'Ar-Rahim', 'Le Très Miséricordieux', "Celui dont la miséricorde est constante envers Ses serviteurs, en particulier les croyants. Il complète le sens d'Ar-Rahman."],
  ['الْمَلِكُ', 'Al-Malik', 'Le Souverain', "Celui à qui appartient toute royauté et qui dispose de toute chose comme Il le veut."],
  ['الْقُدُّوسُ', 'Al-Quddus', 'Le Saint', "Celui qui est exempt de tout défaut et de toute imperfection."],
  ['السَّلَامُ', 'As-Salam', 'La Paix', "Celui qui est exempt de tout défaut et de qui proviennent la paix et la sécurité."],
  ['الْمُؤْمِنُ', "Al-Mu'min", 'Celui qui accorde la sécurité', "Celui qui rassure Ses serviteurs et leur accorde la sécurité, et qui confirme la véracité de Ses messagers."],
  ['الْمُهَيْمِنُ', 'Al-Muhaymin', 'Le Protecteur, le Surveillant', "Celui qui veille sur toute chose et en a une connaissance complète."],
  ['الْعَزِيزُ', "Al-'Aziz", 'Le Puissant', "Celui dont la puissance est invincible et que rien ne peut vaincre."],
  ['الْجَبَّارُ', 'Al-Jabbar', 'Le Contraignant, Celui qui répare', "Celui dont la volonté s'impose à toute chose, et qui répare ce qui est brisé et comble les besoins de Ses serviteurs."],
  ['الْمُتَكَبِّرُ', 'Al-Mutakabbir', 'Le Grand en Sa majesté', "Celui à qui seul appartient la grandeur. Pour Allah, c'est une louange ; pour la créature, l'orgueil est un défaut."],
  ['الْخَالِقُ', 'Al-Khaliq', 'Le Créateur', "Celui qui crée toute chose et en détermine la mesure."],
  ['الْبَارِئُ', "Al-Bari'", "Celui qui donne l'existence", "Celui qui produit les créatures et les fait venir à l'existence."],
  ['الْمُصَوِّرُ', 'Al-Musawwir', 'Celui qui façonne', "Celui qui donne à chaque créature sa forme propre."],
  ['الْغَفَّارُ', 'Al-Ghaffar', 'Celui qui pardonne sans cesse', "Celui qui couvre et pardonne les péchés, encore et encore."],
  ['الْقَهَّارُ', 'Al-Qahhar', 'Le Dominateur', "Celui qui domine toute chose et à qui toute chose se soumet."],
  ['الْوَهَّابُ', 'Al-Wahhab', 'Le Donateur', "Celui qui donne sans cesse et sans rien attendre en retour."],
  ['الرَّزَّاقُ', 'Ar-Razzaq', 'Le Pourvoyeur', "Celui qui donne à chaque créature sa subsistance."],
  ['الْفَتَّاحُ', 'Al-Fattah', 'Celui qui ouvre', "Celui qui ouvre les portes de la miséricorde et de la subsistance, et qui tranche entre Ses serviteurs avec justice."],
  ['الْعَلِيمُ', "Al-'Alim", "L'Omniscient", "Celui dont la science embrasse tout, le visible comme l'invisible."],
  ['الْقَابِضُ', 'Al-Qabid', 'Celui qui retient', "Celui qui resserre la subsistance ou reprend les âmes quand Il le veut, avec sagesse.", 21],
  ['الْبَاسِطُ', 'Al-Basit', 'Celui qui étend', "Celui qui élargit la subsistance et ouvre les cœurs, avec sagesse.", 20],
  ['الْخَافِضُ', 'Al-Khafid', 'Celui qui abaisse', "Celui qui abaisse qui Il veut selon Sa justice et Sa sagesse.", 23],
  ['الرَّافِعُ', "Ar-Rafi'", 'Celui qui élève', "Celui qui élève en rang qui Il veut, notamment les croyants.", 22],
  ['الْمُعِزُّ', "Al-Mu'izz", 'Celui qui donne la puissance', "Celui qui honore et fortifie qui Il veut.", 25],
  ['الْمُذِلُّ', 'Al-Mudhill', 'Celui qui humilie', "Celui qui abaisse qui Il veut, avec justice.", 24],
  ['السَّمِيعُ', "As-Sami'", "L'Audient", "Celui qui entend toute chose, les paroles comme les murmures."],
  ['الْبَصِيرُ', 'Al-Basir', 'Le Clairvoyant', "Celui qui voit toute chose, même la plus petite."],
  ['الْحَكَمُ', 'Al-Hakam', "L'Arbitre", "Celui dont le jugement est juste et sans appel."],
  ['الْعَدْلُ', "Al-'Adl", 'Le Juste', "Celui qui est parfaitement équitable et ne commet aucune injustice."],
  ['اللَّطِيفُ', 'Al-Latif', 'Le Subtil, le Bienveillant', "Celui qui connaît les moindres détails et agit envers Ses serviteurs avec douceur et bonté."],
  ['الْخَبِيرُ', 'Al-Khabir', 'Le Parfaitement Informé', "Celui qui connaît le fond des choses, y compris ce qui est caché."],
  ['الْحَلِيمُ', 'Al-Halim', 'Le Longanime', "Celui qui ne se hâte pas de punir et laisse le temps de se repentir."],
  ['الْعَظِيمُ', "Al-'Adhim", "L'Immense", "Celui dont la grandeur est sans mesure."],
  ['الْغَفُورُ', 'Al-Ghafur', 'Le Pardonneur', "Celui qui pardonne abondamment et couvre les fautes."],
  ['الشَّكُورُ', 'Ash-Shakur', 'Le Très Reconnaissant', "Celui qui récompense généreusement le peu de bien accompli par Ses serviteurs."],
  ['الْعَلِيُّ', "Al-'Aliyy", 'Le Très Haut', "Celui qui est au-dessus de toute chose par Son rang, Sa puissance et Sa majesté."],
  ['الْكَبِيرُ', 'Al-Kabir', 'Le Très Grand', "Celui dont la grandeur dépasse toute chose."],
  ['الْحَفِيظُ', 'Al-Hafidh', 'Le Gardien', "Celui qui préserve toute chose et protège Ses serviteurs."],
  ['الْمُقِيتُ', 'Al-Muqit', 'Celui qui pourvoit à la subsistance', "Celui qui donne à chaque être ce qui lui est nécessaire pour subsister."],
  ['الْحَسِيبُ', 'Al-Hasib', 'Celui qui suffit', "Celui qui suffit à Ses serviteurs et tient le compte exact de toute chose."],
  ['الْجَلِيلُ', 'Al-Jalil', 'Le Majestueux', "Celui qui possède tous les attributs de majesté et de perfection."],
  ['الْكَرِيمُ', 'Al-Karim', 'Le Généreux', "Celui dont la générosité est sans limite."],
  ['الرَّقِيبُ', 'Ar-Raqib', 'Le Vigilant', "Celui qui observe toute chose et à qui rien n'échappe."],
  ['الْمُجِيبُ', 'Al-Mujib', 'Celui qui exauce', "Celui qui répond à l'appel de celui qui L'invoque."],
  ['الْوَاسِعُ', "Al-Wasi'", 'Le Vaste', "Celui dont la science, la miséricorde et les dons embrassent toute chose."],
  ['الْحَكِيمُ', 'Al-Hakim', 'Le Sage', "Celui dont les décisions et les créations sont parfaitement sages."],
  ['الْوَدُودُ', 'Al-Wadud', 'Le Très Affectueux', "Celui qui aime Ses serviteurs pieux et qui est aimé d'eux."],
  ['الْمَجِيدُ', 'Al-Majid', 'Le Glorieux', "Celui dont la gloire et la générosité sont immenses."],
  ['الْبَاعِثُ', "Al-Ba'ith", 'Celui qui ressuscite', "Celui qui ressuscitera les morts au Jour du Jugement."],
  ['الشَّهِيدُ', 'Ash-Shahid', 'Le Témoin', "Celui qui assiste à toute chose et en est le témoin."],
  ['الْحَقُّ', 'Al-Haqq', 'La Vérité', "Celui dont l'existence est certaine et dont la parole est vraie."],
  ['الْوَكِيلُ', 'Al-Wakil', 'Le Garant', "Celui à qui l'on confie ses affaires et qui y pourvoit parfaitement."],
  ['الْقَوِيُّ', 'Al-Qawiyy', 'Le Fort', "Celui dont la force est parfaite et ne diminue jamais."],
  ['الْمَتِينُ', 'Al-Matin', "L'Inébranlable", "Celui dont la puissance est ferme et ne faiblit jamais."],
  ['الْوَلِيُّ', 'Al-Waliyy', 'Le Protecteur', "Celui qui prend en charge, aide et soutient les croyants."],
  ['الْحَمِيدُ', 'Al-Hamid', 'Le Digne de louange', "Celui qui mérite toute louange pour Ses attributs et Ses actes."],
  ['الْمُحْصِي', 'Al-Muhsi', 'Celui qui dénombre', "Celui qui connaît le nombre de toute chose et n'en oublie aucune."],
  ['الْمُبْدِئُ', "Al-Mubdi'", 'Celui qui commence', "Celui qui a initié la création sans modèle préalable.", 59],
  ['الْمُعِيدُ', "Al-Mu'id", 'Celui qui recommence', "Celui qui ramènera les créatures à la vie après la mort.", 58],
  ['الْمُحْيِي', 'Al-Muhyi', 'Celui qui donne la vie', "Celui qui donne la vie aux êtres, et aux cœurs.", 61],
  ['الْمُمِيتُ', 'Al-Mumit', 'Celui qui donne la mort', "Celui qui décide de la fin de chaque vie.", 60],
  ['الْحَيُّ', 'Al-Hayy', 'Le Vivant', "Celui dont la vie est parfaite, sans commencement ni fin."],
  ['الْقَيُّومُ', 'Al-Qayyum', 'Celui qui subsiste par Lui-même', "Celui qui n'a besoin de personne et par qui tout subsiste."],
  ['الْوَاجِدُ', 'Al-Wajid', 'Celui qui trouve', "Celui à qui rien ne manque et à qui rien n'échappe."],
  ['الْمَاجِدُ', 'Al-Majid', 'Le Noble', "Celui dont la noblesse et la gloire sont parfaites. Ce nom, proche d'Al-Majid (n° 48), figure dans certaines listes."],
  ['الْوَاحِدُ', 'Al-Wahid', "L'Unique", "Celui qui est un en Son essence, Ses attributs et Ses actes, sans associé."],
  ['الْأَحَدُ', 'Al-Ahad', "L'Un", "Celui qui est unique, sans pareil ni égal."],
  ['الصَّمَدُ', 'As-Samad', 'Le Soutien universel', "Celui vers qui tous se tournent pour leurs besoins, et qui n'a besoin de personne."],
  ['الْقَادِرُ', 'Al-Qadir', 'Le Capable', "Celui qui a pouvoir sur toute chose."],
  ['الْمُقْتَدِرُ', 'Al-Muqtadir', 'Le Tout-Puissant', "Celui dont le pouvoir s'exerce pleinement sur toute chose."],
  ['الْمُقَدِّمُ', 'Al-Muqaddim', 'Celui qui avance', "Celui qui fait avancer qui Il veut, selon Sa sagesse.", 72],
  ['الْمُؤَخِّرُ', "Al-Mu'akhkhir", 'Celui qui retarde', "Celui qui retarde qui Il veut, selon Sa sagesse.", 71],
  ['الْأَوَّلُ', 'Al-Awwal', 'Le Premier', "Celui qui n'a pas de commencement et avant qui il n'y a rien.", 74],
  ['الْآخِرُ', 'Al-Akhir', 'Le Dernier', "Celui qui demeure sans fin et après qui il n'y a rien.", 73],
  ['الظَّاهِرُ', 'Adh-Dhahir', "L'Apparent", "Celui au-dessus de qui il n'y a rien : Sa suprématie est manifeste.", 76],
  ['الْبَاطِنُ', 'Al-Batin', 'Le Caché', "Celui en deçà de qui il n'y a rien : Il connaît tout ce qui est caché.", 75],
  ['الْوَالِي', 'Al-Wali', 'Le Maître', "Celui qui administre et dirige les affaires de toute la création."],
  ['الْمُتَعَالِي', "Al-Muta'ali", 'Le Très Élevé', "Celui qui est exalté au-dessus de toute imperfection et de toute comparaison."],
  ['الْبَرُّ', 'Al-Barr', 'Le Bienfaiteur', "Celui dont la bonté envers Ses serviteurs est immense."],
  ['التَّوَّابُ', 'At-Tawwab', 'Celui qui accepte le repentir', "Celui qui accueille le repentir de Ses serviteurs et leur permet de revenir à Lui."],
  ['الْمُنْتَقِمُ', 'Al-Muntaqim', 'Celui qui punit avec justice', "Celui qui sanctionne les injustes et les rebelles selon Sa justice."],
  ['الْعَفُوُّ', "Al-'Afuww", "L'Indulgent", "Celui qui efface les péchés et en supprime la trace."],
  ['الرَّؤُوفُ', "Ar-Ra'uf", 'Le Compatissant', "Celui dont la bonté et la tendresse envers Ses serviteurs sont extrêmes."],
  ['مَالِكُ الْمُلْكِ', 'Malik-ul-Mulk', 'Le Maître de la royauté', "Celui qui possède toute royauté et la donne à qui Il veut."],
  ['ذُو الْجَلَالِ وَالْإِكْرَامِ', 'Dhul-Jalali wal-Ikram', 'Le Détenteur de la Majesté et de la Générosité', "Celui qui réunit la majesté et la générosité."],
  ['الْمُقْسِطُ', 'Al-Muqsit', "L'Équitable", "Celui qui rend justice et rétablit le droit de chacun."],
  ['الْجَامِعُ', "Al-Jami'", 'Celui qui rassemble', "Celui qui rassemblera les créatures au Jour de la Résurrection."],
  ['الْغَنِيُّ', 'Al-Ghaniyy', 'Le Riche par Lui-même', "Celui qui n'a besoin de rien ni de personne."],
  ['الْمُغْنِي', 'Al-Mughni', 'Celui qui enrichit', "Celui qui comble Ses serviteurs de Ses bienfaits et pourvoit à leurs besoins."],
  ['الْمَانِعُ', "Al-Mani'", 'Celui qui empêche', "Celui qui retient ou écarte ce qu'Il veut, avec sagesse."],
  ['الضَّارُّ', 'Ad-Darr', 'Celui qui peut nuire', "Celui qui détient le pouvoir d'éprouver comme de faire du bien : rien n'arrive sans Sa permission.", 92],
  ['النَّافِعُ', "An-Nafi'", 'Celui qui avantage', "Celui qui accorde le bien et le profit.", 91],
  ['النُّورُ', 'An-Nur', 'La Lumière', "Celui qui éclaire les cieux, la terre et les cœurs des croyants."],
  ['الْهَادِي', 'Al-Hadi', 'Le Guide', "Celui qui guide Ses serviteurs vers la vérité et vers ce qui leur est utile."],
  ['الْبَدِيعُ', "Al-Badi'", "L'Incomparable créateur", "Celui qui a créé sans modèle préalable, de façon admirable."],
  ['الْبَاقِي', 'Al-Baqi', 'Celui qui demeure', "Celui dont l'existence n'a pas de fin."],
  ['الْوَارِثُ', 'Al-Warith', "L'Héritier", "Celui qui subsiste lorsque tout disparaît et à qui tout revient."],
  ['الرَّشِيدُ', 'Ar-Rashid', 'Celui qui guide vers la droiture', "Celui dont les décisions sont parfaitement droites et qui oriente vers le bien."],
  ['الصَّبُورُ', 'As-Sabur', 'Le Patient', "Celui qui ne se hâte pas de punir et laisse du délai aux pécheurs."],
];

export const NAMES: AllahName[] = ROWS.map(([arabic, translit, french, explanation, pair], i) => ({
  n: i + 1,
  arabic,
  translit,
  french,
  explanation,
  ...(pair ? { pair } : {}),
}));

export const nameByNumber = (n: number): AllahName | undefined => NAMES[n - 1];

/** Verset qui invite à invoquer Allah par Ses plus beaux noms (Coran 7:180). */
export const NAMES_VERSE = {
  reference: 'Coran 7:180',
  arabic: 'وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا',
  french: "C'est à Allah qu'appartiennent les plus beaux noms. Invoquez-Le par ceux-ci.",
};

/** Recherche sans accents ni majuscules dans le numéro, la transcription, l'arabe et le sens. */
export function searchNames(query: string): AllahName[] {
  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/['’-]/g, '')
      .toLowerCase();
  const q = norm(query.trim());
  if (!q) return NAMES;
  return NAMES.filter((name) =>
    [String(name.n), name.translit, name.french, name.arabic].some((field) => norm(field).includes(q)),
  );
}
