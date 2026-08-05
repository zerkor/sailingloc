# Recette finale - SailingLoc

Document de controle avant rendu du projet de fin d'annee.

## Informations de rendu

| Element | Valeur |
| --- | --- |
| URL publique | https://dsp-dev-o24a-g6-fr.onrender.com/ |
| Swagger API | https://dsp-dev-o24a-g6-fr.onrender.com/api-docs |
| Repository | https://github.com/zerkor/sailingloc |
| Branche | main |
| Nature du projet | Projet etudiant fictif, aucune reservation ou transaction reelle |

## Comptes de demonstration

| Role | Email | Mot de passe | Parcours principal |
| --- | --- | --- | --- |
| Admin | admin@sailingloc.fr | Admin123! | Back-office, moderation, emails, logs |
| Proprietaire | owner1@sailingloc.fr | Owner123! | Dashboard, annonces, reservations, documents |
| Locataire | tenant1@sailingloc.fr | Tenant123! | Recherche, reservation, paiement simule, avis |

## Recette fonctionnelle prioritaire

| Test | Statut attendu | Preuve a garder |
| --- | --- | --- |
| Accueil responsive desktop/mobile | Conforme | Capture 390px + desktop |
| Catalogue bateaux + filtres | Conforme | Capture avec filtres actifs |
| Fiche bateau | Conforme | Capture image, prix, reservation |
| Inscription locataire | Conforme | Capture compte + email recu |
| Inscription proprietaire | Conforme | Capture dashboard owner |
| Connexion admin | Conforme | Capture dashboard admin |
| Creation reservation locataire | Conforme | Capture mes reservations |
| Acceptation reservation owner/admin | Conforme | Capture statut + email recu |
| Contact public | Conforme | Capture message admin + email |
| Newsletter admin | Conforme | Capture formulaire + email recu |
| Mot de passe oublie | Conforme si Brevo actif | Capture email reset |
| Mentions legales | Conforme | Capture mention projet fictif |

## Recette technique

| Controle | Commande / URL | Statut |
| --- | --- | --- |
| Build production | `npm run build` | Valide le 05/08/2026 |
| Tests API | `npm --prefix server test` | Valide le 05/08/2026 : 22/22 |
| Tests E2E | `npm --prefix client run test:e2e` | Valide le 05/08/2026 : 8/8 |
| Healthcheck | `/api/health` | Doit retourner OK |
| Swagger | `/api-docs` | Doit etre accessible |
| k6 smoke | `k6 run load-tests/k6/sailingloc-smoke.js` | Resultat a coller dans docs/TEST_CHARGE.md |
| Lighthouse mobile | Chrome DevTools | Rapport a exporter |
| Lighthouse desktop | Chrome DevTools | Rapport a exporter |

## Limites MVP a annoncer

- Paiement simule, aucun encaissement reel.
- Upload local, stockage cloud necessaire en vraie production.
- Pas de contrat PDF ni signature electronique.
- Pas de messagerie interne locataire/proprietaire.
- Signalements presents, mais workflow de litige complet hors MVP.
- Monitoring limite aux logs Render, healthcheck et documentation.
- Projet etudiant fictif : aucune reservation ou location reelle.

## Captures finales conseillees

1. Accueil desktop.
2. Accueil mobile.
3. Catalogue avec categories et filtres.
4. Fiche bateau.
5. Dashboard proprietaire.
6. Dashboard administrateur.
7. Messages contact admin.
8. Page emails/newsletter admin.
9. Email Brevo recu.
10. Mentions legales avec disclaimer fictif.

## Verdict

Le projet est presentable comme MVP academique complet si les preuves de recette sont ajoutees au dossier de rendu : captures, tests, Lighthouse et email Brevo.
