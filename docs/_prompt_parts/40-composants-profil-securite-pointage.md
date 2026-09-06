## 7quater. LOGIQUE DÉTAILLÉE — Profil, Paramètres, Sécurité, Pointage, Partage, Navigation

Cette section documente exhaustivement tous les composants de `src/components/profile`, `pointage`, `security`, `session`, `maintenance`, `livechat`, `notifications`, `navbar`, `navigation`, `shared`, `common`, `accessibility` et les composants racine de `src/components`. Stack : React 18 + Vite + TS + Tailwind, backend Express avec bases JSON fichiers, SSE pour le temps réel, framer-motion pour toutes les animations, shadcn/ui pour les primitives (Dialog, AlertDialog, Select, Input, Button…).

---

### A. PROFIL — `src/components/profile/*`

#### A.1 Vue d'ensemble
La page Profil comporte 3 onglets pilotés par `ProfileTabsNav` : **Profil**, **Paramètres** (visible si `canSeeSettings`), **Sécurité** (visible uniquement pour `administrateur principale`). Chaque onglet assemble plusieurs cartes/sections indépendantes.

#### A.2 `ProfileHero.tsx`
En-tête animée (aurores, grille, particules, scanline) sur fond noir, titre "Mon Profil" avec icône `User`, badges Sécurisé/Actif/Personnalisé/Contrôle total. Purement présentationnel, aucune prop, aucun état.

#### A.3 `ProfileTabsNav.tsx`
Props : `activeTab`, `setActiveTab`, `canSeeSettings`, `isAdminPrincipal`. Affiche 3 boutons `Button` avec dégradés différents par onglet actif (violet/fuchsia pour Profil, amber/orange pour Paramètres, rouge/rose pour Sécurité). Les boutons Paramètres/Sécurité sont conditionnellement rendus.

#### A.4 `ProfileCard.tsx` + `ProfileAvatar.tsx`
`ProfileCard` : carte glassmorphism affichant `ProfileAvatar`, nom complet (gradient), email, badge de rôle (`Shield` icon), statut "En ligne" (pastille verte pulsante). Props : `photoUrl`, `firstName`, `lastName`, `email`, `userRole`, `onClickUpload`.
`ProfileAvatar` : avatar 160×160 avec 2 anneaux `greenPulse` animés en CSS keyframes (décalés de 0.5s), bouton caméra en bas à droite. Clic → déclenche `onClickUpload` (ouverture sélecteur de fichier).

#### A.5 `ProfileInfoCard.tsx`
Édition des informations personnelles : Prénom, Nom, Email (lecture seule), Téléphone, Adresse, Genre (select Homme/Femme/Autre). Mode lecture vs mode édition (`editing` bool). Boutons Modifier / Annuler / Enregistrer. Grille 2 colonnes avec effet hover `y:-4`.

#### A.6 `ProfileConfirmDialogs.tsx`
Regroupe 3 `AlertDialog` : confirmation modification du profil (`confirmProfile`/`onSaveProfile`), confirmation changement de mot de passe (`confirmPassword`/`onChangePassword`), confirmation upload photo avec prévisualisation (`confirmPhoto`/`photoPreview`/`onUploadPhoto`). Chaque action a un état `saving` désactivant les boutons pendant l'appel réseau.

#### A.7 `PasswordSection.tsx`
Formulaire de changement de mot de passe (masqué par défaut derrière bouton "Changer le mot de passe"). 3 champs : mot de passe actuel, nouveau, confirmation, chacun avec toggle œil. `PasswordStrengthChecker` évalue le nouveau mot de passe (`isNewPasswordValid`). Le bouton Valider est désactivé tant que tous les champs ne sont pas remplis + mot de passe valide. Règles backend (`server/routes/profile.js`) : min 6 caractères, majuscule + minuscule + chiffre + caractère spécial obligatoires, nouveau ≠ ancien.

#### A.8 `ParametresSection.tsx` — Paramètres généraux ⚠️ CŒUR MÉTIER SAUVEGARDE
Props : `userRole`. `isAdminPrincipal` = `role === 'administrateur principale'`, `isAdmin` inclut aussi `'administrateur'`.

**Sections pliables** (`expandedSections`) : notifications, display, security, backup — chacune avec `SectionHeader` (icône + chevron) et composant `Toggle` (interrupteur animé).

**Sauvegarde manuelle chiffrée** (`handleBackup`) :
- Appelle `settingsApi.backupData(backupCode)` → reçoit `{ backup, filename }`.
- Le code de sauvegarde doit respecter `PasswordStrengthChecker` (`isBackupCodeValid`).
- Télécharge un fichier JSON (Blob + `<a download>`).
- Annule tout auto-backup en cours (`manualBackupDoneRef.current = true`, `clearAutoBackupCountdown()`).

