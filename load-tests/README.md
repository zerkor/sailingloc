# SailingLoc Load Testing

Ces scripts k6 fournissent des scenarios realistes pour un MVP academique. Ils ne contiennent pas de resultats fictifs.

## Installation

```powershell
winget install Grafana.k6
```

## Test recommande pour l'oral

Profil stable pour Render gratuit :

```powershell
cd C:\Users\xxx75012\Documents\Codex\2026-06-20\tu-t\tmp\sailingloc-github
$env:BASE_URL="https://dsp-dev-o24a-g6-fr.onrender.com"
$env:VUS="8"
$env:DURATION="90s"
npm run load:oral
```

Sorties generees :

- `load-tests/results/oral-demo.json` : resume k6 brut.
- `load-tests/results/oral-demo-report.md` : rapport lisible pour la soutenance.

Ce profil teste un parcours public simple : accueil, catalogue bateaux API et healthcheck. Les seuils sont volontairement adaptes a Render gratuit pour presenter un resultat honnete et exploitable.

## Comparaison avant / apres

```powershell
$env:BASE_URL="https://dsp-dev-o24a-g6-fr.onrender.com"
$env:VUS="20"
$env:DURATION="2m"
npm run load:compare
```

La commande compare l'ancien smoke test progressif et le test constant-load optimise, puis genere des JSON dans `load-tests/results`.

## Autres commandes

```powershell
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/constant-load.js
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/spike-test.js
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/stress-test.js
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/api-bookings.js
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/api-payments.js
```

## Profils lourds demandes par le cahier de recette

Le test 10 000 utilisateurs pendant 24h et le pic 1 000 a 50 000 utilisateurs ne doivent pas etre lances sur un poste local ni sur un hebergement gratuit Render. Les scripts exposent les variables `VUS`, `DURATION`, `PEAK_1` et `PEAK_2` pour executer ces profils dans une infrastructure dediee.

Formulation soutenance conseillee :

> Les tests de charge ont ete prepares avec k6. Sur l'hebergement gratuit Render, nous avons execute un profil modere pour verifier la disponibilite des parcours publics. Les profils lourds sont documentes mais necessitent une infrastructure dediee afin d'eviter des resultats biaises par les limites de l'offre gratuite.
