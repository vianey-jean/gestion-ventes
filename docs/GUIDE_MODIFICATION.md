# 🔧 Guide de modification — « pour modifier X, il faut toucher ces fichiers »

Ce guide donne, pour chaque fonctionnalité, la **chaîne complète** des fichiers à modifier : page → composant → hook → service API → route Express → contrôleur → modèle → fichier JSON.

## 0. Règle générale

```text
1. UI            src/pages/<Page>.tsx  +  src/components/<domaine>/<Composant>.tsx
2. Logique       src/hooks/use<Domaine>.ts  (ou hooks locaux du dossier)
3. Contrat       src/types/<domaine>.ts
4. Réseau        src/services/api/<domaine>Api.ts   (+ export dans services/api/index.ts)
5. Route         server/routes/<domaine>.js
6. Métier        server/controllers/<domaine>Controller.js  (si présent)
7. Données       server/models/<Domaine>.js  →  server/db/<domaine>.json
8. Temps réel    server/middleware/sync.js  (si un nouveau fichier JSON est ajouté)
```

---

## 1. Modifier une **vente produit**

**Objectif** : changer le formulaire de vente, le calcul, l'enregistrement ou l'affichage d'une vente.

| Étape | Fichiers à modifier |
|---|---|
| Formulaire de vente | `src/components/dashboard/forms/MultiProductSaleForm.tsx`, `SaleFormFields.tsx`, `SalePriceInput.tsx`, `SaleQuantityInput.tsx` |
| Sections du formulaire | `src/components/dashboard/forms/sections/SaleClientSection.tsx`, `SaleProductCard.tsx`, `SaleTotalsSection.tsx`, `SaleFormActions.tsx` |
| Logique du formulaire | `src/components/dashboard/forms/hooks/useSaleForm.ts` |
| Calculs | `src/components/dashboard/forms/utils/saleCalculations.ts`, `src/services/BusinessCalculationService.ts`, `src/hooks/useBusinessCalculations.ts` |
| Types | `src/components/dashboard/forms/types/saleFormTypes.ts`, `src/types/sale.ts` |
| Modales liées | `modals/EchangerVentesModal.tsx`, `modals/ReservedProductModal.tsx`, `PretProduitFromSaleModal.tsx`, `AdvancePaymentModal.tsx`, `ConfirmDeleteDialog.tsx` |
| Affichage / tableaux | `src/components/dashboard/SalesTable.tsx`, `src/components/business/PureSalesTable.tsx`, `src/components/dashboard/VentesProduits.tsx`, `src/components/dashboard/VentesParClientsModal.tsx` |
| Exports & facture | `src/components/dashboard/ExportSalesDialog.tsx`, `src/components/dashboard/InvoiceGenerator.tsx` |
| Pages | `src/pages/Ventes.tsx`, `src/pages/VentesEmbedded.tsx`, `src/pages/dashboard/DashboardTabContent.tsx` |
| Hook de données | `src/hooks/useSales.ts`, `src/store/appStore.ts` |
| Service API | `src/services/api/saleApi.ts` (`getAll`, `getByMonth`, `getById`, `create`, `update`, `delete`, `exportMonth`) |
| Route serveur | `server/routes/sales.js` (`/api/sales`) |
| Contrôleur | `server/controllers/saleController.js` |
| Modèle | `server/models/Sale.js` → `server/db/sales.json` |
| Effets de bord serveur | `server/models/Product.js` (décrément du stock), `server/models/Fidelite.js` (recalcul fidélité), `server/models/Benefice.js` |
| Effets de bord front | événement `sales-updated` écouté par `ObjectifStatsModal`, `ObjectifIndicator`, `ClientFideliteBadge` |

> ⚠️ Toute modification du montant ou de la quantité d'une vente impacte : le **stock produit**, la **fidélité client**, les **bénéfices**, les **objectifs** et la **comptabilité**. Vérifier ces cinq points après chaque changement.

