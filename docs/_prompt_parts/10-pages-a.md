## 6bis.A PAGES PUBLIQUES & AUTHENTIFICATION

Cette section documente les pages « front » accessibles sans (ou en dehors d'un) tableau de bord : accueil, à propos, contact, connexion, inscription, réinitialisation de mot de passe, 404, maintenance, et conflit de session unique. Toutes (sauf 404, Maintenance et SessionConflict) sont enveloppées dans `<Layout>` (voir 5bis.1) et utilisent `<SEOHead>` (voir 5bis.3).

### 6bis.A.1 `src/pages/HomePage.tsx`

- **Rôle** : page d'accueil marketing/vitrine du produit « Gestion Vente ».
- **Route** : `/`.
- **SEO** : `SEOHead` avec `title="Gestion Vente — La gestion commerciale réinventée"`, description marketing, `canonical="https://riziky-ventes.vercel.app/"`.
- **États locaux** : aucun (composant purement présentational). Utilise `useNavigate()` et `useAuth()` pour lire `isAuthenticated`.
- **Effets** : aucun.
- **Logique** : pas de validations ni d'appels API. Le bouton « Commencer gratuitement » / « Se connecter » n'est affiché que si `!isAuthenticated` (deux occurrences : dans le hero et dans la section CTA finale, qui elle-même n'est rendue que `!isAuthenticated`).
- **Structure visuelle** (dans l'ordre, conteneur `<Layout><main class="relative min-h-screen overflow-x-hidden bg-slate-50 ... dark:bg-[#05030d] ...">`) :
  1. **Fond décoratif léger** : 3 halos `blur-3xl` positionnés en absolu (violet en haut-gauche, fuchsia à 25% à droite, bleu/indigo en bas centré) + grille de fond très subtile en `linear-gradient` (opacité ~0.025). Purement CSS, aucune animation JS/Framer Motion (page volontairement allégée en perf).
  2. **Hero** (`grid lg:grid-cols-[1.1fr_0.9fr]`) : badge « LA NOUVELLE GÉNÉRATION DE GESTION » (icônes `Crown`+`Sparkles`), titre `h1` en deux lignes (« Gérez votre activité. » / « Développez votre avenir. » en dégradé violet→fuchsia→pink), paragraphe descriptif, boutons CTA (`Commencer gratuitement` → `/register`, `Se connecter` → `/login`, visibles seulement si non authentifié), ligne de confiance (icônes Shield/Zap/Star : Sécurisé/Rapide/Premium). À droite : composant interne `<DashboardPreview />` (maquette statique de tableau de bord avec mini-graphique en barres, cartes stats, notification flottante « Nouvelle vente +450€ »).
  3. **Stats** : grille de 3 cartes (`100% Centralisé`, `24/7 Accessible`, `+∞ Possibilités`) avec icônes Layers3/Clock3/TrendingUp.
  4. **Features** : badge « Un seul espace », titre « Toute votre entreprise. Un seul endroit. », grille de 6 cartes (`features` : Suivi des ventes, Comptabilité, Rendez-vous, Tâches, Gestion des stocks, Gestion des clients), chacune avec icône dans un carré à dégradé propre, description, lien « Découvrir » avec chevron animé au survol (`group-hover:translate-x-1`).
  5. **Vision 360** : bloc texte (« Prenez de meilleures décisions avec une vision à 360° ») + grille 2×2 d'éléments `managementItems` (Chiffre d'affaires, Bénéfices, Objectifs, Dépenses) et composant interne `<AnalyticsPreview />` (carte "Résumé financier 42 580€" avec graphique en barres statique).
  6. **CTA finale** (uniquement si `!isAuthenticated`) : carte à fond dégradé pastel avec icône `Crown`, titre « Prêt à passer au niveau supérieur ? », bouton « Démarrer gratuitement » → `/register`.
- **Sous-composants internes** : `DashboardPreview` et `AnalyticsPreview`, tous deux purement statiques (aucune donnée dynamique, valeurs codées en dur), utilisés uniquement pour l'illustration visuelle.
- **Dépendances** : `react-router-dom` (`useNavigate`), `@/contexts/AuthContext` (`useAuth`), `@/components/ui/button`, `@/components/Layout`, `@/components/SEOHead`, icônes `lucide-react`. Aucun appel réseau, aucun état de formulaire.

### 6bis.A.2 `src/pages/AboutPage.tsx`

- **Rôle** : page « À propos » présentant la vision produit, les valeurs, les fonctionnalités, la sécurité. Explicitement optimisée pour la performance (commentaire en tête de fichier : « Aucun Framer Motion, Aucun background animé, Aucun particle system, Aucun backdrop-blur lourd »).
- **Route** : `/about`.
- **SEO** : `title="À propos — Gestion Vente Premium"`, description, `canonical=".../about"`.
- **États locaux** : aucun. Composant purement statique basé sur des tableaux de données constants (`values`, `features`, `stats`, `securityItems`, `dashboardCards`, `workspaceItems`, `approachItems`).
- **Effets/validations/API** : aucun.
- **Sous-composant interne** : `SectionTitle` (props `eyebrow?`, `title`, `description?`, `center?`) factorisant les titres de section (badge `Sparkles` + libellé, `h2` en dégradé, paragraphe optionnel).
- **Structure visuelle** (dans `<Layout><main class="relative min-h-screen overflow-hidden bg-slate-50 ... dark:bg-[#03040a] ...">`) :
  1. Fond avec 2 halos `blur-3xl` (violet haut-gauche, cyan à 35% droite).
  2. **Hero** (`grid lg:grid-cols-[1.05fr_0.95fr]`) : badge « Premium Business Suite » (icône `Gem`), titre « Une nouvelle façon de gérer votre Business. » (dégradé sur "Business."), paragraphe, CTA `Link to="/register"` (bouton dégradé) — la suite du hero (bouton secondaire, stats, dashboard illustratif à droite avec `dashboardCards`) suit le même schéma que HomePage.
  3. **Values** : titre centré « Une plateforme conçue autour de vous. », grille de 4 cartes `values` (Simplicité/Performance/Sécurité/Précision), icône en carré dégradé.
  4. **Story / Vision** : bloc "Smart Workspace" (liste à puces `workspaceItems` avec icônes `CheckCircle2`, encart « Pensé pour durer ») à gauche, texte « La puissance sans la complexité » + grille `approachItems` (Rapide à prendre en main, Centralisé et structuré, Pensé pour la sécurité, Accessible partout) à droite.
  5. **Features** (« Un écosystème complet ») : grille de 6 cartes `features` (Ventes, Comptabilité, Clients, Stock, Rendez-vous, Tâches) avec lien « Découvrir ».
  6. **Security** : carte large avec icône `ShieldCheck`, titre « La sécurité au cœur de l'expérience. », liste `securityItems` (Protection, Confidentialité, Données structurées).
  7. **CTA finale** : carte centrée avec icône `Rocket`, titre « Prêt à gérer votre activité avec plus de simplicité ? », bouton `Link to="/register"` « Créer mon compte », mention sécurité en pied.
  8. **Branding footer local** (hors `<Footer>` du Layout) : ligne texte « Gestion Vente Premium • Cloud Business Suite » avec icônes `Sparkles`/`Globe`.
- **Dépendances** : `react-router-dom` (`Link`), `@/components/ui/button`, `@/components/Layout`, `@/components/SEOHead`, icônes `lucide-react`. Aucune animation Framer Motion, aucun état, aucun accès réseau.

### 6bis.A.3 `src/pages/ContactPage.tsx`

- **Rôle** : formulaire de contact public + intégration chat en direct avec un administrateur.
- **Route** : `/contact`.
- **SEO** : `title="Contact"`, description, `canonical=".../contact"` (et une variante `title="Message envoyé"` sur l'écran de succès).
- **Constantes** : `API_BASE` = `VITE_API_BASE_URL` ou `https://server-gestion-ventes.onrender.com` ; `INITIAL_FORM` (expediteurNom, expediteurEmail, expediteurTelephone, sujet, contenu, destinataireId:'1') ; `CONTACT_INFO` (Email/Téléphone/Adresse) ; `STATS` (Sécurisé/24h/Cloud).
- **États locaux** : `formData` (objet du formulaire), `isSubmitting`, `isSubmitted`, `adminOnline` (bool), `showLiveChat` (bool), `liveAdminId` (string, défaut `'1'`), `submittedName` (string).
- **Hooks** : `useToast()`, `useMessages()` (fournit `sendMessage`).
- **Effets** :
  1. Au montage : lit `localStorage.getItem('livechat_pseudo')` et alimente `submittedName` si présent (try/catch silencieux si localStorage indisponible).
  2. Statut admin : `checkAdminStatus()` appelle `GET ${API_BASE}/api/messagerie/admin-status` avec `AbortController` et timeout de 5 s (`cache:'no-store'`) ; en cas de succès met à jour `adminOnline` (`Boolean(data.online)`) et `liveAdminId` si `data.adminId` fourni ; en cas d'échec force `adminOnline=false`. Appelé immédiatement puis toutes les **30 secondes** via `setInterval` ; nettoyage à l'unmount (`mounted=false`, `clearInterval`).
- **Handlers** :
  - `handleChange` : met à jour `formData[name]` pour `<Input>`/`<Textarea>`.
  - `handleSubjectChange(value)` : met à jour `formData.sujet` (contrôlé par `<Select>`).
  - `handleSubmit(event)` : `preventDefault()`, trim des 4 champs obligatoires (nom, email, sujet, contenu) ; si un champ manque → toast d'erreur (`variant:'destructive'`, `className:'notification-erreur'`) et retour. Sinon `setIsSubmitting(true)`, appelle `sendMessage({...formData, champs trimés})` ; en cas de succès : sauvegarde `localStorage.setItem('livechat_pseudo', name)` (try/catch), `setSubmittedName(name)`, `setIsSubmitted(true)`, réinitialise `formData` à `INITIAL_FORM`, toast de succès. En cas d'échec : toast d'erreur générique. `finally` → `setIsSubmitting(false)`.
- **Écran de succès** (`isSubmitted === true`) : carte dédiée avec icône `CheckCircle`, titre « Message envoyé ! », deux boutons : « Envoyer un autre message » (`setIsSubmitted(false)`) et « Chat en direct »/« Chat hors ligne » (`disabled={!adminOnline}`, `onClick={() => setShowLiveChat(true)}`) avec badge « LIVE » si en ligne. Si `showLiveChat && adminOnline` → rendu de `<LiveChatVisitor visitorNom={submittedName || 'Visiteur'} adminId={liveAdminId} onClose={...} />`.
- **Écran principal** : fond avec halos `blur-3xl` + grille légère. En-tête avec badge « Premium Business Support », titre « Parlons de votre projet. », description, ligne de `STATS`. Grille `lg:grid-cols-[minmax(0,1fr)_340px]` :
  - **Colonne formulaire** (carte avec bande dégradée en haut) : en-tête avec icône `Mail`, indicateur `adminOnline` (pastille verte/grise + « Équipe en ligne »/« Équipe disponible »), titre « Envoyez-nous un message. », badges Sécurisé/Rapide/Premium (sous-composant `Badge`). Formulaire (`FormField` générique avec icône+label) : Nom complet + Email (grid 2 colonnes), Téléphone, Sujet (`<Select>` avec 5 options emoji : Information/Support technique/Partenariat/Consultation/Autre), Message (`<Textarea rows=6>`), bouton submit avec spinner pendant `isSubmitting`, mention confidentialité en pied.
  - **Colonne latérale** (`aside`) : carte « Nos coordonnées » listant `CONTACT_INFO` (icône en carré dégradé + libellé + valeur), et carte « Besoin d'aide ? » avec bouton « Démarrer le chat » (si `adminOnline`) ou message « Chat actuellement hors ligne ».
- **Live chat** : rendu conditionnel de `<LiveChatVisitor>` identique à l'écran de succès.
- **Dépendances** : `@/hooks/use-toast`, `@/hooks/use-messages` (`useMessages`), `@/components/livechat/LiveChatVisitor`, composants UI shadcn (Button, Input, Textarea, Card*, Label, Select*), `@/components/Layout`, `@/components/SEOHead`, icônes `lucide-react`.

### 6bis.A.4 `src/pages/LoginPage.tsx`

- **Rôle** : page de connexion premium en deux étapes (email puis mot de passe), avec verrouillage anti-bruteforce et gestion de session unique.
- **Route** : `/login`.
- **SEO** : `title="Connexion Premium"`, description, `canonical=".../login"`.
- **Constantes** : `AUTH_BASE_URL` (`VITE_API_BASE_URL` ou fallback Render) ; `isValidEmail` (regex simple) ; `formatCountdown(seconds)` → `mm:ss`.
- **États locaux** :
  - Formulaire : `email`, `password`, `errors: {email?, password?}`.
  - Flux en deux étapes : `showPasswordField` (bool), `isCheckingEmail`, `emailExists`, `userName` (prénom+nom affiché après vérification email), `isPasswordValid` (fourni par `PasswordStrengthChecker`), `isLoggingIn`.
  - Sécurité : `maxAttempts` (défaut 5), `failedAttempts`, `isLocked`, `lockCountdown` (secondes).
  - `countdownRef` (ref d'intervalle pour le compte à rebours de verrouillage).
- **Effets** :
  - Compte à rebours de verrouillage : tant que `isLocked && lockCountdown>0`, décrémente chaque seconde ; à 0 → `isLocked=false`, `failedAttempts=0`, clear interval. Nettoyage à chaque changement de dépendances/démontage.
- **Validation d'email et vérification serveur** (`handleEmailCheck`) : trim ; si vide → erreur "Veuillez entrer votre adresse email." ; si format invalide → erreur adresse invalide ; sinon `POST ${AUTH_BASE_URL}/api/auth/check-email {email}` :
  - Si `response.data.exists` : `emailExists=true`, `showPasswordField=true`, `userName` = prénom+nom, `maxAttempts`/`failedAttempts` mis à jour depuis la réponse ; si `response.data.locked` → active `isLocked` + `lockCountdown=remainingSeconds` + `failedAttempts=maxAttempts` (barre pleine) ; efface l'erreur email.
  - Sinon : `emailExists=false`, `showPasswordField=false`, erreur "Ce profil n'existe pas.".
  - Erreur réseau → même reset + erreur générique "Une erreur s'est produite. Veuillez réessayer.".
  - `finally` → `isCheckingEmail=false`. Retourne un booléen de succès.
- **Soumission** (`handleSubmit`) : `preventDefault()`, reset `errors`, valide l'email (mêmes règles). Si `!showPasswordField` → appelle `handleEmailCheck()` et s'arrête (première étape = validation email). Sinon exige `password` non vide, bloque si `isLocked`. `setIsLoggingIn(true)` puis `POST ${AUTH_BASE_URL}/api/auth/login {email, password}` :
  - Si `response.data.token` : reset `failedAttempts=0`. **Vérification de session unique** : `connecteProfilUniqueApi.check({userId, role})` (non bloquant, try/catch) ; si `!check.allowed && check.conflict` → `savePendingLogin({email, password, userId, role, nom, conflict})` (persistance temporaire, voir 6bis.A.9), `setIsLoggingIn(false)`, `navigate('/session-conflict')` et **retour immédiat** (la connexion n'est pas finalisée ici). Sinon, poursuite normale : `await login({email, password})` via `AuthContext` ; si succès, tente `connecteProfilUniqueApi.registerLogin({userId, email, nom, role})` puis `connecteProfilUniqueApi.setSessionId(registration.sessionId)` (non bloquant) et `navigate('/dashboard')`.
  - Erreurs : `status===423` → active verrouillage (`isLocked`, `lockCountdown`, `failedAttempts`, `maxAttempts` depuis la réponse). `status===401` avec `data.failedAttempts` défini → met à jour `failedAttempts`/`maxAttempts` et affiche `Mot de passe incorrect (x/y)`. Sinon message générique `data.message || 'Identifiants invalides.'`.
  - `finally` → `isLoggingIn=false`.
- **`handleEmailChange`** : à chaque frappe sur l'email, réinitialise tout l'état de l'étape mot de passe (`showPasswordField=false`, `emailExists=false`, `password=''`, `failedAttempts=0`, `isLocked=false`, `lockCountdown=0`, `isPasswordValid=false`) et efface l'erreur email éventuelle — permet de recommencer le flux si l'utilisateur modifie l'email après vérification.
- **Écran de chargement** : si `isLoggingIn`, affiche `<Layout><PremiumLoading text="Bienvenue ..." size="lg" overlay={false} variant="default" /></Layout>` (remplace tout le reste du rendu).
- **Animations** : `useReducedMotion()` de framer-motion ; objet `entrance` (fade+translate `y:18→0`, 0.45 s) appliqué conditionnellement sauf si mouvement réduit demandé.
- **Structure visuelle** : fond avec halos `blur-3xl` + grille fine + petite lumière ambiante. Layout `lg:grid-cols-[1fr_500px]` : section gauche cachée en mobile (présentation produit, badge, titre "Gérez votre Business. Avec élégance.", 3 badges de confiance, avatars empilés + étoiles) ; carte de connexion à droite (glow, bordure supérieure dégradée, en-tête avec icône `Fingerprint` + badge `Crown`, badge « Système sécurisé », titre « Connexion », badges Sécurisé/Rapide/Protégé). Formulaire :
  - Champ email avec spinner pendant vérification, `onBlur` déclenche `handleEmailCheck()` si `email && !showPasswordField`, désactivé pendant vérification ou une fois l'étape mot de passe atteinte.
  - Message « Bienvenue {userName} » si `emailExists`.
  - Bloc mot de passe (affiché avec animation hauteur si `showPasswordField`) : compteur de tentatives restantes (pastilles rouge/grises) si `failedAttempts>0 && !isLocked` ; encart de verrouillage avec compte à rebours `mm:ss` si `isLocked` ; `PasswordInput` + `PasswordStrengthChecker` (masqué si verrouillé) ; lien « Mot de passe oublié ? » → `/reset-password`.
  - Bouton submit dynamique : « Vérification... » / « Se connecter » / « Continuer » selon l'état, avec effet de brillance CSS (`animate-[login-shine_...]`) désactivé si mouvement réduit ; `disabled` si vérification en cours, ou (étape mot de passe avec mot de passe invalide ou verrouillé), ou verrouillé.
  - Bouton secondaire `Link to="/register"` « Créer un compte ».
  - Mention confiance en pied de carte + branding mobile en bas d'écran.
- **Dépendances** : `axios`, `framer-motion`, `@/contexts/AuthContext` (`login`), `@/services/api/connecteProfilUniqueApi` (`check`, `registerLogin`, `setSessionId`), `@/pages/SessionConflictPage` (`savePendingLogin`), `PasswordInput`, `PasswordStrengthChecker`, `Layout`, `PremiumLoading`, `SEOHead`, composants UI shadcn, icônes `lucide-react`.

### 6bis.A.5 `src/pages/RegisterPage.tsx`

- **Rôle** : formulaire d'inscription complet avec validations synchrones et asynchrones (email), robustesse du mot de passe et conditions d'utilisation.
- **Route** : `/register`.
- **SEO** : `title="Inscription"`, description « Créer un compte sur Gestion Vente » (pas de `canonical`).
- **Constantes** : `EMAIL_REGEX`, `PHONE_REGEX` (`^[0-9+\-\s()]{6,20}$`), `PASSWORD_REGEX` (minuscule+majuscule+chiffre+spécial, longueur ≥6) ; `initialFormData` (firstName, lastName, email, gender, address, phone, password, confirmPassword, acceptTerms:false).
- **États locaux** : `formData` (type `FormData`), `errors` (`Record<string,string>`), `isEmailChecking`, `isEmailValid` (défaut `true`), `isSubmitting`, `isPasswordValid`, `isDark` (détecté via `document.documentElement.classList.contains('dark')`).
- **Hooks** : `useAuth()` → `register`, `checkEmail` ; `useToast()`.
- **Effets** :
  1. **Thème** : au montage détecte le thème courant puis observe les mutations de `class` sur `<html>` via `MutationObserver` pour maintenir `isDark` synchronisé ; déconnecté au démontage. Sert à calculer dynamiquement toutes les classes Tailwind conditionnelles (fond, textes, bordures, inputs) au lieu de s'appuyer uniquement sur les classes `dark:`.
  2. **Debounce email** : si `formData.email` contient `@`, déclenche `validateEmail()` après 500 ms (timeout nettoyé à chaque changement).
- **Handlers** :
  - `handleChange` : met à jour le champ correspondant (gère les checkbox via `type==='checkbox'`), efface l'erreur du champ modifié, et si `name==='email'` force `isEmailValid=true` (reset optimiste en attendant la revalidation).
  - `handleGenderChange` : met à jour `gender` via le `<Select>` et efface l'erreur associée.
  - `validateEmail` (appelée au blur et via le debounce) : trim ; vide → `isEmailValid=true` (pas d'erreur si champ vide, la validation "requis" est gérée à la soumission) ; format invalide → erreur + `isEmailValid=false` ; sinon `isEmailChecking=true`, appelle `checkEmail(email)` (AuthContext) : si existe → erreur "Cet email est déjà utilisé", `isEmailValid=false`, toast destructif ; sinon efface l'erreur, `isEmailValid=true`. `finally` → `isEmailChecking=false`.
  - `handlePasswordValidityChange(valid)` : reflète la validité fournie par `PasswordStrengthChecker` dans `isPasswordValid`.
  - `validateForm()` : construit un objet d'erreurs complet — prénom/nom requis, email requis+format, genre requis, adresse requise, téléphone requis+format (`PHONE_REGEX`), mot de passe requis + conforme à `PASSWORD_REGEX`, confirmation requise + égale au mot de passe, cases conditions obligatoires (`acceptTerms`).
  - `handleSubmit` : `preventDefault()`, exécute `validateForm()` ; si erreurs → `setErrors` et arrêt. Si `!isEmailValid || isEmailChecking` → arrêt silencieux. Sinon `isSubmitting=true`, `errors={}`, appelle `register({...})` (tous les champs trimés sauf mot de passe, `gender` casté en union `'male'|'female'|'other'`) ; si `!success` → simple retour (le contexte gère probablement déjà le toast d'échec) ; si succès → toast de succès (classes emerald) puis `navigate('/login')`. En cas d'exception : lit `error.response.data`, construit un message depuis `apiData.message` ou `apiData.details.join(' • ')` ou message générique, affiche un toast destructif. `finally` → `isSubmitting=false`.
- **`isFormValid`** (calculé à chaque rendu) : vrai seulement si tous les champs obligatoires sont renseignés (trim non vide), `acceptTerms` coché, `isEmailValid`, `isPasswordValid`, `!isEmailChecking`, et aucune valeur d'`errors` non vide.
- **Écran de chargement** : si `isSubmitting` → `<Layout><PremiumLoading text="Création du compte..." size="lg" overlay variant="default" /></Layout>`.
- **Thème dynamique** : nombreuses constantes calculées à partir de `isDark` (`pageBackground`, `primaryText`, `secondaryText`, `mutedText`, `cardBackground`, `cardBorder`, `inputBackground`, `inputBorder`, `inputText`, `labelText`) et une fonction `inputClasses(hasError)` générant les classes Tailwind complètes d'un champ (bordure rouge si erreur).
- **Structure visuelle** : `grid lg:grid-cols-[0.8fr_1.2fr]`. Colonne gauche (cachée en mobile) : badge « Nouvelle génération », titre « Gérez votre activité avec élégance. », description, grille 2×2 de `features` locales (Dashboard/Clients/Inventaire/Rapports, différentes de celles de HomePage/AboutPage), ligne `TrustItem` (Données sécurisées / Rapide & moderne / Accessible partout). Colonne droite : carte formulaire avec bande dégradée supérieure, en-tête (icône `UserPlus` + badge `Crown` + badge `Star`), titre « Créer un compte », badges Sécurisé/Chiffré/Protégé.
  - **Section « Informations personnelles »** (sous-composant `SectionTitle` icône `User`) : Prénom/Nom (`Field` générique), Email (avec spinner de vérification et message d'erreur), Genre (`Select`) + Téléphone (grid 2 colonnes), Adresse.
  - **Section « Sécurité du compte »** (icône `Shield`, variante `emerald`) : Mot de passe (`PasswordInput` + `PasswordStrengthChecker` affiché uniquement si `!isPasswordValid`), Confirmation (`PasswordInput` + message "Les mots de passe correspondent" avec icône `CircleCheck` si égalité et valeur non vide).
  - **Section conditions** : `Checkbox` + `Label` avec liens `Link to="/terms"` et `Link to="/privacy"`, bordure rouge si `errors.acceptTerms`.
  - **Footer carte** : bouton submit « Créer mon compte » (`disabled={!isFormValid || isSubmitting}`, icône `Sparkles`/spinner si `isEmailChecking`), lien « Déjà membre ? Se connecter » → `/login`.
- **Sous-composants internes** : `Field`, `SectionTitle`, `ErrorMessage`, `TrustItem`, `SecurityBadge` (tous typés avec interfaces Props dédiées).
- **Dépendances** : `@/contexts/AuthContext` (`register`, `checkEmail`), `@/hooks/use-toast`, composants UI shadcn (Button, Input, Label, Checkbox, Card*, Select*), `PasswordInput`, `PasswordStrengthChecker`, `Layout`, `PremiumLoading`, `SEOHead`, icônes `lucide-react`. Pas de framer-motion ici (contrairement à Login/Reset).

### 6bis.A.6 `src/pages/ResetPasswordPage.tsx`

- **Rôle** : réinitialisation de mot de passe en deux étapes (vérification de l'email, puis saisie du nouveau mot de passe).
- **Route** : `/reset-password`.
- **SEO** : `title="Réinitialiser le mot de passe"`, description simple.
- **États locaux** : `email`, `newPassword`, `confirmPassword`, `emailVerified` (bool, bascule l'étape), `errors: {email?, newPassword?, confirmPassword?}`, `isLoading`, `isPasswordValid`, `showPasswordChecker` (bool, contrôle l'affichage du `PasswordStrengthChecker`).
- **Hooks** : `useAuth()` → `resetPasswordRequest`, `resetPassword` ; `useNavigate()`.
- **Validation locale du mot de passe** (`validatePassword`) : vérifie minuscule, majuscule, chiffre, caractère spécial et longueur ≥6 (règle dupliquée localement, indépendante de `PASSWORD_REGEX` de RegisterPage mais équivalente).
- **`handleEmailSubmit`** : `preventDefault()`, reset erreurs ; email requis, puis regex simple `/\S+@\S+\.\S+/` ; `isLoading=true`, appelle `resetPasswordRequest({email})` (AuthContext, gère probablement l'appel API et les toasts en interne) ; si `success` → `setEmailVerified(true)` (passe à l'étape 2). `isLoading=false` dans tous les cas.
- **`handlePasswordSubmit`** : `preventDefault()`, reset erreurs ; valide `newPassword` (requis + `validatePassword()`), `confirmPassword` (requis + égalité avec `newPassword`) ; si erreurs → `setErrors` et arrêt. Sinon `isLoading=true`, appelle `resetPassword({email, newPassword, confirmPassword})` ; si succès → `navigate('/login')`.
- **`handlePasswordValidityChange(isValid)`** : met à jour `isPasswordValid` et **ferme automatiquement** le `PasswordStrengthChecker` (`showPasswordChecker=false`) dès que le mot de passe est valide, le rouvre sinon.
- **Écran de chargement** : si `isLoading` → `<Layout><PremiumLoading text="Traitement en cours..." size="md" overlay variant="default" /></Layout>`.
- **Structure visuelle** : fond `bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950` avec halos animés en `motion.div` (translations/scale en boucle infinie, durées 15/18/20 s) + 6 particules flottantes animées (`y` oscillant, opacité pulsante) + grille de fond légère. Layout `lg:flex-row` : bloc texte gauche (« Récupérez votre compte », description) + carte formulaire à droite (glow dégradé, icône dynamique `KeyRound`/`CheckCircle` selon `emailVerified`, badge `Crown` rotatif infini).
  - **Étape 1** (`!emailVerified`) : champ email, bouton « Envoyer le lien ».
  - **Étape 2** (`emailVerified`) : `PasswordInput` nouveau mot de passe + `PasswordStrengthChecker`, `PasswordInput` confirmation, bouton « Réinitialiser le mot de passe » (`disabled` si `isLoading || !isPasswordValid || !confirmPassword`).
- **Dépendances** : `framer-motion` (`motion`), `@/contexts/AuthContext`, `PasswordInput`, `PasswordStrengthChecker`, `Layout`, `PremiumLoading`, `SEOHead`, composants UI shadcn, icônes `lucide-react`.

### 6bis.A.7 `src/pages/NotFound.tsx`

- **Rôle** : page 404 générique.
- **Route** : catch-all (`*`), en dehors du `<Layout>` (pas de navbar/footer applicatifs — page autonome en plein écran).
- **SEO** : `<SEOHead title="Page non trouvée" description="La page que vous cherchez n'existe pas" noindex />` (empêche l'indexation).
- **États locaux** : aucun. Utilise `useLocation()`.
- **Effet** : au changement de `location.pathname`, log `console.error("404 Error: User attempted to access non-existent route:", location.pathname)` (traçabilité des routes cassées).
- **Structure visuelle** : fond `bg-gradient-to-br from-[#030014] via-[#0a0020] to-[#0e0030]`, reflets miroir en dégradés superposés, halos `blur` animés (`animate-pulseGlow`, avec un délai de 3 s sur le second), 40 particules générées aléatoirement (`Math.random()` pour position/taille/délai/durée, classe `animate-particle`). Carte de verre centrale (`bg-white/[0.04]`, bordure translucide) avec ligne de brillance supérieure : titre « 404 » énorme en dégradé animé (`animate-rotateAndBounce`), sous-titre « Page introuvable », description, bouton (lien natif `<a href="/">`) « ⟵ Retour à l'accueil » avec effet de reflet balayant au survol (`translate-x-full` en transition 1000 ms).
- **Dépendances** : `react-router-dom` (`useLocation`), `@/components/SEOHead`. Aucune dépendance à `Layout`, `useAuth`, ni à une bibliothèque d'animation JS (tout est en classes CSS/Tailwind avec keyframes globaux supposés définis ailleurs : `animate-pulseGlow`, `animate-particle`, `animate-rotateAndBounce`, `animate-fadeIn`, `animate-fadeInDelay`, `animate-buttonFloat`).

### 6bis.A.8 `src/pages/MaintenancePage.tsx`

- **Rôle** : écran affiché à la place de toute l'application quand le site est en mode maintenance ; permet uniquement à un **administrateur principal** de s'authentifier pour lever la maintenance ou intervenir. Rendu **sans** `Layout` (pas de Navbar/Footer).
- **Route** : rendue par un composant parent (ex. garde globale) lorsque le mode maintenance est actif ; n'est pas nécessairement montée sur une route dédiée — reçoit des props.
- **Props** : `message?: string` (texte de maintenance personnalisé), `onAuthenticated?: () => void` (callback déclenché après connexion admin réussie).
- **Constantes** : `AUTH_BASE_URL` identique aux autres pages.
- **États locaux** : `showLogin` (bascule entre écran de message et formulaire), `email`, `password`, `errors`, `showPasswordField`, `isCheckingEmail`, `adminName`, `isLoggingIn`, et le même trio de sécurité que LoginPage : `maxAttempts`, `failedAttempts`, `isLocked`, `lockCountdown` + `countdownRef`.
- **Hooks** : `useNavigate()`, `useAuth()` → `login`, `useToast()`.
- **Effet** : identique au compte à rebours de verrouillage de LoginPage (décrément par seconde, reset à 0).
- **`handleEmailCheck`** : valide l'email (requis + regex) ; appelle d'abord `POST ${AUTH_BASE_URL}/api/maintenance/check-admin {email}` — **étape spécifique à cette page** : si `!adminCheck.data.isAdminPrincipal`, arrête immédiatement avec l'erreur "Seul un administrateur principal peut se connecter pendant la maintenance" (n'affiche pas le champ mot de passe). Si c'est bien un admin principal, appelle ensuite `POST ${AUTH_BASE_URL}/api/auth/check-email {email}` comme LoginPage pour récupérer `maxAttempts`/`failedAttempts`/`locked` et afficher `adminName`.
- **`handleSubmit`** : même logique en deux étapes que LoginPage (`!showPasswordField` → check email d'abord) ; à la connexion réussie (`POST /api/auth/login`), vérifie **une seconde fois** côté client que `response.data.user.role === 'administrateur principale'` — sinon toast destructif « Accès refusé » et arrêt sans connecter. Si le rôle est correct, appelle `login({email, password})` du contexte ; si succès, appelle `onAuthenticated?.()` puis `navigate('/profile')`. Mêmes branches d'erreur (423 verrouillage, 401 tentatives, autres) que LoginPage.
- **Structure visuelle** : fond `bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950` avec halos animés (ambre/violet/rose), 8 particules ambrées flottantes, grille de fond. `AnimatePresence mode="wait"` bascule entre deux écrans :
  - **Écran message** (`!showLogin`) : icône `Wrench` dans un carré dégradé ambre/orange avec badge `Crown` rotatif, badge « Maintenance en cours » (icône `ShieldAlert`), titre « Site en Maintenance », description (`message` prop ou texte par défaut), encart « Accès restreint » expliquant la restriction à l'admin principal, bouton « Se connecter (Admin principal) » → `setShowLogin(true)`.
  - **Écran formulaire** (`showLogin`) : icône `Fingerprint`, titre « Connexion Admin », sous-titre « Maintenance — Accès administrateur principal », badges Sécurisé/Chiffré, champ email (reset complet de l'état verrouillage/erreurs à chaque frappe), affichage `adminName` si vérifié, bloc mot de passe conditionnel avec compteur de tentatives et encart de verrouillage (identique à LoginPage), `PasswordInput`. Boutons : submit dynamique (Vérification/Se connecter/Continuer) et « Retour » qui réinitialise tout l'état du formulaire et revient à l'écran message.
- **Dépendances** : `axios`, `framer-motion` (`motion`, `AnimatePresence`), `@/contexts/AuthContext`, `@/hooks/use-toast`, `PasswordInput`, `PremiumLoading`, composants UI shadcn, icônes `lucide-react`. Pas de `SEOHead` ni de `Layout`.

### 6bis.A.9 `src/pages/SessionConflictPage.tsx`

- **Rôle** : écran affiché quand un profil (non administrateur principal) est déjà connecté ailleurs (autre IP/navigateur) lors d'une tentative de connexion ; propose de libérer la session distante automatiquement ou manuellement (avec accord de l'autre poste). Rendu **sans** `<Layout>` global — utilise sa propre coquille minimale via les composants `SessionShellNavbar` / `SessionShellHero` / `SessionShellFooter`.
- **Route** : `/session-conflict`.
- **Mécanisme d'entrée (`savePendingLogin` / `PendingLogin`)** : fonction exportée `savePendingLogin(data)` stockée dans `sessionStorage` sous la clé `session_conflict_pending`, avec le mot de passe encodé en base64 (`btoa`) — appelée depuis `LoginPage` (et potentiellement d'autres pages de connexion) juste avant la redirection vers cette page lorsqu'un conflit de session est détecté. `readPendingLogin()` relit et décode (`atob`) cet objet `{email, password, userId, role?, nom?, conflict}` ; `clearPendingLogin()` le supprime.
- **États locaux** : `pending` (lazy state initialisé une fois via `readPendingLogin()`), `mode: 'auto'|'manuel'|null`, `waiting` (bool), `remaining` (secondes restantes ou `null`). `requestIdRef` (id de la demande de déconnexion manuelle en cours) et `finishedRef` (garde anti double-exécution de `finishLogin`) via `useRef`.
- **Hooks** : `useNavigate()`, `useToast()`, `useAuth()` → `login`.
- **Effets** :
  1. Si `!pending` au montage → redirige immédiatement vers `/login` (`replace: true`) : la page ne peut être affichée qu'avec des données en attente valides.
  2. Suivi de la demande manuelle (actif seulement si `mode==='manuel' && waiting`) : `tick()` interroge `connecteProfilUniqueApi.requestStatus(requestId)` toutes les **1.5 s** ; met à jour `remaining` depuis `res.expiresAt` ; si statut `granted` ou `granted_timeout` → `waiting=false`, toast de succès (texte différent selon timeout ou confirmation manuelle) puis `finishLogin()` ; si `refused` → `waiting=false`, `clearPendingLogin()`, toast destructif, `navigate('/login')`. Erreurs réseau ignorées (nouvelle tentative au prochain tick). Nettoyage de l'intervalle au démontage/changement de dépendances.
- **`finishLogin`** (callback) : si pas de `pending` ou déjà exécuté (`finishedRef.current`), ne fait rien. Sinon marque `finishedRef.current=true`, appelle `login({email, password})` du contexte ; si `ok` : tente `connecteProfilUniqueApi.registerLogin({userId, email, nom, role})` puis `setSessionId(reg.sessionId)` (non bloquant), `clearPendingLogin()`, `navigate('/dashboard', {replace:true})`. Si `!ok` : réinitialise `finishedRef.current=false`, `clearPendingLogin()`, `navigate('/login', {replace:true})`.
- **`handleAuto`** : `mode='auto'`, `waiting=true`, appelle `connecteProfilUniqueApi.requestLogout(conflict.entryId, 'auto')` ; si `status==='granted'` → toast succès puis `finishLogin()` ; sinon `waiting=false`. Erreur → `waiting=false` + toast destructif.
- **`handleManuel`** : `mode='manuel'`, `waiting=true`, appelle `requestLogout(conflict.entryId, 'manuel')`, stocke `requestIdRef.current = res.requestId` ; si déjà `granted` → `finishLogin()` directement ; sinon calcule `remaining` depuis `res.expiresAt` et affiche un toast d'information (« Le poste distant reçoit une demande de déconnexion toutes les 5 secondes. »). Erreur → `waiting=false` + toast destructif.
- **Rendu** : si `!pending`, retourne `null` (le composant est de toute façon redirigé par l'effet). Sinon calcule `mmss` formaté (`mm:ss`) depuis `remaining`.
  - Coquille : `div.min-h-screen.flex.flex-col` fond `#020207` avec halos violet/fuchsia en absolu + grille de points légère (`radial-gradient`). `<SessionShellNavbar />` puis `<SessionShellHero />` puis `<main>` contenant la carte principale (`motion.div` fade+translate à l'entrée) :
    - En-tête : icône `ShieldAlert` dans un carré dégradé rose→fuchsia→violet, titre « Profil déjà connecté ailleurs », sous-titre explicatif.
    - Grille de 3 cartes d'information sur la session distante (`conflict` = `c`) : Appareil (`Monitor`, `c.browser`/`c.os`+`c.device`), Adresse IP (`Globe`, `c.ip`/`c.timezone`), Connecté depuis (`Clock`, `c.heureConnexion`/`c.dateConnexion`).
    - Si `waiting && mode==='manuel'` : encart d'attente avec spinner (`Loader2` animé), texte « Demande de déconnexion envoyée… En attente de la confirmation sur l'autre appareil. » + mention du délai automatique, gros compteur `mmss` en dégradé si disponible.
    - Sinon : deux boutons côte à côte — « Déconnecter automatiquement » (icône `Zap`, dégradé animé au survol, `onClick=handleAuto`, `disabled={waiting}`) et « Déconnecter manuellement » (icône `Hand`, bordure translucide, `onClick=handleManuel`, `disabled={waiting}`), chacun avec sous-texte explicatif.
    - Bouton texte « Annuler et revenir à la connexion » : `clearPendingLogin()` puis `navigate('/login', {replace:true})`.
  - `<SessionShellFooter />` en pied de page.
- **Dépendances** : `framer-motion` (`motion`), `@/hooks/use-toast`, `@/contexts/AuthContext`, `@/services/api/connecteProfilUniqueApi` (`check` n'est pas utilisé ici mais `requestLogout`, `requestStatus`, `registerLogin`, `setSessionId`, type `SessionConflict`), composants UI shadcn (`Button`, `Card` — `Card` important mais non visible dans le rendu final tel que lu), icônes `lucide-react`, et les 3 composants de coquille ci-dessous.

#### `src/components/session/SessionShellNavbar.tsx`

- Navbar minimale et autonome (pas la `Navbar` globale de l'app), utilisée uniquement par `SessionConflictPage`.
- **État local** : `dark` (bool), initialisé en lisant `localStorage.getItem('app-theme')` (défaut `'light'`).
- **Effet** : à chaque changement de `dark`, persiste `localStorage.setItem('app-theme', ...)` et bascule `document.documentElement.classList.toggle('dark', dark)` — gère le thème global de la page indépendamment du reste de l'app.
- **`toggle`** (callback) : inverse `dark`.
- **Rendu** : header `sticky top-0`, fond `bg-black/40` avec bordure basse translucide ; logo (`Link to="/"`) avec halo dégradé violet→fuchsia et image `/images/logo.ico` (masquée `onError`), libellé « SESSION » ; liens `Link to="/about"` et `Link to="/contact"` ; bouton bascule thème (`motion.button whileTap={{scale:0.9}}`) affichant `Sun` (ambre) ou `Moon` (violet) selon `dark`.

#### `src/components/session/SessionShellHero.tsx`

- Bloc d'en-tête statique (pas d'état) avec halos décoratifs `blur` en fond.
- Badge « Sécurité de session » (icône `Radar`), titre `h1` « Session Conflict » en dégradé, paragraphe descriptif, deux pastilles de confiance (« Chiffré » icône `Lock`, « Profil unique » icône `Fingerprint`).
- Toutes les entrées sont animées en `motion` (`opacity`/`y`) avec délais échelonnés (0, 0.05, 0.12 s).

#### `src/components/session/SessionShellFooter.tsx`

- Footer minimal statique : fond `bg-black/40` avec bordure haute translucide. Ligne gauche : icône `ShieldCheck` + « © {année} — Sécurité de session unique ». Ligne droite : liens `Link` vers `/about`, `/contact`, `/login`.

