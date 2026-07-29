# 📄 Spécification de toutes les pages

Ce document couvre les **55 fichiers** du dossier `src/pages` : pages routées et sous-vues dédiées.

### `src/pages/AboutPage.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 271 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/Layout`, `@/components/SEOHead`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/ClientsPage.tsx`

ClientsPage - Page de gestion des clients (refactorisée en sous-composants). Fonctionnalités : recherche, tri par nom, filtre fidélité, filtre ville, ajout/édition/suppression avec confirmations, actions téléphone / adresse, gestion des doublons, fusion, gestion des villes, détail & fidélité.

- **Exports** : —
- **Taille** : 556 lignes
- **Services API utilisés** : `clientsVillesApi`, `villesApi`, `fideliteApiService`, `fideliteApi`
- **Hooks métier** : `useAuth`, `useClientSync`, `useToast`, `useIsMobile`
- **Sous-composants / modules internes** : `@/components/Navbar`, `@/components/Footer`, `@/components/ScrollToTop`, `@/components/Layout`, `@/components/ui/premium-loading`, `@/components/SEOHead`, `@/components/ui/button`, `@/components/dashboard/forms/ConfirmDeleteDialog`, `@/components/clients/ClientDetailModal`, `@/components/clients/ClientPhotoZoomModal`, `@/components/clients/ClientMergeModal`, `@/components/clients/DuplicateClientModal`, `@/components/clients/CitiesManagerModal`, `@/components/clients/ClientFilterBar`, `@/components/clients/ClientPhoneActionModal`, `@/components/clients/ClientAddressActionModal`, `@/components/clients/ClientConfirmDialogs`, `@/components/clients/ClientFormDialog`, `@/components/shared/Pagination`, `@/components/clients/ClientCardItem`, `@/components/clients/FideliteListModal`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/CommandesPage.tsx`

============================================================================= CommandesPage - Page de gestion des Commandes et Réservations =============================================================================  Utilise useCommandesLogic pour toute la logique métier. Les composants UI sont importés depuis @/components/commandes.

- **Exports** : —
- **Taille** : 252 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useCommandesLogic`
- **Sous-composants / modules internes** : `@/components/Layout`, `@/components/ui/premium-loading`, `@/components/commandes`, `@/components/commandes/TacheConflictModal`, `@/components/commandes/OverdueReservationModal`, `@/components/commandes/CommandeArriveePlanifDialog`, `@/components/commandes/ReservationUlterieureModal`, `@/components/commandes/StatutUlterieurTransitionModal`, `@/components/SEOHead`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/Comptabilite.tsx`

Comptabilite.tsx - Redirection vers la page comptabilité dans le dashboard

- **Exports** : —
- **Taille** : 12 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/ContactPage.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 325 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`, `useMessages`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/textarea`, `@/components/ui/card`, `@/components/ui/label`, `@/components/ui/select`, `@/components/Layout`, `@/components/livechat/LiveChatVisitor`, `@/components/SEOHead`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/DashboardPage.tsx`

============================================================================= DashboardPage - Page principale unifiée avec barre latérale ============================================================================= Refonte UI Ultra Luxe / Glassmorphism Premium / Modern SaaS ⚠️ Aucune logique métier modifiée ⚠️ Même structure fonctionnelle

- **Exports** : —
- **Taille** : 828 lignes
- **Services API utilisés** : `tacheApi`
- **Hooks métier** : `useIsMobile`
- **Sous-composants / modules internes** : `@/components/Layout`, `@/components/SEOHead`, `@/components/ui/badge`, `@/components/ui/premium-loading`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/Depenses.tsx`

Depenses.tsx - Redirection vers la page dépenses dans le dashboard

- **Exports** : —
- **Taille** : 12 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/HomePage.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 315 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAuth`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/Layout`, `@/components/SEOHead`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/Index.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 13 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/LoginPage.tsx`

LoginPage.tsx - Ultra Premium Luxury Auth Experience ✨ Improvements: - Ultra modern glassmorphism - Aurora animated background - Neon gradients & luxury shadows - Advanced lock system UI

