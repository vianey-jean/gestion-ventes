## 6bis.B TABLEAU DE BORD, MESSAGERIE, VENTES, COMPTABILITÉ & TENDANCES

Cette section documente le tableau de bord unifié (sidebar à sections), le sous-système « Ventes & Produits » embarqué à l'intérieur du Dashboard (héritier de l'ancien Dashboard à onglets), la messagerie interne temps réel, ainsi que la page « Tendances » (analytics de ventes calculées côté client) et l'ensemble des routes-pages devenues de simples redirections legacy.

### 6bis.B.1 `src/pages/DashboardPage.tsx` — tableau de bord principal (route `/dashboard` et `/`)

- **Rôle** : coquille principale de l'application authentifiée. Affiche une sidebar (desktop) / barre de navigation + menu déroulant (mobile) permettant de basculer entre 7 « sections » métier, chacune rendue en lazy-loading dans la zone de contenu. Fichier volumineux (2259 lignes) mais dont l'essentiel de la taille provient de la décoration visuelle (Framer Motion, glassmorphism, aurores animées) ; la logique fonctionnelle réelle est concentrée dans les ~130 premières lignes utiles.
- **Route** : montée par `App.tsx` pour `/dashboard` (et réutilisée comme cible de redirection de nombreuses pages legacy comme `/`, `/produits`, `/ventes`, etc.) ; englobée dans `<Layout requireAuth>`.
- **SEO** : `SEOHead` avec `title = seoTitles[activeSection] || 'Dashboard'` et `description = "Gestion des {section} - Tableau de bord"`, où `seoTitles` associe à chaque `activeSection` un libellé (`ventes → 'Ventes'`, `commandes → 'Commandes'`, `rdv → 'Rendez-vous'`, `comptabilite → 'Comptabilité & Finances'`, `clients → 'Clients'`, `produits → 'Produits'`, `pointage → 'Pointage'`).
- **Lazy imports** (code-splitting) : `VentesContent` (= `@/pages/VentesEmbedded`), `CommandesPage`, `RdvPage`, `ComptabiliteFinancesContent` (= `@/components/dashboard/AdvancedDashboard`), `ClientsPage`, `ProduitsPage`, `PointagePage`.
- **Configuration `SIDEBAR_ITEMS`** (tableau constant, ordre exact d'affichage) : chaque entrée a `{id, label, shortLabel, icon, gradient, iconBg, shadow, hoverBg, activeText}` :
  1. `ventes` — « Ventes & Produits » / « Ventes » — icône `ShoppingCart` — dégradé violet→purple→fuchsia.
  2. `commandes` — « Commandes » — icône `Package` — dégradé emerald→teal→cyan.
  3. `rdv` — « Rendez-vous » / « RDV » — icône `CalendarDays` — dégradé orange→amber→yellow.
  4. `comptabilite` — « Comptabilité & Finances » / « Compta » — icône `TrendingUp` — dégradé cyan→sky→blue.
  5. `clients` — « Clients » — icône `Users` — dégradé pink→rose→red.
  6. `produits` — « Produits » — icône `Box` — dégradé fuchsia→purple→indigo.
  7. `pointage` — « Pointage & Tâches » / « Pointage » — icône `Clock` — dégradé indigo→blue→cyan.
- **États locaux** :
  - `activeSection: string` (défaut `'ventes'`) — section actuellement affichée.
  - `sidebarCollapsed: boolean` (défaut `false`) — sidebar repliée (icônes seules, largeur `w-24`) ou dépliée (`w-80`).
  - `mobileMenuOpen: boolean` (défaut `false`) — ouverture du menu déroulant mobile (grille 2 colonnes).
  - `tacheCount: number` (défaut `0`) — nombre de tâches non complétées à échéance future ou du jour, affiché en badge rouge sur l'item « Pointage ».
  - `isMobile` via `useIsMobile()`.
  - `activeItem` (`useMemo` sur `[activeSection]`) : trouve l'entrée de `SIDEBAR_ITEMS` correspondant à `activeSection` (fallback premier élément).
- **Effets** :
  1. **Comptage des tâches** : `fetchCount()` appelle `tacheApi.getAll()`, calcule `todayStr = new Date().toISOString().split('T')[0]`, filtre les tâches où `!t.completed && t.date >= todayStr`, met à jour `tacheCount` avec la longueur du tableau filtré (erreurs silencieuses). Appelé immédiatement puis toutes les **30 secondes** (`setInterval`), nettoyé à l'unmount.
  2. **Préchargement idle** : à l'aide de `requestIdleCallback` (timeout 3000 ms) ou, à défaut, `setTimeout` (1500 ms), précharge en arrière-plan les modules `CommandesPage`, `RdvPage`, `AdvancedDashboard`, `ClientsPage`, `ProduitsPage`, `PointagePage` (imports dynamiques déclenchés sans affichage) pour fluidifier la navigation ultérieure. Nettoyage via `cancelIdleCallback`/`clearTimeout`.
  3. **Navigation depuis le module Fidélité** : écoute l'évènement DOM global `'fidelite-sale-nav'` — au déclenchement, force `activeSection` à `'ventes'` et ferme le menu mobile. Au montage, lit également `sessionStorage.getItem('fideliteSaleNav')` ; si un JSON valide y est présent et que son timestamp `ts` date de moins de 30 secondes, force aussi `activeSection` à `'ventes'` (permet à un composant Clients/Fidélité de rediriger l'utilisateur vers l'onglet ventes après une action, même si le montage du Dashboard a lieu après l'émission de l'évènement). Nettoyage de l'écouteur à l'unmount.
  4. **Offset du contenu principal** : sur desktop uniquement (`!isMobile`), applique dynamiquement `document.getElementById('main-content').style.marginLeft` à `96px` (collapsed) ou `320px` (déplié), remis à `'0'` au nettoyage/changement.
- **Handlers** :
  - `handleSectionChange(id)` : `setActiveSection(id)` puis `setMobileMenuOpen(false)` (ferme le menu mobile après sélection).
  - Bouton collapse : `setSidebarCollapsed(!sidebarCollapsed)`.
  - Bouton menu mobile : `setMobileMenuOpen(!mobileMenuOpen)`.
- **`renderContent()`** (switch sur `activeSection`, chaque branche enveloppée dans `<Suspense fallback={fallback}>` où `fallback` est un `<PremiumLoading text="Chargement..." size="lg" overlay={false} />` centré) :
  - `'ventes'` (et `default`) → `<VentesContent />` (= `VentesEmbedded`, section 6bis.B.2).
  - `'commandes'` → `<CommandesPage embedded />`.
  - `'rdv'` → `<RdvPage embedded />`.
  - `'comptabilite'` → `<ComptabiliteFinancesContent />` (= `AdvancedDashboard`, composant hors périmètre de cette section).
  - `'clients'` → `<ClientsPage embedded />`.
  - `'produits'` → `<ProduitsPage embedded />`.
  - `'pointage'` → `<PointagePage embedded />`.
- **Structure visuelle** (uniquement les éléments porteurs de logique/état, le reste étant de la décoration Framer Motion : aurores animées, particules flottantes, halos, grilles, reflets « shine ») :
  1. Conteneur racine `Layout requireAuth` > fond dégradé + 3 blobs animés (violet/fuchsia/cyan) + grille + vignette (masqués sur mobile).
  2. **Navigation mobile** (`isMobile`) : barre sticky en haut avec bouton hamburger (icône `Menu`/`X`, libellé = `activeItem.shortLabel`) + rangée d'icônes horizontalement scrollable pour chaque `SIDEBAR_ITEMS` (icône active mise en évidence par `layoutId="mobileActiveGlow"`, badge rouge `tacheCount` sur l'icône `pointage` si `>0`) ; `AnimatePresence` pour un menu déroulant en grille 2 colonnes (label complet + badge tâches) qui s'affiche/se cache selon `mobileMenuOpen`.
  3. **Sidebar desktop** (`!isMobile`, `motion.aside` fixe à gauche, largeur `w-24`/`w-80` selon `sidebarCollapsed`) :
     - En-tête : logo « Crown » animé + titre « Dashboard » (dégradé violet→fuchsia→cyan) + sous-titre « Ultra Luxury Suite » (masqués si collapsed) + bouton chevron de collapse/expand.
     - Ligne de séparation animée en dégradé.
     - Navigation (`motion.nav`, animation en cascade `sidebarContainerVariants`/`sidebarItemVariants`) : un bouton par `SIDEBAR_ITEMS`, icône dans un badge à dégradé propre à l'item, libellé + sous-texte « module » (masqués si collapsed), losange (`Diamond`) affiché si actif, badge rouge pulsant `tacheCount` sur l'item `pointage`.
     - Pied de sidebar (masqué si collapsed) : carte « Ultra Premium — Enterprise Edition » avec icône `Gem` animée, éclair `Zap`, mention « Créé par Jean Rabemanalina — © 2026 Luxury Dashboard », étoile `Star` animée.
  4. **Zone principale** (`<main id="main-content">`) : glow décoratif positionné derrière le contenu (desktop), puis `AnimatePresence mode="wait"` encapsulant `renderContent()` avec transition d'entrée/sortie (`contentVariants` : fade + translation Y + scale, easing personnalisé).
  5. Lumières flottantes globales décoratives en bas de page (desktop uniquement).
