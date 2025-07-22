
# ARCHITECTURE DU SYSTÈME

## Vue d'ensemble

Ce document décrit l'architecture complète du système de gestion commerciale, conçu selon les meilleures pratiques de développement moderne.

## Stack Technologique

### Frontend
- **Framework**: React 18.3.1 avec TypeScript
- **Build Tool**: Vite (performances optimales)
- **Styling**: Tailwind CSS + Shadcn/UI
- **État Global**: React Context API avec immuabilité
- **Routage**: React Router DOM v6
- **Formulaires**: React Hook Form + Zod
- **Tests**: Vitest + React Testing Library
- **Accessibilité**: WCAG 2.1 AA compliant

### Backend
- **Runtime**: Node.js avec Express.js
- **Base de données**: JSON (développement) → PostgreSQL (production)
- **Authentification**: JWT avec bcrypt
- **Middleware**: CORS, Multer, Auth
- **Temps réel**: Server-Sent Events (SSE)
- **Tests**: Jest + Supertest

## Principes Architecturaux

### 1. Immutabilité
- Tous les états sont immuables
- Utilisation d'Immer pour les mises à jour
- Props en lecture seule uniquement

### 2. Fonctions Pures
- Composants sans effets de bord
- Hooks prévisibles et testables
- Calculs déterministes

### 3. Séparation des Responsabilités
- **Présentation**: Composants UI purs
- **Logique Métier**: Services et hooks
- **État**: Contextes spécialisés

### 4. Réutilisabilité
- Composants génériques
- Hooks personnalisés
- Services modulaires

## Structure des Dossiers

```
src/
├── components/
│   ├── ui/                 # Composants UI de base
│   ├── business/           # Composants métier
│   ├── layout/             # Composants de mise en page
│   └── forms/              # Composants de formulaires
├── hooks/                  # Hooks personnalisés
├── services/               # Services métier
├── contexts/               # Contextes React
├── utils/                  # Utilitaires purs
├── types/                  # Définitions TypeScript
├── tests/                  # Tests unitaires et d'intégration
└── assets/                 # Ressources statiques
```

## Patterns Utilisés

### 1. Provider Pattern
```typescript
// Contexte avec état immuable
const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useImmerReducer(appReducer, initialState);
  // ...
};
```

### 2. Hook Pattern
```typescript
// Hook métier pur
const useProductCalculations = (products: readonly Product[]): ProductStats => {
  return useMemo(() => calculateProductStats(products), [products]);
};
```

### 3. Service Layer Pattern
```typescript
// Service pur sans effets de bord
export const productService = {
  calculateProfit: (product: Product, salePrice: number): number => {
    return salePrice - product.purchasePrice;
  }
};
```

## Gestion des États

### Contextes Spécialisés
- **AuthContext**: Authentification uniquement
- **ProductContext**: Gestion des produits
- **SalesContext**: Gestion des ventes
- **UIContext**: État de l'interface

### Immutabilité Garantie
```typescript
// Utilisation d'Immer pour les mises à jour
const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
  dispatch(draft => {
    const product = draft.products.find(p => p.id === id);
    if (product) {
      Object.assign(product, updates);
    }
  });
}, [dispatch]);
```

## Tests et Qualité

### Couverture de Tests
- **Composants**: 100% des composants testés
- **Hooks**: Tests unitaires complets
- **Services**: Tests de logique métier
- **API**: Tests d'intégration

### Outils de Qualité
- **ESLint**: Règles strictes
- **TypeScript**: Mode strict
- **Prettier**: Formatage automatique
- **Husky**: Pre-commit hooks

