# TESTS.md — SailingLoc Manuel de test

Scénarios de test manuels pour valider les fonctionnalités principales du MVP SailingLoc.

---

## Prérequis

1. MongoDB démarré localement
2. Serveur démarré : `cd server && npm run dev`
3. Client démarré : `cd client && npm run dev`
4. Base de données seeded : `cd server && npm run seed`
5. Navigateur ouvert sur **http://localhost:5173**

---

## Test 1 — Inscription d'un nouveau locataire

**Action :**
- Aller sur `/register`
- Remplir : Prénom `Test`, Nom `User`, Email `test@example.com`, Mot de passe `Test123!`, Rôle `Locataire`
- Cliquer "S'inscrire"

**Résultat attendu :**
- Redirection vers la page d'accueil
- L'utilisateur est connecté (nom visible dans le header)
- Rôle "Locataire" dans le menu

---

## Test 2 — Connexion en tant que locataire

**Action :**
- Se déconnecter si connecté
- Aller sur `/login`
- Email : `tenant1@sailingloc.fr` / Mot de passe : `Tenant123!`
- Cliquer "Se connecter"

**Résultat attendu :**
- Redirection vers la page d'accueil
- Prénom "Jean" visible dans le header
- Menu affiche "Mes réservations"

---

## Test 3 — Parcourir les bateaux approuvés

**Action :**
- Aller sur `/boats`
- Appliquer le filtre "Catamaran"
- Puis filtrer par location "Nice"

**Résultat attendu :**
- Affichage des bateaux avec statut `approved` uniquement
- Filtre "Catamaran" réduit la liste
- Filtre "Nice" affiche le Lagoon 42
- Les cartes affichent : titre, lieu, prix/jour, capacité, type

---

## Test 4 — Créer une réservation

**Action :**
- Connecté en tant que `tenant1@sailingloc.fr`
- Aller sur `/boats` → Cliquer sur "Sun Odyssey 349"
- Dans le formulaire de réservation : choisir des dates futures (ex: demain + 3 jours)
- Cliquer "Demander une réservation"

**Résultat attendu :**
- Message de confirmation affiché
- Redirection vers `/my-bookings`
- Nouvelle réservation visible avec statut `En attente`
- Prix total = (pricePerDay × jours) + 10% de frais de service

---

## Test 5 — Simuler un paiement

**Action :**
- Connecté en `tenant2@sailingloc.fr`
- Aller sur `/my-bookings`
- Trouver une réservation au statut `Acceptée` (ou créer une réservation que owner1 accepte)
- Cliquer "Payer maintenant"

**Résultat attendu :**
- Statut passe de `Acceptée` à `Confirmée`
- Statut de paiement devient `Payé`
- Bouton "Payer maintenant" disparaît

---

## Test 6 — Connexion en tant que propriétaire

**Action :**
- Se déconnecter
- Se connecter avec `owner1@sailingloc.fr` / `Owner123!`

**Résultat attendu :**
- Redirection vers `/owner/dashboard`
- Sidebar propriétaire visible (Tableau de bord, Mes bateaux, Réservations)
- Statistiques : nombre de bateaux, réservations en attente, revenus

---

## Test 7 — Créer une annonce de bateau

**Action :**
- Connecté en tant que propriétaire
- Aller sur `/owner/boats/new`
- Remplir : Titre `Voilier Test`, Type `Voilier`, Description (>10 chars), Location `Toulon`, Prix `200`, Capacité `4`
- Cliquer "Publier le bateau"

**Résultat attendu :**
- Redirection vers `/owner/boats`
- Le nouveau bateau apparaît avec statut `En attente`
- Le bateau n'apparaît PAS dans `/boats` (liste publique)

---

## Test 8 — Vérifier que l'annonce est en attente

**Action :**
- Connecté en tant que propriétaire
- Aller sur `/owner/boats`