- **Dépendances** : `framer-motion` (`motion`, `AnimatePresence`), `@/hooks/use-mobile`, `@/services/api/tacheApi`, `@/components/ui/badge`, `@/components/ui/premium-loading`, icônes `lucide-react`, `@/components/Layout`, `@/components/SEOHead`, `@/lib/utils` (`cn`).

### 6bis.B.2 `src/pages/VentesEmbedded.tsx` — contenu « Ventes & Produits » du Dashboard

- **Rôle** : composant intermédiaire chargé paresseusement par `DashboardPage` pour la section `ventes`. Reconstitue, à l'intérieur du Dashboard, l'ancien « mini-dashboard à onglets » (héritage d'une précédente version de l'application où le Dashboard entier était structuré en onglets Radix `Tabs`).
- **États locaux** : `activeTab: string` (défaut `'ventes'`), synchronisé via `Tabs onValueChange={setActiveTab}` ; `isMobile` via `useIsMobile()`.
- **Structure visuelle** :
  1. `<DashboardHero />` (bandeau héroïque, voir 6bis.B.3).
  2. `<Tabs defaultValue="ventes" onValueChange={setActiveTab}>` contenant :
     - Un bloc `motion.div` (carte glassmorphism) englobant `<DashboardTabNavigation activeTab isMobile />` (voir 6bis.B.4).
     - Un bloc `motion.div` (carte glassmorphism) englobant `<DashboardTabContent />` (voir 6bis.B.5), qui restitue le contenu selon la valeur active du composant `Tabs` (aucune prop `activeTab` transmise à `DashboardTabContent` : c'est le contexte interne de Radix `Tabs`/`TabsContent` qui gère l'affichage conditionnel, pas un `switch` React).
- **Aucun appel réseau propre** ; toute la donnée est gérée par les composants enfants (`VentesProduits`, `PretFamilles`, `PretProduits`, `DepenseDuMois`, `Inventaire`, `ProfitCalculator`, situés dans `src/components/dashboard/`, hors périmètre de cette section).
- **Dépendances** : `@/components/ui/tabs` (`Tabs`), `@/hooks/use-mobile`, `framer-motion`, `./dashboard` (`DashboardHero`, `DashboardTabNavigation`, `DashboardTabContent`).

### 6bis.B.3 `src/pages/dashboard/DashboardHero.tsx`

