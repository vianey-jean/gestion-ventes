
# Guide Backend - Documentation Complète

## Architecture du serveur

### Vue d'ensemble

Le backend est un serveur **Express.js** utilisant des fichiers **JSON** comme base de données.  
Il tourne sur le port configuré via `process.env.PORT` (défaut: 10000) et est déployé sur **Render**.

### Structure des dossiers
```
server/
├── server.js                   # Point d'entrée principal
├── .env                        # Variables d'environnement (JWT_SECRET, PORT)
├── package.json                # Dépendances Node.js
│
├── config/
│   └── passport.js             # Configuration Passport (non utilisé actuellement)
│
├── db/                         # Base de données JSON
│   ├── users.json              # Utilisateurs avec mots de passe hashés
│   ├── products.json           # Catalogue de produits
│   ├── sales.json              # Historique des ventes
│   ├── clients.json            # Liste des clients
│   ├── commandes.json          # Commandes et réservations
│   ├── rdv.json                # Rendez-vous
│   ├── rdvNotifications.json   # Notifications de rendez-vous
│   ├── pretfamilles.json       # Prêts famille
│   ├── pretproduits.json       # Prêts produits (clients à crédit)
│   ├── depensedumois.json      # Dépenses mensuelles
│   ├── depensefixe.json        # Dépenses fixes récurrentes
│   ├── benefice.json           # Historique des bénéfices
│   ├── compta.json             # Données comptables (achats, dépenses)
│   ├── nouvelle_achat.json     # Historique des nouveaux achats
│   ├── objectif.json           # Objectifs de ventes
│   └── messages.json           # Messages système
│
├── middleware/
│   ├── auth.js                 # Vérification JWT + utilisateur en BDD
│   ├── security.js             # Rate limiting, sanitization, headers sécurisés
│   ├── validation.js           # Schémas de validation pour chaque route
│   ├── sync.js                 # Middleware de synchronisation temps réel (SSE)
│   └── upload.js               # Gestion des uploads de fichiers
│
├── models/                     # Modèles de données (lecture/écriture JSON)
│   ├── User.js                 # CRUD utilisateurs + hashage bcrypt
│   ├── Product.js              # CRUD produits
│   ├── Sale.js                 # CRUD ventes
│   ├── Client.js               # CRUD clients
│   ├── Commande.js             # CRUD commandes/réservations
│   ├── Rdv.js                  # CRUD rendez-vous + conflits
│   ├── RdvNotification.js      # Notifications de RDV
│   ├── PretFamille.js          # Prêts famille
│   ├── PretProduit.js          # Prêts produits
│   ├── DepenseDuMois.js        # Dépenses mensuelles
│   ├── Benefice.js             # Bénéfices
│   ├── Compta.js               # Comptabilité
│   ├── NouvelleAchat.js        # Nouveaux achats
│   ├── Objectif.js             # Objectifs
│   └── Message.js              # Messages
│
└── routes/                     # Routes API Express
    ├── auth.js                 # /api/auth/* (login, register, reset-password)
    ├── products.js             # /api/products/* (CRUD produits)
    ├── sales.js                # /api/sales/* (CRUD ventes)
    ├── clients.js              # /api/clients/* (CRUD clients)
    ├── commandes.js            # /api/commandes/* (CRUD commandes)
    ├── rdv.js                  # /api/rdv/* (CRUD RDV + conflits)
    ├── rdvNotifications.js     # /api/rdv-notifications/* 
    ├── pretfamilles.js         # /api/pretfamilles/*
    ├── pretproduits.js         # /api/pretproduits/*
    ├── depenses.js             # /api/depenses/*
    ├── benefices.js            # /api/benefices/*
    ├── compta.js               # /api/compta/*
    ├── nouvelleAchat.js        # /api/nouvelle-achat/*
    ├── objectif.js             # /api/objectif/*
    ├── messages.js             # /api/messages/*
    └── sync.js                 # /api/sync/events (SSE temps réel)
```

## Authentification JWT

### Flux d'authentification

```
Client                          Serveur
  │                                │
  ├── POST /api/auth/login ──────→ │ Vérifie email + bcrypt password
  │                                │ Génère JWT (8h expiration)
  │ ←── { user, token } ──────── │
  │                                │
  ├── GET /api/auth/verify ──────→ │ Décode JWT + vérifie user en BDD
  │ ←── { valid: true, user } ── │
  │                                │
  ├── Requêtes API ──────────────→ │ Header: Authorization: Bearer <token>
  │   (middleware auth.js)         │ Vérifie JWT + charge user dans req.user
  │                                │
```

### Points d'accès Auth

| Méthode | Route                        | Auth | Description                          |
|---------|------------------------------|------|--------------------------------------|
| POST    | /api/auth/login              | Non  | Connexion avec email/password        |
| POST    | /api/auth/register           | Non  | Inscription nouvel utilisateur       |
| GET     | /api/auth/verify             | Non  | Vérification validité du token       |
| GET     | /api/auth/health             | Non  | Health check serveur                 |
| POST    | /api/auth/check-email        | Non  | Vérifie si un email existe           |
| POST    | /api/auth/reset-password-request | Non | Vérifie l'email pour reset       |
| POST    | /api/auth/reset-password     | Non  | Change le mot de passe               |

### Règles de mot de passe
- Minimum **6 caractères**
- Au moins **1 majuscule**, **1 minuscule**, **1 chiffre**, **1 caractère spécial**
- Maximum 128 caractères

## Routes API Complètes

### Produits (`/api/products`)

| Méthode | Route              | Description                    |
|---------|--------------------|--------------------------------|
| GET     | /                  | Liste tous les produits        |
| GET     | /:id               | Détail d'un produit            |
| POST    | /                  | Créer un produit               |
| PUT     | /:id               | Modifier un produit            |
| DELETE  | /:id               | Supprimer un produit           |