- **Exports** : —
- **Taille** : 1046 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAuth`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/card`, `@/components/PasswordInput`, `@/components/PasswordStrengthChecker`, `@/components/Layout`, `@/components/ui/premium-loading`, `@/components/SEOHead`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/MaintenancePage.tsx`

MaintenancePage — Page affichée quand le site est en maintenance.  Style ultra-luxe (cohérent avec la page Comptabilité / Login). Permet à un administrateur principal de se connecter via un formulaire dédié (réutilise la logique login mais sans Footer ni Navbar, et seul un admin principal peut compléter la connexion).

- **Exports** : —
- **Taille** : 467 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAuth`, `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/card`, `@/components/PasswordInput`, `@/components/ui/premium-loading`

**`MaintenancePageProps`**

| Prop | Type | Requis |
|---|---|---|
| `message` | `string` | non |
| `onAuthenticated` | `() => void` | non |

---

### `src/pages/MessagesPage.tsx`

MessagesPage.tsx - Page de messagerie interne avec notifications et compteur de non-lus

- **Exports** : —
- **Taille** : 313 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useMessages`, `useAuth`, `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/card`, `@/components/ui/badge`, `@/components/ui/alert-dialog`, `@/components/Layout`, `@/components/ui/input`, `@/components/ui/premium-loading`, `@/components/SEOHead`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/NotFound.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 86 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/SEOHead`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/PointagePage.tsx`

PointagePage.tsx - Page de gestion du pointage des travailleurs  Affiche les entreprises, travailleurs et entrées de pointage. Inclut le partage de données via liens sécurisés et la réception de commentaires.

- **Exports** : —
- **Taille** : 362 lignes
- **Services API utilisés** : `entrepriseApi`, `pointageApi`, `travailleurApi`, `shareCommentsApi`
- **Hooks métier** : `useToast`, `useRealtimeCommentNotifications`
- **Sous-composants / modules internes** : `@/components/Layout`, `@/components/pointage/PointageTabNav`, `@/components/pointage/PointageHero`, `@/components/pointage/PointageCalendar`, `@/components/pointage/PointageEntreprisesList`, `@/components/pointage/PointageTravailleursList`, `@/components/pointage/modals/EntrepriseModal`, `@/components/pointage/modals/TravailleurModal`, `@/components/pointage/modals/PointageFormModal`, `@/components/pointage/modals/DayDetailModal`, `@/components/pointage/modals/EditPointageModal`, `@/components/pointage/modals/ParPersonneModal`, `@/components/pointage/modals/YearlyTotalModal`, `@/components/pointage/modals/MonthDetailModal`, `@/components/pointage/modals/PointageConfirmDialogs`, `@/components/pointage/modals/AvanceModal`, `@/components/tache/TacheView`, `@/components/rdvtache/RdvTacheView`, `@/components/notes/NotesKanbanView`, `@/components/shared/ShareLinkModal`, `@/components/shared/SelectiveShareModal`, `@/components/shared/ShareCommentsViewer`, `@/components/SEOHead`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/PretFamilles.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 11 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/PretProduits.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 11 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/Produits.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 11 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/ProduitsPage.tsx`

ProduitsPage.tsx - Page de gestion des produits Version décomposée : la page orchestre uniquement l'état et délègue le rendu aux composants extraits dans `src/components/products/*` et `src/components/products/modals/*`.

