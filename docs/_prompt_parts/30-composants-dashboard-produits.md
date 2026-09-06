## 7ter. LOGIQUE DÉTAILLÉE — Dashboard, Produits, Ventes, Comptabilité, Tendances

Cette section documente **exhaustivement** tous les fichiers de `src/components/dashboard/**`, `src/components/products/**`, `src/components/business/**`, `src/components/forms/**` et `src/components/tendances/**`. Chaque composant doit être reconstruit à l'identique : props, état local, appels API, règles métier, formules de calcul, effets, modales, erreurs/toasts, style et animations.

---

### 7ter.1 Formules financières fondamentales (à respecter partout)

Ces formules sont le cœur de toute la logique métier. Elles sont utilisées de façon cohérente dans les ventes, la comptabilité et les rapports.

**Vente simple (un seul produit, `sale.products` absent) :**
- `A` = Prix d'achat unitaire (`purchasePriceUnit`) × Quantité vendue (`quantitySold`) → **coût total**
- `V` = Prix de vente unitaire (`sellingPriceUnit`) × Quantité vendue → **chiffre d'affaires (revenu) de la ligne**
- `B` = `V - A` → **Bénéfice (profit)** de la vente. Formule exacte issue de `saleCalculations.ts` :
  ```ts
  const A = purchasePriceUnit * quantity;
  const V = priceUnit * quantity;
  const B = V - A; // toFixed(2)
  ```
- Fonctions utilitaires génériques (mêmes fichiers) :
  - `calculateTotalPurchasePrice(purchasePriceUnit, quantity) = purchasePriceUnit * quantity`
  - `calculateTotalSellingPrice(sellingPriceUnit, quantity) = sellingPriceUnit * quantity`
  - `calculateProfit(totalSellingPrice, totalPurchasePrice) = totalSellingPrice - totalPurchasePrice`

**Cas particulier — "produit d'avance"** (description contenant le mot-clé "avance", ex. "Avance Perruque ou Tissages") :
- La quantité est **toujours forcée à 0** (le produit n'est pas physiquement sorti du stock à cet instant).
- `purchasePrice` (stocké) = le prix d'achat du produit **sans multiplication par la quantité** (c'est un montant fixe, pas un prix unitaire × qty).
- `sellingPrice` (stocké) = le prix de vente **saisi directement par l'utilisateur** (montant de l'avance reçue), sans multiplication.
- `profit = sellingPrice(saisi) - purchasePrice(produit)` (pas de quantité dans le calcul).
- Aucune vérification de stock n'est faite pour ce type de produit (le champ `isOutOfStock` est ignoré).

**Réduction sur une ligne de vente (`computeReductionAmount`, `saleFormTypes.ts`) :**
```ts
type ReductionType = '' | 'amount' | 'percent';
// type = 'percent' : réduction unitaire = (sellingPriceUnit * reduction) / 100 ; montant total = unitDiscount * quantity
// type = 'amount'  : montant total = reduction * quantity (déduction fixe par unité)
// Le résultat est toujours borné à un minimum de 0 (Math.max(0, ...))
```
Dans le formulaire multi-produits, le prix de vente final de la ligne est :
```
sellingPriceBeforeReduction = sellingPriceUnit * quantity
sellingPrice (final)        = sellingPriceBeforeReduction - reductionAmount
```

**Frais de livraison :**
- Chaque produit d'une vente multi-produits a un `deliveryLocation` (ville) et un `deliveryFee` saisis.
- `originalDeliveryFee` = tarif standard de la ville trouvé dans la table des villes de livraison (`livraisonVilleApi`).
- `deliveryFeeAdjustment = deliveryFee - originalDeliveryFee` (négatif = réduction accordée sur la livraison, positif = supplément).

**Mode "Avance" sur une vente multi-produits (paiement partiel / acompte) :**
- Si la section Avance est affichée et qu'un montant `avancePrice` est saisi :
  - `finalSellingPrice = avancePrice` (remplace la somme des lignes)
  - `reste = montant saisi par l'utilisateur` représentant le solde restant dû
  - Une entrée est créée/mise à jour dans `pretproduits` (table des prêts produits) avec : `prixVente = totalSellingPrice (calculé)`, `avanceRecue = avancePrice`, `reste`, `estPaye = (reste === 0)`, `datePaiement = nextPaymentDate`.
- Sinon, `finalSellingPrice = totals.totalSellingPrice` (somme normale de toutes les lignes produits).

**Totaux globaux d'une vente multi-produits :**
```
totalPurchasePrice = Σ (purchasePrice de chaque ligne)
totalSellingPrice  = Σ (sellingPrice de chaque ligne, après réduction) [ou avancePrice si mode avance]
totalProfit        = Σ (profit de chaque ligne)
totalDeliveryFee   = Σ (deliveryFee de chaque ligne)
```

**Calculateur de bénéfice produit (`ProfitCalculator.tsx`) — fiche de prix de revient :**
```ts
coutSansTva       = prixAchat + taxeDouane + autresFrais
coutAvecTva       = coutSansTva * (1 + tva / 100)
prixVenteRecommande = coutAvecTva * (1 + margeDesire / 100)
beneficeNet       = prixVenteRecommande - coutAvecTva
tauxMarge         = coutAvecTva > 0 ? (beneficeNet / coutAvecTva) * 100 : 0
```
- Valeurs par défaut : `tva = 20`, `margeDesire = 30`.
- Recalcul automatique à chaque changement de `prixAchat`, `taxeDouane`, `tva`, `autresFrais`, `margeDesire` (effet React).
- Prix de vente personnalisé (`calculateWithCustomPrice`) : si l'utilisateur saisit un `prixVenteCustom`, alors `beneficeNet = prixVenteCustom - coutTotal` et `tauxMarge = (beneficeNet / coutTotal) * 100`.
- Seuil de rentabilité affiché : `isRentable = tauxMarge >= 20`.
- Persistance : un calcul par produit (`beneficeService`), refus d'enregistrement si un calcul existe déjà pour ce produit (message d'erreur toast). Rafraîchissement automatique toutes les 2 secondes (`setInterval`) de la liste des bénéfices enregistrés.

