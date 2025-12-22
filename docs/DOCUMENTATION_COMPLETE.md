# Documentation Complète - Gestion des Ventes

## Table des matières

1. [Introduction](#introduction)
2. [Architecture du Projet](#architecture-du-projet)
3. [Installation](#installation)
4. [Pages de l'Application](#pages-de-lapplication)
5. [Fonctionnalités](#fonctionnalités)
6. [Sécurité](#sécurité)
7. [Performance](#performance)
8. [API Backend](#api-backend)

---

## Introduction

**Gestion des Ventes** est une application web complète de gestion commerciale permettant de gérer les ventes, les clients, les produits, les rendez-vous, la comptabilité et les ressources humaines.

### Technologies utilisées

**Frontend:**
- React 19 avec TypeScript
- Vite pour le bundling
- Tailwind CSS pour le styling
- Framer Motion pour les animations
- React Query pour la gestion des données
- React Router pour la navigation

**Backend:**
- Node.js avec Express
- Fichiers JSON pour la persistance des données
- JWT pour l'authentification
- Bcrypt pour le hachage des mots de passe

---

## Architecture du Projet

```
projet/
├── src/                          # Code source frontend
│   ├── components/               # Composants React réutilisables
│   │   ├── ui/                   # Composants UI de base (Shadcn)
│   │   ├── dashboard/            # Composants du tableau de bord
│   │   ├── clients/              # Composants de gestion clients
│   │   ├── rdv/                  # Composants de rendez-vous
│   │   └── shared/               # Composants partagés
│   ├── pages/                    # Pages de l'application
│   ├── hooks/                    # Hooks React personnalisés
│   ├── services/                 # Services API et utilitaires
│   ├── contexts/                 # Contextes React (Auth, Theme, App)
│   ├── types/                    # Types TypeScript
│   └── lib/                      # Utilitaires (sécurité, performance)
├── server/                       # Code source backend
│   ├── routes/                   # Routes API Express
│   ├── models/                   # Modèles de données
│   ├── middleware/               # Middlewares (auth, security, upload)
│   └── db/                       # Fichiers JSON de données
└── docs/                         # Documentation
```

---

## Installation

### Prérequis
- Node.js >= 18
- npm ou yarn

### Frontend

```bash
# Cloner le projet
git clone [url-du-projet]

# Installer les dépendances
npm install

# Démarrer en développement
npm run dev

# Construire pour la production
npm run build
```

### Backend

```bash
cd server

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Démarrer le serveur
npm start
```

### Variables d'environnement

**Frontend (.env):**
```
VITE_API_BASE_URL=https://votre-api.com
```

**Backend (server/.env):**
```
PORT=10000
JWT_SECRET=votre_secret_jwt_securise
NODE_ENV=production
```

---

## Pages de l'Application

### Pages Publiques

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Page d'accueil avec présentation |
| `/about` | AboutPage | À propos de l'application |
| `/contact` | ContactPage | Formulaire de contact |
| `/login` | LoginPage | Connexion utilisateur |
| `/register` | RegisterPage | Inscription nouvel utilisateur |
| `/reset-password` | ResetPasswordPage | Réinitialisation mot de passe |

### Pages Protégées (Authentification requise)

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | DashboardPage | Tableau de bord principal |
| `/clients` | ClientsPage | Gestion des clients |
| `/commandes` | CommandesPage | Gestion des commandes |
| `/rdv` | RdvPage | Gestion des rendez-vous |
| `/tendances` | TendancesPage | Analyses et tendances |
| `/messages` | MessagesPage | Messagerie interne |
| `/comptabilite` | ComptabilitePage | Module comptabilité |
| `/ressources-humaines` | RessourcesHumainesPage | Module RH |
| `/rendez-vous` | RendezVousPage | Calendrier rendez-vous avancé |

---

## Fonctionnalités

### 1. Gestion des Ventes

- Enregistrement des ventes avec calcul automatique des bénéfices
- Support multi-produits par vente
- Historique complet des transactions
- Export des données en PDF/Excel
- Recherche et filtrage avancés

### 2. Gestion des Clients

- Fiche client complète (nom, téléphone, adresse)
- Historique des achats par client
- Recherche rapide
- Actions rapides (appel, SMS, WhatsApp)
- Statistiques par client

### 3. Gestion des Produits

- Inventaire complet avec stock
- Prix d'achat et gestion des marges
- Alertes stock faible
- Historique des mouvements

### 4. Rendez-vous et Notifications

#### Calendrier des Rendez-vous
- Vue calendrier mensuel interactive
- Création rapide de rendez-vous
- Glisser-déposer pour déplacer les rendez-vous
- Filtrage par statut (confirmé, en attente, annulé)
- Lien avec les fiches clients

#### Notifications
- Rappels automatiques de rendez-vous
- Notifications de paiements en retard
- Alertes de stock faible
- Notifications push (si activées)

### 5. Comptabilité

- **Bilan Financier**: Vue d'ensemble des finances
- **Journal Comptable**: Toutes les écritures comptables
- **Facturation Avancée**: Génération de factures PDF
- **Rapports Fiscaux**: Préparation des déclarations

### 6. Ressources Humaines

- **Gestion des Employés**: Fiches employés complètes
- **Suivi des Congés**: Demandes et approbations
- **Paie et Salaires**: Calcul et historique
- **Évaluations**: Suivi des performances

### 7. Prêts et Avances

- **Prêts Familles**: Suivi des prêts personnels
- **Prêts Produits**: Ventes à crédit avec échéancier
- Alertes de retard de paiement
- Historique des remboursements

### 8. Dépenses

- Suivi des dépenses mensuelles
- Catégorisation automatique
- Dépenses fixes vs variables
- Rapports par catégorie

---

## Sécurité

### Backend

1. **Rate Limiting**
   - Limite générale: 100 requêtes/minute
   - Limite authentification: 10 requêtes/minute
   - Limite opérations sensibles: 5 requêtes/minute

2. **Validation des Entrées**
   - Schémas de validation pour toutes les routes
   - Sanitization automatique des inputs
   - Protection contre les injections (SQL, NoSQL, XSS)

3. **Headers de Sécurité**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Content-Security-Policy
   - Strict-Transport-Security (HTTPS)

4. **Authentification**
   - JWT avec expiration de 8 heures
   - Mots de passe hachés avec bcrypt (salt factor 10)
   - Messages d'erreur génériques pour éviter l'énumération

5. **Détection d'Intrusions**
   - Monitoring des patterns suspects
   - Logging des activités anormales

### Frontend

1. **Validation des Formulaires**
   - Validation côté client avec Zod
   - Sanitization des inputs
   - Protection XSS

2. **Protection CSRF**
   - Tokens CSRF générés par session
   - Validation avant les opérations sensibles

3. **Rate Limiting Client**
   - Protection contre les soumissions multiples
   - Délai entre les requêtes sensibles

4. **Stockage Sécurisé**
   - Tokens en localStorage avec sanitization
   - Pas de données sensibles en clair

---

## Performance

### Optimisations Frontend

1. **Lazy Loading**
   - Toutes les pages chargées à la demande
   - Code splitting automatique par route

2. **Caching**
   - Cache des données API (5 minutes par défaut)
   - Déduplication des requêtes
   - Prefetching des routes probables

3. **Debouncing & Throttling**
   - Recherche avec debounce (300ms)
   - Scroll events throttled
   - Resize observers optimisés

4. **Virtualisation**
   - Listes virtualisées pour grands ensembles de données
   - Rendu conditionnel des éléments hors écran

5. **Monitoring**
   - Suivi des temps de chargement
   - Alertes pour opérations lentes (>1s)

### Optimisations Backend

1. **Compression**
   - Gzip/Brotli pour toutes les réponses

2. **Caching**
   - Cache en mémoire pour données fréquentes
   - Headers de cache appropriés

3. **Optimisation des Requêtes**
   - Pagination des résultats
   - Chargement incrémental

---

## API Backend

### Authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/reset-password` | Réinitialisation MDP |
| POST | `/api/auth/check-email` | Vérifier si email existe |

### Produits

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/products` | Liste tous les produits |
| GET | `/api/products/:id` | Détails d'un produit |
| POST | `/api/products` | Créer un produit |
| PUT | `/api/products/:id` | Modifier un produit |
| DELETE | `/api/products/:id` | Supprimer un produit |
| PATCH | `/api/products/:id/quantity` | Modifier le stock |

### Ventes

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/sales` | Liste toutes les ventes |
| POST | `/api/sales` | Enregistrer une vente |
| DELETE | `/api/sales/:id` | Supprimer une vente |

### Clients

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/clients` | Liste tous les clients |
| GET | `/api/clients/:id` | Détails d'un client |
| POST | `/api/clients` | Créer un client |
| PUT | `/api/clients/:id` | Modifier un client |
| DELETE | `/api/clients/:id` | Supprimer un client |

### Rendez-vous

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/rdv` | Liste tous les RDV |
| GET | `/api/rdv/:id` | Détails d'un RDV |
| POST | `/api/rdv` | Créer un RDV |
| PUT | `/api/rdv/:id` | Modifier un RDV |
| DELETE | `/api/rdv/:id` | Supprimer un RDV |
| PATCH | `/api/rdv/:id/status` | Changer le statut |

### Notifications RDV

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/rdv-notifications` | Liste les notifications |
| POST | `/api/rdv-notifications` | Créer une notification |
| PATCH | `/api/rdv-notifications/:id/read` | Marquer comme lue |
| DELETE | `/api/rdv-notifications/:id` | Supprimer |

### Commandes

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/commandes` | Liste toutes les commandes |
| POST | `/api/commandes` | Créer une commande |
| PUT | `/api/commandes/:id` | Modifier une commande |
| DELETE | `/api/commandes/:id` | Supprimer une commande |

### Dépenses

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/depenses/mois` | Dépenses du mois |
| GET | `/api/depenses/fixes` | Dépenses fixes |
| POST | `/api/depenses/mois` | Ajouter dépense |
| PUT | `/api/depenses/mois/:id` | Modifier dépense |
| DELETE | `/api/depenses/mois/:id` | Supprimer dépense |

### Prêts Familles

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/pretfamilles` | Liste les prêts |
| POST | `/api/pretfamilles` | Créer un prêt |
| PUT | `/api/pretfamilles/:id` | Modifier |
| DELETE | `/api/pretfamilles/:id` | Supprimer |
| POST | `/api/pretfamilles/:id/remboursement` | Remboursement |

### Prêts Produits

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/pretproduits` | Liste les prêts |
| POST | `/api/pretproduits` | Créer un prêt |
| PUT | `/api/pretproduits/:id` | Modifier |
| DELETE | `/api/pretproduits/:id` | Supprimer |
| POST | `/api/pretproduits/:id/paiement` | Enregistrer paiement |

### Synchronisation

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/sync/events` | Server-Sent Events |
| POST | `/api/sync/trigger` | Déclencher sync |

---

## Codes d'Erreur API

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource non trouvée |
| 429 | Trop de requêtes |
| 500 | Erreur serveur |

---

## Support

Pour toute question ou problème, consultez:
- La documentation technique dans `/docs`
- Les commentaires dans le code source
- Le fichier README.md à la racine du projet

---

*Documentation mise à jour le 22 décembre 2025*
