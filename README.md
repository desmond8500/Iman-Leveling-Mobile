# Iman Leveling

Application mobile (Ionic 8 + Vue 3) qui transforme le suivi des pratiques religieuses en jeu :
Hasanat, niveaux et séries de jours. Données stockées en local pour l'instant, avec une couche
`ProgressRepository` prévue pour brancher plus tard une API Laravel 13.

## Lancer et tester

Prérequis : Node 20 ou plus.

```bash
npm install
npm run dev      # ouvre l'app dans le navigateur (mode mobile conseillé dans les outils de dev)
npm test         # tests unitaires (Vitest)
npm run build    # vérification TypeScript + build de production
npm run preview  # sert le build : c'est là qu'on teste la PWA (voir plus bas)
```

## Fonctionnalités actuelles

**Prières obligatoires et Hasanat.** Chaque prière cochée rapporte 20 Hasanat, avec 50 de bonus
si les 5 sont faites. Il faut 100 Hasanat pour passer du niveau 1 au niveau 2, puis 50 de plus à
chaque niveau (150, 200, ...). La série compte les jours consécutifs où les 5 prières sont faites ;
elle n'est cassée que si hier est incomplet. Décocher retire les Hasanat gagnés.

**Prières surérogatoires (sunnas).** Elles s'affichent au-dessus de la prière si elles se font
avant, en dessous si elles se font après :

| Prière  | Avant                        | Après                              |
|---------|------------------------------|------------------------------------|
| Fajr    | 2 rak'ahs (confirmée)        |                                    |
| Dhuhr   | 4 rak'ahs (confirmée)        | 2 rak'ahs (confirmée)              |
| Asr     | 4 rak'ahs                    |                                    |
| Maghrib |                              | 2 rak'ahs (confirmée)              |
| Isha    |                              | 2 rak'ahs (confirmée), Witr (1)    |

Une sunna confirmée rapporte 10 Hasanat, les autres 5. Elles ne comptent pas dans la série.
Les nombres de rak'ahs varient selon les écoles : la liste est dans `src/data/prayers.ts`
et sera rendue configurable.

**Invocations du matin et du soir.** Onglet « Invocations » : chaque invocation est affichée en
arabe, en phonétique et en français, avec le nombre de répétitions et la source. Le choix
Matin / Soir s'ouvre par défaut selon l'heure (matin avant 15 h). Certains textes changent entre
matin et soir (« Asbahna » / « Amsayna »), d'autres sont propres à une période. Marquer une
invocation comme faite rapporte 5 Hasanat. Les textes sont dans `src/data/adhkar.ts` : ils sont
issus des recueils classiques mais doivent être relus par une personne qualifiée avant diffusion.

**Calendrier.** Sur l'accueil, une bande des 7 derniers jours (trait vert = 5 prières faites,
trait doré = partiel) et un bouton calendrier qui ouvre la vue mensuelle. Toucher un jour affiche
ses prières, sunnas, invocations et Hasanat. Les jours passés sont en consultation seule : seul le
jour en cours peut être modifié.

**Paramètres.** Onglet « Paramètres » :

- **Genre** (homme ou femme), enregistré sur l'appareil. Il servira plus tard à adapter les
  récompenses (voir `todo.md`).
- **Pays** : bouton « Détecter ma position » ou choix manuel dans une liste avec recherche. La
  détection envoie une position arrondie (environ 11 km) au service de géocodage BigDataCloud, qui
  répond le pays ; seule la réponse (le pays) est enregistrée. Si la position est refusée ou
  indisponible, l'app propose de choisir le pays à la main.
