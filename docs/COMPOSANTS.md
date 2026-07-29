# 🧩 Spécification de tous les composants métier

287 composants documentés, regroupés par domaine. Les composants de base (shadcn/ui) sont dans [COMPOSANTS_UI.md](./COMPOSANTS_UI.md).

## Sommaire

- **src/components/AutoInjectWatcher.tsx** — 1 fichiers
- **src/components/CookieConsent.tsx** — 1 fichiers
- **src/components/Footer.tsx** — 1 fichiers
- **src/components/Layout.tsx** — 1 fichiers
- **src/components/Navbar.tsx** — 1 fichiers
- **src/components/PasswordInput.tsx** — 1 fichiers
- **src/components/PasswordStrengthChecker.tsx** — 1 fichiers
- **src/components/SEOHead.tsx** — 1 fichiers
- **src/components/ScrollToTop.tsx** — 1 fichiers
- **src/components/VisitTracker.tsx** — 1 fichiers
- **src/components/accessibility** — 3 fichiers
- **src/components/auth** — 1 fichiers
- **src/components/business** — 1 fichiers
- **src/components/clients** — 21 fichiers
- **src/components/commandes** — 23 fichiers
- **src/components/common** — 4 fichiers
- **src/components/dashboard** — 98 fichiers
- **src/components/forms** — 1 fichiers
- **src/components/livechat** — 5 fichiers
- **src/components/maintenance** — 1 fichiers
- **src/components/navbar** — 6 fichiers
- **src/components/navigation** — 1 fichiers
- **src/components/notes** — 9 fichiers
- **src/components/notifications** — 1 fichiers
- **src/components/pointage** — 18 fichiers
- **src/components/products** — 25 fichiers
- **src/components/profile** — 15 fichiers
- **src/components/rdv** — 10 fichiers
- **src/components/rdvtache** — 8 fichiers
- **src/components/security** — 1 fichiers
- **src/components/shared** — 14 fichiers
- **src/components/tache** — 10 fichiers
- **src/components/tendances** — 1 fichiers


---

## 📁 src/components/AutoInjectWatcher.tsx

### `src/components/AutoInjectWatcher.tsx`

AutoInjectWatcher — Modal globale persistante (bas-gauche) Vérifie 5min après connexion admin si la base est vide. Si oui, propose de restaurer depuis un fichier crypté.

- **Exports** : —
- **Taille** : 187 lignes
- **Services API utilisés** : `settingsApi`
- **Hooks métier** : `useAuth`, `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/PasswordStrengthChecker`

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/CookieConsent.tsx

### `src/components/CookieConsent.tsx`

CookieConsent Premium RGPD — Ultra Luxe 2026 Edition ✅ Conforme RGPD / ePrivacy ✅ Consentement granulaire ✅ Refus aussi simple qu’acceptation ✅ Aucun cookie non essentiel avant consentement ✅ Gestion des versions

- **Exports** : —
- **Taille** : 588 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/Footer.tsx

### `src/components/Footer.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 280 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAuth`
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/Layout.tsx

### `src/components/Layout.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 76 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAuth`, `useAccessibility`, `useAutoLogout`
- **Sous-composants / modules internes** : —

**`LayoutProps`**

| Prop | Type | Requis |
|---|---|---|
| `children` | `React.ReactNode` | non |
| `requireAuth` | `boolean` | non |

---

## 📁 src/components/Navbar.tsx

### `src/components/Navbar.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 424 lignes
- **Services API utilisés** : `profileApi`
- **Hooks métier** : `useAuth`, `useTheme`, `useMessages`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/badge`, `@/components/rdv/RdvNotifications`, `@/components/navbar/ObjectifIndicator`, `@/components/ui/popover`

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/PasswordInput.tsx

### `src/components/PasswordInput.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 80 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/input`

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/PasswordStrengthChecker.tsx

### `src/components/PasswordStrengthChecker.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 139 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`PasswordStrengthCheckerProps`**

| Prop | Type | Requis |
|---|---|---|
| `password` | `string` | **oui** |
| `onValidityChange` | `(isValid: boolean) => void` | non |

---

## 📁 src/components/SEOHead.tsx

### `src/components/SEOHead.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 95 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`SEOHeadProps`**

| Prop | Type | Requis |
|---|---|---|
| `title` | `string` | **oui** |
| `description` | `string` | **oui** |
| `canonical` | `string` | non |
| `ogImage` | `string` | non |
| `noindex` | `boolean` | non |

---

## 📁 src/components/ScrollToTop.tsx

### `src/components/ScrollToTop.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 48 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/VisitTracker.tsx

### `src/components/VisitTracker.tsx`

VisitTracker.tsx — Petit composant invisible qui enregistre une visite dans l'historique des connexions (une fois par session navigateur).

- **Exports** : —
- **Taille** : 17 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAuth`, `useVisitLogger`
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/accessibility

### `src/components/accessibility/AccessibilityProvider.tsx`

_Composant applicatif._

- **Exports** : `useAccessibility`, `AccessibilityProvider`
- **Taille** : 155 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAccessibility`
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

### `src/components/accessibility/AccessibleButton.tsx`

_Composant applicatif._

- **Exports** : `AccessibleButton`
- **Taille** : 70 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAccessibility`
- **Sous-composants / modules internes** : `@/components/ui/button`

_Aucune prop typée déclarée dans le fichier._

### `src/components/accessibility/AccessibleInput.tsx`

_Composant applicatif._

- **Exports** : `AccessibleInput`
- **Taille** : 80 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/input`, `@/components/ui/label`

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/auth

### `src/components/auth/ProtectedRoute.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 29 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAuth`
- **Sous-composants / modules internes** : —

**`ProtectedRouteProps`**

| Prop | Type | Requis |
|---|---|---|
| `children` | `React.ReactNode` | **oui** |

---

## 📁 src/components/business

### `src/components/business/PureSalesTable.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 155 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/table`, `@/components/ui/button`

**`PureSalesTableProps`**

| Prop | Type | Requis |
|---|---|---|
| — | — | — |

---

## 📁 src/components/clients

### `src/components/clients/CitiesManagerModal.tsx`

CitiesManagerModal - Modale réutilisable pour gérer la liste des villes clients Permet : voir, ajouter (+), modifier, supprimer (avec confirmation).

- **Exports** : —
- **Taille** : 188 lignes
- **Services API utilisés** : `clientsVillesApi`, `villesApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/notes/ConfirmModal`

**`CitiesManagerModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |

### `src/components/clients/CityFormModal.tsx`

CityFormModal - Modale réutilisable pour ajouter ou modifier une ville

- **Exports** : —
- **Taille** : 81 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/input`, `@/components/ui/button`

**`CityFormModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `initialValue` | `string` | non |
| `title` | `string` | non |
| `confirmLabel` | `string` | non |
| `onSubmit` | `(ville: string) => Promise<void> \| void` | **oui** |

### `src/components/clients/ClientAddressActionModal.tsx`

ClientAddressActionModal — Choix de l'application de navigation pour ouvrir une adresse client (Google Maps, Waze, Apple Maps).

- **Exports** : —
- **Taille** : 48 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `onGoogleMaps` | `() => void` | **oui** |
| `onWaze` | `() => void` | **oui** |
| `onAppleMaps` | `() => void` | **oui** |

### `src/components/clients/ClientCard.tsx`

Carte d'affichage d'un client

- **Exports** : —
- **Taille** : 126 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/button`

**`ClientCardProps`**

| Prop | Type | Requis |
|---|---|---|
| `client` | `Client` | **oui** |
| `index` | `number` | **oui** |
| `onEdit` | `(client: Client) => void` | **oui** |
| `onDelete` | `(client: Client) => void` | **oui** |
| `onPhoneClick` | `(phone: string) => void` | **oui** |

### `src/components/clients/ClientCardItem.tsx`

ClientCardItem — Carte client (grille) avec photo, actions (voir détail, modifier, supprimer), badge fidélité, téléphones et adresse.

- **Exports** : —
- **Taille** : 133 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `client` | `ClientLike` | **oui** |
| `index` | `number` | **oui** |
| `photoUrl` | `string \| null` | **oui** |
| `onOpenPhotoZoom` | `(url: string, name: string) => void` | **oui** |
| `onPhoneClick` | `(phone: string) => void` | **oui** |
| `onAddressClick` | `(address: string) => void` | **oui** |
| `onDetail` | `() => void` | **oui** |
| `onEdit` | `() => void` | **oui** |
| `onDelete` | `() => void` | **oui** |

### `src/components/clients/ClientConfirmDialogs.tsx`

ClientConfirmDialogs — Boîtes de dialogue de confirmation pour l'ajout et la modification d'un client.

- **Exports** : —
- **Taille** : 56 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `showAdd` | `boolean` | **oui** |
| `setShowAdd` | `(v: boolean) => void` | **oui** |
| `showEdit` | `boolean` | **oui** |
| `setShowEdit` | `(v: boolean) => void` | **oui** |
| `isSubmitting` | `boolean` | **oui** |
| `onConfirmAdd` | `() => void` | **oui** |
| `onConfirmEdit` | `() => void` | **oui** |

### `src/components/clients/ClientDetailModal.tsx`

Modal de détail client avec impression au format millimètres (petites imprimantes)

- **Exports** : —
- **Taille** : 596 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`, `useIsMobile`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/select`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(open: boolean) => void` | **oui** |
| `client` | `ClientLike \| null` | **oui** |
| `photoUrl` | `string \| null` | non |

### `src/components/clients/ClientFideliteBadge.tsx`

Badge de fidélité client (synchronisé fidelite.json + listes-fidelite.json)

- **Exports** : —
- **Taille** : 87 lignes
- **Services API utilisés** : `fideliteApiService`, `fideliteApi`, `listesFideliteApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `clientName` | `string; className?: string; }` | **oui** |

### `src/components/clients/ClientFideliteModal.tsx`

ClientFideliteModal — Modale ultra-moderne affichant l'historique complet des ventes d'un client (basée sur fidelite.json) : tier, nombre d'achats, total dépensé, et détail par vente (date, produits, montants).

- **Exports** : —
- **Taille** : 261 lignes
- **Services API utilisés** : `fideliteApiService`, `fideliteApi`, `listesFideliteApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/badge`, `@/components/ui/scroll-area`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `clientName` | `string` | **oui** |

### `src/components/clients/ClientFilterBar.tsx`

ClientFilterBar — Barre de tri/filtres au-dessus de la grille clients. - Tri par nom (asc/desc) - Filtre par niveau de fidélité (Nouveau, Standard, Bon, Fidèle, VIP) - Filtre par ville (chargée depuis clients-villes.json)

- **Exports** : —
- **Taille** : 141 lignes
- **Services API utilisés** : `clientsVillesApi`, `villesApi`, `listesFideliteApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dropdown-menu`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `sortDir` | `'asc' \| 'desc'` | **oui** |
| `onToggleSort` | `() => void` | **oui** |
| `tierFilter` | `FidelityTier \| null` | **oui** |
| `onChangeTier` | `(t: FidelityTier \| null) => void` | **oui** |
| `villeFilter` | `string \| null` | **oui** |
| `onChangeVille` | `(v: string \| null) => void` | **oui** |

### `src/components/clients/ClientFormDialog.tsx`

ClientFormDialog — Dialogue principal d'ajout / modification d'un client. Gère photo, nom, téléphones multiples, adresses multiples + ville par adresse.

- **Exports** : —
- **Taille** : 232 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(open: boolean) => void` | **oui** |
| `editing` | `boolean` | **oui** |
| `formData` | `ClientFormData` | **oui** |
| `setFormData` | `React.Dispatch<React.SetStateAction<ClientFormData>>` | **oui** |
| `availableVilles` | `string[]` | **oui** |
| `photoInputRef` | `React.RefObject<HTMLInputElement>` | **oui** |
| `photoPreview` | `string \| null` | **oui** |
| `isSubmitting` | `boolean` | **oui** |
| `onSubmit` | `(e: React.FormEvent) => void` | **oui** |
| `onPhotoSelect` | `(e: React.ChangeEvent<HTMLInputElement>) => void` | **oui** |
| `onRemovePhoto` | `() => void` | **oui** |

### `src/components/clients/ClientMergeModal.tsx`

ClientMergeModal - Modale de fusion de plusieurs clients en un seul. Flux:  1. L'utilisateur sélectionne 2 clients ou plus dans la liste.  2. Pour chaque champ (nom, téléphones, adresse, photo), il choisit     parmi les valeurs existantes ou en saisit une nouvelle.  3. À l'enregistrement, un nouveau client est créé et tous les clients

- **Exports** : —
- **Taille** : 283 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/checkbox`

**`ClientMergeModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `clients` | `Client[]` | **oui** |
| `onMerged` | `() => void` | **oui** |

### `src/components/clients/ClientPagination.tsx`

ClientPagination — Pagination premium pour la grille des clients.

- **Exports** : —
- **Taille** : 41 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `currentPage` | `number` | **oui** |
| `totalPages` | `number` | **oui** |
| `onChange` | `(page: number) => void` | **oui** |

### `src/components/clients/ClientPhoneActionModal.tsx`

ClientPhoneActionModal — Modale d'actions sur un numéro de téléphone client. Permet d'appeler ou d'envoyer un message (SMS sur mobile).

- **Exports** : —
- **Taille** : 47 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `phone` | `string` | **oui** |
| `isMobile` | `boolean` | **oui** |
| `onCall` | `() => void` | **oui** |
| `onMessage` | `() => void` | **oui** |

### `src/components/clients/ClientPhotoZoomModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 56 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`ClientPhotoZoomModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `photoUrl` | `string` | **oui** |
| `clientName` | `string` | **oui** |

### `src/components/clients/ClientSearchBar.tsx`

Barre de recherche pour les clients

- **Exports** : —
- **Taille** : 68 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/button`

**`ClientSearchBarProps`**

| Prop | Type | Requis |
|---|---|---|
| `searchQuery` | `string` | **oui** |
| `onSearchChange` | `(query: string) => void` | **oui** |
| `filteredCount` | `number` | **oui** |

### `src/components/clients/ClientsGrid.tsx`

Grille de clients avec pagination

- **Exports** : —
- **Taille** : 98 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

**`ClientsGridProps`**

| Prop | Type | Requis |
|---|---|---|
| `clients` | `Client[]` | **oui** |
| `currentPage` | `number` | **oui** |
| `totalPages` | `number` | **oui** |
| `onPageChange` | `(page: number) => void` | **oui** |
| `onEdit` | `(client: Client) => void` | **oui** |
| `onDelete` | `(client: Client) => void` | **oui** |
| `onPhoneClick` | `(phone: string) => void` | **oui** |

### `src/components/clients/ClientsHero.tsx`

ClientsHero - Section Hero pour la page Clients (Version Ultra Luxe Responsive)

- **Exports** : —
- **Taille** : 115 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

**`ClientsHeroProps`**

| Prop | Type | Requis |
|---|---|---|
| `clientsCount` | `number` | **oui** |
| `onAddClient` | `() => void` | **oui** |

### `src/components/clients/DuplicateClientModal.tsx`

Modale de détection de doublons clients. Affiche les clients existants qui matchent une saisie en cours et propose : utiliser un client existant (avec possibilité de modifier ses infos), ou créer un nouveau client distinct.

- **Exports** : —
- **Taille** : 400 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/badge`, `@/components/ui/scroll-area`

**`DuplicateClientModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `matches` | `ClientMatch[]` | **oui** |
| `typed` | `TypedClient` | **oui** |
| `onUseExisting` | `(client: ClientLike) => void` | **oui** |
| `onCreateNew` | `() => void` | non |
| `onUpdateClient` | `(clientId: string, patch: { nom: string; phones: string[]; addresses: string[] }) => Promise<void>` | non |

### `src/components/clients/FideliteListModal.tsx`

FideliteListModal — Modale réutilisable de gestion des paliers de fidélité. - Liste tous les paliers (Nouveau, Standard, Bon, Fidèle, VIP, ou personnalisés). - Actions: éditer (min/max), supprimer, ajouter un nouveau palier. - Toute modification déclenche un rebuild de fidelite.json côté serveur,   donc les badges de fidélité des clients sont resynchronisés automatiquement. - Emet l'événement "lis

