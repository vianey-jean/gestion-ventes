## 9bis. LOGIQUE DÉTAILLÉE — HOOKS, SERVICES, LIB, UTILS ET TYPES

Cette section documente **exhaustivement** chaque fichier de `src/hooks/`, `src/services/` (y compris `src/services/api/` et `src/services/realtime/`), `src/lib/`, `src/utils/` et `src/types/`. Toute la logique métier, les formules de calcul, les appels API, la gestion du cache/temps réel et les cas limites doivent être reproduits à l'identique.

---

### 9bis.1 `src/types/` — Modèles de données partagés

#### `src/types/auth.ts`
- `User { id, email, firstName, lastName, gender?, address?, phone?, role? }`
- `LoginCredentials { email, password }`
- `RegisterCredentials` / `RegistrationData` (identiques) : `email, password, confirmPassword, firstName, lastName, gender: 'male'|'female'|'other', address, phone, acceptTerms: boolean`
- `PasswordResetRequest { email }`, `PasswordResetData { email, newPassword, confirmPassword }`
- `AuthResponse { user: User, token: string }`

#### `src/types/client.ts`
- `Client { id, nom, phone (rétrocompat = phones[0]), phones: string[], adresse (rétrocompat = addresses[0]), addresses: string[], ville? (= villes[0]), villes?: string[], dateCreation, photo? }`
- `ClientFormData { nom, phones: string[], addresses: string[], ville?, villes?, photo?: File|null }`
- `ClientSearchResult { clients: Client[], total: number }`

#### `src/types/commande.ts`
- `CommandeReductionType = '' | 'amount' | 'percent'`
- `CommandeProduit { nom, prixUnitaire, quantite, prixVente, reduction?, reductionType?, deliveryLocation?, deliveryFee?, baseDeliveryFee? }`
- `CommandeType = 'commande' | 'reservation' | 'rdv'`
- `CommandeStatut = 'en_attente' | 'en_route' | 'arrive' | 'valide' | 'annule' | 'reporter' | 'ulterieur'`
- `Commande { id, clientNom, clientPhone, clientAddress, type, produits: CommandeProduit[], dateCommande, dateArrivagePrevue?, dateEcheance?, horaire?, horaireFin?, statut, notificationEnvoyee?, createdAt?, updatedAt?, saleId?, overdueTimerStart?, clientCaracteristique?, rdvTacheId?, reservationUlterieure?, expiresAt?, ulterieurDate?, ulterieurLastNotifiedAt?, enregistreLe?, createdByName?, createdById?, confirmationAuto? }`
  - `reservationUlterieure` : purge automatique après 10 jours si aucune bascule.
  - `expiresAt` : ISO, +10 jours après création si `reservationUlterieure`.
  - `confirmationAuto` : vrai si la réservation a été créée à moins de 24h de son échéance → le RDV est maintenu automatiquement sans demande de confirmation.
- `CommandeFormData` : sous-ensemble de `Commande` pour la création/l'édition.

#### `src/types/comptabilite.ts`
- `NouvelleAchat { id, date, productId?, productDescription, purchasePrice, quantity, fournisseur, caracteristiques, totalCost, type: 'achat_produit'|'taxes'|'carburant'|'autre_depense', description?, categorie?, receiptUrl?, disponible? (défaut true), productAchatIndex? }`
- `NouvelleAchatFormData` : champs de saisie (incluant `sellingPrice?`).
- `DepenseFormData { description, montant, type, categorie?, date?, receiptUrl? }`
- `MonthlyStats { totalAchats, totalDepenses, achatsCount, depensesCount, totalGeneral, byType: Record<string,{total,count}> }`
- `YearlyStats extends MonthlyStats { byMonth: Record<number,{achats,depenses}> }`
- `ComptabiliteData { salesTotal, salesProfit, salesCost, salesCount, achatsTotal, depensesTotal, beneficeReel, totalDebit, totalCredit, soldeNet }`

#### `src/types/depense.ts`
- `DepenseFixe { free, internetZeop, assuranceVoiture, autreDepense, assuranceVie, total }`
- `DepenseDuMois { id, description, categorie, date, debit, credit, solde }`
- `DepenseFormData { description, categorie, date, debit, credit }` (variante « dépenses fixes/mouvements », différente de celle de `comptabilite.ts`).

#### `src/types/pret.ts`
- `PretDetail { date, montant }`, `PaiementDetail { date, montant }`
- `PretFamille { id, nom, pretTotal, soldeRestant, dernierRemboursement, dateRemboursement, remboursements?: PaiementDetail[], prets?: PretDetail[] }`
- `PretProduit { id, description, nom?, date, datePaiement?, phone?, prixVente, avanceRecue, reste, estPaye, productId?, paiements?: PaiementDetail[] }`
- `PretFamilleFormData { nom, pretTotal }`
- `PretProduitFormData { description, nom, date, datePaiement?, phone?, prixVente, avanceRecue }`

#### `src/types/product.ts`
- `EncodedBarcode { v: number, s: string, p: string[], c: number }` — code-barre obfusqué.
- `ProductCaracteristique { nom, numero, codeBarre: string|EncodedBarcode, code }`
- `ProductAchat { date, quantity, purchasePrice, fournisseur?, disponible? (défaut true), nouvelleAchatId? }`
- `ProductVente { date, quantity, sellingPrice }`
- `ProductFournisseurHistory { nom, dateDebut }`
- `SellingPricePoint { price, date }`
- `Product { id, code?, description, purchasePrice, quantity, sellingPrice?, profit?, reserver? ('oui' si réservé), photos?: string[], mainPhoto?, fournisseur?, caracteristique?: ProductCaracteristique, dateAchat?, achats?: ProductAchat[], ventes?: ProductVente[], fournisseursHistory?: ProductFournisseurHistory[], sellingPriceHistory?: SellingPricePoint[] }`
- `ProductFormData { description, purchasePrice, quantity, sellingPrice?, fournisseur?, dateAchat?, newPurchase?: ProductAchat }`

#### `src/types/rdv.ts`
- `RDV { id, titre, description?, clientNom, clientTelephone?, clientAdresse?, date (YYYY-MM-DD), heureDebut (HH:mm), heureFin, lieu?, statut: 'planifie'|'confirme'|'annule'|'termine'|'reporte', produits?: RDVProduit[], commandeId?, notificationEnvoyee?, rappelEnvoye?, createdAt, updatedAt }`
- `RDVProduit { nom, quantite, prixUnitaire, prixVente }`
- `RDVFormData = Omit<RDV,'id'|'createdAt'|'updatedAt'> & { notes?: string }`
- `RDVConflict { rdv, message }`
- `RDVFromReservation { clientNom, clientTelephone, clientAdresse, date, horaire, produits, commandeId }`

#### `src/types/sale.ts`
- `SaleProduct { productId, description, quantitySold, purchasePrice, sellingPrice, profit, deliveryFee?, deliveryLocation?, reduction?, reductionType?: ''|'amount'|'percent', sellingPriceBeforeReduction?, reductionAmount?, originalDeliveryFee?, deliveryFeeAdjustment? }`
- `Sale { id, date, products?: SaleProduct[] (nouveau format multi-produits), totalPurchasePrice?, totalSellingPrice?, totalProfit?, totalDeliveryFee?, productId?/description?/quantitySold?/purchasePrice?/sellingPrice?/profit?/deliveryFee? (ancien format mono-produit), clientName?, clientAddress?, clientPhone?, clientVille?, reste?, nextPaymentDate?, isRefund?, originalSaleId? }`
  - **Important** : `sellingPrice`/`purchasePrice` sont déjà des TOTAUX (prix unitaire × quantité), jamais à re-multiplier par `quantitySold`.
- `SaleFormData { date, products: SaleProduct[], clientName?, clientAddress?, clientPhone? }`

#### `src/types/index.ts`
Ré-exporte en `export type {...}` tous les types ci-dessus depuis un point d'entrée unique `@/types`.

---

### 9bis.2 `src/services/api/api.ts` — Client HTTP central

- Instance Axios unique créée par `createApiInstance()`.
- `getBaseURL()` = `import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com'`.
- Config : `timeout: 30000`, header `Content-Type: application/json`, `withCredentials: false`.
- **Retry** via `axios-retry` : `retries: 2`, `retryDelay = 2^retryCount * 1000` (2s puis 4s), `retryCondition` = erreur réseau/idempotente OU statut 503.
- **Intercepteur requête** : injecte `Authorization: Bearer <token>` depuis `localStorage.getItem('token')` si présent.
- **Intercepteur réponse** :
  - Si `401` → supprime `token`/`user` de `localStorage` et dispatch `window.dispatchEvent(new CustomEvent('auth:logout'))` (le `AuthContext` écoute cet événement pour rediriger).
  - Sinon si `error.code !== 'ERR_NETWORK'` → `console.error('API Error:', error)`.
- Exports : `{ api, getBaseURL }` + `export default api`.

### 9bis.3 Services API (`src/services/api/*.ts`) — un module = une ressource backend

Chaque service encapsule les appels vers une route REST via l'instance `api`. Toutes les fonctions sont `async` et renvoient `response.data` (sauf indication contraire). Détail par fichier :