**Sauvegarde automatique (auto-backup) — logique complète** :
- Poll `/api/settings/auto-sauvegarde` (flag serveur ON/OFF) et `/api/sync/status` toutes les 5s (`syncAutoBackupState`).
- Le serveur renvoie un `autoBackupState` avec `signal`, `activationId`, `countdownStartedAt`, `countdownDurationMs` (par défaut 5 min), `lastChangeAt`.
- Quand `lastChangeAt` change → réinitialise `manualBackupDoneRef` et `blockedActivationIdRef` (nouvelles données détectées côté serveur).
- Si `signal` actif avec un nouvel `activationId` → démarre un countdown local synchronisé sur le timestamp serveur (`startAutoBackupCountdown`), affiché via `autoBackupPending`/`countdownSeconds`.
- À expiration du countdown (`triggerAutoBackup`) :
  - Lit le mot de passe stocké en base64 dans `sessionStorage['_abk']` (mot de passe de session, jamais en clair).
  - Si absent → bloque cette activation (`blockedActivationIdRef`) et annule silencieusement.
  - Sinon, appelle `settingsApi.autoBackup(password)`, télécharge automatiquement le fichier (nom auto-généré `auto-backup-riziky-{nom}-{date}.json` si le serveur n'a pas fourni de nom exploitable), toast bleu de confirmation.
  - En cas d'échec réseau → toast d'erreur et arrêt du countdown.
- `autoBackupPaused` reflète le flag serveur `auto-sauvegarde` (bouton pause/reprise quelque part dans l'UI globale) — si en pause, aucun countdown ne démarre.
- Le countdown est **partagé entre admins** via le serveur (même `activationId`), garantissant une synchronisation multi-session.

**Restauration** (`handleRestore`) :
- Upload d'un fichier `.json` → parsing local, ouverture `showRestoreDialog` avec code de déchiffrement (`restoreCode`, `isRestoreCodeValid`).
- Appel `settingsApi.restoreData(restoreFile, restoreCode)`.
- Si `result.status === 'unchanged'` → toast jaune "Aucune nouvelle donnée" (le serveur détecte les doublons et n'injecte rien).
- Sinon toast vert de succès + `fetchSettings()`.
- Erreur → "Code incorrect ou fichier corrompu".

**Suppression sélective** : bouton ouvrant `BulkDeleteModal` (voir A.9).

**Sous-sections intégrées** : `IndisponibiliteSection` (congés admin), `ModuleSettingsSection` (paramètres par module incluant Pointage Auto).

#### A.9 `BulkDeleteModal.tsx` — Suppression sélective de données
Modale multi-étapes (`step`: `choose-type` → `choose-filter` (ventes seulement) → `select-items` → confirmation implicite via bouton).
- **Types supportés** : `sales`, `products`, `clients`, `notes`.
- Pour `sales` : filtrage supplémentaire par période (Toutes / Année / Mois+Année), chargement des années disponibles via l'API (`GET /api/settings/bulk-data?type=sales`).
- Sélection multiple avec case à cocher "Tout sélectionner", recherche texte (`filteredItems`).
- Suppression : `POST /api/settings/bulk-delete` avec `{ type, ids }` ou `{ type, deleteAll: true, year?, month? }` si tout est sélectionné.
- Toast succès avec message serveur, fermeture automatique.
- **Ce qu'il faut implémenter** : reproduire exactement les 4 types de données, le flux à 3 étapes, le fait que la suppression "tout" avec filtre année/mois transmette ce filtre au lieu d'une liste d'ids.

#### A.10 `IndisponibiliteSection.tsx` — Jours indisponibles / congés admin
- CRUD complet sur `indisponibleApi` (`server/db` dédié).
- Formulaire d'ajout : date, heure début/fin, motif, "journée complète" (switch), "exception" (switch visible seulement si journée complète — permet une exception ponctuelle dans une récurrence), récurrence `once` ou `weekly` (avec nombre de semaines 2 à 52).
- Les entrées récurrentes partagent un `groupId` ; `IndisponibiliteSection` les regroupe (`GroupedIndispo`) pour affichage compact ("Chaque lundi ×4").
- Seuls les groupes ayant au moins une date ≥ aujourd'hui sont affichés (`activeGroups`).
- Édition d'un groupe : modification des dates sélectionnées individuellement (`editSelectedDates`), possibilité de cocher/décocher certaines dates du groupe.
- Suppression : groupe entier (`deleteGroup(groupId)`) ou entrée seule.
- Un bouton "Afficher" ouvre un historique complet (modal, toutes dates passées incluses).

#### A.11 `MaintenanceSection.tsx` — Mode maintenance ⚠️ CŒUR MÉTIER
Réservé à `administrateur principale` (`isAdminPrincipal`), retourne `null` sinon.
- État courant : `GET /api/maintenance/status` → `{ maintenant, message, activatedAt }`.
- Toggle (`Switch`) protégé par confirmation (`AlertDialog`) : `PUT /api/maintenance/toggle { maintenant, message }`.
- Quand activé : "Tous les utilisateurs (sauf vous) seront déconnectés et redirigés vers la page de maintenance." — cohérent avec `MaintenanceGate` (voir C).
- Message affiché modifiable indépendamment (`saveMessage` réutilise le même endpoint toggle avec l'état courant de `maintenant`).
- **Maintenance programmée automatique** (`scheduled`) : liste de `ScheduledMaintenance { id, startAt, endAt, days, hours, message, triggered }`.
  - CRUD : `GET/POST/PUT/DELETE /api/maintenance/scheduled[/:id]`.
  - Formulaire : date/heure de début (`datetime-local`), durée en jours et/ou heures (`fDays`, `fHours`), message.
  - Le serveur calcule `endAt` et active/désactive automatiquement la maintenance selon la programmation (non visible côté front, le front ne fait qu'afficher/éditer/supprimer).
- **Ce qu'il faut implémenter** : le layer `MaintenanceGate` (voir section C) doit être posé au-dessus de toute l'app pour bloquer l'accès sauf admin principal, avec un thème CSS `maintenance-mode` appliqué globalement sur `<html>`.

#### A.12 `ModuleSettingsSection.tsx`
Sections pliables : **Pointage** (prix/heure par défaut, prix journalier par défaut, toggle "Arrondir les heures" — synchronise `parametresApi.updatePrixPointage`), **Tâches** (auto-complétion, affichage tâches terminées — synchronise `parametresApi.updateParametreTache`). Contient aussi `PointageAutoSection` (voir A.13) toujours affichée (non pliable elle-même dans ce contexte, elle a son propre `expanded`).

#### A.13 `PointageAutoSection.tsx` — Règles de pointage automatique ⚠️ CŒUR MÉTIER
Permet à l'admin de définir des règles "personne + jour(s) + entreprise" appliquées automatiquement chaque jour concerné (via `PointageAutoWatcher`, voir B.1).

**Modèle `PointageAutoEntry`** : `travailleurId/Nom`, `jours` (`'toute'` ou tableau de jours FR), `entrepriseId/Nom`, `typePaiement` (`journalier`|`horaire`), `heures`, `prixHeure`, `prixJournalier`, `montantTotal` (calculé côté front avant envoi), `active`, `permanentlyDisabled`, `reactivationStartDate`.

**Formulaire** (modal luxe emerald/teal) : sélection personne (`travailleurApi`), mode jours (toute la semaine ou jours choisis), entreprise (`entrepriseApi`), type de paiement, calcul auto du montant (`computeMontant`).

**Désactivation à deux niveaux** :
- Clic sur toggle actif → si la règle est déjà active, ouvre `deactivateTarget` avec choix **Permanent** ou **Temporaire** (`confirmDeactivate(permanent)` → `PUT { active:false, permanentlyDisabled: bool }`).
- Une règle `permanentlyDisabled` ne peut **plus jamais** être réactivée (le bouton toggle est désactivé, tooltip "Désactivation permanente").
- Réactivation d'une règle temporairement désactivée : ouvre `reactivateTarget` avec sélection d'une **date de début** (`reactivationStartDate`, par défaut aujourd'hui) → `PUT { active:true, permanentlyDisabled:false, reactivationStartDate }`. Cette date permet un **rattrapage rétroactif** des pointages manqués depuis cette date (voir logique du watcher B.1).

**CRUD standard** : create/update/delete via `pointageAutoApi`, confirmation de suppression via `AlertDialog`.

---

### B. POINTAGE — `src/components/pointage/*` ⚠️ SECTION CRITIQUE

#### B.1 `PointageAutoWatcher.tsx` — Moteur de déclenchement automatique (composant global, monté une fois, invisible sauf modal actif)

**Objectif** : surveiller en continu les règles `PointageAutoEntry` actives et proposer/valider automatiquement la création de pointages, avec synchronisation entre plusieurs admins connectés simultanément.

**Constantes** :
- `POLL_INTERVAL = 60_000` — scan des règles toutes les 60s.
- `SESSION_POLL_INTERVAL = 10_000` — synchro des sessions partagées toutes les 10s.
- `PREAVIS_MS = 10 * 60 * 1000` — préavis de 10 minutes avant affichage du modal pour un événement du jour même.
- `MODAL_COUNTDOWN_MS = 5 * 60 * 1000` — durée du modal de confirmation (5 min), à l'issue de laquelle validation automatique.

**1) Calcul des dates attendues par règle** (`getExpectedDatesThisMonth`) :
- Part du 1er du mois courant, ou de `reactivationStartDate` si définie (rattrapage rétroactif après réactivation), plafonné à 60 jours en arrière maximum (`maxBack`).
- Parcourt chaque jour jusqu'à aujourd'hui et retient les dates où `ruleAppliesToDate` est vrai (jour de la semaine correspondant ou règle "toute la semaine", et règle active).
- **⇒ Ceci permet le rattrapage automatique de tout le mois en cours** (ou depuis la date de réactivation) si des dates ont été manquées, par exemple après une coupure ou une réactivation tardive.

**2) Scan principal** (`scan`, toutes les 60s) :
- Récupère toutes les règles actives + tous les pointages du mois (`pointageApi.getByMonth`) + la liste des empreintes de pointages supprimés (`pointageDeletedApi.getAll()`).
- Pour chaque règle × chaque date attendue :
  - Si déjà traité (`processedRef` Set en mémoire) → ignore.
  - Si un pointage existe déjà pour (date, travailleur, entreprise) → marque comme traité, ignore.
  - **Si l'empreinte (date, travailleurId, entrepriseId) est présente dans `pointageDeleted.json`** → marque comme traité et **ignore définitivement** : *un pointage automatique annulé/supprimé n'est JAMAIS recréé automatiquement*, seule une saisie manuelle reste possible.
  - Sinon, ajoute à la queue locale avec `showAt` = maintenant (jours passés → immédiat) ou maintenant + 10 min (jour même → préavis).

**3) Promotion queue → session serveur partagée** (interval 5s) :
- Dès qu'un item de la queue atteint son `showAt`, re-vérifie qu'aucun pointage manuel n'a été saisi entretemps.
- Enregistre/récupère un enregistrement persistant dans `pointageautodeclanche.json` (idempotent, ne réinitialise jamais `startedAt`) — garantit que **tout admin qui se connecte plus tard reprend exactement le même chrono**.
- Crée (ou récupère) une **session partagée** côté serveur (`pointageAutoSessionsApi.create`) avec le même `expiresAt` calculé côté serveur. **Cette session est LA source de vérité multi-admin** : tous les admins connectés verront le même modal, le même compte à rebours, et une action de l'un ferme le modal chez tous les autres.

**4) Synchronisation multi-admin** (poll 10s, `pollSessions`) :
- Récupère les sessions `pending` (`GET /api/pointages-auto-sessions?status=pending`).
- Si l'admin courant a un modal actif dont la session n'est plus `pending` (validée/annulée par un autre admin) → ferme silencieusement son modal.
- Si l'admin courant n'a pas de modal actif mais qu'une session `pending` existe → l'adopte (affiche le même modal avec le même countdown), sauf si un pointage a déjà été créé entretemps (auquel cas ferme la session côté serveur).

**5) Countdown dérivé** : calculé en temps réel à partir de `expiresAt` (partagé serveur), déclenche automatiquement `handleValidate(true)` à expiration (validation automatique après 5 min sans action).

**6) Validation** (`handleValidate`) :
- Marque la session `validated` côté serveur (idempotent).
- Clôture aussi l'enregistrement `pointageautodeclanche.json` correspondant.
- Si aucun pointage n'existe encore → crée le pointage via `pointageApi.create(...)` avec les données de la règle.
- Toast de confirmation (libellé différent si validation automatique vs manuelle).