**Comptabilité mensuelle (`useComptabilite.ts`) — cœur du module Comptabilité :**
Pour un mois/année sélectionné :
```
salesTotal   = Σ ventes du mois : (sale.totalSellingPrice) si multi-produits, sinon (sellingPrice * quantitySold)
salesCost    = Σ ventes du mois : (sale.totalPurchasePrice) si multi-produits, sinon (purchasePrice * quantitySold)
salesProfit  = Σ ventes du mois : (sale.totalProfit) si multi-produits, sinon (sale.profit)
salesCount   = nombre de ventes du mois

achatsProducts = achats du mois avec type === 'achat_produit'
depenses       = achats du mois avec type !== 'achat_produit' (taxes, carburant, autre_depense…)
achatsTotal    = Σ achatsProducts.totalCost
depensesTotal  = Σ depenses.totalCost

beneficeReel = salesProfit - (achatsTotal + depensesTotal)   // "Bénéfice réel" = profit des ventes moins TOUTES les sorties d'argent
totalCredit  = salesTotal                                    // argent entrant
totalDebit   = achatsTotal + depensesTotal                   // argent sortant
soldeNet     = totalCredit - totalDebit
```
- Ces données sont sauvegardées côté serveur via `comptaApiService.calculateMonth(year, month)`, avec une déduplication par "signature" (année, mois, salesTotal, salesProfit, achatsTotal, depensesTotal, nombre d'achats) stockée dans un `useRef` pour éviter les appels API redondants.
- **Graphique mensuel annuel** (`monthlyChartData`, 12 points, un par mois de l'année sélectionnée) :
  ```
  pour chaque mois i (1..12) de l'année sélectionnée :
    profit (beneficeVentes) = Σ profit des ventes du mois i
    depenses                = Σ totalCost des achats/dépenses du mois i (tous types confondus)
    beneficeReel            = profit - depenses
  ```
- **Répartition des dépenses** (`depensesRepartition`, camembert) : regroupement des achats par type avec libellés `Achats Produits`, `Taxes`, `Carburant`, `Autres` ; valeur = somme des `totalCost`.

**Rapport Profit & Loss (`ProfitLossStatement.tsx`) — périodes glissantes :**
- Périodes disponibles : `current-month` (1er jour du mois en cours → aujourd'hui), `last-month` (mois précédent complet), `current-quarter` (`now.getMonth() - 2` → aujourd'hui, soit environ les 3 derniers mois glissants), `current-year` (1er janvier → aujourd'hui).
- Pour chaque vente de la période : `revenue`, `cost`, `profit` et `totalProductsSold` extraits (gère à la fois le format multi-produits `sale.products` et le format simple `sale.sellingPrice`/`sale.purchasePrice`/`sale.quantitySold`).
- `profitMargin = (profit / revenue) * 100` si `revenue > 0` sinon 0.
- `costPercentage = (cost / revenue) * 100`.
- `averageProfitPerSale = profit / salesCount` (si `salesCount > 0`).
- `productsPerSale = totalProductsSold / salesCount`.
- `avgOrderValue = revenue / salesCount`.
- **Comparaison à la période précédente** : si la période sélectionnée est `current-month`, la période de comparaison est `last-month`, sinon c'est toujours `current-month`.
  ```
  calculateChange(current, previous) = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100
  ```
  Affiché avec badge vert (TrendingUp) si `change >= 0`, rouge (TrendingDown) sinon.
- Modales de détail cliquables pour chaque statistique (`revenue`, `cost`, `profit`, `avgOrder`, `margin`, `salesCount`, `profitPerSale`).

**Tendances / statistiques cliquables (`TendancesStatsModals.tsx`) :**
- `formatCurrency` : `Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })`.
- 4 modales premium : `VentesTotalesModal` (CA + nombre de transactions + top produits par ventes), `BeneficesModal` (bénéfice total + marge moyenne + top produits par bénéfice), `ProduitsVendusModal` (quantité totale + nombre de produits différents + répartition), `MeilleurRoiModal` (classement des produits par ROI décroissant, `ROI = (bénéfice moyen / coût) * 100`, badges colorés : vert si ROI≥100%, bleu si ≥50%, orange sinon ; médailles or/argent/bronze pour les 3 premiers rangs).

---

### 7ter.2 Ventes — formulaires, calcul et règles anti-doublon

#### `AddSaleForm.tsx` (formulaire de vente **mono-produit**, legacy)
- Props : `isOpen`, `onClose`, `editSale?`, `onRefund?`.
- Utilise le hook `useSaleForm(editSale, products, isOpen)` pour tout l'état (voir ci-dessous).
- **Gestion client intégrée** : à la soumission, recherche du client existant par nom (`GET /api/clients`, comparaison insensible à la casse). Si trouvé → utilisation directe (ou mise à jour si téléphone/adresse ont changé lors d'une modification). Sinon, création (`POST /api/clients`) uniquement si téléphone ET adresse sont renseignés. Lors d'une suppression de vente, si le client n'existe pas encore en base et que ses coordonnées sont complètes, il est sauvegardé avant la suppression de la vente (pour ne pas perdre l'historique client).
- **Calcul du profit en temps réel** : à chaque changement de prix de vente unitaire ou de quantité, `updateProfit()` recalcule via `calculateSaleProfit` (produit normal) ou `sellingPriceUnit - purchasePriceUnit` (produit d'avance).
- **Vérification de stock à la soumission** (uniquement pour un **ajout**, pas une modification) : si le produit n'est pas de type avance et `isOutOfStock` (quantité 0/undefined), refus avec toast d'erreur "Stock épuisé. Impossible d'ajouter cette vente."
- **Construction des données de vente** :
  - Produit normal : `purchasePrice = purchasePriceUnit * quantity`, `sellingPrice = sellingPriceUnit * quantity`.
  - Produit d'avance : `purchasePrice = purchasePriceUnit` (montant brut), `sellingPrice = sellingPriceUnit` (montant saisi), `quantity = 0`.
- **Suppression d'une vente** : détecte si c'est une vente de remboursement (`isRefund === true` OU `totalSellingPrice`/`sellingPrice < 0`). Si oui et qu'elle a un `originalSaleId`, recherche le remboursement lié (`remboursementApiService.getAll()`, filtre par `negativeSaleId === editSale.id`) et le supprime via l'API dédiée (le serveur gère la restauration du stock et la suppression de la vente négative). Sinon, suppression normale de la vente (`deleteSale`).
- **États des boutons** : bouton désactivé si soumission en cours, aucun produit sélectionné, ou (ajout + hors stock + non-avance). Le libellé change dynamiquement ("Enregistrement...", "Sélectionner un produit", "Stock épuisé", "Mettre à jour"/"Ajouter").
- Modale de confirmation de suppression (`ConfirmDeleteDialog`) avec titre/texte adaptés selon qu'il s'agit d'un remboursement ou d'une vente normale.
- Bouton "Rembourser" (icône `RotateCcw`) visible uniquement en mode édition si `onRefund` est fourni.

#### `useSaleForm.ts` (hook d'état du formulaire mono-produit)
- État : `formData` (date, description, productId, sellingPriceUnit, quantitySold, purchasePriceUnit, profit, clientName/Address/Phone), `selectedProduct`, `isSubmitting`, `maxQuantity`, `showDeleteConfirm`, `isAdvanceProduct`.
- `isOutOfStock = selectedProduct && !isAdvanceProduct && (quantity === 0 || quantity === undefined)`.
- `initializeForm()` : en mode édition, détecte le produit d'avance via `description.toLowerCase().includes('avance')`, recalcule les prix unitaires en divisant `purchasePrice`/`sellingPrice` par `quantitySold` (sauf pour les avances où le prix stocké est déjà unitaire), et fixe `maxQuantity = quantité en stock actuelle + quantité déjà vendue par cette vente` (pour permettre l'augmentation lors d'une modification).
- `handleProductSelect(product)` : détecte l'avance, fixe `quantitySold = '0'` pour une avance sinon `'1'`, calcule un **prix de vente suggéré = purchasePrice × 1.2** (marge de 20% par défaut) pour les produits normaux (vide pour les avances, à définir manuellement), calcule le profit initial.

#### `MultiProductSaleForm.tsx` (formulaire de vente **multi-produits**, principal, 1445 lignes)
- Gère plusieurs lignes produits (`formProducts: FormProduct[]`), un client, une adresse de livraison, une ville, un mode "Avance" (paiement partiel) et un mode Prêt-produit.
- **Détection de doublon client (anti-doublon)** :
  - Chargement de tous les clients et commandes à l'ouverture du formulaire (`GET /api/clients`, `GET /api/commandes`).
  - Effet **debounced à 600 ms** qui, à chaque changement de `clientName`/`clientPhone`/`clientPhones`/`clientAddress` (et si ce n'est pas une modification de vente existante), calcule une **signature** du client saisi (`matchSignature`) et cherche des correspondances parmi les clients existants (`findMatchingClients`, comparaison sur nom/téléphones/adresses).
  - Si des correspondances sont trouvées, ouverture de `DuplicateClientModal` proposant d'utiliser un client existant ou de continuer avec les nouvelles informations.
  - Deux registres en mémoire (`useRef`, pas de re-render) évitent les boucles :
    - `dismissedSigsRef` : signatures explicitement rejetées par l'utilisateur (la modale ne se réouvre plus pour cette saisie exacte).
    - `acceptedSigRef` : signature du client accepté/sélectionné (pas de nouvelle détection tant que rien ne change).
  - En cas de sélection d'un client existant, possibilité de mettre à jour ses informations (nom, téléphones, adresses) via `PUT /api/clients/:id` (FormData).
- **Détection produit réservé** : si le produit sélectionné a `reserver === 'oui'`, ouverture d'une modale de confirmation (`ReservedProductModal`) avant de l'ajouter à la vente ; en cas de conflit avec une réservation bloquante existante, une modale de résolution de conflit est proposée.
- **Calcul des totaux** (`getTotals()`) : somme sur toutes les lignes valides de `purchasePrice`, `sellingPrice` (après réduction), `profit`, `deliveryFee`.
- **Soumission** :
  - Pour chaque ligne produit valide, calcule `purchasePrice`, `sellingPriceBeforeReduction`, `reductionAmount`, `sellingPrice` final, ainsi que les infos de livraison (`originalDeliveryFee` retrouvé depuis la table des villes, `deliveryFeeAdjustment`).
  - Si mode avance actif (`showAdvanceSection` + `avancePrice` renseigné, même à 0) : `finalSellingPrice = avancePrice`, `reste` = solde restant saisi, création/mise à jour d'un enregistrement `pretproduits` avec `estPaye = (reste === 0)`.
  - Sinon : `finalSellingPrice = totals.totalSellingPrice`.
  - Appel `addSale`/`updateSale` du contexte global avec l'objet `saleData` complet (produits, totaux, infos client/ville, `reste`, `nextPaymentDate`).
  - **Post-traitement** : pour chaque produit vendu marqué comme réservé (`reserver === 'oui'`), suppression de la réservation liée dans `commandes` (et du rendez-vous lié dans `rdv` s'il existe), puis remise à `reserver: 'non'` du produit (`PUT /api/products/:id`).
  - Gestion des erreurs par toasts dédiés (succès vente, échec partiel création prêt produit, erreur générale).
- **Protection anti-synchronisation concurrente** : `setFormProtection(true/false)` (hook `use-realtime-sync`) activé pendant que le formulaire est ouvert pour empêcher le rafraîchissement temps réel d'écraser les saisies en cours.

#### `saleFormTypes.ts`
- `FormProduct` : structure d'une ligne produit du formulaire multi-produits (productId, description, prix, quantité, produit sélectionné, quantité max, flags avance/prêt, livraison, réduction).
- `createEmptyFormProduct()` : ligne vide par défaut (`deliveryLocation: 'Saint-Denis'`, `deliveryFee: '0'`, `quantitySold: '1'`).
- `computeReductionAmount` : voir formules ci-dessus.

#### `saleCalculations.ts`
- Utilitaires purs partagés : `calculateSaleProfit`, `calculateTotalPurchasePrice`, `calculateTotalSellingPrice`, `calculateProfit` (voir §7ter.1).

#### Sections du formulaire multi-produits (`forms/sections/`)
- `SaleClientSection.tsx` : saisie du nom/téléphone(s)/adresse(s)/ville du client, autocomplete via `ClientSearchInput`, affichage de la caractéristique client calculée (`computeClientCaracteristique`).
- `SaleProductCard.tsx` : une carte par ligne produit — sélection produit (autocomplete `ProductSearchInput`), prix unitaire, quantité (bornée par `maxQuantity`), réduction (montant ou %), ville/frais de livraison, bouton suppression de ligne, slideshow photos produit.
- `SaleTotalsSection.tsx` : carte visuelle (dégradé vert) affichant les totaux (achat, vente, profit, livraison), section "Avance" repliable avec champ montant avancé, reste calculé et date de prochain paiement.
- `SaleFormActions.tsx` : boutons d'action du formulaire (ajouter ligne produit, soumettre, supprimer vente, rembourser, annuler).

#### `SalePriceInput.tsx` / `SaleQuantityInput.tsx`
- Champs numériques contrôlés dédiés au prix unitaire et à la quantité, avec validation (pas de négatif, respect du `maxQuantity` pour la quantité) et mise à jour du profit à chaque frappe.

#### `SaleFormFields.tsx`
- Assemble les champs du formulaire mono-produit (`AddSaleForm`) : sélection produit, description en lecture seule, prix de vente unitaire, quantité, prix d'achat unitaire (lecture seule), profit calculé (coloré rouge si négatif via `isProfitNegative`), champs client.

#### `SalesTable.tsx` (tableau des ventes du mois, "ultra complet")
- Props : `sales`, `onRowClick`, `overrideMonth?`, `overrideYear?`, `highlightSaleId?`.
- **Filtrage par mois courant** (ou mois/année forcés via `overrideMonth`/`overrideYear`, utilisé pour la navigation depuis l'historique de fidélité client) : ne conserve que les ventes dont `getMonth()`/`getFullYear()` correspondent.
- **Temps réel** : connexion à `realtimeService`, écoute des événements `data` (liste complète des ventes) et `sync` (`type: 'data-changed', data.type: 'sales'`) pour mettre à jour la table en direct ; un timer de repli (`fallbackTimer`, 1500 ms) arrête le loader si aucune donnée n'arrive (mois vide).
- **Tri** : bouton bascule ascendant/descendant par date (`sortOrder`).
- **Groupement par jour** (`groupedSales`) avec possibilité de replier/déplier chaque groupe (`collapsedDays`), sous-totaux par jour, en-têtes affichant date + icônes (Calendar, Sparkles, Award).
- **Mise en évidence** : si `highlightSaleId` est fourni, scroll automatique (délai 400 ms) vers la ligne portant la classe `.riziky-sale-highlight` (utilisée pour signaler une vente précise venant d'un autre écran).
- **Détection produit d'avance** : `description.includes('Avance Perruque ou Tissages')` → la quantité de cette ligne est affichée comme 0 dans les totaux.
- **Détection remboursement** (`isRefundSale`) : `sale.isRefund === true` OU `(totalSellingPrice ?? sellingPrice ?? 0) < 0`. Pour ces ventes, la quantité affichée est **négative** (`normalizeQuantityForDisplay`).
- **Totaux globaux** (`globalTotals`) : sommes de `sales` (CA), `purchase` (coût), `profit`, `delivery` (frais de livraison, y compris pour les ventes multi-produits en sommant chaque ligne), `quantity` (avec gestion avance/remboursement).
- Formatage : `formatDate` (fr-FR, jj/mm/aaaa), `formatCurrency` (Intl NumberFormat EUR).
- Loader `PremiumLoading` pendant le chargement initial.

#### `PureSalesTable.tsx` (composant "pur", `src/components/business/`)
- Composant strictement présentationnel, `React.memo`, props en lecture seule (`readonly`), aucun état interne ni effet.
- Affiche une table simple (date, produit, prix de vente, quantité, bénéfice coloré vert/rouge, actions modifier/supprimer).
- Callbacks `onEditSale`, `onDeleteSale` (avec `stopPropagation` pour ne pas déclencher `onRowClick`), `onRowClick`.
- États : `loading` → `PremiumLoading` ; liste vide → message "Aucune vente enregistrée pour cette période".
- Utilise `FormatService` pour le formatage (date, devise, nombre) au lieu de logique locale.

#### `SearchSalesModal.tsx` (recherche transverse dans l'historique des ventes)
- Charge toutes les ventes (`saleApiService.getAll()`).
- Filtres combinables : texte libre (`query`), année (`year`), catégorie de produit déduite de la description normalisée sans accents (`categoryOf` : perruques/tissages/extension/autres), tri chronologique (`sortOrder`).
- **Filtre avancé par attributs** (modèle/couleur/taille/devant) via `ProductClassificationFilterModal`, qui applique un filtre supplémentaire sur les termes correspondants dans les descriptions produits de la vente (`saleDescriptions`).
- `norm()` : normalisation Unicode (`NFD` + suppression des diacritiques) pour une recherche insensible aux accents/majuscules.
- Détail d'une vente sélectionnée affiché en overlay (date, client, téléphone, adresse, produits, montants).

#### `RefundForm.tsx`
- Formulaire de remboursement (partiel ou total) d'une vente existante : crée une **vente négative** (`sellingPrice`/`profit` négatifs) liée à la vente d'origine (`originalSaleId`) et à un enregistrement dans `remboursements`. Le service backend gère la restauration du stock (`stockRestored`) lorsque le remboursement est annulé/supprimé.

#### `ExportSalesDialog.tsx`
- Modale d'export (PDF/tableur) des ventes sur une plage de dates/mois choisie, avec récapitulatif des totaux avant export.

---

### 7ter.3 Comptabilité (`dashboard/comptabilite/**`)

#### `ComptabiliteModule.tsx`
- Composant orchestrateur "mince" : délègue tout l'état et la logique au hook `useComptabilite()` et assemble : en-tête (sélecteurs mois/année + actions), cartes de stats principales et secondaires, onglets (graphiques + historique des achats), formulaires modaux (achat, dépense), modales de détail (crédit, débit, bénéfice ventes, bénéfice réel, achats produits, autres dépenses, solde net, export PDF), et modale de facturation (recherche de factures d'achat/dépense).

#### `useComptabilite.ts` (hook central, 755 lignes)
- **État de période** : `selectedMonth`/`selectedYear` (par défaut le mois/année courants), `exportMonth`/`exportYear` séparés pour l'export PDF.
- **Chargement des achats** : `nouvelleAchatApiService.getByMonthYear(year, month)`, protégé par un `loadingRef` pour éviter les appels concurrents ; rafraîchi automatiquement par le `realtimeService` (écoute `data.achats`, filtre par mois/année sélectionnés côté client).
- **Fournisseurs** : chargement de la liste complète, autocomplete filtrée par saisie (`fournisseurSearch`).
- **Recherche produit pour formulaire d'achat** : filtre par `description` OU `code`, activé seulement si `searchTerm.length >= 3` (limite le bruit).
- **Soumission d'un achat** (`handleSubmitAchat`) :
  1. Validation : description, quantité > 0, date obligatoires.
  2. `finalPurchasePrice` = prix saisi si > 0, sinon reprise du `purchasePrice` du produit déjà existant.
  3. Upload optionnel d'une **facture d'achat** (image/PDF) via `nouvelleAchatApiService.uploadAchatReceipt`.
  4. Création de l'achat (`nouvelleAchatApiService.create`) → crée ou met à jour le produit côté serveur (stock += quantité).
  5. Enregistrement systématique dans `prixproducts.json` (historique des prix d'achat) avec `previousPrice` (prix précédent du produit) et un flag `isNewProduct`.
  6. Gestion des photos produit **uniquement si l'utilisateur a interagi avec la zone photo** (`pendingPhotosTouched`) : remplacement complet des photos (`productApiService.replacePhotos`) pour un produit existant ou nouvellement créé.
  7. Mise à jour du **prix de vente unitaire** du produit si renseigné (`productApiService.updateSellingPrice`), historisée côté serveur.
  8. Toast de succès différencié : mise à jour de stock existant (avec nouveau prix éventuel et changement de nom) vs création d'un nouveau produit.
- **Constantes** : `MONTHS` (tableau des 12 mois en français, capitalisés).

#### `ComptabiliteHeader.tsx`, `ComptabiliteStatsCards.tsx`, `SecondaryStatsCards.tsx`, `ComptabiliteTabs.tsx`
- En-tête : sélecteurs mois/année, boutons "Nouvel achat", "Nouvelle dépense", "Exporter", "Facturation".
- Cartes principales cliquables (crédit total, débit total, bénéfice ventes, bénéfice réel) → ouvrent les modales de détail correspondantes.
- Cartes secondaires cliquables (achats produits, autres dépenses, solde net).
- Onglets : historique des achats/dépenses (liste), graphiques (évolution mensuelle en barres, répartition des dépenses en camembert).

#### `AchatFormDialog.tsx` / `DepenseFormDialog.tsx`
- Formulaires modaux de saisie d'un achat (produit, prix, quantité, fournisseur, caractéristiques, date, disponibilité, photos, facture) et d'une dépense (description, montant, type — `taxes`/`carburant`/`autre_depense`, catégorie, date, reçu).

#### `AchatsHistoriqueList.tsx`
- Liste chronologique des achats/dépenses du mois sélectionné, avec actions modifier (`AchatEditModal`) / supprimer, badges de type, montants formatés en euros.

#### `StableCharts.tsx`
- `StableBarChart` (recharts `BarChart`) : 3 séries — `beneficeVentes` (vert `#10B981`), `depenses` (rouge `#EF4444`), `beneficeReel` (bleu `#3B82F6`) — mémoïsé (`React.memo` + comparaison JSON stringify des données) pour éviter les re-renders inutiles lors des mises à jour temps réel.
- `StablePieChart` (recharts `PieChart`) : répartition des dépenses par type, palette de couleurs fixe (`['#10B981','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#EC4899']`), libellés `Nom (pourcentage%)`.

#### `EvolutionMensuelleChart.tsx` / `DepensesRepartitionChart.tsx`
- Wrappers d'affichage (cartes avec titres/icônes) autour de `StableBarChart`/`StablePieChart`, consommant `monthlyChartData` et `depensesRepartition` du hook.

#### Modales de détail (`comptabilite/modals/`)
- `CreditDetailsModal` : détail des ventes du mois contribuant au crédit total.
- `DebitDetailsModal` : détail des achats/dépenses du mois contribuant au débit total.
- `BeneficeVentesModal` : détail du bénéfice brut des ventes (profit des ventes, hors achats/dépenses).
- `BeneficeReelModal` : détail du calcul `beneficeReel = salesProfit - (achatsTotal + depensesTotal)`.
- `AchatsProduitsModal` : liste des achats de type `achat_produit` uniquement.
- `AutresDepensesModal` : liste des dépenses hors achat produit.
- `SoldeNetModal` : détail `soldeNet = totalCredit - totalDebit`.
- `ExportPdfModal` : génération d'un rapport PDF pour un mois/année choisi (indépendant de la période affichée à l'écran).
- `AchatDetailModal` / `AchatEditModal` : consultation et modification d'un achat existant.
- `AchatsProduitsModal`/`AutresDepensesModal` réutilisent le composant générique `shared/DetailsModal.tsx` et `shared/ClickableStatCard.tsx` (carte statistique cliquable avec effet hover, utilisée partout dans le module).

#### `FacturationModal.tsx`
- Recherche transverse des factures/reçus d'achats et de dépenses (par nom de fournisseur, description, période), avec prévisualisation des fichiers uploadés (images/PDF).

---

### 7ter.4 Rapports avancés (`dashboard/reports/`) et `AdvancedDashboard.tsx`

#### `AdvancedDashboard.tsx`
- Composant conteneur avec onglets (`Tabs`) : "Comptabilité" (`ComptabiliteModule`), "Finance Pro" (`ProfitLossStatement`), "Analytics Pro" (`SalesReport`, `ProfitEvolution`, `StockRotation`), "Analyse annuelle" (`YearlyComparison`).
- Design "ultra premium" : fond animé avec orbes lumineux en mouvement continu (`framer-motion`, boucles infinies `duration: 18-28s`), grille de fond semi-transparente, ligne de scan lumineuse animée verticale, particules flottantes générées aléatoirement (`generateParticles`, 28 particules avec position/durée/délai/taille aléatoires).
- Variantes d'animation partagées : `contentVariants` (fade+slide+scale à l'entrée/sortie d'onglet), `staggerContainer`/`staggerItem` (apparition échelonnée des cartes, délai de 0.08s entre enfants).
- Chaque onglet a une palette de couleurs dédiée (dégradés from/via/to, glow, bg, text) définie dans le tableau `tabs`.

#### `reports/SalesReport.tsx`, `ProfitEvolution.tsx`, `StockRotation.tsx`, `YearlyComparison.tsx`
- `SalesReport` : rapport détaillé des ventes sur une période (regroupement par produit/catégorie, classement).
- `ProfitEvolution` : courbe d'évolution du bénéfice net dans le temps (mensuel), avec tendance (hausse/baisse).
- `StockRotation` : calcul de la rotation des stocks (vitesse d'écoulement) par produit — typiquement `quantité vendue sur la période / stock moyen`, permettant d'identifier les produits à rotation lente/rapide.
- `YearlyComparison` : comparaison des indicateurs (CA, coûts, profit) d'une année sur l'autre, écart en pourcentage.

---

### 7ter.5 Inventaire, produits et gestion du stock

#### `Inventaire.tsx` (module de gestion complet des produits, 1529 lignes)
- État : `products`, `filteredProducts`, `searchTerm`, `category` (`all`/`perruque`/`tissage`/`autre`), tris nom/quantité, pagination locale, modales ajout/édition/vue/suppression, alerte stock, gestion photos (ajout/édition), gestion "indisponible → disponible".
- **Catégorisation automatique** (`categorizeProduct`) : détection par mots-clés dans la description (`perruque`, `tissage`, sinon `autre`).
- **Priorité / criticité de stock** (`getPriority`) :
  - `quantity === 0` → `URGENT` (rouge, icône AlertTriangle).
  - `1 ≤ quantity ≤ 2` → `ATTENTION` (orange, icône Clock).
  - `quantity > 2` → `NORMALE` (vert, icône CheckCircle).
  - Couleurs de texte associées (`getQuantityColor`) : rouge / orange / vert.
- **Génération automatique des codes produits manquants** au chargement : si des produits n'ont pas de `code`, appel à `productService.generateCodesForExistingProducts()` puis rechargement complet.
- **Filtrage** : recherche texte activée seulement à partir de **3 caractères** (`searchTerm.length >= 3`), sur description OU code. Filtre de catégorie combiné.
- **Tri double critère** : tri principal par quantité (asc/desc), puis à quantité égale, tri secondaire par nom (asc/desc). Réinitialisation de la page courante à 1 à chaque changement de filtre/tri.
- **Pagination locale** : `ITEMS_PER_PAGE = 10`, `totalPages = Math.ceil(filteredProducts.length / 10)`, découpage via `slice(startIndex, startIndex + 10)`.
- **Ajout de produit** : validation description obligatoire, upload photos optionnel après création (`productService.uploadProductPhotos`).
- **Modification de produit** : détection intelligente des changements de photos (`hasNewFiles` ou liste d'URLs conservées différente de l'existant) avant d'appeler `replaceProductPhotos` (évite un appel réseau inutile si rien n'a changé).
- **Suppression de produit** : confirmation puis `productService.deleteProduct`.
- **Génération de PDF étiquette produit** (`handleDownloadProductPDF`, via `jsPDF`) : étiquette au format 50×30mm, en-tête sombre avec code produit en blanc, corps blanc avec description (jusqu'à 3 lignes), bordure fine, séparateur horizontal.
- **Gestion "indisponible"** : chaque produit peut avoir des lots d'achats marqués `disponible: false` (ex. en transit/réservé fournisseur). Le total indisponible est `Σ achats.filter(disponible===false).quantity`. Un bouton dédié permet de confirmer leur passage en disponible (voir `IndispoConfirmDialog`).
- Statistiques globales par catégorie affichées en cartes 3D animées (`ModernContainer` avec dégradés violet/bleu/vert et icônes Crown/Diamond/ShoppingBag).

#### `IndispoConfirmDialog.tsx`
- Modale de confirmation avant de rendre disponibles des unités marquées indisponibles.
- Calcule dynamiquement `qty = Σ achats non disponibles du produit ciblé`.
- Message explicite : ces quantités seront ajoutées au stock vendable et les achats correspondants passeront à "Disponible" dans l'historique.
- Bouton de confirmation désactivé pendant le traitement (`processing`).

#### `ProductsTable.tsx` (table produits paginée, réutilisable)
- Colonnes : Photo, Code, Description (avec `ProductCommentScroller` si des commentaires existent), Prix d'achat, Prix de vente (tiret si absent/0), Quantité (badge coloré selon les mêmes seuils que `Inventaire` : rouge/0, orange/1-2, vert/>2, avec animations `stockBlink`/`stockPulse`), Notation (étoiles avec couleur selon moyenne : rouge ≤2, jaune ≤3, vert au-delà ; demi-étoile si `avg - fullStars >= 0.3`), Actions (voir/modifier/supprimer + badge "indisponible" cliquable avec compteur), Caractéristique (carte + bouton dédié).
- Tri cliquable sur `description`, `purchasePrice`, `quantity`, `notation` (`SortField`), indicateurs de direction (flèches haut/bas colorées selon l'état actif).
- Ligne vide : message "Aucun produit trouvé" avec icône.

#### `ProductClassificationSelector.tsx` (2371 lignes) — sélecteur d'attributs produits "ultra premium"
- Catégories fixes : `Perruque`, `Tissages`, `Extension`, `Autres` (icônes ✦ ◈ ✧ ◇).
- Modes : `create` (création/édition produit, sélection unique par attribut) et `filter` (filtrage, sélection **multiple** possible par attribut, valeurs jointes par `|`).
- Champs "legacy" fixes : `modele`, `autres`, `devant`, `couleur`, `taille` — stockés comme propriétés directes de `ClassificationValue`. Tout attribut personnalisé additionnel (créé dynamiquement via `useAttributeKinds`) est stocké dans `extras: Record<kindId, value>`.
- **Champ "devant" réservé à la catégorie Perruque** : masqué si `categorie !== 'Perruque'`.
- **Formatage spécial "taille"** (`formatTailleValue`) : ajoute automatiquement le suffixe " Pouces" si la valeur ne contient pas déjà "pouce".
- **Génération automatique du nom produit** (`buildProductName`) : concatène dans l'ordre `catégorie, modèle, autres, devant, [extras triés par clé], couleur, taille (formatée)`, espaces normalisés.
- `countActive(v)` : nombre d'attributs actifs (utile pour badge de filtres actifs).
- `splitValues(v)` : découpe une valeur multiple stockée avec séparateur `|` en tableau de chaînes (trim + filtre des vides).
- Détection d'un "kind taille" (`isTailleKind`) par le champ `legacy === 'taille'` ou par le slug/nom contenant "taille".

#### `ProductClassificationFilterModal.tsx`
- Encapsule le sélecteur en mode `filter` pour une catégorie donnée, avec boutons "Réinitialiser" (vide tout sauf la catégorie) et "Appliquer" (renvoie la sélection au parent via `onApply`).

#### `StockListModal.tsx` (672 lignes) — export de listes de stock filtrées
- Filtre le stock par classification complète (catégorie, modèle(s), couleur(s), taille(s), devant(s), autres, extras), avec correspondance **multi-valeurs** : un produit correspond si sa description contient **au moins une** des valeurs sélectionnées pour chaque attribut (logique OU intra-attribut, ET inter-attributs).
- Catégorie "Autres" = produit ne contenant aucun des mots-clés `perruque`/`tissage`/`extension`.
- **Tri multi-critères** des résultats (`sortedResults`) : 1) catégorie (perruque < tissages < extension < autres), 2) modèle (alphabétique fr), 3) couleur (alphabétique fr), 4) taille numérique extraite de la description, 5) code produit — chaque critère inversable via `descriptionOrder` (asc/desc).
- **Totaux** : `totalQty = Σ quantity`, `totalValue = Σ (quantity * purchasePrice)`.
- **Export PDF "Liste"** (`exportPdf`, jsPDF portrait A4) : en-tête violet avec titre + date, ligne de filtres actifs, tableau (Code/Description/Qté/Prix/Valeur) avec bandes alternées, gestion de la pagination PDF automatique (`y > ph - 20` → nouvelle page), pied avec totaux (nombre de produits, quantité totale, valeur totale).
- **Export PDF "Tableau"** (`generateTableauPdf`) : génère des colonnes groupées par combinaison catégorie+modèle+couleur, chaque colonne listant les tailles disponibles triées croissant avec leurs quantités, calcul dynamique du nombre de colonnes par page selon la largeur disponible et le format papier choisi (A2 à A10, orientation paysage), total par colonne en pied de colonne.
- Formats papier proposés avec description d'usage (`PAPER_FORMATS`).

#### `PrixHistoryModal.tsx` — historique des prix d'achat d'un produit
- Source de données : `prixProductsApiService.getByProduct(productId)` (table `prixproducts.json`), triée chronologiquement.
- Sélecteur d'année (liste des années présentes dans l'historique).
- **Statistiques annuelles calculées** :
  - `minPrice`/`maxPrice` (et leurs dates d'entrée associées).
  - `avg` = moyenne simple des prix de l'année.
  - Comptage des `variationType` : `augmentation` / `diminution` / `stable`.
  - **Agrégation mensuelle** (`monthAgg`, 12 cases) : moyenne, min, max, compteur par mois, et compteurs de variations par mois.
  - **Meilleur mois d'achat** (`bestMonth`) = mois avec la moyenne de prix la plus basse (parmi les mois ayant au moins une entrée).
  - **Mois le plus cher** (`worstMonth`) = mois avec la moyenne la plus haute.
- Graphiques `recharts` : courbe d'évolution du prix sur l'année avec ligne de référence à la moyenne (`ReferenceLine`), dégradé de couleur sur la ligne (indigo→fuchsia) ; barres empilées par mois des augmentations/diminutions/stabilités.
- Timeline détaillée listant chaque achat (date, prix, badge de variation avec pourcentage et prix précédent, quantité, fournisseur).

#### `SellingPriceHistoryModal.tsx`
- Source : `product.sellingPriceHistory` (tableau `{date, price}` stocké directement sur le produit).
- Courbe simple `recharts` (LineChart vert) triée chronologiquement + liste inversée (plus récent en premier) des entrées avec date formatée et prix.
- Message si aucun historique disponible.

#### `SellingPriceOverrideButton.tsx`
- Bouton permettant de forcer/mettre à jour manuellement le prix de vente unitaire d'un produit (hors flux d'achat), avec historisation côté serveur (alimente `sellingPriceHistory`).

#### `ProductMergeModal.tsx`
- Fusionne deux fiches produits en doublon (choix du produit "maître", report du stock/historique).

#### `ProductDetailModal.tsx` / `ProductViewModal.tsx`
- Vue détaillée en lecture d'un produit : photos (slideshow), caractéristiques, prix, stock, historique achats/ventes lié, notation/commentaires clients.

#### `ProductCommentScroller.tsx` / `ProductCommentsModal.tsx`
- Défilement automatique des derniers commentaires clients sur un produit (bandeau discret dans la table) ; modale complète listant tous les commentaires/notes avec moyenne.

#### `ProductCharacteristicCard.tsx` / `CaracteristiqueModal.tsx`
- Carte compacte résumant la "caractéristique" calculée d'un produit (attributs extraits de sa description) ; modale d'édition manuelle de cette caractéristique.

#### `ProductsVenduModal.tsx`
- Modale listant les ventes historiques d'un produit donné (quantités, dates, clients).

#### `AchatVenteHistoryModal.tsx`
- Historique combiné achats + ventes d'un produit sur une timeline unique.

#### Modales de confirmation produits (`products/modals/`)
- `AddProductModal.tsx` / `EditProductModal.tsx` : formulaires complets d'ajout/édition de produit (description, prix, quantité, classification, photos, caractéristiques).
- `AddConfirmDialog.tsx` / `EditConfirmDialog.tsx` / `DeleteConfirmDialog.tsx` : confirmations génériques avant action destructive/impactante.
- `ProductViewModal.tsx` : vue complète en lecture seule.

#### `attributes/` (gestion des types d'attributs dynamiques)
- `ProductAttributeManagerButton.tsx` : bouton d'accès à la gestion des attributs (modèle, couleur, taille, devant, + attributs personnalisés).
- `ProductAttributeDialog.tsx` : CRUD des valeurs d'un type d'attribut donné (ajout/suppression/renommage d'une couleur, taille, etc.).
- `ProductAttributesToolbar.tsx` : barre d'outils regroupant les raccourcis de gestion des attributs au-dessus des tables produits.
- `ClassificationSearchPopover.tsx` : popover de recherche rapide dans les valeurs d'attributs.

#### `AddProductForm.tsx` / `EditProductForm.tsx` (formulaires dashboard, variante simplifiée)
- Formulaires rapides utilisés depuis le tableau de bord (hors module Produits complet), avec les mêmes règles de validation minimales (description obligatoire, prix/quantité numériques ≥ 0).

#### `PhotoUploadSection.tsx` / `ProductPhotoSlideshow.tsx`
- `PhotoUploadSection` : zone de dépôt/sélection de fichiers avec prévisualisation, sélection de la photo principale (`mainIndex`), suppression de photos existantes conservées (`existingUrls`).
- `ProductPhotoSlideshow` : visionneuse plein écran avec navigation entre les photos d'un produit.

---

### 7ter.6 Pagination partagée

#### `Pagination.tsx` (`src/components/shared/Pagination.tsx`) — composant réutilisable dans tout le projet
- Props : `currentPage`, `totalPages`, `onPageChange`, `totalItems?`, `itemsPerPage?`, `showFirstLast` (défaut `true`), `showItemCount` (défaut `true`), `siblingCount` (défaut `1`), `size` (`sm`/`md`/`lg`), `disabled`, `scrollTargetRef?`.
- **Algorithme de pagination compacte** (`visiblePages`) :
  - Si `totalPages <= 7` : affiche toutes les pages.
  - Sinon : affiche toujours la page 1 et la dernière page ; affiche les pages autour de la page courante dans un rayon de `siblingCount` ; insère des ellipses (`…`) quand il y a un écart entre la page 1 et le premier "sibling" (ou entre le dernier sibling et la dernière page).
- **Compteur d'éléments** (`itemCountText`) : `"{début}-{fin} sur {totalItems}"`, calculé à partir de `currentPage`/`itemsPerPage`/`totalItems`.
- **Scroll automatique** : si `scrollTargetRef` fourni, scroll fluide (`scrollIntoView({behavior:'smooth', block:'start'})`) vers l'élément cible après un changement de page.
- Boutons première/dernière page masqués sur mobile (`hidden sm:flex`), toujours visibles précédent/suivant.
- Ne s'affiche pas du tout si `totalPages <= 1`.
- Mémoïsé (`React.memo`) avec `useCallback`/`useMemo` sur les calculs de pages visibles et le texte de compteur pour éviter les recalculs inutiles.
- **Ce composant doit être utilisé partout où une pagination est nécessaire** (produits, ventes, historiques, clients) pour garantir un comportement identique.

---

### 7ter.7 Formulaires génériques et composants UI réutilisables (`dashboard/forms/`)

- `ModernButton.tsx`, `ModernActionButton.tsx`, `ModernButtonGrid.tsx` : boutons stylisés avec dégradés, icônes, effets hover/scale (`framer-motion` ou classes Tailwind `hover:scale-*`), utilisés dans tout le dashboard pour homogénéiser les actions.
- `ModernCard.tsx`, `ModernContainer.tsx` : conteneurs à coins arrondis avec dégradés thématiques (`gradient="purple"|"blue"|"green"|...`), ombres colorées, utilisés comme wrapper de sections/statistiques.
- `ModernTable.tsx` : ensemble de composants de table stylisés (`ModernTable`, `ModernTableHeader`, `ModernTableRow`, `ModernTableHead`, `ModernTableCell`) réutilisés par `SalesTable`, `ProfitCalculator`, etc., pour un rendu visuel cohérent.
- `PremiumFormStyles.tsx` : classes CSS/constantes de style partagées (dégradés, ombres) pour les formulaires premium.
- `ConfirmDeleteDialog.tsx` / `PremiumDeleteDialog.tsx` : dialogues de confirmation de suppression génériques, réutilisés par la quasi-totalité des modules (ventes, produits, comptabilité, prêts).
- `AdvancePaymentModal.tsx` : modale de saisie d'un paiement d'avance sur un prêt-produit existant (montant reçu, mise à jour du reste dû).
- `PretProduitFromSaleModal.tsx` : création d'un prêt-produit directement depuis une ligne de vente en cours de saisie.
- `modals/AddLivraisonVilleModal.tsx` / `LivraisonVilleListModal.tsx` : gestion CRUD de la table des villes de livraison et de leurs tarifs standards (utilisés pour calculer `originalDeliveryFee`).
- `modals/EchangerVentesModal.tsx` : échange de produits entre deux ventes existantes (ex. correction d'erreur de saisie).
- `modals/ReservedProductModal.tsx` : confirmation d'utilisation d'un produit marqué comme réservé dans une nouvelle vente.
- `modals/SearchSalesModal.tsx` : voir §7ter.2.

---

### 7ter.8 Autres modules du dashboard (contexte pour cohérence globale)

- `DepenseDuMois.tsx` : affiche/synthétise les dépenses (hors achats produits) du mois en cours, alimenté par la même source que `useComptabilite` (`achats` filtrés `type !== 'achat_produit'`).
- `VersementEspece.tsx` et `versement/*` : gestion des versements bancaires d'espèces (plafonds, prévisions, historique par banque) — table `VersementTable`, modales d'ajout/édition/confirmation, calcul de prévisions (`VersementForecastModal`).
- `PretFamilles.tsx`, `PretProduits.tsx`, `PretProduitsGrouped.tsx`, `prets/`, `prets-grouped/` : gestion des prêts (argent et produits), avec statuts payé/à payer/en retard, notifications de retard (`PretRetardNotification.tsx`), regroupement par client.
- `epargne/EpargneCard.tsx`, `AdminPrincipalGate.tsx` : module d'épargne, verrouillé derrière un contrôle d'accès administrateur principal.
- `MonthlyResetHandler.tsx` : logique de réinitialisation/archivage automatique des données à chaque changement de mois.
- `InvoiceGenerator.tsx` : génération de factures PDF à partir d'une vente.
- `VentesParClientsModal.tsx` / `ViewRefundsModal.tsx` : vues consolidées des ventes par client et des remboursements effectués.
- `inventory/InventoryAnalyzer.tsx` : analyse avancée du stock (produits dormants, seuils critiques).
- `ClientSearchInput.tsx`, `ProductSearchInput.tsx`, `FournisseurAutocomplete.tsx` : champs d'autocomplete réutilisés dans tous les formulaires (ventes, achats) avec recherche déclenchée à partir de quelques caractères et liste déroulante filtrée en direct.
- `StatCard.tsx`, `ActionButton.tsx` : brique de base des cartes statistiques et boutons d'action du tableau de bord principal.

---

### 7ter.9 Formulaire client (`src/components/forms/ClientForm.tsx`)
- Formulaire de création/édition d'un client : nom, un ou plusieurs téléphones, une ou plusieurs adresses, ville, photo optionnelle.
- Validation minimale : nom obligatoire ; au moins un moyen de contact recommandé mais non strictement bloquant selon le contexte d'appel.
- Soumission via `FormData` (multipart) pour supporter l'upload de photo, `POST`/`PUT /api/clients`.

---

### 7ter.10 Points d'implémentation impératifs (checklist)

1. Toujours calculer le profit avec `A = achat unitaire × qté`, `V = vente unitaire × qté`, `B = V - A`, sauf produits d'avance (quantité forcée à 0, montants bruts).
2. Reproduire fidèlement la logique de **détection des doublons clients** (signature + debounce 600ms + refs de rejet/acceptation) dans le formulaire multi-produits.
3. Toujours vérifier le stock (sauf produit d'avance) avant d'autoriser l'ajout d'une nouvelle vente ; ne jamais bloquer une **modification** de vente existante pour cause de stock.
4. Utiliser le composant `Pagination` partagé (algorithme d'ellipses identique) pour toute liste paginée.
5. Reproduire les seuils de criticité de stock identiques partout (0 = urgent/rouge, 1-2 = attention/orange, >2 = normal/vert).
6. Toute formule de comptabilité mensuelle doit suivre exactement : `beneficeReel = salesProfit - (achatsTotal + depensesTotal)`, `soldeNet = totalCredit - totalDebit` avec `totalCredit = salesTotal` et `totalDebit = achatsTotal + depensesTotal`.
7. Les filtres par attributs produits (modèle/couleur/taille/devant/extras) doivent fonctionner en **OU intra-attribut** et **ET inter-attributs**, avec support multi-sélection séparée par `|`.
8. L'historique des prix d'achat (`prixproducts`) et l'historique des prix de vente (`sellingPriceHistory`) sont deux sources de données distinctes, chacune avec sa propre modale de visualisation graphique.
9. Les produits "indisponibles" (lots d'achats avec `disponible:false`) doivent être comptabilisés séparément du stock vendable et nécessitent une action explicite de confirmation pour être réintégrés.
10. Tous les montants sont formatés en euros via `Intl.NumberFormat('fr-FR', {style:'currency', currency:'EUR'})` ; toutes les dates via `toLocaleDateString('fr-FR', ...)`.
