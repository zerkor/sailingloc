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

## Brevo SMTP configuration on Render

Les emails transactionnels utilisent Brevo SMTP via Nodemailer cote serveur. Les secrets doivent etre configures uniquement dans Render, onglet `Environment` du Web Service :

```env
EMAIL_PROVIDER=brevo
EMAIL_MODE=smtp
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_SECURE=false
BREVO_SMTP_USER=your_brevo_smtp_login
BREVO_SMTP_PASS=your_brevo_smtp_key
BREVO_API_KEY=your_brevo_api_key_optional
EMAIL_FROM_NAME=SailingLoc
EMAIL_FROM_ADDRESS=contact@sailingloc.fr
EMAIL_REPLY_TO=contact@sailingloc.fr
CLIENT_URL=https://sailingloc-uwvo.onrender.com
SERVER_URL=https://sailingloc-uwvo.onrender.com
EMAIL_ENABLED=true
EMAIL_LOG_ONLY=false
```

Ne jamais hardcoder les identifiants Brevo : Render Environment Variables est le bon emplacement pour les secrets de production.

### Brevo IP / authorized sender note

Le code ne peut pas forcer Brevo a accepter une IP Render dynamique. Si Brevo demande une validation d'expediteur ou de domaine, elle doit etre faite manuellement dans le dashboard Brevo. Si l'allowlist IP Brevo est activee, utiliser une IP sortante statique cote hebergement ou desactiver cette restriction et s'appuyer sur les identifiants SMTP authentifies avec domaine/expediteur verifie.