**Résultat attendu :**
- Le bateau créé montre le badge `En attente`
- Si on tente de l'accéder via `/boats/:id` en tant que visiteur → 404 ou message d'erreur

---

## Test 9 — Connexion en tant qu'administrateur

**Action :**
- Se déconnecter
- Connexion avec `admin@sailingloc.fr` / `Admin123!`

**Résultat attendu :**
- Redirection vers `/admin/dashboard`
- Sidebar admin visible (Tableau de bord, Utilisateurs, Bateaux, Réservations, Avis)
- Statistiques : total utilisateurs, bateaux, réservations, revenus simulés

---

## Test 10 — Approuver une annonce de bateau

**Action :**
- Connecté en tant qu'admin
- Aller sur `/admin/boats`
- Trouver le bateau en statut `En attente`
- Cliquer "Approuver"

**Résultat attendu :**
- Le badge passe de `En attente` à `Approuvé`
- Le bateau apparaît désormais dans la liste publique `/boats`

---

## Test 11 — Vérifier l'apparition publique de l'annonce

**Action :**
- Se déconnecter
- Aller sur `/boats`
- Rechercher le bateau nouvellement approuvé

**Résultat attendu :**
- Le bateau apparaît dans la liste
- La fiche détail est accessible

---

## Test 12 — Propriétaire accepte une réservation

**Action :**
- Connecté en `owner1@sailingloc.fr`
- Aller sur `/owner/bookings`
- Trouver une réservation avec statut `En attente`
- Cliquer "Accepter"

**Résultat attendu :**
- Le statut passe à `Acceptée`
- Le locataire peut maintenant payer

---

## Test 13 — Locataire paie une réservation

**Action :**
- Se connecter en tant que le locataire correspondant
- Aller sur `/my-bookings`
- Trouver la réservation au statut `Acceptée`
- Cliquer "Payer maintenant"

**Résultat attendu :**
- Statut → `Confirmée`
- Statut paiement → `Payé`
- Le bouton de paiement disparaît

---

## Test 14 — Administration modère un avis

**Action :**
- Connecté en tant qu'admin
- Aller sur `/admin/reviews`
- Filtrer par `En attente`
- Cliquer "Approuver" sur un avis

**Résultat attendu :**
- Le statut de l'avis passe à `Approuvé`
- L'avis devient visible sur la fiche du bateau
- Cliquer "Masquer" cache l'avis (statut `Masqué`)

---

## Test 15 — Protection des routes admin

**Action :**
- Se connecter avec `tenant1@sailingloc.fr`
- Tenter d'accéder à `/admin/dashboard` manuellement dans l'URL

**Résultat attendu :**
- Redirection vers `/` (page d'accueil)
- Aucune donnée admin visible

---

## Test 16 — Responsive mobile

**Action :**
- Ouvrir les outils développeur du navigateur
- Passer en mode responsive (ex: iPhone 375px de largeur)
- Naviguer sur : accueil, liste des bateaux, détail bateau, connexion

**Résultat attendu :**
- Menu hamburger visible sur mobile
- Les cartes bateaux s'affichent en une colonne
- Le formulaire de réservation est lisible
- Footer et navigation sont utilisables

---

## Tests supplémentaires (edge cases)

### Réservation impossible sans connexion
- Aller sur `/boats/:id` sans être connecté
- Le formulaire de réservation affiche "Connectez-vous pour réserver"

### Propriétaire ne peut pas réserver son propre bateau
- Connecté en tant que propriétaire
- Accéder à la fiche d'un de ses bateaux
- Le formulaire de réservation indique "Les propriétaires ne peuvent pas réserver"

### Avis uniquement après réservation terminée
- Connecté en tant que locataire
- Aller sur `/my-bookings`
- Le bouton "Laisser un avis" n'apparaît que pour les réservations au statut `Terminée`

### Annulation d'une réservation
- Locataire : annuler une réservation `En attente` ou `Acceptée`
- Le statut passe à `Annulée`
- Si payée, le statut paiement passe à `Remboursé`
