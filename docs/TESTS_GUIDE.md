# 🧪 Guide des tests

## Exécution
```bash
npx vitest run              # tous les tests
npx vitest run src/tests/hooks
```
Configuration : `vitest.config.ts`, environnement initialisé par `src/tests/setup.ts`, mocks partagés dans `src/tests/utils/testMocks.ts`.

## Périmètre existant
| Dossier | Contenu |
|---|---|
| `src/tests/hooks` | `useAuth`, `useBusinessCalculations`, `useClientSync`, `useRealtimeSync` |
| `src/tests/services` | `BusinessCalculationService`, `ClientService`, `FormatService` |
| `src/tests/components` | Rendu des composants clés |
| `src/tests/integration` | `SalesWorkflow` (parcours de vente) |
| `src/tests/e2e` | `userJourney`, `complete-user-journey` |
| `src/tests/performance` | Budgets de rendu |
| `src/tests/backend` | Middleware `auth`, routes `auth` et `products`, service de données |

## Règles
Tout nouveau calcul métier doit être couvert par un test unitaire ; toute nouvelle route serveur par un test de route.

