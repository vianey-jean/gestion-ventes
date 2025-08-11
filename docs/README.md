
# SYSTÈME DE GESTION COMMERCIALE - DOCUMENTATION COMPLÈTE

## Vue d'ensemble du projet

**Système de Gestion Commerciale Intégré** est une application web moderne développée avec React/TypeScript pour le frontend et Node.js/Express pour le backend. Elle permet aux petites et moyennes entreprises de gérer efficacement leurs produits, ventes, clients, prêts et dépenses avec synchronisation temps réel.

## Architecture technique

### Stack technologique
- **Frontend**: React 18.3.1 + TypeScript + Vite
- **Backend**: Node.js + Express.js
- **Base de données**: Fichiers JSON (développement)
- **Styling**: Tailwind CSS + Shadcn/UI
- **État**: React Context API
- **Authentification**: JWT
- **Temps réel**: Server-Sent Events (SSE)
- **Tests**: Vitest + React Testing Library

### Structure du projet
```
├── src/                    # Code source frontend
│   ├── components/         # Composants React
│   ├── pages/             # Pages de l'application
│   ├── contexts/          # Contextes React
│   ├── hooks/             # Hooks personnalisés
│   ├── services/          # Services API
│   ├── types/             # Types TypeScript
│   └── tests/             # Tests unitaires
├── server/                # Code source backend
│   ├── routes/            # Routes API
│   ├── models/            # Modèles de données
│   ├── middleware/        # Middlewares Express
│   └── db/                # Base de données JSON
├── docs/                  # Documentation
└── public/                # Assets statiques
```

## Modules fonctionnels

### 1. Authentification et sécurité
- Connexion/inscription utilisateur
- JWT avec expiration (24h)
- Déconnexion automatique après inactivité (10 min)
- Hashage sécurisé des mots de passe (bcrypt)

### 2. Gestion des produits
- CRUD complet avec validation
- Upload d'images
- Recherche et filtrage
- Gestion des stocks

### 3. Gestion des ventes
- Enregistrement avec calcul automatique des bénéfices
- Sélection de produits dynamique
- Historique par mois/année
- Export des données

### 4. Gestion des clients
- Base de données clients complète
- Synchronisation temps réel
- Intégration avec les ventes
- Historique des transactions

### 5. Calculateur de bénéfices
- Paramètres configurables (taxes, TVA, frais)
- Prix recommandé basé sur la marge
- Sauvegarde des calculs

### 6. Gestion des prêts
- Prêts familiaux avec suivi
- Prêts produits (avances)
- Calcul automatique des soldes

### 7. Gestion des dépenses
- Dépenses mensuelles (débit/crédit)
- Dépenses fixes configurables
- Réinitialisation mensuelle

### 8. Analyses et tendances
- Graphiques interactifs (Recharts)
- Statistiques avancées
- Comparaisons périodiques

### 9. Synchronisation temps réel
- Server-Sent Events
- Mise à jour automatique des données
- Gestion des connexions multiples

## Sécurité et performance

### Sécurité
- Validation des données côté client/serveur
- Protection CORS
- Middleware d'authentification
- Sanitisation des entrées

### Performance
- Lazy loading des composants
- Mémorisation React
- Debouncing des recherches
- Optimisation des re-renders

## Guide de démarrage

### Installation
```bash
npm install
npm start  # Backend sur port 10000
npm run dev  # Frontend sur port 5173
```

### Variables d'environnement
```
JWT_SECRET=your_secret_key
PORT=10000
NODE_ENV=development
```

## Documentation détaillée

Consultez les fichiers suivants pour plus d'informations :
- `docs/final/ARCHITECTURE.md` - Architecture détaillée
- `docs/final/API_DOCUMENTATION.md` - Documentation API
- `docs/final/GUIDE_DEVELOPPEMENT.md` - Guide développeur
- `docs/final/TESTS_DOCUMENTATION.md` - Documentation tests
- `docs/final/COMPOSANTS_REUTILISABLES.md` - Composants UI

## Statut du projet

✅ **Fonctionnalités terminées**
- Authentification complète
- Gestion produits/ventes/clients
- Calculateur de bénéfices
- Gestion prêts et dépenses
- Synchronisation temps réel
- Interface responsive

🔄 **En cours**
- Tests unitaires complets
- Documentation finale

🎯 **Prochaines étapes**
- Migration PostgreSQL
- Tests E2E
- CI/CD Pipeline
- Optimisations performance
