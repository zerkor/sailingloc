# Production SailingLoc

SailingLoc est une application React/Vite + API Express + MongoDB. En production, le client est servi par un serveur statique ou Nginx, l API Express tourne derrière HTTPS/reverse proxy, et MongoDB doit être hébergé sur un service managé ou un serveur sauvegardé.

## Variables d environnement

Voir `.env.production.example`.

- `NODE_ENV=production`
- `PORT=5000`
- `MONGO_URI`: URI MongoDB de production.
- `JWT_SECRET`: secret long, aléatoire, non commité.
- `JWT_EXPIRES_IN`: durée de vie des JWT.
- `CLIENT_URL`: URL publique du front pour CORS.
- `FRONTEND_URL`: URL publique utilisée pour générer les liens de réinitialisation de mot de passe.
- `SERVER_URL`: URL publique de l API pour Swagger et liens.
- `PAYMENT_MODE`: `simulated` pour la démo, `stripe` pour forcer le paiement réel.
- `STRIPE_ENABLED`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY`: configuration Stripe Checkout côté serveur.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_SECURE`: configuration SMTP pour les e-mails de mot de passe oublié.
- `UPLOAD_DIR`: dossier local des fichiers uploadés.
- `MAX_FILE_SIZE_MB`: limite d upload.
- `RATE_LIMIT_WINDOW_MS` et `RATE_LIMIT_MAX`: limitation anti-abus.
- `LOG_LEVEL`: niveau de journalisation attendu.

## Déploiement Docker

```bash
docker compose up --build
docker compose logs -f
docker compose down
```

Avant toute vraie production, remplacer `JWT_SECRET`, adapter `CLIENT_URL`, `FRONTEND_URL`, `SERVER_URL`, `MONGO_URI`, configurer SMTP, et configurer un volume ou stockage persistant pour les uploads.

## Déploiement sans Docker

1. Installer Node.js LTS et MongoDB.
2. Installer les dépendances dans `server` et `client`.
3. Construire le client avec `npm run build`.
4. Servir `client/dist` avec Nginx, Apache ou un hébergement statique.
5. Lancer `server/npm start` via PM2, systemd ou un service managé.

## Sécurité

- Forcer HTTPS via reverse proxy.
- Utiliser un `JWT_SECRET` fort.
- Garder CORS limité à `CLIENT_URL`.
- Ne jamais commiter `.env`.
- Auditer les dépendances avant production.
- Limiter la taille et les types d uploads.
- Scanner les fichiers si l application devient publique.

## Uploads

L upload local est suffisant pour la démo. En production, utiliser un stockage objet privé type S3, Azure Blob, GCS ou Cloudinary avec URLs signées.

## Monitoring et logs

L API expose `/api/health` et journalise les requêtes HTTP avec Morgan. Pour une production réelle, ajouter Sentry, Grafana/Prometheus ou un service équivalent, avec alertes uptime.

## Backup MongoDB

Utiliser `mongodump`/`mongorestore` ou les backups automatiques du fournisseur MongoDB. Tester régulièrement la restauration.

## Hébergement recommandé

- Front: Netlify, Vercel, Nginx, Render static.
- API: Render, Railway, Fly.io, VPS avec PM2.
- DB: MongoDB Atlas ou MongoDB managé.

## Brevo API configuration on Render

Les emails transactionnels utilisent Brevo API par defaut sur Render. L'API HTTPS passe par le port 443 et evite les timeouts SMTP possibles sur certains hebergeurs. SMTP reste disponible en fallback avec `EMAIL_MODE=smtp`. Les secrets doivent etre configures uniquement dans Render, onglet `Environment` du Web Service :

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

Ne jamais hardcoder les identifiants Brevo : Render Environment Variables est le bon emplacement pour les secrets de production.

## Stripe Checkout production

Stripe doit être configuré uniquement dans les variables d'environnement Render. En production réelle :

- utiliser les clés live Stripe dans `STRIPE_SECRET_KEY` et `STRIPE_PUBLISHABLE_KEY` ;
- activer `STRIPE_ENABLED=true` ;
- passer `PAYMENT_MODE=stripe` uniquement quand le paiement réel est validé ;
- déclarer le webhook HTTPS `https://dsp-dev-o24a-g6-fr.onrender.com/api/payments/stripe/webhook` dans le dashboard Stripe ;
- copier le secret du webhook dans `STRIPE_WEBHOOK_SECRET` ;
- vérifier que les URLs `CLIENT_URL` et `SERVER_URL` pointent vers le bon domaine public ;
- surveiller les webhooks échoués dans Stripe Dashboard ;
- ne jamais considérer `/payment/success` comme preuve de paiement, seul le webhook confirme la réservation ;
- tester le remboursement admin sur un paiement Stripe avant toute utilisation réelle.

### Brevo IP / authorized sender note

Le code ne peut pas forcer Brevo a accepter une IP Render dynamique. Si Brevo demande une validation d'expediteur ou de domaine, elle doit etre faite manuellement dans le dashboard Brevo. Le mode API limite les problemes de ports SMTP bloques, mais l'expediteur ou le domaine doit rester verifie dans Brevo.