- **Exports** : —
- **Taille** : 884 lignes
- **Services API utilisés** : `productApiService`, `productApi`, `fournisseurApiService`, `fournisseurApi`, `productCommentsApi`, `clientApiService`, `clientApi`
- **Hooks métier** : `useApp`, `useToast`
- **Sous-composants / modules internes** : `@/components/Layout`, `@/pages/produits/ProduitsHero`, `@/components/shared/Pagination`, `@/components/SEOHead`, `@/components/products/CaracteristiqueModal`, `@/components/products/ProductMergeModal`, `@/components/products/ProductsVenduModal`, `@/components/products/PrixHistoryModal`, `@/components/products/StockListModal`, `@/components/dashboard/EditProductForm`, `@/pages/produits/ProduitsToolbar`, `@/pages/produits/ProduitsFiltersStats`, `@/pages/produits/AchatVenteSubModals`, `@/components/products/attributes/ProductAttributesToolbar`, `@/components/products/attributes/ProductClassificationSelector`, `@/components/products/attributes/ProductClassificationFilterModal`, `@/components/products/ProductsTable`, `@/components/products/modals`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/ProfilePage.tsx`

ProfilePage — Page principale du profil utilisateur (refactorisée). Onglets : - Profil : ProfileCard + ProfileInfoCard + PasswordSection - Paramètres (admin) : ParametresSection - Sécurité (admin principal) : SecuriteSection + MaintenanceSection Sous-composants extraits :

- **Exports** : —
- **Taille** : 239 lignes
- **Services API utilisés** : `profileApi`
- **Hooks métier** : `useAuth`, `useToast`
- **Sous-composants / modules internes** : `@/components/Layout`, `@/components/ui/premium-loading`, `@/components/SEOHead`, `@/components/profile/ProfileCard`, `@/components/profile/ProfileInfoCard`, `@/components/profile/PasswordSection`, `@/components/profile/ParametresSection`, `@/components/profile/SecuriteSection`, `@/components/profile/MaintenanceSection`, `@/components/profile/ProfileHero`, `@/components/profile/ProfileTabsNav`, `@/components/profile/ProfileConfirmDialogs`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/RdvPage.tsx`

============================================================================= RdvPage - Page de gestion des rendez-vous =============================================================================  Utilise des composants extraits pour le hero, stats, recherche et liste. 

- **Exports** : —
- **Taille** : 325 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useRdv`
- **Sous-composants / modules internes** : `@/components/Layout`, `@/components/rdv`, `@/components/rdv/RdvStatsDetailsModal`, `@/components/shared`, `@/components/ui/tabs`, `@/components/ui/premium-loading`, `@/components/SEOHead`, `@/components/rdv/ConfirmationRdvButton`, `@/pages/rdv`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/RegisterPage.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 702 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAuth`, `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/card`, `@/components/ui/select`, `@/components/ui/checkbox`, `@/components/PasswordInput`, `@/components/PasswordStrengthChecker`, `@/components/Layout`, `@/components/ui/premium-loading`, `@/components/SEOHead`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/ResetPasswordPage.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 263 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAuth`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/card`, `@/components/PasswordInput`, `@/components/PasswordStrengthChecker`, `@/components/Layout`, `@/components/ui/premium-loading`, `@/components/SEOHead`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/SharedNotesPage.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 208 lignes
- **Services API utilisés** : `noteApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/SEOHead`, `@/components/shared/SharedCommentForm`, `@/components/ui/premium-loading`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/SharedViewPage.tsx`

SharedViewPage.tsx  Page publique pour visualiser un lien partagé (pointage, tâches ou notes). Accessible sans authentification via un token unique et un code d'accès.  Flux :

- **Exports** : —
- **Taille** : 344 lignes
- **Services API utilisés** : `shareLinksApi`, `noteApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/SEOHead`, `@/components/shared/SharedCommentForm`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/Tendances.tsx`

Tendances.tsx - Page d'analyse des tendances de ventes avec graphiques

- **Exports** : —
- **Taille** : 43 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/TendancesPage.tsx`

============================================================================= TendancesPage - Page d'analyse des tendances et analytics =============================================================================  Utilise useTendancesData pour la logique de calcul et des composants extraits pour chaque section visuelle.

- **Exports** : —
- **Taille** : 135 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useTendancesData`, `useApp`, `useIsMobile`
- **Sous-composants / modules internes** : `@/components/Layout`, `@/components/ui/tabs`, `@/components/ui/premium-loading`, `@/components/tendances/TendancesStatsModals`, `@/pages/tendances/TendancesHero`, `@/pages/tendances/useTendancesData`, `@/pages/tendances/TendancesStatsCards`, `@/pages/tendances/TendancesTabNavigation`, `@/pages/tendances/TendancesOverviewTab`, `@/pages/tendances/TendancesProductsTab`, `@/pages/tendances/TendancesCategoriesTab`, `@/pages/tendances/TendancesRecommendationsTab`, `@/pages/tendances/TendancesStockTab`, `@/pages/tendances/TendancesClientsTab`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/Ventes.tsx`

Ventes.tsx - Redirection vers la page ventes dans le dashboard

- **Exports** : —
- **Taille** : 12 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/VentesEmbedded.tsx`

