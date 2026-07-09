# Stratégie de backup MongoDB

## Backup local

```bash
mongodump --uri="mongodb://127.0.0.1:27017/sailingloc" --out backups/sailingloc-$(date +%Y%m%d)
```

## Restore local

```bash
mongorestore --uri="mongodb://127.0.0.1:27017/sailingloc" backups/sailingloc-YYYYMMDD/sailingloc
```

## Backup Docker

```bash
docker compose exec mongodb mongodump --db sailingloc --out /tmp/backup
docker compose cp mongodb:/tmp/backup ./backups/sailingloc
```

## Politique recommandée

- Démo locale: backup manuel avant soutenance.
- Production: backup quotidien automatisé.
- Rétention: 7 backups journaliers, 4 hebdomadaires, 6 mensuels.
- Tester une restauration au moins une fois par mois.
- Préférer MongoDB Atlas backups pour une vraie production.

Ne jamais hardcoder de vrais identifiants dans les scripts.
