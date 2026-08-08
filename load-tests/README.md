# SailingLoc Load Testing

Ces scripts k6 fournissent des scénarios réalistes pour un MVP académique. Ils ne contiennent pas de résultats fictifs.

## Installation

```powershell
winget install Grafana.k6
```

## Commandes

```powershell
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/constant-load.js
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/spike-test.js
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/stress-test.js
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/api-bookings.js
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/api-payments.js
```

## Profils lourds demandés par le cahier de recette

Le test 10 000 utilisateurs pendant 24h et le pic 1 000 à 50 000 utilisateurs ne doivent pas être lancés sur un poste local ni sur un hébergement gratuit Render. Les scripts exposent les variables `VUS`, `DURATION`, `PEAK_1` et `PEAK_2` pour exécuter ces profils dans une infrastructure dédiée.