- **Rôle** : bandeau héroïque purement décoratif affiché en haut de `VentesEmbedded`. Aucun état, aucune prop, aucun appel API.
- **Contenu** : conteneur noir arrondi (`rounded-[40px]`) avec 3 aurores animées (violet/rose/indigo, `blur` via classes Tailwind), texture de bruit (`/images/noise.svg`), grille de fond, faisceau lumineux vertical animé, 12 particules flottantes générées aléatoirement (`Math.random()` sur `left`/`top`), deux anneaux orbitaux tournants (sens opposés, durées 50 s / 70 s). Badge « Dashboard Premium Intelligence » (icônes `Crown`+`Sparkles`), titre `h1` « Tableau de Bord » (icônes `Diamond`/`Gem` animées de part et d'autre, dégradé blanc→violet→rose avec `drop-shadow`), sous-titre descriptif, indicateur « LIVE DATA STREAM » (pastille verte pulsante + icône `Zap`, glow animé). Aucune donnée n'est réellement « live » : c'est un habillage visuel statique.
- **Dépendances** : `framer-motion`, icônes `lucide-react` (`Crown, Sparkles, Diamond, Gem, Star, Award, Zap`).

### 6bis.B.4 `src/pages/dashboard/DashboardTabNavigation.tsx`

- **Rôle** : barre de navigation par onglets (Radix `TabsList`/`TabsTrigger`) pour les 6 sous-modules du bloc « Ventes & Produits » du Dashboard.
- **Props** : `activeTab: string`, `isMobile?: boolean` (déclarée mais non utilisée dans le rendu — la responsivité est gérée uniquement par les classes Tailwind `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6`).
- **Configuration `TABS`** (ordre exact) :
  1. `ventes` — « Ventes Produits » / « Ventes » — icône `ShoppingCart`, badge `Sparkles`, dégradé purple→pink→purple.
  2. `pret-familles` — « Prêt Familles » / « Prêt » — icône `Users`, badge `Crown`, dégradé blue→cyan→blue.
  3. `pret-produits` — « Prêt Produits » / « Prêt » — icône `Package`, badge `Gem`, dégradé indigo→violet→indigo.
  4. `depenses` — « Dépenses du Mois » / « Dépenses » — icône `CreditCard`, badge `Zap`, dégradé rose→pink→rose.
  5. `inventaire` — « Inventaire » — icône `Archive`, badge `Diamond`, dégradé emerald→teal→emerald.
  6. `calcul-benefice` — « Calcul Bénéfice » / « Calcul » — icône `Calculator`, badge `Award`, dégradé amber→yellow→amber.
- **Logique** : pour chaque `tab`, `isActive = activeTab === tab.value` détermine les classes actives (`data-[state=active]:bg-gradient-to-r {tab.gradient}` + texte blanc) contre l'état par défaut (fond blanc/gris translucide) — mais la sélection réelle de l'onglet affiché reste pilotée par Radix `Tabs` via `value`/`onValueChange` dans le composant parent (`VentesEmbedded`), `activeTab` ici ne sert qu'à l'affichage stylistique cohérent avec l'état réel.
- **Structure visuelle** : conteneur glassmorphism arrondi avec 3 halos de fond décoratifs, `TabsList` en grille responsive (1/2/3/6 colonnes), chaque `TabsTrigger` = carte avec icône dans un badge, libellé, icône de « badge » décorative, animations hover/active (translation, scale, ombre).
- **Dépendances** : `@/components/ui/tabs`, `@/lib/utils` (`cn`), icônes `lucide-react`.

### 6bis.B.5 `src/pages/dashboard/DashboardTabContent.tsx`

- **Rôle** : restitue le contenu de chacun des 6 onglets définis par `DashboardTabNavigation`, sous forme de `TabsContent` Radix (affichage conditionnel automatique selon l'état interne du `Tabs` parent).
- **Configuration `TAB_CONTENTS`** (5 premières entrées, rendu via `.map`) : pour chaque entrée `{value, title, subtitle, icon, badgeIcon, gradient, shadowColor, titleGradient, component}` :
  - `ventes` → composant `<VentesProduits />`.
  - `pret-familles` → composant `<PretFamilles />`.
  - `pret-produits` → composant `<PretProduits />`.
  - `depenses` → composant `<DepenseDuMois />`.
  - `inventaire` → composant `<Inventaire />`.
  Chaque `TabsContent` affiche un en-tête standard via le sous-composant `TabHeader` (icône dans un carré à dégradé + badge décoratif superposé, titre en dégradé avec icône `Crown`, sous-titre) suivi du composant métier.
- **6ᵉ onglet `calcul-benefice`** (mise en page spéciale, codée en dur hors du tableau `TAB_CONTENTS`) : en-tête dédié (icône `Calculator` avec badge `Award` pulsant, titre « Calcul de Bénéfices » avec icône `Sparkles` tournante, sous-titre « Calculez vos marges et prix de vente optimaux »), puis carte dédiée contenant `<ProfitCalculator />`.
- **Composants métier réels** (logique hors périmètre de cette section, situés dans `src/components/dashboard/`) : `VentesProduits`, `PretFamilles`, `PretProduits`, `DepenseDuMois`, `Inventaire`, `ProfitCalculator`.
- **Dépendances** : `@/components/ui/tabs` (`TabsContent`), les 6 composants métier ci-dessus, icônes `lucide-react`.

### 6bis.B.6 `src/pages/dashboard/index.ts`

- **Rôle** : point d'entrée unique ré-exportant `DashboardHero`, `DashboardTabNavigation`, `DashboardTabContent` pour les imports groupés (`from './dashboard'`) utilisés par `VentesEmbedded`.

### 6bis.B.7 `src/pages/MessagesPage.tsx` — messagerie interne (route `/messages`)

- **Rôle** : boîte de réception des messages envoyés par les visiteurs via le formulaire de contact public (`ContactPage`, voir 6bis.A.3), consultable par les utilisateurs authentifiés. Gestion de la lecture/non-lecture, de la suppression, de la recherche, et de la mise à jour en temps réel via un service de synchronisation SSE.
- **Route** : `/messages`. Le composant lui-même gère la garde d'authentification (pas de `requireAuth` sur `<Layout>`) : si `!isAuthenticated`, affiche un écran « Accès Requis » dédié (carte glassmorphism, icône `MessageSquare`, pastille « Accès protégé ») avec `SEOHead(title="Accès requis")`, sans redirection automatique.
- **Hook central `useMessages()`** (`src/hooks/use-messages.ts`) :
  - États internes : `messages: Message[]`, `unreadCount: number`, `isLoading: boolean`.
  - `Message` : `{id, expediteurNom, expediteurEmail, expediteurTelephone?, sujet, contenu, destinataireId, dateEnvoi, lu}`.
  - `fetchMessages()` : `GET /api/messages` → `setMessages(response.data)` (si `isAuthenticated`).
  - `fetchUnreadCount()` : `GET /api/messages/unread-count` → `setUnreadCount(response.data.count)`.
  - `markAsRead(id)` : `PUT /api/messages/{id}/read`, met à jour localement `lu:true` et décrémente `unreadCount` (`Math.max(0, prev-1)`).
  - `markAsUnread(id)` : `PUT /api/messages/{id}/unread`, met à jour `lu:false` et incrémente `unreadCount`.
  - `deleteMessage(id)` : `DELETE /api/messages/{id}`, retire le message de la liste ; si le message supprimé était non lu, décrémente `unreadCount`.
  - `sendMessage(data)` : `POST /api/messages` (utilisé par `ContactPage`, pas par `MessagesPage`).
  - **Effet temps réel** : tant que `isAuthenticated && user`, s'abonne à `realtimeService.addDataListener(...)` (service SSE, voir `src/services/realtime/RealtimeService`, hors périmètre détaillé de cette section) ; à chaque évènement contenant `data.messages`, filtre les messages dont `destinataireId === user.id`, remplace intégralement `messages` par ce sous-ensemble et recalcule `unreadCount` à partir des messages filtrés non lus (`!msg.lu`). Désabonnement au démontage/changement d'utilisateur.
  - **Effet de chargement initial** : au montage (et à chaque changement d'authentification), appelle `fetchMessages()` et `fetchUnreadCount()`.
- **États locaux de la page** : `selectedMessage: Message | null` (message affiché en détail), `searchTerm: string`.
- **Handlers** :
  - `handleMarkAsRead(message)` / `handleMarkAsUnread(message)` : appellent le hook puis, si le message concerné est celui actuellement sélectionné, mettent à jour `selectedMessage` localement avec le nouveau statut `lu`.
  - `handleDelete(messageId)` : `deleteMessage(messageId)`, désélectionne si c'était le message affiché, toast de succès (« Message supprimé »).
  - `handleMessageClick(message)` : sélectionne le message (`setSelectedMessage`) et, s'il n'est pas encore lu, appelle immédiatement `handleMarkAsRead(message)` (marquage automatique à l'ouverture).
- **Filtrage** : `filteredMessages = messages.filter(m => m.expediteurNom.toLowerCase().includes(searchTerm) || m.sujet.toLowerCase().includes(searchTerm) || m.contenu.toLowerCase().includes(searchTerm))` (recherche insensible à la casse sur trois champs, aucun tri explicite appliqué : l'ordre reflète celui renvoyé par l'API/le flux temps réel).
- **États d'affichage globaux** : `isLoading` → `PremiumLoading` plein écran (`xl`, `overlay`) ; sinon page complète.
- **Structure visuelle de la page principale** (une fois authentifié et chargé) :
  1. Fond animé (aurores, grille, anneaux tournants, 30 particules) similaire à `ContactPage`/écran d'accès requis.
  2. **En-tête** : badge « Messagerie Premium », titre « Votre Messagerie. », description, puis deux pastilles statistiques : total de messages (icône `MessageSquare`) et, si `unreadCount>0`, pastille rouge animée « {n} non lu(s) » (icône `Mail` avec point pulsant), qui apparaît/disparaît via `AnimatePresence`.
  3. **Grille principale** `lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]` :
     - **Colonne liste** (carte glassmorphism) : en-tête « Boîte de réception » (icône `Mail` + badge `Crown` tournant) et pastille « Active » (point vert pulsant), champ de recherche (`Input` avec icône `Search`, lié à `searchTerm`). Corps : si `filteredMessages.length===0`, état vide (icône `MessageSquare`, texte « Aucun message trouvé », suggestion si recherche active) ; sinon liste scrollable (`max-h-[700px]`) de cartes-lignes cliquables, chacune avec : barre latérale colorée (dégradé si sélectionnée, verte si non lue, transparente sinon), icône utilisateur (mise en évidence verte si non lu), nom de l'expéditeur, sujet, extrait du contenu, date relative (`formatDistanceToNow` avec locale `fr`), badge « Non lu » le cas échéant.
     - **Colonne détail** : si `selectedMessage` est défini, carte affichant l'en-tête complet (sujet, expéditeur, email, téléphone optionnel, date complète `toLocaleString('fr-FR')`), boutons d'action « Lu »/« Non lu » (bascule `handleMarkAsRead`/`handleMarkAsUnread`) et « Supprimer » (ouvre une `AlertDialog` de confirmation avant d'appeler `handleDelete`), puis le corps du message (`whitespace-pre-wrap`) dans un bloc mis en valeur. Si aucun message sélectionné, état vide illustré invitant à choisir un message dans la liste.
- **Dépendances** : `@/hooks/use-messages`, `@/contexts/AuthContext`, `@/hooks/use-toast`, `date-fns` (`formatDistanceToNow`, locale `fr`), `@/components/ui/*` (`card`, `badge`, `alert-dialog`, `input`), `framer-motion`, `@/components/Layout`, `@/components/SEOHead`, `@/components/ui/premium-loading`, icônes `lucide-react`.
- **Service temps réel sous-jacent** : `src/services/realtimeService.ts` ré-exporte `realtimeService` (et les types `SyncData`/`SyncEvent`) depuis `src/services/realtime/RealtimeService` — implémentation (connexion SSE, reconnexion, distribution des évènements aux listeners) hors périmètre détaillé de cette section, mais c'est cette instance unique qui alimente en direct `useMessages` (et d'autres hooks de l'application) sans polling explicite côté `MessagesPage`.

### 6bis.B.8 `src/pages/Ventes.tsx`, `src/pages/Comptabilite.tsx`, `src/pages/Depenses.tsx`, `src/pages/Produits.tsx` — redirections legacy vers le Dashboard

- **Rôle commun** : ces quatre fichiers sont des coquilles vides de compatibilité. Chacun contient exactement `return <Navigate to="/" replace />;`, sans état, effet, ni appel API.
- **Commentaires en tête de fichier** (pour mémoire lors d'une reconstruction à l'identique) :
  - `Ventes.tsx` : « Redirection vers la page ventes dans le dashboard » / « Redirige vers la page Dashboard qui contient la gestion des ventes ».
  - `Comptabilite.tsx` : « Redirection vers la page comptabilité dans le dashboard » / « Redirige vers la page Dashboard qui contient la comptabilité ».
  - `Depenses.tsx` : « Redirection vers la page dépenses dans le dashboard » / « Redirige vers la page Dashboard qui contient la gestion des dépenses ».
  - `Produits.tsx` : « Redirige vers la page Dashboard qui contient la gestion des produits ».
- **Justification métier** : toutes les fonctionnalités historiquement portées par des pages dédiées (Ventes, Comptabilité, Dépenses, Produits) ont été fusionnées dans `DashboardPage` (sections `ventes`/`comptabilite`/`produits`) ou dans l'onglet `depenses` de `VentesEmbedded`/`DashboardTabContent` ; ces fichiers-route ne sont conservés que pour ne pas casser d'anciens liens ou favoris. `Produits.tsx` est distinct de `src/pages/ProduitsPage.tsx` (composant réel embarqué dans le Dashboard, hors périmètre de cette section).

### 6bis.B.9 `src/pages/Index.tsx` — redirection racine legacy

- **Rôle** : composant de redirection pure : `return <Navigate to="/home" replace />;`. Commentaire : « Composant de la page d'index — Redirige automatiquement vers la page d'accueil ». Aucun état, aucun effet.
- **Remarque de cohérence** : ce fichier redirige vers `/home` (page marketing `HomePage`), alors que `Ventes.tsx`/`Comptabilite.tsx`/`Depenses.tsx`/`Produits.tsx` redirigent vers `/` (qui héberge `DashboardPage` pour un utilisateur authentifié). `Index.tsx` n'est utilisé que si une route historique pointait explicitement vers ce composant (non nécessairement montée dans le routeur actuel — à vérifier/recréer selon `App.tsx` au moment de la reconstruction).

### 6bis.B.10 `src/pages/Tendances.tsx` — ancienne page de rapports (variante minimale, non liée à `TendancesPage`)

- **Rôle** : page **distincte** de `TendancesPage.tsx` (voir 6bis.B.11), plus ancienne et beaucoup plus simple : se contente d'orchestrer deux composants de reporting préexistants dans un système d'onglets à deux entrées, sans aucun calcul propre.
- **États locaux/effets/handlers** : aucun (composant purement structurel, `Tabs defaultValue="reports"` non contrôlé).
- **Structure visuelle** : `Layout` > titre « Tendances et Analyses » > `Tabs` avec deux `TabsTrigger` (« Rapports de Ventes » / « Rapports » en libellé court mobile, et « Évolution des Profits » / « Profits ») > `TabsContent` correspondants rendant respectivement `<SalesReport />` et `<ProfitEvolution />` (composants de `src/components/dashboard/reports/`, logique hors périmètre de cette section).
- **Dépendances** : `@/components/Layout`, `@/components/dashboard/reports/SalesReport`, `@/components/dashboard/reports/ProfitEvolution`, `@/components/ui/tabs`.

### 6bis.B.11 `src/pages/TendancesPage.tsx` — page d'analyse des tendances (analytics de ventes)

- **Rôle** : tableau de bord analytique complet calculant, entièrement côté client à partir des données globales de l'application (`AppContext`), des statistiques de ventes/bénéfices/stock/clients, sans aucun appel réseau propre ni aucune IA externe (le nom « intelligence » désigne uniquement l'onglet de prévention de stock, calculé par de simples règles arithmétiques).
- **Props** : `embedded?: boolean` (défaut `false`) — si `true`, le composant retourne son contenu sans l'envelopper dans `<Layout requireAuth>` (utilisé pour une intégration dans une autre page/onglet) ; le chargement (`loading`) utilise alors `PremiumLoading` sans `overlay`.
- **Données sources** : `const { allSales, products, loading } = useApp()` (contexte global de l'application, hors périmètre détaillé de cette section — fournit l'ensemble des ventes et produits déjà chargés ailleurs dans l'app).
- **États locaux** : `activeTab: string` (défaut `'overview'`, piloté par `Tabs onValueChange`), `activeModal: 'ventes' | 'benefices' | 'produits' | 'roi' | null` (défaut `null`, contrôle l'ouverture des 4 modales statistiques).
- **`formatCurrency(value)`** : `new Intl.NumberFormat('fr-FR', {style:'currency', currency:'EUR'}).format(value)`.
- **Hook `useTendancesData(allSales, products)`** (`src/pages/tendances/useTendancesData.ts`) — cœur du calcul, entièrement basé sur `useMemo` :
  - **`getProductCategory(description)`** (fonction utilitaire exportée) : retourne `null` si la description contient « avance » (vente exclue des statistiques) ; sinon `'Tissages'` si elle contient « tissage », `'Perruques'` si elle contient « perruque », `'Accessoires'` si elle contient « colle » ou « disolvant », sinon `'Autres'`.
  - **`getSaleValues(sale)`** (utilitaire exporté) : si `sale.products[]` existe (vente multi-produits), somme `sellingPrice`/`quantitySold`/`profit` pour les seuls produits dont la catégorie n'est pas `null` (exclusion des avances) ; sinon utilise directement les champs `sellingPrice`/`quantitySold`/`profit` de la vente si présents ; sinon renvoie des zéros.
  - **`filteredSales`** : sous-ensemble de `allSales` excluant toute vente entièrement composée de produits « avance » (au moins un produit de catégorie non nulle doit être présent, testé via `sale.products.some(...)` ou directement `getProductCategory(sale.description)`).
  - **`stockAnalysis.recommendations`** : produits dont `quantity <= 10`, enrichis de `currentStock`, `totalSold` et `totalProfit` (agrégés à partir des ventes filtrées correspondant au produit, gérant à la fois les ventes multi-produits et simples), `averageProfit = totalProfit / productSales.length` (0 si aucune vente), `priority` = `'URGENT'` si `quantity<=2`, `'ÉLEVÉE'` si `quantity<=5`, sinon `'MOYENNE'` ; trié par `averageProfit` décroissant.
  - **`dailySalesAnalysis`** : agrège, pour le **mois calendaire courant uniquement** (comparaison de `monthKey` avec le mois de `new Date()`), les ventes par jour du mois (`{jour, ventes, benefice, quantite}`), trié par `jour` croissant.
  - **`salesByProduct`** (top 15) : agrège par nom de produit (tronqué à 50 caractères avec `...`, en excluant systématiquement les produits de catégorie `null`) les champs `ventes` (= somme `sellingPrice*quantitySold`), `benefice`, `quantite`, `prixAchat` (= somme `purchasePrice*quantitySold`), `count` (nombre d'occurrences de vente), `category` ; trié par `benefice` décroissant, tronqué aux 15 premiers.
  - **`salesByCategory`** : même agrégation mais regroupée par `category` (4 catégories possibles), sans tri explicite ni limite.
  - **`salesOverTime`** : agrégation mensuelle (`{mois:'YYYY-MM', monthName, ventes, benefice, quantite}` via `getSaleValues`), triée par clé `mois` croissante (`localeCompare`).
  - **`salesData.totals`** : `{revenue, quantity, sales: filteredSales.length, profit}` — sommes globales sur `filteredSales` via `getSaleValues`.
  - **`topProfitableProducts`** : `salesByProduct` filtré sur `benefice>0`, trié décroissant, tronqué à 10.
  - **`buyingRecommendations`** (top 12) : `salesByProduct` filtré sur `benefice>30 && prixAchat>0`, trié par **ROI** décroissant (`benefice/prixAchat`), tronqué à 12, chaque entrée enrichie de `roi = (benefice/prixAchat*100).toFixed(1)` et `avgProfit = (benefice/count).toFixed(2)`.
  - **`clientsData`** : agrégation par `clientName` (ignore les ventes sans nom de client renseigné) de `totalSpent`, `totalProfit`, `purchaseCount`, `lastPurchase` (date ISO la plus récente, comparaison lexicographique de chaînes `YYYY-MM-DD`) et de la liste brute `sales[]` associée ; puis calcul de `avgBasket = totalSpent/purchaseCount` et formatage FR de `lastPurchase` ; trié par `totalSpent` décroissant (sans limite de nombre).
- **Rendu conditionnel** : si `loading` (issu de `AppContext`), affiche `PremiumLoading` (avec ou sans `overlay` selon `embedded`) enveloppé ou non dans `Layout requireAuth`.
- **Structure visuelle** (fond dégradé slate/émeraude/violet, `container mx-auto`) :
  1. `<TendancesHero />` (bandeau héroïque, voir 6bis.B.12).
  2. `<TendancesStatsCards>` (voir 6bis.B.13) recevant `revenue`, `profit`, `salesCount`, `quantity`, `uniqueProducts = salesByProduct.length`, `buyingRecommendations`, `onOpenModal=setActiveModal`, `formatCurrency`.
  3. `<Tabs defaultValue="overview" onValueChange={setActiveTab}>` avec `<TendancesTabNavigation activeTab isMobile>` (voir 6bis.B.14) et 6 `TabsContent` :
     - `overview` → `<TendancesOverviewTab salesOverTime topProfitableProducts>` (voir 6bis.B.15).
     - `products` → `<TendancesProductsTab salesByProduct>` (voir 6bis.B.16).
     - `categories` → `<TendancesCategoriesTab salesByCategory>` (voir 6bis.B.17).
     - `recommendations` → `<TendancesRecommendationsTab buyingRecommendations>` (voir 6bis.B.18).
     - `clients` → `<TendancesClientsTab clientsData>` (voir 6bis.B.19).
     - `intelligence` → `<TendancesStockTab stockAnalysis dailySalesAnalysis salesData>` (voir 6bis.B.20).
  4. Quatre modales statistiques (`src/components/tendances/TendancesStatsModals`, hors périmètre détaillé) contrôlées par `activeModal` : `VentesTotalesModal` (revenu, ventes, `salesByProduct`), `BeneficesModal` (profit, `margin = profit/revenue*100` si `revenue>0` sinon 0, `salesByProduct`), `ProduitsVendusModal` (quantité, `uniqueProducts`, `salesByProduct`), `MeilleurRoiModal` (`buyingRecommendations`) ; chacune fermée via `onClose={() => setActiveModal(null)}`.
- **Dépendances** : `@/contexts/AppContext` (`useApp`), `@/hooks/use-mobile`, `@/components/ui/tabs`, `@/components/ui/premium-loading`, `@/components/tendances/TendancesStatsModals`, tous les sous-composants `src/pages/tendances/*`.

### 6bis.B.12 `src/pages/tendances/TendancesHero.tsx`

- **Rôle** : bandeau héroïque décoratif de `TendancesPage`, sans état ni logique. Deux halos animés (émeraude/violet), badge « Analyse des tendances en temps réel » (icônes `TrendingUp`+`Sparkles`), titre principal (non affiché intégralement dans le code lu mais suit le même schéma que les autres pages : dégradé + emphase visuelle).
- **Dépendances** : `framer-motion`, icônes `lucide-react`.

### 6bis.B.13 `src/pages/tendances/TendancesStatsCards.tsx`

- **Rôle** : grille de 4 cartes statistiques cliquables synthétisant les indicateurs clés.
- **Props** : `revenue`, `profit`, `salesCount`, `quantity`, `uniqueProducts`, `buyingRecommendations: any[]`, `onOpenModal(type)`, `formatCurrency(value)`.
- **Cartes** (grille `md:grid-cols-2 lg:grid-cols-4`, chacune `whileHover={{scale:1.03,y:-5}}`, `onClick={() => onOpenModal(type)}`) :
  1. **Ventes Totales** (`type='ventes'`) : dégradé purple→indigo, icône `DollarSign`, valeur = `formatCurrency(revenue)`, sous-texte « +{salesCount} transactions historiques ».
  2. **Bénéfices** (`type='benefices'`) — logique similaire non entièrement affichée mais suit le même schéma (valeur = `formatCurrency(profit)`).
  3. **Produits Vendus** (`type='produits'`) — valeur liée à `quantity`/`uniqueProducts`.
  4. **Meilleur ROI** (`type='roi'`) — valeur dérivée du premier élément de `buyingRecommendations`.
- **Dépendances** : `@/components/ui/card`, `framer-motion`, icônes `lucide-react` (`DollarSign, TrendingUp, Package, Award, Sparkles`).

### 6bis.B.14 `src/pages/tendances/TendancesTabNavigation.tsx`

- **Rôle** : navigation par onglets de `TendancesPage` (Radix `TabsList`/`TabsTrigger`).
- **Props** : `activeTab: string`, `isMobile: boolean`.
- **Onglets** (ordre exact) : `overview` (« Vue d'ensemble », `TrendingUp`, dégradé emerald→blue), `products` (« Par Produits », `ShoppingCart`, dégradé purple→pink), `categories` (« Par Catégories », `Target`, dégradé orange→red), `clients` (« Par Clients », `Users`, dégradé indigo→violet), `recommendations` (« Recommandations », `Sparkles`, dégradé yellow→orange), `intelligence` (« Prévention Stock », `AlertTriangle`, dégradé red→pink).
- **Disposition** : `grid-cols-2` sur mobile (`isMobile`), `grid-cols-6` sur desktop. Style actif : fond dégradé propre à l'onglet + texte blanc + `scale-105` ; inactif : texte gris avec hover.
- **Dépendances** : `@/components/ui/tabs`, `@/lib/utils`, icônes `lucide-react`.

### 6bis.B.15 `src/pages/tendances/TendancesOverviewTab.tsx`

- **Rôle** : onglet « Vue d'ensemble », deux graphiques `recharts` côte à côte (`grid lg:grid-cols-2`).
- **Props** : `salesOverTime: any[]`, `topProfitableProducts: any[]`.
- **Graphique 1 — Évolution des Ventes** : `AreaChart` (hauteur 300px) sur `salesOverTime`, deux aires en dégradé (`ventes` en violet `#8B5CF6`, `benefice` en vert `#06D6A0`), axe X = `monthName`, tooltip personnalisé listant chaque série avec sa couleur et sa valeur formatée (`toLocaleString()` + « € »), légende.
- **Graphique 2 — Top 10 Produits les Plus Rentables** : `BarChart` (hauteur 400px) sur `topProfitableProducts.slice(0,10)`, axe X = `name` (labels inclinés à -45°), une seule barre `benefice` en dégradé vert, tooltip personnalisé affichant `fullName`, `benefice`, `quantite`, `ventes`.
- **Dépendances** : `recharts`, `@/components/ui/chart` (`ChartTooltip`), `@/components/ui/card`, icônes `lucide-react`.

### 6bis.B.16 `src/pages/tendances/TendancesProductsTab.tsx`

- **Rôle** : onglet « Par Produits », un unique `BarChart` groupé (hauteur 400px) sur `salesByProduct.slice(0,12)` avec 3 barres par produit : `ventes` (violet `#8B5CF6`), `benefice` (vert `#06D6A0`), `prixAchat` (orange `#F59E0B`) ; axe X = `name` incliné, tooltip listant chaque série.
- **Props** : `salesByProduct: any[]`.
- **Dépendances** : `recharts`, `@/components/ui/chart`, `@/components/ui/card`.

### 6bis.B.17 `src/pages/tendances/TendancesCategoriesTab.tsx`

- **Rôle** : onglet « Par Catégories », deux graphiques côte à côte.
- **Props** : `salesByCategory: any[]`.
- **`categoryColors`** (constante) : couleurs fixes par catégorie (`Perruques`→violet `#8B5CF6`, `Tissages`→vert `#06D6A0`, `Accessoires`→orange `#F59E0B`, `Autres`→gris `#6B7280`), avec palette de secours `fallbackColors` pour toute catégorie non prévue.
- **Graphique 1 — Répartition des Ventes par Catégorie** : `PieChart` en anneau (`innerRadius=60, outerRadius=120`) sur `salesByCategory`, `dataKey="ventes"`, couleur de chaque part via `categoryColors[entry.category]` (fallback sur `fallbackColors[index % length]`), tooltip affichant catégorie + montant.
- **Graphique 2 — Bénéfices par Catégorie** : `BarChart` simple, une barre `benefice` verte par catégorie (axe X = `category`).
- **Dépendances** : `recharts`, `@/components/ui/chart`, `@/components/ui/card`, icônes `lucide-react` (`Target`, `Award`).

### 6bis.B.18 `src/pages/tendances/TendancesRecommendationsTab.tsx`

- **Rôle** : onglet « Recommandations », grille de cartes présentant les 12 produits `buyingRecommendations` triés par ROI décroissant (tri déjà effectué en amont par le hook).
- **Props** : `buyingRecommendations: any[]`.
- **Contenu de chaque carte** (grille `md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, `hover:scale-105`) : pastille de rang colorée (or/argent/bronze pour les 3 premiers, vert sinon), `#{index+1}`, ROI en grand (`+{product.roi}%`), nom tronqué du produit (`title` = nom complet), puis détails : bénéfice total, bénéfice moyen (`avgProfit`), prix d'achat unitaire (`prixAchat/count`), nombre de ventes (`count`), catégorie.
- **État vide** : si `buyingRecommendations.length===0`, message « Pas encore assez de données pour générer des recommandations. Continuez à enregistrer vos ventes ! » (icône `Package`).
- **Dépendances** : `@/components/ui/card`, `@/lib/utils` (`cn`), icônes `lucide-react` (`Sparkles`, `Package`).

### 6bis.B.19 `src/pages/tendances/TendancesClientsTab.tsx`

- **Rôle** : onglet « Par Clients », analyse détaillée du portefeuille clients avec classement, graphiques et fiche client modale.
- **Props** : `clientsData: ClientData[]` (`{name, totalSpent, totalProfit, purchaseCount, avgBasket, lastPurchase, sales?}`).
- **États locaux** : `sortDirection: 'desc' | 'asc'` (défaut `'desc'`), `selectedClient: ClientData | null` (défaut `null`, ouvre la modale de détail).
- **Calculs mémoïsés** :
  - `sortedClients` (`useMemo` sur `[clientsData, sortDirection]`) : copie triée de `clientsData` par `totalSpent`, ordre selon `sortDirection`.
  - `top10Clients = sortedClients.slice(0,10)`.
  - `top5Pie = clientsData.slice(0,5)` et `othersTotal = sum(clientsData.slice(5).totalSpent)` ; `pieData` = les 5 premiers clients + une entrée « Autres » si `othersTotal>0`.
  - `formatCurrency(amount)` : `Intl.NumberFormat('fr-FR', {style:'currency', currency:'EUR'})`.
  - `isRegularClient(client)` : `purchaseCount > 1`.
  - `getClientRefunds(client)` : filtre `client.sales` sur `s.isRefund || (s.totalSellingPrice || s.sellingPrice || 0) < 0` (détection de remboursements/ventes négatives).
- **Handlers** : clic sur l'en-tête « CA Total » du tableau → `setSortDirection(prev => prev==='desc'?'asc':'desc')` (bascule tri croissant/décroissant, icônes `ArrowDown`/`ArrowUp`) ; clic sur une ligne de client → `setSelectedClient(client)` (ouvre la modale) ; fermeture de la modale (`Dialog onOpenChange`) → `setSelectedClient(null)`.
- **Structure visuelle** :
  1. 3 cartes KPI : « Clients actifs » (`clientsData.length`), « Meilleur client » (nom + CA de `top10Clients[0]`), « Panier moyen global » (moyenne de `avgBasket` sur tous les clients).
  2. Grille `lg:grid-cols-2` : `BarChart` horizontal (`layout="vertical"`) du Top 10 clients par CA (tooltip détaillant CA/bénéfice/achats/panier moyen), et `PieChart` en anneau de répartition du CA (`pieData`, couleurs cycliques `clientColors`).
  3. Tableau complet (jusqu'à 20 lignes, `sortedClients.slice(0,20)`) : rang (médaille or/argent/bronze pour le podium), nom, CA total (colonne triable), bénéfice, nombre d'achats, panier moyen, date du dernier achat ; chaque ligne cliquable ouvre la modale de détail.
  4. **Modale de détail client** (`Dialog`) : en-tête avec nom du client, 4 KPI (CA total, bénéfice, nombre d'achats, panier moyen), badges de statut (« Client régulier » si `isRegularClient`, sinon « Achat unique » ; badge rouge « {n} remboursement(s) » si `getClientRefunds(client).length>0` ; badge « Dernier achat: {date} »), puis liste scrollable de l'historique des ventes du client (icône remboursement `RotateCcw` si applicable).
- **Dépendances** : `recharts`, `@/components/ui/chart`, `@/components/ui/dialog`, `@/components/ui/card`, `@/components/ui/badge`, `@/components/ui/button`, `framer-motion`, icônes `lucide-react`.

### 6bis.B.20 `src/pages/tendances/TendancesStockTab.tsx`

- **Rôle** : onglet « Prévention Stock » (valeur `intelligence` dans la navigation), combinant alertes de réapprovisionnement et suggestions textuelles générées par de simples règles (pas de modèle d'IA).
- **Props** : `stockAnalysis: {recommendations: any[]}`, `dailySalesAnalysis: any[]`, `salesData: {totals:{revenue,profit}}`.
- **Colonne « Alertes Stock Critique »** : liste des `stockAnalysis.recommendations` (déjà calculées/triées par le hook), chaque carte affichant la description du produit, le stock restant, la quantité vendue, le bénéfice moyen, et une **priorité recalculée localement** (redondante avec celle du hook) : `URGENT` si `currentStock<=2`, `ÉLEVÉE` si `<=5`, sinon `MOYENNE`. État vide : « Aucune alerte stock critique » (icône `Package`).
- **Colonne « Recommandations IA »** (texte généré par règles simples, aucun appel réseau ni modèle) :
  - Bloc « Tendances Identifiées » : phrase conditionnelle « Les ventes sont plus élevées/plus faibles en milieu de mois » selon `dailySalesAnalysis.length > 15` ; mention fixe « Catégorie la plus rentable: Perruques » (texte codé en dur, non recalculé dynamiquement) ; marge bénéficiaire moyenne = `(profit/revenue*100).toFixed(1)` si `revenue>0` sinon `0`.
  - Bloc « Actions Recommandées » : « Réapprovisionner {n} produits critiques » (`n = stockAnalysis.recommendations.length`), plus deux recommandations textuelles fixes (« Focus sur les perruques », « Optimiser les ventes en début de mois »).
- **Dépendances** : `@/components/ui/card`, icônes `lucide-react` (`AlertTriangle, Sparkles, Package`).

### 6bis.B.21 `src/pages/tendances/index.ts`

- **Rôle** : point d'entrée ré-exportant l'ensemble des sous-composants `tendances/*` (hero, cartes stats, navigation, les 6 onglets, et potentiellement le hook) pour faciliter les imports groupés depuis `TendancesPage.tsx` — dans la pratique, `TendancesPage.tsx` importe cependant chaque module individuellement via son chemin complet plutôt que par cet index.

### 6bis.B.22 Synthèse des redirections legacy couvertes par cette section

| Fichier | Cible de redirection | Fonctionnalité réellement hébergée ailleurs |
|---|---|---|
| `src/pages/Index.tsx` | `/home` | `HomePage` (page marketing, section 6bis.A.1) |
| `src/pages/Ventes.tsx` | `/` | Section `ventes` de `DashboardPage` → `VentesEmbedded` |
| `src/pages/Comptabilite.tsx` | `/` | Section `comptabilite` de `DashboardPage` → `AdvancedDashboard` |
| `src/pages/Depenses.tsx` | `/` | Onglet `depenses` de `DashboardTabContent` → `DepenseDuMois` |
| `src/pages/Produits.tsx` | `/` | Section `produits` de `DashboardPage` → `ProduitsPage` |

Aucun de ces cinq fichiers ne doit comporter de logique supplémentaire lors d'une reconstruction à l'identique : ce sont des composants fonctionnels d'une seule ligne utile (`return <Navigate to="..." replace />;`), sans état, effet, ni import autre que `React` et `Navigate` de `react-router-dom`.
