# Audit complet du site web SailingLoc

Date d'audit : 22 juillet 2026  
URL de production : https://dsp-dev-o24a-g6-fr.onrender.com/  
Depot : https://github.com/zerkor/sailingloc

## 1. Presentation du site

SailingLoc est une plateforme de location de bateaux entre particuliers. Le site vise trois profils :

- locataire : rechercher un bateau, consulter une fiche, reserver et suivre ses reservations ;
- proprietaire : publier et gerer ses bateaux, suivre les demandes, transmettre des documents ;
- administrateur : moderer utilisateurs, bateaux, reservations, avis, documents, paiements et signalements.

Fonctionnalites principales : accueil, catalogue, filtres, fiches bateaux, reservation, authentification JWT, reset password, dashboards owner/admin, moderation admin, upload controle, Swagger, i18n FR/DE/EN/IT/RU/AR avec RTL arabe.

## 2. Audit UX

Points positifs :

- navigation principale claire ;
- parcours locataire coherent : accueil -> recherche -> fiche -> reservation ;
- espaces owner/admin separes et proteges ;
- dropdown langue compact avec langue active ;
- etats loading/empty/errors presents sur les zones critiques.

Points de friction :

- compte proprietaire actif immediatement ; la validation admin concerne surtout bateaux/documents/avis ;
- paiement simule a annoncer comme limite MVP ;
- SMTP necessaire pour rendre le reset password reel en production ;
- tableaux admin/proprietaire a verifier manuellement sur mobile.

## 3. Audit UI

La charte est coherente : bleu marine, cyan, blanc, fonds clairs, titres Playfair Display et interface Outfit. Les cartes bateaux, badges, icones Lucide et images locales par categorie donnent un rendu presentable.

Corrections deja appliquees :

- rythme vertical homepage compacte ;
- dropdown langue moderne ;
- images bateaux par categorie ;
- correction SEO de base pendant cet audit : meta encodee, Open Graph, robots et sitemap production.

## 4. Audit responsive

Breakpoints a valider : 320, 360, 390, 414, 768, 1024, 1366 et 1440 px.

Zones critiques :

- navbar + burger + dropdown langue ;
- hero avec image ronde ;
- catalogue et cartes bateaux ;
- fiche bateau ;
- pages auth ;
- dashboards owner/admin ;
- footer.

Etat actuel : responsive implemente, `overflow-x` limite, menu mobile compact, paddings homepage reduits. Verification visuelle finale encore recommandee sur Render.

## 5. Audit fonctionnel

| Fonction | Etat | Commentaire |
| --- | --- | --- |
| Inscription tenant | Implemente | A tester sur Render |
| Inscription owner | Implemente | Actif immediatement |
| Connexion tenant/owner/admin | Implemente | A tester avec comptes recette |
| Deconnexion | Implemente | A tester |
| Mot de passe oublie | Implemente | Necessite SMTP |
| Recherche bateaux | Implemente | API + front |
| Filtres type/budget/skipper | Implemente | A tester sur catalogue |
| Fiche bateau | Implemente | A tester avec slug/id |
| Reservation | Implemente | Paiement simule |
| Dashboard owner | Implemente | Routes protegees |
| Dashboard admin | Implemente | Routes protegees |
| Moderation bateaux | Implemente | Admin |
| Moderation avis/documents | Implemente | Admin |
| Contact | Implemente | A tester |

## 6. Audit technique

Stack : React/Vite, React Router, i18next, Node/Express, MongoDB/Mongoose, JWT, bcrypt, Helmet, CORS, rate-limit, Multer, Swagger, Playwright, Supertest, k6.

Points positifs :

- HTTPS via Render ;
- `/api/health` disponible ;
- `/api-docs` disponible ;
- Helmet actif ;
- rate limit applique sur `/api` ;
- upload limite par type MIME et taille ;
- build monorepo configure pour servir le frontend depuis Express.

Limites :

- upload local non persistant sur Render gratuit ;
- SMTP obligatoire pour le reset password reel ;
- paiement reel non branche ;
- monitoring/logging avances limites a la documentation et aux logs Render.

## 7. Audit SEO

Points presents :

- composant `SEO` ;
- `robots.txt` ;
- `sitemap.xml` ;
- URLs publiques propres ;
- alt images bateaux via titre dynamique.

Corrections appliquees pendant l'audit :

- `robots.txt` pointe maintenant vers `https://dsp-dev-o24a-g6-fr.onrender.com/sitemap.xml` ;
- `sitemap.xml` pointe maintenant vers l'URL Render et inclut pages publiques utiles ;
- `client/index.html` corrige la meta description mal encodee ;
- ajout de `theme-color`, Open Graph et Twitter card.

Recommandations :

- ajouter canonical URLs ;
- enrichir JSON-LD Organization/WebSite ;
- generer un sitemap dynamique des fiches bateaux en vraie production.

