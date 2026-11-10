import type { Dhikr, Period } from '@/types';

/*
 * Invocations du matin et du soir (adhkar as-sabah wa al-masa').
 * Textes issus des recueils classiques (Hisn al-Muslim). Avant toute diffusion large,
 * les faire relire par une personne qualifiée (texte arabe, voyelles, traduction).
 */

type PerPeriod = Record<Period, string>;

interface DhikrSource {
  id: string;
  title: string;
  periods: Period[];
  /** Nombre de répétitions recommandé. */
  count: number;
  source: string;
  arabic: string | PerPeriod;
  phonetic: string | PerPeriod;
  french: string | PerPeriod;
}

const pick = (value: string | PerPeriod, period: Period) =>
  typeof value === 'string' ? value : value[period];

const SOURCES: DhikrSource[] = [
  {
    id: 'kursi',
    title: 'Ayat al-Kursi',
    periods: ['morning', 'evening'],
    count: 1,
    source: 'Coran 2:255 ; An-Nasa’i',
    arabic:
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    phonetic:
      "Allahu la ilaha illa huwa, al-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum. Wa la yuhituna bishay'in min 'ilmihi illa bima sha'. Wasi'a kursiyyuhus-samawati wal-ard. Wa la ya'uduhu hifzuhuma. Wa huwal-'Aliyyul-'Adhim.",
    french:
      "Allah ! Il n'y a de divinité que Lui, le Vivant, Celui qui subsiste par Lui-même. Ni somnolence ni sommeil ne Le saisissent. À Lui appartient ce qui est dans les cieux et sur la terre. Qui peut intercéder auprès de Lui sans Sa permission ? Il connaît ce qui est devant eux et ce qui est derrière eux, et ils n'embrassent de Sa science que ce qu'Il veut. Son Trône s'étend sur les cieux et la terre, et leur garde ne Lui coûte aucune peine. Et Il est le Très Haut, le Très Grand.",
  },
  {
    id: 'ikhlas',
    title: 'Sourate Al-Ikhlas',
    periods: ['morning', 'evening'],
    count: 3,
    source: 'Abu Dawud ; At-Tirmidhi',
    arabic:
      'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    phonetic:
      "Qul huwa Allahu ahad. Allahus-samad. Lam yalid wa lam yulad. Wa lam yakun lahu kufuwan ahad.",
    french:
      "Dis : Il est Allah, Unique. Allah, le Seul à être imploré pour ce que nous désirons. Il n'a jamais engendré, ni n'a été engendré. Et nul n'est égal à Lui.",
  },
  {
    id: 'falaq',
    title: 'Sourate Al-Falaq',
    periods: ['morning', 'evening'],
    count: 3,
    source: 'Abu Dawud ; At-Tirmidhi',
    arabic:
      'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    phonetic:
      "Qul a'udhu bi-rabbil-falaq. Min sharri ma khalaq. Wa min sharri ghasiqin idha waqab. Wa min sharrin-naffathati fil-'uqad. Wa min sharri hasidin idha hasad.",
    french:
      "Dis : Je cherche protection auprès du Seigneur de l'aube naissante, contre le mal des êtres qu'Il a créés, contre le mal de l'obscurité quand elle s'approfondit, contre le mal de celles qui soufflent sur les nœuds, et contre le mal de l'envieux quand il envie.",
  },
  {
    id: 'nas',
    title: 'Sourate An-Nas',
    periods: ['morning', 'evening'],
    count: 3,
    source: 'Abu Dawud ; At-Tirmidhi',
    arabic:
      'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    phonetic:
      "Qul a'udhu bi-rabbin-nas. Malikin-nas. Ilahin-nas. Min sharril-waswasil-khannas. Alladhi yuwaswisu fi suduriin-nas. Minal-jinnati wan-nas.",
    french:
      "Dis : Je cherche protection auprès du Seigneur des hommes, le Souverain des hommes, le Dieu des hommes, contre le mal du mauvais conseiller furtif, qui souffle le mal dans les poitrines des hommes, qu'il soit djinn ou être humain.",
  },
  {
    id: 'mulk',
    title: 'La royauté appartient à Allah',
    periods: ['morning', 'evening'],
    count: 1,
    source: 'Muslim',
    arabic: {
      morning:
        'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
      evening:
        'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    },
    phonetic: {
      morning:
        "Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir. Rabbi as'aluka khayra ma fi hadhal-yawm wa khayra ma ba'dah, wa a'udhu bika min sharri ma fi hadhal-yawm wa sharri ma ba'dah. Rabbi a'udhu bika minal-kasali wa su'il-kibar. Rabbi a'udhu bika min 'adhabin fin-nar wa 'adhabin fil-qabr.",
      evening:
        "Amsayna wa amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir. Rabbi as'aluka khayra ma fi hadhihil-laylah wa khayra ma ba'daha, wa a'udhu bika min sharri ma fi hadhihil-laylah wa sharri ma ba'daha. Rabbi a'udhu bika minal-kasali wa su'il-kibar. Rabbi a'udhu bika min 'adhabin fin-nar wa 'adhabin fil-qabr.",
    },
    french: {
      morning:
        "Nous voici au matin et la royauté appartient à Allah. Louange à Allah. Il n'y a de divinité qu'Allah, Seul, sans associé. À Lui la royauté, à Lui la louange, et Il est capable de toute chose. Seigneur, je Te demande le bien de ce jour et le bien de ce qui le suit, et je cherche refuge auprès de Toi contre le mal de ce jour et le mal de ce qui le suit. Seigneur, je cherche refuge auprès de Toi contre la paresse et les méfaits de la vieillesse. Seigneur, je cherche refuge auprès de Toi contre un châtiment dans le Feu et un châtiment dans la tombe.",
      evening:
        "Nous voici au soir et la royauté appartient à Allah. Louange à Allah. Il n'y a de divinité qu'Allah, Seul, sans associé. À Lui la royauté, à Lui la louange, et Il est capable de toute chose. Seigneur, je Te demande le bien de cette nuit et le bien de ce qui la suit, et je cherche refuge auprès de Toi contre le mal de cette nuit et le mal de ce qui la suit. Seigneur, je cherche refuge auprès de Toi contre la paresse et les méfaits de la vieillesse. Seigneur, je cherche refuge auprès de Toi contre un châtiment dans le Feu et un châtiment dans la tombe.",
    },
  },
  {
    id: 'bika',
    title: 'Par Toi nous atteignons le matin / le soir',
    periods: ['morning', 'evening'],
    count: 1,
    source: 'At-Tirmidhi',
    arabic: {
      morning:
        'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
      evening:
        'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    },
    phonetic: {
      morning:
        "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namut, wa ilaykan-nushur.",
      evening:
        "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namut, wa ilaykal-masir.",
    },
    french: {
      morning:
        "Ô Allah, c'est par Toi que nous atteignons le matin, par Toi que nous atteignons le soir, par Toi que nous vivons, par Toi que nous mourons, et c'est vers Toi que sera la résurrection.",
      evening:
        "Ô Allah, c'est par Toi que nous atteignons le soir, par Toi que nous atteignons le matin, par Toi que nous vivons, par Toi que nous mourons, et c'est vers Toi que sera le retour.",
    },
  },
  {
    id: 'sayyid',
    title: "Sayyid al-istighfar (le maître des demandes de pardon)",
    periods: ['morning', 'evening'],
    count: 1,
    source: 'Al-Bukhari',
    arabic:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    phonetic:
      "Allahumma anta rabbi la ilaha illa ant, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't, a'udhu bika min sharri ma sana't, abu'u laka bini'matika 'alayya, wa abu'u bidhanbi faghfir li, fa innahu la yaghfirudh-dhunuba illa ant.",
    french:
      "Ô Allah, Tu es mon Seigneur, il n'y a de divinité que Toi. Tu m'as créé et je suis Ton serviteur, et je m'en tiens à Ton engagement et à Ta promesse autant que je le peux. Je cherche refuge auprès de Toi contre le mal que j'ai commis. Je reconnais Ton bienfait envers moi et je reconnais mon péché : pardonne-moi, car nul ne pardonne les péchés en dehors de Toi.",
  },
  {
    id: 'afini',
    title: 'Demande de santé',
    periods: ['morning', 'evening'],
    count: 3,
    source: 'Abu Dawud',
    arabic:
      'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَٰهَ إِلَّا أَنْتَ',
    phonetic:
      "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa ant.",
    french:
      "Ô Allah, accorde-moi la santé dans mon corps. Ô Allah, accorde-moi la santé dans mon ouïe. Ô Allah, accorde-moi la santé dans ma vue. Il n'y a de divinité que Toi.",
  },
  {
    id: 'bismillah',
    title: 'Protection par le nom d’Allah',
    periods: ['morning', 'evening'],
    count: 3,
    source: 'Abu Dawud ; At-Tirmidhi',
    arabic:
      'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    phonetic:
      "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-Sami'ul-'Alim.",
    french:
      "Au nom d'Allah, avec le nom de qui rien sur terre ni dans le ciel ne peut nuire, et Il est l'Audient, l'Omniscient.",
  },
  {
    id: 'radiytu',
    title: 'Satisfaction envers Allah',
    periods: ['morning', 'evening'],
    count: 3,
    source: 'Abu Dawud ; At-Tirmidhi',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
    phonetic: "Raditu billahi rabba, wa bil-Islami dina, wa bi-Muhammadin nabiyya.",
    french:
      "Je suis satisfait d'Allah comme Seigneur, de l'Islam comme religion et de Muhammad comme Prophète.",
  },
  {
    id: 'kalimat',
    title: 'Refuge dans les paroles parfaites d’Allah',
    periods: ['evening'],
    count: 3,
    source: 'Muslim ; At-Tirmidhi',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    phonetic: "A'udhu bikalimatillahit-tammati min sharri ma khalaq.",
    french:
      "Je cherche refuge dans les paroles parfaites d'Allah contre le mal de ce qu'Il a créé.",
  },
  {
    id: 'subhan',
    title: 'Glorification d’Allah',
    periods: ['morning', 'evening'],
    count: 100,
    source: 'Muslim',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    phonetic: 'Subhanallahi wa bihamdih.',
    french: 'Gloire et pureté à Allah, et louange à Lui.',
  },
  {
    id: 'tawhid',
    title: 'Attestation de l’unicité d’Allah',
    periods: ['morning'],
    count: 100,
    source: 'Al-Bukhari ; Muslim',
    arabic:
      'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    phonetic:
      "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir.",
    french:
      "Il n'y a de divinité qu'Allah, Seul, sans associé. À Lui la royauté, à Lui la louange, et Il est capable de toute chose.",
  },
];

/** Invocations d'une période, dans l'ordre d'affichage. */
export function adhkarFor(period: Period): Dhikr[] {
  return SOURCES.filter((s) => s.periods.includes(period)).map((s) => ({
    id: s.id,
    title: s.title,
    count: s.count,
    source: s.source,
    arabic: pick(s.arabic, period),
    phonetic: pick(s.phonetic, period),
    french: pick(s.french, period),
  }));
}

/** Clé de suivi d'une invocation pour une période (« morning:kursi »). */
export const adhkarKey = (period: Period, id: string) => `${period}:${id}`;

export const PERIODS: Period[] = ['morning', 'evening'];

/** Toutes les clés de suivi existantes, pour ne compter que les invocations connues. */
export const ADHKAR_KEYS: string[] = PERIODS.flatMap((p) =>
  adhkarFor(p).map((d) => adhkarKey(p, d.id)),
);
