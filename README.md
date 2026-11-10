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

**Icône et écran de démarrage.** Un croissant et une étoile dorés sur fond émeraude, avec des
chevrons de niveau. Les sources sont dans `resources/` (SVG et PNG). L'app affiche un écran de
démarrage animé au lancement ; sur mobile, `npm run assets` génère l'icône et le splash natifs
(iOS et Android) à partir de `resources/` une fois les plateformes ajoutées
(`npx cap add android`, `npx cap add ios`).

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

## Structure

```
src/
  data/        prières et sunnas, invocations (adhkar)
  utils/       Hasanat/niveaux, dates, calendrier, série (fonctions pures, testées)
  services/    stockage local et ProgressRepository (point d'entrée vers un futur serveur)
  stores/      store Pinia (progress)
  components/  PlayerHeader, HasanatBar, PrayerGroup, PrayerCard, SunnahRow,
               WeekStrip, MonthCalendar, DhikrCard, SplashScreen
  views/       TabsPage (barre d'onglets), HomePage, AdhkarPage
resources/     icône et splash (SVG + PNG)
public/        icônes PWA (pwa-192, pwa-512, pwa-maskable-512, apple-touch-icon)
pwa.manifest.ts  manifeste de la PWA
tests/unit/    tests Vitest
```

## Prochaines étapes prévues

- Étape 2 : lecture du Coran (pages/sourates lues, objectifs, Hasanat)
- Étape 3 : hadiths et invocations selon les situations (après la prière, avant de dormir, ...)
- Étape 4 : statistiques, historique et succès
- Étape 5 : synchronisation avec le serveur Laravel