- **Sauvegarde en ligne** : on saisit l'adresse du serveur, puis on se connecte ou on crée un compte.
  La progression est alors synchronisée (à la connexion du compte, à la demande, et au lancement de l'app).
  La fusion ne perd jamais de données : une case cochée sur un appareil ou sur le serveur reste
  cochée (décocher ne se propage donc pas). Se déconnecter n'efface pas la progression de l'appareil.
  Le mot de passe n'est jamais enregistré ; seul le jeton d'accès l'est, en stockage local de
  l'appareil. HTTPS est obligatoire, sauf pour `localhost`.

Le serveur n'existe pas encore : le contrat d'API qu'il doit respecter est décrit dans
[`docs/API.md`](docs/API.md).

Pour la localisation sur Android, après `npm install` : `npx cap sync`, puis ajouter dans
`android/app/src/main/AndroidManifest.xml` (à l'intérieur de `<manifest>`) :

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" />
```

Sur iOS, ajouter `NSLocationWhenInUseUsageDescription` dans `Info.plist` avec une phrase qui
explique l'usage (ex. « Pour trouver ton pays »).

**PWA (installable et hors ligne).** L'app a un manifeste, un service worker (vite-plugin-pwa) et
des icônes dédiées, dont une icône « maskable » pour Android. Tout est mis en cache : une fois
chargée, l'app fonctionne sans réseau, les données étant locales. Après un déploiement, la nouvelle
version s'active toute seule au lancement suivant. Dans l'app native Capacitor, le service worker
n'est pas enregistré. Le manifeste est dans `pwa.manifest.ts`.

Le service worker n'est pas actif avec `npm run dev`. Pour tester :

```bash
npm run build && npm run preview     # puis ouvrir l'adresse affichée (localhost est accepté sans HTTPS)
```

Dans Chrome : DevTools > Application > Manifest (icônes, installabilité) et Service Workers, puis
l'icône d'installation dans la barre d'adresse. Pour tester le hors-ligne, cocher « Offline » et
recharger. Sur iOS (Safari) : Partager > Sur l'écran d'accueil. En ligne, l'hébergement doit servir
l'app en HTTPS, avec `index.html` renvoyé pour toute route inconnue.

**Paramètres.** Onglet « Paramètres » :

- *Genre* : homme ou femme. Il détermine les Hasanat des prières (voir « Règles des Hasanat »).
- *Apparence* : auto (bleu le vendredi), émeraude ou bleu.
- *Heures de prière* : méthode de calcul (celle du pays par défaut).
- *Rappels* (mobile uniquement) : notification à l'heure de chaque prière et rappel des ablutions
  10 à 30 min avant.
- *Pays* : bouton « Détecter ma position » (position approximative arrondie à ~11 km, envoyée au
  service BigDataCloud uniquement pour trouver le pays), ou choix manuel dans une liste avec
  recherche. L'appareil garde aussi la position arrondie à ~1 km pour calculer les heures de prière ;
  elle n'est ni envoyée au serveur de compte ni synchronisée.
- *Sauvegarde en ligne* : adresse du serveur, puis connexion ou création de compte. La progression
  est synchronisée à la connexion, au lancement de l'app et via « Synchroniser maintenant ». Sans
  compte, tout reste sur l'appareil. Se déconnecter n'efface pas la progression locale. La fusion
  ne perd rien (une case cochée reste cochée) mais décocher ne se propage pas aux autres appareils.
  Le mot de passe n'est jamais enregistré ; seul le jeton de session l'est, en stockage local.
  L'adresse doit être en `https://` (`http://localhost` accepté en développement).

Le serveur n'existe pas encore : le contrat d'API à implémenter est dans `docs/API.md` (Laravel 13
avec Sanctum recommandé). Tant qu'il n'est pas en ligne, la liaison de compte ne peut pas aboutir.

Pour la position et les rappels en natif, après `npm install` : `npx cap sync`. Le manifeste Android
déclare `ACCESS_COARSE_LOCATION`, `POST_NOTIFICATIONS` et `SCHEDULE_EXACT_ALARM` ; pour iOS, ajouter
la clé `NSLocationWhenInUseUsageDescription` dans `Info.plist`.

**Règles des Hasanat.** Prière obligatoire : 27 à la mosquée ou 1 à la maison pour un homme (choix
« Maison / Mosquée » sous la carte), 27 pour une femme (ou si le genre n'est pas renseigné).
Chaque sunna : 27. Invocation : 5. Bonus de 50 si les 5 prières sont faites. Les Hasanat sont
recalculés à partir des cases cochées de chaque jour : cocher/décocher ne permet pas d'en gagner
plus. Ce sont des points de jeu, pas une promesse de récompense.

**Grades.** Débutant (niv. 1), Persévérant (3), Assidu (6), Dévoué (10), Constant (15), Exemplaire
(25), Lumière (40), affichés dans l'en-tête avec une pastille de couleur.

**Noms d'Allah.** Onglet dédié : liste de 99 noms avec recherche, puis une page de détail par nom
(arabe, translittération, traduction, explication, lien vers le verset 7:180). La liste suit
l'énumération d'At-Tirmidhi, dont les savants discutent certains noms. À faire relire.

**Heures de prière.** Calcul astronomique sur l'appareil (`src/utils/prayerTimes.ts`), affichées
dans chaque carte avec la prochaine prière en haut. Méthodes : Ligue islamique mondiale, UOIF,
ISNA, Égypte, Oumm al-Qora, Karachi. Les heures peuvent différer de quelques minutes de celles de
ta mosquée : en cas de doute, suis son calendrier.

**Onglet « Plus ».** Ramadan (calendrier de 30 jours en 3 blocs de 10), Prière (5 prières, ablutions,
déroulement, invocations des ablutions et de fin de prière) et Coran (114 sourates). Le calendrier
du mois affiche la date hégirienne (Oumm al-Qora, ±1 jour selon la lune), les jours blancs
(13-14-15) et le lundi/jeudi.

**Coran.** Seules les métadonnées des sourates sont dans le code. Le texte (arabe uthmani,
traduction française Hamidullah, translittération) est chargé depuis `api.alquran.cloud` à la
première ouverture d'une sourate, puis gardé sur l'appareil. **Le format de réponse n'a pas pu être
vérifié depuis l'environnement de développement** : teste une sourate avec une connexion et corrige
`src/services/quran.ts` au besoin. Un marque-page automatique et le suivi de la lecture du mois
(objectif : tout le Coran) sont gardés sur l'appareil.

**Citadelle du musulman.** Onglet de la page Invocations : une sélection de 15 invocations, pas le
recueil complet.

**Rappels et appel du muezzin.** `@capacitor/local-notifications` programme 3 jours à l'avance, et
reprogramme au lancement et à chaque changement de réglage. Le **son de l'adhan n'est pas fourni** :
il faut un fichier audio libre de droits à placer dans `android/app/src/main/res/raw/` (puis le
référencer dans `src/services/notifications.ts` via `sound`).

**Icône et écran de démarrage.** Un croissant et une étoile dorés sur fond émeraude, avec des
chevrons de niveau. Les sources sont dans `resources/` (SVG et PNG). L'app affiche un écran de
démarrage animé au lancement ; sur mobile, `npm run assets` génère l'icône et le splash natifs
(iOS et Android) à partir de `resources/` une fois les plateformes ajoutées
(`npx cap add android`, `npx cap add ios`).

## Fabriquer l'APK Android

Prérequis : Node 22+, **JDK 21 ou plus**, Android SDK (plateforme 36) et `ANDROID_HOME`.

```sh
npm install
npm run apk:debug     # APK de test : android/app/build/outputs/apk/debug/app-debug.apk
npm run apk:release   # APK non signé : android/app/build/outputs/apk/release/app-release-unsigned.apk
```

L'APK de test s'installe avec `adb install -r <fichier>`. L'APK de publication doit être signé
(`keytool` pour créer la clé, puis `apksigner`) ; garde la clé précieusement, elle est nécessaire
pour toute mise à jour. La commande vérifie la version de Java : si Gradle affiche
`invalid source release: 21`, c'est que le JDK utilisé est trop ancien. Installe un JDK 21 (ou
utilise celui d'Android Studio, dossier `jbr`) et définis `JAVA_HOME`.

## Widgets Android

Quatre widgets s'ajoutent depuis l'écran d'accueil du téléphone (appui long > Widgets > Iman Leveling) :

- **Prière en cours** : date (grégorienne et hégirienne), prière dont le temps est valable maintenant, ses sunnas ; on les valide d'une touche. Après minuit, Isha de la veille reste validable jusqu'à Fajr.
- **Invocations** : matin (avant 15 h) ou soir ; une invocation à la fois, la suivante apparaît à la validation.
- **Ramadan** : jours jeûnés, jours à venir, heure de la rupture (avant le mois : compte à rebours).
- **Nom d'Allah** : un nom au hasard ; « Autre nom » en tire un autre.
- **Hadith du jour** : texte, attribution et degré d'authenticité, tirés de HadeethEnc ; il change chaque jour (pas de tirage à la demande dans le widget : il faut une connexion, que le widget n'a pas).

Fonctionnement : l'application envoie un instantané JSON aux widgets (`src/utils/widgetSnapshot.ts`, plugin natif `WidgetBridge`). Une validation faite dans un widget est enregistrée dans une file puis appliquée par l'application à son prochain passage au premier plan (idempotent, aujourd'hui et hier avant Fajr seulement). **Ouvre l'application au moins une fois** pour que les widgets aient des données, et après chaque changement de position ou de méthode.

Limites connues : les widgets se redessinent au début et à la fin de chaque prière (alarme inexacte) et au plus toutes les 30 min sinon, selon les économies d'énergie du téléphone ; le hadith du jour n'apparaît qu'après un premier chargement dans l'application (connexion requise) ; ce code natif n'a pas été compilé ni essayé sur appareil au moment de l'écriture.

## Rappels (hadiths)

Menu **Plus > Rappels** : hadith du jour (« Un autre hadith » pour en tirer un autre), parcours par catégorie avec explication, et favoris. Les textes viennent de l'API HadeethEnc (`src/services/hadeeth.ts`), chargés à la demande puis gardés sur l'appareil pour lire hors ligne. **Le format de l'API n'a pas pu être essayé depuis l'environnement de développement** : l'analyse est tolérante et décrite par les tests ; à confirmer sur le téléphone.

## Notifications de prière

Les permissions `POST_NOTIFICATIONS` (Android 13+) et `SCHEDULE_EXACT_ALARM` sont de nouveau déclarées dans le manifeste ; l'autorisation se demande en activant les rappels dans Paramètres. Sur Android 12 et plus, l'alarme exacte peut aussi se régler dans les réglages du téléphone (Applications > Alarmes et rappels).

## Chapelet (tasbih)

Menu **Plus > Chapelet** : un gros bouton rond qui compte à chaque touche (vibration légère, plus longue en fin d'étape et de série). Modèles : « Après la prière » (33 Subhana Llah, 33 Al-hamdu li-Llah, 34 Allahu akbar, qui s'enchaînent tout seuls, d'après Muslim 596), des compteurs à objectif (33 ou 100) et un compteur libre. Boutons « Annuler » (reprend même au-delà d'une étape) et « Remettre à zéro ». L'état est gardé sur l'appareil ; il n'est pas synchronisé avec le serveur.

## Zakat al-Maal (calculateur)

Menu **Plus > Zakat > Al-Maal** : saisie de l'argent, de l'épargne, des placements, des marchandises, des créances, de l'or et de l'argent (avec leur prix au gramme) et des dettes ; seuil (nisab) selon l'or (85 g) ou l'argent (595 g) ; 2,5 % du patrimoine net une fois le seuil atteint. Une case demande si les biens sont détenus depuis une année lunaire complète : sinon la zakat est signalée comme « pas encore due ». Les montants restent sur l'appareil. Estimation indicative ; bijoux, commerce et placements varient selon les écoles.

## Événements

Menu **Plus > Événements** : Aïd al-Fitr, Aïd al-Adha, Mariage, Baptême (naissance : l'islam ne connaît pas de baptême, on y trouve le nom, l'aqiqa et les invocations) et Décès. Chaque page décrit le rituel, les bonnes pratiques et sunnas, et les invocations (arabe, transcription, français, source). Les deux Aïd affichent leur prochaine date d'après le calendrier hégirien (peut différer d'un jour de l'observation de la lune). Contenu dans `src/data/events.ts` ; références et invocations à faire relire par une personne qualifiée avant diffusion large.

## Héritage

Menu **Plus > Héritage** : on choisit le sexe du défunt, on saisit les héritiers (conjoint, parents, fils et filles, petits-enfants par un fils, frères et sœurs de toute origine), les biens avec leur valeur, les dettes, les frais d'obsèques et un éventuel legs (plafonné au tiers). La page affiche les parts exactes (fractions) et les montants, avec la raison des exclusions et les règles appliquées (parts fixes, reste, « awl », « radd »). Le moteur est dans `src/utils/inheritance.ts`, testé sur les cas classiques (dont al-Oumariyyatayn et al-Himariyya).

**Non pris en charge** : grands-parents, oncles, cousins et héritiers éloignés, enfants d'une fille, héritiers incertains (disparu, enfant à naître). Les écoles divergent sur certains cas ; le calcul suit l'avis majoritaire et le signale. Estimation indicative : pour une succession réelle, notaire et savant sont indispensables. Les données saisies restent sur l'appareil.

## Mérites des invocations

Les invocations du matin et du soir, trois invocations de la Citadelle et les modèles du chapelet affichent leur **mérite** (bloc doré) avec la référence du hadith ou du verset. Seuls les mérites rapportés par un texte authentique sont indiqués ; une invocation sans source fiable n'en affiche pas. Tout fonctionne hors ligne. À faire relire par une personne qualifiée (références et degrés d'authenticité).

## Parcours (mini RPG)

Menu **Plus > Parcours** : tout est en **vector art dessiné par le code** (aucune image à charger, tout marche hors ligne), dans l'esprit des RPG mobiles vus de dessus.

- **Carte du monde** : une île avec ses bâtiments (maison, école, bureau, mosquée), arbres, palmiers et montagnes ; ton avatar marche d'un lieu à l'autre. En haut, la carte du joueur et l'anneau de progression du parcours.
- **Écran de jeu d'un lieu** : décor vu de dessus (jardin et maison, cour d'école, rue avec voitures et passage piéton devant le bureau). En haut, le **HUD** : portrait, niveau, jauge **Iman** (Hasanat vers le niveau suivant) et jauge **Nour** (prières faites aujourd'hui), plus une **mini-carte** (toucher pour revenir à la carte). En bas, un **menu de commandes** (Parler, Rencontres, Carte, Accueil) et une **boîte de dialogue** avec portrait. Un « ! » signale les personnes qui attendent, un ✓ celles déjà réussies.
- **Conversations** : le décor du lieu flouté derrière, grand portrait de la personne, boîte de dialogue au même style que le HUD, texte qui s'écrit lettre par lettre (un toucher l'affiche en entier) puis les réponses.
- **Personnages** : style chibi avec contour sombre et ombres franches (`src/utils/vectorSprite.ts`, apparences dans `src/data/sprites.ts`) : respiration et clignement des yeux à l'arrêt, jambes et bras qui balancent en marchant, tenues variées (voile, turban, calot, barbe, lunettes, cravate, longue tenue). Le choix du personnage se fait sur une feuille de personnages avec rubans (six au choix, mémorisé sur l'appareil).
- Les décors sont dans `src/utils/vectorScene.ts` (un décor de repli est prévu pour les futurs lieux). Animations coupées si « réduire les animations » est activé.

