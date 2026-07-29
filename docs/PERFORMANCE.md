# 🚀 Performance

## Mesures en place
- **Lazy loading** de toutes les pages via `React.lazy` + `Suspense` (`src/App.tsx`).
- **CSS critique inline** pour supprimer le FOUC.
- **Pagination** systématique des grandes listes (produits, clients, ventes).
- **Mémoïsation** : `useMemo`/`useCallback` dans les hooks de calcul (`useBusinessCalculations`, `useComptabilite`, `useTendancesData`).
- **Cache temps réel** : `DataCacheManager` évite les rechargements inutiles ; `dataOptimizationService` agrège les données lourdes.
- **Réseau** : timeout 30 s, retry exponentiel, aucun polling.
- **Serveur** : lecture/écriture atomiques, clés de chiffrement mises en cache.

## Budgets cibles
| Indicateur | Cible |
|---|---|
| Premier rendu utile | < 2 s |
| Interaction (clic → retour visuel) | < 100 ms |
| Taille d'un composant | < 400 lignes (au-delà, découper) |

## Pièges à éviter
Recharger toute une liste après une mutation unitaire, imbriquer des `.map` coûteux dans le rendu, créer des objets de style à chaque rendu, ajouter un `setInterval` de rafraîchissement (utiliser le SSE).

