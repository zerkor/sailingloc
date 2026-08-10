# SailingLoc

Plateforme full-stack de location de bateaux entre particuliers, avec espaces visiteur, locataire, propriétaire et administrateur.

## Fonctionnalités

- Catalogue public avec filtres, fiches bateaux et avis.
- Optimisations SEO MVP : titres/metas dynamiques, fiches bateaux avec slugs, robots.txt, sitemap.xml et pages privees en noindex.
- Mot de passe oublie avec token hashe en base et envoi Brevo configurable.
- Authentification JWT avec rôles `tenant`, `owner`, `admin`.
- Réservations, acceptation propriétaire, paiement simulé et intégration Stripe Checkout optionnelle.
- Back-office admin : utilisateurs, bateaux, réservations, avis, documents, paiements, signalements, journal d actions.
- Upload local réel pour images de bateaux et documents propriétaire.
- Swagger/OpenAPI, tests API, E2E Playwright, Docker, CI GitHub Actions.

## Quick Start

Terminal backend :

```powershell
cd C:\Users\xxx75012\Documents\Codex\2026-06-20\tu-t\tmp\sailingloc-github\server
npm install
npm run seed
npm run dev
```

Terminal frontend :

```powershell
cd C:\Users\xxx75012\Documents\Codex\2026-06-20\tu-t\tmp\sailingloc-github\client
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173).

## Variables d environnement

Créer `server/.env` :

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sailingloc
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
VITE_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
TURNSTILE_SECRET_KEY=your_cloudflare_turnstile_secret_key
FRONTEND_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
EMAIL_PROVIDER=brevo
EMAIL_MODE=api
EMAIL_ENABLED=false
EMAIL_LOG_ONLY=true
BREVO_API_KEY=your_brevo_api_key
BREVO_API_URL=https://api.brevo.com/v3/smtp/email
EMAIL_API_TIMEOUT_MS=15000
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_SECURE=false
BREVO_SMTP_USER=your_brevo_smtp_login
BREVO_SMTP_PASS=your_brevo_smtp_key
EMAIL_FROM_NAME=SailingLoc
EMAIL_FROM_ADDRESS=contact@sailingloc.fr
EMAIL_REPLY_TO=contact@sailingloc.fr
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
LOG_LEVEL=debug
```

Pour la production, voir `.env.production.example` et [docs/PRODUCTION.md](docs/PRODUCTION.md).

## SEO / SSR

SailingLoc est une SPA React/Vite rendue cote client. Le projet ne met pas en place un vrai SSR : le HTML source initial contient principalement le conteneur React, puis le contenu est rendu par JavaScript.

Des mitigations SEO ont ete mises en place pour le MVP : `react-helmet-async`, titles/metas par page, fiches bateaux avec slugs, JSON-LD, `robots.txt`, `sitemap.xml` et `noindex` sur les zones privees. Voir [docs/SEO.md](docs/SEO.md) et [docs/SEO_SSR_AUDIT.md](docs/SEO_SSR_AUDIT.md).

Les fiches bateaux publiques utilisent des URLs lisibles :

```text
/boats/hanse-455-marseille
```

Les anciennes URLs par identifiant MongoDB restent acceptées par l'API et redirigent côté frontend vers le slug quand il existe.

Commandes utiles après import ou correction de données :

```powershell
cd server
npm run backfill:slugs
npm run generate:sitemap
```

## Brevo API sur Render

Les emails transactionnels SailingLoc utilisent Brevo API par défaut sur Render, car l'API HTTPS passe par le port 443 et évite les timeouts SMTP possibles sur certains hébergements. SMTP reste disponible en fallback avec `EMAIL_MODE=smtp`. Les identifiants ne doivent jamais être écrits dans le code ni envoyés au frontend.

Variables à ajouter dans Render :

```env
EMAIL_PROVIDER=brevo
EMAIL_MODE=api
BREVO_API_KEY=your_brevo_api_key
BREVO_API_URL=https://api.brevo.com/v3/smtp/email
EMAIL_API_TIMEOUT_MS=15000
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_SECURE=false
BREVO_SMTP_USER=your_brevo_smtp_login
BREVO_SMTP_PASS=your_brevo_smtp_key
EMAIL_FROM_NAME=SailingLoc
EMAIL_FROM_ADDRESS=contact@sailingloc.fr
EMAIL_REPLY_TO=contact@sailingloc.fr
CLIENT_URL=https://dsp-dev-o24a-g6-fr.onrender.com
SERVER_URL=https://dsp-dev-o24a-g6-fr.onrender.com
EMAIL_ENABLED=true
EMAIL_LOG_ONLY=false
```

En local, garder `EMAIL_ENABLED=false` ou `EMAIL_LOG_ONLY=true` pour tester sans envoyer de vrais emails.

Note Brevo IP / expéditeur autorisé : l'application ne peut pas valider automatiquement un domaine, un expéditeur ou une IP dans Brevo. Ces réglages se font manuellement dans le dashboard Brevo. En mode API, la connexion sortante utilise HTTPS 443, mais l'expéditeur/domaine doit quand même être vérifié dans Brevo.

## Stripe payment integration

SailingLoc conserve le paiement simulé pour la démonstration, et peut utiliser Stripe Checkout pour un paiement réel de réservation. La version Render peut fonctionner sans webhook : après le retour Stripe sur `/payment/success`, le frontend appelle le backend, et le backend vérifie la session avec la clé privée Stripe avant de confirmer la réservation.

Variables à configurer :

```env
PAYMENT_MODE=simulated
STRIPE_ENABLED=false
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_CURRENCY=eur
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
```

