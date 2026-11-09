# Iman Leveling

Application mobile (Ionic 8 + Vue 3) qui transforme le suivi des pratiques religieuses en jeu :
XP, niveaux et séries de jours. Données stockées en local pour l'instant, avec une couche
`ProgressRepository` prévue pour brancher plus tard une API Laravel 13.

## Lancer et tester

Prérequis : Node 20 ou plus.

```bash
npm install
npm run dev      # ouvre l'app dans le navigateur (mode mobile conseillé dans les outils de dev)
npm test         # tests unitaires (Vitest)
npm run build    # vérification TypeScript + build de production
```

## Étape 1 : suivi des 5 prières, XP et niveaux

À tester dans le navigateur :

1. L'écran d'accueil affiche le niveau 1, 0 XP, une série de 0 jour et les 5 prières du jour.
2. Appuyer sur une prière la coche : +20 XP, la carte passe en vert, la barre d'XP avance.
3. Appuyer de nouveau la décoche : l'XP est retirée.
4. Cocher les 5 prières : +50 XP de bonus (150 XP au total), passage au niveau 2, série de 1 jour.
5. Recharger la page : tout est conservé.

Règles : 20 XP par prière, 50 XP de bonus si les 5 sont faites. Il faut 100 XP pour passer
du niveau 1 au niveau 2, puis 50 de plus à chaque niveau (150, 200, ...). La série compte les
jours consécutifs où les 5 prières sont faites ; elle n'est cassée que si hier est incomplet.

## Structure

```
src/
  data/        liste des prières
  utils/       XP/niveaux, dates, série (fonctions pures, testées)
  services/    stockage local et ProgressRepository (point d'entrée vers un futur serveur)
  stores/      store Pinia (progress)
  components/  PlayerHeader, XPBar, PrayerCard
  views/       HomePage
tests/unit/    tests Vitest
```

## Prochaines étapes prévues

- Étape 2 : lecture du Coran (pages/sourates lues, objectifs, XP)
- Étape 3 : hadiths et invocations (du matin, du soir, selon les situations)
- Étape 4 : statistiques, historique et succès
- Étape 5 : synchronisation avec le serveur Laravel
