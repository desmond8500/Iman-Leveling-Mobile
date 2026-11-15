/*
 * Événements de la vie musulmane : description du rituel, bonnes pratiques, invocations et sunnas.
 * Contenu général et sourcé (Coran, Bukhari, Muslim, Abu Dawud, Tirmidhi) ; les détails varient
 * selon les écoles juridiques et sont signalés comme tels. Les invocations arabes et leur
 * transcription sont à faire relire par une personne qualifiée avant toute diffusion large.
 */

export interface EventDua {
  title: string;
  arabic: string;
  translit?: string;
  french: string;
  source: string;
}

export interface EventSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  duas?: EventDua[];
}

export interface IslamicEvent {
  id: string;
  title: string;
  arabic?: string;
  subtitle: string;
  intro: string;
  /** Jour du calendrier hégirien, quand la date est fixe (ex. 1er Chawwal). */
  hijri?: { month: number; day: number; label: string };
  sections: EventSection[];
  note?: string;
}

const TAKBIR: EventDua = {
  title: "Le takbir de l'Aïd",
  arabic: 'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ، لَا إِلَٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ',
  translit: 'Allahu akbar, Allahu akbar, la ilaha illa Llah, wa Llahu akbar, Allahu akbar, wa li-Llahi l-hamd',
  french: "Allah est le plus grand, Allah est le plus grand, il n'y a de divinité qu'Allah ; Allah est le plus grand, Allah est le plus grand, et à Allah la louange.",
  source: 'Formule rapportée des compagnons (Ibn Abi Shayba)',
};

const CONGRATS: EventDua = {
  title: 'Se féliciter',
  arabic: 'تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ',
  translit: 'Taqabbala Llahu minna wa minkum',
  french: "Qu'Allah accepte de nous et de vous.",
  source: "Usage des compagnons, rapporté par Ibn Hajar (chaîne jugée bonne)",
};