- **Exports** : —
- **Taille** : 341 lignes
- **Services API utilisés** : `listesFideliteApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/alert-dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |

**`ColorPickerProps`**

| Prop | Type | Requis |
|---|---|---|
| `value` | `string` | **oui** |
| `onChange` | `(grad: string) => void` | **oui** |

### `src/components/clients/index.ts`

Export centralisé des composants clients

- **Exports** : —
- **Taille** : 6 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/commandes

### `src/components/commandes/CommandeArriveePlanifDialog.tsx`

CommandeArriveePlanifDialog Modale de planification à afficher quand une commande passe au statut "Arrivé". Affiche les infos de la commande + choix date/heureDebut/heureFin + créneaux libres. Ne se valide que si le créneau est libre côté commandes ∩ RDV ∩ tâches.

- **Exports** : —
- **Taille** : 232 lignes
- **Services API utilisés** : `availabilityApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/badge`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `commande` | `Commande \| null` | **oui** |
| `onClose` | `() => void` | **oui** |
| `onConfirm` | `(payload: { date: string; heureDebut: string; heureFin: string }) => Promise<void> \| void` | **oui** |

### `src/components/commandes/CommandeFormDialog.tsx`

============================================================================= Composant CommandeFormDialog (orchestrateur) ============================================================================= Décomposé en sous-composants réutilisables :  - ClientSection, ProductSection, TypeDateSection  - IndisponibiliteAlert, FormActionButtons, RdvCompletionModal

- **Exports** : —
- **Taille** : 621 lignes
- **Services API utilisés** : `indisponibleApi`, `rdvTachesApi`, `commandeApi`, `travailleurApi`, `tachesRdvApi`, `villesApi`, `clientsVillesApi`, `livraisonVilleApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`

**`CommandeFormDialogProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onOpenChange` | `(open: boolean) => void` | **oui** |
| `editingCommande` | `Commande \| null` | **oui** |
| `clientNom` | `string` | **oui** |
| `setClientNom` | `(v: string) => void` | **oui** |
| `clientPhone` | `string` | **oui** |
| `setClientPhone` | `(v: string) => void` | **oui** |
| `clientPhones` | `string[]` | non |
| `clientAddress` | `string` | **oui** |
| `setClientAddress` | `(v: string) => void` | **oui** |
| `clientVille` | `string` | non |
| `setClientVille` | `(v: string) => void` | non |
| `clientSearch` | `string` | **oui** |
| `setClientSearch` | `(v: string) => void` | **oui** |
| `showClientSuggestions` | `boolean` | **oui** |
| `setShowClientSuggestions` | `(v: boolean) => void` | **oui** |
| `filteredClients` | `ClientLite[]` | **oui** |
| `handleClientSelect` | `(client: ClientLite) => void` | **oui** |
| `type` | `'commande' \| 'reservation' \| 'rdv'` | **oui** |
| `setType` | `(v: 'commande' \| 'reservation' \| 'rdv') => void` | **oui** |
| `produitNom` | `string` | **oui** |
| `setProduitNom` | `(v: string) => void` | **oui** |
| `prixUnitaire` | `string` | **oui** |
| `setPrixUnitaire` | `(v: string) => void` | **oui** |
| `quantite` | `string` | **oui** |
| `setQuantite` | `(v: string) => void` | **oui** |
| `prixVente` | `string` | **oui** |
| `setPrixVente` | `(v: string) => void` | **oui** |
| `productSearch` | `string` | **oui** |
| `setProductSearch` | `(v: string) => void` | **oui** |
| `showProductSuggestions` | `boolean` | **oui** |
| `setShowProductSuggestions` | `(v: boolean) => void` | **oui** |
| `filteredProducts` | `ProductLite[]` | **oui** |
| `handleProductSelect` | `(p: ProductLite) => void` | **oui** |
| `selectedProduct` | `ProductLite \| null` | **oui** |
| `availableQuantityForSelected` | `number \| null` | non |
| `produitsListe` | `CommandeProduit[]` | **oui** |
| `editingProductIndex` | `number \| null` | **oui** |
| `handleAddProduit` | `() => void` | **oui** |
| `handleEditProduit` | `(i: number) => void` | **oui** |
| `handleRemoveProduit` | `(i: number) => void` | **oui** |
| `dateArrivagePrevue` | `string` | **oui** |
| `setDateArrivagePrevue` | `(v: string) => void` | **oui** |
| `dateEcheance` | `string` | **oui** |
| `setDateEcheance` | `(v: string) => void` | **oui** |
| `horaire` | `string` | **oui** |
| `setHoraire` | `(v: string) => void` | **oui** |
| `horaireFin` | `string` | non |
| `setHoraireFin` | `(v: string) => void` | non |
| `handleSubmit` | `(e: React.FormEvent) => void` | **oui** |
| `resetForm` | `() => void` | **oui** |
| `currentClientCaracteristique` | `ClientCaracteristique \| null` | non |
| `productReduction` | `string` | non |
| `setProductReduction` | `(v: string) => void` | non |
| `productReductionType` | `'' \| 'amount' \| 'percent'` | non |
| `setProductReductionType` | `(v: '' \| 'amount' \| 'percent') => void` | non |
| `productDeliveryLocation` | `string` | non |
| `setProductDeliveryLocation` | `(v: string) => void` | non |
| `productDeliveryFee` | `string` | non |
| `setProductDeliveryFee` | `(v: string) => void` | non |
| `productBaseDeliveryFee` | `number \| null` | non |
| `setProductBaseDeliveryFee` | `(v: number \| null) => void` | non |
| `ulterieurConfig` | `{ mode: 'date' \| 'inconnu'; date?: string } \| null` | non |
| `onOpenUlterieurModal` | `() => void` | non |

### `src/components/commandes/CommandesDialogs.tsx`

Dialogs de confirmation pour la page Commandes

- **Exports** : —
- **Taille** : 178 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`, `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`CommandesDialogsProps`**

| Prop | Type | Requis |
|---|---|---|
| `validatingId` | `string \| null` | **oui** |
| `setValidatingId` | `(id: string \| null) => void` | **oui** |
| `confirmValidation` | `() => void` | **oui** |
| `deleteId` | `string \| null` | **oui** |
| `setDeleteId` | `(id: string \| null) => void` | **oui** |
| `handleDelete` | `(id: string) => void` | **oui** |
| `cancellingId` | `string \| null` | **oui** |
| `setCancellingId` | `(id: string \| null) => void` | **oui** |
| `confirmCancellation` | `() => void` | **oui** |
| `reporterModalOpen` | `boolean` | **oui** |
| `setReporterModalOpen` | `(open: boolean) => void` | **oui** |
| `reporterDate` | `string` | **oui** |
| `setReporterDate` | `(date: string) => void` | **oui** |
| `reporterHoraire` | `string` | **oui** |
| `setReporterHoraire` | `(horaire: string) => void` | **oui** |
| `handleReporterConfirm` | `() => void` | **oui** |

### `src/components/commandes/CommandesHero.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 419 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

### `src/components/commandes/CommandesSearchBar.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 216 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/input`, `@/components/ui/button`, `@/components/ui/dialog`, `@/components/ui/label`

**`CommandesSearchBarProps`**

| Prop | Type | Requis |
|---|---|---|
| `commandeSearch` | `string` | **oui** |
| `setCommandeSearch` | `(value: string) => void` | **oui** |
| `exportDialogOpen` | `boolean` | **oui** |
| `setExportDialogOpen` | `(open: boolean) => void` | **oui** |
| `exportDate` | `string` | **oui** |
| `setExportDate` | `(date: string) => void` | **oui** |
| `commandesForExportDate` | `Commande[]` | **oui** |
| `handleExportPDF` | `() => void` | **oui** |
| `onNewCommande` | `() => void` | **oui** |

### `src/components/commandes/CommandesStatsButtons.tsx`

Boutons de statistiques premium pour les commandes Affiche 3 boutons cliquables avec modales détaillées

- **Exports** : —
- **Taille** : 426 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useCurrencyFormatter`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/dialog`, `@/components/ui/badge`, `@/components/ui/scroll-area`

**`CommandesStatsButtonsProps`**

| Prop | Type | Requis |
|---|---|---|
| `filteredCommandes` | `Commande[]` | **oui** |
| `totalActiveCommandes` | `number` | **oui** |
| `commandeSearch` | `string` | **oui** |

### `src/components/commandes/CommandesTable.tsx`

Tableau des commandes et réservations

- **Exports** : —
- **Taille** : 829 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useClients`, `useProducts`, `useCommandes`
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/button`, `@/components/ui/badge`, `@/components/ui/select`, `@/components/dashboard/forms/ModernTable`, `@/components/clients/ClientDetailModal`, `@/components/products/ProductDetailModal`, `@/components/products/CaracteristiqueModal`

**`CommandesTableProps`**

| Prop | Type | Requis |
|---|---|---|
| `filteredCommandes` | `Commande[]` | **oui** |
| `totalActiveCommandes` | `number` | **oui** |
| `commandeSearch` | `string` | **oui** |
| `sortDateAsc` | `boolean` | **oui** |
| `setSortDateAsc` | `(value: boolean) => void` | **oui** |
| `handleEdit` | `(commande: Commande) => void` | **oui** |
| `handleStatusChange` | `(id: string, status: CommandeStatut \| 'reporter') => void` | **oui** |
| `setDeleteId` | `(id: string) => void` | **oui** |
| `getStatusOptions` | `(type: 'commande' \| 'reservation' \| 'rdv') => { value: string; label: string }[]` | **oui** |
| `lockedIds` | `Set<string>` | non |

**`CommandeRowProps`**

| Prop | Type | Requis |
|---|---|---|
| `commande` | `Commande` | **oui** |
| `handleEdit` | `(commande: Commande) => void` | **oui** |
| `handleStatusChange` | `(id: string, status: CommandeStatut \| 'reporter') => void` | **oui** |
| `setDeleteId` | `(id: string) => void` | **oui** |
| `getStatusOptions` | `(type: 'commande' \| 'reservation' \| 'rdv') => { value: string; label: string }[]` | **oui** |
| `onClientClick` | `(commande: Commande) => void` | non |
| `onProductClick` | `(produitNom: string) => void` | non |
| `locked` | `boolean` | non |

### `src/components/commandes/ConfirmationDialogs.tsx`

============================================================================= Composants de Confirmation pour les Commandes =============================================================================  Dialogs de confirmation pour les actions critiques: - Validation d'une commande/réservation

- **Exports** : `ValidationDialog`, `CancellationDialog`, `DeleteDialog`
- **Taille** : 163 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/alert-dialog`

**`ValidationDialogProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onConfirm` | `() => void` | **oui** |
| `onCancel` | `() => void` | **oui** |

**`CancellationDialogProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onConfirm` | `() => void` | **oui** |
| `onCancel` | `() => void` | **oui** |

**`DeleteDialogProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onConfirm` | `() => void` | **oui** |
| `onCancel` | `() => void` | **oui** |

### `src/components/commandes/OverdueReservationModal.tsx`

============================================================================= OverdueReservationModal - Panneau de réservation en retard (bas gauche) =============================================================================  Affiché en position fixe en bas à gauche quand une réservation a dépassé sa date/horaire de 30 minutes. Non-bloquant : l'utilisateur peut naviguer.

- **Exports** : —
- **Taille** : 181 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

**`OverdueReservationModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `reservation` | `Commande \| null` | **oui** |
| `isOpen` | `boolean` | **oui** |
| `onValidate` | `(id: string) => void` | **oui** |
| `onCancel` | `(id: string) => void` | **oui** |
| `onPostpone` | `(id: string) => void` | **oui** |

### `src/components/commandes/PreparationLivraisonButton.tsx`

PreparationLivraisonButton - Affiche un bouton "Livraison" si au moins une commande/réservation du jour est   en statut "en_attente" ou "reporter". - Au clic: ouvre une modale listant ces livraisons du jour avec:   - case oui/non "préparation terminée"   - icône oeil pour voir le détail (client, produit, adresse, téléphone)

- **Exports** : —
- **Taille** : 309 lignes
- **Services API utilisés** : `prepaLivraisonApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/dialog`, `@/components/ui/checkbox`, `@/components/ui/badge`, `@/components/ui/scroll-area`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `filteredCommandes` | `Commande[]` | **oui** |

### `src/components/commandes/RdvConfirmationModal.tsx`

Modale Premium de Confirmation pour création de RDV depuis une réservation Design luxe, moderne et professionnel avec animations élégantes

- **Exports** : —
- **Taille** : 231 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`RdvConfirmationModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `onConfirm` | `() => void` | **oui** |
| `reservation` | `ReservationData \| null` | **oui** |

### `src/components/commandes/RdvCreationModal.tsx`

Modale Premium de Création de Rendez-vous Design luxe, moderne et professionnel Uniquement Titre et Description avec scroll élégant

- **Exports** : —
- **Taille** : 288 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/textarea`, `@/components/ui/button`

**`RdvCreationModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `onConfirm` | `(titre: string, description: string) => Promise<void>` | **oui** |
| `reservation` | `ReservationData \| null` | **oui** |
| `isLoading` | `boolean` | non |

### `src/components/commandes/ReporterModal.tsx`

ReporterModal — report d'une commande/réservation/RDV. Pour les commandes de type RDV: vérifie la disponibilité du créneau dans rdv-taches.json et n'affiche le bouton "Valider" que si le créneau est libre.

- **Exports** : —
- **Taille** : 138 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/dialog`

**`ReporterModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onOpenChange` | `(open: boolean) => void` | **oui** |
| `reporterDate` | `string` | **oui** |
| `setReporterDate` | `(date: string) => void` | **oui** |
| `reporterHoraire` | `string` | **oui** |
| `setReporterHoraire` | `(horaire: string) => void` | **oui** |
| `onConfirm` | `() => void` | **oui** |
| `onCancel` | `() => void` | **oui** |
| `isRdv` | `boolean` | non |
| `reporterHoraireFin` | `string` | non |
| `setReporterHoraireFin` | `(h: string) => void` | non |
| `rdvBusy` | `boolean` | non |
| `rdvBusyMessage` | `string` | non |

### `src/components/commandes/ReservationUlterieureModal.tsx`

ReservationUlterieureModal --------------------------------------------------------------- Modale pour configurer une réservation ultérieure. - Option A : choisir une date précise (max +10 jours à partir d'aujourd'hui) - Option B : "date ultérieure inconnue" (à ajuster avant 10j sinon suppression auto)

- **Exports** : —
- **Taille** : 167 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `initial` | `UlterieurConfig \| null` | non |
| `onConfirm` | `(config: UlterieurConfig \| null) => void` | **oui** |

### `src/components/commandes/StatutUlterieurTransitionModal.tsx`

StatutUlterieurTransitionModal --------------------------------------------------------------- Ouvre quand on bascule une réservation "ultérieure" → "en attente". Demande date d'échéance, heure début et heure fin.

- **Exports** : —
- **Taille** : 96 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `onConfirm` | `(payload: { dateEcheance: string; horaire: string; horaireFin: string }) => void` | **oui** |
| `initialDate` | `string` | non |
| `initialHoraire` | `string` | non |
| `initialHoraireFin` | `string` | non |

### `src/components/commandes/TacheConflictModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 154 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`TacheConflictModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `conflictingTache` | `ConflictingTache \| null` | **oui** |
| `onReschedule` | `(tacheId: string, newDate: string, newHeureDebut: string, newHeureFin: string) => Promise<void>` | **oui** |
| `onSkip` | `() => void` | **oui** |

### `src/components/commandes/form/ClientSection.tsx`

Section Client Premium — extraite de CommandeFormDialog

- **Exports** : —
- **Taille** : 220 lignes
- **Services API utilisés** : `clientsVillesApi`, `villesApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/select`

**`ClientSectionProps`**

| Prop | Type | Requis |
|---|---|---|
| `clientPhotoUrl` | `string \| null` | **oui** |
| `clientNom` | `string` | **oui** |
| `clientSearch` | `string` | **oui** |
| `setClientSearch` | `(v: string) => void` | **oui** |
| `setClientNom` | `(v: string) => void` | **oui** |
| `setShowClientSuggestions` | `(v: boolean) => void` | **oui** |
| `showClientSuggestions` | `boolean` | **oui** |
| `filteredClients` | `ClientLite[]` | **oui** |
| `onClientPick` | `(c: ClientLite) => void` | **oui** |
| `setSelectedClientPhoto` | `(p: string \| null) => void` | **oui** |
| `currentClientCaracteristique` | `ClientCaracteristique \| null` | non |
| `clientPhone` | `string` | **oui** |
| `setClientPhone` | `(v: string) => void` | **oui** |
| `clientPhones` | `string[]` | **oui** |
| `clientAddress` | `string` | **oui** |
| `setClientAddress` | `(v: string) => void` | **oui** |
| `clientVille` | `string` | **oui** |
| `setClientVille` | `(v: string) => void` | non |
| `availableVilles` | `string[]` | **oui** |
| `setAvailableVilles` | `(v: string[]) => void` | **oui** |
| `isCustomVille` | `boolean` | **oui** |

### `src/components/commandes/form/FormActionButtons.tsx`

Boutons d'action du formulaire — extraits de CommandeFormDialog

- **Exports** : —
- **Taille** : 54 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

**`FormActionButtonsProps`**

| Prop | Type | Requis |
|---|---|---|
| `onCancel` | `() => void` | **oui** |
| `localRdvMode` | `boolean` | **oui** |
| `rdvConflictBusy` | `boolean` | **oui** |
| `submittingRdv` | `boolean` | **oui** |
| `rdvDate` | `string` | **oui** |
| `horaire` | `string` | **oui** |
| `clientNom` | `string` | **oui** |
| `editingCommande` | `boolean` | **oui** |
| `type` | `'commande' \| 'reservation' \| 'rdv'` | **oui** |
| `availabilityDisponible` | `boolean` | **oui** |

### `src/components/commandes/form/IndisponibiliteAlert.tsx`

Alerte indisponibilité + conflit RDV — extraite de CommandeFormDialog

- **Exports** : —
- **Taille** : 61 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`IndisponibiliteAlertProps`**

| Prop | Type | Requis |
|---|---|---|
| `availability` | `{ disponible: boolean; message?: string; suggestions?: Suggestion[] }` | **oui** |
| `localRdvMode` | `boolean` | **oui** |
| `rdvConflict` | `{ busy: boolean; message?: string }` | **oui** |
| `onApplySuggestion` | `(s: Suggestion) => void` | **oui** |

### `src/components/commandes/form/ProductSection.tsx`

Section Produit Premium — extraite de CommandeFormDialog

- **Exports** : —
- **Taille** : 461 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/products/attributes/ClassificationSearchPopover`, `@/components/dashboard/forms/SaleQuantityInput`

**`ProductSectionProps`**

| Prop | Type | Requis |
|---|---|---|
| `productPhotoUrl` | `string \| null` | **oui** |
| `selectedProduct` | `ProductLite \| null` | **oui** |
| `productCategoryFilter` | `ProductCategory` | **oui** |
| `setProductCategoryFilter` | `(v: ProductCategory) => void` | **oui** |
| `productSearch` | `string` | **oui** |
| `setProductSearch` | `(v: string) => void` | **oui** |
| `produitNom` | `string` | **oui** |
| `setProduitNom` | `(v: string) => void` | **oui** |
| `showProductSuggestions` | `boolean` | **oui** |
| `setShowProductSuggestions` | `(v: boolean) => void` | **oui** |
| `categoryFilteredProducts` | `ProductLite[]` | **oui** |
| `handleProductSelect` | `(p: ProductLite) => void` | **oui** |
| `prixUnitaire` | `string` | **oui** |
| `setPrixUnitaire` | `(v: string) => void` | **oui** |
| `quantite` | `string` | **oui** |
| `setQuantite` | `(v: string) => void` | **oui** |
| `prixVente` | `string` | **oui** |
| `setPrixVente` | `(v: string) => void` | **oui** |
| `availableQuantityForSelected` | `number \| null` | non |
| `productReduction` | `string` | **oui** |
| `setProductReduction` | `(v: string) => void` | non |
| `productReductionType` | `'' \| 'amount' \| 'percent'` | **oui** |
| `setProductReductionType` | `(v: '' \| 'amount' \| 'percent') => void` | non |
| `productDeliveryLocation` | `string` | **oui** |
| `setProductDeliveryLocation` | `(v: string) => void` | non |
| `productDeliveryFee` | `string` | **oui** |
| `setProductDeliveryFee` | `(v: string) => void` | non |
| `productBaseDeliveryFee` | `number \| null` | **oui** |
| `setProductBaseDeliveryFee` | `(v: number \| null) => void` | non |
| `livraisonVilles` | `Array<{ ville: string; fee: number }>` | **oui** |
| `showFeeOverride` | `boolean` | **oui** |
| `setShowFeeOverride` | `React.Dispatch<React.SetStateAction<boolean>>` | **oui** |
| `showFeeIncrease` | `boolean` | **oui** |
| `setShowFeeIncrease` | `React.Dispatch<React.SetStateAction<boolean>>` | **oui** |
| `feeIncreaseAmount` | `string` | **oui** |
| `setFeeIncreaseAmount` | `(v: string) => void` | **oui** |
| `produitsListe` | `CommandeProduit[]` | **oui** |
| `editingProductIndex` | `number \| null` | **oui** |
| `handleAddProduit` | `() => void` | **oui** |
| `handleEditProduit` | `(i: number) => void` | **oui** |
| `handleRemoveProduit` | `(i: number) => void` | **oui** |

### `src/components/commandes/form/RdvCompletionModal.tsx`

Modal de complétion RDV (rdv-taches.json) — extraite de CommandeFormDialog

- **Exports** : —
- **Taille** : 173 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/textarea`, `@/components/ui/select`, `@/components/ui/dialog`