---

## 2. Modifier un **produit**

| Étape | Fichiers |
|---|---|
| Page | `src/pages/ProduitsPage.tsx`, `src/pages/produits/*` |
| Table & cartes | `src/components/products/ProductsTable.tsx`, `ProductCharacteristicCard.tsx` |
| Modales | `src/components/products/modals/AddProductModal.tsx`, `EditProductModal.tsx`, `ProductViewModal.tsx`, `ProductDetailModal.tsx`, `DeleteConfirmDialog.tsx`, `AchatVenteHistoryModal.tsx`, `ProductCommentsModal.tsx` |
| Formulaires | `src/components/dashboard/AddProductForm.tsx`, `EditProductForm.tsx`, `PhotoUploadSection.tsx` |
| Attributs / classification | `src/components/products/attributes/*` (`ProductAttributesToolbar`, `ProductAttributeDialog`, `ProductClassificationSelector`, `ProductClassificationFilterModal`, `ClassificationSearchPopover`) |
| Commentaires produits | `src/components/products/ProductCommentScroller.tsx`, `modals/ProductCommentsModal.tsx` |
| Stock & prix | `src/components/products/StockListModal.tsx`, `PrixHistoryModal.tsx`, `ProductMergeModal.tsx`, `ProductsVenduModal.tsx` |
| Hooks | `src/hooks/useProducts.ts`, `useProductAttributes.ts`, `useAttributeKinds.ts` |
| Types | `src/types/product.ts` |
| Services | `src/services/api/productApi.ts`, `prixProductsApi.ts`, `productCommentsApi.ts`, `attributKindsApi.ts` |
| Routes | `server/routes/products.js`, `prixproducts.js`, `productComments.js`, `productAttributes.js`, `attributKinds.js`, `productsVendu.js` |
| Modèles | `server/models/Product.js`, `ProductAttribute.js`, `ProductComment.js` |
| Base | `products.json`, `prixproducts.json`, `productComments.json`, `modeleproduit.json`, `tailleproduits.json`, `couleurproduits.json`, `devantproduits.json`, `autresproduits.json`, `attribut_kinds.json` |

> La suppression d'un produit doit supprimer en cascade ses commentaires (`ProductComment.js`).

---

## 3. Modifier un **client**

| Étape | Fichiers |
|---|---|
| Page | `src/pages/ClientsPage.tsx`, `src/pages/clients/ClientHero.tsx`, `ClientSearchSection.tsx` |
| Composants | `src/components/clients/*` : `ClientsGrid`, `ClientCard`, `ClientCardItem`, `ClientFormDialog`, `ClientDetailModal`, `ClientFilterBar`, `ClientSearchBar`, `ClientPagination`, `ClientPhotoZoomModal`, `ClientPhoneActionModal`, `ClientAddressActionModal`, `ClientMergeModal`, `DuplicateClientModal`, `ClientConfirmDialogs` |
| Fidélité | `ClientFideliteBadge.tsx`, `ClientFideliteModal.tsx`, `FideliteListModal.tsx` |
| Villes | `CitiesManagerModal.tsx`, `CityFormModal.tsx` |
| Hooks / utils | `src/hooks/useClients.ts`, `useClientSync.ts`, `usePhoneActions.ts`, `src/utils/clientMatch.ts`, `clientCharacteristic.ts` |
| Types | `src/types/client.ts` |
| Services | `clientApi.ts`, `fideliteApi.ts`, `listesFideliteApi.ts`, `villesApi.ts` |
| Routes | `server/routes/clients.js`, `fidelite.js`, `listesFidelite.js`, `clientsVilles.js` |
| Modèles | `Client.js`, `Fidelite.js`, `ListesFidelite.js` → `clients.json`, `fidelite.json`, `listes-fidelite.json`, `clients-villes.json` |

---

## 4. Modifier une **commande / réservation**

