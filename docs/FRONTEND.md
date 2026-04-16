# ⚛️ Documentation Frontend — Riziky Gestion

> Ce document décrit **toutes les pages**, **tous les composants**, **tous les hooks**, **tous les contexts** et **tous les services** du frontend React.

---

## 📑 Table des matières

1. [Pages de l'application](#1-pages-de-lapplication)
2. [Composants par module](#2-composants-par-module)
3. [Contexts (état global)](#3-contexts-état-global)
4. [Hooks personnalisés](#4-hooks-personnalisés)
5. [Services API](#5-services-api)
6. [Services temps réel](#6-services-temps-réel)
7. [Types TypeScript](#7-types-typescript)

---

## 1. Pages de l'application

Chaque page correspond à une URL. Elles sont chargées en **lazy loading** (chargement à la demande) pour la performance.

### Pages publiques (accessibles sans connexion)

| Page | Fichier | Route | Description |
|------|---------|-------|-------------|
| **Accueil** | `HomePage.tsx` | `/` | Page vitrine avec présentation du produit, call-to-action vers connexion/inscription |
| **À propos** | `AboutPage.tsx` | `/about` | Présentation de l'entreprise et de l'application |
| **Contact** | `ContactPage.tsx` | `/contact` | Formulaire de contact |
| **Connexion** | `LoginPage.tsx` | `/login` | Formulaire de connexion avec email + mot de passe. Affiche le nombre de tentatives restantes. Bloque le compte après X tentatives |
| **Inscription** | `RegisterPage.tsx` | `/register` | Formulaire d'inscription avec nom, prénom, email, mot de passe, genre, adresse, téléphone. Vérification de la force du mot de passe |
| **Réinitialisation** | `ResetPasswordPage.tsx` | `/reset-password` | Étape 1 : vérifier l'email. Étape 2 : nouveau mot de passe avec validation (majuscule, minuscule, chiffre, caractère spécial) |
| **Vue partagée** | `SharedViewPage.tsx` | `/shared/:token` | Affiche le pointage ou les tâches partagés via lien. Permet d'ajouter des commentaires |
| **Notes partagées** | `SharedNotesPage.tsx` | `/shared/notes/:token` | Affiche les notes partagées via lien avec commentaires |

### Pages protégées (connexion requise)

| Page | Fichier | Route | Description |
|------|---------|-------|-------------|
| **Dashboard** | `DashboardPage.tsx` | `/dashboard` | Tableau de bord principal. Contient : formulaire ajout produit, formulaire vente, inventaire, comptabilité, prêts, dépenses, objectifs |
| **Clients** | `ClientsPage.tsx` | `/clients` | Liste des clients avec photo, nom, téléphone(s), adresse. Recherche, tri A-Z / Z-A, ajout, modification, suppression |
| **Produits** | `ProduitsPage.tsx` | `/produits` | Tableau des produits avec description, prix, quantité, notation. Tri par colonne (↑↓). Recherche. Commentaires par produit |
| **Commandes** | `CommandesPage.tsx` | `/commandes` | Gestion des réservations/commandes. Statistiques, recherche, suivi de livraison, report, création de RDV depuis commande |
| **Rendez-vous** | `RdvPage.tsx` | `/rdv` | Calendrier des rendez-vous avec notifications, formulaire de création, statistiques |
| **Pointage** | `PointagePage.tsx` | `/pointage` | Suivi des heures de travail. Onglets : Calendrier, Entreprises, Travailleurs. Notes, Tâches. Partage via liens |
| **Messages** | `MessagesPage.tsx` | `/messages` | Messagerie interne |
| **Profil** | `ProfilePage.tsx` | `/profile` | Paramètres du compte : avatar, infos, mot de passe, sécurité (tentatives de connexion, temps de blocage), modules activés, indisponibilités |

---

## 2. Composants par module

### 2.1 Composants d'authentification (`src/components/auth/`)

| Composant | Description |
|-----------|-------------|
| `ProtectedRoute.tsx` | Enveloppe une page protégée. Redirige vers `/login` si l'utilisateur n'est pas connecté. Vérifie le token JWT à chaque navigation |

### 2.2 Composants Clients (`src/components/clients/`)

| Composant | Description | Où le trouver |
|-----------|-------------|---------------|
| `ClientsHero.tsx` | En-tête de la page avec titre, nombre de clients, bouton d'ajout | `ClientsPage.tsx` |
| `ClientSearchBar.tsx` | Barre de recherche pour filtrer les clients par nom ou téléphone | `ClientsPage.tsx` |
| `ClientsGrid.tsx` | Grille affichant les cartes de chaque client | `ClientsPage.tsx` |
| `ClientCard.tsx` | Carte individuelle d'un client avec photo, nom, téléphones, adresse, boutons modifier/supprimer | `ClientsGrid.tsx` |
| `ClientPhotoZoomModal.tsx` | Modal pour zoomer sur la photo d'un client | `ClientCard.tsx` |

### 2.3 Composants Commandes (`src/components/commandes/`)

| Composant | Description | Où le trouver |
|-----------|-------------|---------------|
| `CommandesHero.tsx` | En-tête avec titre et statistiques | `CommandesPage.tsx` |
| `CommandesSearchBar.tsx` | Recherche et filtres de commandes | `CommandesPage.tsx` |
| `CommandesStatsButtons.tsx` | Boutons statistiques (total, en cours, terminées) | `CommandesPage.tsx` |
| `CommandesTable.tsx` | Tableau des commandes avec tri et pagination | `CommandesPage.tsx` |
| `CommandeFormDialog.tsx` | Formulaire de création/modification de commande dans un Dialog | `CommandesPage.tsx` |
| `CommandesDialogs.tsx` | Ensemble des dialogs de la page commandes | `CommandesPage.tsx` |
| `ConfirmationDialogs.tsx` | Dialogs de confirmation (suppression, validation) | `CommandesPage.tsx` |
| `OverdueReservationModal.tsx` | Modal pour les réservations en retard | `CommandesPage.tsx` |
| `RdvConfirmationModal.tsx` | Confirmation de création de RDV depuis commande | `CommandesPage.tsx` |
| `RdvCreationModal.tsx` | Formulaire de création de RDV | `CommandesPage.tsx` |
| `ReporterModal.tsx` | Modal pour reporter une commande | `CommandesPage.tsx` |
| `TacheConflictModal.tsx` | Avertissement si conflit de tâche | `CommandesPage.tsx` |

### 2.4 Composants Notes (`src/components/notes/`)

| Composant | Description | Où le trouver |
|-----------|-------------|---------------|
| `NotesKanbanView.tsx` | Vue Kanban complète avec colonnes et notes | `PointagePage.tsx` (onglet Notes) |
| `KanbanColumn.tsx` | Une colonne du Kanban (titre, notes, bouton ajouter) | `NotesKanbanView.tsx` |
| `NoteCard.tsx` | Carte d'une note individuelle (titre, contenu, couleur, dessin) | `KanbanColumn.tsx` |
| `NoteFormModal.tsx` | Formulaire de création/modification de note | `NotesKanbanView.tsx` |
| `ColumnFormModal.tsx` | Formulaire de création/modification de colonne | `NotesKanbanView.tsx` |
| `ConfirmModal.tsx` | Dialog de confirmation de suppression | `NotesKanbanView.tsx` |
| `DrawingCanvas.tsx` | Canvas de dessin intégré dans les notes | `NoteFormModal.tsx` |
| `constants.ts` | Constantes (couleurs disponibles pour les notes) | Utilisé partout |

### 2.5 Composants Pointage (`src/components/pointage/`)

| Composant | Description | Où le trouver |
|-----------|-------------|---------------|
| `PointageHero.tsx` | En-tête de la page pointage | `PointagePage.tsx` |
| `PointageTabNav.tsx` | Onglets de navigation (Calendrier, Entreprises, Travailleurs) | `PointagePage.tsx` |
| `PointageCalendar.tsx` | Calendrier mensuel des pointages | `PointagePage.tsx` |
| `PointageEntreprisesList.tsx` | Liste des entreprises avec gestion CRUD | `PointagePage.tsx` |
| `PointageTravailleursList.tsx` | Liste des travailleurs avec gestion CRUD | `PointagePage.tsx` |
| `TravailleurSearchInput.tsx` | Recherche de travailleurs | `PointagePage.tsx` |

### 2.6 Composants Tâches (`src/components/tache/`)

| Composant | Description | Où le trouver |
|-----------|-------------|---------------|
| `TacheView.tsx` | Vue principale des tâches | `PointagePage.tsx` (onglet Tâches) |
| `TacheHero.tsx` | En-tête avec titre et bouton nouveau | `TacheView.tsx` |
| `TacheCalendar.tsx` | Calendrier des tâches | `TacheView.tsx` |
| `TacheFormModal.tsx` | Formulaire création/modification de tâche | `TacheView.tsx` |
| `TacheDayModal.tsx` | Détail des tâches d'un jour | `TacheView.tsx` |
| `TacheWeekModal.tsx` | Vue semaine des tâches | `TacheView.tsx` |
| `TacheNotificationBar.tsx` | Barre de notifications (tâches du jour, en retard) | `TacheView.tsx` |
| `TacheTicker.tsx` | Ticker défilant des tâches | `TacheView.tsx` |
| `TacheConfirmDialog.tsx` | Confirmation de suppression | `TacheView.tsx` |
| `TacheValidationModal.tsx` | Validation/complétion d'une tâche | `TacheView.tsx` |

### 2.7 Composants Rendez-vous (`src/components/rdv/`)

| Composant | Description | Où le trouver |
|-----------|-------------|---------------|
| `RdvCalendar.tsx` | Calendrier des rendez-vous | `RdvPage.tsx` |
| `RdvCard.tsx` | Carte d'un rendez-vous | `RdvPage.tsx` |
| `RdvForm.tsx` | Formulaire de création/modification | `RdvPage.tsx` |
| `RdvNotifications.tsx` | Notifications de rendez-vous | `RdvPage.tsx` |
| `RdvStatsCards.tsx` | Cartes statistiques (aujourd'hui, semaine, mois) | `RdvPage.tsx` |
| `RdvStatsDetailsModal.tsx` | Détails des statistiques en modal | `RdvPage.tsx` |
| `RdvStatsModals.tsx` | Ensemble des modals de stats RDV | `RdvPage.tsx` |

### 2.8 Composants Produits (`src/components/products/`)

| Composant | Description | Où le trouver |
|-----------|-------------|---------------|
| `ProductCommentScroller.tsx` | Scroller horizontal des commentaires produit | `ProduitsPage.tsx` |

### 2.9 Composants Dashboard (`src/components/dashboard/`)

| Composant | Description |
|-----------|-------------|
| `AdvancedDashboard.tsx` | Dashboard principal avec tous les modules |
| `AddProductForm.tsx` | Formulaire ajout de produit |
| `AddSaleForm.tsx` | Formulaire ajout de vente |
| `EditProductForm.tsx` | Formulaire modification de produit |
| `SalesTable.tsx` | Tableau des ventes |
| `VentesProduits.tsx` | Module ventes avec liste et actions |
| `Inventaire.tsx` | Inventaire des produits |
| `StatCard.tsx` | Carte statistique réutilisable |
| `DepenseDuMois.tsx` | Gestion des dépenses mensuelles |
| `PretFamilles.tsx` | Gestion des prêts familles |
| `PretProduits.tsx` | Gestion des prêts produits |
| `PretProduitsGrouped.tsx` | Prêts produits groupés |
| `PretRetardNotification.tsx` | Notifications prêts en retard |
| `ProfitCalculator.tsx` | Calculateur de profit |
| `RefundForm.tsx` | Formulaire de remboursement |
| `ViewRefundsModal.tsx` | Modal liste des remboursements |
| `ExportSalesDialog.tsx` | Export ventes en PDF |
| `InvoiceGenerator.tsx` | Générateur de factures |
| `MonthlyResetHandler.tsx` | Réinitialisation mensuelle |
| `PhotoUploadSection.tsx` | Upload de photos produit |
| `ProductPhotoSlideshow.tsx` | Diaporama photos produit |
| `ProductSearchInput.tsx` | Recherche produit dans Dashboard |
| `ClientSearchInput.tsx` | Recherche client dans Dashboard |
| `FournisseurAutocomplete.tsx` | Autocomplétion fournisseur |
| `ActionButton.tsx` | Bouton d'action stylisé |
| `VentesParClientsModal.tsx` | Ventes par client en modal |

### 2.10 Composants Comptabilité (`src/components/dashboard/comptabilite/`)

| Composant | Description |
|-----------|-------------|
| `ComptabiliteModule.tsx` | Module principal — orchestre tous les sous-composants |
| `ComptabiliteHeader.tsx` | En-tête avec sélecteurs mois/année et boutons actions |
| `ComptabiliteStatsCards.tsx` | 4 cartes principales : Crédit, Débit, Bénéfice Ventes, Bénéfice Réel |
| `SecondaryStatsCards.tsx` | 3 cartes secondaires : Achats Produits, Autres Dépenses, Solde Net |
| `ComptabiliteTabs.tsx` | Onglets : Graphiques, Historique achats |
| `AchatFormDialog.tsx` | Formulaire d'ajout d'achat |
| `DepenseFormDialog.tsx` | Formulaire d'ajout de dépense |
| `AchatsHistoriqueList.tsx` | Liste historique des achats |
| `EvolutionMensuelleChart.tsx` | Graphique évolution mensuelle |
| `DepensesRepartitionChart.tsx` | Graphique répartition des dépenses |
| `StableCharts.tsx` | Wrapper pour graphiques stables |
| `ProductSearchInput.tsx` | Recherche produit dans comptabilité |
| **Modals** (dans `modals/`) | CreditDetailsModal, DebitDetailsModal, BeneficeVentesModal, BeneficeReelModal, AchatsProduitsModal, AutresDepensesModal, SoldeNetModal, ExportPdfModal |

### 2.11 Composants Profil (`src/components/profile/`)

| Composant | Description |
|-----------|-------------|
| `ProfileAvatar.tsx` | Avatar de l'utilisateur avec upload photo |
| `ProfileCard.tsx` | Carte profil avec toutes les infos |
| `ProfileInfoCard.tsx` | Détails des informations personnelles |
| `PasswordSection.tsx` | Changement de mot de passe |
| `SecuriteSection.tsx` | Paramètres de sécurité (nombre de tentatives, temps de blocage) |
| `ParametresSection.tsx` | Paramètres généraux |
| `ModuleSettingsSection.tsx` | Activation/désactivation des modules du Dashboard |
| `IndisponibiliteSection.tsx` | Gestion des périodes d'indisponibilité |
| `BulkDeleteModal.tsx` | Suppression en masse de données |

### 2.12 Composants Partagés (`src/components/shared/`)

| Composant | Description | Où le trouver |
|-----------|-------------|---------------|
| `ShareLinkModal.tsx` | Modal de création de lien de partage (pointage, tâches, notes) | `PointagePage.tsx` |
| `ShareCommentsViewer.tsx` | Affichage des commentaires reçus sur un lien partagé. Icône 👁️ pour lire, 🗑️ pour supprimer (si lu) | `PointagePage.tsx` |
| `SharedCommentForm.tsx` | Formulaire de commentaire sur une vue partagée | `SharedViewPage.tsx`, `SharedNotesPage.tsx` |
| `SelectiveShareModal.tsx` | Partage sélectif (choisir quels éléments partager) | `PointagePage.tsx` |
| `ConfirmDialog.tsx` | Dialog de confirmation réutilisable | Partout |
| `LoadingOverlay.tsx` | Overlay de chargement | Partout |
| `PageHero.tsx` | En-tête de page avec titre et description | Plusieurs pages |
| `Pagination.tsx` | Composant de pagination | Tables |
| `StatBadge.tsx` | Badge statistique | Divers |
| `UnifiedSearchBar.tsx` | Barre de recherche unifiée | Plusieurs pages |
| `AddressActionModal.tsx` | Actions sur une adresse (copier, ouvrir maps) | Clients, Commandes |

### 2.13 Composants Généraux

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `Layout.tsx` | `src/components/Layout.tsx` | Layout principal avec Navbar et contenu |
| `Navbar.tsx` | `src/components/Navbar.tsx` | Barre de navigation principale |
| `Footer.tsx` | `src/components/Footer.tsx` | Pied de page |
| `SEOHead.tsx` | `src/components/SEOHead.tsx` | Balises SEO dynamiques |
| `ScrollToTop.tsx` | `src/components/ScrollToTop.tsx` | Remonte en haut de page au changement de route |
| `CookieConsent.tsx` | `src/components/CookieConsent.tsx` | Bandeau de consentement cookies |
| `PasswordInput.tsx` | `src/components/PasswordInput.tsx` | Champ mot de passe avec afficher/masquer |
| `PasswordStrengthChecker.tsx` | `src/components/PasswordStrengthChecker.tsx` | Indicateur de force du mot de passe |

---

## 3. Contexts (état global)

Les contexts React sont le "cerveau" de l'application. Ils stockent les données partagées entre toutes les pages.

| Context | Fichier | Description |
|---------|---------|-------------|
| `AuthContext` | `src/contexts/AuthContext.tsx` | **Authentification** : utilisateur connecté, token JWT, fonctions login/logout/register. Vérifie le token au démarrage. Gère la déconnexion automatique |
| `AppContext` | `src/contexts/AppContext.tsx` | **Données métier** : produits, ventes, clients, commandes, pointages, tâches, notes, RDV, dépenses, prêts, etc. Charge toutes les données au démarrage. Fournit les fonctions CRUD |
| `ThemeContext` | `src/contexts/ThemeContext.tsx` | **Thème** : mode clair/sombre. Persiste dans localStorage |
| `FormProtectionContext` | `src/contexts/FormProtectionContext.tsx` | **Protection formulaires** : empêche la perte de données si l'utilisateur quitte un formulaire non sauvegardé |

### Comment utiliser un context ?

```tsx
// Dans n'importe quel composant :
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

function MonComposant() {
  const { user, logout } = useAuth();       // Récupère l'utilisateur connecté
  const { products, addProduct } = useApp(); // Récupère les produits
  
  return <div>Bonjour {user.firstName}</div>;
}
```

---

## 4. Hooks personnalisés

Les hooks encapsulent de la logique réutilisable. Ils sont dans `src/hooks/`.

| Hook | Description | Utilisé dans |
|------|-------------|-------------|
| `useComptabilite` | Toute la logique du module comptabilité (calculs, filtres, formulaires) | `ComptabiliteModule.tsx` |
| `useClients` | CRUD clients, recherche, sync | `ClientsPage.tsx` |
| `useProducts` | CRUD produits, recherche, filtres | `ProduitsPage.tsx`, Dashboard |
| `useSales` | CRUD ventes, calculs profits | Dashboard |
| `useCommandes` | Logique des commandes | `CommandesPage.tsx` |
| `useCommandesLogic` | Logique avancée des commandes | `CommandesPage.tsx` |
| `useRdv` | CRUD rendez-vous | `RdvPage.tsx` |
| `useObjectif` | Gestion objectifs | Dashboard |
| `useBusinessCalculations` | Calculs métier (chiffre d'affaires, profits, marges) | Dashboard |
| `useYearlyData` | Données annuelles | Comptabilité |
| `useClientSync` | Synchronisation clients en temps réel | `ClientsPage.tsx` |
| `useOptimization` | Optimisations performance | Global |
| `usePhoneActions` | Actions sur numéro de téléphone (appeler, WhatsApp, copier) | `ClientCard.tsx` |
| `useRealtimeCommentNotifications` | Notifications temps réel des commentaires | `PointagePage.tsx` |
| `use-auto-logout` | Déconnexion automatique après inactivité | `AuthContext` |
| `use-chat-notification` | Notifications chat | Messages |
| `use-currency-formatter` | Formatage monétaire (EUR) | Partout |
| `use-error-boundary` | Gestion d'erreurs | Global |
| `use-messages` | Logique messagerie | `MessagesPage.tsx` |
| `use-mobile` | Détection mobile/desktop | Responsive |
| `use-professional-data` | Données professionnelles | Dashboard |
| `use-realtime-sync` | Synchronisation SSE | Global |
| `use-sse` | Connexion SSE bas niveau | `use-realtime-sync` |
| `use-toast` | Notifications toast | Partout |

---

## 5. Services API

Chaque module a son propre fichier API dans `src/services/api/`. Ils utilisent tous Axios avec intercepteurs pour le token JWT.

| Service | Fichier | Endpoints principaux |
|---------|---------|---------------------|
| `api.ts` | Configuration Axios de base | Base URL, intercepteurs, retry |
| `authApi.ts` | Authentification | login, register, verify, resetPassword, checkEmail |
| `productApi.ts` | Produits | getAll, create, update, delete, uploadPhotos |
| `saleApi.ts` | Ventes | getAll, create, delete, getByMonth |
| `clientApi.ts` | Clients | getAll, create, update, delete, uploadPhoto |
| `commandeApi.ts` | Commandes | getAll, create, update, delete, reporter |
| `rdvApi.ts` | Rendez-vous | getAll, create, update, delete |
| `pointageApi.ts` | Pointage | getAll, create, update, delete |
| `tacheApi.ts` | Tâches | getAll, create, update, delete, validate |
| `noteApi.ts` | Notes | getAll, create, update, delete, moveToColumn, reorder |
| `noteShareApi.ts` | Partage notes | create, getByToken |
| `depenseApi.ts` | Dépenses | getAll, create, update, delete |
| `comptaApi.ts` | Comptabilité | getAchats, createAchat, updateAchat, deleteAchat |
| `objectifApi.ts` | Objectifs | getAll, create, update, delete |
| `entrepriseApi.ts` | Entreprises | getAll, create, update, delete |
| `travailleurApi.ts` | Travailleurs | getAll, create, update, delete |
| `avanceApi.ts` | Avances | getAll, create, update, delete |
| `beneficeApi.ts` | Bénéfices | getAll, create |
| `remboursementApi.ts` | Remboursements | getAll, create, delete |
| `pretFamilleApi.ts` | Prêts familles | getAll, create, update, delete |
| `pretProduitApi.ts` | Prêts produits | getAll, create, update, delete |
| `fournisseurApi.ts` | Fournisseurs | getAll, create |
| `profileApi.ts` | Profil | get, update, uploadAvatar |
| `shareLinksApi.ts` | Liens de partage | create, getByToken, getMyLinks |
| `shareCommentsApi.ts` | Commentaires partagés | getByLink, create, markAsRead, delete |
| `productCommentsApi.ts` | Commentaires produits | getByProduct, create, delete |
| `settingsApi.ts` | Paramètres | get, update |
| `parametresApi.ts` | Paramètres avancés | get, update |
| `moduleSettingsApi.ts` | Modules activés | get, update |
| `indisponibleApi.ts` | Indisponibilités | getAll, create, delete |
| `rdvNotificationsApi.ts` | Notifications RDV | getAll, markAsRead |
| `nouvelleAchatApi.ts` | Nouveaux achats | getAll, create |

### Comment fonctionne un appel API ?

```tsx
// Exemple : récupérer tous les produits
import { productApi } from '@/services/api';

const products = await productApi.getAll();
// → Axios envoie GET /api/products avec le token JWT
// → Le serveur vérifie le token, lit products.json, renvoie les données
```

---

## 6. Services temps réel

| Service | Fichier | Description |
|---------|---------|-------------|
| `realtimeService.ts` | `src/services/realtimeService.ts` | Connexion SSE au serveur pour recevoir les mises à jour en temps réel |
| `optimizedRealtimeService.ts` | `src/services/optimizedRealtimeService.ts` | Version optimisée avec reconnexion automatique |
| `syncService.ts` | `src/services/syncService.ts` | Service de synchronisation des données |

### Comment ça marche ?

1. Le frontend ouvre une connexion SSE vers `GET /api/sync/events`
2. Le serveur garde la connexion ouverte
3. Quand une donnée change (produit ajouté, vente créée...), le serveur envoie un événement
4. Le frontend reçoit l'événement et met à jour l'interface **sans rafraîchir la page**

---

## 7. Types TypeScript

Les types sont dans `src/types/` et définissent la structure des données :

| Fichier | Types définis |
|---------|--------------|
| `product.ts` | `Product`, `ProductFormData` — id, code, description, purchasePrice, quantity, sellingPrice, profit, photos, fournisseur |
| `client.ts` | `Client`, `ClientFormData` — id, nom, phones[], adresse, photo |
| `depense.ts` | `DepenseFixe`, `DepenseDuMois`, `DepenseFormData` — id, description, catégorie, date, débit, crédit, solde |
