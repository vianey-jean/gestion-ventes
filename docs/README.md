
# Documentation du Projet - Système de Gestion Commerciale

## Vue d'ensemble

Ce projet est un système de gestion commerciale complet développé avec React/TypeScript en frontend et Node.js/Express en backend.

## Structure de la documentation

- [Architecture](./ARCHITECTURE.md) - Architecture générale du système
- [API Documentation](./API_DOCUMENTATION.md) - Documentation complète de l'API
- [Frontend Guide](./FRONTEND_GUIDE.md) - Guide du développement frontend
- [Backend Guide](./BACKEND_GUIDE.md) - Guide du développement backend
- [Tests Guide](./TESTS_GUIDE.md) - Guide des tests et stratégies de test
- [Deployment](./DEPLOYMENT.md) - Guide de déploiement
- [Security](./SECURITY.md) - Guide de sécurité
- [Performance](./PERFORMANCE.md) - Guide d'optimisation des performances

## Technologies utilisées

### Frontend
- React 18.3.1 avec TypeScript
- Vite pour le build
- Tailwind CSS + Shadcn/UI
- React Context pour la gestion d'état
- React Router pour la navigation
- Framer Motion pour les animations

### Backend
- Node.js avec Express.js
- JSON pour le stockage de données (développement)
- JWT pour l'authentification
- Bcrypt pour le hachage des mots de passe
- CORS pour la sécurité
- Multer pour l'upload de fichiers

### Tests
- Vitest pour les tests unitaires
- React Testing Library pour les tests de composants
- Jest DOM pour les assertions
- Playwright pour les tests E2E (mock)

## Démarrage rapide

1. Installation des dépendances : `npm install`
2. Démarrage du développement : `npm run dev`
3. Lancement des tests : `npm test`
4. Build de production : `npm run build`

## Structure du projet

```
src/
├── components/          # Composants React
│   ├── ui/             # Composants UI de base
│   ├── dashboard/      # Composants du tableau de bord
│   └── forms/          # Composants de formulaires
├── contexts/           # Contextes React
├── hooks/              # Hooks personnalisés
├── services/           # Services métier
├── types/              # Définitions TypeScript
└── tests/              # Tests unitaires et d'intégration
```
