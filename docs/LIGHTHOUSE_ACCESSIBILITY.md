# Audit Lighthouse et accessibilite - SailingLoc

## Objectif

Produire une preuve de qualite front-end pour la soutenance :

- performance percue ;
- accessibilite ;
- bonnes pratiques ;
- SEO ;
- absence de regressions responsive majeures.

## Pages a tester

| Page | URL production |
| --- | --- |
| Accueil | `https://sailingloc-uwvo.onrender.com/` |
| Catalogue | `https://sailingloc-uwvo.onrender.com/boats` |
| Fiche bateau | `https://sailingloc-uwvo.onrender.com/boats/<id-ou-slug>` |
| Connexion | `https://sailingloc-uwvo.onrender.com/login` |
| Inscription | `https://sailingloc-uwvo.onrender.com/register` |
| Contact | `https://sailingloc-uwvo.onrender.com/contact` |
| Limites MVP | `https://sailingloc-uwvo.onrender.com/mvp-limitations` |

## Procedure Chrome DevTools

1. Ouvrir Chrome en navigation privee.
2. Aller sur la page a tester.
3. Ouvrir DevTools.
4. Onglet `Lighthouse`.
5. Mode `Mobile`, categories :
   - Performance ;
   - Accessibility ;
   - Best Practices ;
   - SEO.
6. Lancer l'audit.
7. Exporter le rapport en HTML/PDF.
8. Refaire sur `Desktop` pour l'accueil et le catalogue.

## Procedure CLI optionnelle

```bash
npx lighthouse https://sailingloc-uwvo.onrender.com/ \
  --preset=desktop \
  --output=html \
  --output-path=docs/reports/lighthouse-home-desktop.html
```

Mobile :

```bash
npx lighthouse https://sailingloc-uwvo.onrender.com/ \
  --form-factor=mobile \
  --screenEmulation.mobile=true \
  --output=html \
  --output-path=docs/reports/lighthouse-home-mobile.html
```

## Tests accessibilite manuels

Verifier :

- navigation clavier avec `Tab`, `Shift+Tab`, `Enter` ;
- focus visible sur liens, boutons, champs ;
- labels lisibles sur formulaires ;
- textes contrastes sur fonds sombres ;
- menu mobile ouvrable au clavier ;
- images principales avec attribut `alt` ;
- aucun scroll horizontal involontaire en 360px.

## Grille de resultats a remplir

| Page | Mobile perf | Mobile a11y | Desktop perf | Desktop a11y | Commentaire |
| --- | ---: | ---: | ---: | ---: | --- |
| Accueil | A remplir | A remplir | A remplir | A remplir |  |
| Catalogue | A remplir | A remplir | A remplir | A remplir |  |
| Fiche bateau | A remplir | A remplir | A remplir | A remplir |  |
| Connexion | A remplir | A remplir | A remplir | A remplir |  |

## Formulation soutenance

> Une passe UI responsive a ete realisee sur les composants critiques : navigation, cards, formulaires, galeries, dashboards et footer. Les controles Lighthouse/accessibilite servent de preuve qualite. Les optimisations restantes avant production concernent surtout l'optimisation avancee des images et le suivi automatise des Core Web Vitals.