### Ventes (`/api/sales`)

| Méthode | Route              | Description                    |
|---------|--------------------|--------------------------------|
| GET     | /                  | Liste toutes les ventes        |
| GET     | /:id               | Détail d'une vente             |
| POST    | /                  | Créer une vente (multi-produit)|
| PUT     | /:id               | Modifier une vente             |
| DELETE  | /:id               | Supprimer une vente            |

### Commandes (`/api/commandes`)

| Méthode | Route              | Description                    |
|---------|--------------------|--------------------------------|
| GET     | /                  | Liste toutes les commandes     |
| GET     | /:id               | Détail d'une commande          |
| POST    | /                  | Créer commande/réservation     |
| PUT     | /:id               | Modifier (statut, report...)   |
| DELETE  | /:id               | Supprimer une commande         |

### Rendez-vous (`/api/rdv`)

| Méthode | Route                      | Description                         |
|---------|----------------------------|-------------------------------------|
| GET     | /                          | Liste tous les RDV                  |
| GET     | /search?q=...              | Recherche de RDV                    |
| GET     | /search-clients?q=...      | Autocomplete clients pour RDV       |
| GET     | /week?start=...&end=...    | RDV par plage de dates              |
| GET     | /conflicts?date=...        | Vérification de conflits horaires   |
| GET     | /:id                       | Détail d'un RDV                     |
| POST    | /                          | Créer un RDV (+ notification auto)  |
| PUT     | /:id                       | Modifier un RDV (+ sync notif)      |
| PUT     | /by-commande/:commandeId   | Modifier RDV via commande liée      |
| DELETE  | /:id                       | Supprimer RDV (+ notif associée)    |

### Comptabilité (`/api/compta`)

| Méthode | Route              | Description                          |
|---------|--------------------|--------------------------------------|
| GET     | /                  | Données comptables du mois           |
| POST    | /                  | Ajouter une entrée comptable         |
| PUT     | /:id               | Modifier une entrée                  |
| DELETE  | /:id               | Supprimer une entrée                 |

### Autres routes

- `/api/clients` - CRUD clients
- `/api/pretfamilles` - Prêts famille
- `/api/pretproduits` - Prêts produits
- `/api/depenses` - Dépenses du mois + fixes
- `/api/benefices` - Historique bénéfices
- `/api/nouvelle-achat` - Achats de produits
- `/api/objectif` - Objectif de ventes mensuel
- `/api/messages` - Messages système
- `/api/rdv-notifications` - Notifications de RDV
- `/api/sync/events` - Server-Sent Events (SSE)

## Sécurité

### Couches de protection

1. **CORS** - Origines autorisées configurées (Vercel, localhost, Lovable)
2. **Rate Limiting** - 3 niveaux :
   - `general`: 500 req/min (routes normales)
   - `auth`: 10 req/min (login/register)
   - `strict`: 5 req/min (opérations sensibles)
3. **Sanitization** - Nettoyage automatique des entrées (XSS, injection)
4. **Headers sécurisés** - X-Content-Type-Options, X-Frame-Options, CSP, HSTS
5. **Détection d'activités suspectes** - Log des patterns dangereux (SQL injection, path traversal)
6. **JWT** - Tokens avec expiration 8h, vérification utilisateur en BDD

### Validation des entrées

Le middleware `validation.js` définit des schémas pour chaque route sensible :
- `login` : email (requis, format email), password (requis, 6-128 chars)
- `register` : email, password, confirmPassword, firstName, lastName, gender, address, phone, acceptTerms
- Types supportés : `email`, `phone`, `password`, `number`, `text`, `date`, `boolean`

## Synchronisation Temps Réel (SSE)

Le serveur utilise **Server-Sent Events** pour notifier les clients des changements :

```
Client (navigateur)              Serveur
  │                                │
  ├── GET /api/sync/events ──────→ │ Connexion SSE persistante
  │ ←── event: connected ──────── │
  │                                │
  │      (un autre client modifie  │
  │       des données...)          │
  │                                │
  │ ←── event: data-changed ───── │ Notification de changement
  │      (le client recharge)      │
  │                                │
```

La route SSE est exclue du rate limiting car c'est une connexion longue durée.

## Modèles de données

### Pattern commun
Chaque modèle suit le même pattern :
1. Lecture du fichier JSON
2. Manipulation en mémoire
3. Écriture du fichier JSON
4. Retour du résultat

### Modèle Rdv (exemple complet)
```javascript
const Rdv = {
  getAll(),              // Tous les RDV
  getById(id),           // Par ID
  getByClientNom(nom),   // Par nom client
  getByCommandeId(id),   // Par commande liée
  getByDateRange(s, e),  // Par plage de dates
  search(query),         // Recherche texte
  checkConflicts(...),   // Conflits horaires
  create(data),          // Création avec ID auto
  update(id, data),      // Mise à jour
  updateByCommandeId(),  // MAJ via commande
  delete(id),            // Suppression
};
```

## Déploiement

### Render (Production)
- URL : `https://server-gestion-ventes.onrender.com`
- Variables d'environnement : `JWT_SECRET`, `PORT`, `NODE_ENV`
- Build command : `npm install`
- Start command : `node server.js`

### Variables d'environnement requises
```env
JWT_SECRET=votre_secret_jwt_securise
PORT=10000
NODE_ENV=production
```

## Gestion des erreurs

Le serveur utilise un middleware global d'erreurs :
- **401** : Token manquant ou invalide
- **404** : Route non trouvée
- **429** : Rate limit dépassé
- **500** : Erreur serveur (stack trace masquée en production)

Gestion gracieuse : `SIGTERM`, `uncaughtException`, `unhandledRejection` sont interceptés.
