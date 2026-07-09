# Logging et monitoring

## Actuel

- Morgan journalise chaque requête HTTP.
- Le middleware d erreur centralise les erreurs Express.
- `/api/health` retourne l état de l API, l horodatage et l environnement.

## Bonnes pratiques production

- Ne jamais logger les mots de passe, JWT ou documents sensibles.
- Rediriger les logs applicatifs vers un collecteur centralisé.
- Configurer une rétention de 30 à 90 jours selon le besoin.
- Ajouter Sentry ou équivalent pour les exceptions.
- Ajouter un monitoring uptime sur `/api/health`.
- Surveiller CPU, mémoire, disque, latence API et erreurs 5xx.

## Exemple healthcheck

```bash
curl https://api.example.com/api/health
```

Réponse attendue:

```json
{
  "status": "ok",
  "timestamp": "2026-07-07T10:00:00.000Z",
  "environment": "production"
}
```