Page `src/pages/CommandesPage.tsx` → `src/components/commandes/*` (`CommandesTable`, `CommandeFormDialog`, `form/ClientSection`, `form/ProductSection`, `form/TypeDateSection`, `ReservationUlterieureModal`, `ReporterModal`, `StatutUlterieurTransitionModal`, `OverdueReservationModal`, `PreparationLivraisonButton`, `RdvCreationModal`, `RdvConfirmationModal`, `TacheConflictModal`) → `src/hooks/useCommandes.ts`, `useCommandesLogic.ts` → `src/types/commande.ts` → `src/services/api/commandeApi.ts`, `prepaLivraisonApi.ts` → `server/routes/commandes.js`, `prepaLivraison.js` → `server/controllers/commandeController.js` → `server/models/Commande.js` → `server/db/commandes.json`, `prepa-livraison.json`.

---

## 5. Modifier un **rendez-vous**

Page `src/pages/RdvPage.tsx` + `src/pages/rdv/*` → `src/components/rdv/*` (`RdvCalendar`, `RdvForm`, `RdvCard`, `RdvStatsCards`, `RdvStatsModals`, `RdvStatsDetailsModal`, `RdvNotifications`, `ConfirmationRdvButton`, `GlobalRdvTodayNotifier`) et `src/components/rdvtache/*` → `src/hooks/useRdv.ts`, `src/utils/rdvConfirmationLock.ts`, `src/services/rdvFromReservationService.ts`, `reservationRdvSyncService.ts` → `src/types/rdv.ts` → `rdvApi.ts`, `rdvNotificationsApi.ts`, `confirmationRdvApi.ts`, `availabilityApi.ts` → `server/routes/rdv.js`, `rdvNotifications.js`, `confirmationRdv.js`, `availability.js` → `server/controllers/rdvController.js` → `server/models/Rdv.js`, `RdvNotification.js` → `rdv.json`, `rdvNotifications.json`, `confirmation-rdv.json`.

> Le passage « Confirmé → Terminé » ouvre `MultiProductSaleForm` pré-rempli : toute évolution de ce flux touche aussi la chaîne « vente » (section 1).

---

## 6. Modifier le **pointage** ou une **avance**

`src/pages/PointagePage.tsx` → `src/components/pointage/*` (`PointageCalendar`, `PointageHero`, `PointageTabNav`, `PointageEntreprisesList`, `PointageTravailleursList`, `TravailleurSearchInput`, `PointageAutoWatcher`) et `modals/*` (`AvanceModal`, `PointageFormModal`, `EditPointageModal`, `DayDetailModal`, `MonthDetailModal`, `YearlyTotalModal`, `ParPersonneModal`, `EntrepriseModal`, `EntrepriseEditModal`, `TravailleurModal`, `PointageConfirmDialogs`) → `pointageApi.ts`, `avanceApi.ts`, `travailleurApi.ts`, `entrepriseApi.ts`, `pointageAutoApi.ts`, `pointageAutoSessionsApi.ts`, `pointageDeletedApi.ts` → `server/routes/pointage.js`, `avance.js`, `travailleur.js`, `entreprise.js`, `pointageAuto*.js`, `pointageDeleted.js` → `server/controllers/pointageController.js` → `server/models/Pointage.js`, `Avance.js`, `Travailleur.js`, `Entreprise.js` → `pointage.json`, `avance.json`, `travailleur.json`, `entreprise.json`, `prixpointage.json`.

> Règle métier à préserver : **semaine glissante** (les jours de fin du mois précédent appartenant à la semaine du 1er comptent dans le mois courant) et traçabilité `pointageIds` sur chaque avance.

---

## 7. Modifier la **comptabilité**