VentesEmbedded - Contenu Ventes pour le Dashboard unifié Réutilise les composants existants du dashboard original.

- **Exports** : —
- **Taille** : 62 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useIsMobile`
- **Sous-composants / modules internes** : `@/components/ui/tabs`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/clients/ClientHero.tsx`

============================================================================= CLIENT HERO ULTRA PREMIUM =============================================================================

- **Exports** : —
- **Taille** : 515 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`ClientHeroProps`**

| Prop | Type | Requis |
|---|---|---|
| `clientCount` | `number` | **oui** |
| `onAddClient` | `() => void` | **oui** |
| `onMergeClient` | `() => void` | non |
| `onShowVilles` | `() => void` | non |
| `onShowFidelites` | `() => void` | non |

---

### `src/pages/clients/ClientSearchSection.tsx`

============================================================================= ClientSearchSection - Barre de recherche des clients =============================================================================  Composant de recherche avec indicateur de résultats. Recherche déclenchée après 3 caractères minimum.

- **Exports** : —
- **Taille** : 81 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/button`

**`ClientSearchSectionProps`**

| Prop | Type | Requis |
|---|---|---|
| `searchQuery` | `string` | **oui** |
| `setSearchQuery` | `(value: string) => void` | **oui** |
| `filteredCount` | `number` | **oui** |

---

### `src/pages/clients/index.ts`

============================================================================= Index des sous-composants de la page Clients =============================================================================

- **Exports** : —
- **Taille** : 9 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/dashboard/DashboardHero.tsx`

============================================================================= DashboardHero V2 - Ultra Premium Futuristic Hero =============================================================================

- **Exports** : —
- **Taille** : 333 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/dashboard/DashboardTabContent.tsx`

============================================================================= DashboardTabContent - Contenu des onglets du dashboard =============================================================================  Composant qui gère l'affichage du contenu pour chaque onglet du dashboard. Chaque onglet a un header visuel (icône + titre) et charge le composant associé.

- **Exports** : —
- **Taille** : 165 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/tabs`, `@/components/dashboard/VentesProduits`, `@/components/dashboard/PretFamilles`, `@/components/dashboard/PretProduits`, `@/components/dashboard/DepenseDuMois`, `@/components/dashboard/Inventaire`, `@/components/dashboard/ProfitCalculator`

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/dashboard/DashboardTabNavigation.tsx`

============================================================================= DashboardTabNavigation - Navigation par onglets du dashboard ============================================================================= Version responsive améliorée SANS changer le style visuel. - Responsive mobile / tablette / desktop - Scroll horizontal sur très petits écrans

- **Exports** : —
- **Taille** : 334 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/tabs`

**`DashboardTabNavigationProps`**

| Prop | Type | Requis |
|---|---|---|
| `activeTab` | `string` | **oui** |
| `isMobile` | `boolean` | non |

---

### `src/pages/dashboard/index.ts`

============================================================================= Index des composants du Dashboard =============================================================================  Point d'entrée pour l'export de tous les sous-composants du dashboard.

