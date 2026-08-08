# Validation de Déploiement SailingLoc

## Pré-déploiement

- Vérifier `MONGO_URI`.
- Vérifier `JWT_SECRET`.
- Vérifier `CLIENT_URL`, `FRONTEND_URL` et `SERVER_URL`.
- Vérifier `BREVO_API_KEY` si emails réels activés.
- Vérifier `STRIPE_SECRET_KEY` et `VITE_STRIPE_PUBLISHABLE_KEY` si Stripe activé.
- Vérifier `TURNSTILE_SECRET_KEY` et `TURNSTILE_SITE_KEY` ou `VITE_TURNSTILE_SITE_KEY`.
- Lancer `npm run build`.
- Lancer `npm run validate:db`.

## Tests de déploiement

- La page d'accueil charge.
- `/api/health` retourne `status: ok` et `database: connected`.
- `/api/boats` retourne la liste des bateaux.
- `/api-docs` est accessible.
- Connexion admin fonctionnelle.
- Connexion locataire/propriétaire fonctionnelle.
- Création réservation fonctionnelle.
- Paiement simulé ou Stripe test fonctionnel selon configuration.
- Test email admin fonctionnel si Brevo est configuré.

## Post-déploiement

```powershell
npm run validate:deploy
```

Contrôler ensuite :

- logs Render sans erreur répétée ;
- absence de fallback démo silencieux ;
- images bateaux chargées ;
- captcha Cloudflare visible sur contact/inscription ;
- aucune erreur CORS ;
- aucun secret visible côté client.