**7) Annulation** (`handleCancel`) :
- Marque la session `cancelled` côté serveur → **le serveur ajoute une empreinte dans `pointageDeleted.json`** pour (date, travailleurId, entrepriseId).
- Conséquence définitive : plus aucun pointage automatique ne recréera cette combinaison, même après reconnexion, redémarrage ou réinjection d'une sauvegarde. Seule une saisie **manuelle** reste possible.
- Toast "Pointage annulé — Pensez à le saisir manuellement si besoin".

**UI du modal** : encart flottant en haut à droite (`fixed top-4 right-4`), design luxe emerald/teal avec icônes Crown/Sparkles/Diamond/Zap, affiche personne, entreprise, montant, compte à rebours mm:ss, boutons Valider (Check) / Annuler (X).

**Ce qu'il faut implémenter impérativement** :
1. Table `pointageAutoSessions` (statuts `pending`/`validated`/`cancelled`, `expiresAt`, `closedBy`).
2. Table `pointageautodeclanche` (persistance du chrono, idempotence).
3. Table `pointageDeleted` (empreintes bloquantes définitives).
4. Le calcul de rattrapage rétroactif (jusqu'à 60 jours, ou depuis `reactivationStartDate`).
5. Le comportement "désactivation permanente" bloquant toute réactivation.

#### B.2 `PointageCalendar.tsx`
Calendrier mensuel : grille 7 colonnes (Lun→Dim), navigation mois précédent/suivant. Chaque case affiche : nombre de pointages du jour (badge rouge), total € du jour, nombre de travailleurs distincts. Case "aujourd'hui" mise en évidence (cyan). Clic sur un jour → `onDayClick(dateStr)` ouvre le détail du jour.

#### B.3 `PointageHero.tsx`
Bandeau héroïque (fond slate/cyan/indigo) avec compteurs Entreprises/Travailleurs/Pointages ce mois, carte cliquable "Total du mois" (ouvre détail mensuel) et "Total de l'année" (ouvre détail annuel). Boutons d'action : Ajouter Entreprise, Ajouter Travailleur, Nouveau Pointage, Prise Avance, Afficher par personne, Partager pointage (lien public), Partage sélectif (filtré), Voir commentaires (badge count).

#### B.4 `PointageEntreprisesList.tsx` / `PointageTravailleursList.tsx`
Listes pliables (bouton chevron) des entreprises/travailleurs enregistrés, avec édition (`EntrepriseEditModal`) et suppression (confirmation `AlertDialog`) pour les entreprises. Badges rôle/genre pour les travailleurs.

#### B.5 `PointageTabNav.tsx`
Barre d'onglets Pointage / Tâches / RDV / Notes avec dégradés distincts par onglet actif (cyan, violet, rose, ambre).

#### B.6 `TravailleurSearchInput.tsx`
Champ de recherche avec dropdown filtré côté client (minimum 3 caractères par défaut), fermeture au clic extérieur, sélection affichant un badge avec bouton de suppression.

#### B.7 Modales `src/components/pointage/modals/*`
Non détaillées ligne à ligne ici (hors périmètre strict de la demande initiale mais listées pour référence) : `AvanceModal` (prise d'avance sur salaire), `DayDetailModal`/`MonthDetailModal`/`YearlyTotalModal` (détails agrégés), `EditPointageModal`/`PointageFormModal` (saisie manuelle), `EntrepriseModal`/`EntrepriseEditModal`, `TravailleurModal`, `ParPersonneModal` (vue par personne), `PointageConfirmDialogs` (confirmations diverses du module).

---

### C. SÉCURITÉ, MAINTENANCE, SESSION

#### C.1 `SecurityCheckPage.tsx` — Vérification anti-bot / anti-VPN ⚠️ CŒUR MÉTIER
Page plein écran affichée **avant** l'accès au site (composant `onVerified` callback déclenché quand la vérification réussit). Phases (`Phase`) : `boot → checking → challenge → captcha → verifying → passed | failed`.

**Étapes de vérification** :
1. **Vérification IP bloquée** (`blockageIpApi.check()`) au montage + toutes les 15s. Si bloquée → bloque tout le flux (`ipBlockedRef`), affiche l'info (IP + motif), empêche `onVerified` d'être appelé (`safeVerified` vérifie le ref). Un déblocage administrateur est automatiquement détecté par le polling périodique.
2. **Navigateur de confiance** : si `localStorage['security_browser_trusted'] === '1'`, saute directement le captcha (flux accéléré ~1.6s) tout en marquant `sessionStorage['security_verified_v4']`.
3. **Preuve de travail (Proof-of-Work)** : `solveProofOfWork(undefined, 18)` calculée en tâche de fond pendant `checking`, stockée via `storeProof`. Coût CPU négligeable pour un humain mais dissuasif pour un bot/fuzzing en masse.
4. **Challenge visuel de type "glisser une étoile jusqu'à la cible"** sur une image de fond aléatoire (Unsplash), avec piste de mouvement (`motionTrail`, max 18 points), calculs d'entropie, de variance de timing et de vélocité pour détecter un comportement de bot (mouvement linéaire trop parfait, absence de variance) → alimente `botReasons` et `riskLevel`.
5. **Captcha texte ou mathématique** (`generateCaptcha`, 50/50) — 8 caractères alphanumériques mixtes ou opération à deux opérandes (+, −, ×) avec résultat à saisir.
6. **Honeypot** (`honeypot` state) : champ caché, si rempli par un bot → détection automatique.
7. Score de sécurité cumulé (`securityScore`), variables `networkQuality`, `ipReputation` (simulées/illustratives), tentatives échouées (`failedAttempts`) pouvant redemander un nouveau captcha.

**Ce qu'il faut implémenter** : le flux séquentiel de phases avec timers, la persistance `localStorage`/`sessionStorage` de confiance, le blocage IP prioritaire et bloquant sur tout le reste, le double mode captcha, le honeypot, et la détection comportementale de mouvement de souris.

#### C.2 `MaintenanceGate.tsx` — Gate global de maintenance
Wrapper posé autour de toute l'app (`{children}`). Poll `GET /api/maintenance/status` toutes les 60s. Si maintenance active et utilisateur connecté ≠ `administrateur principale` → déconnexion automatique (`logout()`). Ajoute/retire la classe CSS `maintenance-mode` sur `<html>` pour un thème visuel dédié (jaune/orange). Si maintenance active et non-admin-principal → affiche `MaintenancePage` (lazy-loaded) au lieu des enfants, avec `onAuthenticated={fetchStatus}` pour re-vérifier après une connexion admin réussie depuis cette page.

#### C.3 Session unique — `src/components/session/*`
Trio de composants (`SessionShellNavbar`, `SessionShellHero`, `SessionShellFooter`) formant le "shell" d'une page dédiée de **conflit de session** (déclenchée quand un profil essaie de se connecter alors qu'une session est déjà active ailleurs — "un seul appareil à la fois est autorisé pour ce profil").
- `SessionShellNavbar` : logo, liens À propos/Contact, toggle thème clair/sombre (persisté `localStorage['app-theme']`).
- `SessionShellHero` : titre "Session Conflict", badges "Chiffré" et "Profil unique".
- `SessionShellFooter` : liens légaux minimalistes.
- **Logique métier** (implémentée ailleurs, dans la page qui utilise ce shell) : présenter à l'utilisateur le choix de déconnecter la session distante (probablement via `connecteProfilUniqueApi`, cf. historique de connexion en A / HistoriqueConnexionCard qui consomme `connecte-profil-unique.json` pour reconstituer les évènements connexion/déconnexion `session_login`/`session_logout`).

#### C.4 `BlockageIpCard.tsx` (Profil > Sécurité)
Carte de gestion des IP bloquées : liste, ajout (avec regex validation IPv4/IPv6, interdiction de bloquer sa propre IP courante affichée en haut), modification, suppression (déblocage), et **pause/reprise** temporaire d'un blocage sans le supprimer (`active` bool distinct de la suppression). Chaque action est confirmée par `AlertDialog` séparé (blocage / déblocage), toasts colorés dédiés (rouge=bloqué, ambre=pause, vert=débloqué, bleu=modifié).

#### C.5 `HistoriqueConnexionCard.tsx`
Historique des connexions avec compteurs jour/semaine/mois/année (calculés côté client à partir des entrées `login_success`+`visit`), regroupement des entrées par (utilisateur/IP/navigateur/OS) en `SessionGroup`, modal détaillé par groupe, export PDF des connexions/déconnexions de la période sélectionnée (`exportSessionsHistoryPdf`), réinitialisation complète de l'historique (vide `historiqueConnexionApi` + `connecteProfilUniqueApi`, recommence le comptage à 0). Rafraîchissement : polling 15s + écoute SSE (`realtimeService`) sur les évènements `historique-connexion`/`connecte-profil-unique`.

#### C.6 `ShieldStatsCard.tsx` — Bouclier anti-intrusion
Tableau de bord de supervision : `GET /api/security/shield-stats` (profils suivis, bannissements, agrégats `intrusionStats`), `GET /api/security/intrusions` (journal détaillé filtrable sévérité/mode/IP), `DELETE /api/security/intrusions` (purge, réservée à `administrateur principale`). Auto-refresh 30s. Affiche répartition par sévérité (critique/élevé/moyen/faible, cliquable pour filtrer), modes d'attaque les plus fréquents, IP/navigateurs les plus actifs, tableau paginé des intrusions.

#### C.7 `SecuriteSection.tsx` (page Profil, onglet Sécurité)
Grille 2×2 réservée à `administrateur principale` : **Gestion des rôles** (promouvoir/rétrograder admin ↔ simple utilisateur, plus gestion "spécification live"), **Gérance des comptes** (suppression de compte utilisateur), **Paramètres de connexion** (nombre de tentatives max avant blocage + durée de blocage, persistés dans `tentativeblocage.json`), **Cryptage de données** (activation/désactivation avec clé validée par `PasswordStrengthChecker`, `GET/POST /api/encryption/*`), et **Temps d'utilisation** (minutes d'inactivité avant déconnexion + durée max de session en heures, persistés dans `timeoutinactive.json`, propagés via `localStorage['timeout_settings']` + event `timeout:updated`). Intègre aussi `HistoriqueConnexionCard`, `ShieldStatsCard`, `BlockageIpCard`, `MaintenanceSection`.

