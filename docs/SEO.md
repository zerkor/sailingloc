# SEO SailingLoc

## Probleme releve par le professeur

Le retour indique : "Manque SSR, JavaScript contenu, page inspecter que la div root".

Cela signifie que SailingLoc est une application React rendue cote client : le HTML initial envoye au navigateur contient surtout la balise racine React, puis le contenu public est injecte par JavaScript. C'est fonctionnel pour l'utilisateur, mais moins favorable au SEO qu'un rendu serveur ou qu'un prerender des pages publiques.

## Architecture actuelle

- Frontend : React 18 + Vite + React Router.
- Rendu : SPA client-side avec `BrowserRouter`.
- Backend : Express sert l'API et le build statique du frontend en production Render.
- Pas de Next.js, pas de SSR Node, pas de SSG natif.

Le projet ne pretend donc pas avoir un vrai SSR. Les corrections appliquees sont une mitigation SEO realiste pour le MVP.

## Ameliorations mises en place

- `react-helmet-async` configure avec `HelmetProvider`.
- Composant `SEO` centralise : title, meta description, canonical, Open Graph, Twitter Card, robots et JSON-LD.
- Titres et descriptions uniques sur les pages publiques principales :
  - accueil ;
  - bateaux ;
  - categories ;
  - catalogue / produits ;
  - contact ;
  - pages legales ;
  - limites MVP.
- Fiche bateau avec SEO dynamique selon les donnees :
  - titre du bateau ;
  - localisation ;
  - type ;
  - capacite ;
  - prix par jour ;
  - image principale ;
  - JSON-LD `Product` / `Offer`.
- H1 clair sur les pages publiques.
- URLs bateaux avec slugs SEO :
  - exemple : `/boats/hanse-455-marseille`.
  - les anciennes URLs par identifiant restent compatibles.
- Slugs sans accents ni caracteres speciaux via `server/src/utils/slugify.js`.
- Pages admin, proprietaire, profil, reservations, paiement et authentification en `noindex`.
- `robots.txt` avec exclusion du back-office et des pages privees.
- `sitemap.xml` avec les pages publiques indexables.

## Limite restante

React Helmet modifie le DOM une fois l'application chargee par le navigateur. Cela ameliore les balises SEO visibles dans DevTools et par certains crawlers modernes, mais ne remplace pas un vrai SSR.

En inspectant le "View Source" HTML brut, on verra encore principalement le conteneur React. C'est la limite structurelle d'une SPA Vite.

## Recommandation future

Pour une version production orientee SEO avance, il faudrait choisir une de ces evolutions :

- migration vers Next.js avec SSR/SSG pour les pages publiques ;
- prerendering des routes publiques critiques au build ;
- generation dynamique d'un sitemap avec tous les bateaux approuves ;
- conservation de l'API Express en backend separe ou migration progressive vers des routes server-side.

## Verification

1. Ouvrir `/` puis verifier le titre : `SailingLoc — Location de bateaux entre particuliers`.
2. Ouvrir `/boats` et verifier la meta description dans DevTools.
3. Ouvrir une fiche bateau avec slug : `/boats/<slug-du-bateau>`.
4. Verifier que le H1 contient le nom du bateau et sa ville.
5. Verifier `robots.txt` : `/admin`, `/owner`, `/profile`, `/my-bookings` sont disallow.
6. Verifier `sitemap.xml` : les pages publiques principales sont listees.
7. Verifier que les pages privees renvoient `<meta name="robots" content="noindex,nofollow">` apres chargement React.