`src/pages/Comptabilite.tsx`, `src/pages/Depenses.tsx`, `src/pages/dashboard/DashboardTabContent.tsx` → `src/components/dashboard/comptabilite/*` (`ComptabiliteModule`, `ComptabiliteHeader`, `ComptabiliteTabs`, `ComptabiliteStatsCards`, `SecondaryStatsCards`, `AchatFormDialog`, `DepenseFormDialog`, `AchatsHistoriqueList`, `FacturationModal`, `StableCharts`, `EvolutionMensuelleChart`, `DepensesRepartitionChart`), `modals/*`, `details/*`, `shared/*` → `src/hooks/useComptabilite.ts`, `useYearlyData.ts` → `src/types/comptabilite.ts`, `depense.ts` → `comptaApi.ts`, `depenseApi.ts`, `beneficeApi.ts`, `nouvelleAchatApi.ts`, `remboursementApi.ts`, `fournisseurApi.ts` → `server/routes/compta.js`, `depenses.js`, `benefices.js`, `nouvelleAchat.js`, `remboursements.js`, `fournisseurs.js`, `versement.js`, `banks.js` → contrôleurs `comptaController.js`, `depenseController.js`, `beneficeController.js`, `remboursementController.js` → modèles `Compta.js`, `DepenseDuMois.js`, `Benefice.js`, `NouvelleAchat.js`, `Remboursement.js`, `Fournisseur.js` → `compta.json`, `depensedumois.json`, `depensefixe.json`, `benefice.json`, `nouvelle_achat.json`, `remboursement.json`, `fournisseurs.json`, `montant-verser.json`.

> Les uploads de justificatifs passent par `server/middleware/uploadAchat.js` / `uploadDepense.js` et sont servis depuis `server/uploads`.

---

## 8. Modifier les **prêts**

`src/pages/PretFamilles.tsx`, `src/pages/PretProduits.tsx` → `src/components/dashboard/PretFamilles.tsx`, `PretProduits.tsx`, `PretProduitsGrouped.tsx`, `PretRetardNotification.tsx`, `prets/PretGroupCard.tsx`, `prets/PretHero.tsx`, `prets/PretStatsCards.tsx` → `src/types/pret.ts` → `pretFamilleApi.ts`, `pretProduitApi.ts` → `server/routes/pretfamilles.js`, `pretproduits.js` → `pretFamilleController.js`, `pretProduitController.js` → `PretFamille.js`, `PretProduit.js` → `pretfamilles.json`, `pretproduits.json`.

---

## 9. Modifier les **tâches** ou les **notes**

- Tâches : `src/components/tache/*` → `tacheApi.ts`, `parametresApi.ts`, `rdvTachesApi.ts`, `tachesRdvApi.ts` → `server/routes/tache.js`, `parametres.js`, `rdvTaches.js`, `tachesRdv.js` → `tacheController.js` → `Tache.js` → `tache.json`, `parametretache.json`, `rdv-taches.json`, `taches-rdv.json`.
- Notes : `src/components/notes/*` (`NotesKanbanView`, `KanbanColumn`, `NoteCard`, `NoteFormModal`, `ColumnFormModal`, `DrawingCanvas`, `NotesHero`) → `noteApi.ts`, `noteShareApi.ts` → `server/routes/notes.js`, `notesShare.js` → `Note.js` → `notes.json`, `noteColumns.json`.

---

## 10. Modifier le **partage** et les **commentaires visiteurs**

`src/components/shared/ShareLinkModal.tsx`, `SelectiveShareModal.tsx`, `SharedCommentForm.tsx`, `ShareCommentsViewer.tsx` + pages `SharedViewPage.tsx`, `SharedNotesPage.tsx` → `shareLinksApi.ts`, `shareCommentsApi.ts`, `noteShareApi.ts` → `server/routes/shareLinks.js`, `shareComments.js`, `notesShare.js` → `shareTokens.json`, `lienIp.json`, `lienpartagecommente.json`, `comment-share.json`.

---

## 11. Modifier l'**authentification**, le **profil** ou la **sécurité**