## 8. Audit accessibilite

Points positifs :

- focus visible global ;
- labels presents sur formulaires principaux ;
- images bateaux avec alt ;
- dropdown langue avec `aria-haspopup`, `aria-expanded`, options boutons, Escape et clic exterieur ;
- menu burger avec `aria-expanded`.

Tests a faire avec WAVE :

- accueil ;
- catalogue ;
- login ;
- fiche bateau ;
- dashboard admin si possible.

## 9. Audit securite

Points positifs :

- mots de passe hashes avec bcrypt ;
- JWT sur routes privees ;
- controles de role owner/admin ;
- comptes desactives bloques par `isActive` ;
- reset token hashe avec expiration ;
- Helmet, CORS et rate-limit actifs ;
- upload limite par MIME/taille ;
- `.env` attendu hors depot.

Risques / limites :

- CSRF a documenter selon stockage exact du JWT cote front ;
- stockage media local a remplacer par Cloudinary/S3 en production ;
- SMTP et secrets Render a surveiller ;
- validation admin des comptes proprietaires absente si exigee par le cahier des charges.

## 10. Audit performances

Commandes locales a executer :

```bash
npm --prefix client run build
npm --prefix client run lint
npm --prefix server test
npm --prefix client run test:e2e
```

Outils externes attendus :

- Lighthouse ;
- PageSpeed Insights ;
- WAVE ;
- GTmetrix.

Grille a completer :

| Outil | Page | Performance | SEO | Accessibilite | Bonnes pratiques | FCP | LCP | CLS | INP |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| Lighthouse mobile | Accueil | A remplir | A remplir | A remplir | A remplir | A remplir | A remplir | A remplir | A remplir |
| Lighthouse desktop | Accueil | A remplir | A remplir | A remplir | A remplir | A remplir | A remplir | A remplir | A remplir |
| PageSpeed | Accueil | A remplir | A remplir | A remplir | A remplir | A remplir | A remplir | A remplir | A remplir |
| WAVE | Accueil | N/A | N/A | A remplir | N/A | N/A | N/A | N/A | N/A |

## 11. Analyse concurrentielle

| Critere | SailingLoc | Click&Boat | SamBoat | Nautal |
| --- | --- | --- | --- | --- |
| Positionnement | MVP P2P | Marketplace mature | Marketplace mature | Marketplace nautique |
| Recherche | Destination, type, budget, skipper | Filtres avances, carte | Filtres avances, carte | Recherche + filtres |
| Reservation | Flow MVP | Paiement reel, garanties | Paiement reel, garanties | Paiement reel |
| Confiance | Validation bateaux/documents/avis | Avis, assurances, verification | Avis, assurances | Avis, garanties |
| Design | Propre, soutenance | Optimise conversion | Commercial | Marketplace classique |
| Ecart principal | Paiement/SMTP/uploads prod | Produit complet | Produit complet | Produit complet |

## 12. Tableau anomalies et recommandations

| ID | Categorie | Anomalie | Priorite | Statut |
| --- | --- | --- | --- | --- |
| A01 | SEO | Sitemap/robots pointaient vers localhost | Haute | Corrige |
| A02 | SEO | Meta description HTML mal encodee | Haute | Corrige |
| A03 | SEO | Open Graph absent | Moyenne | Corrige base |
| A04 | Performance | Rapports Lighthouse/PageSpeed non archives | Haute | A generer |
| A05 | Accessibilite | Rapport WAVE non archive | Haute | A generer |
| A06 | Fonctionnel | SMTP non garanti en production | Haute | Configurer Render |
| A07 | UX | Proprietaire actif sans validation admin compte | Moyenne | A arbitrer |
| A08 | Technique | Upload local non persistant Render | Moyenne | Prevoir stockage objet |
| A09 | UI | Tableaux admin a verifier mobile | Moyenne | Recette manuelle |
| A10 | SEO | Sitemap non dynamique pour bateaux | Faible | Vraie prod |

## 13. Livrables attendus

- captures ecran anomalies : `docs/reports/screenshots/` ;
- rapports Lighthouse HTML/PDF : `docs/reports/` ;
- rapport PageSpeed : export PDF ou captures ;
- rapport WAVE : captures ;
- tableau anomalies : present ci-dessus ;
- priorisation : Haute / Moyenne / Faible ;
- conclusion : ci-dessous.

## Conclusion generale

SailingLoc est presentable comme MVP full-stack de fin d'annee : les roles, l'API, les dashboards, la moderation, l'i18n, les bases SEO, la securite minimale et la documentation technique sont en place. Les corrections de cet audit ameliorent la coherence SEO de la version en ligne. Les limites a assumer clairement sont SMTP reel, paiement reel, stockage upload persistant, rapports Lighthouse/PageSpeed/WAVE a archiver et eventuelle validation admin des comptes proprietaires si le cahier des charges l'exige.