- **Exports** : —
- **Taille** : 12 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/produits/AchatVenteSubModals.tsx`

AchatVenteSubModals.tsx Sous-modales réutilisables pour la page Produits :  - Voir / Modifier / Supprimer un achat  - Voir / Modifier / Supprimer une vente  - Historique fournisseurs Toute la logique reste dans ProduitsPage (états et handlers passés en props).

- **Exports** : —
- **Taille** : 292 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/badge`, `@/components/ui/checkbox`, `@/components/ui/dialog`, `@/components/ui/alert-dialog`, `@/components/dashboard/FournisseurAutocomplete`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `selectedProduct` | `Product \| null` | **oui** |
| `achatViewIndex` | `number \| null` | **oui** |
| `setAchatViewIndex` | `(i: number \| null) => void` | **oui** |
| `achatEditIndex` | `number \| null` | **oui** |
| `setAchatEditIndex` | `(i: number \| null) => void` | **oui** |
| `achatDeleteIndex` | `number \| null` | **oui** |
| `setAchatDeleteIndex` | `(i: number \| null) => void` | **oui** |
| `achatEditForm` | `AchatEditForm` | **oui** |
| `setAchatEditForm` | `React.Dispatch<React.SetStateAction<AchatEditForm>>` | **oui** |
| `achatSaving` | `boolean` | **oui** |
| `achatDeleting` | `boolean` | **oui** |
| `handleSaveAchat` | `() => void` | **oui** |
| `handleDeleteAchat` | `() => void` | **oui** |
| `venteViewIndex` | `number \| null` | **oui** |
| `setVenteViewIndex` | `(i: number \| null) => void` | **oui** |
| `venteEditIndex` | `number \| null` | **oui** |
| `setVenteEditIndex` | `(i: number \| null) => void` | **oui** |
| `venteDeleteIndex` | `number \| null` | **oui** |
| `setVenteDeleteIndex` | `(i: number \| null) => void` | **oui** |
| `venteEditForm` | `VenteEditForm` | **oui** |
| `setVenteEditForm` | `React.Dispatch<React.SetStateAction<VenteEditForm>>` | **oui** |
| `venteSaving` | `boolean` | **oui** |
| `venteDeleting` | `boolean` | **oui** |
| `handleSaveVente` | `() => void` | **oui** |
| `handleDeleteVente` | `() => void` | **oui** |
| `isFournHistoryOpen` | `boolean` | **oui** |
| `setIsFournHistoryOpen` | `(o: boolean) => void` | **oui** |

---

### `src/pages/produits/ProduitsFiltersStats.tsx`

ProduitsFiltersStats.tsx Pills de filtres + 4 cartes statistiques pour la page Produits.

- **Exports** : —
- **Taille** : 105 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/badge`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `products` | `Product[]` | **oui** |
| `filters` | `FilterItem[]` | **oui** |
| `activeFilter` | `FilterType` | **oui** |
| `setActiveFilter` | `(f: FilterType) => void` | **oui** |

---

### `src/pages/produits/ProduitsHero.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 26 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`ProduitsHeroProps`**

| Prop | Type | Requis |
|---|---|---|
| `onAdd` | `() => void` | **oui** |

---

### `src/pages/produits/ProduitsToolbar.tsx`

ProduitsToolbar.tsx Barre de recherche + 4 boutons d'action principaux (Ajouter, Modifier, Voir plus vendu, Fusionner) pour la page Produits.

- **Exports** : —
- **Taille** : 80 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/input`, `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `searchQuery` | `string` | **oui** |
| `setSearchQuery` | `(v: string) => void` | **oui** |
| `setShowSearchResults` | `(v: boolean) => void` | **oui** |
| `onAdd` | `() => void` | **oui** |
| `onEdit` | `() => void` | non |
| `onStock` | `() => void` | non |
| `onVendu` | `() => void` | **oui** |
| `onMerge` | `() => void` | **oui** |

---

### `src/pages/rdv/RdvHero.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 216 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`RdvHeroProps`**

| Prop | Type | Requis |
|---|---|---|
| `onNewRdv` | `() => void` | **oui** |

---

### `src/pages/rdv/RdvListView.tsx`

============================================================================= RdvListView - Vue en liste des rendez-vous du mois =============================================================================  Affiche les RDV en grille de 4 colonnes avec pagination. Chaque carte montre le statut, titre, client, date, heure et lieu.