`LoginPage`, `RegisterPage`, `ResetPasswordPage`, `SecurityCheckPage`, `ProtectedRoute`, `PasswordInput`, `PasswordStrengthChecker` et `src/components/profile/*` → `src/contexts/AuthContext.tsx`, `src/store/authStore.ts`, `src/hooks/use-auto-logout.tsx`, `src/lib/security.ts` → `authApi.ts`, `profileApi.ts`, `settingsApi.ts`, `moduleSettingsApi.ts`, `historiqueConnexionApi.ts` → `server/routes/auth.js`, `profile.js`, `settings.js`, `moduleSettings.js`, `historiqueConnexion.js`, `encryption.js`, `maintenance.js` → `server/middleware/auth.js`, `security.js`, `encryption.js` → `users.json`, `settings.json`, `moduleSettings.json`, `historique-connexion.json`, `maintenance.json`, `tentativeblocage.json`, `timeoutinactive.json`.

---

## 12. Ajouter un **nouveau module** (checklist)

1. `server/db/<module>.json` (initialiser `[]` ou `{}`).
2. `server/models/<Module>.js` (getAll / getById / create / update / delete).
3. `server/routes/<module>.js` + montage dans `server/server.js`.
4. Ajouter le fichier JSON à la surveillance dans `server/middleware/sync.js`.
5. `src/types/<module>.ts`.
6. `src/services/api/<module>Api.ts` + export dans `src/services/api/index.ts`.
7. `src/hooks/use<Module>.ts`.
8. `src/pages/<Module>Page.tsx` + `src/components/<module>/*`.
9. Route dans `src/App.tsx` (lazy + `ProtectedRoute`) et entrée de navigation dans la sidebar du Dashboard.
10. Documenter le module dans `docs/`.

---

## 13. Carte automatique composant → serveur

Table générée depuis le code : pour chaque fichier front qui consomme un service API, la route, le modèle et le fichier de base à modifier.

