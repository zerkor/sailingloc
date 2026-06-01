# SailingLoc ⚓

**Plateforme de location de bateaux entre particuliers**

SailingLoc est une application web full-stack permettant aux propriétaires de bateaux de publier des annonces de location, et aux locataires de rechercher, réserver et évaluer des bateaux. La plateforme inclut un back-office d'administration complet.

---

## Fonctionnalités principales

### Pour les visiteurs
- Parcourir les bateaux disponibles
- Filtrer par destination, type, prix, capacité, skipper
- Consulter les fiches bateaux avec avis

### Pour les locataires
- Créer un compte et se connecter
- Réserver un bateau avec calcul automatique du prix
- Simuler un paiement sécurisé
- Consulter l'historique des réservations
- Laisser un avis après une location terminée

### Pour les propriétaires
- Publier des annonces de bateaux (soumises à validation admin)
- Gérer les demandes de réservation (accepter/refuser)
- Consulter les revenus simulés
- Tableau de bord propriétaire

### Pour l'administrateur
- Tableau de bord avec statistiques globales
- Gestion des utilisateurs (activation/désactivation)
- Modération des annonces (approbation/rejet)
- Gestion des réservations
- Modération des avis

---

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Front-end | React 18, Vite, Tailwind CSS, React Router v6 |
| État auth | Context API + JWT (localStorage) |
| HTTP | Axios |
| Back-end | Node.js, Express.js |
| Base de données | MongoDB, Mongoose |
| Auth | JWT + bcrypt |
| Sécurité | Helmet, CORS, express-rate-limit |
| Paiement | Simulé (Stripe-ready) |

---

## Structure du projet

```
sailingloc/
├── client/          # Front-end React + Vite
│   └── src/
│       ├── components/    # Composants réutilisables
│       ├── context/       # AuthContext
│       ├── layouts/       # PublicLayout, OwnerLayout, AdminLayout
│       ├── pages/         # Pages par domaine
│       ├── services/      # Appels API Axios
│       └── utils/         # Formatage dates, prix, calculs
├── server/          # Back-end Express
│   └── src/
│       ├── config/        # Connexion MongoDB
│       ├── controllers/   # Logique métier
│       ├── middleware/     # Auth, rôles, erreurs
│       ├── models/        # Modèles Mongoose
│       ├── routes/        # Routes Express
│       ├── seed/          # Données de démonstration
│       └── utils/         # Helpers
├── .env.example
├── README.md
└── TESTS.md
```

---

## Installation — Windows

### Prérequis

Installe ces outils dans l'ordre :

#### 1. Node.js
- Télécharge sur **https://nodejs.org** (version LTS recommandée)
- Lors de l'installation, coche **"Add to PATH"**
- Vérifie dans un terminal :
```cmd
node -v
npm -v
```

#### 2. MongoDB Community Server
- Télécharge sur **https://www.mongodb.com/try/download/community**
- Choisis **Windows**, version **7.x**, package **MSI**
- Lance l'installeur → coche **"Install MongoDB as a Service"** → ça démarre automatiquement à chaque boot
- Vérifie que le service tourne :
```cmd
sc query MongoDB
```
Tu dois voir `STATE : 4 RUNNING`

> Alternatively, télécharge **MongoDB Compass** (interface graphique) depuis le même site.

#### 3. Git (optionnel)
- Télécharge sur **https://git-scm.com/download/win**

---

### Démarrage du projet

Ouvre **deux fenêtres PowerShell** (ou deux terminaux dans VS Code avec le bouton `+`).

#### Terminal 1 — Serveur

```powershell
cd C:\chemin\vers\sailingloc\server
```

Si c'est la première fois :
```powershell
npm install
```

Crée le fichier `.env` :
```powershell
copy ..\\.env.example .env
```
Ou crée manuellement un fichier `.env` dans `server/` avec ce contenu :
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sailingloc
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Insère les données de démo :
```powershell
npm run seed
```

Lance le serveur :
```powershell
npm run dev
```

