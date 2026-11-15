import type { RpgPlace } from '@/utils/rpg';

/*
 * Contenu du parcours : maison, école, travail. Les questions s'appuient sur le Coran et la Sunna,
 * avec la source dans la leçon. Les situations de la vie courante (travail, école) ont plusieurs
 * réponses possibles ; la bonne est celle qui respecte à la fois la religion et la sagesse.
 * À faire relire par une personne qualifiée avant toute diffusion large.
 */

export const RPG_PLACES: RpgPlace[] = [
  {
    id: 'maison',
    title: 'La maison',
    emoji: '🏠',
    map: { x: 18, y: 72 },
    terrain: 'grass',
    intro:
      "Tout commence chez toi. Les gens de la maison te posent des questions sur la famille, le partage et la pratique religieuse. Réponds juste pour sortir de la maison.",
    encounters: [
      {
        id: 'maison-pere',
        who: 'Papa',
        emoji: '👨',
        topic: 'Le respect des parents',
        prompt: "Papa, âgé, te reprend avec agacement. Comment le Coran demande-t-il de lui répondre ?",
        choices: [
          { id: 'a', text: "Lui dire « uff » si tu as raison" },
          { id: 'b', text: "Ne pas lui dire « uff », et lui parler avec des paroles nobles" },
          { id: 'c', text: "Lui répondre sur le même ton pour te défendre" },
          { id: 'd', text: "L'éviter quelques jours jusqu'à ce qu'il se calme" },
        ],
        correct: 'b',
        lesson: {
          text: "Allah ordonne la bonté envers les parents : s'ils atteignent la vieillesse auprès de toi, ne leur dis pas « uff » et ne les repousse pas, mais adresse-leur des paroles respectueuses.",
          source: 'Coran 17:23',
        },
      },
      {
        id: 'maison-mere',
        who: 'Maman',
        emoji: '👩',
        topic: 'Les parents',
        prompt: "Un homme demande au Prophète ﷺ : « Qui mérite le plus ma bonne compagnie ? » Qui le Prophète ﷺ cite-t-il en premier ?",
        choices: [
          { id: 'a', text: 'Ton père' },
          { id: 'b', text: 'Ton meilleur ami' },
          { id: 'c', text: 'Ta mère' },
          { id: 'd', text: 'Ton épouse' },
        ],
        correct: 'c',
        lesson: {
          text: "Le Prophète ﷺ a répondu : « Ta mère », trois fois, puis : « Ensuite ton père ». La mère est citée trois fois avant le père.",
          source: 'al-Bukhari 5971, Muslim 2548',
        },
      },
      {
        id: 'maison-frere',
        who: 'Ton frère',
        emoji: '🧑',
        topic: 'Le partage',
        prompt: "Ton frère garde tout son goûter pour lui. Que dit le Prophète ﷺ sur ce que doit vouloir un croyant pour son frère ?",
        choices: [
          { id: 'a', text: "Qu'il le garde, chacun s'occupe de soi" },
          { id: 'b', text: "Qu'il aime pour son frère ce qu'il aime pour lui-même" },
          { id: 'c', text: "Qu'il ne partage qu'avec ceux qui ont partagé avec lui" },
          { id: 'd', text: "Qu'il partage seulement en public" },
        ],
        correct: 'b',
        lesson: {
          text: "Le Prophète ﷺ a dit : « Aucun de vous ne croit vraiment tant qu'il n'aime pas pour son frère ce qu'il aime pour lui-même. »",
          source: 'al-Bukhari 13, Muslim 45',
        },
      },
      {
        id: 'maison-oncle',
        who: 'Ton oncle',
        emoji: '🧔',
        topic: 'La famille',
        prompt: "Ton oncle s'est brouillé avec la famille et ne t'appelle plus. Qui entretient vraiment les liens de parenté, selon le Prophète ﷺ ?",
        choices: [
          { id: 'a', text: "Celui qui rend la pareille à ceux qui l'appellent" },
          { id: 'b', text: "Celui qui rend visite uniquement aux riches" },
          { id: 'c', text: "Celui qui attend que l'autre fasse le premier pas" },
          { id: 'd', text: "Celui qui renoue les liens quand on les a coupés avec lui" },
        ],
        correct: 'd',
        lesson: {
          text: "« Celui qui entretient les liens n'est pas celui qui rend la pareille, mais celui qui renoue le lien quand il a été coupé avec lui. »",
          source: 'al-Bukhari 5991',
        },
      },
      {
        id: 'maison-soeur',
        who: 'Ta petite sœur',
        emoji: '👧',
        topic: 'La pratique religieuse',
        prompt: "Ta petite sœur a sept ans et demande à quel moment on apprend aux enfants à prier. Que dit le Prophète ﷺ ?",
        choices: [
          { id: 'a', text: "Leur ordonner la prière à sept ans" },
          { id: 'b', text: "Attendre qu'ils aient dix-huit ans" },
          { id: 'c', text: "Seulement à la puberté, jamais avant" },
          { id: 'd', text: "Ne rien leur dire, ils comprendront seuls" },
        ],
        correct: 'a',
        lesson: {
          text: "« Ordonnez à vos enfants la prière à sept ans, et frappez-les-y (de façon légère, selon les savants) à dix ans, et séparez leurs lits. » On les y habitue donc dès sept ans, avec douceur et patience.",
          source: 'Abu Dawud 495',
        },
      },
      {
        id: 'maison-grand-mere',
        who: 'Ta grand-mère',
        emoji: '👵',
        topic: 'Le Coran en famille',
        prompt: "Ta grand-mère te demande de lui lire le Coran. Qui est le meilleur d'entre vous, selon le Prophète ﷺ ?",
        choices: [
          { id: 'a', text: "Celui qui récite le plus vite" },
          { id: 'b', text: "Celui qui apprend le Coran et l'enseigne" },
          { id: 'c', text: "Celui qui a la plus belle voix" },
          { id: 'd', text: "Celui qui possède le plus de livres" },
        ],
        correct: 'b',
        lesson: {
          text: "« Les meilleurs d'entre vous sont ceux qui apprennent le Coran et l'enseignent. » Lire avec sa famille et transmettre font partie de ce mérite.",
          source: 'al-Bukhari 5027',
        },
      },
    ],
  },
  {
    id: 'ecole',
    title: "L'école",
    emoji: '🏫',
    map: { x: 50, y: 36 },
    terrain: 'stone',
    intro:
      "Te voilà dehors. À l'école, entre camarades, examens et pauses, ta foi se vit au quotidien. Traverse la journée sans te perdre.",
    encounters: [
      {
        id: 'ecole-triche',
        who: 'Un camarade',
        emoji: '🧑‍🎓',
        topic: "L'honnêteté",
        prompt: "Pendant un examen, un camarade te propose de te passer ses réponses. Que fais-tu ?",
        choices: [
          { id: 'a', text: "J'accepte, tout le monde le fait" },
          { id: 'b', text: "J'accepte une seule fois pour une matière difficile" },
          { id: 'c', text: "Je refuse : celui qui trompe n'est pas des nôtres" },
          { id: 'd', text: "Je copie discrètement pour ne pas me faire voir" },
        ],
        correct: 'c',
        lesson: {
          text: "Le Prophète ﷺ a dit : « Celui qui nous trompe n'est pas des nôtres. » La tricherie est une tromperie : on refuse poliment et on compte sur son travail.",
          source: 'Muslim 101',
        },
      },
      {
        id: 'ecole-priere',
        who: 'La cloche de midi',
        emoji: '🔔',
        topic: 'La prière à son heure',
        prompt: "L'heure de Dhuhr est entrée pendant les cours. Que fais-tu pour ta prière ?",
        choices: [
          { id: 'a', text: "Je ne prie pas, l'école n'est pas un lieu de prière" },
          { id: 'b', text: "Je prie tout dans la nuit, c'est la même chose" },
          { id: 'c', text: "Je prie quand je veux, l'heure n'a pas d'importance" },
          { id: 'd', text: "Je demande poliment un endroit calme et je prie dans le temps de Dhuhr, à la pause" },
        ],
        correct: 'd',
        lesson: {
          text: "La prière est prescrite aux croyants à des temps déterminés. On la fait donc dans son temps : on demande avec politesse un lieu et un moment adaptés, souvent la pause du midi, et on reste patient.",
          source: 'Coran 4:103',
        },
      },
      {
        id: 'ecole-moquerie',
        who: 'Un élève moqueur',
        emoji: '😏',
        topic: 'La patience',
        prompt: "Un élève se moque de ta religion devant la classe. Comment réagis-tu ?",
        choices: [
          { id: 'a', text: "Je l'insulte en retour" },
          { id: 'b', text: "Je réponds calmement, par ce qui est meilleur" },
          { id: 'c', text: "Je cache ma religion pour qu'on me laisse tranquille" },
          { id: 'd', text: "Je me bats avec lui après les cours" },
        ],
        correct: 'b',
        lesson: {
          text: "Allah dit : « Repousse le mal par ce qui est meilleur : et voilà que celui avec qui tu avais une animosité devient comme un ami chaleureux. » On répond avec calme, sans haine ni honte.",
          source: 'Coran 41:34',
        },
      },
      {
        id: 'ecole-savoir',
        who: 'Ta professeure',
        emoji: '👩‍🏫',
        topic: 'La science',
        prompt: "Ta professeure demande pourquoi tu travailles autant. Que dit le Prophète ﷺ sur la quête du savoir ?",
        choices: [
          { id: 'a', text: "C'est une obligation pour tout musulman" },
          { id: 'b', text: "C'est réservé à ceux qui deviennent savants" },
          { id: 'c', text: "C'est facultatif et sans mérite" },
          { id: 'd', text: "C'est déconseillé aux jeunes" },
        ],
        correct: 'a',
        lesson: {
          text: "« La quête du savoir est une obligation pour tout musulman. » Elle comprend le savoir utile à sa religion et à sa vie, appris avec sincérité.",
          source: 'Ibn Majah 224 (hadith jugé authentique)',
        },
      },
    ],
  },
  {
    id: 'travail',
    title: 'Le travail',
    emoji: '💼',
    map: { x: 82, y: 62 },
    terrain: 'sand',
    intro:
      "Te voici adulte, au bureau. Ici les épreuves sont des situations réelles : choisis la solution qui respecte ta religion et reste sage.",
    encounters: [
      {
        id: 'travail-patron',
        who: 'Ton patron',
        emoji: '🧑‍💼',
        topic: 'Prier au travail',
        prompt: "Ton patron refuse que tu quittes ton poste pour prier. Que fais-tu ?",
        choices: [
          { id: 'a', text: "J'abandonne la prière, je n'ai pas le choix" },
          { id: 'b', text: "Je quitte brusquement mon poste et je claque la porte" },
          { id: 'c', text: "J'explique calmement que la prière ne prend que quelques minutes et je propose de la faire pendant la pause ou de rattraper le temps" },
          { id: 'd', text: "Je prie en cachette sans jamais en parler, pour éviter tout conflit" },
        ],
        correct: 'c',
        lesson: {
          text: "La prière ne s'abandonne pas : elle a son temps. On cherche une solution avec sagesse et politesse (pause, quelques minutes rattrapées, accord avec la direction). Il n'y a pas d'obéissance à une créature dans la désobéissance au Créateur, et Allah ouvre une issue à celui qui Le craint.",
          source: 'Coran 4:103 et 65:2 ; Ahmad 1098 (hadith authentique)',
        },
      },
      {
        id: 'travail-cadeau',
        who: 'Un client',
        emoji: '🤝',
        topic: 'La corruption',
        prompt: "Un client te glisse une enveloppe pour passer devant les autres dossiers. Que fais-tu ?",
        choices: [
          { id: 'a', text: "Je la garde, c'est un cadeau" },
          { id: 'b', text: "Je la prends et je le fais passer, une fois n'est pas coutume" },
          { id: 'c', text: "Je la partage avec un collègue pour être discret" },
          { id: 'd', text: "Je refuse, c'est un pot-de-vin" },
        ],
        correct: 'd',
        lesson: {
          text: "Le Prophète ﷺ a maudit celui qui donne un pot-de-vin et celui qui le reçoit. On refuse et on traite chaque dossier avec équité.",
          source: 'Abu Dawud 3580, at-Tirmidhi 1337',
        },
      },
      {
        id: 'travail-paie',
        who: 'La comptabilité',
        emoji: '🧾',
        topic: "L'honnêteté",
        prompt: "Tu vois sur ta fiche de paie un virement en trop, à ton avantage. Que fais-tu ?",
        choices: [
          { id: 'a', text: "Je le garde, c'est leur erreur" },
          { id: 'b', text: "Je ne dis rien et j'en donne un peu en aumône" },
          { id: 'c', text: "Je le signale et je le rends" },
          { id: 'd', text: "J'attends qu'ils s'en aperçoivent" },
        ],
        correct: 'c',
        lesson: {
          text: "Allah ordonne de rendre les dépôts à leurs ayants droit. L'argent perçu par erreur est une amana (un dépôt) : on le signale et on le restitue, l'aumône ne rend pas licite un bien qui n'est pas à soi.",
          source: 'Coran 4:58',
        },
      },
      {
        id: 'travail-pointage',
        who: 'Un collègue',
        emoji: '⏰',
        topic: 'Les engagements',
        prompt: "Un collègue en retard te demande de pointer à sa place. Que réponds-tu ?",
        choices: [
          { id: 'a', text: "Je pointe pour lui, on s'entraide" },
          { id: 'b', text: "Je refuse poliment : respecter ses engagements, c'est ne pas tromper" },
          { id: 'c', text: "Je le fais s'il me rend service en échange" },
          { id: 'd', text: "Je pointe pour lui, mais seulement cette fois" },
        ],
        correct: 'b',
        lesson: {
          text: "Allah ordonne de remplir ses engagements, et le Prophète ﷺ a dit que celui qui trompe n'est pas des siens. Pointer à la place d'un autre est une tromperie envers l'employeur : on peut aider autrement, sans mentir.",
          source: 'Coran 5:1 ; Muslim 101',
        },
      },
    ],
  },
];
