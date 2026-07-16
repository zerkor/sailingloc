# Configuration SMTP Render - SailingLoc

## Statut projet

Le backend SailingLoc contient deja :

- `nodemailer` ;
- `server/src/utils/mailService.js` ;
- route `POST /api/auth/forgot-password` ;
- route `POST /api/auth/reset-password/:token` ;
- stockage du token hash en base ;
- expiration du token ;
- page front `/reset-password/:token`.

Il reste a configurer un vrai fournisseur SMTP dans Render.

## Variables Render a renseigner

Dans Render :

`Service` -> `Environment` -> `Add Environment Variable`

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="SailingLoc <no-reply@sailingloc.fr>"
SMTP_SECURE=false
FRONTEND_URL=https://sailingloc-uwvo.onrender.com
CLIENT_URL=https://sailingloc-uwvo.onrender.com
SERVER_URL=https://sailingloc-uwvo.onrender.com
```

Si le fournisseur utilise le port `465` :

```env
SMTP_PORT=465
SMTP_SECURE=true
```

## Fournisseurs SMTP possibles

Pour une soutenance, choisir un fournisseur simple :

| Fournisseur | Usage |
| --- | --- |
| Brevo | Simple pour SMTP transactionnel |
| Mailtrap | Tres pratique pour test sans envoyer a de vrais utilisateurs |
| Gmail App Password | Possible mais moins propre pour projet pro |
| SendGrid | Adapte production, configuration un peu plus longue |

## Test manuel

1. Deployer Render apres ajout des variables.
2. Ouvrir `/forgot-password`.
3. Saisir un compte existant, par exemple `tenant1@sailingloc.fr`.
4. Verifier la reception du mail.
5. Cliquer le lien `/reset-password/:token`.
6. Changer le mot de passe.
7. Se connecter avec le nouveau mot de passe.

## Test API rapide

```bash
curl -X POST https://sailingloc-uwvo.onrender.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tenant1@sailingloc.fr\"}"
```

Reponse attendue :

```json
{
  "message": "Si un compte existe pour cet email, un lien de reinitialisation sera envoye."
}
```

## Point de vigilance

La reponse est volontairement generique pour ne pas reveler si un email existe en base.

## Phrase soutenance

> Le systeme de mot de passe oublie est implemente de bout en bout. Le token n'est jamais stocke en clair, il est hashe en base et expire automatiquement. L'envoi reel depend de la configuration SMTP Render, documentee dans le projet.