Tu dois voir :
```
MongoDB connected ✓
SailingLoc server running on port 5000
```

---

#### Terminal 2 — Client

```powershell
cd C:\chemin\vers\sailingloc\client
```

Si c'est la première fois :
```powershell
npm install
```

Lance le client :
```powershell
npm run dev
```

Tu dois voir :
```
VITE ready
➜  Local: http://localhost:5173/
```

Ouvre **http://localhost:5173** dans ton navigateur.

---

### Problèmes fréquents sur Windows

#### MongoDB ne démarre pas
```powershell
# Démarrer le service manuellement
net start MongoDB
```

#### "npm n'est pas reconnu"
→ Réinstalle Node.js et coche bien **"Add to PATH"** pendant l'installation.  
→ Redémarre PowerShell après l'installation.

#### Erreur EACCES ou permission refusée
→ Lance PowerShell **en tant qu'administrateur** (clic droit → "Exécuter en tant qu'administrateur").

#### Port 5000 déjà utilisé
→ Change `PORT=5000` en `PORT=5001` dans le fichier `.env` du serveur.

#### Erreur `MongooseServerSelectionError`
→ MongoDB n'est pas démarré. Lance :
```powershell
net start MongoDB
```

---

## Installation — macOS

### Prérequis

```bash
# Installe Homebrew si pas déjà fait
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js
brew install node

# MongoDB
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Démarrage

```bash
# Terminal 1 — Serveur
cd ~/Documents/sailingloc/server
npm install
cp ../.env.example .env
npm run seed
npm run dev

# Terminal 2 — Client
cd ~/Documents/sailingloc/client
npm install
npm run dev
```

---

## Variables d'environnement

Fichier `.env` à créer dans le dossier `server/` :

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sailingloc
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## Comptes de démonstration

Après `npm run seed` :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@sailingloc.fr | Admin123! |
| Propriétaire 1 | owner1@sailingloc.fr | Owner123! |
| Propriétaire 2 | owner2@sailingloc.fr | Owner123! |
| Locataire 1 | tenant1@sailingloc.fr | Tenant123! |
| Locataire 2 | tenant2@sailingloc.fr | Tenant123! |
| Locataire 3 | tenant3@sailingloc.fr | Tenant123! |

---

## Aperçu de l'API

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| GET | /api/auth/me | Profil connecté |
| GET | /api/boats | Liste des bateaux approuvés |
| GET | /api/boats/:id | Détail d'un bateau |
| POST | /api/boats | Créer une annonce (owner) |
| POST | /api/bookings | Créer une réservation (tenant) |
| GET | /api/bookings/me | Réservations du locataire |
| GET | /api/bookings/owner | Réservations du propriétaire |
| PATCH | /api/bookings/:id/pay | Simuler le paiement |
| POST | /api/reviews | Soumettre un avis |
| GET | /api/admin/stats | Statistiques admin |
| PATCH | /api/admin/boats/:id/approve | Approuver un bateau |

---

## Workflow de réservation

```
pending → accepted → confirmed → completed
         ↓
       rejected
pending/accepted → cancelled
```

**Paiement simulé** : `PATCH /api/bookings/:id/pay` fait passer le statut de `accepted` à `confirmed` et `paymentStatus` à `paid`.

---

## Limitations MVP

- Pas de vrai paiement Stripe (simulé)
- Pas de système de messagerie interne
- Pas d'upload d'images (URLs externes uniquement)
- Pas d'email de notification
- Pas de carte interactive
- Pas de vérification d'identité automatisée

---

## Améliorations futures

- Application mobile (React Native)
- Messagerie interne entre propriétaires et locataires
- Vérification automatique d'identité
- Intégration Stripe Connect complète
- Caution de sécurité
- Génération automatique de contrats de location
- Intégration partenaire assurance
- Notifications par email (confirmation, rappel)
- Favoris
- Carte interactive avec géolocalisation
- Recherche par géolocalisation
- Gestion des litiges
