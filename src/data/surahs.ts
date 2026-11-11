/*
 * Les 114 sourates : nom arabe, translittération et nombre de versets.
 * Seules ces métadonnées sont dans l'application ; le texte du Coran est chargé depuis une source
 * externe (voir src/services/quran.ts) pour éviter toute erreur de saisie.
 */

export interface Surah {
  number: number;
  arabic: string;
  name: string;
  verses: number;
}

type Row = [arabic: string, name: string, verses: number];

const ROWS: Row[] = [
  ["الفاتحة", "Al-Fatiha", 7],
  ["البقرة", "Al-Baqara", 286],
  ["آل عمران", "Al-Imran", 200],
  ["النساء", "An-Nisa", 176],
  ["المائدة", "Al-Ma'ida", 120],
  ["الأنعام", "Al-An'am", 165],
  ["الأعراف", "Al-A'raf", 206],
  ["الأنفال", "Al-Anfal", 75],
  ["التوبة", "At-Tawba", 129],
  ["يونس", "Yunus", 109],
  ["هود", "Hud", 123],
  ["يوسف", "Yusuf", 111],
  ["الرعد", "Ar-Ra'd", 43],
  ["إبراهيم", "Ibrahim", 52],
  ["الحجر", "Al-Hijr", 99],
  ["النحل", "An-Nahl", 128],
  ["الإسراء", "Al-Isra", 111],
  ["الكهف", "Al-Kahf", 110],
  ["مريم", "Maryam", 98],
  ["طه", "Ta-Ha", 135],
  ["الأنبياء", "Al-Anbiya", 112],
  ["الحج", "Al-Hajj", 78],
  ["المؤمنون", "Al-Mu'minun", 118],
  ["النور", "An-Nur", 64],
  ["الفرقان", "Al-Furqan", 77],
  ["الشعراء", "Ash-Shu'ara", 227],
  ["النمل", "An-Naml", 93],
  ["القصص", "Al-Qasas", 88],
  ["العنكبوت", "Al-'Ankabut", 69],
  ["الروم", "Ar-Rum", 60],
  ["لقمان", "Luqman", 34],
  ["السجدة", "As-Sajda", 30],
  ["الأحزاب", "Al-Ahzab", 73],
  ["سبأ", "Saba", 54],
  ["فاطر", "Fatir", 45],
  ["يس", "Ya-Sin", 83],
  ["الصافات", "As-Saffat", 182],
  ["ص", "Sad", 88],
  ["الزمر", "Az-Zumar", 75],
  ["غافر", "Ghafir", 85],
  ["فصلت", "Fussilat", 54],
  ["الشورى", "Ash-Shura", 53],
  ["الزخرف", "Az-Zukhruf", 89],
  ["الدخان", "Ad-Dukhan", 59],
  ["الجاثية", "Al-Jathiya", 37],
  ["الأحقاف", "Al-Ahqaf", 35],
  ["محمد", "Muhammad", 38],
  ["الفتح", "Al-Fath", 29],
  ["الحجرات", "Al-Hujurat", 18],
  ["ق", "Qaf", 45],
  ["الذاريات", "Adh-Dhariyat", 60],
  ["الطور", "At-Tur", 49],
  ["النجم", "An-Najm", 62],
  ["القمر", "Al-Qamar", 55],
  ["الرحمن", "Ar-Rahman", 78],
  ["الواقعة", "Al-Waqi'a", 96],
  ["الحديد", "Al-Hadid", 29],
  ["المجادلة", "Al-Mujadila", 22],
  ["الحشر", "Al-Hashr", 24],
  ["الممتحنة", "Al-Mumtahana", 13],
  ["الصف", "As-Saff", 14],
  ["الجمعة", "Al-Jumu'a", 11],
  ["المنافقون", "Al-Munafiqun", 11],
  ["التغابن", "At-Taghabun", 18],
  ["الطلاق", "At-Talaq", 12],
  ["التحريم", "At-Tahrim", 12],
  ["الملك", "Al-Mulk", 30],
  ["القلم", "Al-Qalam", 52],
  ["الحاقة", "Al-Haqqa", 52],
  ["المعارج", "Al-Ma'arij", 44],
  ["نوح", "Nuh", 28],
  ["الجن", "Al-Jinn", 28],
  ["المزمل", "Al-Muzzammil", 20],
  ["المدثر", "Al-Muddaththir", 56],
  ["القيامة", "Al-Qiyama", 40],
  ["الإنسان", "Al-Insan", 31],
  ["المرسلات", "Al-Mursalat", 50],
  ["النبأ", "An-Naba", 40],
  ["النازعات", "An-Nazi'at", 46],
  ["عبس", "'Abasa", 42],
  ["التكوير", "At-Takwir", 29],
  ["الانفطار", "Al-Infitar", 19],
  ["المطففين", "Al-Mutaffifin", 36],
  ["الانشقاق", "Al-Inshiqaq", 25],
  ["البروج", "Al-Buruj", 22],
  ["الطارق", "At-Tariq", 17],
  ["الأعلى", "Al-A'la", 19],
  ["الغاشية", "Al-Ghashiya", 26],
  ["الفجر", "Al-Fajr", 30],
  ["البلد", "Al-Balad", 20],
  ["الشمس", "Ash-Shams", 15],
  ["الليل", "Al-Layl", 21],
  ["الضحى", "Ad-Duha", 11],
  ["الشرح", "Ash-Sharh", 8],
  ["التين", "At-Tin", 8],
  ["العلق", "Al-'Alaq", 19],
  ["القدر", "Al-Qadr", 5],
  ["البينة", "Al-Bayyina", 8],
  ["الزلزلة", "Az-Zalzala", 8],
  ["العاديات", "Al-'Adiyat", 11],
  ["القارعة", "Al-Qari'a", 11],
  ["التكاثر", "At-Takathur", 8],
  ["العصر", "Al-'Asr", 3],
  ["الهمزة", "Al-Humaza", 9],
  ["الفيل", "Al-Fil", 5],
  ["قريش", "Quraysh", 4],
  ["الماعون", "Al-Ma'un", 7],
  ["الكوثر", "Al-Kawthar", 3],
  ["الكافرون", "Al-Kafirun", 6],
  ["النصر", "An-Nasr", 3],
  ["المسد", "Al-Masad", 5],
  ["الإخلاص", "Al-Ikhlas", 4],
  ["الفلق", "Al-Falaq", 5],
  ["الناس", "An-Nas", 6],
];

export const SURAHS: Surah[] = ROWS.map(([arabic, name, verses], i) => ({ number: i + 1, arabic, name, verses }));

export const TOTAL_VERSES = SURAHS.reduce((n, s) => n + s.verses, 0);

export const surahByNumber = (n: number): Surah | undefined => SURAHS[n - 1];

/** Recherche insensible aux accents, apostrophes et tirets ; accepte aussi un numéro. */
const fold = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/['’`\-\s]/g, '');

export function searchSurahs(query: string): Surah[] {
  const q = fold(query.trim());
  if (!q) return SURAHS;
  return SURAHS.filter((s) => String(s.number) === q || fold(s.name).includes(q) || s.arabic.includes(query.trim()));
}