- **Exports** : —
- **Taille** : 164 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/card`, `@/components/ui/badge`

**`RdvListViewProps`**

| Prop | Type | Requis |
|---|---|---|
| `paginatedRdvs` | `RDV[]` | **oui** |
| `currentMonthTotal` | `number` | **oui** |
| `currentPage` | `number` | **oui** |
| `totalPages` | `number` | **oui** |
| `itemsPerPage` | `number` | **oui** |
| `statusColors` | `Record<string, string>` | **oui** |
| `statusLabels` | `Record<string, string>` | **oui** |
| `onPageChange` | `(page: number) => void` | **oui** |
| `onRdvClick` | `(rdv: RDV) => void` | **oui** |
| `onEditRdv` | `(rdv: RDV) => void` | **oui** |
| `onDeleteRdv` | `(rdv: RDV) => void` | **oui** |
| `onNewRdv` | `() => void` | **oui** |

---

### `src/pages/rdv/RdvSearchBar.tsx`

============================================================================= RdvSearchBar - Barre de recherche avec suggestions pour les RDV =============================================================================  Recherche avec auto-complétion, affiche les résultats en dropdown. Minimum 3 caractères pour déclencher la recherche.

- **Exports** : —
- **Taille** : 162 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/badge`, `@/components/ui/input`

**`RdvSearchBarProps`**

| Prop | Type | Requis |
|---|---|---|
| `searchQuery` | `string` | **oui** |
| `setSearchQuery` | `(query: string) => void` | **oui** |
| `showSearchSuggestions` | `boolean` | **oui** |
| `setShowSearchSuggestions` | `(show: boolean) => void` | **oui** |
| `searchSuggestions` | `RDV[]` | **oui** |
| `statusColors` | `Record<string, string>` | **oui** |
| `statusLabels` | `Record<string, string>` | **oui** |
| `onSuggestionClick` | `(rdv: RDV) => void` | **oui** |
| `onEditRdv` | `(rdv: RDV) => void` | **oui** |
| `onDeleteRdv` | `(rdv: RDV) => void` | **oui** |

---

### `src/pages/rdv/RdvStatsCards.tsx`

============================================================================= RdvStatsCards - Cartes statistiques de la page Rendez-vous ============================================================================= 5 cartes cliquables : Aujourd'hui, Cette semaine, Ce mois, En attente, Total du mois.

- **Exports** : —
- **Taille** : 72 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`

**`RdvStatsCardsProps`**

| Prop | Type | Requis |
|---|---|---|
| `stats` | `RdvStats` | **oui** |
| `currentMonthCount` | `number` | **oui** |
| `weekCount` | `number` | **oui** |
| `onOpenModal` | `(type: 'today' \| 'week' \| 'month' \| 'pending' \| 'total') => void` | **oui** |

---

### `src/pages/rdv/index.ts`

============================================================================= Index des sous-composants de la page Rendez-vous =============================================================================

- **Exports** : —
- **Taille** : 11 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/tendances/TendancesCategoriesTab.tsx`

============================================================================= TendancesCategoriesTab - Onglet Par Catégories =============================================================================  Affiche un PieChart de répartition des ventes et un BarChart des bénéfices par catégorie de produit.

- **Exports** : —
- **Taille** : 114 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/chart`

**`TendancesCategoriesTabProps`**

| Prop | Type | Requis |
|---|---|---|
| `salesByCategory` | `any[]` | **oui** |

---

### `src/pages/tendances/TendancesClientsTab.tsx`

TendancesClientsTab - Onglet Analyse Clients

- **Exports** : —
- **Taille** : 367 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/dialog`, `@/components/ui/chart`, `@/components/ui/button`, `@/components/ui/badge`

**`TendancesClientsTabProps`**

| Prop | Type | Requis |
|---|---|---|
| `clientsData` | `ClientData[]` | **oui** |

---

### `src/pages/tendances/TendancesHero.tsx`

============================================================================= TendancesHero - Section héroïque de la page Tendances =============================================================================

