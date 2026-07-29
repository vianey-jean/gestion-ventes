# 🖼️ Documentation Frontend

## 1. Stack

React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · shadcn/ui · React Router · Axios (+ axios-retry) · Zustand · Recharts · Framer Motion · date-fns · jsPDF / xlsx pour les exports.

## 2. Contextes globaux (`src/contexts`)

| Fichier | Exports | Rôle |
|---|---|---|
| `AppContext.tsx` | `AppProvider`, `useApp` | AppContext.tsx - Contexte global de l'application  Fournit les données partagées (produits, ventes) et les fonctions CRUD à tous les composants via React Contex |
| `AuthContext.tsx` | `AuthProvider`, `useAuth` | AuthContext.tsx - Contexte d'authentification  Gère l'état de connexion, le token JWT, le profil utilisateur, et les fonctions login/logout/register/resetPasswo |
| `FormProtectionContext.tsx` | `FormProtectionProvider`, `useFormProtection` | — |
| `ThemeContext.tsx` | `ThemeProvider`, `useTheme` | — |

- **AuthContext** : session utilisateur, token JWT, login/logout, écoute de l'événement `auth:logout`.
- **AppContext** : données transverses (produits, ventes, chargement global).
- **ThemeContext** : thème clair/sombre persistant.
- **FormProtectionContext** : blocage de la navigation quand un formulaire est en cours de saisie.

## 3. Stores Zustand (`src/store`)

| Fichier | Exports |
|---|---|
| `appStore.ts` | `useAppStore` | App Store — État global de l'application (Zustand)  Centralise : produits, ventes, clients, chargement, erreurs Remplace progressivement AppContext pour de meil |
| `authStore.ts` | `useAuthStore` | Auth Store — État d'authentification (Zustand)  Gère : utilisateur courant, token, statut de connexion |
| `index.ts` | — | Store — Point d'entrée centralisé pour le state management (Zustand)  Architecture MVC : - Models (types/) : définitions des données - Views (components/, pages |

## 4. Hooks (`src/hooks`)

| Fichier | Exports | Description |
|---|---|---|
| `index.ts` | — | Export centralisé de tous les hooks personnalisés |
| `use-auto-logout.tsx` | `useAutoLogout` | — |
| `use-chat-notification.ts` | `useChatNotification` | — |
| `use-currency-formatter.ts` | — | — |
| `use-error-boundary.tsx` | `useErrorBoundary`, `ErrorBoundaryProvider`, `useAsyncError` | — |
| `use-messages.ts` | `useMessages` | — |
| `use-mobile.tsx` | `useIsMobile`, `useMobile` | — |
| `use-professional-data.tsx` | `useProfessionalData`, `usePaginatedData` | — |
| `use-realtime-sync.ts` | `setFormProtection`, `isFormProtected`, `useRealtimeSync` | — |
| `use-sse.ts` | `useSSE` | — |
| `use-toast.ts` | `reducer` | — |
| `use-visit-logger.ts` | `useVisitLogger` | useVisitLogger.ts — Enregistre la visite initiale puis chaque changement de route (page consultée) dans l'historique des connexions. - Une session navigateur re |
| `useAttributeKinds.ts` | `notifyKindsChanged`, `useAttributeKinds` | useAttributeKinds — Hook central pour la gestion des TYPES d'attributs produits. Fournit CRUD sur les kinds + événement de synchronisation entre composants (Pro |
| `useBusinessCalculations.ts` | `useBusinessCalculations` | — |
| `useClientSync.ts` | `useClientSync` | — |
| `useClients.ts` | `useClients`, `useClientsPagination` | Hook personnalisé pour la gestion des clients |
| `useCommandes.ts` | `useCommandes`, `useCommandesFilter`, `useCommandeCart` | Hook personnalisé pour la gestion des commandes |
| `useCommandesLogic.ts` | `useCommandesLogic` | ============================================================================= useCommandesLogic - Hook de logique métier pour CommandesPage ==================== |
| `useComptabilite.ts` | `MONTHS`, `useComptabilite` | useComptabilite - Hook personnalisé pour la logique métier du module Comptabilité  Ce hook centralise toute la logique métier, les états et les calculs du modul |
| `useObjectif.ts` | `useObjectif` | — |
| `useOptimization.ts` | `useDebounce`, `useDebouncedCallback`, `useThrottledCallback`, `useDeepMemo`, `usePagination`, `useFilteredData`, `useSortedData`, `useLocalCache`, `useIntersectionObserver` | — |
| `usePhoneActions.ts` | `usePhoneActions` | Hook pour les actions téléphoniques (appel, SMS) |
| `useProductAttributes.ts` | `notifyValuesChanged`, `useProductAttributes` | useProductAttributes — Charge et met en cache les valeurs d'un type d'attribut. Le `kind` passé peut être :   - un id de kind (`k_xxx`) provenant de useAttribut |
| `useProducts.ts` | `useProducts` | Hook personnalisé pour la gestion des produits |
| `useRdv.ts` | `useRdv` | — |
| `useRealtimeCommentNotifications.ts` | `useRealtimeCommentNotifications` | — |
| `useSales.ts` | `useSales` | Hook personnalisé pour la gestion des ventes |
| `useYearlyData.ts` | `getSaleValues`, `filterSalesByYear`, `filterSalesByMonthYear`, `useYearlyData` | — |

