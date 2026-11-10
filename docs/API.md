# API de sauvegarde (contrat serveur)

L'application peut lier un compte à un serveur pour sauvegarder la progression. Ce document décrit
ce que le serveur (prévu : Laravel 13) doit exposer. Le client est dans `src/services/api.ts`.

Toutes les routes sont sous `/api`, en JSON (`Accept: application/json`). L'adresse du serveur est
saisie dans l'app (Paramètres) : **HTTPS obligatoire**, sauf `http://localhost` et `http://127.0.0.1`
en développement.

## Authentification

Jeton porteur (Laravel Sanctum conseillé) : `Authorization: Bearer <token>`.

### `POST /api/auth/register`

Corps : `{ "name": string, "email": string, "password": string }` (mot de passe : 8 caractères
minimum côté app).

Réponse `201` ou `200` : `{ "token": string, "user": { "name": string, "email": string } }`

### `POST /api/auth/login`

Corps : `{ "email": string, "password": string }`. Même réponse que `register`.

### `POST /api/auth/logout`  (authentifié)

Révoque le jeton courant. Réponse `204` ou `200`.

## Progression  (authentifié)

### `GET /api/progress`

Réponse `200` : `{ "data": ProgressData, "updated_at": string | null }`
Réponse `404` si aucune progression n'est encore enregistrée (cas normal à la première synchronisation).

### `PUT /api/progress`

Corps : `{ "data": ProgressData }`. Remplace la progression du compte.
Réponse `200` : `{ "updated_at": string }` (date ISO 8601).

### Format `ProgressData`

```json
{
  "version": 1,
  "days": {
    "2026-11-09": {
      "prayers": { "fajr": true, "dhuhr": true },
      "sunnah":  { "fajr-before": true },
      "adhkar":  { "morning:kursi": true }
    }
  }
}
```

Clés de jour au format `AAAA-MM-JJ` (date locale de l'utilisateur). `sunnah` et `adhkar` sont
optionnels. Le serveur doit stocker ce JSON tel quel (colonne JSON), un enregistrement par
utilisateur.

## Erreurs

Réponse non 2xx avec `{ "message": string }` : le message est affiché tel quel à l'utilisateur
(Laravel le fournit déjà pour les erreurs de validation `422`). Un `401` sur `/progress` fait
déconnecter l'app (« session expirée »).

## Synchronisation

L'app récupère la progression du serveur, la **fusionne** avec celle de l'appareil, enregistre le
résultat localement, puis l'envoie au serveur. La fusion ne perd rien : une case cochée d'un côté
reste cochée. En contrepartie, décocher sur un appareil ne se propage pas aux autres appareils.

## CORS

Pour la version web (PWA), le serveur doit autoriser l'origine de l'app (en-tête
`Access-Control-Allow-Origin`) et les en-têtes `Authorization` et `Content-Type`.
