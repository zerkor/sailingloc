# Tests de montee en charge - SailingLoc

## Objectif

Valider que le MVP SailingLoc reste stable sur les parcours publics les plus consultes :

- page d'accueil ;
- catalogue bateaux ;
- healthcheck API ;
- endpoint API catalogue.

Le test ne remplace pas un audit performance production. Il fournit une preuve de soutenance sur la stabilite du service deploye.

## Outil retenu

`k6`, car il est simple a installer, scriptable en JavaScript et adapte aux tests HTTP.

## Installation

Windows :

```powershell
winget install k6.k6
```

macOS :

```bash
brew install k6
```

## Execution

Depuis la racine du projet :

```bash
k6 run load-tests/k6/sailingloc-smoke.js
```

Pour tester une autre URL :

```bash
k6 run -e BASE_URL=https://sailingloc-uwvo.onrender.com load-tests/k6/sailingloc-smoke.js
```

## Scenario

Le scenario `progressive_load` simule :

| Phase | Duree | Utilisateurs virtuels |
| --- | ---: | ---: |
| Montee initiale | 30 s | 5 |
| Charge moderee | 1 min | 15 |
| Charge soutenue MVP | 1 min | 30 |
| Descente | 30 s | 0 |

## Seuils acceptes

| Indicateur | Seuil |
| --- | --- |
| Taux d'erreur HTTP | < 5 % |
| p95 temps de reponse | < 1200 ms |
| Checks fonctionnels | > 95 % |

## Resultats a reporter

Apres execution, copier ici les lignes k6 importantes :

```txt
checks.........................:
http_req_failed................:
http_req_duration..............:
iterations.....................:
vus_max........................:
```

## Interpretation soutenance

Si les seuils passent, formuler ainsi :

> Le MVP supporte une charge progressive moderee sur les pages publiques et endpoints principaux. Les tests montrent une stabilite suffisante pour une demonstration et une premiere mise en ligne. Une campagne plus large serait necessaire avant une production commerciale.

Si les seuils echouent :

> Les resultats montrent une limite de performance a corriger avant production. Les pistes principales sont l'optimisation MongoDB, le cache, la compression assets, le dimensionnement Render et le stockage cloud pour les fichiers.