## Corrections qualité soutenance

- SEO dynamique via `react-helmet-async`.
- Titres, descriptions, Open Graph, Twitter Cards et canoniques par page.
- Fiches bateaux avec SEO dynamique, H1 spécifique et JSON-LD.
- URLs bateaux par slug sans accents ni caractères spéciaux, avec fallback ID.
- Pages admin/propriétaire/légales en `noindex`.
- Suppression compte implémentée en soft delete/anonymisation.
- Calendrier de réservation clarifié : disponible, indisponible, sélectionné, aujourd'hui.
- Scripts de tests API, couverture, validation DB, validation déploiement et k6.

## Commandes de validation

```powershell
npm run build
npm run test
npm run test:coverage
npm run test:e2e
npm run validate:db
npm run validate:deploy
```

## Tests de charge k6

```powershell
npm run load:constant
npm run load:spike
npm run load:stress
npm run load:bookings
npm run load:payments
```

Les scénarios lourds 10 000 utilisateurs pendant 24h et 1 000 à 50 000 utilisateurs sont documentés dans `load-tests/README.md`. Ils ne doivent pas être lancés sur un poste local ou un hébergement gratuit.

## Limite SEO MVP

SailingLoc reste une SPA React. Les métadonnées dynamiques améliorent le rendu navigateur, mais le HTML source initial ne sera pas équivalent à du SSR. Pour une vraie production SEO, prévoir Next.js/SSR ou prerendering des pages publiques.

Pour tester le parcours :

1. Créer une réservation avec un compte locataire.
2. Accepter la réservation avec un compte propriétaire.
3. Cliquer sur `Payer avec Stripe` dans `/my-bookings`.
4. Finaliser le paiement dans Stripe Checkout avec les cartes de test officielles Stripe.
5. Vérifier que la page `/payment/success` confirme la réservation, crée la facture PDF et met à jour l'admin après validation serveur de la session Stripe.

Sur Render, ajouter les variables dans `Environment`. Pour ce mode simplifié, `STRIPE_WEBHOOK_SECRET` peut rester vide. Notes sécurité : ne jamais exposer `STRIPE_SECRET_KEY`, ne pas stocker de données carte, et garder `PAYMENT_MODE=simulated` tant que le projet reste en démo fictive.

## Docker

```bash
docker compose up --build
docker compose logs -f
docker compose down
```

Services inclus : `mongodb`, `server`, `client`. Le client est exposé sur [http://localhost:8080](http://localhost:8080).

## API Swagger

Une fois le serveur lancé :

[http://localhost:5000/api-docs](http://localhost:5000/api-docs)

Healthcheck :

[http://localhost:5000/api/health](http://localhost:5000/api/health)

## Tests

Backend complet :

```bash
cd server
npm test
```

Tests admin critiques :

```bash
cd server
npm run test:admin
```

E2E Playwright :

```bash
cd client
npx playwright install
npm run test:e2e
```

Lint et format :

```bash
cd server
npm run lint
npm run format:check

cd ../client
npm run lint
npm run format:check
```

## CI/CD

Le pipeline `.github/workflows/ci.yml` s exécute sur `push` et `pull_request` :

- install serveur/client ;
- lint si disponible ;
- format check si disponible ;
- tests serveur ;
- build client ;
- E2E Playwright.

## Uploads

Endpoints :

- `POST /api/uploads/boat-images`
- `POST /api/uploads/documents`

Les fichiers sont servis depuis `/uploads`. Pour une vraie production, remplacer le stockage local par un stockage objet cloud.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Production](docs/PRODUCTION.md)
- [Logging et monitoring](docs/LOGGING_MONITORING.md)
- [Backup MongoDB](docs/BACKUP_STRATEGY.md)
- [Audit final soutenance](docs/AUDIT_FINAL_SOUTENANCE.md)
- [Identifiants de recette](docs/IDENTIFIANTS_RECETTE.md)
- [SMTP Render](docs/SMTP_RENDER.md)
- [Lighthouse et accessibilité](docs/LIGHTHOUSE_ACCESSIBILITY.md)
- [Tests de montée en charge](docs/TEST_CHARGE.md)
- [Tests](TESTS.md)

## Comptes de démonstration

Après `npm run seed` :

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Admin | `admin@sailingloc.fr` | `Admin123!` |
| Propriétaire | `owner1@sailingloc.fr` à `owner14@sailingloc.fr` | `Owner123!` |
| Locataire | `tenant1@sailingloc.fr` à `tenant20@sailingloc.fr` | `Tenant123!` |

## Limites MVP

La page `/mvp-limitations` clarifie les limites pour la soutenance :

- paiement simulé ;
- envoi email actif uniquement si les variables Brevo sont configurées ;
- upload local à remplacer par du cloud en production ;
- vérification documentaire manuelle ;
- pas encore de messagerie temps réel, application mobile, assurance partenaire ni arbitrage complet.

## Captures écran soutenance

Installer les dépendances Playwright du client puis lancer :

```bash
cd client
npx playwright install chromium
cd ..
npm run screenshots
```

Les captures sont générées dans `docs/reports/screenshots`.

## Test de charge

Installer k6 puis lancer :

```bash
k6 run load-tests/k6/sailingloc-smoke.js
```

Voir [docs/TEST_CHARGE.md](docs/TEST_CHARGE.md).

## Backup MongoDB

Documentation : [docs/BACKUP_STRATEGY.md](docs/BACKUP_STRATEGY.md)

Scripts :

```bash
scripts/backup-mongo.sh
scripts/restore-mongo.sh backups/sailingloc-YYYYMMDD/sailingloc
```