- **`attributKindsApi.ts`** — Gestion dynamique des types d'attributs produits (« kinds ») : `listKinds`, `createKind(nom,color?)`, `renameKind(id,nom)`, `updateKind(id,patch)`, `deleteKind(id)`, `listValues(kindId)`, `addValue(kindId,nom,description?)`, `updateValue`, `deleteValue`. Types : `AttributeKindDef { id, nom, slug, fileName, protected?, legacy?, color?, dateCreation? }`, `AttributeValue { id, nom, description?, dateCreation? }`.
- **`authApi.ts`** — `login`, `register` : stockent `token`+`user` dans `localStorage` après succès. `checkEmail`, `resetPassword`, `resetPasswordRequest` (renvoie `exists`, `false` si erreur). `verifyToken`. `getCurrentUser`/`setCurrentUser`/`logout` gèrent le localStorage directement (fonctions synchrones, pas d'appel réseau pour ces 3-là sauf verifyToken).
- **`availabilityApi.ts`** — `getSlots(date, excludeCommandeId?)` → `{busy: BusySlot[], freeSlots: FreeSlot[]}` ; `check(date,heureDebut,heureFin,excludeCommandeId?)` → `{available, conflicts}`. `BusySlot { start, end, source: 'commande'|'rdv'|'tache', label? }`.
- **`avanceApi.ts`** — Avances sur salaire : `getAll`, `getByTravailleur(id,month,year)` (query params), `create`, `delete`. `Avance { id, travailleurId, travailleurNom, entrepriseId, entrepriseNom, montant, totalPointage, resteApresAvance, pointageIds: string[], date, mois, annee, createdAt }`.
- **`beneficeApi.ts`** — CRUD `/api/benefices` avec `getByProductId` (retourne `null` si 404 catché). `Benefice` inclut `prixAchat, taxeDouane, tva, autresFrais, coutTotal, margeDesire, prixVenteRecommande, beneficeNet, tauxMarge` (+ champs de compat `purchasePrice/sellingPrice/profit/margin`).
- **`blockageIpApi.ts`** — Sécurité anti-brute-force par IP :
  - `check()` : **fetch direct** (pas via `api`, sans token) vers `GET /api/blockage-ip/check` ; si status 403 renvoie `{ip,blocked:true,reason,blockedAt:null}` depuis le JSON d'erreur, sinon `throw`.
  - `getAll()` (protégé) → `{ips: BlockedIp[], currentIp}`.
  - `add(ip,reason?)`, `update(id,{ip?,reason?})`, `setActive(id,active)` (PATCH `/active`), `remove(id)`.
  - `BlockedIp { id, ip, reason, createdAt, createdBy, active?, updatedAt? }`.
- **`clientApi.ts`** — CRUD clients + `search(query)`.
- **`commandeApi.ts`** — CRUD commandes. `create(data)` ajoute côté client `dateCommande: new Date().toISOString()` et `statut: data.type==='commande' ? 'en_route' : 'en_attente'` avant le POST. `updateStatus(id,statut)`, `markNotificationSent(id)`.
- **`comptaApi.ts`** — `getAll`, `getByMonthYear(year,month)`, `getByYear(year)`, `getYearlySummary(year)`, `calculateMonth(year,month)` (POST, recalcule un mois), `recalculateYear(year)` (POST). Types `ComptaMonthData`, `ComptaYearlySummary`.
- **`confirmationRdvApi.ts`** — Suivi de confirmation des RDV créés depuis réservation : `getAll`, `sync(entries: RDV[])` (POST bulk), `update(id,{confirmationStatut:'maintenu'|'annule'|'reporter', date?,heureDebut?,heureFin?})` (PATCH). `ConfirmationRdvEntry` porte `confirmationStatut: 'en_attente'|'maintenu'|'annule'|'reporter'` et `confirmationAuto?`.
- **`connecteProfilUniqueApi.ts`** — Session unique par profil (empêche 2 connexions simultanées) :
  - `getClientKey()` : clé stable par navigateur, générée et persistée dans `localStorage['device_client_key']` au format `dev_<rand><timestamp36>`.
  - `getDeviceContext()` : détecte `browser` (Edge/Opera/Chrome/Firefox/Safari via regex UA), `os` (Windows/macOS/Android/iOS/Linux), `device` (Mobile/Tablet/Desktop), `timezone` (Intl), et inclut `clientKey`.
  - `SESSION_ID_KEY = 'session_unique_id'` (localStorage).
  - Endpoints (`BASE='/api/connecte-profil-unique'`) : `check({userId,role?})` → `{allowed,principal,conflict?}` ; `registerLogin({userId,email?,nom?,role?})` → `{success,sessionId,entryId,principal}` ; `logout(sessionId,motif?)` ; `requestLogout(targetEntryId, 'auto'|'manuel')` → `{requestId,status,expiresAt?}` ; `requestStatus(requestId)` ; `respondLogout({sessionId?,requestId?,accept})` ; `poll(sessionId)` → `PollResult{known,forceLogout?,reason?,logoutRequest?,notifications?}` ; `list()`, `reset()`, `actives()`.
- **`depenseApi.ts`** — Deux sous-ensembles : mouvements (`getMouvements`, `createMouvement`, `updateMouvement`, `deleteMouvement`, `resetMouvements`) et dépenses fixes (`getDepensesFixe`, `updateDepensesFixe`).
- **`entrepriseApi.ts`** — CRUD `Entreprise { id, nom, adresse, typePaiement: 'journalier'|'horaire', prix, createdAt? }`.
- **`epargneApi.ts`** — Comptes d'épargne (accès admin principale) :
  - `verifyAdmin(password)` → `{ok,name?,message?}` (catch renvoie `{ok:false,message}`).
  - `getAll()` → `EpargneOwner[]` (chaque owner a `comptes: EpargneCompte[]`, `soldeTotal`; chaque compte a `operations`, `solde`, `operationsCount`).
  - CRUD owners/comptes/opérations : `createOwner`, `updateOwner`, `deleteOwner`, `addCompte`, `updateCompte`, `deleteCompte`, `addOperation({type:'versement'|'retrait',montant,date,description?})`, `updateOperation`, `deleteOperation`.
  - **Conversion devise** : `arToFmg(ar) = ar * 5` (1 Ariary = 5 Francs malgaches). `formatAr(value)` = `Intl.NumberFormat('fr-FR')` arrondi + suffixe `Ar`. `formatFmg(valueAr)` = format de `arToFmg(valueAr)` + suffixe `Fmg`.
- **`fideliteApi.ts`** — Fidélité clients avec **fallback client-side** :
  - Cache mémoire `_salesCache` avec TTL 15s (`now - at < 15000`).
  - `getAll()` : tente `GET /api/fidelite` ; si la réponse est un objet non vide, la renvoie ; sinon calcule via `buildFromSales(sales)`.
  - `buildFromSales(sales)` : groupe par nom client normalisé (`trim().toLowerCase()`), agrège `count`, `totalAmount` (somme de `totalSellingPrice ?? sellingPrice`), et liste des `sales` (triée décroissante par date) avec `profit = totalProfit ?? profit`.
  - **Aucun palier de fidélité n'est codé en dur** : `tier`/`tierLabel` restent `''` tant que non déterminés par `listesFideliteApi`.
  - `getByName(name)`, `rebuild()` (POST `/api/fidelite/rebuild`, best-effort, vide le cache local).
- **`fournisseurApi.ts`** — `getAll`, `search(query)`, `create(nom)`, `delete(id)`.
- **`historiqueConnexionApi.ts`** — `getAll()`, `logVisit(payload)` (POST `/visit`), `reset()`. `HistoriqueEntry.type ∈ {login_success, login_failed, login_locked, visit, session_login, session_logout}`.
- **`index.ts`** — Ré-export centralisé de tous les services + `api`/`getBaseURL` + `clientsVillesApi`/`livraisonVilleApi`.
- **`indisponibleApi.ts`** — Gestion des indisponibilités (créneaux bloqués récurrents ou ponctuels) :
  - `formatLocalDate(date)` : **corrige le décalage UTC** en reconstruisant `YYYY-MM-DD` à partir des getters locaux (`getFullYear/getMonth/getDate`), évite le bug « jeudi au lieu de vendredi ».
  - `getAll()`, `create({date,heureDebut?,heureFin?,motif?,journeeComplete?,exception?,recurrence?:'once'|'weekly',nombreSemaines?})` (formate la date avant POST, renvoie toujours un tableau), `update(id,{...,selectedDates?})` (formate `date` et chaque élément de `selectedDates`), `delete(id)`, `deleteGroup(groupId)`, `checkDisponibilite(date,heureDebut?,heureFin?)` → `{disponible, indisponibilites}`.
- **`listesFideliteApi.ts`** — CRUD des paliers de fidélité configurables (`FideliteTierConfig { id, label, min, max: number|null, order, grad }`). **Aucun palier par défaut** : liste vide si rien n'est configuré côté serveur.
  - `tierForCount(count, list)` : trie par `order`, retourne le premier palier tel que `count >= min && count <= (max ?? Infinity)`, ou `null`.
- **`moduleSettingsApi.ts`** — Paramètres par module (`commandes`, `pointage`, `taches`, `notes`) : `getAll`, `getModule(module)`, `updateModule(module,data)`.
- **`noteApi.ts`** — Notes (tableau Kanban) :
  - `getDrawingUrl(path)`/`getFichierUrl(path)` : construisent l'URL absolue via `getBaseURL()` si le chemin n'est pas déjà `http`/`data:`.
  - CRUD notes (`getAll,create,update,delete,move(id,columnId,order),reorder(updates[])`), upload dessin (`uploadDrawing(dataUrl)`), upload fichiers (`uploadFichier`/`uploadFichiers` en `multipart/form-data`), `deleteFichier(url)`.
  - CRUD colonnes (`getColumns,createColumn,updateColumn,deleteColumn`).
- **`noteShareApi.ts`** — `generate()` (POST, retourne `{token, createdAt}`), `revoke()`.
- **`nouvelleAchatApi.ts`** — Achats & dépenses comptables : `getAll`, `getByMonthYear(year,month)`, `getByYear(year)`, `getMonthlyStats`, `getYearlyStats`, `getById`, `create(data)`, `addDepense(data)`, `update(id,data)`, `delete(id)`, `uploadReceipt(file)`/`uploadAchatReceipt(file)` (multipart, renvoient l'URL relative).
- **`objectifApi.ts`** — Objectif de vente mensuel : `get()`, `updateObjectif(objectif)` (PUT, ne recalcule jamais), `recalculate()` (POST, recalcule depuis `sales.json`), `getHistorique()`, `saveMonthlyData()`, `resetObjectif()`.
- **`parametresApi.ts`** — `getPrixPointage`/`updatePrixPointage` (`{prixHeure, prixJournalier}`), `getParametreTache`/`updateParametreTache` (`{autoCompleteOnDone, tachesTerminees}`).
- **`pointageApi.ts`** — CRUD pointages avec filtres `getByMonth(year,month)`, `getByYear(year)`, `getByDate(date)`.
- **`pointageAutoApi.ts`** — Règles de pointage automatique (déclenché par jour/entreprise) : `jours: string[]|'toute'`, `permanentlyDisabled?`, `reactivationStartDate?`. CRUD standard.
- **`pointageAutoDeclancheApi.ts`** — Persistance du chrono multi-admin (`pointageautodeclanche.json`) : `getAll(params?)` (filtre `status/ruleId/date` en query string), `create({ruleId,date,travailleurId,entrepriseId,durationMs?})`, `update(id,{status:'validated'|'cancelled'|'pending', closedBy?})` (PATCH). Garantit qu'un chrono démarré par un admin reprend son `startedAt` pour tous les autres admins.
- **`pointageAutoSessionsApi.ts`** — Variante « sessions » du même mécanisme (`status: 'pending'|'validated'|'cancelled'`).
- **`pointageDeletedApi.ts`** — Empreintes des pointages supprimés manuellement (`{date,travailleurId,entrepriseId}`) pour empêcher le pointage auto de les recréer ; `getAll`, `add`, `remove`.
- **`prepaLivraisonApi.ts`** — Préparation de livraison : `getAll`, `sync(entries: Commande[])` (POST bulk), `setTermine(id,termine)` (PATCH). `statutLivraison: 'en_cours'|'fini'`.
- **`pretFamilleApi.ts`** / **`pretProduitApi.ts`** — CRUD prêts + `searchByName` (famille) et `transfer(fromName,toName,pretIds[])` (produit).
- **`prixProductsApi.ts`** — Historique des prix d'achat : `getAll` (déballe `{entries}`), `getByProduct(productId)`, `create(payload)`, `remove(id)`. `PrixProductEntry` inclut `variationPercent`, `variationType: 'augmentation'|'diminution'|'stable'`, `isNewProduct`.
- **`productApi.ts`** — Le plus riche :
  - CRUD standard + `generateCodesForExistingProducts()` (POST, génère les codes manquants).
  - `createWithPhotos(data, files, mainIndex=0)` : `FormData` multipart (`description, purchasePrice, quantity, fournisseur?, sellingPrice?, mainPhotoIndex, photos[]`).
  - `replacePhotos(productId, newFiles, keptExistingUrls, mainIndex=0)` : remplace toutes les photos (`photosJson` = URLs à garder, `mainPhotoIndex`, nouveaux fichiers).
  - `setAchatDisponibilite(productId, achatIndex, disponible)` : PATCH `/achats/:idx/disponibilite`. `disponible=true` **ajoute** la quantité au stock vendable, `false` la **retire**.
  - `updateAchat`, `deleteAchat`, `updateVente`, `deleteVente` (indexés par position dans les tableaux `achats[]`/`ventes[]`).
  - `updateSellingPrice(productId, sellingPrice, date?)` : PUT sur `products/:id` avec `sellingPrice` + `sellingPriceDate?` — le serveur historise automatiquement (`sellingPriceHistory`). Catch silencieux → retourne `null` en cas d'erreur.
- **`productCommentsApi.ts`** — Avis/commentaires produits publics : `getByProductId`, `create({productId,comment,rating,clientName?})`, `update`, `delete`, `deleteMany(ids[])` (DELETE bulk), `deleteByProductId`.
- **`profileApi.ts`** — Profil utilisateur connecté : `getProfile`, `updateProfile(data)`, `uploadPhoto(file)` (utilise **`fetch` direct**, pas `api`, avec header `Authorization` manuel — car `FormData` + `fetch` évite les soucis de `Content-Type` avec axios), `changePassword({currentPassword,newPassword,confirmPassword})`, `getPhotoUrl(path)` (concatène `getBaseURL()+path`).
- **`rdvApi.ts`** — CRUD RDV + `search(query)`, `getByWeek(startDate,endDate)`, `checkConflicts(date,heureDebut,heureFin,excludeId?)`.
- **`rdvNotificationsApi.ts`** — Notifications de rappel RDV (24h avant) : `getAll`, `getUnread`, `getUnreadCount`, `checkAndCreate()` (POST, scanne les RDV à J-1 et crée les notifs manquantes), `markAsRead(id)`, `delete(id)`, `getByRdvId(rdvId)` (renvoie `null` si erreur), `updateStatus(rdvId,status)`, `updateByRdvId(rdvId,data)`, `deleteByRdvId(rdvId)`. `statut ∈ {actif,reporte,valide,annule}`.
- **`rdvTachesApi.ts`** — RDV liés au module Tâches/Pointage (`rdv-taches.json`), avec panier produits (`RdvProduit[]` incluant `prestationFee?`). `getAll`, `getByMonth`, `getByDate`, `getFreeSlots(date)`, `create`, `update`, `delete`, `updateByCommande(commandeId,data)`, `deleteByCommande(commandeId)`. `statut ∈ {planifie,confirme,annule,reporte,termine}`.
- **`remboursementApi.ts`** — `getAll`, `getByMonth(month,year)`, `searchSalesByClient(clientName)`, `create(data)`, `delete(id)`.
- **`saleApi.ts`** — CRUD ventes. **Après chaque mutation** (`create`/`update`/`delete`), dispatch `window.dispatchEvent(new CustomEvent('sales-updated', {detail:{type,...}}))` pour notifier les composants qui doivent recalculer les bénéfices annuels (ex. `ObjectifStatsModal`). `getByMonth(month,year)`, `exportMonth(month,year)` (POST, snapshot mensuel).
- **`settingsApi.ts`** — Paramètres globaux de l'app (`AppSettings` : notifications, display, security, backup). `getSettings()` → `{settings, isAdmin}`. `backupData(encryptionCode)` (POST, backup chiffré AES-256). `restoreData(encryptedData, decryptionCode)` → `{success,message,status?:'updated'|'unchanged',updatedFilesCount?,unchangedFilesCount?,totalAddedEntries?}`. `deleteAllData(password)`, `verifyPassword(password)`, `autoBackup(encryptionPassword)`.
- **`shareCommentsApi.ts`** — Commentaires sur liens partagés (workflow visiteur externe) :
  - Public (via `fetch` direct, pas de token) : `submit(token,{nom,prenom,telephone,email,comments:CommentItemData[],generalComment,allItems?})` → POST `/submit/:token` ; `send(id)` → POST `/send/:id` (déclenche génération snapshot HTML) ; `check(token)` → `{hasCommented, status}`.
  - Authentifié : `list(type?)`, `unread()` → `UnreadCounts{notes,pointage,taches,total}`, `markRead(id)` (PATCH), `detail(id)`, `syncHtml()` (régénère les HTML manquants), `exportJson()`/`importJson(comments)`, `delete(id)` (doit être lu au préalable), `snapshotUrl(filename)`.
- **`shareLinksApi.ts`** — Génération de liens de partage : `generate(type,filters?)` → `{token,accessCode,type,createdAt}`, `list(type?)`, `revoke(id)`. Public : `verify(token,accessCode)` (fetch direct, POST, jette une erreur si code faux), `viewData(token)` (fetch direct, jette si accès refusé).
- **`tacheApi.ts`** — CRUD tâches + `getByDate`, `getByMonth`, `getByWeek`.
- **`tachesRdvApi.ts`** — Catalogue de types de tâches RDV réutilisables (`TacheRdvCatalog`).
- **`travailleurApi.ts`** — CRUD travailleurs (`genre: 'homme'|'femme'`, `role?: 'administrateur'|'autre'`) + `search(query)`.
- **`villesApi.ts`** — `clientsVillesApi` (liste de villes clients, CRUD par nom de ville) et `livraisonVilleApi` (villes + frais de livraison associés `LivraisonVille{ville,fee}`).

### 9bis.4 Services racine (`src/services/*.ts`)

- **`BusinessCalculationService.ts`** — Objet figé (`Object.freeze`) de fonctions **pures** de calcul commercial :
  - `calculateProfit({sellingPrice,purchasePrice,quantity}) = (sellingPrice - purchasePrice) * quantity`.
  - `calculateMargin({profit,cost}) = cost>0 ? (profit/cost)*100 : 0`.
  - `calculateTotalCost({purchasePrice,customsTax,vat,otherFees})` : `vatAmount = purchasePrice*vat/100` ; total = `purchasePrice + customsTax + vatAmount + otherFees`.
  - `calculateRecommendedPrice(totalCost, desiredMargin) = totalCost * (1 + desiredMargin/100)`.
  - `calculateSalesStatistics(sales[])` → `{totalProfit, averageProfit, totalRevenue, averageRevenue}` (0 partout si liste vide).
  - `validateCalculationInput(input)` : vérifie que `sellingPrice≥0`, `purchasePrice≥0`, `quantity>0`, tous `Number.isFinite`.
- **`FormatService.ts`** — Objet figé de fonctions pures de formatage :
  - `formatCurrency(amount, currency='EUR', locale='fr-FR')` (fallback `"X.XX EUR"` si `Intl` échoue, `'0,00 €'` si NaN/Infinity).
  - `formatDate(date, format='short'|'medium'|'long'|'full', locale='fr-FR')` (fallback `'Date invalide'`).
  - `formatNumber(number, decimals=0, locale)`.
  - `formatPercentage(ratio, decimals=1, locale)` (0.5 → 50%).
  - `formatFileSize(bytes, decimals=1)` : divise successivement par 1024, unités `[B,KB,MB,GB,TB]` via `Math.floor(log(bytes)/log(1024))`.
  - `formatDuration(seconds)` → chaîne `"2h 30m 15s"` (n'affiche que les unités non nulles, toujours au moins les secondes).
  - `truncateText(text, maxLength, suffix='...')`.
  - `capitalize(text)`.
  - `formatFullName(firstName,lastName)` → capitalise chaque partie, `'Nom non renseigné'` si les deux sont vides.
- **`apiReachability.ts`** — Sonde de disponibilité serveur, pour **ne jamais ouvrir de SSE si l'API est injoignable** (évite les erreurs CORS répétées « Blocage d'une requête multiorigine »).
  - Cache 30s (`CACHE_MS=30000`), déduplication des appels concurrents via `inFlight`.
  - `isApiReachable()` : si `navigator.onLine===false` → `false` immédiat. Sinon `fetch(getSseBaseURL()+'/api/health')` avec `AbortController` (timeout 8s), `cache:'no-store'`, `credentials:'omit'`. Retourne `res.ok`.
  - `resetApiReachability()` remet le cache à zéro.
- **`dataOptimizationService.ts`** — Classe `DataOptimizationService` avec cache mémoire TTL (`DEFAULT_TTL = 5 min`) et **deep-freeze** des données mises en cache (garantit l'immutabilité) :
  - `optimizeSalesCalculations(sales)` : clé de cache = `sales-calc-<length>-<hash>` où le hash = `sales.map(s=>id-profit).sort().join(',').slice(0,100)`. Calcule `totalProfit`, `totalRevenue` (somme de `sellingPrice`, **pas** multiplié par quantité — cohérent avec le format « total »), `totalQuantity`, `averageProfit`, `topProducts` (top 5 par `revenue`, agrégés par `productId`), `salesByDate` (groupé par date ISO, `revenue += sellingPrice*quantitySold`, `profit`, `quantity`, `count`).
  - `optimizeProductData(products)` : `totalValue = Σ purchasePrice*quantity`, `availableProducts` (`quantity>0`), `lowStockProducts` (`0<quantity≤5`), `outOfStockProducts` (`quantity===0`), `totalItems = Σ quantity`, `categories` (classement par mots-clés dans la description : perruque/tissage/extension/accessoire/Autres).
  - `cleanExpiredCache()` appelé toutes les 10 min via `setInterval`.
  - Hooks exportés `useOptimizedSalesData(sales)` / `useOptimizedProductData(products)` = `useMemo` autour du service.
- **`optimizedRealtimeService.ts`** — **Ancienne implémentation** (remplacée par `realtime/RealtimeService.ts` mais toujours présente) : SSE avec heartbeat 30s, reconnexion avec `retryDelays=[1000,2000,4000,8000,16000]` (`maxReconnectAttempts=5`), `handleVisibilityChange` (pause/reprise selon visibilité de l'onglet), `syncCurrentMonthData()` (5 requêtes parallèles `Promise.allSettled`), fallback en mode polling 60s si SSE définitivement KO. Non utilisée activement par les hooks actuels (ils importent `realtimeService` depuis `./realtimeService`).
- **`rdvFromReservationService.ts`** — Conversion Commande → RDV :
  - `convertCommandeToRdv(commande)` : `heureDebut = commande.horaire || '09:00'` ; `heureFin` = `commande.horaireFin` sinon `+1h` calculée manuellement (modulo 24). Titre = `"Réservation: <produits>"` ou `"Commande: <produits>"` (tronqué à 50 caractères). Description = liste des produits avec `x<quantite>` et prix en `Ar`.
  - `createRdvFromCommande(commande)` : vérifie d'abord qu'aucun RDV n'existe déjà pour `commande.id` (sinon retourne `false`), puis crée.
  - `updateRdvFromCommande(commande)` : crée si absent, sinon met à jour le RDV existant.
  - `deleteRdvFromCommande(commandeId)`.
- **`reservationRdvSyncService.ts`** — Synchronisation **unidirectionnelle** réservation → RDV.
  - `STATUS_MAPPING` (table figée) :
    | Commande statut | RDV statut |
    |---|---|
    | en_attente | planifie |
    | en_route | confirme |
    | arrive | confirme |
    | valide | termine |
    | annule | annule |
    | reporter | reporte |
    | ulterieur | planifie |
  - `mapStatusToRdv(statut)` → lookup dans la table, défaut `'planifie'`.
  - `syncRdvStatus(commandeId, newStatus)` : `PUT /api/rdv/by-commande/:id {statut}`. Si 404 → pas d'erreur critique, retourne `false`.
  - `syncRdvReport(commandeId, newDate, newHoraire)` : recalcule `heureFin = +1h`, PUT avec `{date,heureDebut,heureFin,statut:'reporte'}`.
  - `hasLinkedRdv(commandeId)` : cherche dans `GET /api/rdv` si un RDV a ce `commandeId`.
- **`sseBase.ts`** — Détermine la base URL des connexions SSE/health pour **éviter le CORS** :
  - `hasSameOriginProxy()` : vrai si `hostname` ∈ {`localhost`,`127.0.0.1`} ou contient `lovableproject.com`/`lovable.app`/`vercel.app`.
  - `getSseBaseURL()` : retourne `''` (URL relative, passe par le proxy same-origin) si `hasSameOriginProxy()`, sinon `getBaseURL()`.
- **`syncService.ts`** — Simple ré-export de compatibilité : `syncService = realtimeService`, `export default realtimeService`.
- **`realtimeService.ts`** — Point d'entrée qui ré-exporte `realtimeService` depuis `./realtime/RealtimeService` (module actif, voir 9bis.5) + types `SyncData`/`SyncEvent`.

### 9bis.5 `src/services/realtime/` — Architecture SSE (push, sans polling)

#### `types.ts`
- `SyncData { products, sales, pretFamilles, pretProduits, depenses, achats, clients, messages }` (tous `any[]`).
- `SyncEvent { type: 'data-changed'|'force-sync'|'connected'|'disconnected'|'heartbeat', data?: {type:string,data:any}, timestamp: number }`.
- `ConnectionConfig { reconnectInterval, maxReconnectAttempts, connectionTimeout, fallbackSyncInterval }`.

#### `DataCacheManager.ts`
- `hasDataChanged(dataType, newData)` : compare `JSON.stringify(newData)` avec la dernière valeur en cache pour ce type ; met à jour le cache et renvoie `true` si différent (ou si absent), `false` sinon.
- `updateCache(dataType, data)`, `clearCache()`.

#### `EventSourceManager.ts` — Gestion bas niveau de l'`EventSource`
- **Connexion différée** : `connect()` attend `window load` (+ 500ms) si le document n'est pas encore `complete`, pour éviter les warnings navigateur « connexion interrompue pendant le chargement ».
- `_doConnect()` :
  1. Vérifie `isApiReachable()` avant d'ouvrir la connexion ; si non joignable → `onConnectionChange(false)` + planifie une reconnexion.
  2. URL = `${getSseBaseURL()}/api/sync/events`.
  3. `new EventSource(url, {withCredentials:false})`.
  4. Écoute les événements nommés : `connected` (reset `reconnectAttempts=0`), `data-changed` (parse `{type,data}` et transmet), `force-sync`, `heartbeat` (keep-alive, no-op), `auto-backup-state` (géré ailleurs), `share-comment-received` (redispatché en `CustomEvent` sur `window` pour découpler des composants React).
  5. `onerror` : marque déconnecté, ferme et nettoie l'`EventSource`, planifie une reconnexion sauf si `intentionalDisconnect`.
- `scheduleReconnect()` : backoff linéaire plafonné = `min(reconnectInterval * reconnectAttempts, 30000)` ms ; abandonne après `maxReconnectAttempts` (loggue un warning).
- `disconnect()` : marque `intentionalDisconnect=true` (empêche toute reconnexion en cours), annule le timer, ferme l'`EventSource`.

#### `RealtimeService.ts` — Façade unique consommée par les hooks
- **Aucun polling périodique** : tout est piloté par les événements SSE reçus.
- `connect(token?)` / `disconnect()` utilisent un **compteur de consommateurs** (`activeConsumers`) : la connexion SSE réelle n'est établie qu'au premier appelant et n'est fermée qu'au dernier (permet à plusieurs hooks d'appeler `connect()` sans conflits).
- `handleSyncEvent(event)` :
  - `data-changed` : si `dataCacheManager.hasDataChanged(type,data)` (déduplication), met à jour `lastSyncTime` et appelle `processSyncData(type,data)`.
  - `force-sync` : force un rechargement complet via `syncCurrentMonthData()`.
- `processSyncData(dataType, data)` — mapping type serveur → clé `SyncData` : `products→products`, `sales→sales` (filtré au mois courant via `filterCurrentMonthSales`), `pretfamilles→pretFamilles`, `pretproduits→pretProduits`, `depensedumois→depenses`, `nouvelle_achat→achats`, `clients→clients`, `messages→messages`.
- `syncCurrentMonthData()` : 8 requêtes `Promise.allSettled` en parallèle (`products, sales, pretfamilles, pretproduits, depenses/mouvements, nouvelle-achat/monthly/<year>/<month>, clients, messages`), tolérantes aux échecs individuels (`[]` par défaut). Met aussi à jour `dataCacheManager` pour chaque type.
- `addDataListener(cb)` / `addSyncListener(cb)` retournent une fonction de désinscription.
- `forceSync()` : `POST /api/sync/force-sync` ; en cas d'échec, fallback sur `syncCurrentMonthData()` local.
- Export : singleton `export const realtimeService = new RealtimeService();`.

---

### 9bis.6 `src/hooks/` — Hooks personnalisés

#### `index.ts`
Ré-export centralisé : `useClients`, `useClientsPagination`, `useProducts`, `useSales`, `useCommandes`, `useCommandesFilter`, `useCommandeCart`, `useClientSync`, `useBusinessCalculations`, `useAuth` (depuis `AuthContext`), `useToast`, `useIsMobile`.

#### `use-auto-logout.tsx` — `useAutoLogout()`
- Deux minuteurs indépendants basés sur des paramètres récupérés via `GET /api/profile/timeout-settings` (fallback `localStorage['timeout_settings']`, défauts `{active:10 min, timeout:7h}`).
- **Timer d'inactivité** (`resetInactivityTimer`) : réinitialisé à chaque événement `mousedown|mousemove|keypress|scroll|touchstart|click`. Avertissement affiché 1 minute avant expiration (`warningMs = inactivityMs - 60000`), avec compte à rebours seconde par seconde. À expiration : `logout()`, navigation vers `/`, toast destructif.
- **Timer de session max** : avertissement 10 minutes avant expiration (`timeoutMs - 10*60*1000`), rafraîchi toutes les 30s. À expiration : `logout()` + navigation + toast.
- Écoute l'événement custom `timeout:updated` (déclenché ailleurs après modification des paramètres) pour recharger `settings` depuis `localStorage`.
- Persiste les pages visitées dans `localStorage['visited_pages']` (liste dédupliquée).
- Retourne `{sessionWarningVisible, sessionMinutesLeft, inactivityWarningVisible, inactivitySecondsLeft, extendSession, settings}`.

#### `use-chat-notification.ts`
- `playNotificationSound()` : génère un carillon 3 notes ascendantes (C6→E6→G6, fréquences 1047/1319/1568 Hz) + harmoniques douces (G7/C7) via Web Audio API (`OscillatorNode`+`GainNode`, enveloppe `linearRampToValueAtTime`/`exponentialRampToValueAtTime`). Ferme le contexte audio après 1200ms.
- `useChatNotification()` : `notify(sender,message)` joue le son, tronque le message à 60 caractères (+ `...`), stocke la notif dans un `ref` (pas de state → pas de re-render), auto-supprime après 5s. `dismiss(id)` retire manuellement.

#### `use-currency-formatter.ts`
- `useCurrencyFormatter()` : `formatEuro(amount)` via `Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'})`. Alias `formatCurrency = formatEuro`.

#### `use-error-boundary.tsx`
- Contexte React `ErrorBoundaryProvider` : `reportError(error, context?, severity='medium')` ajoute une entrée à `errors[]` (id, message, stack, timestamp, context, severity), affiche un toast destructif si `severity ∈ {high,critical}`, log console.
- `useAsyncError()` : wrapper qui catch une promesse, appelle `reportError` et renvoie une valeur de repli (`fallback`) en cas d'échec.

#### `use-messages.ts` — `useMessages()`
- CRUD messagerie interne : `fetchMessages`, `fetchUnreadCount`, `markAsRead/markAsUnread` (mise à jour optimiste locale + compteur), `deleteMessage` (décrémente le compteur si le message n'était pas lu), `sendMessage`.
- Écoute `realtimeService.addDataListener` : filtre `data.messages` par `destinataireId === user.id`, recalcule `unreadCount`.
- Chargement initial déclenché par `isAuthenticated`.

#### `use-mobile.tsx`
- `useIsMobile()` : `matchMedia('(max-width: 767px)')`, écoute `change`. `useMobile` = alias.

#### `use-professional-data.tsx`
- `useProfessionalData()` : placeholder mémoïsé (vide).
- `usePaginatedData(data, pageSize=10)` : calcule `totalPages`.
- Ré-exporte `useOptimizedSalesData`/`useOptimizedProductData` depuis `dataOptimizationService`.

#### `use-realtime-sync.ts` — `useRealtimeSync({enabled=true})`
- **Pas de polling** : synchronisation pilotée par SSE. Fournit uniquement `forceSync()` (échappatoire manuelle) et une synchro unique lors du retour au premier plan de l'onglet (`visibilitychange`).
- **Protection de formulaire globale** (module-level, hors composant) : `setFormProtection(active)` / `isFormProtected()`. Quand activée, bloque `forceSync` pendant jusqu'à **2 heures** (`formProtectionTimeout`), pour éviter d'écraser un formulaire en cours de saisie lors d'une synchro.
- `forceSync()` : no-op si `globalFormProtection` actif ou si `refreshData` (du `AppContext`) absent.

#### `use-sse.ts` — `useSSE(url, options)`
- Hook générique de connexion `EventSource` avec `token` en query string (`?token=<token>`), reconnexion auto (`autoReconnect=true`, `reconnectInterval=3000`ms par défaut). Écoute `onmessage` + événements nommés `data-changed`/`force-sync`/`connected`. Expose `{isConnected, lastEvent, connect, disconnect}`.

#### `use-toast.ts`
- Implémentation shadcn/ui classique avec **`TOAST_LIMIT = 1`** (un seul toast visible à la fois) et `TOAST_REMOVE_DELAY = 1000000` ms (quasi jamais auto-supprimé automatiquement, dismiss explicite requis). Store global (`memoryState` + `listeners[]`), reducer `ADD_TOAST/UPDATE_TOAST/DISMISS_TOAST/REMOVE_TOAST`. `toast(props)` retourne `{id, dismiss, update}`.

#### `use-visit-logger.ts` — `useVisitLogger(user?)`
- Trace la première visite de session (une fois, clé `sessionStorage['visit_logged']`) et chaque nouveau chemin de route (déduplication via `sessionStorage['visit_pages_logged']`, `Set` de pathnames).
- `sessionId` stable généré (`Date.now().toString(36) + random`) et stocké dans `sessionStorage['visit_session_id']`.
- Envoie `historiqueConnexionApi.logVisit({...userPayload, message, page, referrer?, sessionId})`.

#### `useAttributeKinds.ts` — `useAttributeKinds()`
- Gère les types d'attributs produits dynamiques. Écoute l'événement custom `window` `attribut-kinds-changed` (émis par `notifyKindsChanged()`) pour se resynchroniser entre composants sans prop-drilling. CRUD (`createKind, renameKind, updateKind, deleteKind`) qui appelle `notifyKindsChanged()` après chaque mutation.

#### `useBusinessCalculations.ts` — `useBusinessCalculations(sales)`
- `useMemo` pur et immuable (`Object.freeze`). Retourne `{totalRevenue: Σ sellingPrice*quantitySold, totalProfit: Σ profit, totalQuantity: Σ quantitySold, averageProfit: totalProfit/count, averageMargin: totalRevenue>0 ? (totalProfit/totalRevenue)*100 : 0, salesCount}`. Tout à 0 si `sales` vide.
  - ⚠️ Ce hook utilise l'ancien format (multiplie par `quantitySold`), contrairement à `useYearlyData.getSaleValues` qui traite les totaux déjà agrégés — à utiliser seulement sur des `Sale` mono-produit legacy.

#### `useClientSync.ts` — `useClientSync()`
- Variante « bas niveau » de `useClients` qui appelle directement `axios` (pas `clientApiService`) avec l'URL `VITE_API_BASE_URL` et le token du `localStorage`. Normalise chaque client via `normalizeClient` (garantit `phones` = tableau, `phone` = `phones[0]`).
- Compare `JSON.stringify` de l'ancien vs nouveau tableau pour éviter les re-renders inutiles (`lastDataRef`).
- Écoute `realtimeService.addDataListener` (`data.clients`) et `addSyncListener` (`force-sync` → refetch).
- `searchClients(query)` : filtre local si `query.length>=3` uniquement (sinon `[]`).

#### `useClients.ts`
- `useClients()` : CRUD complet via `clientApiService`, mêmes patterns de dédup (`lastDataRef`, `hasInitialLoad`), toasts de succès/erreur systématiques, refetch après chaque mutation. `isLoading` exposé = `isLoading && !hasInitialLoad` (évite un flash de loading après le premier chargement).
- `useClientsPagination(clients, itemsPerPage=20)` : filtre par recherche (nom/téléphone/adresse) si `searchQuery.length>=3`, pagine (`totalPages = ceil(length/itemsPerPage)`), réinitialise `currentPage=1` quand la recherche change, corrige `currentPage` si hors bornes après filtrage.

#### `useCommandes.ts`
- `useCommandes()` : charge en parallèle commandes/clients/produits (`Promise.all`). `createCommande` : crée le client s'il n'existe pas (comparaison insensible à la casse), crée chaque produit manquant, puis crée la commande. `updateCommande`/`deleteCommande`/`validateCommande` (= update statut `valide`)/`cancelCommande` (= update statut `annule`).
- `useCommandesFilter(commandes, searchQuery, sortDateAsc)` : si recherche <3 caractères, exclut `valide`/`annule` (vue "actives"). Sinon montre tout et filtre par nom/téléphone/produit. Tri par date (`dateArrivagePrevue` pour type commande, `dateEcheance` sinon) puis par `horaire` (défaut `'23:59'` si absent) en cas d'égalité.
- `useCommandeCart()` : gestion locale du panier de produits pour le formulaire (`addProduit` gère à la fois ajout et édition via `editingIndex`), `removeProduit` réajuste `editingIndex` si nécessaire, toasts à chaque action.

#### `useCommandesLogic.ts` — **Hook métier central de la page Commandes** (le plus volumineux, 1615 lignes)
Ce hook porte **toute** la logique de gestion des commandes/réservations/RDV. Points clés :

**États** : formulaire complet (client, type, dates, produits avec réduction/livraison), recherche/tri, modales (suppression, validation, annulation, export PDF, report, planification d'arrivée, réservation ultérieure, conflit de tâche, réservation en retard).

**Chargement des données** : `fetchCommandes/fetchClients/fetchProducts/fetchSales` (appels directs `api.get`), chargées en parallèle au montage. `setInterval(checkNotifications, 60000)`. Connexion SSE via `realtimeService` : sur `data-changed` avec `type ∈ {commandes,sales,clients,products}`, refetch ciblé ; sur `force-sync`, refetch commandes.

**Détection des réservations en retard** (`checkOverdue`, toutes les 60s) :
- Une réservation est « en retard » si `type==='reservation'`, statut ∉ {valide, annule}, non déjà traitée (`overdueProcessedIds`), et `now - (dateEcheance + horaire début)  ≥ 30 minutes`.
- Persiste `overdueTimerStart` en base dès détection (survit à un rafraîchissement de page).
- Ouvre `showOverdueModal` avec 3 handlers : `handleOverdueValidate` (auto-valide comme une vente, calcule les réductions, dé-réserve le stock), `handleOverdueCancel` (annule + sync RDV/tâche), `handleOverduePostpone` (ouvre la modale Reporter).

**Verrouillage lié à la confirmation RDV** (`computeLockStateForCommande` de `rdvConfirmationLock.ts`) : recalculé toutes les 60s (`lockTick`), auto-annule côté serveur les commandes qui passent à l'état `hidden`. `filteredCommandes` masque les commandes à l'état `hidden`.

**Formule de calcul du prix de vente lors d'une validation** (`confirmValidation`, `handleOverdueValidate` — logique dupliquée à l'identique) :
```
rawSelling = prixVente * quantite
reduc = 0
si (reduction > 0 && reductionType):
   si reductionType === 'percent' : reduc = (prixVente * reduction / 100) * quantite
   sinon (amount)                : reduc = reduction * quantite
sellingPrice = max(0, rawSelling - reduc)
purchasePrice = prixUnitaire * quantite
profit = sellingPrice - purchasePrice
deliveryFee = Number(deliveryFee || 0)
deliveryLocation = deliveryLocation || "Saint-Denis"
```
Le total de la vente = somme de `sellingPrice`/`purchasePrice` sur tous les produits ; `totalProfit = totalSellingPrice - totalPurchasePrice`.

**Machine à états des statuts** (`handleStatusChange`) :
- `ulterieur → en_attente` : ouvre la modale de planification (`ulterieurTransitionId`), ne change rien directement.
- `→ arrive` (uniquement type `commande`) : bloqué si un produit n'a pas assez de stock **disponible** (`product.quantity < quantite demandée`) — message détaillant le stock manquant et les quantités « en attente d'arrivage » (achats marqués `disponible:false`). Si OK, ouvre la modale de planification d'arrivée (`arriveePlanifId`) au lieu de changer directement le statut.
- `→ valide` (type `commande`) : bloqué si le statut courant n'est pas `arrive`.
- `→ valide` / `→ annule` / `→ reporter` : ouvrent leurs modales de confirmation respectives plutôt que d'agir immédiatement.
- Si le statut courant était `valide` avec un `saleId` et qu'on change vers autre chose : supprime la vente associée (`DELETE /api/sales/:saleId`) et remet `saleId:null`.
- Sinon PUT direct du nouveau statut ; si `type==='reservation'`, synchronise le RDV lié (`reservationRdvSyncService.syncRdvStatus`) et la tâche liée (`syncTacheForCommande`).

**`confirmArriveePlanification({date,heureDebut,heureFin})`** : passe la commande à `arrive` avec les nouvelles date/horaires, puis crée **en parallèle et de façon tolérante aux erreurs** : (1) un RDV dans `rdv-taches.json` (statut `planifie`), (2) un RDV dans `rdv.json` (pour le composant `ConfirmationRdvButton`, verrouillage 24h/1h), (3) une tâche liée (`importance:'pertinent'`).

**`syncTacheForCommande(commandeId, statut, newDate?, newHoraire?)`** :
- `valide` → marque la tâche `completed:true`, `heureFin` = heure actuelle, retire le préfixe `[ANNULÉ] `.
- `annule` → `completed:true` + préfixe `[ANNULÉ] ` ajouté à la description.
- `reporter` (avec `newDate`) → change `date/heureDebut/heureFin` (fin = début +1h), `completed:false`, retire le préfixe annulé.

**Réservation ultérieure** (`type==='reservation'` + `ulterieurConfig`) : statut forcé à `'ulterieur'`, `reservationUlterieure:true`, `expiresAt` = +10 jours ISO. Mode `'date'` fixe `ulterieurDate`+`dateEcheance`, mode `'inconnu'` laisse `dateEcheance=''`. Bascule vers `en_attente` via `confirmUlterieurTransition(payload)` qui propose ensuite la création du RDV lié.

**Maintien automatique** (`confirmationAuto`) : si une réservation est créée avec `dateEcheance` à **moins de 24h** de l'instant présent, `commandeData.confirmationAuto = true` (aucune demande de confirmation RDV, le RDV créé passera directement au statut `confirme`).

**Détection de doublon** : lors de la création d'une réservation, refuse si un autre enregistrement actif (non valide/annulé) du même client, à la même `dateEcheance`, partage au moins un nom de produit.

**Gestion du panier** (`handleAddProduit`) : vérifie le stock disponible + en attente d'arrivage (`getAvailableQuantityForProduct` + `getPendingQuantityForProduct`), bloque si `quantiteInt > totalPossible`, avertit (sans bloquer) si une partie de la commande utilise un achat en attente. Persiste un nouveau prix de vente saisi via le bouton "+" (`prixVenteOverride`) dans `products.json`.

**Export PDF** (`handleExportPDF`) : génère un tableau `jsPDF`+`autotable` (portrait A4) des commandes/réservations d'une date donnée (colonnes Client/Contact/Produit/Prix/Date-Horaire), fond violet (`[147,51,234]`) pour l'en-tête, lignes alternées en violet clair.

**Création RDV depuis réservation** (`handleCreateRdvFromReservation`) : calcule `heureFin` (soit `horaireFin`, soit +1h), statut initial = `'confirme'` si `confirmationAuto`, sinon `'planifie'`. Tente ensuite de créer la tâche correspondante ; en cas de conflit horaire (409) avec une tâche non `pertinent`, propose `handleRescheduleTacheAndCreate` (déplace la tâche conflictuelle puis crée) ou `handleSkipTacheConflict` (RDV sans tâche).

#### `useComptabilite.ts` (755 lignes) — Hook métier de la page Comptabilité
- Sélection de période (`selectedMonth/selectedYear`), chargement des achats via `nouvelleAchatApiService.getByMonthYear` + écoute SSE filtrée par mois/année (`realtimeService.addDataListener` sur `data.achats`).
- Chargement fournisseurs (`fournisseurApiService`) avec autocomplete filtré par préfixe.
- **`comptabiliteData` (useMemo)** — Formules :
  ```
  salesTotal  = Σ (products ? totalSellingPrice : sellingPrice*quantitySold)
  salesCost   = Σ (products ? totalPurchasePrice : purchasePrice*quantitySold)
  salesProfit = Σ (products ? totalProfit : profit)
  achatsTotal    = Σ totalCost des achats de type 'achat_produit'
  depensesTotal  = Σ totalCost des achats de type ≠ 'achat_produit'
  beneficeReel = salesProfit - (achatsTotal + depensesTotal)
  totalCredit = salesTotal
  totalDebit  = achatsTotal + depensesTotal
  soldeNet    = totalCredit - totalDebit
  ```
- **Sauvegarde auto** (`saveComptaData` → `comptaApiService.calculateMonth`) : déclenchée par un `useEffect` qui compare une **signature** (`year|month|salesTotal|salesProfit|achatsTotal|depensesTotal|achats.length`) au dernier hash sauvegardé (`lastSavedSignatureRef`), pour éviter les appels redondants.
- **`monthlyChartData`** : pour chacun des 12 mois de `selectedYear`, calcule `beneficeVentes` (profit des ventes du mois), `depenses` (Σ `totalCost` des achats du mois), `beneficeReel = beneficeVentes - depenses`.
- **`depensesRepartition`** : regroupe `totalCost` par libellé (`Achats Produits`/`Taxes`/`Carburant`/`Autres`) → data pour graphique en camembert.
- **`handleSubmitAchat`** — Séquence complète à la création d'un achat :
  1. Upload facultatif de la facture d'achat (`nouvelleAchatApiService.uploadAchatReceipt`), tolérant à l'échec (toast d'avertissement, achat quand même enregistré).
  2. `nouvelleAchatApiService.create(...)` (crée/actualise le produit côté serveur).
  3. Enregistrement dans l'historique des prix (`prixProductsApiService.create`) avec `previousPrice` = ancien prix du produit sélectionné.
  4. Si l'utilisateur a modifié les photos (`pendingPhotosTouched`) : `productApiService.replacePhotos` sur le produit existant ou nouvellement créé (`createdAchat.productId`).
  5. Si un nouveau prix de vente > 0 est saisi : `productApiService.updateSellingPrice`.
  6. Toast différent si produit existant (« Stock mis à jour ») vs nouveau produit créé.
  7. Réinitialisation complète du formulaire + rechargement (`loadAchats`, `fetchProducts`, `loadFournisseurs`).
- **`handleSubmitDepense`** : upload facultatif du reçu puis `nouvelleAchatApiService.addDepense`.
- `handleUpdateAchat`/`handleDeleteAchat` : CRUD + toasts + rechargement produits.

#### `useLightMotion.ts` — `useLightMotion()`
- Détecte **une seule fois au montage** (état initial calculé en lazy-init) si l'appareil doit recevoir une version allégée des animations : `prefers-reduced-motion: reduce`, ou écran `<1024px`, ou `navigator.hardwareConcurrency ≤ 4`. Retourne `{light: boolean, particleCount: light ? 0 : 18}`.

#### `useObjectif.ts`
- `fetchObjectif` (`objectifApi.get`, recalcule automatiquement côté serveur depuis `sales.json`), `updateObjectif` (ne recalcule PAS après, pour ne pas écraser la valeur personnalisée), `recalculate`.
- `setInterval(recalculate, 30000)` pour rester synchronisé avec les ventes.

#### `useOptimization.ts` — Boîte à outils générique de performance
- `useDebounce(value, delay)`, `useDebouncedCallback(fn, delay)`, `useThrottledCallback(fn, limit)` (garde le dernier appel manqué et l'exécute après la fenêtre).
- `useDeepMemo(factory, deps)` : compare chaque dépendance via `Object.is` (memoïsation manuelle sans hash JSON).
- `usePagination(items, itemsPerPage, currentPage)`, `useFilteredData(items, query, fields, minChars=3)`, `useSortedData(items, sortKey, order)`.
- `useLocalCache(key, initialValue, expirationMs?)` : lit/écrit `localStorage` avec horodatage, expire silencieusement.
- `useIntersectionObserver(options?)` : retourne `[ref, isIntersecting]` (lazy loading).

#### `usePhoneActions.ts`
- Ouvre une boîte de dialogue téléphone (`isOpen/selectedPhone`). `handleCall` → `window.location.href = 'tel:...'`. `handleMessage` → `sms:...` sur mobile, toast informatif sur desktop.

#### `useProductAttributes.ts` — `useProductAttributes(kind)`
- `kind` peut être un id `k_xxx` ou une clé legacy (`modele|taille|couleur|devant|autres`) résolue vers l'id via `resolveKindId` (cherche `legacy===key || slug===key || id===key` dans `attributKindsApi.listKinds()`).
- Écoute deux événements custom `window` : `attribut-values-changed` (filtré par `kindKey` si fourni) et `attribut-kinds-changed` (toujours refetch). `notifyValuesChanged(kindKey?)` exportée pour être appelée après chaque mutation.
- CRUD des valeurs (`create/update/remove`) qui résolvent le kind avant chaque appel et notifient après mutation.

#### `useProducts.ts`
- Même pattern que `useClients`/`useSales` : dédup par `JSON.stringify`, `hasInitialLoad`, écoute SSE (`data.products`) + `force-sync`. `searchProducts(query)` (min 3 caractères). CRUD avec toasts.

#### `useRdv.ts` — `useRdv()`
- CRUD RDV. `markAsNotified(id)` : PUT `{notificationEnvoyee:true, rappelEnvoye:true}`.
- `searchRdvs(query)` : essaie l'API, sinon **fallback local** (filtre `titre/clientNom/description/lieu`).
- `checkConflicts(date,heureDebut,heureFin,excludeId?)` : essaie l'API, sinon **fallback local** — un conflit existe si `rdv.date===date`, statut ∉ {annule,termine}, et chevauchement d'intervalles `(start1 < end2 && end1 > start2)`.

#### `useRealtimeCommentNotifications.ts` — `useRealtimeCommentNotifications({type, onNewComment?, onCountChange?})`
- Écoute l'événement custom `window` `share-comment-received` (émis par `EventSourceManager` sur réception SSE). Si `detail.type === type`, affiche un toast `sonner` (`💬 Nouveau commentaire - <Notes|Pointage|Tâches>`, description = `<prénom nom ou "Quelqu'un"> a laissé un commentaire`, durée 6000ms, position top-right), incrémente le compteur non-lu (`onCountChange(1)`) et déclenche `onNewComment()`. Notification instantanée sans rechargement de page.

#### `useSales.ts` — `useSales(month?, year?)`
- Si `month`/`year` fournis, utilise `saleApiService.getByMonth`, sinon `getAll`. Pattern identique aux autres hooks CRUD (dédup, SSE, toasts). `exportMonth(exportMonth, exportYear)`.

#### `useSessionUnique.ts` — `useSessionUnique({isAuthenticated, onForceLogout, onNotification?})`
- **Heartbeat toutes les 2 secondes** vers `connecteProfilUniqueApi.poll(sessionId)`.
- Si le serveur répond `res.known && res.forceLogout` : arrête tout (`stopped.current=true`), efface le `sessionId`, appelle `onForceLogout(reason)`.
- Sinon met à jour `logoutRequest` (demande de déconnexion manuelle en attente) et notifie les nouvelles `notifications[]` (dédupliquées via un `Set` d'ids déjà vus, `seenNotifs`).
- `respond(accept)` : `connecteProfilUniqueApi.respondLogout({sessionId,requestId,accept})`. Si `accept`, force la déconnexion locale immédiate.

#### `useYearlyData.ts`
- `getSaleValues(sale)` — fonction pivot pour lire une vente indépendamment de son format :
  - Format multi-produits (`sale.products` non vide) : `revenue = totalSellingPrice ?? Σ p.sellingPrice`, `cost = totalPurchasePrice ?? Σ p.purchasePrice`, `profit = totalProfit ?? Σ p.profit`, `quantity = Σ p.quantitySold`.
  - Format mono-produit (`sale.sellingPrice` défini) : `revenue=sellingPrice` (déjà total, pas de multiplication), `cost=purchasePrice`, `profit`, `quantity=quantitySold`.
  - Sinon tout à 0.
- `filterSalesByYear`/`filterSalesByMonthYear`.
- `useYearlyData(allSales)` calcule : `currentYearSales`, `currentYearMonthlyStats` (groupé par mois, trié), `currentYearTotals`, `allYearsStats` (groupé par année), `yearComparison` (année courante vs année précédente, `calculateChange(current,previous) = previous===0 ? (current>0?100:0) : (current-previous)/previous*100`), `bestAndWorstYears` (tri par `totalRevenue`/`totalProfit`).

---

### 9bis.7 `src/lib/` — Bibliothèque bas niveau

#### `antiTamper.ts` — `installAntiTamper()` (installé une fois depuis `main.tsx`)
1. **Framebusting** : si `window.top !== window.self` et origine différente → écran de blocage plein document (« Affichage non autorisé ») + tentative de `window.top.location.href = window.location.href`.
2. **Vérification d'origine** : `isAllowedHost(host)` autorise `localhost`, `127.0.0.1`, `.lovable.app`, `.lovableproject.com`, `.vercel.app`, `.onrender.com`. Sinon écran de blocage (« Copie non autorisée »).
3. **Anti-copie** : bloque `copy/cut/dragstart/contextmenu` sur tout élément ayant un ancêtre `[data-sensitive="true"]`.
4. **Intégrité runtime** : sauvegarde les références natives de `window.fetch` et `XMLHttpRequest.prototype.open` ; toutes les 15s vérifie qu'elles n'ont pas été remplacées (script injecté) ; si oui, restaure les originaux et (en prod) affiche un écran de blocage (« Environnement compromis »).
- `blockScreen(title, detail)` : vide `document.documentElement`, injecte un écran plein page en JS pur (pas de dépendance React).

#### `barcodeCodec.ts`
- Décode le format obfusqué `EncodedBarcode {v,s,p,c}` stocké côté serveur pour reconstruire un code-barre lisible côté client (affichage `JsBarcode`).
- `b64decode(s)` : ajoute le padding `=` manquant puis `decodeURIComponent(escape(atob(s)))`.
- `decodeBarcode(encoded)` : pour chaque segment de `p[]`, retire le premier caractère (« tag »/sel) puis décode en base64 ; concatène tous les segments.
- `getBarcodeValue(carac, fallback?)` : si `codeBarre` est déjà une string, la retourne ; si c'est un objet encodé, tente le décodage ; sinon retourne `fallback || carac.code || ''`.

#### `performance.ts` — Boîte à outils de perf frontend
- `CacheService` (classe, instance exportée `dataCache`) : cache mémoire avec TTL par entrée (défaut 300000ms), taille max 100 (`cleanup()` supprime les expirées puis, si toujours trop gros, la moitié la plus ancienne).
- `debounce`/`throttle` (implémentations génériques classiques).
- `deduplicateRequest(key, requestFn)` : `pendingRequests` (Map) empêche 2 appels identiques concurrents de partir en parallèle — le second réutilise la promesse du premier.
- `createBatcher(batchFn, {maxBatchSize=50, delayMs=10})` : regroupe des demandes individuelles par id en un seul appel `batchFn(ids[])` renvoyant une `Map<id,result>`, déclenché soit par taille de lot atteinte soit par timer.
- `PerformanceMonitor` (classe, instance `performanceMonitor`) : `measure`/`measureAsync` chronomètrent une fonction, avertissent en console si `duration > 1000ms`, gardent les 1000 dernières métriques (FIFO).
- `prefetchRoute(path)` (injecte `<link rel="prefetch">`), `prefetchImage(src)` (précharge via `new Image()`).
- `createLazyLoader(loader, {timeout=30000})` : charge une ressource une seule fois, avec timeout via `Promise.race`.
- `calculateVisibleRange(containerHeight, scrollTop, itemHeight, totalItems, overscan=3)` : helper de virtual-scrolling.
- `cleanupMemory()` : vide `dataCache`, `prefetchedResources`, `performanceMonitor`, tente `window.gc()` si exposé.

#### `proofOfWork.ts` — Anti-bot pour la page de vérification de sécurité
- `sha256Hex(text)` via `crypto.subtle.digest`.
- `leadingZeroBits(hex)` : compte les bits nuls en tête du hash hexadécimal.
- `createChallenge()` : 16 octets aléatoires en hex.
- `solveProofOfWork(challenge?, difficulty=18, maxIterations=4000000)` : boucle sur `nonce` jusqu'à trouver un hash de `sha256(challenge:nonce)` avec au moins `difficulty` bits nuls en tête (≈200-600ms pour difficulty=18) ; laisse respirer le thread principal toutes les 500 itérations (`await setTimeout(0)`) ; retourne `null` si `crypto.subtle` indisponible ou si `maxIterations` atteint sans solution.
- `storeProof(proof)` : persiste dans `sessionStorage['security_pow_v1']` avec horodatage `at`.

#### `runtimeSecurity.ts` — `installRuntimeSecurity()` (installé une fois avant `antiTamper`)
1. **`JSON.parse` durci** : reviver qui rejette (`return undefined`) toute clé `__proto__`/`constructor`/`prototype` (anti prototype-pollution).
2. **`window.open` forcé** à toujours inclure `noopener,noreferrer` (anti tabnabbing).
3. **Blocage des schémas dangereux** au clic (`javascript:`, `data:text/html`) sur les liens `<a>`.
4. **`unhandledrejection`** : en production, `e.preventDefault()` pour éviter la fuite d'infos sensibles en console.

#### `security.ts` — Utilitaires de sécurité applicative complets
- `sanitizeString(input)` : échappe `&<>"'/\`` en entités HTML, retire `javascript:`, `on\w+=`, `data:`, tronque à 10000 caractères.
- `sanitizeObject(obj, maxDepth=5)` : sanitize récursivement chaînes/clés, limite tableaux à 1000 éléments et objets à 100 clés, `null` au-delà de `maxDepth`.
- `safeEncodeURI(input)`, `isSafeUrl(url)` (rejette `javascript:/data:/vbscript:/file:/about:`).
- `validators` : `email` (regex + longueur ≤255), `phone` (regex `[0-9+\-\s()]{6,20}`), `password` (6-128 caractères), `text(text,maxLength=1000)`, `number(num,min,max)`, `date`, `url` (via `new URL` + `isSafeUrl`).
- `generateSecureId()` : 16 octets aléatoires en hex via `crypto.getRandomValues`.
- `maskSensitiveData(data, visibleChars=4)`, `maskEmail(email)`.
- `checkPasswordStrength(password)` : score 0-6 (longueur≥8, longueur≥12, minuscule, majuscule, chiffre, caractère spécial), labels `faible|moyen|fort|très fort`, `suggestions[]` listant les critères manquants.
- `RateLimiter` (classe) : fenêtre glissante en mémoire (`Map<key, number[]>`), `isAllowed(key)`, `getRemainingAttempts`, `reset`, `getRetryAfter` (secondes avant la prochaine tentative autorisée). Instances globales exportées : `globalRateLimiter(10/60s)`, `authRateLimiter(5/5min)`, `apiRateLimiter(100/60s)`.
- CSRF : `generateCSRFToken`, `storeCSRFToken`/`getCSRFToken` (sessionStorage `csrf_token`), `validateCSRFToken`.
- `secureStorage` : wrapper `localStorage` avec sanitization automatique des strings avant écriture.
- `validateForm(data, rules)` : moteur de validation générique par règles déclaratives (`required, type, maxLength, min, max`) → `{isValid, errors[]}`.

#### `utils.ts`
- `cn(...inputs)` = `twMerge(clsx(inputs))` (fusion de classes Tailwind, utilisé partout dans les composants shadcn/ui).

#### `validation.ts` — Schémas Zod
- `safeString(min,max)` : rejette tout contenu correspondant à `/<script|javascript:|on\w+=/i`.
- Schémas exportés : `emailSchema` (lowercased), `phoneSchema`, `passwordSchema` (8-128, ≥1 maj/min/chiffre), `amountSchema` (0 à 999999999, fini), `quantitySchema` (entier 0-999999), `idSchema` (regex `^[a-zA-Z0-9_-]+$`), `dateSchema`.
- Schémas d'entités : `clientSchema`, `productSchema`, `saleProductSchema`, `saleSchema`, `messageSchema`, `loginSchema`, `registerSchema` (avec `.refine` vérifiant `password===confirmPassword`).
- Types inférés exportés (`ClientInput`, `ProductInput`, etc.).

---

### 9bis.8 `src/utils/` — Utilitaires métier

#### `clientCharacteristic.ts` — Badge « caractéristique client »
- 4 constantes de style figées : `CHAR_NEW` (« Nouveau client », jaune), `CHAR_DEJA` (« Déjà client », orange), `CHAR_FIDELE` (« Client fidèle », vert), `CHAR_ANNULE` (« Attention, Client qui annule », rouge clignotant `animate-pulse`).
- `computeClientCaracteristique(clientNom, clients, sales, commandes)` :
  1. Si le nom (normalisé) n'existe pas dans `clients` → `CHAR_NEW`.
  2. Sinon, `totalProductsBought` = somme des `quantitySold`/`quantity` de tous les produits de toutes les ventes de ce client (recherche par `clientName` normalisé).
  3. Si `totalProductsBought > 2` → `CHAR_FIDELE`.
  4. Sinon, si `totalProductsBought === 0` et le client a au moins une commande `annule` et **aucune** `valide` → `CHAR_ANNULE`.
  5. Sinon → `CHAR_DEJA`.
- `getCaracteristiqueByLabel(label)` : reverse-lookup pour retrouver les classes CSS à partir d'un libellé persisté en base.

#### `clientMatch.ts` — Détection de doublons clients
- Normalisation : `norm(s)` = trim+lowercase ; `normPhone(p)` = retire espaces et tout caractère non chiffre/`+`.
- `findMatchingClients(clients, typed)` : pour chaque client existant, détermine les champs correspondants (`nom`/`phone`/`address`) parmi ceux saisis ; retourne la liste des `{client, fields}` avec au moins un match.
- `clientHasDifference(client, typed)` : vrai si au moins un champ saisi diffère de ce client (nom différent, ou un téléphone/adresse saisi absent de ceux du client).
- `canCreateNewDespiteMatches(matches, typed)` : autorise la création d'un nouveau client seulement si **tous** les matches ont une différence (sinon bloque, car ce serait un doublon exact).
- `matchSignature(typed)` : clé stable `nom::phones triés::addresses triées` (utile pour mémoïser/dédupliquer les vérifications).

#### `helpers.ts` — Fonctions génériques (doublons partiels avec `lib/performance.ts`/`FormatService`)
- `formatCurrency`, `formatDate`, `formatNumber`, `truncateText` (suffixe `…`), `generateId` (`Date.now().toString(36) + random`), `debounce`, `throttle`.

#### `index.ts`
- Point d'entrée `@/utils` : ré-exporte `cn` (depuis `lib/utils`), les helpers de `helpers.ts`, et les validateurs de `validators.ts`.

#### `rdvConfirmation.ts` — Règles de confirmation des RDV (module Pointage/Tâches, `RdvTache`)
- `DAY_MS = 24h`.
- `rdvStartDate(r)` : reconstruit le `Date` de début à partir de `r.date` + `r.heureDebut` (défaut `00:00`, pad à 2 chiffres si besoin).
- `isAutoConfirmed(r)` : vrai si `start - createdAt < 24h` (RDV créé à moins de 24h de son début → pas de confirmation requise).
- `needsConfirmation(r, now)` : faux si déjà `confirme/annule/termine` ou auto-confirmé ; sinon vrai si `-12h < (start-now) ≤ 24h` (fenêtre de confirmation : jusqu'à 24h avant, et jusqu'à 12h après le début si pas encore traité).
- `getRdvsToConfirm(rdvs, now)` : filtre `needsConfirmation`.
- `allowedStatuts(r, now)` : base = `['annule','termine']` ; ajoute `'confirme'` en tête si `needsConfirmation` OU si (non auto-confirmé ET statut ∈ {planifie, reporte}).

#### `rdvConfirmationLock.ts` — Verrouillage commandes/tâches liées à un RDV en attente de confirmation
- Règle métier :
  - **Entre 24h et 1h avant** l'heure du RDV, si non confirmé « maintenu » → état `'locked'` (visible mais non modifiable/supprimable/cliquable).
  - **À partir de ≤ 1h avant** (jusqu'à après le début) sans confirmation → état `'hidden'` (masqué de la liste + auto-annulé côté serveur, mais pas supprimé — reportable).
  - Les états `maintenu`, `annule`, `reporter` ne verrouillent jamais rien (`confirmationAuto=true` non plus).
- `computeLockStateForCommande(commande, confirmationEntries)` :
  1. Si pas d'id/date de référence (`dateEcheance||dateArrivagePrevue`)/horaire → `'normal'`.
  2. Cherche l'entrée de confirmation liée (`commandeId`). Absente, `confirmationAuto=true`, ou `confirmationStatut !== 'en_attente'` → `'normal'`.
  3. Calcule `diff = start - now` (start = date + heure de début extraite de `horaire`).
  4. `diff ≤ 1h` → `'hidden'` ; `diff ≤ 24h` → `'locked'` ; sinon `'normal'`.
- `computeLockStateForTache(tache, confirmationEntries)` : même logique, appliquée aux tâches via leur `commandeId`.
- `autoCancelCommandeIfNeeded(commande, state)` : si `state==='hidden'` et statut ∉ {annule,valide} et pas déjà traité (`Set` mémoire `cancelledCommandeIds` anti-doublon), appelle `commandeApi.update(id,{statut:'annule'})` (en cas d'échec, retire l'id du set pour retenter plus tard).
- `autoCancelTacheIfNeeded(tache, state)` : équivalent pour les tâches (`tacheApi.update(id,{completed:true})`), ignore si déjà `completed`.

#### `sessionsHistoryPdf.ts` — Export PDF de l'historique des connexions
- `exportSessionsHistoryPdf(periodeLabel, rows, entreprise='Direction')` : document `jsPDF` paysage A4, en-tête bleu (`[14,116,200]`) avec titre + période + date d'édition, mention rouge « DOCUMENT INTERNE — NE PAS PARTAGER » en haut à droite.
- Tableau `autoTable` : colonnes `Date, Heure, Événement, Profil, Rôle, IP, Navigateur, OS, Appareil`, thème `grid`, lignes alternées bleu très clair.
- Pied de page : mention légale d'usage interne, total d'événements, bloc signature (ligne + libellé entreprise).
- Nom de fichier : `historique-connexions-<slug-période>-<date-ISO>.pdf`.

#### `validators.ts`
- `validateEmail` (regex simple `^[^\s@]+@[^\s@]+\.[^\s@]+$`), `validatePhone` (regex `[\d\s+()-]{8,20}`), `validateRequired`, `sanitizeInput` (retire `<>`, `javascript:`, `on\w+=`).