## 5. Services (`src/services`)

| Fichier | Exports | Description |
|---|---|---|
| `BusinessCalculationService.ts` | `BusinessCalculationService` | — |
| `FormatService.ts` | `FormatService` | — |
| `dataOptimizationService.ts` | `dataOptimizationService`, `useOptimizedSalesData`, `useOptimizedProductData` | — |
| `optimizedRealtimeService.ts` | `optimizedRealtimeService` | — |
| `rdvFromReservationService.ts` | `rdvFromReservationService` | — |
| `realtimeService.ts` | — | — |
| `reservationRdvSyncService.ts` | `reservationRdvSyncService` | — |
| `syncService.ts` | `syncService` | — |

### Temps réel (`src/services/realtime`)

| Fichier | Exports |
|---|---|
| `DataCacheManager.ts` | `DataCacheManager` | — |
| `EventSourceManager.ts` | `EventSourceManager` | — |
| `RealtimeService.ts` | `realtimeService` | — |
| `types.ts` | — | — |

## 6. Types (`src/types`)

| Fichier | Exports |
|---|---|
| `auth.ts` | — | Types pour l'authentification |
| `client.ts` | — | Types pour les clients |
| `commande.ts` | — | Types pour les commandes |
| `comptabilite.ts` | — | Types pour les nouveaux achats et dépenses |
| `depense.ts` | — | Types pour les dépenses |
| `index.ts` | — | Export centralisé de tous les types |
| `pret.ts` | — | Types pour les prêts |
| `product.ts` | — | Types pour les produits |
| `rdv.ts` | — | Types pour les rendez-vous |
| `sale.ts` | — | Types pour les ventes |

## 7. Utilitaires (`src/utils` et `src/lib`)

| Fichier | Exports |
|---|---|
| `clientCharacteristic.ts` | `computeClientCaracteristique`, `CARACTERISTIQUES`, `getCaracteristiqueByLabel` | Caractéristique client calculée à partir des bases clients/sales/commandes. |
| `clientMatch.ts` | `findMatchingClients`, `clientHasDifference`, `canCreateNewDespiteMatches`, `matchSignature` | Utilitaires de détection de doublons clients. Compare nom, téléphones et adresses avec la base existante. |
| `helpers.ts` | `formatCurrency`, `formatDate`, `formatNumber`, `truncateText`, `generateId`, `debounce`, `throttle` | Helpers — Fonctions utilitaires génériques |
| `index.ts` | — | Utils — Fonctions utilitaires centralisées  Point d'entrée unique pour toutes les fonctions utilitaires. Nouveau code doit importer depuis @/utils au lieu de @/ |
| `rdvConfirmationLock.ts` | `computeLockStateForCommande`, `computeLockStateForTache` | — |
| `validators.ts` | `validateEmail`, `validatePhone`, `validateRequired`, `sanitizeInput` | Validators — Fonctions de validation des entrées |
| `barcodeCodec.ts` | `decodeBarcode`, `getBarcodeValue` | barcodeCodec.ts Encodage / décodage du code-barre obfusqué stocké dans products.json. Le serveur stocke le code-barre sous forme de plusieurs segments : { v: 1, |
| `performance.ts` | `dataCache`, `debounce`, `throttle`, `createBatcher`, `performanceMonitor`, `prefetchRoute`, `prefetchImage`, `createLazyLoader`, `calculateVisibleRange`, `cleanupMemory` | Service d'optimisation des performances pour le frontend Inclut: Cache, debouncing, throttling, lazy loading helpers |
| `security.ts` | `sanitizeString`, `sanitizeObject`, `safeEncodeURI`, `isSafeUrl`, `validators`, `generateSecureId`, `maskSensitiveData`, `maskEmail`, `checkPasswordStrength`, `RateLimiter`, `generateCSRFToken`, `storeCSRFToken`, `getCSRFToken`, `validateCSRFToken`, `secureStorage`, `globalRateLimiter`, `authRateLimiter`, `apiRateLimiter`, `validateForm` | Utilitaires de sécurité complets pour le frontend Inclut: XSS protection, validation, rate limiting, CSRF, sanitization |
| `utils.ts` | `cn` | — |
| `validation.ts` | `emailSchema`, `phoneSchema`, `passwordSchema`, `amountSchema`, `quantitySchema`, `idSchema`, `dateSchema`, `clientSchema`, `productSchema`, `saleProductSchema`, `saleSchema`, `messageSchema`, `loginSchema`, `registerSchema` | — |

## 8. Design system

- Tokens de couleur, dégradés et ombres définis dans `src/index.css` et `tailwind.config.ts`.
- Styles complémentaires : `src/styles/accessibility.css`, `base/contrast.css`, `base/motion.css`, `base/typography.css`, `components/forms.css`, `components/navigation.css`, `utilities/screen-reader.css`.
- Direction visuelle : professionnelle, luxe, entièrement responsive, CSS critique inline pour éviter le FOUC.

