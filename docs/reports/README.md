# Rapports et captures

Ce dossier sert a stocker les preuves de soutenance generees localement :

- rapports Lighthouse ;
- exports accessibilite ;
- captures ecran Playwright ;
- resultats de test de charge.

Les fichiers lourds generes automatiquement peuvent rester locaux et etre fournis dans le dossier de rendu final.

## Captures

```bash
npm run screenshots
```

Sortie :

```txt
docs/reports/screenshots/
```

## Lighthouse

Exemple :

```bash
npx lighthouse https://dsp-dev-o24a-g6-fr.onrender.com/ --output=html --output-path=docs/reports/lighthouse-home.html
```