**`RdvCompletionModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(o: boolean) => void` | **oui** |
| `clientNom` | `string` | **oui** |
| `clientPhone` | `string` | **oui** |
| `clientAddress` | `string` | **oui** |
| `rdvDate` | `string` | **oui** |
| `horaire` | `string` | **oui** |
| `computedHeureFin` | `string` | **oui** |
| `personneQuery` | `string` | **oui** |
| `setPersonneQuery` | `(v: string) => void` | **oui** |
| `setRdvPersonneNom` | `(v: string) => void` | **oui** |
| `showPersonneList` | `boolean` | **oui** |
| `setShowPersonneList` | `(v: boolean) => void` | **oui** |
| `personneOptions` | `PersonneOption[]` | **oui** |
| `tacheQuery` | `string` | **oui** |
| `setTacheQuery` | `(v: string) => void` | **oui** |
| `setRdvTacheNom` | `(v: string) => void` | **oui** |
| `rdvTacheNom` | `string` | **oui** |
| `showTacheList` | `boolean` | **oui** |
| `setShowTacheList` | `(v: boolean) => void` | **oui** |
| `tacheOptions` | `TacheOption[]` | **oui** |
| `rdvCommentaires` | `string` | **oui** |
| `setRdvCommentaires` | `(v: string) => void` | **oui** |
| `rdvStatut` | `'planifie' \| 'confirme' \| 'reporte'` | **oui** |
| `setRdvStatut` | `(v: 'planifie' \| 'confirme' \| 'reporte') => void` | **oui** |
| `submittingRdv` | `boolean` | **oui** |
| `onSubmit` | `() => void` | **oui** |

### `src/components/commandes/form/TypeDateSection.tsx`

Section Type & Planification — extraite de CommandeFormDialog

- **Exports** : —
- **Taille** : 206 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/select`

**`TypeDateSectionProps`**

| Prop | Type | Requis |
|---|---|---|
| `type` | `'commande' \| 'reservation' \| 'rdv'` | **oui** |
| `setType` | `(v: 'commande' \| 'reservation' \| 'rdv') => void` | **oui** |
| `localRdvMode` | `boolean` | **oui** |
| `setLocalRdvMode` | `(v: boolean) => void` | **oui** |
| `ulterieurConfig` | `{ mode: 'date' \| 'inconnu'; date?: string } \| null` | non |
| `onOpenUlterieurModal` | `() => void` | non |
| `rdvDate` | `string` | **oui** |
| `setRdvDate` | `(v: string) => void` | **oui** |
| `dateArrivagePrevue` | `string` | **oui** |
| `setDateArrivagePrevue` | `(v: string) => void` | **oui** |
| `dateEcheance` | `string` | **oui** |
| `setDateEcheance` | `(v: string) => void` | **oui** |
| `horaire` | `string` | **oui** |
| `setHoraire` | `(v: string) => void` | **oui** |
| `horaireFin` | `string` | **oui** |
| `setHoraireFin` | `(v: string) => void` | non |
| `showHeureFin` | `boolean` | **oui** |
| `setShowHeureFin` | `(v: boolean) => void` | **oui** |

### `src/components/commandes/index.ts`

============================================================================= Index des composants pour la page Commandes =============================================================================  Exporte tous les composants réutilisables de la page Commandes. 

- **Exports** : —
- **Taille** : 30 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/common

### `src/components/common/ErrorBoundary.tsx`

_Composant applicatif._

- **Exports** : `ErrorBoundary`
- **Taille** : 114 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `children` | `ReactNode` | **oui** |
| `fallback` | `ReactNode` | non |

### `src/components/common/PhoneActionModal.tsx`

Modale pour les actions téléphoniques

- **Exports** : —
- **Taille** : 60 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`PhoneActionModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `phone` | `string` | **oui** |
| `isMobile` | `boolean` | **oui** |
| `onCall` | `() => void` | **oui** |
| `onMessage` | `() => void` | **oui** |

### `src/components/common/RealtimeStatus.tsx`

_Composant applicatif._

- **Exports** : `RealtimeStatus`
- **Taille** : 53 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/badge`

**`RealtimeStatusProps`**

| Prop | Type | Requis |
|---|---|---|
| `isConnected` | `boolean` | non |
| `lastSync` | `Date` | non |

### `src/components/common/RealtimeWrapper.tsx`

_Composant applicatif._

- **Exports** : `RealtimeWrapper`
- **Taille** : 74 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useApp`
- **Sous-composants / modules internes** : —

**`RealtimeWrapperProps`**

| Prop | Type | Requis |
|---|---|---|
| `children` | `React.ReactNode` | **oui** |
| `showStatus` | `boolean` | non |

---

## 📁 src/components/dashboard

### `src/components/dashboard/ActionButton.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 46 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/AddProductForm.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 429 lignes
- **Services API utilisés** : `fournisseurApiService`, `fournisseurApi`
- **Hooks métier** : `useApp`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/alert-dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`AddProductFormProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |

### `src/components/dashboard/AddSaleForm.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 550 lignes
- **Services API utilisés** : `remboursementApiService`, `remboursementApi`
- **Hooks métier** : `useApp`, `useToast`, `useSaleForm`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`AddSaleFormProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `editSale` | `Sale` | non |
| `onRefund` | `(sale: Sale) => void` | non |

### `src/components/dashboard/AdvancedDashboard.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 265 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`AdvancedDashboardProps`**

| Prop | Type | Requis |
|---|---|---|
| `className` | `string` | non |

### `src/components/dashboard/ClientSearchInput.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 180 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useClientSync`
- **Sous-composants / modules internes** : `@/components/ui/input`

**`ClientSearchInputProps`**

| Prop | Type | Requis |
|---|---|---|
| `onClientSelect` | `(client: Client \| null) => void` | **oui** |
| `value` | `string` | **oui** |
| `onChange` | `(value: string) => void` | **oui** |
| `disabled` | `boolean` | non |

### `src/components/dashboard/DepenseDuMois.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 1122 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`, `useIsMobile`, `useApp`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/table`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/select`, `@/components/ui/dialog`, `@/components/ui/use-toast`, `@/components/ui/premium-loading`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/EditProductForm.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 458 lignes
- **Services API utilisés** : `fournisseurApiService`, `fournisseurApi`
- **Hooks métier** : `useToast`, `useApp`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/dialog`, `@/components/ui/alert-dialog`, `@/components/ui/use-toast`

**`EditProductFormProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |

### `src/components/dashboard/ExportSalesDialog.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 572 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/label`, `@/components/ui/select`

**`ExportSalesDialogProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |

### `src/components/dashboard/FournisseurAutocomplete.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 136 lignes
- **Services API utilisés** : `fournisseurApiService`, `fournisseurApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/input`, `@/components/ui/label`

**`FournisseurAutocompleteProps`**

| Prop | Type | Requis |
|---|---|---|
| `value` | `string` | **oui** |
| `onChange` | `(value: string) => void` | **oui** |
| `variant` | `'light' \| 'dark'` | non |
| `className` | `string` | non |

### `src/components/dashboard/Inventaire.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 1530 lignes
- **Services API utilisés** : `productApiService`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/input`, `@/components/ui/button`, `@/components/ui/badge`, `@/components/ui/card`, `@/components/ui/dialog`, `@/components/ui/alert-dialog`, `@/components/ui/select`, `@/components/ui/label`, `@/components/dashboard/forms/ModernActionButton`, `@/components/dashboard/forms/ModernContainer`, `@/components/ui/premium-loading`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/InvoiceGenerator.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 663 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useApp`, `useToast`, `useCurrencyFormatter`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/scroll-area`, `@/components/ui/badge`, `@/components/ui/card`

**`InvoiceGeneratorProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |

### `src/components/dashboard/MonthlyResetHandler.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 47 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAuth`
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/PhotoUploadSection.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 222 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/label`

**`PhotoUploadSectionProps`**

| Prop | Type | Requis |
|---|---|---|
| `existingPhotos` | `string[]; // URLs of existing photos from server` | non |
| `existingMainPhoto` | `string` | non |
| `onPhotosChange` | `(newFiles: File[], existingUrls: string[], mainIndex: number) => void` | **oui** |
| `baseUrl` | `string` | non |
| `maxPhotos` | `number` | non |

### `src/components/dashboard/PretFamilles.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 1695 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/card`, `@/components/ui/table`, `@/components/ui/dialog`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/calendar`, `@/components/ui/popover`, `@/components/ui/premium-loading`, `@/components/dashboard/forms/ConfirmDeleteDialog`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/PretProduits.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 9 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/PretProduitsGrouped.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 2417 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`, `useApp`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/card`, `@/components/ui/dialog`, `@/components/ui/alert-dialog`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/calendar`, `@/components/ui/popover`, `@/components/ui/select`, `@/components/ui/checkbox`, `@/components/ui/scroll-area`, `@/components/ui/badge`, `@/components/products/attributes/ClassificationSearchPopover`, `@/components/ui/premium-loading`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/PretRetardNotification.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 98 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert`

**`PretRetardNotificationProps`**

| Prop | Type | Requis |
|---|---|---|
| `prets` | `PretProduit[]` | **oui** |

### `src/components/dashboard/ProductPhotoSlideshow.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 200 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`

**`ProductPhotoSlideshowProps`**

| Prop | Type | Requis |
|---|---|---|
| `photos` | `string[]` | **oui** |
| `mainPhoto` | `string` | non |
| `productName` | `string` | **oui** |
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `baseUrl` | `string` | non |

### `src/components/dashboard/ProductSearchInput.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 207 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useApp`
- **Sous-composants / modules internes** : `@/components/ui/input`, `@/components/ui/button`, `@/components/products/attributes/ClassificationSearchPopover`

**`ProductSearchInputProps`**

| Prop | Type | Requis |
|---|---|---|
| `onProductSelect` | `(product: Product) => void` | **oui** |
| `selectedProduct` | `Product \| null` | non |
| `context` | `'sale' \| 'edit'; // 'sale' pour ajouter une vente, 'edit' pour modifier un produit` | non |

### `src/components/dashboard/ProfitCalculator.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 851 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`, `useCurrencyFormatter`
- **Sous-composants / modules internes** : `@/components/dashboard/ProductSearchInput`, `@/components/dashboard/forms/ModernContainer`, `@/components/dashboard/forms/ModernActionButton`, `@/components/dashboard/forms/ModernTable`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/alert`, `@/components/ui/alert-dialog`, `@/components/ui/badge`, `@/components/ui/premium-loading`

**`ProfitCalculatorProps`**

| Prop | Type | Requis |
|---|---|---|
| `className` | `string` | non |
| `onCalculationChange` | `(calculation: ProfitCalculation) => void` | non |
| `initialValues` | `Partial<ProfitCalculation>` | non |
| `compact` | `boolean` | non |

### `src/components/dashboard/RefundForm.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 646 lignes
- **Services API utilisés** : `remboursementApiService`, `remboursementApi`, `pretProduitApiService`, `pretProduitApi`
- **Hooks métier** : `useApp`, `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`RefundFormProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `editSale` | `Sale` | non |

### `src/components/dashboard/SalesTable.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 986 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/table`, `@/components/dashboard/forms/ModernTable`, `@/components/ui/premium-loading`, `@/components/ui/button`

**`SalesTableProps`**

| Prop | Type | Requis |
|---|---|---|
| `sales` | `Sale[]` | **oui** |
| `onRowClick` | `(sale: Sale) => void` | **oui** |
| `overrideMonth` | `number` | non |
| `overrideYear` | `number` | non |
| `highlightSaleId` | `string` | non |

### `src/components/dashboard/StatCard.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 96 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`

**`StatCardProps`**

| Prop | Type | Requis |
|---|---|---|
| `title` | `string` | **oui** |
| `description` | `string` | **oui** |
| `value` | `React.ReactNode` | **oui** |
| `valueClassName` | `string` | non |
| `icon` | `React.ReactNode` | non |
| `gradient` | `'purple' \| 'blue' \| 'green' \| 'rose' \| 'amber' \| 'indigo'` | non |

### `src/components/dashboard/VentesParClientsModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 505 lignes
- **Services API utilisés** : `saleApiService`
- **Hooks métier** : `useCurrencyFormatter`
- **Sous-composants / modules internes** : `@/components/ui/dialog`

**`VentesParClientsModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |

### `src/components/dashboard/VentesProduits.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 313 lignes
- **Services API utilisés** : `saleApiService`
- **Hooks métier** : `useApp`, `useAuth`, `useOptimizedSalesData`, `useOptimizedProductData`, `useAccessibility`
- **Sous-composants / modules internes** : `@/components/accessibility/AccessibilityProvider`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/VersementEspece.tsx`

VersementEspece - Composant ultra-luxe pour gérer les versements espèce avec fenêtre glissante de 30 jours et plafond mensuel autorisé.

- **Exports** : —
- **Taille** : 721 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/dialog`, `@/components/ui/table`, `@/components/ui/alert-dialog`, `@/components/ui/use-toast`, `@/components/ui/select`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/ViewRefundsModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 125 lignes
- **Services API utilisés** : `remboursementApiService`, `remboursementApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/premium-loading`

**`ViewRefundsModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |

### `src/components/dashboard/accounting/ProfitLossStatement.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 878 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useApp`, `useCurrencyFormatter`, `useYearlyData`
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/select`, `@/components/ui/badge`, `@/components/ui/dialog`, `@/components/ui/scroll-area`, `@/components/ui/button`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/comptabilite/AchatFormDialog.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 617 lignes
- **Services API utilisés** : `fournisseurApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/textarea`, `@/components/ui/card`, `@/components/ui/calendar`, `@/components/ui/popover`

**`AchatFormDialogProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `achatForm` | `NouvelleAchatFormData` | **oui** |
| `onFormChange` | `(field: keyof NouvelleAchatFormData, value: string \| number \| boolean) => void` | **oui** |
| `onSubmit` | `() => void` | **oui** |
| `searchTerm` | `string` | **oui** |
| `onSearchChange` | `(e: React.ChangeEvent<HTMLInputElement>) => void` | **oui** |
| `filteredProducts` | `Product[]` | **oui** |
| `selectedProduct` | `Product \| null` | **oui** |
| `onSelectProduct` | `(product: Product) => void` | **oui** |
| `showProductList` | `boolean` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |
| `filteredFournisseurs` | `Fournisseur[]` | **oui** |
| `showFournisseurList` | `boolean` | **oui** |
| `onSelectFournisseur` | `(nom: string) => void` | **oui** |
| `onPhotosChange` | `(newFiles: File[], keptExistingUrls: string[], mainIndex: number) => void` | non |
| `receiptFile` | `File \| null` | non |
| `onReceiptChange` | `(file: File \| null) => void` | non |

### `src/components/dashboard/comptabilite/AchatsHistoriqueList.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 313 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/badge`, `@/components/ui/button`

**`AchatsHistoriqueListProps`**

| Prop | Type | Requis |
|---|---|---|
| `achats` | `NouvelleAchat[]` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |
| `selectedMonth` | `number` | **oui** |
| `selectedYear` | `number` | **oui** |
| `months` | `string[]` | **oui** |
| `onUpdate` | `(id: string, data: Partial<NouvelleAchat>) => Promise<void>` | non |
| `onDelete` | `(id: string) => Promise<void>` | non |

### `src/components/dashboard/comptabilite/ComptabiliteHeader.tsx`

ComptabiliteHeader - En-tête du module comptabilité (Version Luxe)  Contient le titre, les sélecteurs de période et les boutons d'action.

- **Exports** : —
- **Taille** : 144 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useComptabilite`
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/button`, `@/components/ui/select`

**`ComptabiliteHeaderProps`**

| Prop | Type | Requis |
|---|---|---|
| `selectedMonth` | `number` | **oui** |
| `selectedYear` | `number` | **oui** |
| `onMonthChange` | `(value: string) => void` | **oui** |
| `onYearChange` | `(value: string) => void` | **oui** |
| `onNewAchat` | `() => void` | **oui** |
| `onNewDepense` | `() => void` | **oui** |
| `onExport` | `() => void` | **oui** |
| `onOpenFacturation` | `() => void` | non |

### `src/components/dashboard/comptabilite/ComptabiliteModule.tsx`

ComptabiliteModule - Module principal de comptabilité (REFACTORISÉ)  Ce composant est maintenant minimal et ne contient que : - Les imports des composants spécialisés - L'utilisation du hook useComptabilite - L'orchestration des composants

- **Exports** : —
- **Taille** : 285 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useComptabilite`
- **Sous-composants / modules internes** : —

**`ComptabiliteModuleProps`**

| Prop | Type | Requis |
|---|---|---|
| `className` | `string` | non |

### `src/components/dashboard/comptabilite/ComptabiliteStatsCards.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 140 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`

**`ComptabiliteStatsCardsProps`**

| Prop | Type | Requis |
|---|---|---|
| `comptabiliteData` | `ComptabiliteData` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |
| `onCreditClick` | `() => void` | **oui** |
| `onDebitClick` | `() => void` | **oui** |
| `onBeneficeVentesClick` | `() => void` | **oui** |
| `onBeneficeReelClick` | `() => void` | **oui** |

### `src/components/dashboard/comptabilite/ComptabiliteTabs.tsx`

ComptabiliteTabs - Onglets du module comptabilité (Version Luxe Responsive)

- **Exports** : —
- **Taille** : 146 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useComptabilite`
- **Sous-composants / modules internes** : `@/components/ui/tabs`

**`ComptabiliteTabsProps`**

| Prop | Type | Requis |
|---|---|---|
| `achats` | `NouvelleAchat[]` | **oui** |
| `monthlyChartData` | `BarChartData[]` | **oui** |
| `depensesRepartition` | `PieChartData[]` | **oui** |
| `selectedMonth` | `number` | **oui** |
| `selectedYear` | `number` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |
| `onUpdateAchat` | `(id: string, data: Partial<NouvelleAchat>) => Promise<void>` | non |
| `onDeleteAchat` | `(id: string) => Promise<void>` | non |

### `src/components/dashboard/comptabilite/DepenseFormDialog.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 317 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/calendar`, `@/components/ui/popover`, `@/components/ui/select`

**`DepenseFormDialogProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `depenseForm` | `DepenseFormData` | **oui** |
| `onFormChange` | `(field: keyof DepenseFormData, value: string \| number) => void` | **oui** |
| `onSubmit` | `() => void` | **oui** |
| `receiptFile` | `File \| null` | non |
| `onReceiptChange` | `(file: File \| null) => void` | non |

### `src/components/dashboard/comptabilite/DepensesRepartitionChart.tsx`

DepensesRepartitionChart - Répartition premium des dépenses Affiche : total, nombre de catégories, plus grosse catégorie, part %, ainsi qu'un pie chart et une légende détaillée avec pourcentages et barres.

- **Exports** : —
- **Taille** : 174 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useComptabilite`
- **Sous-composants / modules internes** : `@/components/ui/card`

**`DepensesRepartitionChartProps`**

| Prop | Type | Requis |
|---|---|---|
| `data` | `{ name: string; value: number }[]` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |
| `selectedMonth` | `number` | **oui** |
| `selectedYear` | `number` | **oui** |

### `src/components/dashboard/comptabilite/EvolutionMensuelleChart.tsx`

EvolutionMensuelleChart - Graphique barres de l'évolution mensuelle

- **Exports** : —
- **Taille** : 58 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useComptabilite`
- **Sous-composants / modules internes** : `@/components/ui/card`

**`EvolutionMensuelleChartProps`**

