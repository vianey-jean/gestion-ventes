## 6bis.D PROFIL, PRÊTS, PAGES PARTAGÉES & HUB IA

Cette section documente le profil utilisateur, les anciennes pages de « prêts » désormais neutralisées, les deux pages publiques de consultation de liens partagés, ainsi que les composants qui gèrent la génération de liens et les commentaires visiteurs. **Aucune page dédiée « Intelligence Artificielle »** (chatbot, appel LLM, edge function IA) n'existe dans ce projet : la seule zone qualifiée d'« intelligence » est l'onglet « intelligence » de `TendancesPage`, qui est en réalité une analyse de stock/ventes calculée côté client (voir 6bis.D.9), sans aucun appel à un modèle d'IA externe ni à une edge function.

### 6bis.D.1 `src/pages/ProfilePage.tsx` — profil utilisateur (route `/profile`)

- **Rôle** : page principale de gestion du profil connecté (informations personnelles, mot de passe, paramètres, sécurité, maintenance).
- **Route** : `/profile`, protégée par authentification (montée dans `Layout requireAuth` par le routeur — voir `App.tsx`).
- **Imports clés** : `Layout`, `PremiumLoading`, `useAuth`, `useToast`, `profileApi` (+ type `ProfileData`), `SEOHead`, et les sous-composants `ProfileCard`, `ProfileInfoCard`, `PasswordSection`, `ParametresSection`, `SecuriteSection`, `MaintenanceSection`, `ProfileHero`, `ProfileTabsNav` (+ type `ProfileTab`), `ProfileConfirmDialogs`.
- **États** :
  - `activeTab: ProfileTab` (défaut `'profil'`) — `'profil' | 'parametres' | 'securite'`.
  - `profile: ProfileData | null`, `loading` (défaut `true`).
  - `editing` (édition des infos personnelles) + `editForm` (`firstName, lastName, gender, address, phone`).
  - `showPasswordForm`, `pwForm` (`currentPassword, newPassword, confirmPassword`), `showPw` (visibilité des 3 champs), `isNewPasswordValid`.
  - Dialogues de confirmation : `confirmProfile`, `confirmPassword`, `confirmPhoto`.
  - Photo en attente : `pendingPhoto: File | null`, `photoPreview: string | null`.
  - `saving` (état de sauvegarde générique, partagé entre les 3 actions).
  - `fileInputRef` (ref sur l'`<input type="file">` caché).
- **Rôles calculés** : `userRole = profile.role || user.role`; `isAdminPrincipal = userRole === 'administrateur principale'`; `isAdmin = userRole === 'administrateur' || isAdminPrincipal`; `canSeeSettings = isAdmin`. Ces booléens conditionnent l'affichage des onglets « Paramètres » (admin) et « Sécurité » (admin principal uniquement).
- **Effets** :
  1. Au montage : `fetchProfile()`.
  2. Au montage : lit `?tab=` dans l'URL ; si la valeur est `securite`, `parametres` ou `profil`, force `activeTab` à cette valeur (utilisé par les liens de notification de connexion) ; si un hash d'URL est présent, `scrollIntoView({behavior:'smooth'})` sur l'élément ciblé après un délai de 600 ms.
- **Handlers** :
  - `fetchProfile()` : `profileApi.getProfile()`, alimente `profile` et initialise `editForm` depuis les données reçues ; gère `loading`.
  - `handlePhotoSelect(e)` : récupère le fichier choisi, crée un aperçu via `URL.createObjectURL`, ouvre le dialogue `confirmPhoto`.
  - `uploadPhoto()` : `profileApi.uploadPhoto(pendingPhoto)`, met à jour `profile.profilePhoto`, persiste dans `localStorage.user`, `await verifySession()` (recharge le contexte auth), toast succès/erreur, réinitialise `pendingPhoto`/`photoPreview`.
  - `saveProfile()` : `profileApi.updateProfile(editForm)`, remplace `profile`, persiste `localStorage.user`, `verifySession()`, ferme le mode édition, toast.
  - `changePassword()` : `profileApi.changePassword(pwForm)`, si succès réinitialise le formulaire et ferme `showPasswordForm`, toast ; erreur affichée via `e.response.data.message`.
  - `photoUrl = profile.profilePhoto ? profileApi.getPhotoUrl(...) : null`.
- **Rendu** :
  - Pendant `loading` : `Layout` + `PremiumLoading` plein écran (`xl`, `overlay`).
  - Sinon : `Layout` > `SEOHead(title="Profil")` > `<style>` injectant le keyframe `greenPulse` (halo vert pulsé, utilisé ailleurs dans les sous-composants) > conteneur `min-h-screen` dégradé (violet/fuchsia clair en light, très sombre en dark) > colonne centrée `max-w-5xl` :
    1. `ProfileHero`.
    2. `ProfileTabsNav` (props `activeTab`, `setActiveTab`, `canSeeSettings`, `isAdminPrincipal`).
    3. Si `activeTab==='profil'` : `ProfileCard` (photo, nom, email, rôle, bouton upload qui déclenche l'`<input>` caché) + `<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden">` + `ProfileInfoCard` (édition infos) + `PasswordSection` (changement de mot de passe).
    4. Si `activeTab==='parametres' && canSeeSettings` : `ParametresSection`.
    5. Si `activeTab==='securite' && isAdminPrincipal` : `SecuriteSection` + `MaintenanceSection`.
  - En dehors du conteneur principal : `ProfileConfirmDialogs` regroupant les 3 dialogues de confirmation (profil, mot de passe, photo) avec leurs callbacks `onSaveProfile`, `onChangePassword`, `onUploadPhoto`, l'état `saving`, et `onPhotoDialogClose` qui vide `pendingPhoto`/`photoPreview`.
- **Permissions** : tout utilisateur authentifié voit l'onglet Profil ; seuls les administrateurs voient Paramètres ; seul l'administrateur principal voit Sécurité + Maintenance.
- **Dépendances** : `AuthContext` (`user`, `verifySession`), `use-toast`, `profileApi`.

### 6bis.D.2 `src/pages/PretFamilles.tsx` — route legacy `/pret-familles` (ou équivalente)

- **Rôle** : composant de compatibilité/redirection. Le fichier ne contient plus aucune logique métier de « prêts familles » : il **redirige immédiatement** vers l'accueil.
- **Contenu intégral** : `return <Navigate to="/" replace />;` — aucun état, aucun effet, aucun appel API.
- **Commentaire du code** : « Redirige vers la page Dashboard qui contient la gestion des prêts familles » — la fonctionnalité réelle de prêts familles a été déplacée dans le Dashboard (composant `src/components/dashboard/PretFamilles.tsx`, hors périmètre de cette section) ; cette page-route n'est conservée que pour ne pas casser d'anciens liens/favoris.
- **Non routée dans `App.tsx` actuel** : à la date de rédaction, aucune route ne pointe explicitement vers ce fichier dans `src/App.tsx` (elle a pu exister historiquement) ; à recréer à l'identique si une route legacy doit être restaurée.

### 6bis.D.3 `src/pages/PretProduits.tsx` — route legacy équivalente pour les prêts produits

- **Rôle** et **structure strictement identiques** à 6bis.D.2, appliqués aux « prêts produits » : `return <Navigate to="/" replace />;`, commentaire « Redirige vers la page Dashboard qui contient la gestion des prêts produits ».
- La logique réelle vit dans `src/components/dashboard/PretProduits.tsx` / `PretProduitsGrouped.tsx` (composants Dashboard, hors périmètre de cette section).

### 6bis.D.4 `src/pages/SharedViewPage.tsx` — consultation publique d'un lien partagé (route `/shared/:token`)

- **Rôle** : page **publique**, accessible sans authentification via un token unique dans l'URL, permettant de consulter en lecture seule des données de pointage, tâches ou notes partagées par un administrateur, protégées par un code d'accès à 8 caractères.
- **Route** : `/shared/:token` (montée hors `Layout`/garde d'auth dans `App.tsx`, cf. import `SharedViewPage`).
- **Paramètres** : `token` extrait via `useParams<{ token: string }>()`; si absent, `<Navigate to="/" replace />`.
- **États** :
  - `step: 'code' | 'loading' | 'view' | 'error'` (défaut `'code'`) — machine à états du flux d'accès.
  - `accessCode` (saisie utilisateur, forcée en majuscules, max 8 caractères).
  - `errorMsg` (message d'erreur affiché à l'étape `error`).
  - `dataType: string` (`'pointage' | 'taches' | 'notes'`, déterminé par la réponse serveur).
  - `data: any` (payload complet renvoyé par le serveur : `pointages[]`, `taches[]`, ou `{ notes[], columns[] }`).
  - `commentMode: boolean` (reflète l'état interne de `SharedCommentForm`, propagé via `onCommentModeChange`, contrôle l'affichage des boutons de commentaire inline sur chaque carte).
- **Mémo `sortedItems`** (`useMemo` sur `[data, dataType]`) : construit un tableau plat et **trié** des éléments affichés, dans l'ordre exact de rendu, pour que les index utilisés par les commentaires inline correspondent à l'ordre visuel :
  - `pointage` : copie de `data.pointages` triée par `date` décroissante (`localeCompare` inversé).
  - `taches` : copie de `data.taches` triée par `date` décroissante puis par `heureDebut` croissante.
  - `notes` : reconstruit la liste en parcourant les colonnes triées par `order`, puis pour chaque colonne les notes filtrées par `columnId` et triées par `order` (aplati dans `sorted`).
  - Sinon `[]`.
- **Flux** :
  1. Étape `code` : formulaire avec pastille `KeyRound`, champ code d'accès (`onKeyDown Enter` déclenche la vérification), bouton « Vérifier et accéder ». `onContextMenu={e=>e.preventDefault()}` sur toute la page pour dissuader la copie (protection légère, contournable).
  2. `handleVerify()` : passe `step` à `loading`, appelle `shareLinksApi.verify(token, accessCode.trim().toUpperCase())` puis, en cas de succès, `shareLinksApi.viewData(token)` ; stocke `dataType`/`data` et passe à `step='view'`. En cas d'erreur, stocke `err.message` dans `errorMsg` et passe à `step='error'`.
  3. Étape `loading` : `PremiumLoading` centré.
  4. Étape `error` : carte d'erreur (`ShieldAlert`), bouton « Réessayer » qui remet `step='code'`, vide `errorMsg`/`accessCode`.
  5. Étape `view` (si `data` non nul) :
     - `typeConfig` associe à chaque `dataType` une icône lucide, un libellé et un dégradé de couleur (`notes`→StickyNote/ambre-orange, `pointage`→Clock/cyan-bleu, `taches`→ListTodo/violet-pourpre).
     - En-tête sticky (`sticky top-0`) avec icône/label du type, mention « Lecture seule » (`Eye`), badge « Protégé par IP » (`Lock`).
     - **Vue Notes** : tableau kanban en colonnes horizontales scrollables (`overflow-x-auto`), une colonne par `data.columns` triée par `order`, chaque colonne affichant ses notes (titre, contenu, dessin via `getDrawingUrl`, transcription vocale `voiceText`, liste de fichiers joints avec lien de téléchargement via `getFichierUrl` — fusionnant `note.fichier` legacy et `note.fichiers[]`). Un index global `noteIdx` incrémenté au fil du rendu assure la correspondance avec `sortedItems`.
     - **Vue Pointage** : grille de cartes (une par pointage) avec date, montant total, entreprise, type de paiement (journalier ou horaire), nom du travailleur ; bloc de total général sous la grille (`reduce` sur `montantTotal`).
     - **Vue Tâches** : grille de cartes colorées selon `importance` (rouge si `pertinent`, vert si `optionnel`), affichant date, statut complété (`CheckCircle`, texte barré), description, horaires, travailleur.
     - Sur chaque carte/note, si `commentMode` est actif, un bouton flottant (`MessageCircle`) appelle `window.__addInlineComment?.(index)` — fonction exposée globalement par `SharedCommentForm` pendant le mode commentaire.
     - En bas de page : `<SharedCommentForm token dataType itemCount={sortedItems.length} items={sortedItems} onCommentModeChange={setCommentMode} />`.
- **Sécurité/permissions** : aucune authentification requise ; l'accès est protégé par token + code d'accès à usage limité et verrouillage IP côté serveur (mention affichée « Protégé par IP »).
- **Appels API** : `shareLinksApi.verify(token, code)` (POST public), `shareLinksApi.viewData(token)` (GET public).
- **Dépendances** : `shareLinksApi`, `noteApi` (`getDrawingUrl`, `getFichierUrl`), `SEOHead` (`noindex`), `SharedCommentForm`, `PremiumLoading`, icônes lucide (`Lock, Eye, StickyNote, Clock, ListTodo, KeyRound, ShieldAlert, CheckCircle, MessageCircle, FileText, Download`).

### 6bis.D.5 `src/pages/SharedNotesPage.tsx` — ancienne route publique dédiée aux notes (route `/shared-notes/:token` ou équivalente)

- **Rôle** : variante **historique**, spécifique aux notes uniquement (sans code d'accès), consultée via un fetch direct sur une route serveur dédiée `notes-share`, contrairement à `SharedViewPage` qui est générique et protégée par code.
- **Route** : `/shared-notes/:token` (voir import `SharedNotesPage` dans `App.tsx`).
- **Types locaux** : `SharedNote` (`title, content, columnId, order, color, bold, boldLines[], underlineLines[], drawing, voiceText, fichier?, fichiers?, createdAt`), `SharedColumn` (`id, title, color, order`).
- **États** : `notes: SharedNote[]`, `columns: SharedColumn[]`, `loading` (défaut `true`), `error` (défaut `false`), `commentMode`.
- **Effet** : au montage/`token` changé, `fetchShared()` : `fetch(`${getBaseURL()}/api/notes-share/view/${token}`)` ; si `!res.ok` → `error=true` ; sinon parse JSON et alimente `notes`/`columns` ; `finally` → `loading=false`. **Pas de vérification de code d'accès** dans cette page (contrairement à `SharedViewPage`).
- **Garde** : si `!token`, `<Navigate to="/" replace />`.
- **Rendu** :
  - `loading` → `PremiumLoading` plein écran.
  - `error` → carte « Lien invalide » (icône `Lock`).
  - Sinon : en-tête sticky (icône `StickyNote`, dégradé ambre→orange, compteur `{notes.length} notes`) puis kanban en lecture seule identique dans sa structure à la vue Notes de `SharedViewPage` (colonnes triées par `order`, notes triées par `order`, gestion du contenu/dessin/vocal/fichiers, bouton de commentaire inline si `commentMode`, index global `noteIdx`).
  - `onContextMenu={e=>e.preventDefault()}` sur le conteneur racine.
  - En bas : `<SharedCommentForm token dataType="notes" itemCount={notes.length} onCommentModeChange={setCommentMode} />` — **remarque** : ici `items` n'est **pas transmis** à `SharedCommentForm` (prop optionnelle, donc `getItemLabel` retombera sur `Élément #index` par défaut, contrairement à `SharedViewPage` qui transmet les items triés).
- **Appels API** : `fetch` brut (pas via le module `api` axios) sur `/api/notes-share/view/:token`, sans authentification.
- **Dépendances** : `getBaseURL` (service `api`), `getDrawingUrl`/`getFichierUrl`/`NoteFichier` (service `noteApi`), `SEOHead` (`noindex`), `SharedCommentForm`, `PremiumLoading`.

### 6bis.D.6 `src/components/shared/SharedCommentForm.tsx` — formulaire de commentaires visiteur (public)

- **Rôle** : composant flottant permettant à un visiteur non authentifié, sur une page de lien partagé, de commenter des éléments individuels et/ou de laisser un commentaire général, puis de valider et d'envoyer ces commentaires au serveur (avec génération d'un instantané HTML côté serveur).
- **Props** : `token: string`, `dataType: string`, `itemCount: number`, `items?: any[]` (défaut `[]`), `onCommentModeChange?: (active:boolean)=>void`.
- **Machine à états `mode`** : `'idle' | 'commenting' | 'validated' | 'sent' | 'already'`.
- **États** : `minimized` (replie le panneau bas), `inlineComments: {index, text, itemData}[]`, `generalComment`, `nom`, `prenom`, `telephone`, `email`, `commentId: string|null` (id retourné après validation), `sending`, `activeIndex: number|null` (élément en cours de commentaire dans la popup), `activeText`, `error`.
- **Effet initial** : `shareCommentsApi.check(token)` → si `hasCommented`, positionne `mode` sur `'already'` (si déjà envoyé) ou `'validated'` (si validé mais pas encore envoyé — permet de reprendre l'envoi).
- **`getItemLabel(index)`** : construit un libellé lisible selon `dataType` à partir de `items[index]` (pointage : date/entreprise/travailleur/type paiement/montant ; tâches : date/description/horaires/travailleur/importance ; notes : titre + extrait de contenu tronqué à 50 caractères) ; fallback `Élément #index+1` si l'item est absent.
- **Exposition globale** : tant que `mode==='commenting'`, `window.__addInlineComment` est assigné à `handleAddInlineComment(index)` (ouvre la popup de saisie pour cet index, préremplie si un commentaire existe déjà) ; nettoyé (`delete`) à la sortie du mode ou au démontage.
- **Notification du mode** : `useEffect` sur `[mode]` appelle `onCommentModeChange?.(mode==='commenting')`.
- **`handleSaveInlineComment()`** : si texte vide, ferme simplement la popup ; sinon capture `itemData = items?.[activeIndex]`, ajoute/replace le commentaire pour cet index dans `inlineComments` (dédoublonnage par `index`) et trie par `index`.
- **`handleRemoveInlineComment(index)`** : retire l'entrée correspondante.
- **`handleValidate()`** : valide que `nom`/`prenom` sont renseignés et qu'il existe au moins un commentaire (inline ou général) ; sinon affiche une erreur locale. Sinon appelle `shareCommentsApi.submit(token, {...})` avec `comments` enrichis de `itemLabel` (via `getItemLabel`) et `allItems: items`; stocke `commentId` retourné et passe `mode` à `'validated'`.
- **`handleSend()`** : appelle `shareCommentsApi.send(commentId)` (déclenche la génération du snapshot HTML côté serveur), passe `mode` à `'sent'`.
- **Rendu selon `mode`** :
  - `'already'`/`'sent'` : simple pastille flottante en bas à droite « Commentaires envoyés » (`Check`).
  - `'idle'` : bouton flottant bas-droite « Ajouter des commentaires » (`MessageSquarePlus`) qui passe en `'commenting'`.
  - `'commenting'` + `activeIndex!==null` : popup modale centrée affichant le libellé de l'élément (`getItemLabel`) et un `textarea`, boutons Annuler/Enregistrer.
  - `'commenting'` : panneau ancré en bas de l'écran (`fixed bottom-0`), hauteur maximale `70vh` réductible à `52px` (`minimized`), en-tête avec titre, compteur de commentaires quand réduit, boutons réduire/agrandir (`ChevronDown`/`ChevronUp`) et fermeture (`X` → repasse en `'idle'`). Contenu dépliable : instructions, liste récapitulative des commentaires inline (avec bouton de suppression), `textarea` de commentaire général, formulaire de contact (prénom, nom obligatoires ; téléphone, email optionnels), message d'erreur éventuel, bouton « Valider les commentaires ».
  - `'validated'` : carte flottante bas-droite « Commentaires validés ! » + bouton « Envoyer » (`disabled` pendant `sending`).
- **Appels API** : `shareCommentsApi.check`, `.submit`, `.send` (tous publics, sans authentification).
- **Dépendances** : `shareCommentsApi`, icônes lucide.

### 6bis.D.7 `src/components/shared/ShareLinkModal.tsx` — gestion simple des liens de partage (côté admin)

- **Rôle** : modale authentifiée permettant à un administrateur de générer, copier et révoquer des liens de partage **sans filtre** (partage intégral des données du type concerné).
- **Props** : `open`, `onClose`, `type: 'notes'|'pointage'|'taches'`, `typeLabel: string`.
- **États** : `links: ShareLink[]`, `loading`, `generating`, `copiedId` (retour visuel de copie, réinitialisé après 2 s).
- **Effet** : à l'ouverture (`open`), `fetchLinks()` → `shareLinksApi.list(type)`.
- **`handleGenerate()`** : `shareLinksApi.generate(type)` (sans filtres, donc partage complet), toast succès, recharge la liste ; toast erreur sinon.
- **`handleRevoke(id)`** : `shareLinksApi.revoke(id)`, retire l'entrée de `links`, toast.
- **`handleCopy(link)`** : construit l'URL `${origin}/shared/${token}` et copie dans le presse-papiers le texte `🔗 Lien: ... \n🔑 Code d'accès: ...` via `navigator.clipboard.writeText`.
- **Rendu** : modale centrée, bouton « Créer un nouveau lien » (dégradé émeraude), liste des liens existants (date de création, lien complet en police mono, code d'accès en évidence ambre, boutons copier/révoquer).
- **Appels API** : `shareLinksApi.list/generate/revoke` (authentifiés).

### 6bis.D.8 `src/components/shared/SelectiveShareModal.tsx` — partage sélectif avancé (filtres + génération multiple)

- **Rôle** : modale authentifiée, plus complète que `ShareLinkModal`, permettant de filtrer précisément les données à partager (par personne, par période, par entreprise, par importance, ou par colonnes/notes spécifiques) puis de générer **plusieurs liens** en une fois avec les mêmes filtres.
- **Props** : `open`, `onClose`, `type: 'pointage'|'taches'|'notes'`.
- **États principaux** :
  - Données de référence : `travailleurs`, `entreprises` (chargées via `travailleurApi.getAll()`/`entrepriseApi.getAll()`), et pour `type==='notes'` : `allNotesData` (`noteApi.getAll()`), `notesColumns` (`noteApi.getColumns()`).
  - Filtres communs : `selectedPersonne` (`'all'` ou id), `dateMode: 'jours'|'semaines'|'mois'|'annees'`, `selectAll` (toutes dates).
  - Sélections de dates : `selectedDays[]` + `dayInput`; `selectedWeeks[]` (+`weekYear`); `selectedMonths[]` (+`selectedMonthYear`); `selectedYears[]`.
  - Spécifique pointage : `selectedEntreprises[]`, `allEntreprises`.
  - Spécifique tâches : `importanceFilter: 'all'|'pertinent'|'optionnel'`.
  - Spécifique notes : `notesAllColumns` (bool), `notesSelection: Record<columnId, {selected, noteIds:'all'|string[]}>`.
  - `linkCount` (nombre de liens à générer, défaut 1, incrément/décrément avec plancher 1).
  - `generatedLinks: ShareLink[]`, `generating`, `copiedId`, `step: 'filters'|'count'|'result'`, `dataLoading`.
- **Effet à l'ouverture** : réinitialise tous les filtres à leurs valeurs par défaut, `step='filters'`, `generatedLinks=[]`, puis `loadData()`.
- **`loadData()`** : charge en parallèle travailleurs/entreprises (`Promise.all`) ; si `type==='notes'`, charge aussi notes+colonnes.
- **`buildFilters()`** : construit l'objet `filters` envoyé au serveur :
  - Notes : soit `{mode:'all'}`, soit `{mode:'selected', columns:[{columnId, noteIds}]}` à partir des colonnes cochées dans `notesSelection` (note : dans l'implémentation actuelle, une colonne cochée est toujours envoyée avec `noteIds:'all'` — la sélection fine note par note n'est pas exposée dans l'UI malgré le type qui le permettrait).
  - Autres types : `dateFilter` = `{mode:'all'}` si `selectAll`, sinon un objet dépendant de `dateMode` (`jours`→`days`, `semaines`→`weeks`+`year`, `mois`→`months`+`year`, `annees`→`years`).
  - Pointage : `entreprises: 'all' | selectedEntreprises`.
  - Tâches : `importance`.
- **`handleValidate()`** : passe à l'étape `count`, sauf si `type==='notes' && !notesAllColumns` et aucune colonne cochée → toast d'erreur bloquant.
- **`handleGenerate()`** : boucle `for i in [0, linkCount)`, appelle `shareLinksApi.generate(type, buildFilters())` à chaque itération (une requête par lien, mêmes filtres), pousse chaque résultat dans `generatedLinks` (id local `Date.now()+i`), passe à l'étape `result`, toast.
- **`handleCopy(link)`** : identique à `ShareLinkModal`.
- Fonctions utilitaires de sélection : `addDay`, `toggleMonth`, `toggleYear`, `toggleEntreprise`, `getWeeksOfYear(y)` (génère `YYYY-Wxx` pour 52 semaines), `toggleWeek`. `yearOptions = [currentYear-2 … currentYear+1]`.
- **Rendu** (thème sombre dédié `slate-900/800`, distinct du reste de l'app) :
  - Étape `filters` : sélecteur de personne (masqué pour `notes`) ; pour `notes`, case « toutes les colonnes » puis, si décoché, liste de colonnes cochables avec compteur de notes ; pour les autres types, bloc période (case « toutes les dates », puis sélecteur de mode jours/semaines/mois/années avec UI dédiée à chacun) ; bloc entreprises (pointage uniquement) ; bloc importance (tâches uniquement, 3 boutons colorés) ; bouton « Valider les filtres ».
  - Étape `count` : compteur +/- du nombre de liens à générer, boutons Retour/Générer.
  - Étape `result` : liste des liens générés avec code d'accès et bouton copier chacun, bouton Fermer.
- **Appels API** : `travailleurApi.getAll`, `entrepriseApi.getAll`, `noteApi.getAll`, `noteApi.getColumns`, `shareLinksApi.generate` (répété `linkCount` fois).

### 6bis.D.9 `src/components/shared/ShareCommentsViewer.tsx` — consultation des commentaires reçus (côté admin)

- **Rôle** : modale authentifiée listant les commentaires envoyés par les visiteurs sur les liens partagés d'un type donné, avec détail, téléchargement, suppression et rafraîchissement temps réel.
- **Props** : `open`, `onClose`, `type: 'notes'|'pointage'|'taches'`, `typeLabel`, `onCountChange?: (delta:number)=>void`.
- **États** : `comments: ShareComment[]`, `loading`, `selectedComment: ShareComment|null`, `showSnapshot`, `snapshotHtml: string|null`, `snapshotLoading`, `deleteConfirmId: string|null`, `iframeRef`.
- **Effets** :
  - À l'ouverture (`open`), `fetchComments()`.
  - Écoute d'un événement DOM personnalisé `share-comment-received` (diffusé ailleurs par le mécanisme SSE global) : si `event.detail.type === type`, relance `fetchComments()` — rafraîchissement temps réel des nouveaux commentaires sans polling.
- **`fetchComments()`** : `shareCommentsApi.list(type)`, protège contre une réponse non-tableau.
- **`handleView(comment)`** : sélectionne le commentaire ; si non lu, appelle `shareCommentsApi.markRead(id)`, met à jour l'état local `read:true` et notifie le parent via `onCountChange?.(-1)` (décrémente un compteur de badge non lus affiché ailleurs, ex. navbar).
- **`handleViewSnapshot()`** : si `selectedComment.snapshotFile` existe, télécharge le HTML via `fetch` authentifié par bearer token (`localStorage.token`) sur `shareCommentsApi.snapshotUrl(file)`, l'injecte dans un `<iframe sandbox="allow-same-origin" srcDoc=...>` ; en cas d'échec affiche un HTML d'erreur inline.
- **`handleDelete(commentId, e)`** : confirmation en deux temps (premier clic arme `deleteConfirmId` avec expiration auto après 3 s, second clic confirme et appelle `shareCommentsApi.delete`). Une seconde variante de confirmation existe sous forme de **modale plein écran** dédiée (voir bloc JSX `deleteConfirmId` en bas du composant) avec boutons Annuler/« Oui, supprimer » qui exécute directement la suppression.
- **`handleDownloadPDF(comment)`** *(nom trompeur : produit en réalité un fichier texte)* : construit un contenu texte multi-sections (infos contact, commentaires spécifiques avec leur `itemLabel`, commentaire général) et déclenche un téléchargement `.txt` via `Blob`+lien `<a download>`.
- **Rendu** :
  - Liste des commentaires (triés par le serveur) : pastille non-lu en rouge « Nouveau », icône fichier si un snapshot existe, date, icône `Eye`, bouton suppression si déjà lu.
  - Vue détail (`selectedComment`) : bloc contact (prénom/nom/téléphone/email/date), liste des commentaires spécifiques avec `itemLabel`, commentaire général, boutons « Voir le document complet » (si snapshot) et « Télécharger ».
  - Vue snapshot : iframe pleine largeur (`60vh`) avec bouton de fermeture.
  - Modale de confirmation de suppression dédiée avec overlay et animations `animate-fadeIn`/`animate-scaleIn`.
- **Appels API** : `shareCommentsApi.list/markRead/delete/detail(non utilisé ici)/snapshotUrl` (authentifiés, sauf téléchargement snapshot qui utilise un `fetch` manuel avec header `Authorization`).

### 6bis.D.10 Services associés (rappel synthétique)

- **`src/services/api/shareLinksApi.ts`** : `generate(type, filters?)`, `list(type?)`, `revoke(id)` (authentifiés, via le client `api` axios) ; `verify(token, accessCode)` et `viewData(token)` (publics, `fetch` brut sur `${getBaseURL()}/api/share-links/...`, lèvent une erreur avec le message serveur si `!res.ok`).
- **`src/services/api/shareCommentsApi.ts`** : routes publiques `submit(token, data)`, `send(id)`, `check(token)` (fetch brut) ; routes authentifiées `list(type?)`, `unread()`, `markRead(id)`, `detail(id)`, `syncHtml()`, `exportJson()`, `importJson(comments)`, `delete(id)`, et l'helper `snapshotUrl(filename)`.
- **`src/services/api/profileApi.ts`** : `getProfile()` (GET `/api/profile`), `updateProfile(data)` (PUT), `uploadPhoto(file)` (POST multipart via `fetch` manuel + bearer token), `changePassword(data)` (PUT `/api/profile/password`), `getPhotoUrl(path)` (préfixe l'URL de base).

### 6bis.D.11 Hub IA — constat d'absence

- Une recherche exhaustive dans `src/pages/**`, `src/components/**` et une éventuelle arborescence `supabase/functions/**` ne révèle **aucune page, composant ou edge function** dédiés à une « Intelligence Artificielle » générative (pas de chatbot, pas d'appel à un LLM externe type OpenAI/Gemini, pas de dossier `supabase/functions`).
- Le seul élément portant le mot « intelligence » dans le code applicatif est l'onglet `TabsContent value="intelligence"` de `src/pages/TendancesPage.tsx`, qui affiche `TendancesStockTab` : il s'agit d'une analyse de stock et de ventes **calculée localement** (`useTendancesData`, fonctions pures sur les données de vente/produits déjà chargées via `useApp()`), sans aucun appel réseau vers un service d'IA. Ce composant est hors périmètre de la présente section (il relève de la documentation des pages Tendances) et ne doit **pas** être recréé comme un « hub IA » dans le sens d'un assistant conversationnel.
- Le composant `src/components/livechat/LiveChatAdmin.tsx` / `LiveChatVisitor.tsx` mentionne un relais vers un « assistant IA » en cas d'absence de réponse administrateur (cf. 5bis.6), mais ce mécanisme relève du chat en direct, documenté ailleurs dans le shell applicatif, et non d'une page IA autonome.
