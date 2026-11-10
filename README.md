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

## Structure

```
src/
  data/        liste des prières
  utils/       Hasanat/niveaux, dates, série (fonctions pures, testées)
  services/    stockage local et ProgressRepository (point d'entrée vers un futur serveur)
  stores/      store Pinia (progress)
  components/  PlayerHeader, HasanatBar, PrayerGroup, PrayerCard, SunnahRow, SplashScreen
  views/       HomePage
resources/     icône et splash (SVG + PNG)
tests/unit/    tests Vitest
```

## Prochaines étapes prévues

- Étape 2 : lecture du Coran (pages/sourates lues, objectifs, Hasanat)
- Étape 3 : hadiths et invocations (du matin, du soir, selon les situations)
- Étape 4 : statistiques, historique et succès
- Étape 5 : synchronisation avec le serveur Laravel