| Prop | Type | Requis |
|---|---|---|
| `data` | `BarChartData[]` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |
| `selectedMonth` | `number` | **oui** |
| `selectedYear` | `number` | **oui** |

### `src/components/dashboard/comptabilite/FacturationModal.tsx`

FacturationModal - Recherche & téléchargement des factures/reçus Étapes :  1. Choisir le type : Achat ou Dépense  2. Choisir l'année  3a. Pour un achat : barre de recherche produit (suggère parmi les achats      ayant une description correspondante), puis sélection du mois où il y a

- **Exports** : —
- **Taille** : 525 lignes
- **Services API utilisés** : `nouvelleAchatApiService`, `nouvelleAchatApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/select`, `@/components/ui/badge`

**`FacturationModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |

### `src/components/dashboard/comptabilite/ProductSearchInput.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 210 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useProductAttributes`
- **Sous-composants / modules internes** : `@/components/ui/input`, `@/components/ui/badge`, `@/components/ui/label`, `@/components/products/attributes/ClassificationSearchPopover`

**`ProductSearchInputProps`**

| Prop | Type | Requis |
|---|---|---|
| `searchTerm` | `string` | **oui** |
| `onSearchChange` | `(e: React.ChangeEvent<HTMLInputElement>) => void` | **oui** |
| `filteredProducts` | `Product[]` | **oui** |
| `selectedProduct` | `Product \| null` | **oui** |
| `onSelectProduct` | `(product: Product) => void` | **oui** |
| `showProductList` | `boolean` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |

### `src/components/dashboard/comptabilite/SecondaryStatsCards.tsx`

SecondaryStatsCards - Cartes secondaires (Achats, Dépenses, Solde Net)

- **Exports** : —
- **Taille** : 78 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`

**`SecondaryStatsCardsProps`**

| Prop | Type | Requis |
|---|---|---|
| `comptabiliteData` | `ComptabiliteData` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |
| `onAchatsProduitsClick` | `() => void` | **oui** |
| `onAutresDepensesClick` | `() => void` | **oui** |
| `onSoldeNetClick` | `() => void` | **oui** |

### `src/components/dashboard/comptabilite/StableCharts.tsx`

_Composant applicatif._

- **Exports** : `StableBarChart`, `StablePieChart`
- **Taille** : 148 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`StableBarChartProps`**

| Prop | Type | Requis |
|---|---|---|
| `data` | `BarChartData[]` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |

**`StablePieChartProps`**

| Prop | Type | Requis |
|---|---|---|
| `data` | `PieChartData[]` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |

### `src/components/dashboard/comptabilite/details/AchatsProduitsDetails.tsx`

AchatsProduitsDetails - Affichage détaillé des achats produits  @description Composant pour afficher la liste des achats de type "achat_produit" du mois.  @example

- **Exports** : —
- **Taille** : 76 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`AchatsProduitsDetailsProps`**

| Prop | Type | Requis |
|---|---|---|
| `achats` | `NouvelleAchat[]` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |

### `src/components/dashboard/comptabilite/details/AutresDepensesDetails.tsx`

AutresDepensesDetails - Affichage détaillé des autres dépenses  @description Composant pour afficher la liste des dépenses hors achats produits. Inclut taxes, carburant et autres dépenses. 

- **Exports** : —
- **Taille** : 129 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`AutresDepensesDetailsProps`**

| Prop | Type | Requis |
|---|---|---|
| `achats` | `NouvelleAchat[]` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |

### `src/components/dashboard/comptabilite/details/SoldeNetDetails.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 165 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`

**`SoldeNetDetailsProps`**

| Prop | Type | Requis |
|---|---|---|
| `totalCredit` | `number` | **oui** |
| `totalDebit` | `number` | **oui** |
| `achatsTotal` | `number` | **oui** |
| `depensesTotal` | `number` | **oui** |
| `soldeNet` | `number` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |

### `src/components/dashboard/comptabilite/details/index.ts`

_Composant applicatif._

- **Exports** : —
- **Taille** : 24 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/dashboard/comptabilite/details`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/comptabilite/index.ts`

INDEX - Exports du module Comptabilité (REFACTORISÉ)  Architecture propre avec séparation des responsabilités.

- **Exports** : —
- **Taille** : 83 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useComptabilite`
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/comptabilite/modals/AchatDetailModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 475 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/badge`

**`AchatDetailModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `achat` | `NouvelleAchat \| null` | **oui** |
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `onEdit` | `(achat: NouvelleAchat) => void` | **oui** |
| `onDelete` | `(id: string) => void` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |

### `src/components/dashboard/comptabilite/modals/AchatEditModal.tsx`

AchatEditModal - Modale de modification d'un achat/dépense  RÔLE : Ce composant affiche une modale pour modifier un achat ou une dépense existant.  PROPS :

- **Exports** : —
- **Taille** : 398 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/popover`, `@/components/ui/calendar`

**`AchatEditModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `achat` | `NouvelleAchat \| null` | **oui** |
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `onSave` | `(id: string, data: Partial<NouvelleAchat>) => Promise<void>` | **oui** |

### `src/components/dashboard/comptabilite/modals/AchatsProduitsModal.tsx`

AchatsProduitsModal - Modal affichant les détails des achats produits

- **Exports** : —
- **Taille** : 94 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useComptabilite`
- **Sous-composants / modules internes** : `@/components/ui/dialog`

**`AchatsProduitsModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `achats` | `NouvelleAchat[]` | **oui** |
| `achatsTotal` | `number` | **oui** |
| `selectedMonth` | `number` | **oui** |
| `selectedYear` | `number` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |

### `src/components/dashboard/comptabilite/modals/AutresDepensesModal.tsx`

AutresDepensesModal - Modal affichant les autres dépenses (hors achats produits)

- **Exports** : —
- **Taille** : 137 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useComptabilite`
- **Sous-composants / modules internes** : `@/components/ui/dialog`

**`AutresDepensesModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `achats` | `NouvelleAchat[]` | **oui** |
| `depensesTotal` | `number` | **oui** |
| `selectedMonth` | `number` | **oui** |
| `selectedYear` | `number` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |

### `src/components/dashboard/comptabilite/modals/BeneficeReelModal.tsx`

BeneficeReelModal - Modal affichant les détails du bénéfice réel

- **Exports** : —
- **Taille** : 106 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useComptabilite`
- **Sous-composants / modules internes** : `@/components/ui/dialog`

**`BeneficeReelModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `comptabiliteData` | `ComptabiliteData` | **oui** |
| `selectedMonth` | `number` | **oui** |
| `selectedYear` | `number` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |

### `src/components/dashboard/comptabilite/modals/BeneficeVentesModal.tsx`

BeneficeVentesModal - Modal affichant les détails du bénéfice des ventes

- **Exports** : —
- **Taille** : 95 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useComptabilite`
- **Sous-composants / modules internes** : `@/components/ui/dialog`

**`BeneficeVentesModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `monthlySales` | `Sale[]` | **oui** |
| `salesProfit` | `number` | **oui** |
| `salesCount` | `number` | **oui** |
| `selectedMonth` | `number` | **oui** |
| `selectedYear` | `number` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |

### `src/components/dashboard/comptabilite/modals/CreditDetailsModal.tsx`

CreditDetailsModal - Modal affichant les détails du crédit (ventes)

- **Exports** : —
- **Taille** : 104 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useComptabilite`
- **Sous-composants / modules internes** : `@/components/ui/dialog`

**`CreditDetailsModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `monthlySales` | `Sale[]` | **oui** |
| `totalCredit` | `number` | **oui** |
| `selectedMonth` | `number` | **oui** |
| `selectedYear` | `number` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |

### `src/components/dashboard/comptabilite/modals/DebitDetailsModal.tsx`

DebitDetailsModal - Modal affichant les détails du débit (achats/dépenses)

- **Exports** : —
- **Taille** : 109 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useComptabilite`
- **Sous-composants / modules internes** : `@/components/ui/dialog`

**`DebitDetailsModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `achats` | `NouvelleAchat[]` | **oui** |
| `totalDebit` | `number` | **oui** |
| `selectedMonth` | `number` | **oui** |
| `selectedYear` | `number` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |

### `src/components/dashboard/comptabilite/modals/ExportPdfModal.tsx`

ExportPdfModal - Modal pour exporter les données en PDF

- **Exports** : —
- **Taille** : 351 lignes
- **Services API utilisés** : `nouvelleAchatApiService`, `nouvelleAchatApi`
- **Hooks métier** : `useComptabilite`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/select`, `@/components/ui/label`

**`ExportPdfModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `exportMonth` | `number` | **oui** |
| `exportYear` | `number` | **oui** |
| `setExportMonth` | `(month: number) => void` | **oui** |
| `setExportYear` | `(year: number) => void` | **oui** |
| `allSales` | `Sale[]` | **oui** |

### `src/components/dashboard/comptabilite/modals/SoldeNetModal.tsx`

SoldeNetModal - Modal affichant les détails du solde net

- **Exports** : —
- **Taille** : 140 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useComptabilite`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/progress`

**`SoldeNetModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `comptabiliteData` | `ComptabiliteData` | **oui** |
| `selectedMonth` | `number` | **oui** |
| `selectedYear` | `number` | **oui** |
| `formatEuro` | `(value: number) => string` | **oui** |

### `src/components/dashboard/comptabilite/modals/index.ts`

Index des modales du module Comptabilité

- **Exports** : —
- **Taille** : 34 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/comptabilite/shared/ClickableStatCard.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 151 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`

**`ClickableStatCardProps`**

| Prop | Type | Requis |
|---|---|---|
| `title` | `string` | **oui** |
| `value` | `number` | **oui** |
| `subtitle` | `string` | non |
| `icon` | `LucideIcon` | **oui** |
| `colorScheme` | `'green' \| 'red' \| 'blue' \| 'indigo' \| 'orange' \| 'cyan' \| 'emerald' \| 'purple'` | **oui** |
| `onClick` | `() => void` | **oui** |
| `formatValue` | `(value: number) => string` | non |
| `isNegative` | `boolean` | non |

### `src/components/dashboard/comptabilite/shared/DetailsModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 110 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`

**`DetailsModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(open: boolean) => void` | **oui** |
| `title` | `string` | **oui** |
| `subtitle` | `string` | non |
| `icon` | `LucideIcon` | **oui** |
| `colorScheme` | `'green' \| 'red' \| 'blue' \| 'indigo' \| 'orange' \| 'cyan' \| 'emerald' \| 'purple'` | **oui** |
| `totalLabel` | `string` | non |
| `totalValue` | `number` | non |
| `itemCount` | `number` | non |
| `formatValue` | `(value: number) => string` | non |
| `children` | `React.ReactNode` | **oui** |

### `src/components/dashboard/comptabilite/shared/index.ts`

INDEX - Exports des composants partagés du module Comptabilité  Ce fichier centralise les exports des composants réutilisables.  COMPOSANTS EXPORTÉS : - ClickableStatCard : Carte de statistique cliquable avec effet premium

- **Exports** : —
- **Taille** : 19 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/dashboard/comptabilite/shared`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/forms/AdvancePaymentModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 556 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/card`

**`AdvancePaymentModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `onConfirm` | `(totalAdvance: number) => void` | **oui** |

### `src/components/dashboard/forms/ConfirmDeleteDialog.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 111 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`

**`ConfirmDeleteDialogProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `onConfirm` | `() => Promise<void> \| void` | **oui** |
| `title` | `string` | **oui** |
| `description` | `string \| React.ReactNode` | **oui** |
| `isSubmitting` | `boolean` | non |

### `src/components/dashboard/forms/ModernActionButton.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 91 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/forms/ModernButton.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 52 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/forms/ModernButtonGrid.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 34 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`ModernButtonGridProps`**

| Prop | Type | Requis |
|---|---|---|
| `children` | `React.ReactNode` | **oui** |
| `columns` | `2 \| 3 \| 4` | non |
| `className` | `string` | non |

### `src/components/dashboard/forms/ModernCard.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 54 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`

**`ModernCardProps`**

| Prop | Type | Requis |
|---|---|---|
| `title` | `string` | non |
| `icon` | `LucideIcon` | non |
| `children` | `React.ReactNode` | **oui** |
| `className` | `string` | non |
| `headerActions` | `React.ReactNode` | non |

### `src/components/dashboard/forms/ModernContainer.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 89 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`

**`ModernContainerProps`**

| Prop | Type | Requis |
|---|---|---|
| `title` | `string` | non |
| `icon` | `LucideIcon` | non |
| `children` | `React.ReactNode` | **oui** |
| `className` | `string` | non |
| `headerActions` | `React.ReactNode` | non |
| `gradient` | `'blue' \| 'green' \| 'red' \| 'purple' \| 'orange' \| 'indigo' \| 'pink' \| 'neutral'` | non |

### `src/components/dashboard/forms/ModernTable.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 76 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/table`

**`ModernTableProps`**

| Prop | Type | Requis |
|---|---|---|
| `children` | `React.ReactNode` | **oui** |
| `className` | `string` | non |

### `src/components/dashboard/forms/MultiProductSaleForm.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 1410 lignes
- **Services API utilisés** : `livraisonVilleApi`, `villesApi`
- **Hooks métier** : `useApp`, `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/alert-dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/clients/DuplicateClientModal`