Une bonne réponse déclenche des confettis et une courte vibration. Les lieux sont des étapes à franchir dans l'ordre (maison, école, travail). Chaque lieu contient des rencontres : des questions à choix multiples (parents, famille, partage, pratique religieuse à la maison ; honnêteté, prière, patience à l'école ; patron qui empêche de prier, corruption, honnêteté au travail). Bonne réponse : la rencontre est validée ; mauvaise réponse : tu es redirigé vers une **leçon** (la bonne réponse expliquée, avec sa source), puis tu retentes (l'ordre des choix change). Un lieu s'ouvre quand le précédent est terminé. Seule la progression sur la carte compte (pas de Hasanat). Tout fonctionne hors ligne ; la progression est gardée sur l'appareil.

Contenu dans `src/data/rpg.ts` (ajouter un lieu ou une rencontre suffit, les écrans s'adaptent) ; moteur dans `src/utils/rpg.ts`. Questions et sources à faire relire par une personne qualifiée.

## Rubriques de culture islamique

Menu **Plus** : Piliers de l'islam, Piliers de la foi, Portes du paradis, Portes de l'enfer. Le contenu est dans `src/data/topics.ts` (page générique `TopicPage`), avec la source de chaque texte ; à faire relire par une personne qualifiée avant diffusion large.

## Scénario de test (navigateur)

1. L'écran de démarrage s'affiche environ 2 secondes, puis l'accueil : niveau 1, 0 Hasanat, série 0.
2. Appuyer sur Fajr : +20 Hasanat. La sunna de Fajr est au-dessus de la carte.
3. Appuyer sur la sunna de Fajr : +10 Hasanat. Dhuhr a une sunna au-dessus et une en dessous.
4. Isha affiche deux sunnas en dessous (sunna après Isha et Witr).
5. Cocher les 5 prières : bonus de 50, niveau 2 atteint, série de 1 jour.
6. Recharger la page : tout est conservé.
7. Onglet « Invocations » : basculer Matin / Soir, vérifier arabe, phonétique et français, puis
   marquer une invocation comme faite (+5 Hasanat).
8. Revenir à l'accueil : la bande des jours affiche aujourd'hui en doré. Le bouton calendrier
   ouvre le mois ; les jours futurs sont grisés.
9. Pour voir un jour passé rempli, ajouter une entrée de la veille dans les données locales
   (`localStorage`, clé `CapacitorStorage.iman.progress.v1`) puis recharger, ou revenir le lendemain.
10. Onglet « Paramètres » : choisir un genre ; « Détecter ma position » (accepter la demande du
    navigateur) puis vérifier le pays affiché ; « Choisir » ouvre la liste, la recherche ignore
    les accents (« senegal » trouve « Sénégal »). Recharger : tout est conservé.
11. Sauvegarde en ligne : une adresse `http://…` autre que localhost est refusée ; sans serveur
    disponible, « Se connecter » affiche « Serveur injoignable » sans rien perdre.

## Structure

```
src/
  data/        prières et sunnas, invocations (adhkar), pays
  utils/       Hasanat/niveaux, dates, calendrier, série (fonctions pures, testées)
  services/    stockage local, ProgressRepository, client API du serveur, géolocalisation
  stores/      stores Pinia : progress (progression), settings (réglages, compte, synchronisation)
  components/  PlayerHeader, HasanatBar, PrayerGroup, PrayerCard, SunnahRow,
               WeekStrip, MonthCalendar, DhikrCard, CountryPicker, SplashScreen
  views/       TabsPage (barre d'onglets), HomePage, AdhkarPage, SettingsPage
docs/          contrat d'API du serveur de sauvegarde
resources/     icône et splash (SVG + PNG)
public/        icônes PWA (pwa-192, pwa-512, pwa-maskable-512, apple-touch-icon)
pwa.manifest.ts  manifeste de la PWA
tests/unit/    tests Vitest
```

## Prochaines étapes prévues

- Étape 2 : lecture du Coran (arabe, français, phonétique, marque-page automatique, progression) et
  sourate Al-Kahf le vendredi (texte et audio). Les textes seront chargés depuis une API publique
  (ex. alquran.cloud) ou depuis une source que tu fournis, pour éviter toute erreur de saisie.
- Invocations de la Citadelle du musulman (même principe : source à valider)
- Zakat et héritage (à décrire)
- Étape 3 : hadiths et invocations selon les situations (après la prière, avant de dormir, ...)
- Étape 4 : statistiques, historique et succès
- Étape 5 : serveur Laravel 13 de sauvegarde (le client est déjà prêt, voir `docs/API.md`)
