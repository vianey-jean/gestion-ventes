# ARCHITECTURE MODULAIRE DU PROJET

## Vue d'ensemble

Ce document décrit l'architecture modulaire du système de gestion commerciale.

## Structure des Dossiers

```
src/
├── components/
│   ├── ui/                    # Composants UI de base (shadcn)
│   ├── common/                # Composants réutilisables
│   │   └── PhoneActionModal.tsx
│   ├── clients/               # Composants spécifiques aux clients
│   │   ├── ClientCard.tsx
│   │   ├── ClientsGrid.tsx
│   │   ├── ClientsHero.tsx
│   │   ├── ClientSearchBar.tsx
│   │   └── index.ts
│   ├── forms/                 # Formulaires dédiés
│   │   └── ClientForm.tsx
│   ├── dashboard/             # Composants du tableau de bord
│   └── layout/                # Composants de mise en page
├── hooks/                     # Hooks personnalisés
│   ├── useClients.ts          # Gestion des clients
│   ├── useProducts.ts         # Gestion des produits
│   ├── useSales.ts            # Gestion des ventes
│   ├── useCommandes.ts        # Gestion des commandes
│   ├── usePhoneActions.ts     # Actions téléphoniques
│   └── index.ts               # Export centralisé
├── services/
│   └── api/                   # Services API séparés
│       ├── api.ts             # Configuration axios de base
│       ├── authApi.ts         # API authentification
│       ├── clientApi.ts       # API clients
│       ├── productApi.ts      # API produits
│       ├── saleApi.ts         # API ventes
│       ├── commandeApi.ts     # API commandes
│       ├── pretFamilleApi.ts  # API prêts familles
│       ├── pretProduitApi.ts  # API prêts produits
│       ├── depenseApi.ts      # API dépenses
│       ├── beneficeApi.ts     # API bénéfices
│       ├── marketingApi.ts    # API marketing
│       └── index.ts           # Export centralisé
├── types/                     # Types TypeScript centralisés
│   ├── auth.ts                # Types authentification
│   ├── client.ts              # Types clients
│   ├── product.ts             # Types produits
│   ├── sale.ts                # Types ventes
│   ├── commande.ts            # Types commandes
│   ├── pret.ts                # Types prêts
│   ├── depense.ts             # Types dépenses
│   └── index.ts               # Export centralisé
├── contexts/                  # Contextes React
├── pages/                     # Pages de l'application
└── lib/                       # Utilitaires
```

## Principes Architecturaux

### 1. Séparation des Responsabilités
- **Services API**: Toute communication avec le backend
- **Hooks**: Logique métier et gestion d'état
- **Composants**: Présentation pure
- **Types**: Définitions TypeScript centralisées

### 2. Modularité
- Un fichier = une responsabilité
- Exports centralisés via index.ts
- Imports absolus avec alias @/

### 3. Réutilisabilité
- Composants génériques dans common/
- Hooks personnalisés pour la logique partagée
- Types partagés dans types/

## Services API

Chaque domaine a son propre service API:
- `authApiService` - Authentification
- `clientApiService` - CRUD clients
- `productApiService` - CRUD produits
- `saleApiService` - CRUD ventes
- `commandeApiService` - CRUD commandes
- `pretFamilleApiService` - CRUD prêts familles
- `pretProduitApiService` - CRUD prêts produits
- `depenseApiService` - CRUD dépenses
- `beneficeApiService` - CRUD bénéfices
- `marketingApiService` - Génération marketing

## Hooks Personnalisés

- `useClients()` - Gestion complète des clients
- `useClientsPagination()` - Pagination et recherche
- `useProducts()` - Gestion des produits
- `useSales()` - Gestion des ventes
- `useCommandes()` - Gestion des commandes
- `useCommandesFilter()` - Filtrage des commandes
- `useCommandeCart()` - Panier de produits
- `usePhoneActions()` - Actions téléphoniques

## Utilisation

### Import des services
```typescript
import { clientApiService, productApiService } from '@/services/api';
```

### Import des hooks
```typescript
import { useClients, useProducts } from '@/hooks';
```

### Import des types
```typescript
import { Client, Product, Sale } from '@/types';
```

## Flux de Données

1. **Pages** orchestrent les composants et hooks
2. **Hooks** gèrent la logique et appellent les services
3. **Services API** communiquent avec le backend
4. **Composants** affichent les données

## Bonnes Pratiques

1. Jamais d'appel API direct dans les composants
2. Types explicites pour toutes les fonctions
3. Hooks pour la logique réutilisable
4. Composants courts et focalisés
