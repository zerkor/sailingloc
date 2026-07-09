# Architecture SailingLoc

## Vue d ensemble

SailingLoc est une plateforme MVP de location de bateaux entre particuliers. Elle couvre les rôles visiteur, locataire, propriétaire et administrateur.

## Stack

- Frontend: React, Vite, Tailwind, Axios, React Router.
- Backend: Node.js, Express, JWT, Mongoose.
- Base de données: MongoDB.
- Tests: Node test runner, Supertest, Playwright.
- Documentation API: Swagger/OpenAPI.

## Structure

- `client/src`: application React.
- `server/src/controllers`: logique métier API.
- `server/src/routes`: routes Express.
- `server/src/models`: modèles Mongoose.
- `server/tests`: tests API.
- `docs`: documentation architecture, production, backup, monitoring.

## Schéma BDD

```mermaid
erDiagram
  User ||--o{ Boat : owns
  User ||--o{ Booking : rents
  Boat ||--o{ Booking : receives
  Boat ||--o{ Review : has
  Booking ||--o| Payment : generates
  User ||--o{ OwnerDocument : submits
  Boat ||--o{ OwnerDocument : verifies
  User ||--o{ Report : creates
  User ||--o{ AdminActionLog : performs
```

## Flux API

```mermaid
flowchart LR
  Client["React client"] --> API["Express API"]
  API --> Controller["Controller"]
  Controller --> Model["Mongoose model"]
  Model --> MongoDB["MongoDB"]
```

## Rôles

```mermaid
flowchart TD
  Visitor["Visiteur"] -->|"Consulte les bateaux"| Public["Catalogue public"]
  Tenant["Locataire"] -->|"Réserve et paie en simulation"| Booking["Réservations"]
  Owner["Propriétaire"] -->|"Publie bateaux et documents"| Boats["Annonces"]
  Admin["Admin"] -->|"Modère, rembourse, valide"| Backoffice["Back-office"]
```

## Workflow réservation

```mermaid
stateDiagram-v2
  [*] --> pending
  pending --> accepted
  pending --> rejected
  accepted --> confirmed
  confirmed --> completed
  pending --> cancelled
  accepted --> cancelled
```

## Workflow upload

```mermaid
flowchart LR
  Owner["Propriétaire"] --> UploadAPI["Upload API"]
  UploadAPI --> Multer["Multer"]
  Multer --> Folder["server/uploads"]
  Folder --> URL["URL /uploads/..."]
  URL --> DB["URL stockée en base"]
```

## Paiement

Le paiement est simulé via un modèle `Payment` et un provider `simulated-stripe`. Les statuts sont cohérents avec les réservations, mais aucun PSP réel n est connecté.

## Modération admin

L admin peut valider/rejeter bateaux, avis et documents, gérer les utilisateurs, consulter les paiements et suivre les actions dans `AdminActionLog`.

## Sécurité

JWT, rôles serveur, rate limiting, Helmet, validation express-validator, filtrage upload par type MIME et taille.

## Limites MVP

Paiement simulé, email non configuré, upload local, vérification documentaire manuelle, pas de messagerie temps réel, pas d audit sécurité complet.

## Améliorations futures

Stripe réel, stockage cloud, SMTP/reset password réel, messagerie, assurance partenaire, CI de déploiement, monitoring complet.