---

### D. LIVE CHAT — `src/components/livechat/*`

#### D.1 Vue d'ensemble
Chat en direct visiteur↔admin et admin↔admin, plus chats de groupe, plus appels audio/vidéo WebRTC. Communication temps réel exclusivement via **Server-Sent Events (SSE)** (`EventSource`), avec polling de secours en visiteur.

#### D.2 `LiveChatAdmin.tsx`
3 onglets : `visitors` (conversations visiteurs), `admins` (messagerie interne admin-admin), `groups` (groupes de discussion). SSE unique (`/api/messagerie/events?adminId=...`) écoutant de nombreux évènements : `new_message`, `new_conversation_message`, `message_edited`, `message_deleted`, `message_liked`, `typing`, `admin_message`, événements de groupe équivalents, appels WebRTC. Fonctionnalités par message : édition, suppression (soft-delete avec flag `deleted`), like, emoji picker (20 emojis), indicateur de frappe avec timeout 2s. Création de groupe (nom + ≥2 membres), renommage de groupe. Notifications sonores + bannière (`ChatNotificationBanner`) quand chat fermé ou conversation non sélectionnée.

#### D.3 `LiveChatVisitor.tsx`
Identifiants persistés en `localStorage` (`livechat_visitor_id`, `livechat_pseudo`). Mêmes fonctionnalités que côté admin (édition/suppression/like/emoji/typing) mais restreintes au visiteur courant. Vue groupes (`ViewMode`: `chat`/`groups`/`group-chat`) si le visiteur a été ajouté à un groupe par un admin. Fallback polling 2s si SSE indisponible.