- **Exports** : —
- **Taille** : 71 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/tendances/TendancesOverviewTab.tsx`

============================================================================= TendancesOverviewTab - Onglet Vue d'ensemble =============================================================================  Affiche les graphiques d'évolution des ventes et le top 10 produits rentables. 

- **Exports** : —
- **Taille** : 132 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/chart`

**`TendancesOverviewTabProps`**

| Prop | Type | Requis |
|---|---|---|
| `salesOverTime` | `any[]` | **oui** |
| `topProfitableProducts` | `any[]` | **oui** |

---

### `src/pages/tendances/TendancesProductsTab.tsx`

============================================================================= TendancesProductsTab - Onglet Performance par Produit =============================================================================  Graphique en barres groupées : ventes, bénéfices et prix d'achat par produit. 

- **Exports** : —
- **Taille** : 68 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/chart`

**`TendancesProductsTabProps`**

| Prop | Type | Requis |
|---|---|---|
| `salesByProduct` | `any[]` | **oui** |

---

### `src/pages/tendances/TendancesRecommendationsTab.tsx`

============================================================================= TendancesRecommendationsTab - Onglet Recommandations d'achat =============================================================================  Affiche les 12 produits les plus rentables par ROI sous forme de grille de cartes avec détails financiers.

- **Exports** : —
- **Taille** : 93 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`

**`TendancesRecommendationsTabProps`**

| Prop | Type | Requis |
|---|---|---|
| `buyingRecommendations` | `any[]` | **oui** |

---

### `src/pages/tendances/TendancesStatsCards.tsx`

============================================================================= TendancesStatsCards - Cartes statistiques de la page Tendances =============================================================================  Affiche les 4 cartes stats cliquables : Ventes Totales, Bénéfices, Produits Vendus et Meilleur ROI.

- **Exports** : —
- **Taille** : 128 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`

**`TendancesStatsCardsProps`**

| Prop | Type | Requis |
|---|---|---|
| `revenue` | `number` | **oui** |
| `profit` | `number` | **oui** |
| `salesCount` | `number` | **oui** |
| `quantity` | `number` | **oui** |
| `uniqueProducts` | `number` | **oui** |
| `buyingRecommendations` | `any[]` | **oui** |
| `onOpenModal` | `(type: 'ventes' \| 'benefices' \| 'produits' \| 'roi') => void` | **oui** |
| `formatCurrency` | `(value: number) => string` | **oui** |

---

### `src/pages/tendances/TendancesStockTab.tsx`

============================================================================= TendancesStockTab - Onglet Prévention Stock (Intelligence) =============================================================================  Alertes de stock critique et recommandations IA pour optimiser les ventes. 

- **Exports** : —
- **Taille** : 110 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`

**`TendancesStockTabProps`**

| Prop | Type | Requis |
|---|---|---|
| `stockAnalysis` | `{ recommendations: any[] }` | **oui** |
| `dailySalesAnalysis` | `any[]` | **oui** |
| `salesData` | `{ totals: { revenue: number; profit: number } }` | **oui** |

---

### `src/pages/tendances/TendancesTabNavigation.tsx`

============================================================================= TendancesTabNavigation - Navigation par onglets de la page Tendances =============================================================================  Barre d'onglets premium avec 5 sections : Vue d'ensemble, Par Produits, Par Catégories, Recommandations, Prévention Stock.

- **Exports** : —
- **Taille** : 67 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/tabs`

**`TendancesTabNavigationProps`**

| Prop | Type | Requis |
|---|---|---|
| `activeTab` | `string` | **oui** |
| `isMobile` | `boolean` | **oui** |

---

### `src/pages/tendances/index.ts`

============================================================================= Index des sous-composants de la page Tendances =============================================================================

- **Exports** : —
- **Taille** : 17 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useTendancesData`
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

### `src/pages/tendances/useTendancesData.ts`

============================================================================= useTendancesData - Hook de données pour la page Tendances =============================================================================  Centralise toute la logique de calcul des données de tendances : - Filtrage des ventes (exclusion des avances)

- **Exports** : `getProductCategory`, `getSaleValues`, `useTendancesData`
- **Taille** : 249 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useTendancesData`
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._


