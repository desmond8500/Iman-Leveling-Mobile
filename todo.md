# [Todo Iman Leveling](readme.md)

## Application

- [ ] ajouter la couleur jaune à l'application et l'activer les jours blancs
- [ ] faire un système de rappel les jours blancs
- [ ] ajouter la couleur or pour les jours de fete
 

## Pages

- [x] Piliers de l'islam
- [x] piliers de la foi
- [x] Portes du paradis
- [x] Portes de l'enfer
- [x] ajouter une page
- [x] utiliser l'api HadeethEnc 

## Zikr

- [x] Système de chapelet comme celui de la video en dessous, créer une page pour ça
- [inspiration pour soubhannalah, al hamdou lilah alahou akbar](https://www.youtube.com/shorts/vHzrPW9kh1c)
- [x] Ajouter les récompenses de chaque zikr (uniquement celles qui ont une source authentique ; sans source, rien n'est affiché)
- [ ] Ajouter une interface coté backend d'en rajouter (reporté : l'application fonctionne 100 % hors ligne, seule la progression est sauvegardée en ligne)

## Zakat

- [x] Zakat al-Maal, mettre en place un système de calcul

## Héritage en islam

- [x] Créer une page ou l'on peut définer la généalogie de la personne, lister les biens avec leurs valeurs pour donner en fin la répartition

## Evenements

- [x] Créer la page, et les sous pages seront vides pour le moment
- [x] aid al fitr
- [x] aid el kebir
- [x] Mariage
- [x] Bapteme
- [x] decès

## Widgets

> Code natif non compilé ni testé sur téléphone à ce stade : cases cochées = implémenté, à vérifier sur appareil. Le widget hadith affiche le hadith du jour (HadeethEnc, non essayé en réel).

- [ ] rendre les widgets responsive en fonction de la taille des fenêtres 

- [x] Crée un widget pour l'application mobile qui affiche la date, la prière valide dans l'heure en cours et les prière surrérogatoires
- [x] ajouter la possibilité de valider directement les taches faites
- [x] Widget des invocations du matin et du soir,
  - une invocation à la fois
  - bascule sur la suivante quand c'est validé
- [x] Widget ramadan
  - Jours fait et jours restants
  - heure de la rupture
- [x] Widget hadith aléaoire
- [x] Widget nom d'allah aléatoire

## Erreurs

- [x] paramètres, j'ai une erreur "Les cases du jour 2026-11-11 (counts) doivent être des booléens".

## invocations

- [ ] Ajouter une interface coté backend pour en rajouter pour les trois sections (reporté, voir ci-dessus)

## RPG

- [x] Moteur du parcours (carte, lieux, questions, leçon en cas d'erreur, progression hors ligne) et trois lieux : maison, école, travail
- [ ] Autres lieux et rencontres (mosquée, marché, voyage, voisinage…) : contenu à ajouter dans `src/data/rpg.ts`

Je veux faire un mini rpg dans l'application ou l'utilisateur doit faire un parcours avec des obstacles ou on lui pose des questions à choix multiples Si la réponse est bonne il pourra avancer si non il sera redirigé vers une autre route pour qu'il puisse apprendre la bonne réponse.

Le parcours commence à la maison. Il doit etre possible de poser des questions aux personnes occupant la maison sur des sujet se reportant à l'environnement. Par exemple à la maison des questions par rapport à la relation aux parents, la famille, le partage, les activitées religieuses.

Sur le parcours il y aura l'école par exemple ou le boulot. Au boulot par exemple il faudra mettre des obstacles comme un patron qui t'empeche de prier au bureau et faire en sorte que le protagoniste trouve une solution parmis plusieurs à disposition.