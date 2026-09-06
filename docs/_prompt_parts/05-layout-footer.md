## 5bis. LOGIQUE DÉTAILLÉE — SHELL APPLICATIF : LAYOUT, FOOTER, SEO, UTILITAIRES RACINE

Cette section documente les composants racine de `src/components/` qui enveloppent **toutes** les pages. Ils doivent être recréés à l'identique avant les pages, car chaque page suppose leur présence.

### 5bis.1 `src/components/Layout.tsx` — coquille de toutes les routes

- **Rôle** : coquille commune (navbar + contenu + footer + surcouches) et **garde d'authentification**.
- **Props** : `children?: ReactNode`, `requireAuth?: boolean` (défaut `false`).
- **Logique** :
  - `const { isAuthenticated, isLoading } = useAuth()` ; `useAccessibility()` fournit `announceToScreenReader` ; `useLocation()` fournit `location`.
  - `isDashboardPage = location.pathname.startsWith('/dashboard')`.
  - `useAutoLogout()` retourne `sessionWarningVisible`, `sessionMinutesLeft`, `inactivityWarningVisible`, `inactivitySecondsLeft` (déconnexion automatique après inactivité, redirection vers la page d'accueil).
  - `useEffect` sur `location.pathname` : annonce `Page chargée: ${document.title}` au lecteur d'écran (accessibilité).
  - **Garde** : si `requireAuth && !isLoading && !isAuthenticated` → `<Navigate to="/login" state={{ from: location }} replace />`. Ne jamais rediriger pendant `isLoading` (sinon flash de déconnexion au rafraîchissement).
- **Rendu** : `div.flex.flex-col.min-h-screen` contenant, dans l'ordre :
  1. `<Navbar />`
  2. `<BackButton />` **uniquement si `!isDashboardPage`**
  3. `<TimeoutNotification />` recevant les 4 valeurs de `useAutoLogout`
  4. `<main id="main-content" className="flex-grow" role="main" aria-label="Contenu principal" tabIndex={-1}>` → `children || <Outlet />` (l'id `main-content` est **obligatoire** : le footer mesure sa marge gauche, voir 5bis.2)
  5. `<Footer />`, `<ScrollToTop />`, `<LiveChatAdmin />`
  6. `<ReservationExpiryNotifier />` **seulement si `isAuthenticated`**
- **Temps réel** : si `isAuthenticated`, tout le contenu est enveloppé dans `<RealtimeWrapper>` (abonnement SSE global) ; sinon rendu brut.

### 5bis.2 `src/components/Footer.tsx` — pied de page premium

- **Rôle** : pied de page unique pour tout le site (pages publiques **et** pages authentifiées).
- **Logique clé (à ne pas oublier)** : le footer s'aligne sur la sidebar du dashboard.
  - État `sidebarWidth` (number, défaut `0`).
  - `useEffect` au montage : `updateSidebarWidth()` lit `document.getElementById('main-content')`, récupère `window.getComputedStyle(mainContent).marginLeft`, applique `parseInt(...) || 0` dans `sidebarWidth`. Un `ResizeObserver` observe `#main-content` et rappelle `updateSidebarWidth` ; `disconnect()` au démontage.
  - Le `<footer>` porte `style={{ marginLeft: `${sidebarWidth}px` }}` → il se décale automatiquement quand la sidebar s'ouvre/se ferme.
- **Style** : `relative mt-auto overflow-hidden text-white transition-all duration-500`, fond très sombre constant (violet quasi noir) et bordure supérieure très faiblement opaque. Deux keyframes injectés en `<style>` local :
  - `footerOrbit` : translation `(0,0) → (20px,-15px) scale(1.1) → (0,0)`, utilisé sur deux halos de `500×500` (un fuchsia en haut à gauche animé sur 12 s, un cyan en bas à droite sur 14 s en `reverse`), plus un `radial-gradient` central très léger. Conteneur `absolute inset-0 pointer-events-none`.
  - `footerShine` : `background-position` de `-200% 0` à `200% 0`, classe `.footer-shine` = dégradé horizontal blanc translucide, `background-size: 200% 100%`, animation 4 s linéaire infinie. Appliquée sur une barre de 2 px collée en haut (`absolute top-0 inset-x-0`), superposée à une seconde barre en dégradé fuchsia transparent aux extrémités.
- **Contenu** : conteneur `relative max-w-7xl mx-auto px-6 py-16`, grille `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12`, chaque colonne animée en `motion.div` `initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}` avec `delay` progressif `0 / 0.1 / 0.2 / 0.3`.
  1. **Marque** : pastille `w-11 h-11 rounded-2xl` en dégradé fuchsia→violet→cyan avec icône `Sparkles`, `whileHover={{ rotate: 360, scale: 1.1 }}` sur 0.8 s + voile blanc `animate-pulse` ; titre « Gestion Vente » en `text-2xl font-extrabold` avec dégradé fuchsia→pink→cyan en `bg-clip-text text-transparent` ; paragraphe de présentation (plateforme SaaS de gestion ventes/stocks/performances) ; mention « Designed with precision in Réunion » avec icône `Heart` en `animate-pulse`.
  2. **Navigation** : titre `text-sm font-semibold uppercase tracking-widest`, liste `Accueil → /`, `À propos → /about`, `Contact → /contact`. Chaque `motion.li` `whileHover={{ x: 6 }}` (spring stiffness 300), puce dégradée qui `scale-150` au survol, et soulignement animé `after:` qui passe de `w-0` à `w-full`.
  3. **Services** (texte statique, non cliquable, `cursor-default`) : « Gestion intelligente des ventes », « Suivi stock en temps réel », « Analytics avancés », « Support premium 24/7 », chacun avec icône `Zap` et `whileHover={{ x: 6, color: '#fff' }}`.
  4. **Contact** : trois blocs `{icon, title, content}` — `MapPin` / Adresse / « Saint-Denis, La Réunion », `Mail` / Email / « vianey.jean@ymail.com », `Phone` / Téléphone / « +262 6 92 84 23 70 ». Carré d'icône `w-10 h-10 rounded-xl` qui prend un dégradé fuchsia→cyan au survol du groupe, icône `group-hover:scale-125 group-hover:rotate-12`.
- **Bas de footer** : séparateur `mt-16 pt-8 border-t`, ligne `flex-col md:flex-row justify-between` avec `© {new Date().getFullYear()} Gestion Vente — Tous droits réservés` à gauche et trois libellés survolables (`Confidentialité`, `Conditions`, `Support`) séparés par des points, `whileHover={{ scale: 1.1, color: '#fff' }}`.
- **Badges d'état** : trois pastilles `rounded-full` centrées (`Version 6.0.0 — Ultra Premium Build`, `Système stable & sécurisé`, `Architecture SaaS avancée`), animées `initial={{opacity:0,scale:0.8}} whileInView` avec `delay: i * 0.1` et `whileHover={{ y: -3, scale: 1.05 }}`, icône `Rocket` en `animate-pulse` et voile dégradé fuchsia→cyan en fond.
- **Dépendances** : `useAuth()` (le `user` est disponible pour d'éventuelles variantes), `Link` de react-router, `motion` de framer-motion, icônes lucide `Mail, Phone, MapPin, Heart, Sparkles, ShieldCheck, Zap, Rocket`.
- **Règle** : aucun flou (`blur`/`backdrop-blur`) dans ce projet — les effets de profondeur passent par dégradés, halos colorés et bordures translucides.

### 5bis.3 `src/components/SEOHead.tsx`

- **Props** : `title`, `description`, `canonical?`, `ogImage?` (défaut `/images/logo.ico`), `noindex?` (défaut `false`). Ne rend `null`.
- **Logique** (dans un `useEffect` dépendant des 5 props) :
  - `document.title = `${title} | Gestion Vente - Logiciel de gestion commerciale``.
  - Crée-ou-met-à-jour `meta[name="description"]`.
  - Si `canonical` fourni : crée-ou-met-à-jour `link[rel="canonical"]`.
  - `meta[name="robots"]` = `noindex,nofollow` si `noindex`, sinon `index,follow`.
  - Open Graph : `og:title`, `og:description`, `og:image`, `og:type=website`, `og:locale=fr_FR` (attribut `property`).
  - Twitter : `twitter:card=summary_large_image`, `twitter:title`, `twitter:description` (attribut `name`).
  - Pattern impératif : `querySelector` → si absent `createElement` + `appendChild(document.head)` → `setAttribute('content', ...)`.

### 5bis.4 `src/components/ScrollToTop.tsx`

- État `isVisible`. Écouteur `scroll` sur `window` : visible dès que `window.pageYOffset > 500`, sinon caché ; écouteur retiré au démontage. Retourne `null` si invisible.
- Rendu : conteneur `fixed bottom-8 left-1/2 -translate-x-1/2 z-50`, `Button` rond avec icône `ArrowUp`, `hover:scale-110`, `transition-all duration-300`, `onClick` → `window.scrollTo({ top: 0, behavior: 'smooth' })`.

### 5bis.5 `src/components/VisitTracker.tsx`

- Composant invisible (`return null`). Récupère `{ user, isLoading }` de `useAuth()` et appelle `useVisitLogger(isLoading ? null : user)` : enregistre la visite initiale puis chaque changement de route dans l'historique des connexions, **une seule fois par session navigateur**. Passer `null` pendant le chargement évite d'enregistrer une visite anonyme pour un utilisateur en fait connecté.

### 5bis.6 Autres composants racine à recréer

- **`CookieConsent.tsx`** (~473 lignes) : bandeau de consentement premium avec catégories de cookies (nécessaires, préférences, analytics, marketing), persistance du choix en `localStorage`, panneau de réglages détaillé, animations d'entrée/sortie framer-motion.
- **`AutoInjectWatcher.tsx`** (~186 lignes) : surveille l'état de l'auto-injection / auto-sauvegarde des bases JSON (`auto-injecter.json`, `auto-sauvegarde.json`) et déclenche les opérations serveur planifiées, avec notifications.
- **`PasswordInput.tsx`** : champ mot de passe avec bascule d'affichage (icône œil), utilisé partout où un mot de passe est saisi.
- **`PasswordStrengthChecker.tsx`** : affiche en direct les règles de robustesse (longueur, majuscule, minuscule, chiffre, caractère spécial) et un score visuel ; **réutilisé obligatoirement** dans l'inscription, le changement de mot de passe et la barrière administrateur principal (Versement espèce / Épargne).
- **`Navbar.tsx`** + `src/components/navbar/*` : barre de navigation premium (thème clair/sombre, notifications, messagerie, avertissements de session via `TimeoutNotification`, accès aux modales statistiques/objectifs).
- **`common/RealtimeWrapper.tsx`** : abonne l'application au flux SSE serveur et propage les invalidations de cache.
- **`accessibility/AccessibilityProvider.tsx`** : expose `announceToScreenReader`, gère les préférences de contraste/mouvement réduit.
- **`shared/BackButton.tsx`** : bouton retour affiché sur toutes les pages **hors** `/dashboard*`.
- **`notifications/ReservationExpiryNotifier.tsx`** : notifie l'expiration des réservations (uniquement si authentifié).
- **`livechat/LiveChatAdmin.tsx`** : widget de messagerie live visiteur ↔ admin, avec relais vers l'assistant IA si aucun administrateur ne répond dans les 2 secondes.