| Fichier front | Services API | Routes serveur | Modèles | Base |
|---|---|---|---|---|
| `src/components/clients/CitiesManagerModal.tsx` | `clientsVillesApi` | `clientsVilles.js` | `—` | `clients-villes.json` |
| `src/components/clients/ClientFideliteBadge.tsx` | `fideliteApiService` | `fidelite.js` | `Fidelite.js` | `fidelite.json` |
| `src/components/clients/ClientFideliteModal.tsx` | `fideliteApiService` | `fidelite.js` | `Fidelite.js` | `fidelite.json` |
| `src/components/clients/ClientFilterBar.tsx` | `clientsVillesApi` | `clientsVilles.js` | `—` | `clients-villes.json` |
| `src/components/commandes/CommandeFormDialog.tsx` | `clientsVillesApi`, `livraisonVilleApi` | `clientsVilles.js`, `livraisonVille.js` | `—`, `—` | `clients-villes.json`, `livraison-ville.json` |
| `src/components/commandes/form/ClientSection.tsx` | `clientsVillesApi` | `clientsVilles.js` | `—` | `clients-villes.json` |
| `src/components/dashboard/AddProductForm.tsx` | `fournisseurApiService` | `fournisseurs.js` | `Fournisseur.js` | `fournisseurs.json` |
| `src/components/dashboard/AddSaleForm.tsx` | `remboursementApiService` | `remboursements.js` | `Remboursement.js` | `remboursement.json` |
| `src/components/dashboard/EditProductForm.tsx` | `fournisseurApiService` | `fournisseurs.js` | `Fournisseur.js` | `fournisseurs.json` |
| `src/components/dashboard/FournisseurAutocomplete.tsx` | `fournisseurApiService` | `fournisseurs.js` | `Fournisseur.js` | `fournisseurs.json` |
| `src/components/dashboard/Inventaire.tsx` | `productApiService` | `products.js` | `Product.js` | `products.json` |
| `src/components/dashboard/RefundForm.tsx` | `remboursementApiService`, `pretProduitApiService` | `remboursements.js`, `pretproduits.js` | `Remboursement.js`, `PretProduit.js` | `remboursement.json`, `pretproduits.json` |
| `src/components/dashboard/VentesParClientsModal.tsx` | `saleApiService` | `sales.js` | `Sale.js` | `sales.json` |
| `src/components/dashboard/VentesProduits.tsx` | `saleApiService` | `sales.js` | `Sale.js` | `sales.json` |
| `src/components/dashboard/ViewRefundsModal.tsx` | `remboursementApiService` | `remboursements.js` | `Remboursement.js` | `remboursement.json` |
| `src/components/dashboard/comptabilite/FacturationModal.tsx` | `nouvelleAchatApiService` | `nouvelleAchat.js` | `NouvelleAchat.js` | `nouvelle_achat.json` |
| `src/components/dashboard/comptabilite/modals/ExportPdfModal.tsx` | `nouvelleAchatApiService` | `nouvelleAchat.js` | `NouvelleAchat.js` | `nouvelle_achat.json` |
| `src/components/dashboard/forms/MultiProductSaleForm.tsx` | `livraisonVilleApi` | `livraisonVille.js` | `—` | `livraison-ville.json` |
| `src/components/dashboard/forms/modals/AddLivraisonVilleModal.tsx` | `livraisonVilleApi` | `livraisonVille.js` | `—` | `livraison-ville.json` |
| `src/components/dashboard/forms/modals/EchangerVentesModal.tsx` | `saleApiService`, `livraisonVilleApi` | `sales.js`, `livraisonVille.js` | `Sale.js`, `—` | `sales.json`, `livraison-ville.json` |
| `src/components/dashboard/forms/modals/LivraisonVilleListModal.tsx` | `livraisonVilleApi` | `livraisonVille.js` | `—` | `livraison-ville.json` |
| `src/components/dashboard/forms/sections/SaleClientSection.tsx` | `clientsVillesApi` | `clientsVilles.js` | `—` | `clients-villes.json` |
| `src/components/dashboard/forms/sections/SaleProductCard.tsx` | `livraisonVilleApi` | `livraisonVille.js` | `—` | `livraison-ville.json` |
| `src/components/products/PrixHistoryModal.tsx` | `prixProductsApiService` | `prixproducts.js` | `Product.js` | `prixproducts.json` |
| `src/components/rdv/ConfirmationRdvButton.tsx` | `rdvApiService` | `rdv.js` | `Rdv.js` | `rdv.json` |
| `src/components/rdv/GlobalRdvTodayNotifier.tsx` | `rdvApiService` | `rdv.js` | `Rdv.js` | `rdv.json` |
| `src/components/rdv/RdvCalendar.tsx` | `rdvApiService`, `clientApiService` | `rdv.js`, `clients.js` | `Rdv.js`, `Client.js` | `rdv.json`, `clients.json` |
| `src/components/rdvtache/RdvFormModal.tsx` | `clientApiService` | `clients.js` | `Client.js` | `clients.json` |
| `src/components/tache/TacheDayModal.tsx` | `rdvApiService` | `rdv.js` | `Rdv.js` | `rdv.json` |
| `src/components/tache/TacheFormModal.tsx` | `rdvApiService` | `rdv.js` | `Rdv.js` | `rdv.json` |
| `src/pages/ClientsPage.tsx` | `clientsVillesApi`, `fideliteApiService` | `clientsVilles.js`, `fidelite.js` | `—`, `Fidelite.js` | `clients-villes.json`, `fidelite.json` |
| `src/pages/ProduitsPage.tsx` | `productApiService`, `fournisseurApiService`, `clientApiService` | `products.js`, `fournisseurs.js`, `clients.js` | `Product.js`, `Fournisseur.js`, `Client.js` | `products.json`, `fournisseurs.json`, `clients.json` |