#### D.4 `CallOverlay.tsx` + `useWebRTC.ts`
Overlay d'appel audio/vidéo superposé au chat (statuts `idle/calling/ringing/connected/ended`). `useWebRTC` gère la connexion `RTCPeerConnection` (STUN Google), signalisation via HTTP POST `/api/messagerie/call-signal` (pas de WebSocket dédié, s'appuie sur SSE pour la réception), gestion des candidats ICE en attente (`pendingCandidatesRef`) tant que la description distante n'est pas appliquée, sonnerie avec timeout 30s si non décroché, nettoyage complet des flux média à la fin d'appel. Contrôles : mute micro, coupure vidéo, raccrocher.

#### D.5 `ChatNotificationBanner.tsx`
Liste de notifications toast custom en bas à gauche (`fixed bottom-4 left-4`), auto-dismiss, clic pour ouvrir la conversation correspondante.

---

### E. NOTIFICATIONS, NAVBAR, NAVIGATION

#### E.1 `ReservationExpiryNotifier.tsx`
Poll `GET /api/commandes/expiring-soon` toutes les heures (+ à la connexion). Pour chaque réservation dont l'expiration est < 24h et non déjà notifiée dans la dernière heure (`shownRef` Map en mémoire), affiche un toast orange (`sonner`) avec le temps restant formaté et la liste des produits.

