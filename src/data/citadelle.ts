/*
 * « Hisn al-Muslim » (La Citadelle du musulman) : sélection d'invocations du quotidien, classées
 * par situation. Ce n'est PAS le recueil complet : il compte plus de 250 invocations, à ajouter
 * progressivement. Textes issus des recueils classiques ; à faire relire par une personne
 * qualifiée (voyelles, traduction, authenticité) avant toute diffusion large.
 */

export interface CitadelleDua {
  id: string;
  title: string;
  arabic: string;
  phonetic: string;
  french: string;
  source: string;
  /** Nombre de récitations recommandé, s'il y en a un. */
  count?: number;
}

export interface CitadelleCategory {
  id: string;
  title: string;
  duas: CitadelleDua[];
}

export const CITADELLE: CitadelleCategory[] = [
  {
    id: 'sommeil',
    title: 'Sommeil et réveil',
    duas: [
      {
        id: 'amana-rassoul',
        title: 'Amana Rassoul (Coran 2:285-286)',
        arabic:
          'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
        phonetic:
          "Amanar-rasulu bima unzila ilayhi min Rabbihi wal-mu'minun. Kullun amana billahi wa mala'ikatihi wa kutubihi wa rusulih, la nufarriqu bayna ahadin min rusulih. Wa qalu sami'na wa ata'na, ghufranaka Rabbana wa ilaykal-masir. La yukallifullahu nafsan illa wus'aha, laha ma kasabat wa 'alayha maktasabat. Rabbana la tu'akhidhna in nasina aw akhta'na. Rabbana wa la tahmil 'alayna isran kama hamaltahu 'alal-ladhina min qablina. Rabbana wa la tuhammilna ma la taqata lana bih. Wa'fu 'anna, waghfir lana, warhamna. Anta mawlana fansurna 'alal-qawmil-kafirin.",
        french:
          "Le Messager a cru en ce qui lui a été révélé de la part de son Seigneur, et les croyants aussi. Tous ont cru en Allah, en Ses anges, en Ses livres et en Ses messagers : « Nous ne faisons aucune distinction entre Ses messagers. » Et ils ont dit : « Nous avons entendu et nous avons obéi. Pardonne-nous, notre Seigneur, et c'est vers Toi que sera le retour. » Allah n'impose à aucune âme une charge supérieure à sa capacité : elle aura ce qu'elle a acquis et subira ce qu'elle a acquis. « Notre Seigneur, ne nous châtie pas si nous oublions ou commettons une erreur. Notre Seigneur, ne nous charge pas d'un fardeau comme Tu en as chargé ceux qui nous ont précédés. Notre Seigneur, ne nous impose pas ce que nous ne pouvons supporter. Efface nos fautes, pardonne-nous et fais-nous miséricorde. Tu es notre Maître : donne-nous la victoire sur le peuple des mécréants. » (traduction du sens)",
        source: "Coran 2:285-286 ; Al-Boukhari 5009, Mouslim 807 (celui qui les récite la nuit, elles lui suffiront)",
        count: 1,
      },
      {
        id: 'avant-dormir',
        title: 'Avant de dormir',
        arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        phonetic: "Bismika Allahumma amutu wa ahya.",
        french: "C'est en Ton nom, ô Allah, que je meurs et que je vis.",
        source: 'Al-Boukhari 6324',
      },
      {
        id: 'au-reveil',
        title: 'Au réveil',
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        phonetic: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur.",
        french: "Louange à Allah qui nous a rendu la vie après nous avoir fait mourir, et c'est vers Lui que sera la résurrection.",
        source: 'Al-Boukhari 6312',
      },
    ],
  },
  {
    id: 'maison',
    title: 'Maison et déplacements',
    duas: [
      {
        id: 'sortir-maison',
        title: 'En sortant de la maison',
        arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
        phonetic: "Bismillah, tawakkaltu 'alallah, wa la hawla wa la quwwata illa billah.",
        french: "Au nom d'Allah, je m'en remets à Allah. Il n'y a de force ni de puissance qu'en Allah.",
        source: 'Abou Daoud 5095, At-Tirmidhi 3426',
      },
      {
        id: 'voyage',
        title: 'En montant dans un véhicule (voyage)',
        arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
        phonetic: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina lamunqalibun.",
        french: "Gloire à Celui qui nous a soumis cela alors que nous n'étions pas capables de le dominer, et c'est vers notre Seigneur que nous retournerons.",
        source: 'Coran 43:13-14 ; Mouslim 1342',
      },
    ],
  },
  {
    id: 'purete',
    title: 'Toilettes et mosquée',
    duas: [
      {
        id: 'toilettes-entrer',
        title: 'En entrant aux toilettes',
        arabic: 'بِسْمِ اللَّهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
        phonetic: "Bismillah. Allahumma inni a'udhu bika minal-khubuthi wal-khaba'ith.",
        french: "Au nom d'Allah. Ô Allah, je cherche refuge auprès de Toi contre les démons mâles et femelles.",
        source: 'Al-Boukhari 142 ; Mouslim 375',
      },
      {
        id: 'toilettes-sortir',
        title: 'En sortant des toilettes',
        arabic: 'غُفْرَانَكَ',
        phonetic: "Ghufranaka.",
        french: "Je Te demande pardon.",
        source: 'Abou Daoud 30, At-Tirmidhi 7',
      },
      {
        id: 'mosquee-entrer',
        title: 'En entrant à la mosquée',
        arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
        phonetic: "Allahummaf-tah li abwaba rahmatik.",
        french: "Ô Allah, ouvre-moi les portes de Ta miséricorde.",
        source: 'Mouslim 713',
      },
      {
        id: 'mosquee-sortir',
        title: 'En sortant de la mosquée',
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
        phonetic: "Allahumma inni as'aluka min fadlik.",
        french: "Ô Allah, je Te demande de Ta grâce.",
        source: 'Mouslim 713',
      },
    ],
  },
  {
    id: 'repas',
    title: 'Repas',
    duas: [
      {
        id: 'avant-repas',
        title: 'Avant de manger',
        arabic: 'بِسْمِ اللَّهِ',
        phonetic: "Bismillah.",
        french: "Au nom d'Allah.",
        source: 'Abou Daoud 3767, At-Tirmidhi 1858',
      },
      {
        id: 'apres-repas',
        title: 'Après avoir mangé',
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
        phonetic: "Alhamdu lillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah.",
        french: "Louange à Allah qui m'a nourri de cela et me l'a accordé sans force ni puissance de ma part.",
        source: 'Abou Daoud 4023, At-Tirmidhi 3458',
      },
    ],
  },
  {
    id: 'situations',
    title: 'Situations diverses',
    duas: [
      {
        id: 'eternuement',
        title: 'Après un éternuement',
        arabic: 'الْحَمْدُ لِلَّهِ',
        phonetic: "Alhamdulillah.",
        french: "Louange à Allah. (On répond à celui qui l'a dit : « Yarhamukallah », qu'Allah te fasse miséricorde.)",
        source: 'Al-Boukhari 6224',
      },
      {
        id: 'pluie',
        title: 'Quand il pleut',
        arabic: 'اللَّهُمَّ صَيِّبًا نَافِعًا',
        phonetic: "Allahumma sayyiban nafi'an.",
        french: "Ô Allah, fais-en une pluie bénéfique.",
        source: 'Al-Boukhari 1032',
      },
      {
        id: 'difficulte',
        title: 'Face à une difficulté',
        arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
        phonetic: "Hasbunallahu wa ni'mal-wakil.",
        french: "Allah nous suffit, et quel excellent garant !",
        source: 'Coran 3:173 ; Al-Boukhari 4563',
      },
      {
        id: 'ici-bas-au-dela',
        title: 'Le bien ici-bas et dans l\'au-delà',
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        phonetic: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
        french: "Notre Seigneur, accorde-nous une belle part ici-bas et une belle part dans l'au-delà, et protège-nous du châtiment du Feu.",
        source: 'Coran 2:201 ; Al-Boukhari 4522',
      },
    ],
  },
];

export const CITADELLE_COUNT = CITADELLE.reduce((n, c) => n + c.duas.length, 0);

/** Simplifie un texte pour la recherche : sans accents, voyelles arabes, apostrophes ni tirets. */
export function foldForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ًͯ-ٰٟـ]/g, '') // accents latins, voyelles arabes, tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .replace(/['’`\-\s]+/g, ' ')
    .trim();
}

/**
 * Filtre la Citadelle : garde les invocations dont le titre, le texte (arabe, phonétique,
 * français), la source ou la catégorie contient tous les mots recherchés. Catégories vides retirées.
 */
export function searchCitadelle(query: string, categories: CitadelleCategory[] = CITADELLE): CitadelleCategory[] {
  const words = foldForSearch(query).split(' ').filter(Boolean);
  if (!words.length) return categories;
  return categories
    .map((cat) => ({
      ...cat,
      duas: cat.duas.filter((d) => {
        const haystack = foldForSearch(`${cat.title} ${d.title} ${d.arabic} ${d.phonetic} ${d.french} ${d.source}`);
        return words.every((w) => haystack.includes(w));
      }),
    }))
    .filter((cat) => cat.duas.length > 0);
}