export const EVENTS: IslamicEvent[] = [
  {
    id: 'aid-al-fitr',
    title: 'Aïd al-Fitr',
    arabic: 'عيد الفطر',
    subtitle: 'La fête de la rupture du jeûne',
    intro:
      "L'Aïd al-Fitr marque la fin du Ramadan, le 1er Chawwal. C'est un jour de remerciement et de joie : on ne jeûne pas ce jour-là, et le jeûne y est interdit.",
    hijri: { month: 10, day: 1, label: '1er Chawwal' },
    sections: [
      {
        title: 'Déroulement',
        bullets: [
          "Donner la zakat al-Fitr avant de partir à la prière (un sa' de denrée de base par personne, voir la page Zakat).",
          "Faire le ghusl, se parfumer (pour les hommes) et mettre ses plus beaux vêtements.",
          "Manger quelques dattes, en nombre impair, avant de partir à la prière (al-Bukhari 953).",
          "Aller à la prière en récitant le takbir, par un chemin, et revenir par un autre (al-Bukhari 986).",
          "Prière de l'Aïd : deux rakʿat en groupe, sans appel à la prière ni iqama, suivies d'un sermon (al-Bukhari 956, Muslim 884).",
          "Les femmes sont encouragées à y assister, y compris celles qui ne peuvent pas prier (al-Bukhari 324).",
        ],
      },
      {
        title: 'La prière de l\'Aïd',
        paragraphs: [
          "Elle se fait en deux rakʿat avec des takbirs supplémentaires. Les écoles divergent : sept takbirs au début de la première rakʿa et cinq dans la seconde (malikites, chafiites, hanbalites), ou trois dans chacune (hanafites). Le sermon vient après la prière.",
        ],
      },
      {
        title: 'Invocations',
        duas: [TAKBIR, CONGRATS],
      },
      {
        title: 'Bonnes pratiques',
        bullets: [
          "Rendre visite à ses proches, renouer les liens et réconcilier ceux qui sont brouillés.",
          "Partager le repas et faire preuve de générosité envers les pauvres.",
          "Se réjouir dans les limites permises (al-Bukhari 952).",
          "Ne pas jeûner ce jour (al-Bukhari 1990, Muslim 827). Il est cependant recommandé de jeûner six jours de Chawwal ensuite (Muslim 1164).",
        ],
      },
    ],
    note: "Le jour de l'Aïd dépend de l'observation de la lune : la date affichée est celle du calendrier et peut différer d'un jour.",
  },
  {
    id: 'aid-al-adha',
    title: 'Aïd al-Adha',
    arabic: 'عيد الأضحى',
    subtitle: 'La fête du sacrifice',
    intro:
      "L'Aïd al-Adha tombe le 10 Dhou al-hijja, en souvenir de la soumission d'Ibrahim (Abraham) et de son fils. Il clôt les dix premiers jours de Dhou al-hijja, parmi les plus beaux jours de l'année, et suit le jour de ʿArafa.",
    hijri: { month: 12, day: 10, label: '10 Dhou al-hijja' },
    sections: [
      {
        title: 'Avant la fête : les dix premiers jours',
        bullets: [
          "Multiplier les bonnes œuvres, le dhikr et le takbir : « Il n'est pas de jours où les bonnes œuvres soient plus aimées d'Allah que ces dix jours » (al-Bukhari 969).",
          "Jeûner, surtout le jour de ʿArafa (9 Dhou al-hijja) pour qui n'est pas en pèlerinage : il efface les péchés de l'année écoulée et de l'année suivante (Muslim 1162).",
          "Qui compte offrir un sacrifice évite de couper cheveux, poils et ongles à partir de l'entrée de Dhou al-hijja jusqu'au sacrifice (Muslim 1977).",
        ],
      },
      {
        title: 'Déroulement du jour de l\'Aïd',
        bullets: [
          "Ghusl, parfum (hommes) et beaux vêtements, comme pour l'Aïd al-Fitr.",
          "Ne pas manger avant la prière, et manger ensuite de la viande du sacrifice (at-Tirmidhi 542).",
          "Prière de l'Aïd en groupe (deux rakʿat) puis sermon.",
          "Sacrifice (oudhiyya) après la prière : un sacrifice fait avant n'est qu'une simple viande (al-Bukhari 5546). Il se fait pendant l'Aïd et les trois jours qui suivent.",
        ],
      },
      {
        title: 'Le sacrifice',
        paragraphs: [
          "Animal : ovin, caprin, bovin ou camélidé ayant l'âge requis, sans défaut apparent. Un ovin ou un caprin suffit pour une personne ; certains animaux peuvent être partagés selon l'avis suivi.",
          "On le dit au nom d'Allah en l'égorgeant, face à la qibla. La viande se partage traditionnellement en trois : une part pour la famille, une pour les proches et voisins, une pour les pauvres.",
          "L'avis sur le caractère obligatoire ou fortement recommandé du sacrifice varie selon les écoles.",
        ],
        duas: [
          {
            title: "En égorgeant",
            arabic: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ',
            translit: 'Bismi Llah, wa Llahu akbar',
            french: "Au nom d'Allah, et Allah est le plus grand.",
            source: 'Muslim 1966, al-Bukhari 5565',
          },
        ],
      },
      {
        title: 'Invocations',
        paragraphs: [
          "Le takbir se dit du début de Dhou al-hijja jusqu'à la fin des jours de tachriq (13 Dhou al-hijja), et après les prières obligatoires selon les avis.",
        ],
        duas: [TAKBIR, CONGRATS],
      },
      {
        title: 'Jours de tachriq',
        bullets: [
          "Les 11, 12 et 13 Dhou al-hijja sont des « jours de manger, de boire et de rappel d'Allah » (Muslim 1141).",
          "Le jeûne est interdit le jour de l'Aïd et pendant ces jours, sauf cas particuliers du pèlerin.",
        ],
      },
    ],
    note: "La date dépend de l'observation de la lune et du pèlerinage : celle du calendrier peut différer d'un jour.",
  },
  {
    id: 'mariage',
    title: 'Mariage',
    arabic: 'النكاح',
    subtitle: 'Le contrat, la walima et les invocations',
    intro:
      "Le mariage est une sunna des prophètes et un pacte solennel. Allah dit : « Parmi Ses signes, Il a créé de vous, pour vous, des épouses pour que vous trouviez auprès d'elles repos et tranquillité, et Il a mis entre vous affection et bonté. » (Coran 30:21)",
    sections: [
      {
        title: 'Avant le mariage',
        bullets: [
          "Choisir selon la religion et le bon caractère (al-Bukhari 5090, at-Tirmidhi 1084).",
          "Prier la prière d'istikhara pour demander à Allah de guider le choix (al-Bukhari 1162).",
          "Voir sa future épouse, et elle son futur époux, avant d'accepter (at-Tirmidhi 1087, Muslim 1424).",
          "Fiançailles (khitba) : elles ne sont pas le mariage ; les fiancés restent étrangers l'un à l'autre jusqu'au contrat.",
        ],
      },
      {
        title: 'Conditions du contrat',
        bullets: [
          "Le consentement de la mariée : on ne marie pas une femme sans son accord (al-Bukhari 5136).",
          "Le tuteur (wali) de la mariée, selon la majorité des écoles.",
          "Deux témoins ou l'annonce publique du mariage.",
          "La dot (mahr), qui revient à l'épouse (Coran 4:4). Elle peut être modeste : « Le meilleur mariage est le plus facile » (rapporté par Ahmad, authentifié).",
        ],
      },
      {
        title: 'Le jour du mariage',
        bullets: [
          "Prononcer le sermon du mariage (khutbat al-haja) et conclure le contrat devant témoins.",
          "Annoncer le mariage, avec le tambourin (daff) permis (at-Tirmidhi 1089).",
          "Offrir la walima, le repas de noces, même simple : « Fais une walima, ne serait-ce qu'avec un mouton » (al-Bukhari 5167). Accepter l'invitation est une sunna (al-Bukhari 5173).",
          "Éviter le gaspillage et les excès, ainsi que ce qui est interdit.",
        ],
      },
      {
        title: 'Invocations',
        duas: [
          {
            title: 'Féliciter les mariés',
            arabic: 'بَارَكَ اللَّهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
            translit: 'Baraka Llahu laka, wa baraka ʿalayka, wa jamaʿa baynakuma fi khayr',
            french: "Qu'Allah te bénisse, qu'Il répande Sa bénédiction sur toi et qu'Il vous réunisse dans le bien.",
            source: 'Abu Dawud 2130, at-Tirmidhi 1091',
          },
          {
            title: "Quand l'époux retrouve son épouse",
            arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا جَبَلْتَهَا عَلَيْهِ',
            translit: "Allahumma inni as'aluka khayraha wa khayra ma jabaltaha ʿalayh, wa aʿudhu bika min sharriha wa sharri ma jabaltaha ʿalayh",
            french: "Ô Allah, je Te demande son bien et le bien de ce sur quoi Tu l'as façonnée, et je cherche refuge auprès de Toi contre son mal et le mal de ce sur quoi Tu l'as façonnée.",
            source: 'Abu Dawud 2160',
          },
          {
            title: 'Avant l\'intimité',
            arabic: 'بِسْمِ اللَّهِ، اللَّهُمَّ جَنِّبْنَا الشَّيْطَانَ وَجَنِّبِ الشَّيْطَانَ مَا رَزَقْتَنَا',
            translit: 'Bismi Llah, Allahumma jannibna sh-shaytan wa jannibi sh-shaytana ma razaqtana',
            french: "Au nom d'Allah. Ô Allah, éloigne de nous le diable et éloigne le diable de ce que Tu nous accordes.",
            source: 'al-Bukhari 141, Muslim 1434',
          },
        ],
      },
      {
        title: 'Après le mariage',
        bullets: [
          "Vivre ensemble avec bonté : « Les meilleurs d'entre vous sont les meilleurs envers leurs épouses » (at-Tirmidhi 1162).",
          "Se consulter, se pardonner et se rappeler les droits et devoirs de chacun.",
        ],
      },
    ],
    note: "Les conditions du contrat varient selon les écoles et les lois du pays. Pour un mariage concret, demande à un imam ou à une institution de confiance, et fais aussi le mariage civil exigé par la loi.",
  },
  {
    id: 'naissance',
    title: 'Baptême (naissance)',
    arabic: 'المولود',
    subtitle: "Accueillir l'enfant : nom, aqiqa et invocations",
    intro:
      "L'islam ne connaît pas de baptême. À la naissance, on remercie Allah, on prononce des invocations pour l'enfant, on lui donne un beau nom et, le septième jour, on fait l'aqiqa.",
    sections: [
      {
        title: 'À la naissance',
        bullets: [
          "Remercier Allah et féliciter les parents.",
          "Le tahnik : frotter le palais du nouveau-né avec un peu de datte mâchée, en priant pour lui (al-Bukhari 5467, Muslim 2145).",
          "L'appel à la prière dans l'oreille du nouveau-né est rapporté, mais le degré du hadith est discuté (Abu Dawud 5105).",
        ],
      },
      {
        title: 'Le nom',
        bullets: [
          "Donner un beau nom : les noms les plus aimés d'Allah sont ʿAbdullah et ʿAbd ar-Rahman (Muslim 2132).",
          "Éviter les noms au sens mauvais ou qui attribuent à un autre qu'Allah ce qui Lui revient.",
          "Le nom est donné au plus tard le septième jour (Abu Dawud 2838, at-Tirmidhi 1522).",
        ],
      },
      {
        title: "L'aqiqa",
        bullets: [
          "Sacrifice offert le septième jour : deux moutons pour un garçon, un pour une fille (Abu Dawud 2834, at-Tirmidhi 1513).",
          "Raser la tête du bébé et donner en aumône l'équivalent du poids des cheveux, selon l'avis de nombreux savants.",
          "Partager la viande avec la famille et les pauvres. Son caractère obligatoire ou recommandé varie selon les écoles.",
          "La circoncision du garçon fait partie de la fitra.",
        ],
        duas: [
          {
            title: "Protéger l'enfant",
            arabic: 'أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
            translit: "U'idhukuma bi-kalimati Llahi t-tammati min kulli shaytanin wa hammah, wa min kulli ʿaynin lammah",
            french: "Je vous place sous la protection des paroles parfaites d'Allah contre tout démon, tout animal nuisible et tout mauvais œil.",
            source: 'al-Bukhari 3371',
          },
          {
            title: 'Féliciter les parents',
            arabic: 'بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ، وَشَكَرْتَ الْوَاهِبَ، وَبَلَغَ أَشُدَّهُ، وَرُزِقْتَ بِرَّهُ',
            translit: "Baraka Llahu laka fi l-mawhubi lak, wa shakarta l-wahib, wa balagha ashuddah, wa ruziqta birrah",
            french: "Qu'Allah te bénisse pour ce qui t'a été donné, que tu remercies Celui qui l'a donné, qu'il atteigne sa maturité et que tu reçoives sa piété filiale.",
            source: 'Formule rapportée de al-Hasan al-Basri',
          },
        ],
      },
      {
        title: "Bonnes pratiques",
        bullets: [
          "Allaiter, éduquer et enseigner la prière dès le jeune âge (Abu Dawud 495).",
          "Traiter les enfants avec équité, filles comme garçons.",
        ],
      },
    ],
    note: "Les avis diffèrent sur plusieurs points (appel dans l'oreille, caractère de l'aqiqa). Suis l'avis de ton école ou de ton imam.",
  },
  {
    id: 'deces',
    title: 'Décès',
    arabic: 'الجنازة',
    subtitle: 'Accompagner le mourant, la prière funéraire et le deuil',
    intro:
      "Allah dit : « Toute âme goûtera la mort. » (Coran 3:185) Le musulman accompagne le défunt avec patience, prières et respect, et console les siens.",
    sections: [
      {
        title: 'Auprès du mourant',
        bullets: [
          "Lui rappeler doucement de dire la profession de foi : « Faites dire à vos mourants : il n'y a de divinité qu'Allah » (Muslim 916).",
          "Rester patient, parler en bien : les anges disent amine à ce que l'on dit (Muslim 919).",
        ],
      },
      {
        title: 'Après le décès',
        bullets: [
          "Fermer les yeux du défunt et prier pour lui (Muslim 920).",
          "Se hâter de s'occuper des funérailles et de régler ses dettes (at-Tirmidhi 1078).",
          "Ne pas pousser aux lamentations bruyantes (nawh) ni aux gestes de désespoir (al-Bukhari 1294).",
        ],
        duas: [
          {
            title: 'À l\'annonce du décès',
            arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا',
            translit: "Inna li-Llahi wa inna ilayhi raji'un. Allahumma'jurni fi musibati wa akhlif li khayran minha",
            french: "Nous appartenons à Allah et c'est à Lui que nous retournons. Ô Allah, récompense-moi dans mon épreuve et remplace-la par mieux.",
            source: 'Coran 2:156 ; Muslim 918',
          },
        ],
      },
      {
        title: 'Les funérailles',
        bullets: [
          "La toilette mortuaire (ghusl) du défunt par des personnes du même sexe (conjoints exceptés), avec respect et discrétion.",
          "Le linceul : étoffes blanches propres, en une à trois pièces pour l'homme et selon l'usage pour la femme.",
          "La prière funéraire (salat al-janaza) : en groupe, debout, avec quatre takbirs, sans inclinaison ni prosternation, puis le salam.",
          "Porter le défunt jusqu'au cimetière et l'enterrer sans retard.",
          "Tourner le défunt sur son côté droit vers la qibla dans la tombe.",
        ],
      },
      {
        title: 'La prière funéraire',
        paragraphs: [
          "Après le premier takbir, on récite la Fatiha (selon les écoles), après le deuxième les salutations sur le Prophète ﷺ, après le troisième l'invocation pour le défunt, puis le quatrième et le salam. Les détails varient légèrement selon les écoles.",
        ],
        duas: [
          {
            title: 'Invocation pour le défunt',
            arabic: 'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ، وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ',
            translit: "Allahumma ghfir lahu warhamhu, wa ʿafihi waʿfu ʿanhu, wa akrim nuzulahu, wa wassiʿ mudkhalahu",
            french: "Ô Allah, pardonne-lui et fais-lui miséricorde, accorde-lui le salut et efface ses fautes, honore sa demeure et élargis son entrée.",
            source: 'Muslim 963',
          },
          {
            title: 'En déposant le défunt dans la tombe',
            arabic: 'بِسْمِ اللَّهِ وَعَلَى سُنَّةِ رَسُولِ اللَّهِ',
            translit: "Bismi Llah wa ʿala sunnati rasuli Llah",
            french: "Au nom d'Allah et selon la tradition du messager d'Allah ﷺ.",
            source: 'Abu Dawud 3213, at-Tirmidhi 1046',
          },
          {
            title: 'Pour consoler',
            arabic: 'إِنَّ لِلَّهِ مَا أَخَذَ، وَلَهُ مَا أَعْطَى، وَكُلُّ شَيْءٍ عِنْدَهُ بِأَجَلٍ مُسَمًّى',
            translit: "Inna li-Llahi ma akhadh, wa lahu ma aʿta, wa kullu shay'in ʿindahu bi-ajalin musamma",
            french: "À Allah ce qu'Il a repris et à Lui ce qu'Il a donné ; toute chose a auprès de Lui un terme fixé.",
            source: 'al-Bukhari 1284, Muslim 923',
          },
        ],
      },
      {
        title: 'Le deuil et les condoléances',
        bullets: [
          "Présenter ses condoléances aux proches, avec douceur et sans longs discours.",
          "Préparer un repas pour la famille du défunt, occupée par son deuil (Abu Dawud 3132, at-Tirmidhi 998).",
          "Le deuil est limité à trois jours, sauf pour la veuve : quatre mois et dix jours (al-Bukhari 1280).",
          "Visiter les tombes pour se souvenir de l'au-delà et prier pour les défunts (Muslim 977).",
        ],
        duas: [
          {
            title: 'En saluant les tombes',
            arabic: 'السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَلَاحِقُونَ، نَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ',
            translit: "As-salamu ʿalaykum ahla d-diyari mina l-mu'minina wa l-muslimin, wa inna in sha'a Llahu bikum lalahiqun, nas'alu Llaha lana wa lakumu l-ʿafiyah",
            french: "Que la paix soit sur vous, habitants de ces demeures, croyants et musulmans. Nous vous rejoindrons, si Allah le veut. Nous demandons à Allah le salut pour nous et pour vous.",
            source: 'Muslim 975',
          },
        ],
      },
      {
        title: 'Ce qui profite au défunt',
        bullets: [
          "Les invocations de ses proches, l'aumône continue (sadaqa jariya) et la science dont on profite (Muslim 1631).",
          "Le règlement de ses dettes, l'exécution de son testament dans la limite du tiers, puis le partage de l'héritage.",
        ],
      },
    ],
    note: "Les détails de la toilette, du linceul et de la prière funéraire varient selon les écoles. Fais-toi accompagner par l'imam ou les services funéraires de ta communauté.",
  },
];

export const eventById = (id: string): IslamicEvent | undefined => EVENTS.find((e) => e.id === id);