#### E.2 `TimeoutNotification.tsx`
Bandeau flottant combinant deux alertes indépendantes : inactivité (orange/rouge, compte à rebours en secondes) et expiration de session proche (violet/fuchsia, en minutes, avec lien "Prolonger" vers `/profile?tab=securite`).

#### E.3 `ObjectifIndicator.tsx` — Objectif de ventes mensuel
Affiche Ventes du mois vs Objectif courant, avec code couleur (rouge <50%, ambre 50-99%, émeraude ≥100%). Édition inline de l'objectif (clic sur la valeur) ou via modal "+" dédiée. **Règle stricte : l'objectif ne peut être que strictement augmenté**, jamais diminué ni égal (erreur serveur `OBJECTIF_MUST_INCREASE` gérée avec toast dédié).

#### E.4 `ObjectifStatsModal.tsx` + modales associées
Modal de statistiques complet (graphiques `recharts` Area/Line, historique annuel dédupliqué par mois+année). Cartes cliquables ouvrant des sous-modales : `VentesHistoriqueModal` (historique ventes par mois), `BeneficesHistoriqueModal` (bénéfices par mois, recalculés serveur depuis `sales.json`), `ObjectifChangesModal` (timeline des changements d'objectif, filtrée sur le mois en cours uniquement — rappel : réinitialisation à 2000€ chaque 1er du mois). Bouton de réinitialisation manuelle de l'objectif à 2000€ (`objectifApi.resetObjectif`).

#### E.5 `AccessibleNavigation.tsx` (`src/components/navigation`)
Navigation accessible avec gestion clavier (flèches haut/bas pour circuler, Echap pour fermer), `aria-current="page"`, annonce des changements de page au lecteur d'écran via `useAccessibility().announceToScreenReader`. Menu mobile en overlay, menu desktop en ligne. Items statiques : Accueil, Tableau de bord, Ventes, Tendances.

---

### F. COMPOSANTS PARTAGÉS — `src/components/shared/*`

Composants génériques réutilisables dans tout le projet, exportés via `index.ts` : `UnifiedSearchBar`, `PageHero`, `Pagination`, `LoadingOverlay`, `ConfirmDialog`, `AddressActionModal` (+ hook `useAddressNavigation`), `StatBadge`. Plus `LuxeHero` (hero animé générique paramétrable par couleurs d'accent), `BackButton` (bouton retour flottant, masqué sur routes racines type login/register), `SelectiveShareModal`, `ShareLinkModal`, `ShareCommentsViewer`, `SharedCommentForm` (voir ci-dessous, système de partage).

#### F.1 Système de partage et commentaires ⚠️ FONCTIONNALITÉ TRANSVERSALE
Utilisé par Pointage, Tâches et Notes (`type: 'pointage' | 'taches' | 'notes'`).

**`ShareLinkModal.tsx`** — partage simple (tout le dataset) :
- `GET /api/share-links?type=X` liste les liens actifs.
- `POST /api/share-links` génère `{ token, accessCode, createdAt }` — le lien final est `${origin}/shared/{token}` protégé par un `accessCode` alphanumérique et **verrouillé à l'IP du premier visiteur**.
- Révocation (`DELETE`) et copie presse-papiers (lien + code concaténés).

**`SelectiveShareModal.tsx`** — partage filtré avancé :
- Filtre par **personne** (travailleur spécifique ou tous), sauf pour `notes`.
- Filtre par **période** : mode `jours` (dates ponctuelles ajoutées une à une), `semaines` (sélection multiple `YYYY-Wxx`), `mois` (sélection multiple par année), `annees` (sélection multiple d'années) — ou "Toutes les dates".
- Spécifique pointage : filtre par entreprise(s) (`allEntreprises` ou liste).
- Spécifique tâches : filtre par importance (`pertinent`/`optionnel`/tous).
- Spécifique notes : sélection par colonnes (`notesAllColumns` ou sélection de colonnes avec toutes leurs notes — pas de sélection note par note dans l'UI actuelle).
- Génère **N liens en une fois** (`linkCount`), chacun avec son propre `token`/`accessCode` mais les mêmes filtres (`POST /api/share-links/generate` avec `type` + objet `filters`).
- Étapes UI : `filters` → `count` (nombre de liens à générer) → `result` (liste des liens générés, copiables).

**`SharedCommentForm.tsx`** (rendu sur la page publique `/shared/:token`, sans authentification) :
- Mode "commentaire" activable via bouton flottant : le visiteur peut cliquer sur un bouton 💬 à côté de chaque élément affiché (exposé globalement via `window.__addInlineComment`) pour lui associer un commentaire spécifique (texte + capture complète des données de l'élément et de son libellé lisible `getItemLabel`).
- Commentaire général optionnel en plus des commentaires par élément.
- Formulaire d'identification obligatoire (prénom, nom obligatoires ; téléphone, email optionnels).
- Flux en 2 temps : **Valider** (`shareCommentsApi.submit`) crée le commentaire en base avec statut "validated" et génère un `commentId`, puis **Envoyer** (`shareCommentsApi.send`) le passe au statut définitif "sent" (irréversible, ne peut être fait qu'une fois — `shareCommentsApi.check(token)` empêche une double soumission).
- Un panneau bas d'écran minimisable regroupe la liste des commentaires en cours d'ajout avant validation.

**`ShareCommentsViewer.tsx`** (côté admin) :
- Liste des commentaires reçus par type, indicateur lu/non lu (badge rouge "Nouveau").
- Vue détaillée : infos de contact, commentaires spécifiques avec libellé de l'élément (`itemLabel`), commentaire général, et **snapshot HTML** du document tel qu'il était au moment de l'envoi (généré côté serveur, affiché dans un `<iframe sandbox>`).
- Téléchargement du commentaire en fichier texte, suppression (autorisée uniquement si déjà marqué comme lu, avec confirmation à deux clics).
- Synchronisation temps réel via événement custom `share-comment-received` (déclenché par SSE ailleurs dans l'app).

---

### G. COMPOSANTS COMMUNS ET ACCESSIBILITÉ

#### G.1 `common/ErrorBoundary.tsx`
Classe React `ErrorBoundary` catch-all. Fallback par défaut : page 404-style ultra luxe (fond noir dégradé violet/fuchsia, particules animées, glow orbs, carte glassmorphism "404 — Page introuvable" avec bouton retour à l'accueil qui recharge `window.location.href='/'`).

#### G.2 `common/PhoneActionModal.tsx`
Modal proposant Appeler / Envoyer SMS (mobile) ou message (desktop) pour un numéro de téléphone donné.

#### G.3 `common/RealtimeStatus.tsx` + `common/RealtimeWrapper.tsx`
`RealtimeWrapper` : se connecte au service SSE global (`realtimeService.connect()`) au montage, écoute les data-listeners (`products`, `sales` → propagation dans `AppContext`) et sync-listeners (`connected`/`disconnected`/`force-sync`). Affiche optionnellement un badge `RealtimeStatus` (Wifi/WifiOff + timestamp dernière sync) en haut à droite. Utilisé uniquement quand l'utilisateur est authentifié (`Layout.tsx`).

#### G.4 `accessibility/AccessibilityProvider.tsx`
Contexte React global avec `settings: { highContrast, largeText, reducedMotion, screenReaderMode, keyboardNavigation }`. Persisté `localStorage['accessibility-settings']`. Détecte automatiquement les préférences système (`prefers-reduced-motion`, `prefers-contrast: high`). Applique des classes CSS globales sur `<html>`. Fournit `announceToScreenReader(message)` avec une région ARIA live (`aria-live="polite"`) et anti-duplication (1s de debounce).

#### G.5 `accessibility/AccessibleButton.tsx` / `AccessibleInput.tsx`
Wrappers de `Button`/`Input` shadcn avec `aria-label`, `aria-busy`, état `loading` (spinner + texte alternatif), `aria-invalid`/`aria-describedby`/`aria-required` pour les inputs avec erreur/helperText.

---

### H. COMPOSANTS RACINE

#### H.1 `Layout.tsx`
Structure globale de page authentifiée/publique : `Navbar` + (`BackButton` sauf sur `/dashboard*`) + `TimeoutNotification` (alimenté par `useAutoLogout()`) + `<main id="main-content">` + `Footer` + `ScrollToTop` + `LiveChatAdmin` + `ReservationExpiryNotifier` (si authentifié). Si `requireAuth` et non authentifié → redirection `/login` avec state `from`. Si authentifié, enveloppe tout dans `RealtimeWrapper`.

#### H.2 `Navbar.tsx`
Header sticky avec barre de dégradé animée en haut (`navTopBar` 6s), logo cliquable, `ObjectifIndicator` (si authentifié hors pages d'auth). Desktop : liens À propos/Contact (visiteur) ou Dashboard/Messages (badge non-lus)/RdvNotifications (authentifié), toggle thème clair/sombre, bouton profil avec avatar à anneaux verts pulsants (mêmes keyframes que `ProfileAvatar`), bouton déconnexion. Mobile : menu hamburger avec grille 2 colonnes d'actions.

#### H.3 `Footer.tsx`
Footer sombre 4 colonnes (Marque, Navigation, Services, Contact) avec animations `whileInView`, badges de version en bas ("Version 6.0.0 — Ultra Premium Build" etc.), largeur ajustée dynamiquement selon la sidebar (`ResizeObserver` sur `#main-content`).

#### H.4 `SEOHead.tsx`
Composant sans rendu (`return null`) : injecte/màj dynamiquement `<title>`, meta description, canonical, robots, Open Graph et Twitter Card à chaque changement de props.

#### H.5 `CookieConsent.tsx`
Bandeau RGPD (bas-gauche desktop, pleine largeur mobile) avec 2 vues : principale (Tout accepter / Tout refuser / Personnaliser) et paramètres détaillés (3 catégories : Essentiels obligatoires, Mesure d'audience, Marketing — toggles animés). Persistance `localStorage['luxury_rgpd_consent_v3']` avec `version` pour forcer une re-demande si la politique change. Émet un `CustomEvent('cookie-consent-updated')` global et supporte Google Consent Mode (`gtag('consent','update',...)`) si présent. Apparition différée de 1.2s au premier chargement.

#### H.6 `AutoInjectWatcher.tsx` — Restauration automatique différée ⚠️ CŒUR MÉTIER
Composant global monté pour tout admin authentifié. Toutes les 30s, vérifie `GET /api/settings/needs-injection` (base(s) vides détectées côté serveur). Si le besoin est confirmé et persiste après un **chrono de 5 minutes** depuis la connexion (`CHRONO_MS`), affiche une modal bloquante bas-gauche ("Injection requise — Une ou plusieurs bases de données sont vides") avec overlay plein écran non cliquable ailleurs. L'admin peut refuser ("Non" — ferme sans bloquer) ou choisir un fichier de sauvegarde à injecter, saisir le code de cryptage (validé par `PasswordStrengthChecker`) puis restaurer (`settingsApi.restoreData`). Si les données sont injectées entre-temps par un autre moyen, le polling annule automatiquement l'affichage de la modal.

#### H.7 `PasswordInput.tsx`
Input mot de passe générique avec icône `Shield`, toggle œil, état d'erreur stylé (bordure rouge + message).

#### H.8 `PasswordStrengthChecker.tsx`
Affiche (uniquement si le mot de passe est non conforme) une jauge de force (0 à 5 critères : longueur ≥6, majuscule, minuscule, chiffre, caractère spécial), une liste de critères avec coche verte/point gris, et un bandeau orange d'avertissement tant que tous les critères ne sont pas remplis. Remonte `isValid` via `onValidityChange` à chaque changement — **composant central réutilisé partout où un mot de passe/code sensible doit être validé** (changement de mot de passe profil, activation cryptage, codes de sauvegarde/restauration, injection auto).

#### H.9 `ScrollToTop.tsx`
Bouton flottant rouge (bas centre) apparaissant après 500px de scroll, remonte en haut en smooth scroll.

#### H.10 `VisitTracker.tsx`
Composant invisible enregistrant une visite dans l'historique de connexion (une fois par session navigateur), via le hook `useVisitLogger`, attend la fin du chargement auth avant d'agir.

---

### I. RÉCAPITULATIF DES RÈGLES MÉTIER CRITIQUES À REPRODUIRE

1. **Pointage automatique** : rattrapage rétroactif du mois (ou depuis date de réactivation, plafonné 60 jours), sessions partagées serveur pour synchro multi-admin identique pour tous, préavis 10 min pour le jour même vs immédiat pour le passé, countdown modal 5 min avec validation auto à expiration, annulation = empreinte permanente bloquant toute recréation automatique (seule saisie manuelle possible), désactivation temporaire (réactivable avec date de rattrapage) vs permanente (irréversible).
2. **Sauvegarde/restauration chiffrée** : sauvegarde manuelle et automatique (countdown 5 min synchronisé serveur, mot de passe en session uniquement), restauration avec détection "aucune nouvelle donnée", suppression sélective par type de données avec filtre optionnel période pour les ventes.
3. **Mode maintenance** : toggle avec confirmation, déconnexion forcée de tous sauf admin principal, programmation automatique (début + durée), thème CSS dédié, page de vérification sécurité passée avant d'atteindre la page de maintenance.
4. **Session unique** : un seul appareil actif par profil, page de conflit dédiée pour choisir de libérer la session distante.
5. **Page de vérification anti-bot/VPN** : blocage IP prioritaire et bloquant, navigateur de confiance persistant, preuve de travail CPU, challenge glisser-déposer avec analyse comportementale (entropie, vélocité, variance de timing), captcha texte/math, honeypot.
6. **Liens de partage et commentaires** : lien simple (tout) vs sélectif (filtres personne/période/entreprise/importance/colonnes), verrouillage IP + code d'accès, commentaires par élément avec snapshot HTML, envoi en 2 temps (valider puis envoyer, non modifiable après envoi), suppression admin seulement si déjà lu.
