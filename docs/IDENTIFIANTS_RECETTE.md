# Identifiants de recette - SailingLoc

Document a fournir avec le rendu de soutenance.

## URL du site

| Type | URL |
| --- | --- |
| Site public + API | `https://sailingloc-uwvo.onrender.com/` |
| Swagger API | `https://sailingloc-uwvo.onrender.com/api-docs` |
| Healthcheck API | `https://sailingloc-uwvo.onrender.com/api/health` |

## Comptes applicatifs de demonstration

Ces comptes sont crees par le seed de demonstration.

| Role | Email | Mot de passe | Acces principal |
| --- | --- | --- | --- |
| Administrateur | `admin@sailingloc.fr` | `Admin123!` | `/admin/dashboard` |
| Proprietaire | `owner1@sailingloc.fr` | `Owner123!` | `/owner/dashboard` |
| Locataire | `tenant1@sailingloc.fr` | `Tenant123!` | `/my-bookings` |

Comptes supplementaires :

| Role | Emails | Mot de passe |
| --- | --- | --- |
| Proprietaires | `owner1@sailingloc.fr` a `owner14@sailingloc.fr` | `Owner123!` |
| Locataires | `tenant1@sailingloc.fr` a `tenant20@sailingloc.fr` | `Tenant123!` |

## Parcours de test conseilles

1. Connexion administrateur.
2. Consulter le dashboard admin.
3. Gerer utilisateurs, bateaux, avis, documents et paiements.
4. Connexion proprietaire.
5. Creer une annonce, consulter les reservations, uploader un document.
6. Connexion locataire.
7. Consulter les bateaux, demander une reservation, payer une reservation acceptee.
8. Tester mot de passe oublie si SMTP configure.

## Acces Git

| Element | Valeur |
| --- | --- |
| Repository | `https://github.com/zerkor/sailingloc` |
| Branche principale | `main` |

Ne pas fournir de mot de passe Git personnel dans le dossier de rendu. Fournir plutot un acces GitHub invite ou un token limite si l'ecole l'exige.

## Gestion de projet

| Outil | URL |
| --- | --- |
| Trello | `https://trello.com/b/w9pMhsou/suivi-de-projet-sailingloc` |

Si un login est demande, creer un acces invite au tableau plutot que partager un mot de passe personnel.

## Acces techniques utiles

| Outil | Usage |
| --- | --- |
| Render | Hebergement du service web |
| MongoDB Atlas / Compass | Verification base de donnees |
| SMTP provider | Test reset password |

## Note securite

Les identifiants ci-dessus sont des comptes de demonstration. Ils ne doivent pas etre reutilises en production commerciale.