**`MultiProductSaleFormProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `editSale` | `Sale` | non |
| `onRefund` | `(sale: Sale) => void` | non |
| `initialData` | `{` | non |
| `date` | `string` | non |
| `clientName` | `string` | non |
| `clientPhone` | `string` | non |
| `clientAddress` | `string` | non |
| `clientVille` | `string` | non |

### `src/components/dashboard/forms/PremiumDeleteDialog.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 124 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`

**`PremiumDeleteDialogProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `onConfirm` | `() => Promise<void> \| void` | **oui** |
| `title` | `string` | **oui** |
| `description` | `string \| React.ReactNode` | **oui** |
| `itemName` | `string` | non |
| `isSubmitting` | `boolean` | non |

### `src/components/dashboard/forms/PremiumFormStyles.tsx`

_Composant applicatif._

- **Exports** : `PremiumInput`, `PremiumDialogHeader`, `PremiumButton`, `PremiumFormContainer`
- **Taille** : 173 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/label`, `@/components/ui/input`

**`PremiumDialogHeaderProps`**

| Prop | Type | Requis |
|---|---|---|
| `icon` | `LucideIcon` | **oui** |
| `iconGradient` | `string` | non |
| `title` | `string` | **oui** |
| `subtitle` | `string` | non |

**`PremiumFormContainerProps`**

| Prop | Type | Requis |
|---|---|---|
| `children` | `React.ReactNode` | **oui** |
| `gradient` | `string` | non |
| `className` | `string` | non |

### `src/components/dashboard/forms/PretProduitFromSaleModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 418 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/select`

**`PretProduitFromSaleModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `onPretCreated` | `(pretProduit: PretProduit, product: Product) => void` | **oui** |

### `src/components/dashboard/forms/SaleFormFields.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 238 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/select`

**`SaleFormFieldsProps`**

| Prop | Type | Requis |
|---|---|---|
| `formData` | `FormData` | **oui** |
| `setFormData` | `React.Dispatch<React.SetStateAction<FormData>>` | **oui** |
| `selectedProduct` | `Product \| null` | **oui** |
| `editSale` | `Sale` | non |
| `onProductSelect` | `(product: Product) => void` | **oui** |
| `onSellingPriceChange` | `(price: string) => void` | **oui** |
| `onQuantityChange` | `(quantity: string) => void` | **oui** |
| `maxQuantity` | `number` | **oui** |
| `isSubmitting` | `boolean` | **oui** |
| `isOutOfStock` | `boolean` | **oui** |
| `isAdvanceProduct` | `boolean` | **oui** |
| `isProfitNegative` | `boolean` | **oui** |

### `src/components/dashboard/forms/SalePriceInput.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 46 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/label`, `@/components/ui/input`

**`SalePriceInputProps`**

| Prop | Type | Requis |
|---|---|---|
| `price` | `string` | **oui** |
| `onChange` | `(price: string) => void` | **oui** |
| `disabled` | `boolean` | **oui** |
| `isProfitNegative` | `boolean; // Added this as an optional prop` | non |

### `src/components/dashboard/forms/SaleQuantityInput.tsx`

============================================================================= Composant SaleQuantityInput =============================================================================  Composant réutilisable pour la saisie de quantité avec boutons + et -. Gère automatiquement la validation par rapport au stock disponible.

- **Exports** : —
- **Taille** : 154 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`SaleQuantityInputProps`**

| Prop | Type | Requis |
|---|---|---|
| `quantity` | `string` | non |
| `value` | `string` | non |
| `maxQuantity` | `number` | non |
| `onChange` | `(quantity: string) => void` | **oui** |
| `disabled` | `boolean` | non |
| `showAvailableStock` | `boolean` | non |
| `className` | `string` | non |

### `src/components/dashboard/forms/hooks/useSaleForm.ts`

_Composant applicatif._

- **Exports** : `useSaleForm`
- **Taille** : 164 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useSaleForm`
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/forms/modals/AddLivraisonVilleModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 121 lignes
- **Services API utilisés** : `livraisonVilleApi`, `villesApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/alert-dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `onSaved` | `() => void` | non |

### `src/components/dashboard/forms/modals/EchangerVentesModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 501 lignes
- **Services API utilisés** : `saleApiService`, `saleApi`, `livraisonVilleApi`, `villesApi`
- **Hooks métier** : `useApp`, `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/alert-dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`EchangerVentesModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |

### `src/components/dashboard/forms/modals/LivraisonVilleListModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 143 lignes
- **Services API utilisés** : `livraisonVilleApi`, `villesApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/alert-dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/scroll-area`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |

### `src/components/dashboard/forms/modals/ReservedProductModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 60 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`

**`ReservedProductModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onOpenChange` | `(open: boolean) => void` | **oui** |
| `pendingProduct` | `{ product: Product; index: number } \| null` | **oui** |
| `onConfirm` | `() => void` | **oui** |
| `onCancel` | `() => void` | **oui** |

### `src/components/dashboard/forms/sections/SaleClientSection.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 196 lignes
- **Services API utilisés** : `clientsVillesApi`, `villesApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/select`

**`SaleClientSectionProps`**

| Prop | Type | Requis |
|---|---|---|
| `clientName` | `string` | **oui** |
| `setClientName` | `(v: string) => void` | **oui** |
| `clientPhone` | `string` | **oui** |
| `setClientPhone` | `(v: string) => void` | **oui** |
| `clientPhones` | `string[]` | non |
| `clientAddress` | `string` | **oui** |
| `setClientAddress` | `(v: string) => void` | **oui** |
| `onClientSelect` | `(client: any) => void` | **oui** |
| `isSubmitting` | `boolean` | **oui** |
| `clientPhoto` | `string \| null` | non |
| `clientVille` | `string` | non |
| `setClientVille` | `(v: string) => void` | non |
| `currentClientCaracteristique` | `ClientCaracteristique \| null` | non |

### `src/components/dashboard/forms/sections/SaleFormActions.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 72 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/dialog`

**`SaleFormActionsProps`**

| Prop | Type | Requis |
|---|---|---|
| `editSale` | `Sale` | non |
| `isSubmitting` | `boolean` | **oui** |
| `hasValidProducts` | `boolean` | **oui** |
| `onDeleteSale` | `() => void` | **oui** |
| `onRefund` | `(sale: Sale) => void` | non |
| `onClose` | `() => void` | **oui** |

### `src/components/dashboard/forms/sections/SaleProductCard.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 458 lignes
- **Services API utilisés** : `livraisonVilleApi`, `villesApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`SaleProductCardProps`**

| Prop | Type | Requis |
|---|---|---|
| `product` | `FormProduct` | **oui** |
| `index` | `number` | **oui** |
| `canDelete` | `boolean` | **oui** |
| `isSubmitting` | `boolean` | **oui** |
| `onProductSelect` | `(product: Product, index: number) => void` | **oui** |
| `onSellingPriceChange` | `(value: string, index: number) => void` | **oui** |
| `onQuantityChange` | `(value: string, index: number) => void` | **oui** |
| `onDeleteProduct` | `(index: number) => void` | **oui** |
| `onAvanceChange` | `(value: string, index: number) => void` | **oui** |
| `onDeliveryChange` | `(location: string, fee: string, index: number) => void` | **oui** |
| `onShowSlideshow` | `(product: FormProduct) => void` | **oui** |
| `onReductionChange` | `(value: string, type: ReductionType, index: number) => void` | **oui** |
| `clientVille` | `string` | non |

### `src/components/dashboard/forms/sections/SaleTotalsSection.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 132 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`SaleTotalsSectionProps`**

| Prop | Type | Requis |
|---|---|---|
| `totals` | `{` | **oui** |
| `totalPurchasePrice` | `number` | **oui** |
| `totalSellingPrice` | `number` | **oui** |
| `totalProfit` | `number` | **oui** |
| `totalDeliveryFee` | `number` | **oui** |
| `showAdvanceSection` | `boolean` | **oui** |
| `setShowAdvanceSection` | `(v: boolean) => void` | **oui** |
| `avancePrice` | `string` | **oui** |
| `onAvancePriceChange` | `(v: string) => void` | **oui** |
| `reste` | `string` | **oui** |
| `nextPaymentDate` | `string` | **oui** |
| `setNextPaymentDate` | `(v: string) => void` | **oui** |
| `isSubmitting` | `boolean` | **oui** |

### `src/components/dashboard/forms/types/saleFormTypes.ts`

_Composant applicatif._

- **Exports** : `createEmptyFormProduct`, `computeReductionAmount`
- **Taille** : 60 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/forms/utils/saleCalculations.ts`

_Composant applicatif._

- **Exports** : `calculateSaleProfit`, `calculateTotalPurchasePrice`, `calculateTotalSellingPrice`, `calculateProfit`
- **Taille** : 23 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/inventory/InventoryAnalyzer.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 297 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useApp`, `useCurrencyFormatter`
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/button`, `@/components/ui/badge`, `@/components/ui/tabs`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/prets/PretGroupCard.tsx`

Carte de groupe de prêts avec détails expandables

- **Exports** : —
- **Taille** : 389 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/button`

**`PretGroupCardProps`**

| Prop | Type | Requis |
|---|---|---|
| `group` | `GroupedPrets` | **oui** |
| `isExpanded` | `boolean` | **oui** |
| `onToggle` | `() => void` | **oui** |
| `formatCurrency` | `(amount: number) => string` | **oui** |
| `getDatePaiementClass` | `(pret: PretProduit) => string` | **oui** |
| `onAddAvance` | `(pret: PretProduit) => void` | **oui** |
| `onEdit` | `(pret: PretProduit) => void` | **oui** |
| `onDelete` | `(pret: PretProduit) => void` | **oui** |
| `onViewDetails` | `(pret: PretProduit) => void` | **oui** |
| `onTransfer` | `(group: GroupedPrets) => void` | **oui** |

**`PretItemProps`**

| Prop | Type | Requis |
|---|---|---|
| `pret` | `PretProduit` | **oui** |
| `formatCurrency` | `(amount: number) => string` | **oui** |
| `getDatePaiementClass` | `(pret: PretProduit) => string` | **oui** |
| `onAddAvance` | `() => void` | **oui** |
| `onEdit` | `() => void` | **oui** |
| `onDelete` | `() => void` | **oui** |
| `onViewDetails` | `() => void` | **oui** |

### `src/components/dashboard/prets/PretHero.tsx`

Hero pour les prêts produits

- **Exports** : —
- **Taille** : 32 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/prets/PretStatsCards.tsx`

Cartes de statistiques pour les prêts produits

- **Exports** : —
- **Taille** : 112 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`

**`PretStatsCardsProps`**

| Prop | Type | Requis |
|---|---|---|
| `totalVentes` | `number` | **oui** |
| `totalAvances` | `number` | **oui** |
| `totalReste` | `number` | **oui** |
| `pretsPayes` | `number` | **oui** |
| `totalPrets` | `number` | **oui** |
| `formatCurrency` | `(amount: number) => string` | **oui** |

### `src/components/dashboard/prets/index.ts`

Index des composants pour les prêts produits

- **Exports** : —
- **Taille** : 7 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/reports/ProfitEvolution.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 673 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useApp`, `useCurrencyFormatter`
- **Sous-composants / modules internes** : `@/components/ui/badge`, `@/components/ui/dialog`, `@/components/ui/scroll-area`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/reports/SalesReport.tsx`

Résumé :

- **Exports** : —
- **Taille** : 475 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useApp`, `useCurrencyFormatter`, `useYearlyData`
- **Sous-composants / modules internes** : `@/components/ui/badge`, `@/components/ui/dialog`, `@/components/ui/scroll-area`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/reports/StockRotation.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 350 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useApp`, `useCurrencyFormatter`
- **Sous-composants / modules internes** : `@/components/ui/badge`, `@/components/ui/progress`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/reports/YearlyComparison.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 976 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useApp`, `useCurrencyFormatter`, `useYearlyData`
- **Sous-composants / modules internes** : `@/components/ui/badge`, `@/components/ui/dialog`, `@/components/ui/scroll-area`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/sections/AdvancedDashboardSection.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 51 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/dashboard/AdvancedDashboard`

_Aucune prop typée déclarée dans le fichier._

### `src/components/dashboard/sections/SalesManagementSection.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 345 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/dashboard/forms/ModernContainer`, `@/components/dashboard/forms/ModernActionButton`, `@/components/dashboard/SalesTable`, `@/components/dashboard/AddSaleForm`, `@/components/dashboard/forms/MultiProductSaleForm`, `@/components/dashboard/AddProductForm`, `@/components/dashboard/EditProductForm`, `@/components/dashboard/ExportSalesDialog`, `@/components/dashboard/InvoiceGenerator`, `@/components/dashboard/RefundForm`, `@/components/dashboard/ViewRefundsModal`, `@/components/accessibility/AccessibleButton`, `@/components/dashboard/VentesParClientsModal`, `@/components/dashboard/forms/modals/AddLivraisonVilleModal`, `@/components/dashboard/forms/modals/LivraisonVilleListModal`, `@/components/dashboard/forms/modals/EchangerVentesModal`

**`SalesManagementSectionProps`**

| Prop | Type | Requis |
|---|---|---|
| `sales` | `Sale[]` | **oui** |
| `products` | `Product[]` | **oui** |
| `currentMonth` | `number` | **oui** |
| `currentYear` | `number` | **oui** |
| `showActions` | `boolean` | non |
| `overrideMonth` | `number` | non |
| `overrideYear` | `number` | non |
| `highlightSaleId` | `string` | non |
| `onReturnToCurrent` | `() => void` | non |

### `src/components/dashboard/sections/SalesOverviewSection.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 890 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useCurrencyFormatter`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/badge`

**`SalesOverviewSectionProps`**

| Prop | Type | Requis |
|---|---|---|
| `sales` | `any[]` | **oui** |
| `productData` | `{` | **oui** |
| `availableProducts` | `any[]` | **oui** |
| `totalItems` | `number` | **oui** |
| `currentMonth` | `number` | **oui** |
| `currentYear` | `number` | **oui** |

---

## 📁 src/components/forms

### `src/components/forms/ClientForm.tsx`

Formulaire d'ajout/modification de client avec support multi-téléphones

- **Exports** : —
- **Taille** : 169 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/dialog`

**`ClientFormProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `onSubmit` | `(e: React.FormEvent) => void` | **oui** |
| `formData` | `ClientFormData` | **oui** |
| `setFormData` | `React.Dispatch<React.SetStateAction<ClientFormData>>` | **oui** |
| `isEditing` | `boolean` | **oui** |
| `isSubmitting` | `boolean` | **oui** |

---

## 📁 src/components/livechat

### `src/components/livechat/CallOverlay.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 188 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useWebRTC`
- **Sous-composants / modules internes** : —

**`CallOverlayProps`**

| Prop | Type | Requis |
|---|---|---|
| `callStatus` | `CallStatus` | **oui** |
| `callType` | `CallType` | **oui** |
| `isMuted` | `boolean` | **oui** |
| `isVideoOff` | `boolean` | **oui** |
| `callDuration` | `number` | **oui** |
| `incomingCall` | `{ from: string; type: CallType } \| null` | **oui** |
| `localVideoRef` | `React.RefObject<HTMLVideoElement \| null>` | **oui** |
| `remoteVideoRef` | `React.RefObject<HTMLVideoElement \| null>` | **oui** |
| `remoteAudioRef` | `React.RefObject<HTMLAudioElement \| null>` | **oui** |
| `callerName` | `string` | **oui** |
| `onAccept` | `() => void` | **oui** |
| `onReject` | `() => void` | **oui** |
| `onEnd` | `() => void` | **oui** |
| `onToggleMute` | `() => void` | **oui** |
| `onToggleVideo` | `() => void` | **oui** |

### `src/components/livechat/ChatNotificationBanner.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 52 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`ChatNotificationBannerProps`**

| Prop | Type | Requis |
|---|---|---|
| `notifications` | `ChatNotifItem[]` | **oui** |
| `onDismiss` | `(id: string) => void` | **oui** |
| `onClick` | `(id: string) => void` | non |

### `src/components/livechat/LiveChatAdmin.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 1584 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAuth`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/livechat/ChatNotificationBanner`

_Aucune prop typée déclarée dans le fichier._

### `src/components/livechat/LiveChatVisitor.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 842 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/livechat/ChatNotificationBanner`

**`LiveChatVisitorProps`**

| Prop | Type | Requis |
|---|---|---|
| `visitorNom` | `string` | **oui** |
| `adminId` | `string` | **oui** |
| `onClose` | `() => void` | **oui** |

### `src/components/livechat/useWebRTC.ts`

webrtc-adapter removed - not needed in modern browsers

- **Exports** : `useWebRTC`
- **Taille** : 689 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useWebRTC`
- **Sous-composants / modules internes** : —

**`UseWebRTCProps`**

| Prop | Type | Requis |
|---|---|---|
| `visitorId` | `string` | **oui** |
| `adminId` | `string` | **oui** |
| `from` | `'visitor' \| 'admin'` | **oui** |
| `eventSourceRef` | `React.RefObject<EventSource \| null>` | **oui** |
| `onIncomingCallMeta` | `(payload: {` | non |
| `visitorId` | `string` | **oui** |
| `adminId` | `string` | **oui** |
| `from` | `'visitor' \| 'admin'` | **oui** |
| `type` | `CallType` | **oui** |

---

## 📁 src/components/maintenance

### `src/components/maintenance/MaintenanceGate.tsx`

MaintenanceGate — Vérifie le statut de maintenance du site.  Si le site est en maintenance ET que l'utilisateur connecté n'est pas un administrateur principal, on affiche la MaintenancePage à la place du contenu.  Polling périodique (60s) pour rester synchronisé même sans rafraîchissement.

- **Exports** : —
- **Taille** : 88 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAuth`
- **Sous-composants / modules internes** : `@/components/ui/premium-loading`

**`MaintenanceGateProps`**

| Prop | Type | Requis |
|---|---|---|
| `children` | `React.ReactNode` | **oui** |

---

## 📁 src/components/navbar

### `src/components/navbar/ObjectifIndicator.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 426 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useObjectif`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/dialog`

_Aucune prop typée déclarée dans le fichier._

### `src/components/navbar/ObjectifStatsModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 889 lignes
- **Services API utilisés** : `objectifApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`, `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/scroll-area`, `@/components/ui/badge`, `@/components/ui/premium-loading`

**`StatCardProps`**

| Prop | Type | Requis |
|---|---|---|
| `icon` | `React.ReactNode` | **oui** |
| `label` | `string` | **oui** |
| `value` | `string` | **oui** |
| `gradient` | `string` | **oui** |
| `shadowColor` | `string` | **oui** |
| `onClick` | `() => void` | non |
| `clickable` | `boolean` | non |

### `src/components/navbar/TimeoutNotification.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 74 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

**`TimeoutNotificationProps`**

| Prop | Type | Requis |
|---|---|---|
| `sessionWarningVisible` | `boolean` | **oui** |
| `sessionMinutesLeft` | `number` | **oui** |
| `inactivityWarningVisible` | `boolean` | **oui** |
| `inactivitySecondsLeft` | `number` | **oui** |

### `src/components/navbar/modals/BeneficesHistoriqueModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 151 lignes
- **Services API utilisés** : `objectifApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`BeneficesHistoriqueModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `beneficesHistorique` | `BeneficeMensuel[]` | **oui** |
| `annee` | `number` | **oui** |

### `src/components/navbar/modals/ObjectifChangesModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 163 lignes
- **Services API utilisés** : `objectifApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`ObjectifChangesModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `objectifChanges` | `ObjectifChange[]` | **oui** |
| `currentObjectif` | `number` | **oui** |
| `annee` | `number` | **oui** |

### `src/components/navbar/modals/VentesHistoriqueModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 157 lignes
- **Services API utilisés** : `objectifApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`VentesHistoriqueModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `historique` | `MonthlyData[]` | **oui** |
| `annee` | `number` | **oui** |

---

## 📁 src/components/navigation

### `src/components/navigation/AccessibleNavigation.tsx`

_Composant applicatif._

- **Exports** : `AccessibleNavigation`
- **Taille** : 214 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAccessibility`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/accessibility/AccessibilityProvider`

**`AccessibleNavigationProps`**

| Prop | Type | Requis |
|---|---|---|
| `className` | `string` | non |
| `variant` | `'horizontal' \| 'vertical'` | non |

---

## 📁 src/components/notes

### `src/components/notes/ColumnFormModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 58 lignes
- **Services API utilisés** : `noteApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`

**`ColumnFormModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(open: boolean) => void` | **oui** |
| `column` | `NoteColumn \| null` | **oui** |
| `onSave` | `(data: Partial<NoteColumn>) => void` | **oui** |

### `src/components/notes/ConfirmModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 66 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`ConfirmModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `message` | `string` | **oui** |
| `onConfirm` | `() => void` | **oui** |
| `onCancel` | `() => void` | **oui** |

### `src/components/notes/DrawingCanvas.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 106 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

**`DrawingCanvasProps`**

| Prop | Type | Requis |
|---|---|---|
| `initialData` | `string \| null` | non |
| `onSave` | `(dataUrl: string) => void` | **oui** |
| `onClose` | `() => void` | **oui** |

### `src/components/notes/KanbanColumn.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 156 lignes
- **Services API utilisés** : `noteApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`KanbanColumnProps`**

| Prop | Type | Requis |
|---|---|---|
| `column` | `NoteColumn` | **oui** |
| `notes` | `Note[]` | **oui** |
| `onAddNote` | `() => void` | **oui** |
| `onEditNote` | `(note: Note) => void` | **oui** |
| `onDeleteNote` | `(id: string) => void` | **oui** |
| `onDragStart` | `(e: React.DragEvent, noteId: string) => void` | **oui** |
| `onDragOver` | `(e: React.DragEvent) => void` | **oui** |
| `onDrop` | `(e: React.DragEvent, dropIndex?: number) => void` | **oui** |
| `onEditColumn` | `() => void` | **oui** |
| `onDeleteColumn` | `() => void` | **oui** |
| `isDragOver` | `boolean` | **oui** |
| `onNoteUpdated` | `() => void` | non |

### `src/components/notes/NoteCard.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 729 lignes
- **Services API utilisés** : `noteApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/textarea`

**`NoteCardProps`**

| Prop | Type | Requis |
|---|---|---|
| `note` | `Note` | **oui** |
| `onEdit` | `() => void` | **oui** |
| `onDelete` | `() => void` | **oui** |
| `onDragStart` | `(e: React.DragEvent) => void` | **oui** |
| `onNoteUpdated` | `() => void` | non |

### `src/components/notes/NoteFormModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 386 lignes
- **Services API utilisés** : `noteApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/textarea`

**`NoteFormModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(open: boolean) => void` | **oui** |
| `note` | `Partial<Note> \| null` | **oui** |
| `columns` | `NoteColumn[]` | **oui** |
| `onSave` | `(data: Partial<Note>) => void` | **oui** |

### `src/components/notes/NotesHero.tsx`

NotesHero - Hero modernisé pour la vue Notes Kanban Inspiré de PointageHero (background aurora cosmique).

- **Exports** : —
- **Taille** : 122 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

**`NotesHeroProps`**

| Prop | Type | Requis |
|---|---|---|
| `notesCount` | `number` | **oui** |
| `columnsCount` | `number` | **oui** |
| `commentCount` | `number` | **oui** |
| `onNewNote` | `() => void` | **oui** |
| `onNewColumn` | `() => void` | **oui** |
| `onShareNotes` | `() => void` | **oui** |
| `onSelectiveShare` | `() => void` | **oui** |
| `onViewComments` | `() => void` | **oui** |

### `src/components/notes/NotesKanbanView.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 309 lignes
- **Services API utilisés** : `noteApi`, `shareCommentsApi`
- **Hooks métier** : `useToast`, `useRealtimeCommentNotifications`
- **Sous-composants / modules internes** : `@/components/shared/ShareLinkModal`, `@/components/shared/SelectiveShareModal`, `@/components/shared/ShareCommentsViewer`, `@/components/ui/premium-loading`

_Aucune prop typée déclarée dans le fichier._

### `src/components/notes/constants.ts`

_Composant applicatif._

- **Exports** : `NOTE_COLORS`, `COLUMN_COLORS`, `VOICE_REPLACEMENTS`, `applySmartPunctuation`
- **Taille** : 42 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/notifications

### `src/components/notifications/ReservationExpiryNotifier.tsx`

ReservationExpiryNotifier --------------------------------------------------------------- Interroge /api/commandes/expiring-soon toutes les heures (et à la connexion) pour afficher une notification orange sur les réservations ultérieures qui expirent dans moins de 24h.

- **Exports** : —
- **Taille** : 67 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAuth`
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/pointage

### `src/components/pointage/PointageAutoWatcher.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 488 lignes
- **Services API utilisés** : `pointageAutoApi`, `pointageApi`, `pointageDeletedApi`, `pointageAutoSessionsApi`, `pointageAutoDeclancheApi`
- **Hooks métier** : `useAuth`, `useToast`
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

### `src/components/pointage/PointageCalendar.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 113 lignes
- **Services API utilisés** : `pointageApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

**`PointageCalendarProps`**

| Prop | Type | Requis |
|---|---|---|
| `currentDate` | `Date` | **oui** |
| `pointages` | `PointageEntry[]` | **oui** |
| `onPrevMonth` | `() => void` | **oui** |
| `onNextMonth` | `() => void` | **oui** |
| `onDayClick` | `(dateStr: string) => void` | **oui** |

### `src/components/pointage/PointageEntreprisesList.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 159 lignes
- **Services API utilisés** : `entrepriseApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`, `@/components/pointage/modals/EntrepriseEditModal`

**`PointageEntreprisesListProps`**

| Prop | Type | Requis |
|---|---|---|
| `entreprises` | `Entreprise[]` | **oui** |
| `onRefresh` | `() => void` | non |

### `src/components/pointage/PointageHero.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 178 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/tooltip`

**`PointageHeroProps`**

| Prop | Type | Requis |
|---|---|---|
| `entreprisesCount` | `number` | **oui** |
| `travailleursCount` | `number` | **oui** |
| `pointagesCount` | `number` | **oui** |
| `monthTotal` | `number` | **oui** |
| `premiumBtnClass` | `string` | **oui** |
| `mirrorShine` | `string` | **oui** |
| `onAddEntreprise` | `() => void` | **oui** |
| `onAddTravailleur` | `() => void` | **oui** |
| `onNewPointage` | `() => void` | **oui** |
| `onShowParPersonne` | `() => void` | **oui** |
| `onShowYearlyTotal` | `() => void` | **oui** |
| `onPriseAvance` | `() => void` | **oui** |
| `onShowMonthDetail` | `() => void` | **oui** |
| `onSharePointage` | `() => void` | non |
| `onSelectiveSharePointage` | `() => void` | non |
| `onViewComments` | `() => void` | non |
| `commentCount` | `number` | non |
| `year` | `number` | **oui** |

### `src/components/pointage/PointageTabNav.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 68 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`PointageTabNavProps`**

| Prop | Type | Requis |
|---|---|---|
| `activeTab` | `'pointage' \| 'tache' \| 'notes' \| 'rdv'` | **oui** |
| `onTabChange` | `(tab: 'pointage' \| 'tache' \| 'notes' \| 'rdv') => void` | **oui** |

### `src/components/pointage/PointageTravailleursList.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 68 lignes
- **Services API utilisés** : `travailleurApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`PointageTravailleurs_ListProps`**

| Prop | Type | Requis |
|---|---|---|
| `travailleurs` | `Travailleur[]` | **oui** |

### `src/components/pointage/TravailleurSearchInput.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 111 lignes
- **Services API utilisés** : `travailleurApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/input`, `@/components/ui/label`

**`TravailleurSearchInputProps`**

| Prop | Type | Requis |
|---|---|---|
| `travailleurs` | `Travailleur[]` | **oui** |
| `selectedId` | `string` | **oui** |
| `selectedNom` | `string` | **oui** |
| `onSelect` | `(id: string, nom: string) => void` | **oui** |
| `onClear` | `() => void` | **oui** |
| `minChars` | `number` | non |

### `src/components/pointage/modals/AvanceModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 699 lignes
- **Services API utilisés** : `travailleurApi`, `entrepriseApi`, `pointageApi`, `avanceApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/dialog`, `@/components/ui/select`

**`AvanceModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `travailleurs` | `Travailleur[]` | **oui** |
| `entreprises` | `Entreprise[]` | **oui** |
| `premiumBtnClass` | `string` | **oui** |
| `mirrorShine` | `string` | **oui** |

### `src/components/pointage/modals/DayDetailModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 100 lignes
- **Services API utilisés** : `pointageApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/dialog`

**`DayDetailModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `selectedDay` | `string \| null` | **oui** |
| `pointages` | `PointageEntry[]` | **oui** |
| `onEdit` | `(pt: PointageEntry) => void` | **oui** |
| `onDelete` | `(id: string) => void` | **oui** |
| `onAddPointage` | `() => void` | **oui** |
| `premiumBtnClass` | `string` | **oui** |
| `mirrorShine` | `string` | **oui** |

### `src/components/pointage/modals/EditPointageModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 99 lignes
- **Services API utilisés** : `pointageApi`, `travailleurApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/dialog`

**`EditPointageModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `editingPointage` | `PointageEntry \| null` | **oui** |
| `setEditingPointage` | `(p: PointageEntry \| null) => void` | **oui** |
| `travailleurs` | `Travailleur[]` | **oui** |
| `onConfirm` | `() => void` | **oui** |
| `premiumBtnClass` | `string` | **oui** |
| `mirrorShine` | `string` | **oui** |

### `src/components/pointage/modals/EntrepriseEditModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 133 lignes
- **Services API utilisés** : `entrepriseApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/dialog`, `@/components/ui/select`, `@/components/ui/alert-dialog`

**`EntrepriseEditModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `entreprise` | `Entreprise` | **oui** |
| `onSubmit` | `(data: { nom: string; adresse: string; typePaiement: 'journalier' \| 'horaire'; prix: string }) => void` | **oui** |

### `src/components/pointage/modals/EntrepriseModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 112 lignes
- **Services API utilisés** : `parametresApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/dialog`, `@/components/ui/select`

**`EntrepriseModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `form` | `{ nom: string; adresse: string; typePaiement: 'journalier' \| 'horaire'; prix: string }` | **oui** |
| `setForm` | `(f: any) => void` | **oui** |
| `onSubmit` | `() => void` | **oui** |
| `premiumBtnClass` | `string` | **oui** |
| `mirrorShine` | `string` | **oui** |

### `src/components/pointage/modals/MonthDetailModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 141 lignes
- **Services API utilisés** : `pointageApi`, `avanceApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`

**`MonthDetailModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `monthTotal` | `number` | **oui** |
| `pointages` | `PointageEntry[]` | **oui** |
| `year` | `number` | **oui** |
| `month` | `number` | **oui** |

### `src/components/pointage/modals/ParPersonneModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 375 lignes
- **Services API utilisés** : `pointageApi`, `avanceApi`, `travailleurApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/dialog`, `@/components/ui/select`

**`ParPersonneModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `travailleurs` | `Travailleur[]` | **oui** |
| `premiumBtnClass` | `string` | **oui** |
| `mirrorShine` | `string` | **oui** |

### `src/components/pointage/modals/PointageConfirmDialogs.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 68 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`

**`PointageConfirmDialogsProps`**

| Prop | Type | Requis |
|---|---|---|
| `deleteConfirm` | `string \| null` | **oui** |
| `setDeleteConfirm` | `(v: string \| null) => void` | **oui** |
| `onDelete` | `(id: string) => void` | **oui** |
| `editConfirm` | `boolean` | **oui** |
| `setEditConfirm` | `(v: boolean) => void` | **oui** |
| `onEditConfirm` | `() => void` | **oui** |
| `premiumBtnClass` | `string` | **oui** |
| `mirrorShine` | `string` | **oui** |

### `src/components/pointage/modals/PointageFormModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 126 lignes
- **Services API utilisés** : `entrepriseApi`, `travailleurApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/dialog`, `@/components/ui/select`

**`PointageFormModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `form` | `{ date: string; entrepriseId: string; heures: string; prixJournalier: string; travailleurId: string; travailleurNom: string }` | **oui** |
| `setForm` | `(f: any) => void` | **oui** |
| `entreprises` | `Entreprise[]` | **oui** |
| `travailleurs` | `Travailleur[]` | **oui** |
| `onSubmit` | `() => void` | **oui** |
| `premiumBtnClass` | `string` | **oui** |
| `mirrorShine` | `string` | **oui** |

### `src/components/pointage/modals/TravailleurModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 94 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/dialog`, `@/components/ui/select`

**`TravailleurModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `form` | `{ nom: string; prenom: string; adresse: string; phone: string; genre: 'homme' \| 'femme'; role?: 'administrateur' \| 'autre' }` | **oui** |
| `setForm` | `(f: any) => void` | **oui** |
| `onSubmit` | `() => void` | **oui** |
| `premiumBtnClass` | `string` | **oui** |
| `mirrorShine` | `string` | **oui** |

### `src/components/pointage/modals/YearlyTotalModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 188 lignes
- **Services API utilisés** : `pointageApi`, `avanceApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`

**`YearlyTotalModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `year` | `number` | **oui** |
| `yearlyPointages` | `PointageEntry[]` | **oui** |
| `loading` | `boolean` | **oui** |

---

## 📁 src/components/products

### `src/components/products/CaracteristiqueModal.tsx`

CaracteristiqueModal.tsx Affiche la "carte caractéristique" du produit (description, taille, code-barre, code) et propose une impression avec choix du format (mm) — téléchargement PDF via jsPDF.

- **Exports** : —
- **Taille** : 412 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(open: boolean) => void` | **oui** |
| `product` | `ProductCharLike \| null` | **oui** |

### `src/components/products/PrixHistoryModal.tsx`

PrixHistoryModal.tsx — Modale ultra moderne d'historique des prix d'achat Affiche pour un produit donné :  - tous les renseignements (nom, fournisseurs, caractéristiques…)  - toutes les dates d'achat avec variation (augmentation / diminution / stable)  - quel mois / jour le prix augmente, diminue, reste constant  - quand acheter pour avoir le prix le plus bas, prix max / min

- **Exports** : —
- **Taille** : 382 lignes
- **Services API utilisés** : `prixProductsApiService`, `prixProductsApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `product` | `Product \| null` | **oui** |

### `src/components/products/ProductCharacteristicCard.tsx`

ProductCharacteristicCard.tsx Carte "Caractéristique" affichant : description, taille extraite (ex: 26), un code-barre généré et le code produit. Réutilisable dans la table et dans la modale d'impression.

- **Exports** : `extractSize`
- **Taille** : 140 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `product` | `ProductCharLike` | **oui** |
| `variant` | `'compact' \| 'full'` | non |
| `className` | `string` | non |
| `priceEuro` | `number \| null` | non |

### `src/components/products/ProductCommentScroller.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 115 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`ProductCommentScrollerProps`**

| Prop | Type | Requis |
|---|---|---|
| `comments` | `ScrollComment[]` | **oui** |

### `src/components/products/ProductDetailModal.tsx`

ProductDetailModal.tsx Affiche le détail d'un produit (nom, description, prix, stock, fournisseur, dates) avec une icône pour ouvrir la modale Caractéristique et un bouton d'impression PDF.

- **Exports** : —
- **Taille** : 224 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(open: boolean) => void` | **oui** |
| `product` | `Product \| null` | **oui** |
| `onOpenCaracteristique` | `(product: Product) => void` | non |

### `src/components/products/ProductMergeModal.tsx`

ProductMergeModal - Modale de fusion de plusieurs produits en un seul. Flux:  1. L'utilisateur sélectionne 2 produits ou plus.  2. Pour chaque champ (description, prix, quantité, fournisseur, photos), il     choisit parmi les valeurs existantes ou saisit/upload de nouvelles.     - La quantité par défaut = somme des quantités sélectionnées.

- **Exports** : —
- **Taille** : 338 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/textarea`, `@/components/ui/checkbox`

**`ProductMergeModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `products` | `Product[]` | **oui** |
| `onMerged` | `() => void` | **oui** |

### `src/components/products/ProductsTable.tsx`

ProductsTable.tsx — Tableau paginé des produits avec tri, badges stock, actions. Extrait de ProduitsPage.

- **Exports** : —
- **Taille** : 250 lignes
- **Services API utilisés** : `productCommentsApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/table`, `@/components/ui/badge`, `@/components/products/ProductCommentScroller`, `@/components/products/ProductCharacteristicCard`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `tableContainerRef` | `React.RefObject<HTMLDivElement>` | **oui** |
| `paginatedProducts` | `Product[]` | **oui** |
| `allRatings` | `Record<string, ProductRatingInfo>` | **oui** |
| `sortField` | `SortField \| null` | **oui** |
| `sortDir` | `SortDir` | **oui** |
| `onSort` | `(f: SortField) => void` | **oui** |
| `getPhotoUrl` | `(u: string) => string` | **oui** |
| `onView` | `(p: Product) => void` | **oui** |
| `onEdit` | `(p: Product) => void` | **oui** |
| `onDelete` | `(p: Product) => void` | **oui** |
| `onIndispoTarget` | `(p: Product) => void` | **oui** |
| `onOpenCaracteristique` | `(p: Product) => void` | **oui** |

### `src/components/products/ProductsVenduModal.tsx`

ProductsVenduModal.tsx — Modale "Voir plus vendu" Affiche la liste des produits triés du plus vendu vers le moins vendu (et jamais vendus). Filtres par catégorie : Tous / Perruque / Tissages-Extensions. Génération PDF de la liste filtrée. Indicateurs de stock :  - stock >= 3 : clignote en vert

- **Exports** : —
- **Taille** : 405 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/badge`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |

### `src/components/products/StockListModal.tsx`

StockListModal — Sélection multi-attributs (modèle/couleur/taille) et catégorie/devant simples, puis affichage de la liste des produits correspondants avec option d'export PDF.

- **Exports** : —
- **Taille** : 406 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useProductAttributes`, `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/badge`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `products` | `Product[]` | **oui** |

### `src/components/products/attributes/ClassificationSearchPopover.tsx`

ClassificationSearchPopover — Bouton + modale centrée utilisant ProductClassificationSelector pour filtrer une liste de produits. S'ouvre comme une Dialog centrée (mobile/tablette/desktop), avec un contenu scrollable et une barre d'actions collée en bas.

- **Exports** : —
- **Taille** : 123 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/dialog`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `currentCategory` | `SearchCategory` | **oui** |
| `onApply` | `(result: { name: string; category: SearchCategory }) => void` | **oui** |
| `label` | `string` | non |
| `className` | `string` | non |

### `src/components/products/attributes/ProductAttributeDialog.tsx`

ProductAttributeDialog — Modale de création d'une VALEUR d'attribut produit pour un kind donné (identifié par son id + nom d'affichage). Comprend :  - un formulaire nom / description  - un bouton "oeil" pour lister toutes les valeurs existantes du kind avec    possibilité de modifier ou supprimer chaque valeur (avec confirmation).

- **Exports** : —
- **Taille** : 172 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useProductAttributes`, `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/input`, `@/components/ui/textarea`, `@/components/ui/label`, `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `kindKey` | `string` | **oui** |
| `kindLabel` | `string` | **oui** |

### `src/components/products/attributes/ProductAttributeManagerButton.tsx`

ProductAttributeManagerButton — Bouton d'un TYPE d'attribut (kind) dynamique. Comportement :  - Clic sur l'icône "+" : ouvre ProductAttributeDialog (ajout de valeur).  - Simple clic sur le NOM du type : ne fait rien.  - Double-clic sur le nom : passe en mode renommage.  - Icône corbeille : suppression (avec confirmation) toujours active.

- **Exports** : —
- **Taille** : 149 lignes
- **Services API utilisés** : `attributKindsApi`
- **Hooks métier** : `useToast`, `useAttributeKinds`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `kind` | `AttributeKindDef` | **oui** |
| `className` | `string` | non |

### `src/components/products/attributes/ProductAttributesToolbar.tsx`

ProductAttributesToolbar — Barre dynamique regroupant les boutons des TYPES d'attribut produit (kinds) provenant de la base. Un bouton "+" à droite permet de créer un nouveau type (fichier `<slug>_attribut.json` créé automatiquement côté serveur). L'affichage/masquage des boutons est persisté dans localStorage.

- **Exports** : —
- **Taille** : 159 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`, `useAttributeKinds`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/button`

_Aucune prop typée déclarée dans le fichier._

### `src/components/products/attributes/ProductClassificationFilterModal.tsx`

ProductClassificationFilterModal — Modale de filtrage par classification. Affiche ProductClassificationSelector en mode "filter" pour la catégorie choisie, puis expose les sélections au parent (modele/couleur/taille/devant).

- **Exports** : —
- **Taille** : 54 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `categorie` | `ProductCategory` | **oui** |
| `initial` | `ClassificationValue` | non |
| `onApply` | `(v: ClassificationValue) => void` | **oui** |

### `src/components/products/attributes/ProductClassificationSelector.tsx`

_Composant applicatif._

- **Exports** : `buildProductName`, `countActive`, `splitValues`
- **Taille** : 233 lignes
- **Services API utilisés** : `attributKindsApi`
- **Hooks métier** : `useAttributeKinds`, `useProductAttributes`
- **Sous-composants / modules internes** : `@/components/ui/label`, `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `value` | `ClassificationValue` | **oui** |
| `onChange` | `(v: ClassificationValue) => void` | **oui** |
| `mode` | `'create' \| 'filter'` | non |
| `hideCategorie` | `boolean` | non |
| `variant` | `'light' \| 'dark'` | non |
| `multiple` | `boolean` | non |
| `defaultOpen` | `boolean` | non |

### `src/components/products/modals/AchatVenteHistoryModal.tsx`

AchatVenteHistoryModal.tsx — Historique complet stock (achats + ventes) d'un produit.

- **Exports** : —
- **Taille** : 155 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/badge`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(o: boolean) => void` | **oui** |
| `selectedProduct` | `Product \| null` | **oui** |
| `togglingAchatIndex` | `number \| null` | **oui** |
| `onToggleAchatDispo` | `(i: number, next: boolean) => void` | **oui** |
| `onViewAchat` | `(i: number) => void` | **oui** |
| `onEditAchat` | `(i: number) => void` | **oui** |
| `onDeleteAchat` | `(i: number) => void` | **oui** |
| `onViewVente` | `(i: number) => void` | **oui** |
| `onEditVente` | `(i: number) => void` | **oui** |
| `onDeleteVente` | `(i: number) => void` | **oui** |

### `src/components/products/modals/AddConfirmDialog.tsx`

AddConfirmDialog.tsx — Confirmation d'ajout produit.

- **Exports** : —
- **Taille** : 55 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(o: boolean) => void` | **oui** |
| `addForm` | `AddProductForm` | **oui** |
| `photoCount` | `number` | **oui** |
| `isSubmitting` | `boolean` | **oui** |
| `onConfirm` | `() => void` | **oui** |

### `src/components/products/modals/AddProductModal.tsx`

AddProductModal.tsx — Modale d'ajout d'un nouveau produit. Extrait de ProduitsPage pour réutilisabilité.

- **Exports** : —
- **Taille** : 150 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/button`, `@/components/dashboard/PhotoUploadSection`, `@/components/dashboard/FournisseurAutocomplete`, `@/components/products/attributes/ProductClassificationSelector`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(o: boolean) => void` | **oui** |
| `addForm` | `AddProductForm` | **oui** |
| `setAddForm` | `React.Dispatch<React.SetStateAction<AddProductForm>>` | **oui** |
| `addErrors` | `Record<string, string>` | **oui** |
| `setAddErrors` | `React.Dispatch<React.SetStateAction<Record<string, string>>>` | **oui** |
| `addPhotos` | `AddPhotosState` | **oui** |
| `setAddPhotos` | `React.Dispatch<React.SetStateAction<AddPhotosState>>` | **oui** |
| `addClassification` | `ClassificationValue` | **oui** |
| `setAddClassification` | `React.Dispatch<React.SetStateAction<ClassificationValue>>` | **oui** |
| `isSubmitting` | `boolean` | **oui** |
| `onSubmit` | `() => void` | **oui** |

### `src/components/products/modals/DeleteConfirmDialog.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 49 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(o: boolean) => void` | **oui** |
| `selectedProduct` | `Product \| null` | **oui** |
| `isSubmitting` | `boolean` | **oui** |
| `onConfirm` | `() => void` | **oui** |

### `src/components/products/modals/EditConfirmDialog.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 42 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(o: boolean) => void` | **oui** |
| `isSubmitting` | `boolean` | **oui** |
| `onConfirm` | `() => void` | **oui** |

### `src/components/products/modals/EditProductModal.tsx`

EditProductModal.tsx — Modale d'édition d'un produit (+ ajout de commentaire).

- **Exports** : —
- **Taille** : 239 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/button`, `@/components/dashboard/PhotoUploadSection`, `@/components/dashboard/FournisseurAutocomplete`, `@/components/products/attributes/ProductClassificationSelector`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(o: boolean) => void` | **oui** |
| `selectedProduct` | `Product \| null` | **oui** |
| `editForm` | `EditForm` | **oui** |
| `setEditForm` | `React.Dispatch<React.SetStateAction<EditForm>>` | **oui** |
| `editPhotos` | `EditPhotosState` | **oui** |
| `setEditPhotos` | `React.Dispatch<React.SetStateAction<EditPhotosState>>` | **oui** |
| `baseUrl` | `string` | **oui** |
| `isSubmitting` | `boolean` | **oui** |
| `onSubmit` | `() => void` | **oui** |
| `clientSearchQuery` | `string` | **oui** |
| `setClientSearchQuery` | `(v: string) => void` | **oui** |
| `setCommentClientName` | `(v: string) => void` | **oui** |
| `clientSearchResults` | `Client[]` | **oui** |
| `setClientSearchResults` | `(v: Client[]) => void` | **oui** |
| `showClientDropdown` | `boolean` | **oui** |
| `setShowClientDropdown` | `(v: boolean) => void` | **oui** |
| `onClientQueryChange` | `(val: string) => Promise<void> \| void` | **oui** |
| `newComment` | `string` | **oui** |
| `setNewComment` | `(v: string) => void` | **oui** |
| `newRating` | `number` | **oui** |
| `setNewRating` | `(v: number) => void` | **oui** |
| `isSubmittingComment` | `boolean` | **oui** |
| `onSubmitComment` | `() => void` | **oui** |

### `src/components/products/modals/IndispoConfirmDialog.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 62 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `target` | `Product \| null` | **oui** |
| `processing` | `boolean` | **oui** |
| `onOpenChange` | `(o: boolean) => void` | **oui** |
| `onConfirm` | `(e: React.MouseEvent) => void` | **oui** |

### `src/components/products/modals/ProductCommentsModal.tsx`

ProductCommentsModal.tsx — Liste + édition + suppression de commentaires produit.

- **Exports** : —
- **Taille** : 134 lignes
- **Services API utilisés** : `productCommentsApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/textarea`, `@/components/ui/checkbox`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(o: boolean) => void` | **oui** |
| `selectedProduct` | `Product \| null` | **oui** |
| `allRatings` | `Record<string, ProductRatingInfo>` | **oui** |
| `selectedCommentIds` | `string[]` | **oui** |
| `setSelectedCommentIds` | `React.Dispatch<React.SetStateAction<string[]>>` | **oui** |
| `toggleCommentSelection` | `(id: string, checked: boolean) => void` | **oui** |
| `editingCommentId` | `string \| null` | **oui** |
| `editingCommentText` | `string` | **oui** |
| `setEditingCommentText` | `(v: string) => void` | **oui** |
| `editingCommentRating` | `number` | **oui** |
| `setEditingCommentRating` | `(v: number) => void` | **oui** |
| `editingCommentClientName` | `string` | **oui** |
| `setEditingCommentClientName` | `(v: string) => void` | **oui** |
| `startEditingComment` | `(c: ProductComment) => void` | **oui** |
| `resetCommentEditor` | `() => void` | **oui** |
| `handleSaveCommentEdit` | `() => void` | **oui** |
| `isUpdatingComment` | `boolean` | **oui** |
| `handleDeleteComments` | `(ids: string[]) => void` | **oui** |
| `isDeletingComments` | `boolean` | **oui** |

### `src/components/products/modals/ProductViewModal.tsx`

ProductViewModal.tsx — Slideshow photo + détails produit + accès historiques.

- **Exports** : —
- **Taille** : 202 lignes
- **Services API utilisés** : `productCommentsApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(o: boolean) => void` | **oui** |
| `selectedProduct` | `Product \| null` | **oui** |
| `currentPhotoIndex` | `number` | **oui** |
| `setCurrentPhotoIndex` | `React.Dispatch<React.SetStateAction<number>>` | **oui** |
| `getPhotoUrl` | `(url: string) => string` | **oui** |
| `allRatings` | `Record<string, ProductRatingInfo>` | **oui** |
| `onOpenPrixHistory` | `() => void` | **oui** |
| `onOpenHistory` | `() => void` | **oui** |
| `onOpenFournHistory` | `() => void` | **oui** |
| `onOpenComments` | `() => void` | **oui** |
| `onEdit` | `() => void` | **oui** |
| `onDelete` | `() => void` | **oui** |

### `src/components/products/modals/index.ts`

_Composant applicatif._

- **Exports** : —
- **Taille** : 12 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/profile

### `src/components/profile/BulkDeleteModal.tsx`

BulkDeleteModal — Modale de suppression sélective (ventes, produits, clients) Style ultra luxe, multi-étapes avec recherche et sélection

- **Exports** : —
- **Taille** : 480 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/alert-dialog`, `@/components/ui/premium-loading`

**`BulkDeleteModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(open: boolean) => void` | **oui** |

### `src/components/profile/HistoriqueConnexionCard.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 542 lignes
- **Services API utilisés** : `historiqueConnexionApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/dialog`, `@/components/ui/alert-dialog`, `@/components/ui/select`

_Aucune prop typée déclarée dans le fichier._

### `src/components/profile/IndisponibiliteSection.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 808 lignes
- **Services API utilisés** : `indisponibleApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/checkbox`, `@/components/ui/dialog`, `@/components/ui/alert-dialog`, `@/components/ui/select`, `@/components/ui/premium-loading`

_Aucune prop typée déclarée dans le fichier._

### `src/components/profile/MaintenanceSection.tsx`

MaintenanceSection — Carte dans Profil > Sécurité Permet à l'admin principal d'activer/désactiver le mode maintenance et de programmer des maintenances automatiques.

- **Exports** : —
- **Taille** : 399 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/switch`, `@/components/ui/textarea`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/alert-dialog`, `@/components/ui/dialog`

**`MaintenanceSectionProps`**

| Prop | Type | Requis |
|---|---|---|
| `userRole` | `string` | non |

### `src/components/profile/ModuleSettingsSection.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 183 lignes
- **Services API utilisés** : `moduleSettingsApi`, `parametresApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/input`, `@/components/ui/premium-loading`

_Aucune prop typée déclarée dans le fichier._

### `src/components/profile/ParametresSection.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 830 lignes
- **Services API utilisés** : `settingsApi`
- **Hooks métier** : `useToast`, `useAuth`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/alert-dialog`, `@/components/PasswordStrengthChecker`, `@/components/ui/premium-loading`

**`ParametresSectionProps`**

| Prop | Type | Requis |
|---|---|---|
| `userRole` | `string` | non |

### `src/components/profile/PasswordSection.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 109 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/PasswordStrengthChecker`

**`PasswordSectionProps`**

| Prop | Type | Requis |
|---|---|---|
| `showPasswordForm` | `boolean` | **oui** |
| `setShowPasswordForm` | `(v: boolean) => void` | **oui** |
| `pwForm` | `{ currentPassword: string; newPassword: string; confirmPassword: string }` | **oui** |
| `setPwForm` | `React.Dispatch<React.SetStateAction<{ currentPassword: string; newPassword: string; confirmPassword: string }>>` | **oui** |
| `showPw` | `{ current: boolean; new: boolean; confirm: boolean }` | **oui** |
| `setShowPw` | `React.Dispatch<React.SetStateAction<{ current: boolean; new: boolean; confirm: boolean }>>` | **oui** |
| `isNewPasswordValid` | `boolean` | **oui** |
| `setIsNewPasswordValid` | `(v: boolean) => void` | **oui** |
| `onSubmit` | `() => void` | **oui** |

### `src/components/profile/PointageAutoSection.tsx`

PointageAutoSection — Gestion des règles de pointage automatique (Profil > Paramètres > Paramètres des modules) Permet à l'admin de définir des règles "personne + jour(s) + entreprise" qui seront automatiquement proposées chaque jour via un modal avec chrono. Design : ultra luxe inspiré du Module Comptabilité (gradients emerald/teal, glassmorphism, animations framer-motion).

- **Exports** : —
- **Taille** : 872 lignes
- **Services API utilisés** : `pointageAutoApi`, `travailleurApi`, `entrepriseApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/select`, `@/components/ui/alert-dialog`, `@/components/ui/premium-loading`

_Aucune prop typée déclarée dans le fichier._

### `src/components/profile/ProfileAvatar.tsx`

ProfileAvatar — Avatar de profil avec anneaux pulsants  Affiche la photo de profil (ou icône par défaut) entourée de deux anneaux verts animés (animation greenPulse définie dans ProfilePage). Un bouton caméra en bas à droite permet de changer la photo. 

- **Exports** : —
- **Taille** : 47 lignes
- **Services API utilisés** : `profileApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`ProfileAvatarProps`**

| Prop | Type | Requis |
|---|---|---|
| `photoUrl` | `string \| null` | **oui** |
| `onClickUpload` | `() => void` | **oui** |

### `src/components/profile/ProfileCard.tsx`

ProfileCard — Carte d'identité du profil utilisateur  Affiche l'avatar (via ProfileAvatar), le nom complet, l'email, le rôle utilisateur (badge), et le statut "En ligne" (pastille verte).  Utilisé dans ProfilePage (onglet Profil).

- **Exports** : —
- **Taille** : 62 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`ProfileCardProps`**

| Prop | Type | Requis |
|---|---|---|
| `photoUrl` | `string \| null` | **oui** |
| `firstName` | `string` | non |
| `lastName` | `string` | non |
| `email` | `string` | non |
| `userRole` | `string` | **oui** |
| `onClickUpload` | `() => void` | **oui** |

### `src/components/profile/ProfileConfirmDialogs.tsx`

ProfileConfirmDialogs — Boîtes de dialogue de confirmation pour la modification du profil, le changement de mot de passe et l'upload d'une nouvelle photo de profil.

- **Exports** : —
- **Taille** : 91 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `confirmProfile` | `boolean` | **oui** |
| `setConfirmProfile` | `(v: boolean) => void` | **oui** |
| `onSaveProfile` | `() => void` | **oui** |
| `confirmPassword` | `boolean` | **oui** |
| `setConfirmPassword` | `(v: boolean) => void` | **oui** |
| `onChangePassword` | `() => void` | **oui** |
| `confirmPhoto` | `boolean` | **oui** |
| `setConfirmPhoto` | `(v: boolean) => void` | **oui** |
| `photoPreview` | `string \| null` | **oui** |
| `onUploadPhoto` | `() => void` | **oui** |
| `saving` | `boolean` | **oui** |
| `onPhotoDialogClose` | `() => void` | **oui** |

### `src/components/profile/ProfileHero.tsx`

ProfileHero — En-tête héroïque animé de la page profil (aurores animées, badge, titre, statuts).

- **Exports** : —
- **Taille** : 99 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

### `src/components/profile/ProfileInfoCard.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 185 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`

**`ProfileInfoCardProps`**

| Prop | Type | Requis |
|---|---|---|
| `profile` | `any` | **oui** |
| `editing` | `boolean` | **oui** |
| `editForm` | `{ firstName: string; lastName: string; gender: string; address: string; phone: string }` | **oui** |
| `setEditForm` | `React.Dispatch<React.SetStateAction<{ firstName: string; lastName: string; gender: string; address: string; phone: string }>>` | **oui** |
| `onEdit` | `() => void` | **oui** |
| `onCancel` | `() => void` | **oui** |
| `onSave` | `() => void` | **oui** |

### `src/components/profile/ProfileTabsNav.tsx`

ProfileTabsNav — Boutons de navigation entre les onglets Profil / Paramètres / Sécurité (avec visibilité conditionnelle).

- **Exports** : —
- **Taille** : 68 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `activeTab` | `ProfileTab` | **oui** |
| `setActiveTab` | `(t: ProfileTab) => void` | **oui** |
| `canSeeSettings` | `boolean` | **oui** |
| `isAdminPrincipal` | `boolean` | **oui** |

### `src/components/profile/SecuriteSection.tsx`

SecuriteSection — Section Sécurité dans les paramètres du profil  Layout: 2x2 grid luxe design - Top: Gestion des rôles | Gérance comptes - Bottom: Paramètres de connexion | Cryptage de données + Temps d'utilisation (timeout & inactivité)

- **Exports** : —
- **Taille** : 784 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/alert-dialog`, `@/components/PasswordStrengthChecker`, `@/components/ui/premium-loading`

**`SecuriteSectionProps`**

| Prop | Type | Requis |
|---|---|---|
| `userRole` | `string` | non |

---

## 📁 src/components/rdv

### `src/components/rdv/ConfirmationRdvButton.tsx`

ConfirmationRdvButton - Visible si au moins un RDV (statut planifie/confirme/reporte) commence dans les   prochaines 24h. Sinon caché. - Pulse "ultra luxe" tant qu'il reste un RDV non confirmé (en_attente) dans la fenêtre. - Modale: liste triée par horaire le plus proche. Sélection d'un RDV -> détail +   actions Maintenu / Annulé / Reporter. Synchronise commandes, rdv, taches et la base

- **Exports** : —
- **Taille** : 465 lignes
- **Services API utilisés** : `confirmationRdvApi`, `rdvApiService`, `rdvApi`, `commandeApi`, `tacheApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/dialog`, `@/components/ui/scroll-area`, `@/components/ui/badge`, `@/components/ui/input`, `@/components/ui/label`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `rdvs` | `RDV[]` | **oui** |
| `onAfterUpdate` | `() => void` | non |

### `src/components/rdv/GlobalRdvTodayNotifier.tsx`

GlobalRdvTodayNotifier -------------------------------------------------------- VERSION PREMIUM AUTO-HIDE -------------------------------------------------------- ✔ Mobile / Tablette / Desktop ✔ Position fixe à gauche

- **Exports** : —
- **Taille** : 671 lignes
- **Services API utilisés** : `rdvApiService`, `rdvApi`
- **Hooks métier** : `useAuth`
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

### `src/components/rdv/RdvCalendar.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 1134 lignes
- **Services API utilisés** : `indisponibleApi`, `rdvApiService`, `rdvApi`, `clientApiService`, `clientApi`
- **Hooks métier** : `useIsMobile`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/card`, `@/components/ui/dialog`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/badge`, `@/components/ui/alert`, `@/components/shared`, `@/components/dashboard/forms/MultiProductSaleForm`

**`RdvCalendarProps`**

| Prop | Type | Requis |
|---|---|---|
| `rdvs` | `RDV[]` | **oui** |
| `onRdvClick` | `(rdv: RDV) => void` | **oui** |
| `onSlotClick` | `(date: string, time: string) => void` | **oui** |
| `onRdvDrop` | `(rdv: RDV, newDate: string, newTime: string, newEndTime?: string) => void` | **oui** |
| `onRdvDelete` | `(rdv: RDV) => void` | non |
| `onOpenFormWithDateTime` | `(rdv: RDV, date: string, time: string) => void` | non |
| `highlightRdvId` | `string \| null` | non |
| `highlightDate` | `string \| null` | non |
| `onHighlightComplete` | `() => void` | non |

### `src/components/rdv/RdvCard.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 180 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`, `@/components/ui/button`, `@/components/ui/badge`

**`RdvCardProps`**

| Prop | Type | Requis |
|---|---|---|
| `rdv` | `RDV` | **oui** |
| `onEdit` | `(rdv: RDV) => void` | **oui** |
| `onDelete` | `(rdv: RDV) => void` | **oui** |
| `compact` | `boolean` | non |

### `src/components/rdv/RdvForm.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 633 lignes
- **Services API utilisés** : `indisponibleApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/textarea`, `@/components/ui/select`, `@/components/ui/dialog`, `@/components/ui/alert`

**`RdvFormProps`**

| Prop | Type | Requis |
|---|---|---|
| `isOpen` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `onSubmit` | `(data: RDVFormData) => Promise<void>` | **oui** |
| `rdv` | `RDV \| null` | non |
| `defaultDate` | `string` | non |
| `defaultTime` | `string` | non |
| `conflicts` | `RDV[]` | non |
| `viewOnly` | `boolean` | non |

### `src/components/rdv/RdvNotifications.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 393 lignes
- **Services API utilisés** : `rdvNotificationsApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/card`, `@/components/ui/badge`, `@/components/ui/premium-loading`, `@/components/ui/sheet`, `@/components/ui/dialog`

**`RdvNotificationsProps`**

| Prop | Type | Requis |
|---|---|---|
| `onCheckNotifications` | `() => void` | non |

### `src/components/rdv/RdvStatsCards.tsx`

_Composant applicatif._

- **Exports** : `RdvStatsCard`
- **Taille** : 119 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/card`

_Aucune prop typée déclarée dans le fichier._

### `src/components/rdv/RdvStatsDetailsModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 142 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/badge`, `@/components/ui/scroll-area`

_Aucune prop typée déclarée dans le fichier._

### `src/components/rdv/RdvStatsModals.tsx`

_Composant applicatif._

- **Exports** : `RdvStatsModal`
- **Taille** : 175 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/badge`, `@/components/ui/scroll-area`, `@/components/ui/card`

_Aucune prop typée déclarée dans le fichier._

### `src/components/rdv/index.ts`

_Composant applicatif._

- **Exports** : —
- **Taille** : 5 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/rdvtache

### `src/components/rdvtache/AddCatalogTacheModal.tsx`

AddCatalogTacheModal.tsx - Modale pour ajouter un type de tâche RDV (tissage, tresse, etc.)

- **Exports** : —
- **Taille** : 72 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `onSubmit` | `(data: { nom: string; description?: string }) => Promise<void>` | **oui** |

### `src/components/rdvtache/ConfirmDialog.tsx`

ConfirmDialog.tsx - Petite confirmation générique pour modif/suppression RDV.

- **Exports** : —
- **Taille** : 39 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `title` | `string` | **oui** |
| `description` | `string` | **oui** |
| `confirmLabel` | `string` | **oui** |
| `destructive` | `boolean` | non |
| `onConfirm` | `() => void` | **oui** |

### `src/components/rdvtache/RdvDayModal.tsx`

RdvDayModal.tsx - Modale "RDV du jour" avec horaire 4h-23h, édition/suppression. Drag-and-drop : on peut glisser un RDV sur une autre heure pour le reporter dans la même journée, ou sur le bouton "Autre date" pour déclencher le mode de sélection de date dans le calendrier (la modale se ferme alors).

- **Exports** : —
- **Taille** : 215 lignes
- **Services API utilisés** : `rdvTachesApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `selectedDay` | `string \| null` | **oui** |
| `rdvs` | `RdvTache[]` | **oui** |
| `onAdd` | `() => void` | **oui** |
| `onEdit` | `(r: RdvTache) => void` | **oui** |
| `onDelete` | `(id: string) => void` | **oui** |
| `onMoveRdvSameDay` | `(rdv: RdvTache, newStartHour: string) => void` | non |
| `onRequestOtherDate` | `(rdv: RdvTache) => void` | non |

### `src/components/rdvtache/RdvFormModal.tsx`

RdvFormModal.tsx - Formulaire d'ajout / édition d'un RDV-tâche. Recherche travailleur (3 chars), recherche client (3 chars), choix tâche depuis catalogue, lieu / téléphone auto-remplis depuis le client, créneaux libres du jour, statut.

- **Exports** : —
- **Taille** : 393 lignes
- **Services API utilisés** : `travailleurApi`, `clientApiService`, `clientApi`, `rdvTachesApi`, `tachesRdvApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/textarea`, `@/components/ui/select`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `catalog` | `TacheRdvCatalog[]` | **oui** |
| `editing` | `RdvTache \| null` | **oui** |
| `defaultDate` | `string` | non |
| `onSubmit` | `(data: Omit<RdvTache, 'id' \| 'createdAt' \| 'updatedAt'>, id?: string) => Promise<void>` | **oui** |

### `src/components/rdvtache/RdvRescheduleModal.tsx`

RdvRescheduleModal.tsx — Modale de confirmation "Modifier l'horaire / Déplacer ce RDV ?". Demande la nouvelle date (optionnelle), l'heure de début et de fin, puis valide avec un bouton dédié.

- **Exports** : —
- **Taille** : 144 lignes
- **Services API utilisés** : `rdvTachesApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/input`, `@/components/ui/button`

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `rdv` | `RdvTache \| null` | **oui** |
| `newDate` | `string;          // date cible (drop)` | non |
| `suggestedStart` | `string;   // heure pré-remplie` | non |
| `onConfirm` | `(payload: { date: string; heureDebut: string; heureFin: string }) => Promise<void> \| void` | **oui** |

### `src/components/rdvtache/RdvTacheCalendar.tsx`

RdvTacheCalendar.tsx - Calendrier mensuel des RDV-tâches avec compteur par jour. Drag-and-drop : on peut faire glisser un chip RDV vers une autre case jour pour le reporter. Les RDV issus des Commandes (commandeId) sont verrouillés 🔒. Mode "pick-date" : si activé, un clic sur une case déclenche directement onDayPicked(date) au lieu de l'ouverture standard.

- **Exports** : —
- **Taille** : 181 lignes
- **Services API utilisés** : `rdvTachesApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`Props`**

| Prop | Type | Requis |
|---|---|---|
| `currentDate` | `Date` | **oui** |
| `rdvs` | `RdvTache[]` | **oui** |
| `onPrevMonth` | `() => void` | **oui** |
| `onNextMonth` | `() => void` | **oui** |
| `onDayClick` | `(dateStr: string) => void` | **oui** |
| `onRdvDropOnDay` | `(rdv: RdvTache, dateStr: string) => void` | non |
| `pickMode` | `{ rdv: RdvTache } \| null` | non |
| `onDayPicked` | `(rdv: RdvTache, dateStr: string) => void` | non |
| `onCancelPick` | `() => void` | non |

### `src/components/rdvtache/RdvTacheView.tsx`

RdvTacheView.tsx - Vue principale de l'onglet "RDV" du module Pointage. Boutons : Ajouter RDV, RDV du jour, Ajouter tâche, Ajouter travailleur. Affiche un calendrier mensuel avec compteur de RDV par jour.

- **Exports** : —
- **Taille** : 357 lignes
- **Services API utilisés** : `rdvTachesApi`, `tachesRdvApi`, `travailleurApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/pointage/modals/TravailleurModal`

_Aucune prop typée déclarée dans le fichier._

### `src/components/rdvtache/RdvTachesHero.tsx`

RdvTachesHero - Hero modernisé pour la vue RDV/Tâches (Beauté) Inspiré de PointageHero (aurora glass cosmique) + contenu spécifique RDV Beauté.

- **Exports** : —
- **Taille** : 153 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`RdvTachesHeroProps`**

| Prop | Type | Requis |
|---|---|---|
| `totalActifs` | `number` | **oui** |
| `todayCount` | `number` | **oui** |
| `catalogCount` | `number` | **oui** |
| `onAddRdv` | `() => void` | **oui** |
| `onShowDay` | `() => void` | **oui** |
| `onAddCatalog` | `() => void` | **oui** |
| `onAddTravailleur` | `() => void` | **oui** |
| `onShowCatalogList` | `() => void` | **oui** |

---

## 📁 src/components/security

### `src/components/security/SecurityCheckPage.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 2044 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`SecurityCheckPageProps`**

| Prop | Type | Requis |
|---|---|---|
| `onVerified` | `() => void` | **oui** |

---

## 📁 src/components/shared

### `src/components/shared/AddressActionModal.tsx`

_Composant applicatif._

- **Exports** : `useAddressNavigation`
- **Taille** : 122 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useIsMobile`, `useAddressNavigation`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`AddressActionModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(open: boolean) => void` | **oui** |
| `address` | `string` | **oui** |

### `src/components/shared/BackButton.tsx`

BackButton - Bouton "Retour" universel. - Mobile: centré horizontalement, ne pousse aucun contenu (position fixed). - Desktop: ancré à gauche. - z-index volontairement < z-50 pour rester en arrière-plan des modales shadcn.

- **Exports** : —
- **Taille** : 68 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`BackButtonProps`**

| Prop | Type | Requis |
|---|---|---|
| `className` | `string` | non |

### `src/components/shared/ConfirmDialog.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 157 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`

**`ConfirmDialogProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(open: boolean) => void` | **oui** |
| `title` | `string` | **oui** |
| `description` | `string` | **oui** |
| `confirmText` | `string` | non |
| `cancelText` | `string` | non |
| `onConfirm` | `() => void` | **oui** |
| `onCancel` | `() => void` | non |
| `variant` | `'danger' \| 'warning' \| 'info' \| 'success'` | non |
| `isLoading` | `boolean` | non |
| `disabled` | `boolean` | non |
| `children` | `ReactNode` | non |

### `src/components/shared/LoadingOverlay.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 72 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/premium-loading`

**`LoadingOverlayProps`**

| Prop | Type | Requis |
|---|---|---|
| `text` | `string` | non |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | non |
| `overlay` | `boolean` | non |
| `variant` | `'default' \| 'dashboard' \| 'tendances' \| 'ventes'` | non |
| `showText` | `boolean` | non |
| `className` | `string` | non |
| `minHeight` | `string` | non |

### `src/components/shared/LuxeHero.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 201 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`LuxeHeroProps`**

| Prop | Type | Requis |
|---|---|---|
| `badge` | `string` | **oui** |
| `title` | `string` | **oui** |
| `subtitle` | `string` | non |
| `ctaLabel` | `string` | non |
| `onCta` | `() => void` | non |
| `CtaIcon` | `LucideIcon` | non |
| `BadgeIcon` | `LucideIcon` | non |
| `liveLabel` | `string` | non |
| `showDate` | `boolean` | non |
| `accentFrom` | `string; // amber` | non |
| `accentVia` | `string;  // purple` | non |
| `accentTo` | `string;   // indigo` | non |
| `particles` | `number` | non |
| `className` | `string` | non |
| `children` | `React.ReactNode` | non |

### `src/components/shared/PageHero.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 139 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`PageHeroProps`**

| Prop | Type | Requis |
|---|---|---|
| `title` | `string` | **oui** |
| `subtitle` | `string` | non |
| `iconLeft` | `LucideIcon` | non |
| `iconRight` | `LucideIcon` | non |
| `badge` | `ReactNode` | non |
| `actions` | `ReactNode` | non |
| `variant` | `'purple' \| 'blue' \| 'green' \| 'orange' \| 'pink'` | non |
| `className` | `string` | non |
| `showParticles` | `boolean` | non |
| `children` | `ReactNode` | non |

### `src/components/shared/Pagination.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 238 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`

**`PaginationProps`**

| Prop | Type | Requis |
|---|---|---|
| `currentPage` | `number` | **oui** |
| `totalPages` | `number` | **oui** |
| `onPageChange` | `(page: number) => void` | **oui** |
| `totalItems` | `number` | non |
| `itemsPerPage` | `number` | non |
| `showFirstLast` | `boolean` | non |
| `showItemCount` | `boolean` | non |
| `siblingCount` | `number` | non |
| `className` | `string` | non |
| `size` | `'sm' \| 'md' \| 'lg'` | non |
| `disabled` | `boolean` | non |
| `scrollTargetRef` | `RefObject<HTMLElement>` | non |

### `src/components/shared/SelectiveShareModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 647 lignes
- **Services API utilisés** : `travailleurApi`, `entrepriseApi`, `shareLinksApi`, `noteApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : —

**`SelectiveShareModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `type` | `ShareType` | **oui** |

### `src/components/shared/ShareCommentsViewer.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 389 lignes
- **Services API utilisés** : `shareCommentsApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`ShareCommentsViewerProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `type` | `'notes' \| 'pointage' \| 'taches'` | **oui** |
| `typeLabel` | `string` | **oui** |
| `onCountChange` | `(count: number) => void` | non |

### `src/components/shared/ShareLinkModal.tsx`

ShareLinkModal.tsx  Modal de gestion des liens de partage pour les données (notes, pointage, tâches). Permet de générer, copier et supprimer des liens de partage sécurisés avec code d'accès.  Fonctionnalités :

- **Exports** : —
- **Taille** : 161 lignes
- **Services API utilisés** : `shareLinksApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/premium-loading`

**`ShareLinkModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onClose` | `() => void` | **oui** |
| `type` | `'notes' \| 'pointage' \| 'taches'` | **oui** |
| `typeLabel` | `string` | **oui** |

### `src/components/shared/SharedCommentForm.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 353 lignes
- **Services API utilisés** : `shareCommentsApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`SharedCommentFormProps`**

| Prop | Type | Requis |
|---|---|---|
| `token` | `string` | **oui** |
| `dataType` | `string` | **oui** |
| `itemCount` | `number` | **oui** |
| `items` | `any[]; // The actual shared data items` | non |
| `onCommentModeChange` | `(active: boolean) => void` | non |

### `src/components/shared/StatBadge.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 67 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`StatBadgeProps`**

| Prop | Type | Requis |
|---|---|---|
| `icon` | `LucideIcon` | non |
| `children` | `ReactNode` | **oui** |
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info'` | non |
| `size` | `'sm' \| 'md' \| 'lg'` | non |
| `className` | `string` | non |

### `src/components/shared/UnifiedSearchBar.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 179 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/input`, `@/components/ui/button`, `@/components/ui/card`, `@/components/ui/label`

**`UnifiedSearchBarProps`**

| Prop | Type | Requis |
|---|---|---|
| `value` | `string` | **oui** |
| `onChange` | `(value: string) => void` | **oui** |
| `placeholder` | `string` | non |
| `label` | `string` | non |
| `minChars` | `number` | non |
| `minCharsMessage` | `string` | non |
| `resultsCount` | `number` | non |
| `className` | `string` | non |
| `withCard` | `boolean` | non |
| `variant` | `'default' \| 'compact' \| 'hero'` | non |
| `debounceMs` | `number` | non |
| `disabled` | `boolean` | non |
| `id` | `string` | non |

### `src/components/shared/index.ts`

index.ts — Export centralisé des composants partagés (shared)  Composants réutilisables dans tout le projet : - UnifiedSearchBar : barre de recherche unifiée - PageHero : en-tête héroïque de page - Pagination : composant de pagination

- **Exports** : —
- **Taille** : 34 lignes
- **Services API utilisés** : —
- **Hooks métier** : `useAddressNavigation`
- **Sous-composants / modules internes** : —

_Aucune prop typée déclarée dans le fichier._

---

## 📁 src/components/tache

### `src/components/tache/TacheCalendar.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 227 lignes
- **Services API utilisés** : `tacheApi`, `indisponibleApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`TacheCalendarProps`**

| Prop | Type | Requis |
|---|---|---|
| `currentDate` | `Date` | **oui** |
| `taches` | `Tache[]` | **oui** |
| `onPrevMonth` | `() => void` | **oui** |
| `onNextMonth` | `() => void` | **oui** |
| `onDayClick` | `(dateStr: string) => void` | **oui** |
| `onDragTache` | `(tacheId: string, newDate: string) => void` | **oui** |

### `src/components/tache/TacheConfirmDialog.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 83 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/alert-dialog`

**`TacheConfirmDialogProps`**

| Prop | Type | Requis |
|---|---|---|
| `deleteConfirm` | `string \| null` | **oui** |
| `setDeleteConfirm` | `(v: string \| null) => void` | **oui** |
| `onDelete` | `(id: string) => void` | **oui** |
| `moveConfirm` | `{ tacheId: string; newDate: string; newHeure: string; newHeureFin: string } \| null` | **oui** |
| `setMoveConfirm` | `(v: any) => void` | **oui** |
| `onMoveConfirm` | `() => void` | **oui** |
| `premiumBtnClass` | `string` | **oui** |
| `mirrorShine` | `string` | **oui** |

### `src/components/tache/TacheDayModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 374 lignes
- **Services API utilisés** : `tacheApi`, `rdvApiService`, `rdvApi`, `travailleurApi`, `indisponibleApi`
- **Hooks métier** : `useToast`, `useCountdown`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`TacheDayModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `selectedDay` | `string \| null` | **oui** |
| `taches` | `Tache[]` | **oui** |
| `travailleurs` | `Travailleur[]` | **oui** |
| `onEdit` | `(t: Tache) => void` | **oui** |
| `onDelete` | `(id: string) => void` | **oui** |
| `onAddTache` | `() => void` | **oui** |
| `onMoveTache` | `(id: string, newHeure: string) => void` | **oui** |
| `onValidateTache` | `(t: Tache) => void` | **oui** |
| `premiumBtnClass` | `string` | **oui** |
| `mirrorShine` | `string` | **oui** |
| `lockedIds` | `Set<string>` | non |

### `src/components/tache/TacheFormModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 447 lignes
- **Services API utilisés** : `tacheApi`, `rdvApiService`, `rdvApi`, `travailleurApi`, `indisponibleApi`
- **Hooks métier** : `useToast`
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/textarea`, `@/components/pointage/TravailleurSearchInput`

**`TacheFormModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `travailleurs` | `Travailleur[]` | **oui** |
| `editingTache` | `Tache \| null` | **oui** |
| `onSubmit` | `(data: any) => void` | **oui** |
| `premiumBtnClass` | `string` | **oui** |
| `mirrorShine` | `string` | **oui** |
| `defaultDate` | `string` | non |
| `isFollowUp` | `boolean` | non |

### `src/components/tache/TacheHero.tsx`

TacheHero - Hero modernisé pour la page Tâches Inspiré de PointageHero (style cosmique aurora glass) — props inchangés.

- **Exports** : —
- **Taille** : 372 lignes
- **Services API utilisés** : `tacheApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/button`, `@/components/ui/dialog`

**`TacheHeroProps`**

| Prop | Type | Requis |
|---|---|---|
| `totalTaches` | `number` | **oui** |
| `todayCount` | `number` | **oui** |
| `pertinentCount` | `number` | **oui** |
| `optionnelCount` | `number` | **oui** |
| `premiumBtnClass` | `string` | **oui** |
| `mirrorShine` | `string` | **oui** |
| `onAddTache` | `() => void` | **oui** |
| `onShowToday` | `() => void` | **oui** |
| `onShowWeek` | `() => void` | **oui** |
| `onAddTravailleur` | `() => void` | non |
| `onShareTaches` | `() => void` | non |
| `onSelectiveShareTaches` | `() => void` | non |
| `onViewComments` | `() => void` | non |
| `commentCount` | `number` | non |
| `allTaches` | `Tache[]` | non |
| `onNavigateToDate` | `(dateStr: string) => void` | non |

### `src/components/tache/TacheNotificationBar.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 59 lignes
- **Services API utilisés** : `tacheApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`TacheNotificationBarProps`**

| Prop | Type | Requis |
|---|---|---|
| `notifications` | `TacheNotification[]` | **oui** |
| `onClickNotification` | `(notif: TacheNotification) => void` | **oui** |
| `onDismiss` | `(id: string) => void` | **oui** |

### `src/components/tache/TacheTicker.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 149 lignes
- **Services API utilisés** : `tacheApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : —

**`TacheTickerProps`**

| Prop | Type | Requis |
|---|---|---|
| `taches` | `Tache[]` | **oui** |

### `src/components/tache/TacheValidationModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 85 lignes
- **Services API utilisés** : `tacheApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/button`

**`TacheValidationModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `tache` | `Tache \| null` | **oui** |
| `onValidate` | `(tache: Tache) => void` | **oui** |
| `onCreateFollowUp` | `(tache: Tache) => void` | **oui** |
| `premiumBtnClass` | `string` | **oui** |
| `mirrorShine` | `string` | **oui** |

### `src/components/tache/TacheView.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 592 lignes
- **Services API utilisés** : `tacheApi`, `confirmationRdvApi`, `travailleurApi`, `parametresApi`, `shareCommentsApi`
- **Hooks métier** : `useToast`, `useRealtimeCommentNotifications`
- **Sous-composants / modules internes** : `@/components/pointage/modals/TravailleurModal`, `@/components/shared/ShareLinkModal`, `@/components/shared/SelectiveShareModal`, `@/components/shared/ShareCommentsViewer`

_Aucune prop typée déclarée dans le fichier._

### `src/components/tache/TacheWeekModal.tsx`

_Composant applicatif._

- **Exports** : —
- **Taille** : 113 lignes
- **Services API utilisés** : `tacheApi`
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`

**`TacheWeekModalProps`**

| Prop | Type | Requis |
|---|---|---|
| `open` | `boolean` | **oui** |
| `onOpenChange` | `(v: boolean) => void` | **oui** |
| `weekDates` | `{ start: string; end: string }` | **oui** |
| `taches` | `Tache[]` | **oui** |
| `fetchWeekTaches` | `() => Promise<Tache[]>` | **oui** |

---

## 📁 src/components/tendances

### `src/components/tendances/TendancesStatsModals.tsx`

_Composant applicatif._

- **Exports** : `VentesTotalesModal`, `BeneficesModal`, `ProduitsVendusModal`, `MeilleurRoiModal`
- **Taille** : 345 lignes
- **Services API utilisés** : —
- **Hooks métier** : —
- **Sous-composants / modules internes** : `@/components/ui/dialog`, `@/components/ui/badge`, `@/components/ui/scroll-area`, `@/components/ui/card`

_Aucune prop typée déclarée dans le fichier._


