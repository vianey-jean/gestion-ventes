# PROMPT IA — RECONSTRUCTION INTÉGRALE DU PROJET « Gestion Ventes / Riziky Studio »

> **Mode d'emploi :** copiez-collez l'intégralité de ce document à une IA de génération de code.
> Il contient la totalité de la spécification (front React + back Express) : design system, CSS,
> arborescence exhaustive, pages, composants, hooks, contextes, stores, services, types, utils,
> routes serveur, contrôleurs, modèles, base de données JSON, sécurité, temps réel et docs.
> L'IA doit régénérer **chaque fichier listé**, sans en omettre un seul.

---

## 0. INSTRUCTION PRINCIPALE À L'IA

Tu es un ingénieur full-stack senior. Recrée intégralement l'application décrite ci-dessous.

Règles absolues :
1. Respecte **exactement** l'arborescence de fichiers donnée (chemins, noms, extensions).
2. N'utilise **jamais** de couleur en dur (`text-white`, `bg-black`, `bg-[#hex]`) dans les composants :
   uniquement les tokens sémantiques HSL définis dans `src/index.css` + `tailwind.config.ts`.
3. Architecture MVC stricte :
   - un composant n'appelle jamais `axios` directement → il passe par `src/services/api/*Api.ts` ;
   - une route Express ne lit jamais un fichier → elle passe par `server/models/*.js` ;
   - toute écriture serveur émet un événement SSE (`server/middleware/sync.js`).
4. Tout est en **français** (UI, commentaires, messages d'erreur).
5. Style visuel imposé : **ultra moderne, luxe, glassmorphism**, dégradés violet/orange, animations
   `framer-motion`, effets miroir/shimmer, mode clair **et** sombre sur chaque écran.
6. Tout doit être **responsive** (mobile 375px → écran 1400px+) et accessible (ARIA, focus visible,
   `prefers-reduced-motion`, contraste élevé, skip link).
7. Zéro erreur TypeScript, zéro import manquant, zéro composant orphelin.

---

## 1. IDENTITÉ & PÉRIMÈTRE FONCTIONNEL

Application de **gestion commerciale complète** pour un revendeur (La Réunion / Madagascar) :

- **Ventes** : saisie multi-produits, prix d'achat/vente, livraison, bénéfice, remboursements, échanges.
- **Produits** : stock, prix, attributs dynamiques (couleur, taille, modèle…), photos, code-barres,
  historique de prix, commentaires, produits vendus, fusion de doublons.
- **Clients** : fiches multi-téléphones/multi-adresses/multi-villes, photo, fidélité, fusion, partage.
- **Commandes & réservations** : statuts (en attente, ultérieure, confirmée, annulée), planification,
  préparation de livraison quotidienne, confirmation RDV 24 h, conflits de créneaux.
- **RDV & tâches** : calendrier, notifications du jour, report, confirmation, synchronisation croisée
  Commandes ↔ RDV ↔ Tâches.
- **Comptabilité** : achats, dépenses (avec justificatifs PDF/photo), bénéfices, solde net, graphiques,
  export PDF/JPEG, facturation.
- **Prêts** : prêts famille et prêts produits, avances, remboursements, retards.
- **Pointage** : travailleurs, entreprises, pointage manuel et automatique, avances, exclusion de jours,
  totaux journaliers/mensuels/annuels, PDF d'historique.
- **Notes / Kanban** : colonnes, cartes, dessin, partage par lien avec commentaires.
- **Épargne & versements espèces** : comptes chiffrés, Ar + Fmg (Fmg = Ar × 5), accès protégé par mot de
  passe administrateur principal (3 essais, verrouillage 15 min).
- **Messagerie / live chat** : visiteur ↔ admin, groupes, compteurs de non-lus, WebRTC.
- **Profil & paramètres** : sécurité, maintenance, modules, IP bloquées, historique de connexion,
  auto-injection de données, auto-sauvegarde, suppression totale.
- **Sécurité** : page de vérification anti-bot, session unique, JWT, chiffrement des bases, threat shield.

---

## 2. STACK TECHNIQUE

**Front** : React 19 + TypeScript 5 + Vite 7 + Tailwind CSS 3 + shadcn/ui (Radix) + framer-motion +
react-router-dom 7 + zustand + @tanstack/react-query + axios (+ axios-retry) + recharts + jspdf +
html2canvas + date-fns + zod + react-hook-form + lucide-react + sonner.

**Back** : Node.js ≥18 + Express + JSON file database (`server/db/*.json`) + multer (uploads) +
JWT + bcrypt + SSE (`/api/sync/events`) + chiffrement AES des bases.

Dépendances front exactes :

```
@eslint/js, @hookform/resolvers, @lovable.dev/vite-plugin-dev-server-bridge, @lovable.dev/vite-plugin-hmr-gate, @radix-ui/react-accordion, @radix-ui/react-alert-dialog, @radix-ui/react-aspect-ratio, @radix-ui/react-avatar, @radix-ui/react-checkbox, @radix-ui/react-collapsible, @radix-ui/react-context-menu, @radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-hover-card, @radix-ui/react-label, @radix-ui/react-menubar, @radix-ui/react-navigation-menu, @radix-ui/react-popover, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-select, @radix-ui/react-separator, @radix-ui/react-slider, @radix-ui/react-slot, @radix-ui/react-switch, @radix-ui/react-tabs, @radix-ui/react-toast, @radix-ui/react-toggle, @radix-ui/react-toggle-group, @radix-ui/react-tooltip, @radix-ui/react-visually-hidden, @supabase/supabase-js, @tailwindcss/aspect-ratio, @tailwindcss/container-queries, @tailwindcss/postcss, @tailwindcss/typography, @tanstack/react-query, @testing-library/dom, @testing-library/jest-dom, @testing-library/react, @types/node, @types/react, @types/react-dom, @vitejs/plugin-react, @vitejs/plugin-react-swc, autoprefixer, axios, axios-retry, baseline-browser-mapping, class-variance-authority, clsx, cmdk, cors, date-fns, embla-carousel-react, eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, framer-motion, globals, html2canvas, input-otp, jsbarcode, jsdom, jspdf, jspdf-autotable, lovable-tagger, lucide-react, next-themes, postcss, react, react-day-picker, react-dom, react-hook-form, react-resizable-panels, react-router-dom, recharts, sonner, tailwind-merge, tailwindcss, tailwindcss-animate, typescript, typescript-eslint, vaul, version, vite, vitest, zod, zustand
```

---

## 3. DESIGN SYSTEM (à recréer à l'identique)

### 3.1 `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        'xs': '375px',    // iPhone SE
        'sm': '640px',    // Petites tablettes
        'md': '768px',    // Tablettes
        'lg': '1024px',   // Petits laptops
        'xl': '1280px',   // Laptops standards
        '2xl': '1400px'   // Grands écrans
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        // Custom app colors
        "app-red": "#ea384c",
        "app-blue": "#1EAEDB",
        "app-purple": "#9b87f5",
        "app-dark-purple": "#7E69AB",
        "app-green": "#4ade80",
        "app-dark": "#1A1F2C",
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'marquee': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'marquee': 'marquee 12s linear infinite'
      },
      screens: {
        'touch': {'raw': '(hover: none)'},
        'stylus': {'raw': '(hover: none) and (pointer: coarse)'},
        'portrait': {'raw': '(orientation: portrait)'},
        'landscape': {'raw': '(orientation: landscape)'},
      },
      
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol'
        ],
      },
      
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      transformStyle: {
        '3d': 'preserve-3d',
      },
      perspective: {
        'none': 'none',
        '500': '500px',
        '1000': '1000px',
      },
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/container-queries"),
  ],
} satisfies Config;
```

### 3.2 Tokens & CSS global — `src/index.css` (1657 lignes)

Le fichier contient, dans cet ordre :
1. `@import './styles/accessibility.css';` puis `@tailwind base/components/utilities`.
2. `@layer base` → variables HSL `:root` (thème clair) et `.dark` (thème sombre) :
   background, foreground, card, popover, primary, secondary, muted, accent, destructive, border,
   input, ring, `--radius: 0.75rem`, `--chart-1..5`, `--app-red/--app-blue/--app-purple`,
   variables d'espacement responsive (`--spacing-page/section/card`) et de typographie
   (`--text-xs` → `--text-4xl`) redéfinies aux breakpoints 640px et 1024px.
3. Classes de notification (`.notification-success` vert, `.notification-erreur` rouge).
4. `@layer base` → bordures globales, `body` sur tokens, `line-height 1.6`, focus-visible ring sur
   tous les éléments interactifs, `.skip-link`.
5. `@layer components` → `.card-3d`, `.btn-3d`, `.fade-in`, `.slide-up`, `.scale-in`,
   `.chart-accessible`, `.table-responsive`, `.form-group`, `.form-input`, `.form-label`,
   `.form-error`, `.responsive-container`, `.responsive-grid`, `.responsive-card`,
   `.responsive-button-group`, `.responsive-dialog`, `.responsive-h1/h2/h3`, `.responsive-text`.
6. Keyframes globales, support `@media print`, `prefers-reduced-motion`, `prefers-contrast: high`.
7. `@layer utilities` → effets **ultra luxe** : `.mirror-glass`, `.mirror-shine`, `.mirror-border`,
   `.btn-mirror`, `.card-mirror` (verre dépoli, reflets, halos violets, shimmer au survol).
8. Scrollbar personnalisée fine, dégradé orange (`rgba(249,115,22,…)`), `scrollbar-width: thin`,
   `::-webkit-scrollbar` 7px.

Classes CSS personnalisées présentes dans `src/index.css` (à reproduire toutes) :

```
.animate-buttonFloat, .animate-fadeIn, .animate-fadeInDelay, .animate-gradientShift, .animate-particle, .animate-pulseGlow, .animate-rotateAndBounce, .btn-3d, .btn-mirror, .card-3d, .card-mirror, .card-mirror-light, .chart-accessible, .confirmation-luxury-pulse, .confirmation-luxury-shimmer, .dark, .fade-in, .form-error, .form-group, .form-input, .form-label, .livraison-luxury-pulse, .livraison-luxury-shimmer, .mirror-border, .mirror-glass, .mirror-glass-light, .mirror-shine, .no-print, .notification-erreur, .notification-success, .print-only, .responsive-button-group, .responsive-card, .responsive-container, .responsive-dialog, .responsive-grid, .responsive-h1, .responsive-h2, .responsive-h3, .responsive-text, .scale-in, .skip-link, .slide-up, .table-responsive
```

Keyframes définies : `buttonFloat`, `confirmation-luxury-glow`, `confirmation-luxury-shimmer-kf`, `fadeIn`, `fadeInDelay`, `gradientShift`, `livraison-luxury-glow`, `livraison-luxury-shimmer-kf`, `maintenance-shimmer`, `particle`, `pulseGlow`, `rotateAndBounce`, `scaleIn`, `slideUp`, `stockBlink`, `stockPulse`.

### 3.3 Feuilles de style complémentaires

| Fichier | Lignes | Rôle |
|---|---|---|
| `src/App.css` | 42 | root { |
| `src/index.css` | 1657 |  |
| `src/styles/accessibility.css` | 111 | Styles d'accessibilité modulaires pour WCAG 2.1 AA */ |
| `src/styles/base/contrast.css` | 25 | Mode haut contraste */ |
| `src/styles/base/motion.css` | 24 | Mode mouvement réduit */ |
| `src/styles/base/typography.css` | 29 | Mode texte large */ |
| `src/styles/components/forms.css` | 21 | Amélioration des formulaires */ |
| `src/styles/components/navigation.css` | 27 | Navigation au clavier améliorée */ |
| `src/styles/utilities/screen-reader.css` | 33 | Classes utilitaires pour l'accessibilité */ |

Contenu attendu :
- `src/styles/accessibility.css` — point d'entrée qui importe les sous-fichiers `base/`, `components/`, `utilities/`.
- `src/styles/base/contrast.css` — mode contraste élevé.
- `src/styles/base/motion.css` — réduction des animations.
- `src/styles/base/typography.css` — tailles de police adaptatives (petit/normal/grand).
- `src/styles/components/forms.css` — champs, labels, erreurs accessibles.
- `src/styles/components/navigation.css` — navigation clavier, focus.
- `src/styles/utilities/screen-reader.css` — `.sr-only`, `.not-sr-only`, annonces live-region.
- `src/App.css` — surcouches applicatives résiduelles.

### 3.4 Règles de style transverses

- **Navbar** : barre supérieure sticky en verre dépoli, logo `src/assets/logo.png`, liens actifs
  soulignés en dégradé, indicateur d'objectif (`ObjectifIndicator`), notification de timeout,
  bascule clair/sombre, menu mobile en `Sheet`.
- **Footer** : fond sombre dégradé, colonnes (à propos, navigation, contact), mentions légales.
- **Sidebar** : `src/components/ui/sidebar.tsx` (shadcn) avec tokens `--sidebar-*`.
- **Hero de page** : composants `PageHero` / `LuxeHero` — titre dégradé, sous-titre, orbes animés,
  grille flottante en fond, badges statistiques.
- **Cartes statistiques** : `StatCard`, `ClickableStatCard`, `StatBadge` — icône dans pastille dégradée,
  valeur en grand, variation, ouverture d'une modale de détail au clic.
- **Modales** : `Dialog` shadcn, en-tête dégradé, `max-h-[90vh] overflow-y-auto`, largeur responsive,
  boutons d'action en bas à droite, animation d'entrée `scale + fade`.
- **Formulaires** : `react-hook-form` + `zod`, labels flottants, messages d'erreur rouges,
  bouton principal dégradé avec état de chargement (`PremiumLoading`).
- **Tableaux** : version desktop (`<table>` sticky header) + version mobile en cartes
  (ex. `CommandeMobileCard`), lignes zébrées, totaux encadrés.
- **Chargement** : `premium-loading.tsx`, `professional-loading.tsx`, `LoadingDots`,
  `LoadingSkeleton`, `LoadingSpinner`, `LoadingOverlay`.

---

## 4. ARBORESCENCE COMPLÈTE

```text
.
├── index.html, package.json, vite.config.ts, tailwind.config.ts, postcss.config.js,
│   tsconfig*.json, eslint.config.js, vitest.config.ts, vercel.json, components.json, .env
├── public/            7 fichiers (robots.txt, sitemap.xml, images, placeholder)
├── docs/              27 documents markdown
├── src/               609 fichiers
│   ├── assets/ components/ contexts/ hooks/ lib/ pages/ service/ services/ store/ styles/
│   ├── tests/ types/ utils/
│   └── App.tsx App.css index.css main.tsx *.d.ts
└── server/            213 fichiers de code + 77 bases JSON
    ├── config/ controllers/ middleware/ models/ routes/ security/ services/ db/ uploads/
    └── server.js
```

---

## 5. POINT D'ENTRÉE FRONT

### 5.1 `src/main.tsx`

```tsx
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { installRuntimeSecurity } from './lib/runtimeSecurity'
import { installAntiTamper } from './lib/antiTamper'

// Durcissement runtime (léger, exécuté une seule fois avant le rendu)
installRuntimeSecurity();
// Défenses anti-clone / anti-iframe / anti-exfiltration
installAntiTamper();

createRoot(document.getElementById("root")!).render(<App />);
```

### 5.2 `src/App.tsx` — providers et routage

```tsx
// Résumé :
// Ce fichier définit la configuration principale de l'application React.
// - Fournit les Contexts globaux : Auth, App, Theme, Accessibilité
// - Configure les routes avec sécurité (ProtectedRoute) et lazy loading
// - Utilise ErrorBoundary pour isoler les erreurs critiques
// - Améliore les performances en chargeant les pages "à la demande"

import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SecurityCheckPage from '@/components/security/SecurityCheckPage';

// Contexts
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';

// Sécurité et erreurs
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import CookieConsent from '@/components/CookieConsent';
import MaintenanceGate from '@/components/maintenance/MaintenanceGate';

// Fallback pendant chargement des pages
import PremiumLoading from '@/components/ui/premium-loading';
import PointageAutoWatcher from '@/components/pointage/PointageAutoWatcher';
import AutoInjectWatcher from '@/components/AutoInjectWatcher';
import GlobalRdvTodayNotifier from '@/components/rdv/GlobalRdvTodayNotifier';
import VisitTracker from '@/components/VisitTracker';
import SessionUniqueWatcher from '@/components/auth/SessionUniqueWatcher';
import SessionConflictPage from '@/pages/SessionConflictPage';

// ==================
// Lazy loading pages
// ==================
const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ClientsPage = lazy(() => import('@/pages/ClientsPage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const CommandesPage = lazy(() => import('@/pages/CommandesPage'));
const RdvPage = lazy(() => import('@/pages/RdvPage'));
const ProduitsPage = lazy(() => import('@/pages/ProduitsPage'));
const PointagePage = lazy(() => import('@/pages/PointagePage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const SharedNotesPage = lazy(() => import('@/pages/SharedNotesPage'));
const SharedViewPage = lazy(() => import('@/pages/SharedViewPage'));

function App() {
  const [securityVerified, setSecurityVerified] = useState(() => {
    try {
      const data = sessionStorage.getItem('security_verified');

      if (data) {
        const parsed = JSON.parse(data);

        // Vérifier que la session est encore valide
        if (parsed.verified && parsed.timestamp) {
          const elapsed = Date.now() - parsed.timestamp;

          // Valide pendant 24h max
          if (elapsed < 24 * 60 * 60 * 1000) {
            return true;
          }
        }
      }
    } catch {
      // ignore
    }

    return false;
  });

  if (!securityVerified) {
    return (
      <ThemeProvider>
        <SecurityCheckPage
          onVerified={() => setSecurityVerified(true)}
        />
      </ThemeProvider>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <ThemeProvider>
          <AccessibilityProvider>
            <AuthProvider>
              <AppProvider>
                <MaintenanceGate>
                  {/* Suspense : gestion du chargement asynchrone */}
                  <Suspense
                    fallback={
                      <PremiumLoading
                        text="Chargement des données en cours..."
                        size="xl"
                        overlay={true}
                        variant="default"
                      />
                    }
                  >
                    <Routes>
                      {/* Routes publiques */}
                      <Route index element={<HomePage />} />
                      <Route path="about" element={<AboutPage />} />
                      <Route path="login" element={<LoginPage />} />
                      <Route path="register" element={<RegisterPage />} />
                      <Route
                        path="reset-password"
                        element={<ResetPasswordPage />}
                      />
                      <Route
                        path="session-conflict"
                        element={<SessionConflictPage />}
                      />
                      <Route path="contact" element={<ContactPage />} />
                      <Route
                        path="shared/notes/:token"
                        element={<SharedNotesPage />}
                      />
                      <Route
                        path="shared/:token"
                        element={<SharedViewPage />}
                      />

                      {/* Routes protégées */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/clients"
                        element={
                          <ProtectedRoute>
                            <ClientsPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/messages"
                        element={
                          <ProtectedRoute>
                            <MessagesPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/commandes"
                        element={
                          <ProtectedRoute>
                            <CommandesPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/rdv"
                        element={
                          <ProtectedRoute>
                            <RdvPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/produits"
                        element={
                          <ProtectedRoute>
                            <ProduitsPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/pointage"
                        element={
                          <ProtectedRoute>
                            <PointagePage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Page 404 */}
                      <Route
                        path="*"
                        element={<NotFound />}
                      />
                    </Routes>
                  </Suspense>
                </MaintenanceGate>

                {/* Composants qui utilisent potentiellement React Router */}
                <VisitTracker />
                <SessionUniqueWatcher />
                <PointageAutoWatcher />
                <AutoInjectWatcher />
                <GlobalRdvTodayNotifier />

                <Toaster />
                <CookieConsent />
              </AppProvider>
            </AuthProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
```

---


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

---

## 6. PAGES (56 fichiers)

| Fichier | Lignes | Rôle |
|---|---|---|
| `src/pages/AboutPage.tsx` | 1518 | AboutPage.tsx Version optimisée Performance Objectifs : - Chargement rapide - Très léger sur mobile / tablette - Aucun Framer Motion - Aucun backgroun… |
| `src/pages/ClientsPage.tsx` | 555 | ClientsPage - Page de gestion des clients (refactorisée en sous-composants). Fonctionnalités : recherche, tri par nom, filtre fidélité, filtre ville, … |
| `src/pages/CommandesPage.tsx` | 252 | ============================================================================= CommandesPage - Page de gestion des Commandes et Réservations ==========… |
| `src/pages/Comptabilite.tsx` | 11 | Comptabilite.tsx - Redirection vers la page comptabilité dans le dashboard */ |
| `src/pages/ContactPage.tsx` | 870 |  |
| `src/pages/DashboardPage.tsx` | 2259 | ============================================================================= DashboardPage - Ultra Luxury Premium SaaS ==============================… |
| `src/pages/Depenses.tsx` | 11 | Depenses.tsx - Redirection vers la page dépenses dans le dashboard */ |
| `src/pages/HomePage.tsx` | 1145 |  |
| `src/pages/Index.tsx` | 12 | Composant de la page d'index Redirige automatiquement vers la page d'accueil |
| `src/pages/LoginPage.tsx` | 1466 | LoginPage.tsx Premium / performant / responsive Logique conservée : - Vérification email - Connexion - Tentatives / verrouillage - Session unique - Au… |
| `src/pages/MaintenancePage.tsx` | 466 | MaintenancePage — Page affichée quand le site est en maintenance. Style ultra-luxe (cohérent avec la page Comptabilité / Login). Permet à un administr… |
| `src/pages/MessagesPage.tsx` | 2479 | MessagesPage.tsx - Page de messagerie interne avec notifications et compteur de non-lus */ |
| `src/pages/NotFound.tsx` | 85 |  |
| `src/pages/PointagePage.tsx` | 367 | PointagePage.tsx - Page de gestion du pointage des travailleurs Affiche les entreprises, travailleurs et entrées de pointage. Inclut le partage de don… |
| `src/pages/PretFamilles.tsx` | 10 | Redirige vers la page Dashboard qui contient la gestion des prêts familles |
| `src/pages/PretProduits.tsx` | 10 | Redirige vers la page Dashboard qui contient la gestion des prêts produits |
| `src/pages/Produits.tsx` | 10 | Redirige vers la page Dashboard qui contient la gestion des produits |
| `src/pages/ProduitsPage.tsx` | 905 | ProduitsPage.tsx - Page de gestion des produits Version décomposée : la page orchestre uniquement l'état et délègue le rendu aux composants extraits d… |
| `src/pages/ProfilePage.tsx` | 252 | ProfilePage — Page principale du profil utilisateur (refactorisée). Onglets : - Profil : ProfileCard + ProfileInfoCard + PasswordSection - Paramètres … |
| `src/pages/RdvPage.tsx` | 325 | ============================================================================= RdvPage - Page de gestion des rendez-vous ==============================… |
| `src/pages/RegisterPage.tsx` | 1476 |  |
| `src/pages/ResetPasswordPage.tsx` | 263 |  |
| `src/pages/SessionConflictPage.tsx` | 303 | SessionConflictPage.tsx — VUE : profil déjà connecté ailleurs. Affichée quand un profil (non administrateur principal) est déjà connecté sur une autre… |
| `src/pages/SharedNotesPage.tsx` | 207 |  |
| `src/pages/SharedViewPage.tsx` | 344 | SharedViewPage.tsx Page publique pour visualiser un lien partagé (pointage, tâches ou notes). Accessible sans authentification via un token unique et … |
| `src/pages/Tendances.tsx` | 42 | Tendances.tsx - Page d'analyse des tendances de ventes avec graphiques */ |
| `src/pages/TendancesPage.tsx` | 134 | ============================================================================= TendancesPage - Page d'analyse des tendances et analytics ==============… |
| `src/pages/Ventes.tsx` | 11 | Ventes.tsx - Redirection vers la page ventes dans le dashboard */ |
| `src/pages/VentesEmbedded.tsx` | 61 | VentesEmbedded - Contenu Ventes pour le Dashboard unifié Réutilise les composants existants du dashboard original. |
| `src/pages/clients/ClientHero.tsx` | 377 | ============================================================================= CLIENT HERO ULTRA PREMIUM ==============================================… |
| `src/pages/clients/ClientSearchSection.tsx` | 80 | ============================================================================= ClientSearchSection - Barre de recherche des clients ===================… |
| `src/pages/clients/index.ts` | 8 | ============================================================================= Index des sous-composants de la page Clients ===========================… |
| `src/pages/dashboard/DashboardHero.tsx` | 290 | ============================================================================= DashboardHero V2 - Ultra Premium Futuristic Hero =======================… |
| `src/pages/dashboard/DashboardTabContent.tsx` | 164 | ============================================================================= DashboardTabContent - Contenu des onglets du dashboard =================… |
| `src/pages/dashboard/DashboardTabNavigation.tsx` | 895 | ============================================================================= DashboardTabNavigation - Navigation par onglets du dashboard ===========… |
| `src/pages/dashboard/index.ts` | 11 | ============================================================================= Index des composants du Dashboard ======================================… |
| `src/pages/produits/AchatVenteSubModals.tsx` | 291 | AchatVenteSubModals.tsx Sous-modales réutilisables pour la page Produits : - Voir / Modifier / Supprimer un achat - Voir / Modifier / Supprimer une ve… |
| `src/pages/produits/ProduitsFiltersStats.tsx` | 104 | ProduitsFiltersStats.tsx Pills de filtres + 4 cartes statistiques pour la page Produits. |
| `src/pages/produits/ProduitsHero.tsx` | 25 |  |
| `src/pages/produits/ProduitsToolbar.tsx` | 79 | ProduitsToolbar.tsx Barre de recherche + 4 boutons d'action principaux (Ajouter, Modifier, Voir plus vendu, Fusionner) pour la page Produits. |
| `src/pages/rdv/RdvHero.tsx` | 206 |  |
| `src/pages/rdv/RdvListView.tsx` | 163 | ============================================================================= RdvListView - Vue en liste des rendez-vous du mois =====================… |
| `src/pages/rdv/RdvSearchBar.tsx` | 161 | ============================================================================= RdvSearchBar - Barre de recherche avec suggestions pour les RDV ========… |
| `src/pages/rdv/RdvStatsCards.tsx` | 71 | ============================================================================= RdvStatsCards - Cartes statistiques de la page Rendez-vous =============… |
| `src/pages/rdv/index.ts` | 10 | ============================================================================= Index des sous-composants de la page Rendez-vous =======================… |
| `src/pages/tendances/TendancesCategoriesTab.tsx` | 113 | ============================================================================= TendancesCategoriesTab - Onglet Par Catégories =========================… |
| `src/pages/tendances/TendancesClientsTab.tsx` | 366 | TendancesClientsTab - Onglet Analyse Clients |
| `src/pages/tendances/TendancesHero.tsx` | 64 | ============================================================================= TendancesHero - Section héroïque de la page Tendances ==================… |
| `src/pages/tendances/TendancesOverviewTab.tsx` | 131 | ============================================================================= TendancesOverviewTab - Onglet Vue d'ensemble ===========================… |
| `src/pages/tendances/TendancesProductsTab.tsx` | 67 | ============================================================================= TendancesProductsTab - Onglet Performance par Produit ==================… |
| `src/pages/tendances/TendancesRecommendationsTab.tsx` | 92 | ============================================================================= TendancesRecommendationsTab - Onglet Recommandations d'achat ===========… |
| `src/pages/tendances/TendancesStatsCards.tsx` | 127 | ============================================================================= TendancesStatsCards - Cartes statistiques de la page Tendances =========… |
| `src/pages/tendances/TendancesStockTab.tsx` | 109 | ============================================================================= TendancesStockTab - Onglet Prévention Stock (Intelligence) =============… |
| `src/pages/tendances/TendancesTabNavigation.tsx` | 66 | ============================================================================= TendancesTabNavigation - Navigation par onglets de la page Tendances ===… |
| `src/pages/tendances/index.ts` | 16 | ============================================================================= Index des sous-composants de la page Tendances =========================… |
| `src/pages/tendances/useTendancesData.ts` | 248 | ============================================================================= useTendancesData - Hook de données pour la page Tendances ==============… |

Comportements attendus par page clé :
- **HomePage / AboutPage / ContactPage** : vitrine publique ultra luxe, orbes animés, grille flottante,
  sections en `motion.div` avec apparition au scroll, formulaire de contact validé.
- **LoginPage / RegisterPage / ResetPasswordPage** : carte en verre centrée, fond animé, champs avec
  `PasswordInput` + `PasswordStrengthChecker`, gestion d'erreurs, redirection `/dashboard`.
- **SecurityCheckPage** (composant, affiché avant toute route) : puzzle anti-bot, honeypots, entropie
  souris, détection navigateur headless, mémorisation 24 h dans `sessionStorage`.
- **DashboardPage** : onglets (ventes, dépenses, prêts, comptabilité, tendances, inventaire),
  hero, cartes de stats cliquables, tableaux, formulaires de vente multi-produits.
- **ClientsPage / ProduitsPage / CommandesPage / RdvPage / PointagePage / MessagesPage / ProfilePage** :
  hero + barre de recherche unifiée + filtres + grille/tableau + modales CRUD + temps réel.
- **SharedViewPage / SharedNotesPage** : accès public par token, lecture seule + commentaires.
- **SessionConflictPage / MaintenancePage / NotFound** : écrans d'état pleine page.

---


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

---

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

---

## 6bis.C PAGES MÉTIER — CLIENTS, COMMANDES, PRODUITS, POINTAGE & RENDEZ-VOUS

Cette section documente les pages « métier » du tableau de bord : gestion des clients, des commandes/réservations/RDV via `useCommandesLogic`, des produits, du pointage (avec ses onglets Tâches/Notes/RDV internes) et des rendez-vous. Toutes acceptent une prop `embedded?: boolean` (rendu sans `<Layout>`/`<Navbar>`/`<Footer>` quand `true`, utilisé pour l'intégration dans un tableau de bord unique) et affichent un écran `<PremiumLoading>` pendant le chargement initial.

### 6bis.C.1 `src/pages/ClientsPage.tsx` (+ `src/pages/clients/*`)

- **Rôle** : gestion complète du portefeuille clients — recherche, tri, filtres (palier de fidélité, ville), CRUD avec photo, détection/fusion de doublons, gestion des villes, actions rapides téléphone/adresse, consultation de la fidélité.
- **Route** : `/clients` (ou embarquée dans le tableau de bord).
- **SEO** : `SEOHead title="Clients" description="Gestion des clients - Liste et suivi des clients"`.
- **États locaux** (tous `useState`) :
  - Formulaire : `isAddDialogOpen`, `editingClient`, `isSubmitting`, `formData: ClientFormData` (`nom`, `phones[]`, `addresses[]`, `ville`, `villes[]`), `availableVilles`.
  - Photo : `photoFile`, `photoPreview`, `removeExistingPhoto` (+ `photoInputRef`).
  - Recherche/tri/pagination : `searchQuery`, `currentPage`, `itemsPerPage=20`, `clientSortDir` (`asc|desc`), `tierFilter` (`FidelityTier|null`), `villeFilter`.
  - Confirmations : `showAddConfirm`, `showEditConfirm`, `showDeleteConfirm`, `clientToDelete`.
  - Actions rapides : `phoneActionOpen`, `selectedPhone`, `addressActionOpen`, `selectedAddress`.
  - Modales : `zoomPhoto`, `isMergeOpen`, `isVillesOpen`, `isFideliteListOpen`, `detailClient`, `duplicateModalOpen`, `duplicateMatches: ClientMatch[]`.
  - `fideliteMap: Record<string, FideliteEntry>` (clé = nom normalisé en minuscule/trim).
  - Ref `clientsGridRef` (scroll cible de la pagination).
- **Hooks** : `useAuth()` (`isAuthenticated`), `useClientSync()` (`clients`, `isLoading`, `refetch` — source de vérité temps réel des clients), `useToast()`, `useIsMobile()`.
- **Effets** :
  1. Quand `isAddDialogOpen` passe à `true` : charge `clientsVillesApi.getAll()` → `availableVilles` (catch → `[]`).
  2. Au montage : charge `fideliteApiService.getAll()` → `fideliteMap` ; recharge sur les événements globaux `window` `sales-updated` et `listes-fidelite-updated` (le backend recalcule `fidelite.json` à chaque vente ou changement de palier) ; nettoyage des listeners à l'unmount.
  3. Reset `currentPage=1` quand `searchQuery`, `tierFilter` ou `villeFilter` changent ; correction de `currentPage` si `> totalPages`.
- **Logique métier / handlers** :
  - **Photo** : `handlePhotoSelect` (FileReader → data URL preview), `removePhoto` (marque `removeExistingPhoto=true` si le client édité avait une photo), `getClientPhotoUrl(client)` = `${API_BASE_URL}${client.photo}`.
  - **Téléphone** : `handlePhoneClick` ouvre `ClientPhoneActionModal` ; `handleCall` → `tel:`; `handleMessage` → `sms:` sur mobile, sinon toast informatif.
  - **Adresse** : `handleAddressClick` — sur mobile ouvre `ClientAddressActionModal`, sinon ouvre directement Google Maps dans un nouvel onglet ; `openGoogleMaps`/`openWaze`/`openAppleMaps` construisent les URLs avec `encodeURIComponent`.
  - **Filtrage** (`useMemo filteredClients`) : recherche texte (nom/téléphones/adresse) active seulement à partir de 3 caractères ; filtre par palier de fidélité (`fideliteMap[norm(nom)].tier`, défaut `'nouveau'`) ; filtre par ville (comparaison insensible à la casse sur `villes[]` ou `ville`) ; tri alphabétique du nom (`localeCompare('fr')`) selon `clientSortDir`.
  - **Pagination** : `totalPages`, `paginatedClients` (slice de 20).
  - **CRUD** :
    - `resetForm` réinitialise le formulaire et l'état photo.
    - `handleAddClient` → `resetForm()` + ouverture dialog.
    - `handleEditClient(client)` : reconstruit `phones`/`addresses`/`villes` (fallback sur les champs simples si les tableaux sont vides), pré-remplit la preview photo.
    - `handleFormSubmit` : `preventDefault`, filtre téléphones/adresses non vides, exige au moins un nom + un téléphone + une adresse (sinon toast destructif). Si édition → ouvre `showEditConfirm`. Sinon, recherche de doublons via `findMatchingClients(clients, {nom, phones, addresses})` (`@/utils/clientMatch`) → si correspondances, ouvre `DuplicateClientModal` (`duplicateMatches`) au lieu de confirmer directement ; sinon ouvre `showAddConfirm`.
    - `buildFormData()` : construit un `FormData` multipart (`nom`, `phones` JSON, `addresses` JSON, `adresse` = première adresse, `villes` JSON, `ville` = première ville, `photo` fichier, `removePhoto` si applicable).
    - `persistNewVilles()` : compare `formData.villes` à `availableVilles` (insensible à la casse) et `clientsVillesApi.add(v)` pour chaque nouvelle ville (best-effort, erreurs ignorées).
    - `confirmAdd` : `persistNewVilles()` puis `POST /api/clients` (multipart, `Authorization: Bearer <token>`) → toast succès, ferme dialogs, `refetch()`.
    - `confirmEdit` : idem avec `PUT /api/clients/:id`.
    - `handleDeleteClient`/`confirmDelete` : `DELETE /api/clients/:id`.
  - Tous les appels réseau utilisent `axios` directement avec `API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000'` et le token JWT lu dans `localStorage`.
- **Écran de chargement** : `PremiumLoading text="Bienvenue sur Listes des Clients" size="xl"` (overlay selon `embedded`).
- **Structure visuelle** : fond dégradé violet/indigo. `!embedded` → `<Navbar/>` + `<ScrollToTop/>`. Puis `<ClientHero>` (voir plus bas), conteneur `container mx-auto max-w-7xl` avec `<ClientSearchSection>`, `<ClientFilterBar>` (tri + filtres palier/ville), grille responsive 1→4 colonnes de `<ClientCardItem>` (props : client, index, photoUrl, callbacks zoom/téléphone/adresse/détail/édition/suppression), état vide (icône `Users`, message) si recherche ≥3 sans résultat, `<SharedPagination>`. Puis en dehors du conteneur principal : `ConfirmDeleteDialog`, `ClientDetailModal`, `ClientPhotoZoomModal`, `ClientMergeModal`, `DuplicateClientModal`, `CitiesManagerModal`, `ClientPhoneActionModal`, `ClientAddressActionModal`, `ClientConfirmDialogs` (add/edit confirm), `ClientFormDialog`, `FideliteListModal`. `!embedded` → `<Footer/>`.
- **Sous-page `src/pages/clients/ClientHero.tsx`** : hero « premium » en carte noire arrondie (`rounded-[36px]`, fond `bg-black`) avec halos `motion.div` animés (violet/rose/indigo, translations/scale en boucle), grille de fond en `linear-gradient`, ligne de scan horizontale animée, deux anneaux orbitaux tournants (`rotate: 360`/`-360`, 60s/80s), 20 particules générées (`generateParticles`, positions déterministes `left`, `top` aléatoire pour durée/délai) animées en `y`/`opacity`/`scale`. Contenu : badge « Gestion Premium Clients » (icône `Crown` oscillante + `Sparkles` rotative), titre « Clients Élite » (icônes `Diamond`/`Star` animées de part et d'autre), sous-titre, indicateur « CLIENT SYSTEM ONLINE » (pastille verte pulsante + `Activity`/`ShieldCheck`), puis rangée d'actions : compteur `{clientCount} Client(s)`, bouton **Nouveau Client** (`onAddClient`, dégradé purple→pink→blue), bouton optionnel **Fusionner Clients** (`onMergeClient`, dégradé orange→red), bouton optionnel **Voir les villes** (`onShowVilles`, dégradé sky→indigo), bouton optionnel **Listes Fidélité** (`onShowFidelites`, dégradé yellow→orange, icône `Award`). Props : `clientCount`, `onAddClient`, `onMergeClient?`, `onShowVilles?`, `onShowFidelites?`. Note : importe `Button` depuis `react-day-picker` (dépendance inhabituelle, à reproduire telle quelle).
- **Sous-page `src/pages/clients/ClientSearchSection.tsx`** : carte avec `Label` + `Input` de recherche (placeholder « Saisissez au moins 3 caractères... »), bouton « × » pour vider le champ si non vide, message « N résultat(s) trouvé(s) » si `searchQuery.length>=3`, message orange « Saisissez au moins 3 caractères... » si 1–2 caractères saisis. Props : `searchQuery`, `setSearchQuery`, `filteredCount`.
- **`src/pages/clients/index.ts`** : ré-exporte `ClientHero` et `ClientSearchSection`.
- **Dépendances** : `axios`, `framer-motion`, `@/contexts/AuthContext`, `@/hooks/useClientSync`, `@/hooks/use-toast`, `@/hooks/use-mobile`, `@/services/api/villesApi`, `@/services/api/fideliteApi`, `@/utils/clientMatch`, nombreux composants `@/components/clients/*`, `@/components/dashboard/forms/ConfirmDeleteDialog`, `@/components/shared/Pagination`, icônes `lucide-react`.

### 6bis.C.2 `src/pages/CommandesPage.tsx` + `src/hooks/useCommandesLogic.ts`

#### 6bis.C.2.a `CommandesPage.tsx` (composant de présentation pur)

- **Rôle** : orchestre l'affichage de la gestion des commandes/réservations/RDV ; **toute** la logique est déléguée au hook `useCommandesLogic()` (objet `logic` déstructuré dans le rendu, jamais dans le corps du composant).
- **Route** : `/commandes`.
- **SEO** : `title="Commandes"`, `description="Gestion des commandes et réservations"`.
- **États locaux** : aucun — uniquement `const logic = useCommandesLogic()`.
- **Écran de chargement** : si `logic.isLoading` → `PremiumLoading text="Chargement des commandes..."`.
- **Structure visuelle** : `<CommandesHero/>`, conteneur dégradé slate/purple/indigo contenant `<CommandesSearchBar>` (recherche + export PDF + bouton nouvelle commande), `<CommandeFormDialog>` (très nombreuses props transmises telles quelles depuis `logic` — formulaire client/produit/dates/réduction/livraison/réservation ultérieure), `<CommandesTable>` (liste filtrée, tri par date, verrouillage `lockedIds=logic.lockedCommandeIds`). Puis, hors conteneur : `ValidationDialog`, `CancellationDialog`, `DeleteDialog`, `ReporterModal` (avec détection de créneau RDV occupé), `RdvConfirmationModal`/`RdvCreationModal` (proposition de créer un RDV depuis une réservation), `TacheConflictModal` (conflit d'horaire avec une tâche existante), `OverdueReservationModal` (réservation en retard de 30 min), `CommandeArriveePlanifDialog` (planification RDV+tâche au passage en « Arrivé »), `ReservationUlterieureModal` et `StatutUlterieurTransitionModal` (réservations « ultérieures » sans date fixe).
- **Dépendances** : `@/hooks/useCommandesLogic`, ensemble de composants `@/components/commandes/*`, `Layout`, `PremiumLoading`, `SEOHead`.

#### 6bis.C.2.b `useCommandesLogic.ts` (logique métier complète, ~1600 lignes)

- **États de données** : `commandes: Commande[]`, `clients: Client[]`, `products: Product[]`, `sales: Sale[]`, `isLoading`.
- **États formulaire** : dialog (`isDialogOpen`, `editingCommande`) ; client (`clientNom`, `clientPhone`, `clientPhones[]`, `clientAddress`, `clientVille`, `clientSearch`, `showClientSuggestions`) ; type/dates (`type: 'commande'|'reservation'|'rdv'`, `dateArrivagePrevue`, `dateEcheance`, `horaire`, `horaireFin`) ; produits (`produitNom`, `prixUnitaire`, `quantite='1'`, `prixVente`, `prixVenteOverride`, `productSearch`, `showProductSuggestions`, `selectedProduct`, `produitsListe: CommandeProduit[]`, `editingProductIndex`, `productReduction`, `productReductionType: ''|'amount'|'percent'`, `productDeliveryLocation`, `productDeliveryFee='0'`, `productBaseDeliveryFee`).
- **États recherche/tri** : `commandeSearch`, `sortDateAsc`.
- **États modales** : suppression (`deleteId`), validation (`validatingId`), annulation (`cancellingId`), export PDF (`exportDialogOpen`, `exportDate`), report (`reporterModalOpen`, `reporterCommandeId`, `reporterDate`, `reporterHoraire`, `reporterHoraireFin`, `reporterRdvBusy`), réservation ultérieure (`ulterieurConfig: {mode:'date'|'inconnu', date?}`, `ulterieurModalOpen`, `ulterieurTransitionId`), création RDV depuis réservation (`showRdvConfirmDialog`, `showRdvFormModal`, `pendingReservationForRdv`, `isRdvLoading`), conflit tâche (`showTacheConflictModal`, `conflictingTache`, `pendingTacheData`), réservation en retard (`overdueReservation`, `showOverdueModal`, `overdueProcessedIds: Set<string>`), planification d'arrivée (`arriveePlanifId`), verrouillage RDV (`confirmationEntries: ConfirmationRdvEntry[]`, `lockTick`).

- **Chargement des données** : `fetchCommandes` (`GET /api/commandes`), `fetchClients` (`GET /api/clients`), `fetchProducts` (`GET /api/products`), `fetchSales` (`GET /api/sales`) — chacun avec toast d'erreur (sauf clients/produits/ventes qui échouent silencieusement en console).

- **Effets** :
  1. Au montage : charge les 4 ressources en parallèle (`isLoading` true→false), démarre `setInterval(checkNotifications, 60000)`, se connecte au temps réel (`realtimeService.connect()` + `addSyncListener`) : sur `data-changed` avec `type` `commandes|sales|clients|products` → refetch ciblé ; sur `force-sync` → refetch commandes. Nettoyage : `clearInterval`, `unsubscribe()`, `realtimeService.disconnect()`.
  2. **Détection réservation en retard** (toutes les 60 s + à chaque changement de `commandes`) : cherche une réservation (`type==='reservation'`, statut ni `valide` ni `annule`, non déjà traitée) dont `dateEcheance`+`horaire` dépasse **30 minutes**. Persiste `overdueTimerStart` en base (`PUT /api/commandes/:id`) si absent, puis ouvre `OverdueReservationModal`.
  3. **Disponibilité créneau RDV lors du report** (debounce 250 ms) : si la commande reportée est de type `rdv` et que date/horaire/horaireFin sont renseignés, appelle `rdvTachesApi.getByDate(date)` et détecte un chevauchement avec une autre tâche RDV active (hors `commande.rdvTacheId`, hors statuts `annule`/`termine`) → `reporterRdvBusy = {busy:true, message}`.
  4. **Verrouillage de confirmation RDV** : charge `confirmationRdvApi.getAll()` au montage puis toutes les 60 s (`lockTick`), et à chaque tick recalcule pour chaque commande `computeLockStateForCommande(commande, confirmationEntries)` (`@/utils/rdvConfirmationLock`) — appelle `autoCancelCommandeIfNeeded` (auto-annulation serveur si la fenêtre de confirmation est dépassée). `lockedCommandeIds` = ensemble des commandes en état `'locked'`.

- **Règles métier clés** :
  - **Fenêtre de confirmation automatique 24h** : lors de la création d'une réservation, si l'échéance est à moins de 24h de l'instant de création, `confirmationAuto=true` est stocké sur la commande (le RDV créé ensuite sera automatiquement `confirme` au lieu de `planifie`).
  - **Verrouillage 24h→1h→annulation** : délégué à `computeLockStateForCommande`/`autoCancelCommandeIfNeeded` (utilitaire partagé), retourne un état `'locked' | 'hidden' | autre` par commande ; les commandes en état `'hidden'` (≤1h avant le RDV, considérées auto-annulées) sont masquées de `filteredCommandes`.
  - **Réservation en retard (30 min)** : proposer Valider / Annuler / Reporter via `OverdueReservationModal` ; `handleOverdueValidate` réexécute toute la logique de validation (création de vente identique à `confirmValidation`), `handleOverdueCancel` annule, `handleOverduePostpone` ouvre la modale Reporter.
  - **Verrouillage de stock à la validation** : avant de valider, vérifie pour chaque produit que `product.quantity >= p.quantite`, sinon toast « Stock insuffisant » et arrêt.
  - **Blocage de statut « Arrivé »** (commandes de type `commande`) : impossible si le stock réel disponible est inférieur au besoin — message listant les manquants avec quantité en attente d'achats non « disponibles ». Si OK → ouvre `CommandeArriveePlanifDialog` (ne bascule pas directement le statut).
  - **Blocage de validation** (type `commande`) : impossible tant que le statut n'est pas `arrive`.
  - **Doublon de réservation** : à la création, refuse si un même client a déjà une réservation active avec un produit identique à la même date d'échéance.
  - **Réservation ultérieure** (`ulterieurConfig`) : statut forcé à `'ulterieur'`, `reservationUlterieure=true`, `expiresAt` = +10 jours, `dateEcheance` = date choisie ou vide si mode `'inconnu'`, `horaire`/`horaireFin` vidés. Le passage `'ulterieur' → 'en_attente'` ouvre `StatutUlterieurTransitionModal` pour fixer la date/l'heure définitive, puis propose la création d'un RDV.
  - **Disponibilité produit** : `getAvailableQuantityForProduct` = stock − somme des réservations actives (hors la commande en cours d'édition) ; `getPendingQuantityForProduct` = somme des achats marqués `disponible:false` ; le panier autorise à commander jusqu'à `dispo + en attente`.

- **Handlers principaux** :
  - `handleClientSelect` / `handleProductSelect` (auto-remplissage formulaire + calcul quantité disponible).
  - `handleAddProduit` / `handleEditProduit` / `handleRemoveProduit` (panier `produitsListe`), avec validations de stock/quantité et gestion de la réduction (`amount`/`percent`) et des frais de livraison. Si un nouveau prix de vente est saisi (`prixVenteOverride`), il est persisté via `productApiService.updateSellingPrice` (best-effort).
  - `handleSubmit` : validations (`isFormValid`), vérif doublon, calcul de `clientCaracteristique` (`computeClientCaracteristique`), traçabilité (`enregistreLe`, `createdByName/Id` lus depuis `localStorage`), création/màj client si nouveau ou changement de ville, création implicite des produits inconnus, puis `POST`/`PUT /api/commandes`. Pour une réservation, marque les produits `reserver:'oui'` (`PUT /api/products/:id`) et propose la création de RDV (`RdvConfirmationModal`) si non « ultérieure ». Pour une édition de type `rdv`, met à jour `rdv-taches` via `rdvTachesApi.updateByCommande`.
  - `handleEdit` : recharge tous les champs du formulaire depuis la commande, y compris la ville client et la config « ultérieur ».
  - `handleDelete` : supprime en cascade le RDV lié (`DELETE /api/rdv/by-commande/:id`), les tâches liées (`DELETE /api/taches/by-commande/:id`), le RDV-tâche lié si type `rdv` (`rdvTachesApi.deleteByCommande`), puis la commande elle-même.
  - `handleStatusChange(id, newStatus)` : centralise toutes les règles ci-dessus (ultérieur→en_attente, blocage arrivée/validation, ouverture modales validation/annulation/report), et pour un retour en arrière depuis `valide` avec `saleId`, supprime la vente associée avant de changer le statut.
  - `syncTacheForCommande` : marque la tâche liée `completed`/reporte/annule selon le nouveau statut (préfixe `[ANNULÉ] ` ajouté/retiré dans la description).
  - `confirmArriveePlanification(payload)` : passe la commande `arrive` avec la date/l'horaire choisis, **crée** un RDV-tâche (`rdv-taches.json`), un RDV classique (`rdv.json`, pour intégration au verrouillage 24h/1h) et une tâche liée — tous rattachés par `commandeId`.
  - `confirmValidation` / `confirmCancellation` : logique complète de transformation en vente — construit `saleData` (produits avec `purchasePrice`, `sellingPrice` net de réduction, `profit`, `deliveryFee`, `deliveryLocation`) ; crée les produits inconnus à la volée ; synchronise RDV/tâche liés selon le type de commande (`reservation`, `rdv`, `commande`) ; `POST /api/sales` puis `POST /api/fidelite/rebuild` (best-effort) puis `PUT /api/commandes/:id {statut:'valide', saleId}` ; décrémente le stock et dé-réserve les produits. L'annulation restaure la disponibilité des produits (`reserver:'non'`) et supprime la vente si déjà validée.
  - `handleReporterConfirm` : met à jour la date/l'horaire, vérifie le créneau RDV libre (`reporterRdvBusy`), synchronise RDV (`reservationRdvSyncService.syncRdvReport`), RDV-tâche (`syncRdvTacheForCommande`) et tâche (`syncTacheForCommande`) selon le type.
  - `handleCreateRdvFromReservation(titre, description)` : construit et `POST /api/rdv`, statut `confirme` si `confirmationAuto`, sinon `planifie` ; crée ensuite une tâche liée (`tacheApi.create`) — en cas de conflit HTTP 409, cherche la tâche en conflit via `tacheApi.getByDate` et, si elle n'est pas `importance:'pertinent'`, ouvre `TacheConflictModal` pour la déplacer (`handleRescheduleTacheAndCreate`) ou l'ignorer (`handleSkipTacheConflict`).
  - `getStatusOptions(type)` : liste des transitions de statut autorisées par type (`commande` : En Route/Arrivé/Validé/Annulé/Reporter ; `reservation`/`rdv` : Ultérieur/En Attente/Validé/Annulé/Reporter).
  - `handleExportPDF` : génère un PDF (`jsPDF` + `jspdf-autotable`) listant les commandes/réservations d'une date choisie (colonnes Client/Contact/Produit/Prix/Date-Horaire), nommé `commandes_<date>.pdf`.
- **Endpoints backend appelés** : `/api/commandes` (GET/POST/PUT/DELETE), `/api/clients` (GET/POST/PUT), `/api/products` (GET/POST/PUT), `/api/sales` (GET/POST/DELETE), `/api/fidelite/rebuild`, `/api/rdv` (POST, DELETE by-commande), `/api/taches` (POST, PUT/DELETE by-commande, GET by-date), `rdvTachesApi` (create/getByDate/updateByCommande/deleteByCommande), `confirmationRdvApi.getAll`, `productApiService.updateSellingPrice`.
- **Temps réel** : `realtimeService` (SSE) déclenche des refetch ciblés sur `commandes-updated`/`sales-updated`/`clients-updated`/`products-updated` ou `force-sync`.
- **Retour du hook** : objet unique exposant toutes les données, tous les états et tous les handlers listés ci-dessus (utilisé tel quel par `CommandesPage`).

### 6bis.C.3 `src/pages/ProduitsPage.tsx` + `src/pages/produits/*`

- **Rôle** : gestion complète du catalogue produits — recherche/filtres/tri, CRUD avec photos multiples, gestion des achats/ventes historisés par produit, disponibilité des lots (« achats »), fusion de produits, commentaires/notations clients, historique fournisseurs/prix.
- **Route** : `/produits`.
- **SEO** : `title="Produits"`, `description="Gestion des produits - Inventaire et catalogue"`.
- **Constantes** : `BASE_URL = VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com'` ; `FilterType = 'tous'|'perruque'|'tissage'|'extension'|'autres'|'indisponible'` ; `todayISO()`.
- **États locaux** (très nombreux, regroupés) :
  - Recherche/filtre : `searchQuery`, `activeFilter`, `classification: ClassificationValue` (modèle/couleur/taille/devant/autres/extras), `classificationModalOpen`, `pendingCategory`, `addClassification`.
  - Modales génériques : `isAddOpen`, `isEditProductOpen`, `isEditOpen`, `isViewOpen`, `isDeleteConfirmOpen`, `isAddConfirmOpen`, `isEditConfirmOpen`, `isCaracteristiqueOpen`+`caracteristiqueProduct`, `isMergeOpen`, `isVenduOpen`, `isHistoryOpen`, `isFournHistoryOpen`, `isPrixHistoryOpen`, `isStockListOpen`, `isSellingPriceHistoryOpen`.
  - Produit sélectionné : `selectedProduct`, `togglingAchatIndex`, `indispoTarget`, `indispoProcessing`.
  - Sous-modales achat : `achatViewIndex`, `achatEditIndex`, `achatDeleteIndex`, `achatEditForm` (`date`,`quantity`,`purchasePrice`,`fournisseur`,`disponible`), `achatSaving`, `achatDeleting`.
  - Sous-modales vente : `venteViewIndex`, `venteEditIndex`, `venteDeleteIndex`, `venteEditForm` (`date`,`quantity`,`sellingPrice`), `venteSaving`, `venteDeleting`.
  - Formulaires : `addForm: AddProductForm` (`description`,`purchasePrice`,`quantity`,`fournisseur`,`dateAchat`,`sellingPrice`), `addPhotos` (`files[]`,`existingUrls[]`,`mainIndex`), `addErrors`, `editForm: EditForm` (+ `additionalQuantity`, `purchaseDate`), `editPhotos`.
  - Pagination/tri : `currentPage`, `ITEMS_PER_PAGE=10`, `sortField: SortField|null`, `sortDir: 'asc'|'desc'`, `currentPhotoIndex` (slideshow de la modale vue).
  - Commentaires/notations : `allRatings: Record<string, ProductRatingInfo>`, `isCommentsModalOpen`, `newComment`, `newRating=5`, `isSubmittingComment`, `commentClientName`, `clientSearchQuery`, `clientSearchResults`, `showClientDropdown`, `selectedCommentIds`, `editingCommentId/Text/Rating/ClientName`, `isUpdatingComment`, `isDeletingComments`.
  - Ref `tableContainerRef` (cible de scroll de la pagination).
- **Hooks** : `useApp()` (`products`, `fetchProducts`, `isLoading` = `appLoading`), `useToast()`.
- **Effets** : `fetchRatings()` au montage (`productCommentsApi.getAllRatings()`) ; reset `currentPage=1` quand `activeFilter`/`searchQuery`/`classification` changent ; **slideshow automatique** dans la modale de vue : si `isViewOpen` et plusieurs photos, `setInterval` toutes les **5 secondes** fait avancer `currentPhotoIndex` en boucle (nettoyé à la fermeture/changement de produit).
- **Filtrage/tri** (`useMemo filteredProducts`) : filtre par `activeFilter` (mot-clé dans la description pour perruque/tissage/extension, `autres` = aucun des trois, `indisponible` = au moins un achat `disponible:false` avec quantité > 0) ; filtre par `classification` (modele/couleur/taille/devant/autres/extras — tous doivent être inclus dans la description en minuscule) ; recherche texte (description ou code) à partir de 3 caractères ; tri optionnel (`description`, `purchasePrice`, `quantity`, `notation` via `allRatings[id].average`), direction `sortDir`. `handleFilterChange` : les filtres de catégorie (perruque/tissage/extension) ouvrent automatiquement `ProductClassificationFilterModal` avec la catégorie pré-sélectionnée ; `tous`/`autres`/`indisponible` réinitialisent la classification.
- **Logique métier / handlers** :
  - **Achats** (`openAchatEdit`, `handleSaveAchat`, `handleDeleteAchat`) : `productApiService.updateAchat/deleteAchat` ; création best-effort du fournisseur (`fournisseurApiService.create`) si renseigné à l'édition.
  - **Ventes** (`openVenteEdit`, `handleSaveVente`, `handleDeleteVente`) : `productApiService.updateVente/deleteVente`.
  - **Disponibilité d'un achat/lot** : `handleToggleAchatDispo(index, nextDispo)` → `productApiService.setAchatDisponibilite` (ajoute/retire la quantité du lot au stock vendable), toast explicite. `handleIndispoConfirm` (depuis `IndispoConfirmDialog`) marque **tous** les achats indisponibles d'un produit comme disponibles en une fois (boucle décroissante sur les index pour éviter les décalages).
  - **CRUD produit** : `handleAddSubmit` (validations description/prix/quantité) → `isAddConfirmOpen` → `confirmAdd` (`productService.addProduct` puis upload photos `productService.uploadProductPhotos`) ; `openEdit`/`handleEditSubmit` → `isEditConfirmOpen` → `confirmEdit` (`productService.updateProduct`, avec `newPurchase` si `additionalQuantity>0`, puis `replaceProductPhotos` si les photos ont changé) ; `openDelete`/`confirmDelete` (supprime d'abord les commentaires du produit puis le produit, `fetchRatings()` rafraîchi).
  - **Commentaires/notations** : `submitNewComment`, `startEditingComment`/`handleSaveCommentEdit`, `toggleCommentSelection`/`handleDeleteComments` (confirmation navigateur `window.confirm`, suppression simple ou multiple), `onClientQueryChange` (autocomplétion client à partir de 3 caractères via `clientApiService.getAll()` filtré côté client).
- **Écran de chargement** : si `appLoading && products.length===0` → `PremiumLoading text="Chargement des produits…"`.
- **Structure visuelle** : `<ProduitsHero onAdd>` puis, dans un conteneur pleine largeur : `<ProduitsToolbar>` (recherche + 4 boutons), `<ProduitsFiltersStats>` (pills de filtres + 4 cartes stats), `<ProductAttributesToolbar/>` (filtres d'attributs avancés), `<ProductsTable>` (tri par colonnes, actions voir/éditer/supprimer/indispo/caractéristique), `<SharedPagination>`. Puis modales : `AddProductModal`/`AddConfirmDialog`, `EditProductModal`/`EditConfirmDialog`, `DeleteConfirmDialog`, `ProductViewModal` (slideshow photo + accès historiques/commentaires), `ProductCommentsModal`, `AchatVenteHistoryModal`, `IndispoConfirmDialog`, `CaracteristiqueModal`, `ProductMergeModal`, `ProductsVenduModal`, `PrixHistoryModal`, `SellingPriceHistoryModal`, `StockListModal`, `ProductClassificationFilterModal`, `<AchatVenteSubModals>` (sous-modales voir/éditer/supprimer un achat ou une vente + historique fournisseurs).
- **`src/pages/produits/ProduitsHero.tsx`** : wrapper fin autour du composant générique `@/components/shared/LuxeHero` (badge « Smart Inventory System », titre « Gestion des Produits », CTA « Nouveau produit », icônes `Package`/`Plus`/`Crown`, `liveLabel="STOCK LIVE"`, accent violet→fuchsia→purple). Props : `onAdd`.
- **`src/pages/produits/ProduitsToolbar.tsx`** : barre `motion.div` avec `Input` de recherche (icône `Search`, déclenche `setShowSearchResults` dès 3 caractères, ferme au blur après 200 ms) + 4 boutons animés (`whileHover scale 1.03`) : **Ajouter Produit** (vert, `onAdd`), **Liste Stock** (bleu, `onStock`), **Voir plus vendu** (ambre, `onVendu`), **Fusionner Produit** (orange/rouge, `onMerge`). Props : `searchQuery`, `setSearchQuery`, `setShowSearchResults`, `onAdd`, `onEdit?` (déprécié), `onStock?`, `onVendu`, `onMerge`.
- **`src/pages/produits/ProduitsFiltersStats.tsx`** : rangée de pills de filtres (compteur par filtre via `countByFilter`) + grille de 4 cartes stats animées (Total Produits, En Stock `quantity>0`, Rupture `quantity===0`, Valeur Stock = Σ `purchasePrice*quantity`). Props : `products`, `filters`, `activeFilter`, `setActiveFilter`.
- **`src/pages/produits/AchatVenteSubModals.tsx`** : composant purement présentational regroupant 6 sous-modales pilotées par props (voir/éditer/supprimer un achat — `Dialog`/`Dialog`/`AlertDialog` — avec formulaire date/quantité/prix d'achat/fournisseur (`FournisseurAutocomplete`)/case « disponible » ; voir/éditer/supprimer une vente — date/quantité/prix de vente ; modale « Historique fournisseurs » listant `selectedProduct.fournisseursHistory` trié par `dateDebut`, avec période « Du … au … / En cours »). Aucune logique interne : tous les handlers et états sont reçus en props depuis `ProduitsPage`.
- **Dépendances** : `@/contexts/AppContext` (`useApp`), `@/service/api` (`productService`), `@/services/api/productApi`, `@/services/api/fournisseurApi`, `@/services/api/productCommentsApi`, `@/services/api/clientApi`, composants `@/components/products/*` (modals, table, attributs, caractéristique, fusion, vendu, historique prix), `@/components/shared/Pagination`, `@/components/shared/LuxeHero`, `framer-motion`, icônes `lucide-react`.

### 6bis.C.4 `src/pages/PointagePage.tsx`

- **Rôle** : gestion du pointage des travailleurs par entreprise (journalier ou horaire), calendrier mensuel, totaux par personne/mensuel/annuel, avances, partage de données par lien sécurisé et visionnage des commentaires reçus ; contient également, via des onglets, les vues Tâches, RDV-Tâches et Notes (Kanban) qui ne sont pas des routes séparées mais des onglets internes de cette page.
- **Route** : `/pointage`.
- **SEO** : `title="Pointage"`, `description="Gestion du pointage des travailleurs"`.
- **États locaux** : `activeTab: 'pointage'|'tache'|'notes'|'rdv'`, `currentDate` (mois affiché), `entreprises`, `pointages`, `travailleurs`, `loading`. États modales : `showEntrepriseModal`, `showPointageModal`, `showDayModal`, `showEditModal`, `showTravailleurModal`, `showParPersonneModal`, `showYearlyModal`, `showAvanceModal`, `showMonthDetailModal`, `showSharePointageModal`, `showSelectiveSharePointage`, `showCommentsViewer`, `commentCount`, `selectedDay`, `editingPointage`, `deleteConfirm`, `editConfirm`. Données annuelles : `yearlyPointages`, `yearlyLoading`. Formulaires : `entForm` (`nom`,`adresse`,`typePaiement:'journalier'|'horaire'`,`prix`), `ptForm` (`date`,`entrepriseId`,`heures`,`prixJournalier`,`travailleurId`,`travailleurNom`), `travForm` (`nom`,`prenom`,`adresse`,`phone`,`genre:'homme'|'femme'`,`role:'administrateur'|'autre'`).
- **Hooks** : `useToast()`, `useRealtimeCommentNotifications({type:'pointage', onCountChange})` (SSE — incrémente/décrémente `commentCount` en temps réel).
- **Effets** :
  1. `fetchData` (dépend de `year`/`month` dérivés de `currentDate`) : charge en parallèle `entrepriseApi.getAll()`, `pointageApi.getByMonth(year, month+1)`, `travailleurApi.getAll()`.
  2. Au montage : `shareCommentsApi.unread()` → initialise `commentCount.pointage`.
- **Logique métier / handlers** :
  - `getMonthTotal()` = Σ `montantTotal` du mois affiché.
  - `handleAddEntreprise` : valide nom+prix, `entrepriseApi.create({nom, adresse, typePaiement, prix})`.
  - `handleAddTravailleur` : valide nom+prénom, `travailleurApi.create(travForm)`.
  - `handleAddPointage` : valide date+entreprise ; calcule `montantTotal` selon `typePaiement` de l'entreprise — **journalier** : `prixJournalier` saisi ou `ent.prix` par défaut, `montantTotal = prixJournalier` ; **horaire** : `heures * ent.prix`. `pointageApi.create(...)`.
  - `handleDeletePointage` : `pointageApi.delete(id)`.
  - `handleEditPointage` : recalcule `montantTotal` selon `typePaiement` avant `pointageApi.update`.
  - `handleShowYearlyTotal` : charge `pointageApi.getByYear(year)` → `yearlyPointages` (avec état de chargement dédié).
- **Écran de chargement** : `PremiumLoading text="Chargement du pointage…" variant="dashboard"`.
- **Structure visuelle** : `<PointageTabNav>` (4 onglets). Onglet **pointage** : `<PointageHero>` (compteurs entreprises/travailleurs/pointages, total du mois, boutons Ajouter Entreprise/Travailleur, Nouveau Pointage, Prise d'avance, Par Personne, Total Annuel, Détail du Mois, Partager, Partage sélectif, Voir Commentaires avec badge `commentCount`), `<PointageCalendar>` (navigation mois précédent/suivant, clic sur un jour → `DayDetailModal`), `<PointageEntreprisesList>`, `<PointageTravailleursList>`. Modales : `EntrepriseModal`, `TravailleurModal`, `PointageFormModal`, `DayDetailModal` (édition/suppression/ajout depuis un jour), `EditPointageModal`, `ParPersonneModal`, `AvanceModal`, `YearlyTotalModal`, `MonthDetailModal`, `PointageConfirmDialogs` (suppression/édition), `ShareLinkModal` (type `pointage`), `SelectiveShareModal`, `ShareCommentsViewer` (met à jour `commentCount` en temps réel via `onCountChange`). Onglet **tache** → `<TacheView/>` ; onglet **rdv** → `<RdvTacheView/>` ; onglet **notes** (défaut) → `<NotesKanbanView/>`.
- **Dépendances** : `@/services/api/entrepriseApi|pointageApi|travailleurApi|shareCommentsApi`, `@/hooks/useRealtimeCommentNotifications`, composants `@/components/pointage/*`, `@/components/tache/TacheView`, `@/components/rdvtache/RdvTacheView`, `@/components/notes/NotesKanbanView`, `@/components/shared/ShareLinkModal|SelectiveShareModal|ShareCommentsViewer`.

### 6bis.C.5 `src/pages/RdvPage.tsx` + `src/pages/rdv/*`

- **Rôle** : agenda des rendez-vous — vue calendrier (glisser-déposer) et vue liste, recherche avec suggestions, statistiques du mois, détection de conflits horaires, highlight d'un RDV depuis une notification.
- **Route** : `/rdv`.
- **SEO** : `title="Rendez-vous"`, `description="Gestion des rendez-vous clients"`.
- **États locaux** : `isFormOpen`, `selectedRdv`, `deleteDialogOpen`, `rdvToDelete`, `searchQuery`, `defaultDate`, `defaultTime`, `conflicts: RDV[]`, `activeTab` (`'calendar'|'list'`), `currentPage`, `showSearchSuggestions`, `highlightRdvId`, `highlightDate` (venant des query params de notification), `statsModalOpen`, `statsModalTitle`, `statsModalRdvs`, `statsModalColor`.
- **Hooks** : `useRdv()` (`rdvs`, `loading`, `createRdv`, `updateRdv`, `deleteRdv`, `markAsNotified`, `checkConflicts`), `useSearchParams()`.
- **Effets** : lit les paramètres URL `highlightRdv`/`date` → active le highlight et force l'onglet `calendar` ; `handleHighlightComplete` nettoie les query params (`highlightRdv`, `date`, `t`) après l'animation de mise en évidence dans `RdvCalendar`.
- **Mémos** :
  - `stats` (mois en cours) : `today`, `confirmed`, `pending`, `cancelled`, `total`.
  - `currentMonthRdvs` : RDV du mois en cours hors `annule`, triés par date+heure.
  - `searchSuggestions` : filtre `currentMonthRdvs` (titre/client/description/lieu) à partir de 3 caractères, limité à 10.
  - Pagination `ITEMS_PER_PAGE=20` sur `currentMonthRdvs`.
  - `todayRdvs`, `pendingRdvsForStats`, `allMonthRdvs`, `weekRdvs` (semaine lundi→dimanche via `date-fns` `startOfWeek/endOfWeek`) — utilisés uniquement pour alimenter les modales de détail des stats.
- **Handlers** :
  - `handleOpenForm(rdv?, date?, time?)` / `handleCloseForm` : ouverture/fermeture du formulaire RDV (`RdvForm`), réinitialise `conflicts`.
  - `handleSubmit(data)` : vérifie les conflits (`checkConflicts(date, heureDebut, heureFin, selectedRdv?.id)`) avant de créer/mettre à jour ; les conflits trouvés sont affichés dans le formulaire (`conflicts`) sans bloquer la sauvegarde (avertissement uniquement).
  - `handleDelete`/`confirmDelete` : suppression avec confirmation (`ConfirmDialog`).
  - `handleRdvDrop(rdv, newDate, newTime, newEndTime?)` : glisser-déposer dans le calendrier — recalcule l'heure de fin en conservant la durée d'origine si `newEndTime` n'est pas fourni.
  - `handleOpenStatsModal(type)` : ouvre `RdvStatsDetailsModal` avec le sous-ensemble de RDV et le titre/couleur correspondant (`today`/`week`/`month`/`pending`/`total`).
  - `statusColors`/`statusLabels` : mapping statut → couleur Tailwind / libellé (`planifie` bleu, `confirme` vert, `annule` rouge, `termine` gris).
- **Règle métier** : les RDV au statut `confirme` ne sont **plus éditables** (boutons « Modifier » désactivés dans `RdvSearchBar` et `RdvListView`, avec tooltip explicatif) — cohérent avec le verrouillage 24h/1h de `useCommandesLogic`. Les RDV créés depuis une réservation (`commandeId` renseigné) n'affichent pas les boutons modifier/supprimer dans la vue liste (gérés depuis la page Commandes).
- **Écran de chargement** : `PremiumLoading text="Chargement des rendez-vous..." variant="dashboard"`.
- **Structure visuelle** : `<RdvHero onNewRdv>`, `<RdvPageStatsCards>` (5 cartes cliquables), `<RdvSearchBar>` (suggestions avec actions modifier/supprimer inline), `<Tabs>` (Calendrier/Liste) avec `<ConfirmationRdvButton rdvs>` à côté des onglets (bouton de gestion globale des confirmations 24h/1h) ; onglet **Calendrier** → `<RdvCalendar>` (clic RDV, clic créneau vide, drag&drop, suppression, highlight) ; onglet **Liste** → `<RdvListView>` (grille 4 colonnes paginée). Puis `<RdvForm>` (dialog création/édition avec conflits), `<ConfirmDialog>` (suppression), `<RdvStatsDetailsModal>`.
- **`src/pages/rdv/RdvHero.tsx`** : hero noir animé similaire à `ClientHero` (halos ambre/violet/indigo, grille, ligne de scan, anneaux orbitaux, 14 particules `generateParticles` en positions aléatoires). Badge « Smart Appointment System », titre « Gestion des Rendez-vous », date du mois courant (`date-fns` `format(..., 'MMMM yyyy', {locale: fr})`), indicateur « AGENDA LIVE », bouton **Nouveau rendez-vous** (dégradé amber→purple→indigo). Props : `onNewRdv`.
- **`src/pages/rdv/RdvSearchBar.tsx`** : `Input` avec icône `Search`, dropdown de suggestions animé (`framer-motion` `AnimatePresence`) fermé au clic extérieur (`useRef`+`mousedown` listener) ; chaque suggestion affiche badge statut, titre, client, date, heure, et boutons Modifier (désactivé si `confirme`)/Supprimer ; état « Aucun rendez-vous trouvé » si recherche ≥3 caractères sans résultat. Props : `searchQuery`, `setSearchQuery`, `showSearchSuggestions`, `setShowSearchSuggestions`, `searchSuggestions`, `statusColors`, `statusLabels`, `onSuggestionClick`, `onEditRdv`, `onDeleteRdv`.
- **`src/pages/rdv/RdvStatsCards.tsx`** (exporté sous le nom `RdvPageStatsCards`) : grille de 5 cartes cliquables (Aujourd'hui/bleu, Cette semaine/cyan, Ce mois/émeraude, En attente/ambre, Total du mois/violet), chacune `onClick={() => onOpenModal(type)}`, icônes `Clock`/`CalendarDays`/`TrendingUp`/`CalendarCheck`/`Crown`. Props : `stats`, `currentMonthCount`, `weekCount`, `onOpenModal`.
- **`src/pages/rdv/RdvListView.tsx`** : état vide (icône `Calendar`, bouton « Nouveau rendez-vous ») si `currentMonthTotal===0` ; sinon grille 1→4 colonnes de cartes (numérotation globale `#N`, bandeau de couleur de statut en haut, titre, client/téléphone/date/heure/lieu, boutons Modifier/Supprimer masqués si `rdv.commandeId` est renseigné ou si statut `confirme` pour Modifier) + pagination numérotée avec compteur « X - Y sur Z ». Props : `paginatedRdvs`, `currentMonthTotal`, `currentPage`, `totalPages`, `itemsPerPage`, `statusColors`, `statusLabels`, `onPageChange`, `onRdvClick`, `onEditRdv`, `onDeleteRdv`, `onNewRdv`.
- **`src/pages/rdv/index.ts`** : ré-exporte `RdvHero`, `RdvStatsCards` sous l'alias `RdvPageStatsCards`, `RdvSearchBar`, `RdvListView`.
- **Dépendances** : `@/hooks/useRdv`, `@/components/rdv/*` (`RdvCalendar`, `RdvForm`, `RdvStatsDetailsModal`, `ConfirmationRdvButton`), `@/components/shared` (`ConfirmDialog`), `date-fns`/`date-fns/locale/fr`, `framer-motion`, `react-router-dom` (`useSearchParams`), `@/components/ui/tabs`, icônes `lucide-react`.

---

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

---

## 7. COMPOSANTS MÉTIER (327 fichiers)

| Fichier | Lignes | Rôle |
|---|---|---|
| `src/components/AutoInjectWatcher.tsx` | 186 | AutoInjectWatcher — Modal globale persistante (bas-gauche) Vérifie 5min après connexion admin si la base est vide. Si oui, propose de restaurer depuis… |
| `src/components/CookieConsent.tsx` | 474 | CookieConsent Premium RGPD — Ultra Luxe 2026 Edition ✅ Conforme RGPD / ePrivacy ✅ Consentement granulaire ✅ Refus aussi simple qu’acceptation ✅ Aucun … |
| `src/components/Footer.tsx` | 279 |  |
| `src/components/Layout.tsx` | 75 |  |
| `src/components/Navbar.tsx` | 425 |  |
| `src/components/PasswordInput.tsx` | 79 |  |
| `src/components/PasswordStrengthChecker.tsx` | 138 |  |
| `src/components/SEOHead.tsx` | 94 | Composant SEO pour gérer les balises meta dynamiquement |
| `src/components/ScrollToTop.tsx` | 47 |  |
| `src/components/VisitTracker.tsx` | 16 | VisitTracker.tsx — Petit composant invisible qui enregistre une visite dans l'historique des connexions (une fois par session navigateur). |
| `src/components/accessibility/AccessibilityProvider.tsx` | 154 |  |
| `src/components/accessibility/AccessibleButton.tsx` | 69 |  |
| `src/components/accessibility/AccessibleInput.tsx` | 79 |  |
| `src/components/auth/ProtectedRoute.tsx` | 28 |  |
| `src/components/auth/SessionUniqueWatcher.tsx` | 560 | SessionUniqueWatcher.tsx — VUE globale de la session unique. - Déconnecte le profil quand le serveur l'ordonne (auto / accepté / 5 min). - Affiche la … |
| `src/components/business/PureSalesTable.tsx` | 152 | Props pour le composant PureSalesTable (immuables) |
| `src/components/clients/CitiesManagerModal.tsx` | 1567 | CitiesManagerModal --------------------------------------------------------- Gestion premium des villes clients. Design : - Mode clair ☀️ - Mode sombr… |
| `src/components/clients/CityFormModal.tsx` | 80 | CityFormModal - Modale réutilisable pour ajouter ou modifier une ville |
| `src/components/clients/ClientAddressActionModal.tsx` | 47 | ClientAddressActionModal — Choix de l'application de navigation pour ouvrir une adresse client (Google Maps, Waze, Apple Maps). |
| `src/components/clients/ClientCard.tsx` | 125 | Carte d'affichage d'un client |
| `src/components/clients/ClientCardItem.tsx` | 132 | ClientCardItem — Carte client (grille) avec photo, actions (voir détail, modifier, supprimer), badge fidélité, téléphones et adresse. |
| `src/components/clients/ClientConfirmDialogs.tsx` | 55 | ClientConfirmDialogs — Boîtes de dialogue de confirmation pour l'ajout et la modification d'un client. |
| `src/components/clients/ClientDetailModal.tsx` | 595 | Modal de détail client avec impression au format millimètres (petites imprimantes) |
| `src/components/clients/ClientFideliteBadge.tsx` | 86 | Badge de fidélité client (synchronisé fidelite.json + listes-fidelite.json) Les libellés/gradients viennent de listes-fidelite.json (dynamique). Les i… |
| `src/components/clients/ClientFideliteModal.tsx` | 237 | ClientFideliteModal — Modale ultra-moderne affichant l'historique complet des ventes d'un client (basée sur fidelite.json) : tier, nombre d'achats, to… |
| `src/components/clients/ClientFilterBar.tsx` | 1824 | ClientFilterBar — Barre de tri/filtres PREMIUM Design : - Ultra moderne - Luxe / premium - Responsive - Mode clair / sombre - Aucun effet de flou - An… |
| `src/components/clients/ClientFormDialog.tsx` | 2030 | ClientFormDialog Dialogue premium d'ajout / modification d'un client. - Photo - Nom - Téléphones multiples - Adresses multiples - Ville par adresse - … |
| `src/components/clients/ClientMergeModal.tsx` | 1935 | ClientMergeModal - Modale de fusion de plusieurs clients en un seul. Flux: 1. L'utilisateur sélectionne 2 clients ou plus dans la liste. 2. Pour chaqu… |
| `src/components/clients/ClientPagination.tsx` | 40 | ClientPagination — Pagination premium pour la grille des clients. |
| `src/components/clients/ClientPhoneActionModal.tsx` | 46 | ClientPhoneActionModal — Modale d'actions sur un numéro de téléphone client. Permet d'appeler ou d'envoyer un message (SMS sur mobile). |
| `src/components/clients/ClientPhotoZoomModal.tsx` | 55 |  |
| `src/components/clients/ClientSearchBar.tsx` | 484 | ClientSearchBar.tsx |
| `src/components/clients/ClientsGrid.tsx` | 97 | Grille de clients avec pagination |
| `src/components/clients/ClientsHero.tsx` | 114 | ClientsHero - Section Hero pour la page Clients (Version Ultra Luxe Responsive) |
| `src/components/clients/DuplicateClientModal.tsx` | 356 | Modale de détection de doublons clients. Affiche les clients existants qui matchent une saisie en cours et propose : utiliser un client existant (avec… |
| `src/components/clients/FideliteListModal.tsx` | 2306 | FideliteListModal — Gestion premium des paliers de fidélité. Design : - Mode clair : interface lumineuse, blanche et élégante - Mode sombre : interfac… |
| `src/components/clients/index.ts` | 5 | Export centralisé des composants clients |
| `src/components/commandes/CommandeArriveePlanifDialog.tsx` | 231 | CommandeArriveePlanifDialog Modale de planification à afficher quand une commande passe au statut "Arrivé". Affiche les infos de la commande + choix d… |
| `src/components/commandes/CommandeFormDialog.tsx` | 632 | ============================================================================= Composant CommandeFormDialog (orchestrateur) ===========================… |
| `src/components/commandes/CommandesDialogs.tsx` | 177 | Dialogs de confirmation pour la page Commandes |
| `src/components/commandes/CommandesHero.tsx` | 312 |  |
| `src/components/commandes/CommandesSearchBar.tsx` | 352 |  |
| `src/components/commandes/CommandesStatsButtons.tsx` | 425 | Boutons de statistiques premium pour les commandes Affiche 3 boutons cliquables avec modales détaillées |
| `src/components/commandes/CommandesTable.tsx` | 210 | Tableau des commandes et réservations (composition de composants réutilisables) |
| `src/components/commandes/ConfirmationDialogs.tsx` | 162 | ============================================================================= Composants de Confirmation pour les Commandes ==========================… |
| `src/components/commandes/OverdueReservationModal.tsx` | 180 | ============================================================================= OverdueReservationModal - Panneau de réservation en retard (bas gauche) … |
| `src/components/commandes/PreparationLivraisonButton.tsx` | 309 | PreparationLivraisonButton - Affiche un bouton "Livraison" si au moins une commande/réservation du jour est en statut "en_attente" ou "reporter". - Au… |
| `src/components/commandes/RdvConfirmationModal.tsx` | 230 | Modale Premium de Confirmation pour création de RDV depuis une réservation Design luxe, moderne et professionnel avec animations élégantes |
| `src/components/commandes/RdvCreationModal.tsx` | 287 | Modale Premium de Création de Rendez-vous Design luxe, moderne et professionnel Uniquement Titre et Description avec scroll élégant |
| `src/components/commandes/ReporterModal.tsx` | 137 | ReporterModal — report d'une commande/réservation/RDV. Pour les commandes de type RDV: vérifie la disponibilité du créneau dans rdv-taches.json et n'a… |
| `src/components/commandes/ReservationUlterieureModal.tsx` | 166 | ReservationUlterieureModal --------------------------------------------------------------- Modale pour configurer une réservation ultérieure. - Option… |
| `src/components/commandes/StatutUlterieurTransitionModal.tsx` | 95 | StatutUlterieurTransitionModal --------------------------------------------------------------- Ouvre quand on bascule une réservation "ultérieure" → "… |
| `src/components/commandes/TacheConflictModal.tsx` | 153 |  |
| `src/components/commandes/form/ClientSection.tsx` | 219 | Section Client Premium — extraite de CommandeFormDialog |
| `src/components/commandes/form/FormActionButtons.tsx` | 53 | Boutons d'action du formulaire — extraits de CommandeFormDialog |
| `src/components/commandes/form/IndisponibiliteAlert.tsx` | 60 | Alerte indisponibilité + conflit RDV — extraite de CommandeFormDialog |
| `src/components/commandes/form/ProductSection.tsx` | 470 | Section Produit Premium — extraite de CommandeFormDialog |
| `src/components/commandes/form/RdvCompletionModal.tsx` | 172 | Modal de complétion RDV (rdv-taches.json) — extraite de CommandeFormDialog |
| `src/components/commandes/form/TypeDateSection.tsx` | 205 | Section Type & Planification — extraite de CommandeFormDialog |
| `src/components/commandes/index.ts` | 29 | ============================================================================= Index des composants pour la page Commandes ============================… |
| `src/components/commandes/table/ClientFideliteMarquee.tsx` | 27 | ClientFideliteMarquee — marquee défilant affichant la fidélité du client issue de la base de données (fidelite.json + listes-fidelite.json). Nouveau c… |
| `src/components/commandes/table/CommandeMobileCard.tsx` | 156 | CommandeMobileCard — carte d'une commande (vue mobile). |
| `src/components/commandes/table/CommandeTableRow.tsx` | 198 | CommandeTableRow — ligne du tableau des commandes (vue desktop). |
| `src/components/commandes/table/CommandesDetailModals.tsx` | 51 | CommandesDetailModals — modales de détail client / produit / caractéristiques. |
| `src/components/commandes/table/CommandesEmptyState.tsx` | 77 | CommandesEmptyState — état vide (mobile & desktop) du tableau des commandes. |
| `src/components/commandes/table/CommandesTableDesktopHead.tsx` | 41 | CommandesTableDesktopHead — en-tête du tableau desktop avec tri par date. |
| `src/components/commandes/table/index.ts` | 10 |  |
| `src/components/commandes/table/types.ts` | 20 | Types partagés pour les composants du tableau des commandes. |
| `src/components/commandes/table/useFideliteData.ts` | 55 | useFideliteData — charge une seule fois la map de fidélité (fidelite.json) et les paliers configurables (listes-fidelite.json), et se resynchronise su… |
| `src/components/common/ErrorBoundary.tsx` | 113 |  |
| `src/components/common/PhoneActionModal.tsx` | 59 | Modale pour les actions téléphoniques |
| `src/components/common/RealtimeStatus.tsx` | 52 |  |
| `src/components/common/RealtimeWrapper.tsx` | 73 | RealtimeWrapper — SSE Push Only |
| `src/components/dashboard/ActionButton.tsx` | 45 | Bouton d'action réutilisable avec icône Utilisé pour les actions primaires dans l'interface @param icon - Composant d'icône Lucide @param children - T… |
| `src/components/dashboard/AddProductForm.tsx` | 428 |  |
| `src/components/dashboard/AddSaleForm.tsx` | 549 |  |
| `src/components/dashboard/AdvancedDashboard.tsx` | 1137 |  |
| `src/components/dashboard/ClientSearchInput.tsx` | 179 |  |
| `src/components/dashboard/DepenseDuMois.tsx` | 1021 |  |
| `src/components/dashboard/EditProductForm.tsx` | 455 |  |
| `src/components/dashboard/ExportSalesDialog.tsx` | 571 |  |
| `src/components/dashboard/FournisseurAutocomplete.tsx` | 135 | Dark theme variant for slate/dark modals */ |
| `src/components/dashboard/Inventaire.tsx` | 1529 |  |
| `src/components/dashboard/InvoiceGenerator.tsx` | 594 | InvoiceGenerator.tsx Composant React pour générer et afficher des factures de ventes. ========================= DESIGN ULTRA-LUXE / IPHONE ===========… |
| `src/components/dashboard/MonthlyResetHandler.tsx` | 46 | Éviter les vérifications multiples |
| `src/components/dashboard/PhotoUploadSection.tsx` | 221 |  |
| `src/components/dashboard/PretFamilles.tsx` | 1659 |  |
| `src/components/dashboard/PretProduits.tsx` | 8 |  |
| `src/components/dashboard/PretProduitsGrouped.tsx` | 2383 |  |
| `src/components/dashboard/PretRetardNotification.tsx` | 97 | Récupérer les notifications déjà vues depuis localStorage |
| `src/components/dashboard/ProductPhotoSlideshow.tsx` | 199 |  |
| `src/components/dashboard/ProductSearchInput.tsx` | 206 |  |
| `src/components/dashboard/ProfitCalculator.tsx` | 850 |  |
| `src/components/dashboard/RefundForm.tsx` | 636 |  |
| `src/components/dashboard/SalesTable.tsx` | 950 |  |
| `src/components/dashboard/StatCard.tsx` | 95 | Composant de carte statistique premium réutilisable Design moderne et luxueux pour le tableau de bord @param title - Titre principal de la carte @para… |
| `src/components/dashboard/VentesParClientsModal.tsx` | 505 |  |
| `src/components/dashboard/VentesProduits.tsx` | 312 |  |
| `src/components/dashboard/VersementEspece.tsx` | 392 | VersementEspece - Composant ultra-luxe pour gérer les versements espèce avec fenêtre glissante de 30 jours et plafond mensuel autorisé. Décomposé en c… |
| `src/components/dashboard/ViewRefundsModal.tsx` | 115 |  |
| `src/components/dashboard/accounting/ProfitLossStatement.tsx` | 3436 |  |
| `src/components/dashboard/comptabilite/AchatFormDialog.tsx` | 634 | AchatFormDialog - Formulaire modal pour ajouter un nouvel achat RÔLE : Ce composant affiche une modale permettant d'enregistrer un nouvel achat de pro… |
| `src/components/dashboard/comptabilite/AchatsHistoriqueList.tsx` | 282 | AchatsHistoriqueList - Liste historique des achats et dépenses RÔLE : Ce composant affiche la liste des achats et dépenses enregistrés pour un mois do… |
| `src/components/dashboard/comptabilite/ComptabiliteHeader.tsx` | 143 | ComptabiliteHeader - En-tête du module comptabilité (Version Luxe) Contient le titre, les sélecteurs de période et les boutons d'action. |
| `src/components/dashboard/comptabilite/ComptabiliteModule.tsx` | 284 | ComptabiliteModule - Module principal de comptabilité (REFACTORISÉ) Ce composant est maintenant minimal et ne contient que : - Les imports des composa… |
| `src/components/dashboard/comptabilite/ComptabiliteStatsCards.tsx` | 139 | ComptabiliteStatsCards - Cartes de statistiques de comptabilité RÔLE : Ce composant affiche les 4 cartes principales de statistiques : - Total Crédit … |
| `src/components/dashboard/comptabilite/ComptabiliteTabs.tsx` | 136 | ComptabiliteTabs - Onglets du module comptabilité (Version Luxe Responsive) |
| `src/components/dashboard/comptabilite/DepenseFormDialog.tsx` | 316 | DepenseFormDialog - Formulaire modal pour ajouter une dépense RÔLE : Ce composant affiche une modale permettant d'enregistrer une nouvelle dépense (ta… |
| `src/components/dashboard/comptabilite/DepensesRepartitionChart.tsx` | 173 | DepensesRepartitionChart - Répartition premium des dépenses Affiche : total, nombre de catégories, plus grosse catégorie, part %, ainsi qu'un pie char… |
| `src/components/dashboard/comptabilite/EvolutionMensuelleChart.tsx` | 57 | EvolutionMensuelleChart - Graphique barres de l'évolution mensuelle |
| `src/components/dashboard/comptabilite/FacturationModal.tsx` | 526 | FacturationModal - Recherche & téléchargement des factures/reçus Étapes : 1. Choisir le type : Achat ou Dépense 2. Choisir l'année 3a. Pour un achat :… |
| `src/components/dashboard/comptabilite/ProductSearchInput.tsx` | 209 | ProductSearchInput - Composant de recherche de produit RÔLE : Ce composant permet de rechercher un produit existant dans l'inventaire. Il affiche une … |
| `src/components/dashboard/comptabilite/SecondaryStatsCards.tsx` | 77 | SecondaryStatsCards - Cartes secondaires (Achats, Dépenses, Solde Net) |
| `src/components/dashboard/comptabilite/StableCharts.tsx` | 147 |  |
| `src/components/dashboard/comptabilite/details/AchatsProduitsDetails.tsx` | 75 | AchatsProduitsDetails - Affichage détaillé des achats produits @description Composant pour afficher la liste des achats de type "achat_produit" du moi… |
| `src/components/dashboard/comptabilite/details/AutresDepensesDetails.tsx` | 128 | AutresDepensesDetails - Affichage détaillé des autres dépenses @description Composant pour afficher la liste des dépenses hors achats produits. Inclut… |
| `src/components/dashboard/comptabilite/details/SoldeNetDetails.tsx` | 164 | SoldeNetDetails - Affichage détaillé du calcul du solde net @description Composant pour afficher le détail du calcul du solde net : - Récapitulatif Cr… |
| `src/components/dashboard/comptabilite/details/index.ts` | 23 | INDEX - Exports des composants de détails du module Comptabilité Ce fichier centralise les exports des composants d'affichage des détails. Ces composa… |
| `src/components/dashboard/comptabilite/index.ts` | 82 | INDEX - Exports du module Comptabilité (REFACTORISÉ) Architecture propre avec séparation des responsabilités. |
| `src/components/dashboard/comptabilite/modals/AchatDetailModal.tsx` | 452 | AchatDetailModal - Modale ultra luxe pour afficher les détails d'un achat/dépense RÔLE : Ce composant affiche une modale premium avec les détails comp… |
| `src/components/dashboard/comptabilite/modals/AchatEditModal.tsx` | 392 | AchatEditModal - Modale de modification d'un achat/dépense RÔLE : Ce composant affiche une modale pour modifier un achat ou une dépense existant. PROP… |
| `src/components/dashboard/comptabilite/modals/AchatsProduitsModal.tsx` | 86 | AchatsProduitsModal - Modal affichant les détails des achats produits |
| `src/components/dashboard/comptabilite/modals/AutresDepensesModal.tsx` | 129 | AutresDepensesModal - Modal affichant les autres dépenses (hors achats produits) |
| `src/components/dashboard/comptabilite/modals/BeneficeReelModal.tsx` | 105 | BeneficeReelModal - Modal affichant les détails du bénéfice réel |
| `src/components/dashboard/comptabilite/modals/BeneficeVentesModal.tsx` | 87 | BeneficeVentesModal - Modal affichant les détails du bénéfice des ventes |
| `src/components/dashboard/comptabilite/modals/CreditDetailsModal.tsx` | 99 | CreditDetailsModal - Modal affichant les détails du crédit (ventes) |
| `src/components/dashboard/comptabilite/modals/DebitDetailsModal.tsx` | 101 | DebitDetailsModal - Modal affichant les détails du débit (achats/dépenses) |
| `src/components/dashboard/comptabilite/modals/ExportPdfModal.tsx` | 350 | ExportPdfModal - Modal pour exporter les données en PDF |
| `src/components/dashboard/comptabilite/modals/SoldeNetModal.tsx` | 139 | SoldeNetModal - Modal affichant les détails du solde net |
| `src/components/dashboard/comptabilite/modals/index.ts` | 33 | Index des modales du module Comptabilité |
| `src/components/dashboard/comptabilite/shared/ClickableStatCard.tsx` | 150 | ClickableStatCard - Carte de statistique cliquable et réutilisable @description Composant de carte cliquable avec effet de survol premium. Utilisé pou… |
| `src/components/dashboard/comptabilite/shared/DetailsModal.tsx` | 109 | DetailsModal - Modale générique pour afficher les détails @description Composant de modale réutilisable pour afficher des listes de détails. Utilisé p… |
| `src/components/dashboard/comptabilite/shared/index.ts` | 18 | INDEX - Exports des composants partagés du module Comptabilité Ce fichier centralise les exports des composants réutilisables. COMPOSANTS EXPORTÉS : -… |
| `src/components/dashboard/epargne/AdminPrincipalGate.tsx` | 247 | AdminPrincipalGate.tsx Verrou d'accès ultra-premium (style page de connexion) : - Réservé à l'administrateur principale (rôle vérifié + mot de passe u… |
| `src/components/dashboard/epargne/EpargneCard.tsx` | 742 | EpargneCard.tsx Module Épargne ultra-premium (style page de connexion) : - Carte cliquable -> modale listant les propriétaires et leurs comptes - Créa… |
| `src/components/dashboard/forms/AdvancePaymentModal.tsx` | 517 |  |
| `src/components/dashboard/forms/ConfirmDeleteDialog.tsx` | 110 |  |
| `src/components/dashboard/forms/ModernActionButton.tsx` | 90 |  |
| `src/components/dashboard/forms/ModernButton.tsx` | 51 |  |
| `src/components/dashboard/forms/ModernButtonGrid.tsx` | 33 |  |
| `src/components/dashboard/forms/ModernCard.tsx` | 53 |  |
| `src/components/dashboard/forms/ModernContainer.tsx` | 88 |  |
| `src/components/dashboard/forms/ModernTable.tsx` | 75 |  |
| `src/components/dashboard/forms/MultiProductSaleForm.tsx` | 1445 |  |
| `src/components/dashboard/forms/PremiumDeleteDialog.tsx` | 123 |  |
| `src/components/dashboard/forms/PremiumFormStyles.tsx` | 172 |  |
| `src/components/dashboard/forms/PretProduitFromSaleModal.tsx` | 417 |  |
| `src/components/dashboard/forms/SaleFormFields.tsx` | 237 |  |
| `src/components/dashboard/forms/SalePriceInput.tsx` | 45 | Composant pour la saisie du prix de vente |
| `src/components/dashboard/forms/SaleQuantityInput.tsx` | 153 | ============================================================================= Composant SaleQuantityInput ============================================… |
| `src/components/dashboard/forms/hooks/useSaleForm.ts` | 163 |  |
| `src/components/dashboard/forms/modals/AddLivraisonVilleModal.tsx` | 120 |  |
| `src/components/dashboard/forms/modals/EchangerVentesModal.tsx` | 507 |  |
| `src/components/dashboard/forms/modals/LivraisonVilleListModal.tsx` | 143 |  |
| `src/components/dashboard/forms/modals/ReservedProductModal.tsx` | 59 |  |
| `src/components/dashboard/forms/modals/SearchSalesModal.tsx` | 499 |  |
| `src/components/dashboard/forms/sections/SaleClientSection.tsx` | 208 |  |
| `src/components/dashboard/forms/sections/SaleFormActions.tsx` | 71 |  |
| `src/components/dashboard/forms/sections/SaleProductCard.tsx` | 480 |  |
| `src/components/dashboard/forms/sections/SaleTotalsSection.tsx` | 131 |  |
| `src/components/dashboard/forms/types/saleFormTypes.ts` | 59 |  |
| `src/components/dashboard/forms/utils/saleCalculations.ts` | 22 |  |
| `src/components/dashboard/inventory/InventoryAnalyzer.tsx` | 296 |  |
| `src/components/dashboard/prets-grouped/PretAvancesModal.tsx` | 91 | Modal Détails - Avances Reçues |
| `src/components/dashboard/prets-grouped/PretHeroHeader.tsx` | 39 | Hero Header de la page Prêts Produits |
| `src/components/dashboard/prets-grouped/PretPayesModal.tsx` | 120 | Modal Détails - Prêts Payés (soldés) |
| `src/components/dashboard/prets-grouped/PretResteModal.tsx` | 92 | Modal Détails - Reste à Payer |
| `src/components/dashboard/prets-grouped/PretStatsCardsClickable.tsx` | 109 | Stats Cards cliquables des Prêts Produits |
| `src/components/dashboard/prets-grouped/PretTotalVentesModal.tsx` | 102 | Modal Détails - Total Ventes |
| `src/components/dashboard/prets-grouped/index.ts` | 7 |  |
| `src/components/dashboard/prets-grouped/pretUtils.ts` | 58 | Types & utilitaires partagés des composants Prêts Produits |
| `src/components/dashboard/prets/PretGroupCard.tsx` | 388 | Carte de groupe de prêts avec détails expandables |
| `src/components/dashboard/prets/PretHero.tsx` | 31 | Hero pour les prêts produits |
| `src/components/dashboard/prets/PretStatsCards.tsx` | 111 | Cartes de statistiques pour les prêts produits |
| `src/components/dashboard/prets/index.ts` | 6 | Index des composants pour les prêts produits |
| `src/components/dashboard/reports/ProfitEvolution.tsx` | 672 |  |
| `src/components/dashboard/reports/SalesReport.tsx` | 474 | Ce composant React affiche un tableau de bord avec indicateurs et graphiques (CA, ventes, quantités, évolution mensuelle, top produits, performance). … |
| `src/components/dashboard/reports/StockRotation.tsx` | 349 |  |
| `src/components/dashboard/reports/YearlyComparison.tsx` | 975 |  |
| `src/components/dashboard/sections/AdvancedDashboardSection.tsx` | 50 |  |
| `src/components/dashboard/sections/SalesManagementSection.tsx` | 360 |  |
| `src/components/dashboard/sections/SalesOverviewSection.tsx` | 879 |  |
| `src/components/dashboard/versement/AddBankModal.tsx` | 78 | Modale Ajouter une banque |
| `src/components/dashboard/versement/BankSelectField.tsx` | 57 | Champ réutilisable de sélection de banque (avec bouton d'ajout) |
| `src/components/dashboard/versement/VersementActions.tsx` | 66 | Actions principales de la modale Versement espèce |
| `src/components/dashboard/versement/VersementAddModal.tsx` | 70 | Modale Ajout d'un versement espèce |
| `src/components/dashboard/versement/VersementConfirmDialog.tsx` | 49 | Dialogue de confirmation réutilisable (suppression / modification) |
| `src/components/dashboard/versement/VersementEditModal.tsx` | 68 | Modale Modification d'un versement espèce |
| `src/components/dashboard/versement/VersementForecastModal.tsx` | 75 | Modale Prévision 30 jours (reste de droit) |
| `src/components/dashboard/versement/VersementPlafondModal.tsx` | 56 | Modale Plafond mensuel autorisé |
| `src/components/dashboard/versement/VersementTable.tsx` | 109 | Tableau des versements de la fenêtre glissante de 30 jours |
| `src/components/dashboard/versement/index.ts` | 10 |  |
| `src/components/dashboard/versement/versementUtils.ts` | 40 | Utilitaires & types partagés pour les composants Versement espèce |
| `src/components/forms/ClientForm.tsx` | 168 | Formulaire d'ajout/modification de client avec support multi-téléphones |
| `src/components/livechat/CallOverlay.tsx` | 187 |  |
| `src/components/livechat/ChatNotificationBanner.tsx` | 51 |  |
| `src/components/livechat/LiveChatAdmin.tsx` | 1614 |  |
| `src/components/livechat/LiveChatVisitor.tsx` | 857 | ============================================================================= LiveChatVisitor — Chat en direct pour visiteurs ========================… |
| `src/components/livechat/useWebRTC.ts` | 688 | webrtc-adapter removed - not needed in modern browsers |
| `src/components/maintenance/MaintenanceGate.tsx` | 87 | MaintenanceGate — Vérifie le statut de maintenance du site. Si le site est en maintenance ET que l'utilisateur connecté n'est pas un administrateur pr… |
| `src/components/navbar/ObjectifIndicator.tsx` | 323 |  |
| `src/components/navbar/ObjectifStatsModal.tsx` | 888 |  |
| `src/components/navbar/TimeoutNotification.tsx` | 73 |  |
| `src/components/navbar/modals/BeneficesHistoriqueModal.tsx` | 150 |  |
| `src/components/navbar/modals/ObjectifChangesModal.tsx` | 162 |  |
| `src/components/navbar/modals/VentesHistoriqueModal.tsx` | 157 |  |
| `src/components/navigation/AccessibleNavigation.tsx` | 213 |  |
| `src/components/notes/ColumnFormModal.tsx` | 57 |  |
| `src/components/notes/ConfirmModal.tsx` | 66 |  |
| `src/components/notes/DrawingCanvas.tsx` | 105 |  |
| `src/components/notes/KanbanColumn.tsx` | 155 |  |
| `src/components/notes/NoteCard.tsx` | 728 |  |
| `src/components/notes/NoteFormModal.tsx` | 385 |  |
| `src/components/notes/NotesHero.tsx` | 121 | NotesHero - Hero modernisé pour la vue Notes Kanban Inspiré de PointageHero (background aurora cosmique). |
| `src/components/notes/NotesKanbanView.tsx` | 308 |  |
| `src/components/notes/constants.ts` | 41 | Smart voice punctuation replacements (French) |
| `src/components/notifications/ReservationExpiryNotifier.tsx` | 66 | ReservationExpiryNotifier --------------------------------------------------------------- Interroge /api/commandes/expiring-soon toutes les heures (et… |
| `src/components/pointage/PointageAutoWatcher.tsx` | 487 | PointageAutoWatcher — Surveillance globale des pointages automatiques ▶ Synchronisation MULTI-ADMIN via server/db/pointageAutoSessions.json : - Quand … |
| `src/components/pointage/PointageCalendar.tsx` | 112 |  |
| `src/components/pointage/PointageEntreprisesList.tsx` | 169 |  |
| `src/components/pointage/PointageHero.tsx` | 177 |  |
| `src/components/pointage/PointageTabNav.tsx` | 67 |  |
| `src/components/pointage/PointageTravailleursList.tsx` | 67 |  |
| `src/components/pointage/TravailleurSearchInput.tsx` | 110 |  |
| `src/components/pointage/modals/AvanceModal.tsx` | 699 |  |
| `src/components/pointage/modals/DayDetailModal.tsx` | 99 |  |
| `src/components/pointage/modals/EditPointageModal.tsx` | 98 |  |
| `src/components/pointage/modals/EntrepriseEditModal.tsx` | 132 |  |
| `src/components/pointage/modals/EntrepriseModal.tsx` | 111 |  |
| `src/components/pointage/modals/MonthDetailModal.tsx` | 141 |  |
| `src/components/pointage/modals/ParPersonneModal.tsx` | 377 |  |
| `src/components/pointage/modals/PointageConfirmDialogs.tsx` | 67 |  |
| `src/components/pointage/modals/PointageFormModal.tsx` | 125 |  |
| `src/components/pointage/modals/TravailleurModal.tsx` | 93 |  |
| `src/components/pointage/modals/YearlyTotalModal.tsx` | 188 |  |
| `src/components/products/CaracteristiqueModal.tsx` | 440 | CaracteristiqueModal.tsx Affiche la "carte caractéristique" du produit (description, taille, code-barre, code) et propose une impression avec choix du… |
| `src/components/products/PrixHistoryModal.tsx` | 382 | PrixHistoryModal.tsx — Modale ultra moderne d'historique des prix d'achat Affiche pour un produit donné : - tous les renseignements (nom, fournisseurs… |
| `src/components/products/ProductCharacteristicCard.tsx` | 158 | ProductCharacteristicCard.tsx Carte "Caractéristique" affichant : description, taille extraite (ex: 26), un code-barre généré et le code produit. Réut… |
| `src/components/products/ProductCommentScroller.tsx` | 115 |  |
| `src/components/products/ProductDetailModal.tsx` | 223 | ProductDetailModal.tsx Affiche le détail d'un produit (nom, description, prix, stock, fournisseur, dates) avec une icône pour ouvrir la modale Caracté… |
| `src/components/products/ProductMergeModal.tsx` | 2394 | ProductMergeModal - Modale de fusion de plusieurs produits en un seul. Flux: 1. L'utilisateur sélectionne 2 produits ou plus. 2. Pour chaque champ (de… |
| `src/components/products/ProductsTable.tsx` | 257 | ProductsTable.tsx — Tableau paginé des produits avec tri, badges stock, actions. Extrait de ProduitsPage. |
| `src/components/products/ProductsVenduModal.tsx` | 467 | ProductsVenduModal.tsx — Modale "Voir plus vendu" Affiche la liste des produits triés du plus vendu vers le moins vendu (et jamais vendus). Filtres pa… |
| `src/components/products/SellingPriceHistoryModal.tsx` | 77 | SellingPriceHistoryModal.tsx Courbe d'évolution du prix de vente unitaire d'un produit (source : products.json -> sellingPriceHistory). |
| `src/components/products/SellingPriceOverrideButton.tsx` | 100 | SellingPriceOverrideButton.tsx Petit bouton « + » affiché à côté d'un champ Prix de vente. Ouvre une mini-modale permettant de saisir un NOUVEAU prix … |
| `src/components/products/StockListModal.tsx` | 672 | StockListModal — Sélection multi-attributs (modèle/couleur/taille) et catégorie/devant simples, puis affichage de la liste des produits correspondants… |
| `src/components/products/attributes/ClassificationSearchPopover.tsx` | 122 | ClassificationSearchPopover — Bouton + modale centrée utilisant ProductClassificationSelector pour filtrer une liste de produits. S'ouvre comme une Di… |
| `src/components/products/attributes/ProductAttributeDialog.tsx` | 171 | ProductAttributeDialog — Modale de création d'une VALEUR d'attribut produit pour un kind donné (identifié par son id + nom d'affichage). Comprend : - … |
| `src/components/products/attributes/ProductAttributeManagerButton.tsx` | 148 | ProductAttributeManagerButton — Bouton d'un TYPE d'attribut (kind) dynamique. Comportement : - Clic sur l'icône "+" : ouvre ProductAttributeDialog (aj… |
| `src/components/products/attributes/ProductAttributesToolbar.tsx` | 159 | ProductAttributesToolbar — Barre dynamique regroupant les boutons des TYPES d'attribut produit (kinds) provenant de la base. Un bouton "+" à droite pe… |
| `src/components/products/attributes/ProductClassificationFilterModal.tsx` | 54 | ProductClassificationFilterModal — Modale de filtrage par classification. Affiche ProductClassificationSelector en mode "filter" pour la catégorie cho… |
| `src/components/products/attributes/ProductClassificationSelector.tsx` | 2371 | ProductClassificationSelector VERSION ULTRA PREMIUM / LUXE - Design moderne violet / fuchsia / rose - Animations avancées - Micro-interactions - Effet… |
| `src/components/products/modals/AchatVenteHistoryModal.tsx` | 154 | AchatVenteHistoryModal.tsx — Historique complet stock (achats + ventes) d'un produit. |
| `src/components/products/modals/AddConfirmDialog.tsx` | 54 | AddConfirmDialog.tsx — Confirmation d'ajout produit. |
| `src/components/products/modals/AddProductModal.tsx` | 1346 | AddProductModal.tsx — Modale d'ajout d'un nouveau produit. UI modernisée inspirée de ClientMergeModal. La logique métier et les props existantes sont … |
| `src/components/products/modals/DeleteConfirmDialog.tsx` | 48 |  |
| `src/components/products/modals/EditConfirmDialog.tsx` | 41 |  |
| `src/components/products/modals/EditProductModal.tsx` | 250 | EditProductModal.tsx — Modale d'édition d'un produit (+ ajout de commentaire). |
| `src/components/products/modals/IndispoConfirmDialog.tsx` | 61 |  |
| `src/components/products/modals/ProductCommentsModal.tsx` | 133 | ProductCommentsModal.tsx — Liste + édition + suppression de commentaires produit. |
| `src/components/products/modals/ProductViewModal.tsx` | 220 | ProductViewModal.tsx — Slideshow photo + détails produit + accès historiques. |
| `src/components/products/modals/index.ts` | 11 |  |
| `src/components/profile/BlockageIpCard.tsx` | 354 | BlockageIpCard — Carte « Blocage IP » (page Profil / Sécurité) - Liste des adresses IP bloquées (base de données serveur) - Modale d'ajout d'une IP av… |
| `src/components/profile/BulkDeleteModal.tsx` | 479 | BulkDeleteModal — Modale de suppression sélective (ventes, produits, clients) Style ultra luxe, multi-étapes avec recherche et sélection |
| `src/components/profile/HistoriqueConnexionCard.tsx` | 659 | HistoriqueConnexionCard.tsx — Carte "Historique des connexions" Affiche en haut les compteurs visites (jour / semaine / mois / année). Liste toutes le… |
| `src/components/profile/IndisponibiliteSection.tsx` | 807 |  |
| `src/components/profile/MaintenanceSection.tsx` | 398 | MaintenanceSection — Carte dans Profil > Sécurité Permet à l'admin principal d'activer/désactiver le mode maintenance et de programmer des maintenance… |
| `src/components/profile/ModuleSettingsSection.tsx` | 182 | ModuleSettingsSection — Configuration par module Permet de configurer les paramètres spécifiques à chaque module : - Pointage : prix/heure par défaut,… |
| `src/components/profile/ParametresSection.tsx` | 829 |  |
| `src/components/profile/PasswordSection.tsx` | 108 | PasswordSection — Section de changement de mot de passe Affiche un bouton "Changer le mot de passe" qui révèle un formulaire avec : - Mot de passe act… |
| `src/components/profile/PointageAutoSection.tsx` | 871 | PointageAutoSection — Gestion des règles de pointage automatique (Profil > Paramètres > Paramètres des modules) Permet à l'admin de définir des règles… |
| `src/components/profile/ProfileAvatar.tsx` | 46 | ProfileAvatar — Avatar de profil avec anneaux pulsants Affiche la photo de profil (ou icône par défaut) entourée de deux anneaux verts animés (animati… |
| `src/components/profile/ProfileCard.tsx` | 61 | ProfileCard — Carte d'identité du profil utilisateur Affiche l'avatar (via ProfileAvatar), le nom complet, l'email, le rôle utilisateur (badge), et le… |
| `src/components/profile/ProfileConfirmDialogs.tsx` | 90 | ProfileConfirmDialogs — Boîtes de dialogue de confirmation pour la modification du profil, le changement de mot de passe et l'upload d'une nouvelle ph… |
| `src/components/profile/ProfileHero.tsx` | 98 | ProfileHero — En-tête héroïque animé de la page profil (aurores animées, badge, titre, statuts). |
| `src/components/profile/ProfileInfoCard.tsx` | 173 | ProfileInfoCard — Carte d'édition des informations personnelles Affiche les champs : Prénom, Nom, Email (lecture seule), Téléphone, Adresse, Genre. En… |
| `src/components/profile/ProfileTabsNav.tsx` | 67 | ProfileTabsNav — Boutons de navigation entre les onglets Profil / Paramètres / Sécurité (avec visibilité conditionnelle). |
| `src/components/profile/SecuriteSection.tsx` | 798 | SecuriteSection — Section Sécurité dans les paramètres du profil Layout: 2x2 grid luxe design - Top: Gestion des rôles / Gérance comptes - Bottom: Par… |
| `src/components/profile/ShieldStatsCard.tsx` | 521 | ShieldStatsCard — Supervision temps réel du bouclier anti-piratage Sources de données (toutes déjà exposées par l'API, authentifiées) : - GET    /api/… |
| `src/components/rdv/ConfirmationRdvButton.tsx` | 471 | ConfirmationRdvButton - Visible si au moins un RDV (statut planifie/confirme/reporte) commence dans les prochaines 24h. Sinon caché. - Pulse "ultra lu… |
| `src/components/rdv/GlobalRdvTodayNotifier.tsx` | 532 | GlobalRdvTodayNotifier -------------------------------------------------------- VERSION PREMIUM AUTO-HIDE --------------------------------------------… |
| `src/components/rdv/RdvCalendar.tsx` | 1151 |  |
| `src/components/rdv/RdvCard.tsx` | 179 |  |
| `src/components/rdv/RdvForm.tsx` | 634 |  |
| `src/components/rdv/RdvNotifications.tsx` | 392 |  |
| `src/components/rdv/RdvStatsCards.tsx` | 114 |  |
| `src/components/rdv/RdvStatsDetailsModal.tsx` | 142 |  |
| `src/components/rdv/RdvStatsModals.tsx` | 175 |  |
| `src/components/rdv/index.ts` | 4 |  |
| `src/components/rdvtache/AddCatalogTacheModal.tsx` | 71 | AddCatalogTacheModal.tsx - Modale pour ajouter un type de tâche RDV (tissage, tresse, etc.) |
| `src/components/rdvtache/ConfirmDialog.tsx` | 38 | ConfirmDialog.tsx - Petite confirmation générique pour modif/suppression RDV. |
| `src/components/rdvtache/RdvDayModal.tsx` | 253 | RdvDayModal.tsx - Modale "RDV du jour" avec horaire 4h-23h, édition/suppression. Drag-and-drop : on peut glisser un RDV sur une autre heure pour le re… |
| `src/components/rdvtache/RdvFormModal.tsx` | 454 | RdvFormModal.tsx - Formulaire d'ajout / édition d'un RDV-tâche. Recherche travailleur (3 chars), recherche client (3 chars), choix tâche depuis catalo… |
| `src/components/rdvtache/RdvProductSection.tsx` | 259 | RdvProductSection.tsx — Section « Produits » du formulaire RDV-tâche. Autonome : recherche produit (3 caractères) + filtre par attributs, quantité lim… |
| `src/components/rdvtache/RdvRescheduleModal.tsx` | 143 | RdvRescheduleModal.tsx — Modale de confirmation "Modifier l'horaire / Déplacer ce RDV ?". Demande la nouvelle date (optionnelle), l'heure de début et … |
| `src/components/rdvtache/RdvTacheCalendar.tsx` | 193 | RdvTacheCalendar.tsx - Calendrier mensuel des RDV-tâches avec compteur par jour. Drag-and-drop : on peut faire glisser un chip RDV vers une autre case… |
| `src/components/rdvtache/RdvTacheView.tsx` | 471 | RdvTacheView.tsx - Vue principale de l'onglet "RDV" du module Pointage. Boutons : Ajouter RDV, RDV du jour, Ajouter tâche, Ajouter travailleur. Affich… |
| `src/components/rdvtache/RdvTachesHero.tsx` | 185 | RdvTachesHero - Hero modernisé pour la vue RDV/Tâches (Beauté) Inspiré de PointageHero (aurora glass cosmique) + contenu spécifique RDV Beauté. |
| `src/components/security/SecurityCheckPage.tsx` | 2143 |  |
| `src/components/session/SessionShellFooter.tsx` | 25 | SessionShellFooter.tsx — Footer minimal de la page de conflit de session. |
| `src/components/session/SessionShellHero.tsx` | 56 | SessionShellHero.tsx — Hero de la page de conflit de session. |
| `src/components/session/SessionShellNavbar.tsx` | 80 | SessionShellNavbar.tsx — Navbar minimale (logo, A propos, Contact, thème) utilisée par la page de conflit de session. |
| `src/components/shared/AddressActionModal.tsx` | 121 | État d'ouverture */ |
| `src/components/shared/BackButton.tsx` | 67 | BackButton - Bouton "Retour" universel. - Mobile: centré horizontalement, ne pousse aucun contenu (position fixed). - Desktop: ancré à gauche. - z-ind… |
| `src/components/shared/ConfirmDialog.tsx` | 156 |  |
| `src/components/shared/LoadingOverlay.tsx` | 71 | Message à afficher pendant le chargement */ |
| `src/components/shared/LuxeHero.tsx` | 200 | Small pill badge text (top-left) */ |
| `src/components/shared/PageHero.tsx` | 136 | Titre principal de la page */ |
| `src/components/shared/Pagination.tsx` | 237 | Page actuelle (1-indexed) */ |
| `src/components/shared/SelectiveShareModal.tsx` | 653 |  |
| `src/components/shared/ShareCommentsViewer.tsx` | 385 | ShareCommentsViewer.tsx Composant modal pour visualiser les commentaires reçus sur les liens partagés. Supporte les types : notes, pointage, tâches. F… |
| `src/components/shared/ShareLinkModal.tsx` | 160 | ShareLinkModal.tsx Modal de gestion des liens de partage pour les données (notes, pointage, tâches). Permet de générer, copier et supprimer des liens … |
| `src/components/shared/SharedCommentForm.tsx` | 352 | SharedCommentForm.tsx Formulaire de commentaires pour les visiteurs d'un lien partagé (public, sans authentification). Permet de commenter des élément… |
| `src/components/shared/StatBadge.tsx` | 66 | Icône à afficher */ |
| `src/components/shared/UnifiedSearchBar.tsx` | 178 | Valeur de recherche actuelle */ |
| `src/components/shared/index.ts` | 33 | index.ts — Export centralisé des composants partagés (shared) Composants réutilisables dans tout le projet : - UnifiedSearchBar : barre de recherche u… |
| `src/components/tache/TacheCalendar.tsx` | 243 |  |
| `src/components/tache/TacheConfirmDialog.tsx` | 83 |  |
| `src/components/tache/TacheDayModal.tsx` | 376 |  |
| `src/components/tache/TacheFormModal.tsx` | 452 |  |
| `src/components/tache/TacheHero.tsx` | 371 | TacheHero - Hero modernisé pour la page Tâches Inspiré de PointageHero (style cosmique aurora glass) — props inchangés. |
| `src/components/tache/TacheNotificationBar.tsx` | 58 |  |
| `src/components/tache/TacheTicker.tsx` | 148 |  |
| `src/components/tache/TacheValidationModal.tsx` | 84 |  |
| `src/components/tache/TacheView.tsx` | 600 |  |
| `src/components/tache/TacheWeekModal.tsx` | 112 |  |
| `src/components/tendances/TendancesStatsModals.tsx` | 345 |  |

---


## 7bis. LOGIQUE DÉTAILLÉE — COMPOSANTS CLIENTS, COMMANDES, RDV, TÂCHES, NOTES, PARTAGE

Cette section documente exhaustivement les composants React situés dans `src/components/clients/`, `src/components/commandes/`, `src/components/rdv/`, `src/components/rdvtache/`, `src/components/tache/`, `src/components/notes/` et `src/components/shared/`. Pour chaque fichier : rôle, props, état interne, logique métier, appels API, règles de validation et cas limites.

### 7bis.1 `src/components/clients/`

- **CitiesManagerModal.tsx** — Modale de gestion des villes clients (CRUD simple). Props: `open`, `onOpenChange`. État: `villes: string[]`, `loading`, `showAdd`, `editing`, `confirm` (message + action à exécuter), `search`. Au montage (`open=true`) charge `clientsVillesApi.getAll()`. `handleAdd` → `clientsVillesApi.add(ville)` puis toast succès/erreur. `handleUpdate(original)` ouvre une confirmation (`setConfirm`) avant `clientsVillesApi.update(original, ville)`. `handleDelete(ville)` idem avec `clientsVillesApi.remove(ville)`. Filtre local `filteredVilles` sur `search` (insensible à la casse). Utilise `ConfirmModal` de `notes/` pour confirmer les actions destructives et `CityFormModal` pour l'ajout/édition.
- **CityFormModal.tsx** — Formulaire simple d'ajout/édition d'une ville. Props: `open`, `onOpenChange`, `initialValue`, `onSubmit(value)`. État: `value`, `saving`. Reset de `value` sur ouverture. `handleSubmit` : trim, ignore si vide, appelle `onSubmit(trimmed)`.
- **ClientAddressActionModal.tsx** — Modale de choix d'action sur une adresse (Google Maps / Waze / Apple Maps / Annuler). Purement présentation, callbacks fournis par le parent.
- **ClientCard.tsx** — Carte client (grille). Props: `client`, `index`, `onEdit`, `onDelete`, `onPhoneClick`. Affiche `client.phones` (tableau) sinon fallback `client.phone`; idem pour `client.addresses`/`client.adresse`. Chaque téléphone cliquable déclenche `onPhoneClick(phone)`.
- **ClientCardItem.tsx** — Variante de carte (vue liste), avec `onDetail`, `onEdit`, `onDelete`, `onPhoneClick`, `onAddressClick`, `onOpenPhotoZoom`. Gère l'erreur de chargement image (masque l'`<img>` et montre le fallback suivant). Boucle sur `phones`/`addresses` avec fallback sur champs singuliers legacy.
- **ClientConfirmDialogs.tsx** — Deux `AlertDialog` (ajout/édition) génériques pilotés par le parent (`showAdd`, `showEdit`, `onConfirmAdd`, `onConfirmEdit`, `isSubmitting`).
- **ClientDetailModal.tsx** — Fiche client détaillée + impression PDF/JPEG + actions téléphone/adresse. Props: `open`, `onOpenChange`, `client`, `photoUrl`. État riche: `askFormat` (demande du format d'impression), `widthMm`/`heightMm` (défaut 100×80), `format: 'pdf'|'jpeg'`, `busy`, `selectedPhoneIdx`, `selectedAddressIdx`, modales d'action téléphone/adresse. Règles: **le premier élément des tableaux `phones`/`addresses` est le "Principal"** (affiché seulement si un seul élément; sinon badge "Sélectionné" sur celui cliqué). `handlePhoneClick(phone,i)` ouvre `ClientPhoneActionModal` (appel via `tel:` ou SMS selon mobile/desktop détecté par `useIsMobile`). `handleAddressClick` ouvre le choix Google Maps/Waze/Apple Maps avec URL encodée (`window.open`). `handlePrint`: valide `20 <= largeur/hauteur <= 1000` mm sinon toast d'erreur; construit un PDF (jsPDF) ou une image JPEG avec algorithme de calage dichotomique de la taille de police (`bestFontSize`/`fitPxFont`) pour que le texte tienne dans les dimensions demandées; items imprimés = nom, téléphone principal, adresse principale, ville (filtrés sur non-vide). Nettoie le style au clic hors zone (`e.target...classList`). Utilise 4 presets de formats (`PRESETS`).
- **ClientFideliteBadge.tsx** — Badge affichant le palier de fidélité du client (recherche par nom via `fideliteApiService.getByName`) et les paliers configurés via `listesFideliteApi.getAll()`. Se recharge sur l'événement custom `sales-updated` (`window.addEventListener`). Si aucun palier trouvé (`tierForCount`), ne rend rien. Un clic ouvre `ClientFideliteModal` (stoppe la propagation du clic).
- **ClientFideliteModal.tsx** — Détail de la fidélité: charge en parallèle `fideliteApiService.getByName` et `listesFideliteApi.getAll()`. Regroupe les ventes (`data.sales`) par mois (`byMonth`, triées décroissant) pour un mini-graphique. Chaque vente est cliquable et navigue vers la commande/vente source (`handleNavigate`).
- **ClientFilterBar.tsx** — Barre de filtres/tri (nom asc/desc, palier de fidélité, ville). Props: `sortDir`, `onToggleSort`, `tierFilter`, `onChangeTier`, `villeFilter`, `onChangeVille`. Charge `clientsVillesApi.getAll()` et `listesFideliteApi.getAll()` au montage; se resynchronise sur l'événement `listes-fidelite-updated`. `activeFiltersCount` = nombre de filtres non nuls parmi tier/ville. `resetFilters()` remet les deux callbacks à `null`.
- **ClientFormDialog.tsx** — Formulaire complet de création/édition d'un client. Props: `formData: ClientFormData` (nom, phones[], addresses[], villes[], photo...), `setFormData`, `onSubmit`, `onOpenChange`, `onPhotoSelect`, `onRemovePhoto`, `availableVilles`. **Règle métier centrale : le tableau `phones`/`addresses` porte l'ordre — l'élément d'index 0 est toujours l'adresse/téléphone "Principal"**. `addPhone()`/`addAddress()` poussent une entrée vide en fin de tableau. `makeAddressPrimary(index)` fait un `splice` pour ramener l'élément choisi en position 0 (ainsi que sa ville associée dans `villes[]`, tenu synchronisé par index). Suppression: `pendingDelete: {type:'phone'|'address', index}` déclenche une confirmation (`ClientFormDialog` gère son propre dialog de suppression) puis filtre le tableau à l'index concerné (et son entrée `villes[]` correspondante pour une adresse). Le champ Adresse 1 est `required`; les suivants ne le sont pas. Pour chaque adresse, un `<select>` de ville alimenté par `availableVilles` avec option "+ Nouvelle ville" qui bascule en saisie libre (`isCustomVille`).
- **ClientMergeModal.tsx** — Fusion de plusieurs clients dupliqués. Props: `open`, `onClose`, `clients: Client[]`, callback de succès. État: `selectedIds[]` (clients à fusionner, min 2 requis), `nom`, `phones[]`, `adresse`, `keepPhotoFromId`. `candidatePhones`/`candidateAddresses`/`candidateNames` = `useMemo` déduplication (Set) des valeurs des clients sélectionnés, proposées en boutons cliquables pour pré-remplir les champs finaux. `handleMerge()`: valide `selectedIds.length >= 2`, valide nom+téléphone+adresse non vides, envoie `axios.post` vers l'endpoint de fusion serveur avec `{ ids: selectedIds, nom, phones: validPhones, adresse, keepPhotoFromId }`; toast succès "N clients fusionnés en 1" puis fermeture + callback. La photo conservée est choisie parmi les clients ayant une `photo` (radio-like, `keepPhotoFromId`).
- **ClientPagination.tsx** — Pagination locale simplifiée: affiche page 1, `middle` (3 pages autour de la page courante, filtrées pour exclure 1 et `totalPages`), et dernière page. Ne s'affiche pas si `totalPages <= 1`.
- **ClientPhoneActionModal.tsx** / **ClientAddressActionModal.tsx** — Modales d'action pures (Appeler/Message ou GoogleMaps/Waze/AppleMaps), sans état, entièrement pilotées par callbacks du parent.
- **ClientPhotoZoomModal.tsx** — Zoom d'image (état `zoom`, boutons +/-).
- **ClientSearchBar.tsx** — Recherche instantanée par nom/téléphone/adresse. `validSearch` = requête ≥ 3 caractères (affiche `filteredCount` résultats), `invalidSearch` = requête non vide mais < 3 caractères (message d'invite à saisir davantage).
- **ClientsGrid.tsx** — Grille responsive de `ClientCard` + pagination basique (Précédent/pages numérotées/Suivant).
- **ClientsHero.tsx** — Bandeau d'en-tête avec compteur de clients et bouton "Ajouter".
- **DuplicateClientModal.tsx** — Gère les doublons détectés via `utils/clientMatch` (`ClientMatch`, `canCreateNewDespiteMatches`). Props: `matches` (client existant + champs en collision), `onUseExisting`, `onCreateNew`, `onUpdateClient`. Permet d'éditer en ligne le client existant (`startEdit`) puis `saveEdit()` valide nom/téléphones/adresses non vides avant `onUpdateClient(id, data)`.
- **FideliteListModal.tsx** — CRUD des paliers de fidélité (`listesFideliteApi`). État: `list`, `editing`, `creating`, `toDelete`, `saving`. Validation à la création/édition: label obligatoire, `min >= 0`, plage `min < max` (ou max ouvert), et vérification qu'aucun autre palier n'occupe déjà la plage (`occupied`, toast "Palier déjà couvert" sinon). `GradPicker` propose des dégradés de couleur prédéfinis (`GRAD_PRESETS`). Diffuse l'événement `listes-fidelite-updated` après chaque mutation (`notify()`).
- **index.ts** — Ré-exports publics du dossier.

### 7bis.2 `src/components/commandes/`

- **CommandeArriveePlanifDialog.tsx** — Planifie la date/heure d'arrivée d'une commande en réservation. Props: `isOpen`, `commande`, `onClose`, `onConfirm({date, heureDebut, heureFin})`. Pré-remplit l'horaire depuis `commande.horaire` (split sur `-`) sinon 09:00–10:00. Sur changement de date, appelle `availabilityApi.getSlots(date, commande?.id)` pour peupler `busy`/`freeSlots` (créneaux occupés/libres suggérés, cliquables pour auto-remplir). Sur changement horaire, `availabilityApi.check(date,h1,h2,commande?.id)` avec debounce → `available` (bool) + `conflicts`. `handleValidate` refuse si `heureFin <= heureDebut` (toast "Horaire invalide") ou si `available === false` (toast "Créneau occupé").
- **CommandeFormDialog.tsx** — Formulaire principal de création/édition de commande, orchestrant plusieurs sous-composants (`ClientSection`, `ProductSection`, `TypeDateSection`, `IndisponibiliteAlert`, `FormActionButtons`, `RdvCompletionModal`). Logique clé :
  - `filterProductsByCategory` filtre le catalogue par catégorie déduite de la description (perruque/tissage/extension/autres) via `check(p)`.
  - Charge dynamiquement `clientsVillesApi.getAll()` et `livraisonVilleApi.getAll()` à l'ouverture pour peupler les villes disponibles et les frais de livraison par ville.
  - **Auto-remplissage des frais de livraison** : si la ville du produit correspond à la ville du client (`clientVille`), et que la ville existe dans `livraisonVilles`, le frais est appliqué automatiquement (une seule fois par combinaison produit/ville, via `lastAutoFillRef`).
  - **Vérification de disponibilité** (`indisponibleApi.checkDisponibilite(date, horaire, heureFin)`, debounce ~) alimente `availability.disponible` + `availability.suggestions` (créneaux alternatifs affichés par `IndisponibiliteAlert`, cliquables pour appliquer directement l'horaire suggéré `onApplySuggestion`).
  - **Mode RDV local** (`localRdvMode`) activé automatiquement si la description du produit contient "prestation" (`TypeDateSection` "Type" = `rdv`). En ce mode, vérifie les conflits d'horaire côté `rdvTachesApi.getByDate(rdvDate)` (exclut les RDV `annule`/`termine`) et bloque la soumission si chevauchement (`rdvConflict.busy`).
  - `handleSubmitRdvMode`: crée d'abord le RDV (`rdvTachesApi.create`), puis la commande (`commandeApi.create`), relie les deux (`rdvTachesApi.updateByCommande`); en cas d'échec de la commande, supprime le RDV créé (rollback best-effort).
  - `handleSubmitRdvCompletion`: complète un RDV existant (choix personne/tâche via recherche `travailleurApi.search` à partir de 3 caractères, et `tachesRdvApi.getAll()` pour les tâches) — met à jour soit par commande (`updateByCommande`) soit par id direct.
  - Gère aussi les frais de livraison en mode override manuel (`showFeeOverride`) ou en majoration (`showFeeIncrease` + `feeIncreaseAmount`).
- **CommandesDialogs.tsx** — Regroupe: dialog de validation, dialog d'annulation, dialog de suppression, et modale "Reporter" (date/horaire) partagée depuis les listes.
- **CommandesHero.tsx** — Bandeau d'en-tête animé (particules).
- **CommandesSearchBar.tsx** — Barre de recherche + export PDF par plage de dates (`exportDate`) + bouton "Nouvelle commande".
- **CommandesStatsButtons.tsx** — 3 boutons statistiques (Clients / Produits / Prix) ouvrant des modales de synthèse calculées via `useMemo` sur `filteredCommandes`: total produits/prix, ventilé par type (`commande` vs `reservation`), et regroupement par produit (`produitsGrouped`) avec quantités/prix agrégés.
- **CommandesTable.tsx** — Table principale. `lastActivityLabel` calcule la date la plus récente parmi plusieurs candidats (dateCreation, dateModification, etc.) pour un badge "Dernière activité". `clientsByName`/`productsByName` = Maps pour retrouver rapidement le `Client`/`Product` complet au clic sur une cellule (ouvre `ClientDetailModal`/`ProductDetailModal`/`CaracteristiqueModal`).
- **ConfirmationDialogs.tsx** — `ValidationDialog`, `CancellationDialog`, `DeleteDialog` — trois `AlertDialog` génériques exportés nommément.
- **OverdueReservationModal.tsx** — Alerte pour réservation en retard, avec compte à rebours (`AUTO_VALIDATE_DELAY`) qui, à zéro, déclenche `onValidate` automatiquement (`autoValidatedRef` évite le double déclenchement). Le compte à rebours reprend depuis `reservation.overdueTimerStart` si déjà en cours (persistance du timer côté serveur).
- **PreparationLivraisonButton.tsx** — Bouton "Préparation & Livraison du jour". `isToday(dateStr)` compare année/mois/jour. `todayPersistable` = commandes du jour dont le statut est dans `PERSIST_STATUTS`; synchronisées côté serveur via `prepaLivraisonApi.sync(todayPersistable)`. `visibleEntries` filtre en plus sur `VISIBLE_STATUTS`. Case à cocher "terminé" par entrée (`handleToggleTermine`, avec rollback optimiste en cas d'échec API). Le bouton entier est masqué si `hasVisibleToday` est faux.
- **RdvConfirmationModal.tsx** / **RdvCreationModal.tsx** — Modales dédiées à la confirmation/prise de RDV depuis une commande de type réservation, avec formatage FR des dates et validation du titre non vide.
- **ReporterModal.tsx** — Report de date/horaire d'une commande ou d'un RDV lié; commentaire indique qu'il vérifie la disponibilité du créneau dans `rdv-taches.json` côté back pour les commandes de type RDV.
- **ReservationUlterieureModal.tsx** — Définit une date "ultérieure" pour une réservation. Deux modes: `date` (validée: non vide, pas dans le passé, pas au-delà de **10 jours** depuis aujourd'hui `max10`) ou `inconnu`. `handleRemove` réinitialise la config (passe `null`).
- **StatutUlterieurTransitionModal.tsx** — Transition d'un statut "ultérieur" vers une date/horaire fixe; valide que les 3 champs sont renseignés et que `heureFin > heureDebut`.
- **TacheConflictModal.tsx** — Gère le conflit entre une commande et une tâche déjà planifiée à la même heure; permet de reprogrammer (`onReschedule(id, date, h1, h2)`) ou d'ignorer (`onSkip`).
- **form/ClientSection.tsx** — Sous-formulaire client dans `CommandeFormDialog` : recherche/sélection d'un client existant (`filteredClients`, ≥3 caractères pour activer la recherche, `onClientPick`), sélection téléphone parmi `clientPhones`, saisie ville avec auto-ajout côté API (`clientsVillesApi.add`) si la ville saisie n'existe pas encore dans `availableVilles` (au `onBlur`).
- **form/ProductSection.tsx** — Sous-formulaire produit : filtre par catégorie (`ClassificationSearchPopover`), saisie quantité (`SaleQuantityInput`), prix de vente avec possibilité d'override (`SellingPriceOverrideButton`), gestion réduction (montant/pourcentage), ville de livraison avec frais associés (recherche dans `livraisonVilles`), et override/majoration manuelle des frais de livraison.
- **form/TypeDateSection.tsx** — Sélecteur Type (commande / réservation / rdv), gestion date d'échéance/arrivage prévue, plage horaire avec bouton pour ajouter une heure de fin.
- **form/IndisponibiliteAlert.tsx** — Affiche l'alerte d'indisponibilité et les suggestions de créneaux alternatifs cliquables.
- **form/FormActionButtons.tsx** — Boutons Annuler/Valider génériques.
- **form/RdvCompletionModal.tsx** — Complète un RDV créé en mode "prestation" avec recherche de personne/tâche (autocomplete) et commentaires.
- **table/*** — Sous-composants de rendu de la table (desktop `CommandeTableRow`/`CommandesTableDesktopHead`, mobile `CommandeMobileCard`), `ClientFideliteMarquee` (bandeau marquee fidélité), `CommandesEmptyState`, `CommandesDetailModals` (regroupe les 3 modales de détail client/produit/caractéristique), `useFideliteData.ts` (hook fournissant les infos de fidélité par nom de client), `types.ts` (types partagés `CommandeRowProps`, `getCommandeTotal`).
- **index.ts** — Ré-exports publics.

### 7bis.3 `src/components/rdv/`

- **ConfirmationRdvButton.tsx** — Bouton "Confirmations RDV" affichant les RDV dont le début est **dans les prochaines 24h** (`within24h`: statut actif et `0 <= diffMs <= 24h`). Synchronise via `confirmationRdvApi.sync(upcoming)` un état persistant par RDV (`ConfirmationRdvEntry`). `displayEntries` exclut les RDV déjà auto-confirmés (`confirmationAuto`). Actions possibles sur le RDV sélectionné :
  - **Maintenu** : `propagate(id, commandeId, 'maintenu')` → met à jour `rdvApiService.update`, ré-active la tâche liée (`PUT /api/taches/by-commande/:id { completed:false }`) si `commandeId`.
  - **Annulé** : met le RDV à `annule`, met la commande liée à un statut d'annulation, supprime la tâche liée (`DELETE /api/taches/by-commande/:id`).
  - **Reporter** : ouvre un mini-formulaire date/heureDebut/heureFin (validation champs requis), propage la nouvelle date au RDV, à la commande liée et à la tâche liée.
  - Se rafraîchit chaque minute (`setInterval`, `setTick`) pour recalculer `upcoming`.
- **GlobalRdvTodayNotifier.tsx** — Bandeau flottant global (toutes pages, si authentifié) listant les RDV du jour. Charge `rdvApiService.getAll()`, filtre sur la date du jour (`todayISO`). `visibleRdvs` exclut les RDV explicitement fermés (`dismissed`, Set en mémoire), triés en mettant en avant les RDV passés (`aPast`/`bPast`) puis par heure. Rotation automatique toutes les quelques secondes entre plusieurs RDV (`index`, `setInterval`) si non `expanded`. Auto-masquage temporisé (`visibleTimer`/`hiddenTimer`) sauf interaction. Réapparition si la souris s'approche du bord gauche de l'écran (`clientX <= 18`). Clic sur le bandeau navigue vers la page RDV concernée.
- **RdvCalendar.tsx** — Calendrier hebdomadaire drag & drop des RDV. État très riche : semaine courante (`currentDate`), RDV en cours de drag (`draggedRdv`), `indisponibilites` (chargées via `indisponibleApi.getAll()`), cible de drop (`dropTarget`), dialogue de confirmation d'horaire après drop (`showTimeDialog`, `pendingDrop`, `newTime`, `newEndTime`), conflits de drop (`dropConflicts`, `hasDropConflict` via `GET /api/rdv/conflicts`), détail RDV sélectionné, modales téléphone/adresse, confirmation modification/suppression, et flux de terminaison de RDV (`confirmTerminerOpen` → `askVenteOpen` → ouverture de `MultiProductSaleForm` pré-rempli). Règles :
  - **Plage d'heures affichées** (`HOURS`) = calculée dynamiquement sur la semaine visible (min/max des heures de début/fin des RDV non annulés).
  - **Indisponibilités** : `getIndispoForSlot`/`isDayFullyIndisponible`/`isDayFullyException` déterminent si un créneau est bloqué (journée complète ou plage horaire) ou au contraire une **exception** (créneau normalement indisponible mais explicitement ré-ouvert, `ind.exception === true`). `isRdvException(rdv)` vérifie si le RDV chevauche une exception.
  - **Drag & drop** : `handleDragStart` empêche le déplacement des RDV liés à une commande (`rdv.commandeId`, `e.preventDefault()`). Au drop, ouvre un dialogue pour confirmer/ajuster l'heure (conserve la durée d'origine par défaut), vérifie les conflits via API avec debounce, bloque la confirmation si conflit (`hasDropConflict`).
  - **Terminer un RDV** : passe le statut à `termine` (`rdvApiService.update`), puis propose de créer une vente (`askVenteOpen`) en pré-remplissant le formulaire de vente avec les infos client du RDV.
- **RdvForm.tsx** — Formulaire de création/édition de RDV (hors module rdv-tâches). Recherche client (`axios.get /api/rdv/search-clients`, ≥3 caractères, debounce), vérification de disponibilité (`indisponibleApi.checkDisponibilite`) et de conflits horaires (`GET /api/rdv/conflicts`, exclut le RDV courant en édition). `addHour(time)` calcule automatiquement une heure de fin par défaut (+1h) quand l'heure de début change. Soumission bloquée si `titre`/`clientNom` vides ou `viewOnly=true`.
- **RdvNotifications.tsx** — Cloche de notifications RDV. `shouldBlink` : clignote si le RDV est dans moins de 12h ou s'est terminé il y a moins de 24h. Poll régulier de `rdvNotificationsApi.checkAndCreate()` (crée les notifications pour RDV < 24h) et `getUnread()`. Toast si le nombre de notifications a augmenté depuis le dernier chargement. Clic sur une notification → `markAsRead` + retrait de la liste + ouverture du détail; "Aller au RDV" navigue vers la page.
- **RdvStatsCards.tsx** / **RdvStatsDetailsModal.tsx** / **RdvStatsModals.tsx** — Cartes de statistiques RDV (compteurs) et modales de détail (liste des RDV filtrés cliquables pour naviguer).
- **index.ts** — Ré-exports.

### 7bis.4 `src/components/rdvtache/` (module RDV + Tâches unifié)

- **utils/rdvConfirmation.ts** (utilisé ici) — Règles centrales du **verrou de confirmation RDV** :
  - `rdvStartDate(r)` : Date locale de début du RDV.
  - `isAutoConfirmed(r)` : un RDV créé à **moins de 24h** de son heure de début est auto-confirmé (pas besoin de validation manuelle).
  - `needsConfirmation(r, now)` : vrai si le RDV n'est pas `confirme`/`annule`/`termine`, n'est pas auto-confirmé, et que son début tombe dans une fenêtre **[maintenant-12h, maintenant+24h]** (`delta <= 24h && delta > -12h`).
  - `getRdvsToConfirm(rdvs, now)` : filtre la liste.
  - `allowedStatuts(r, now)` : si confirmation nécessaire → `['confirme','annule','termine']`; si RDV planifié/reporté et non auto-confirmé (hors fenêtre) → mêmes options; sinon seulement `['annule','termine']`. **C'est ce verrou qui empêche l'édition/suppression libre d'un RDV entre 24h et 1h avant son début tant qu'il n'est pas confirmé "maintenu".**
- **AddCatalogTacheModal.tsx** — Ajoute un type de tâche RDV au catalogue (`nom` requis, `description` optionnelle).
- **ConfirmDialog.tsx** — `AlertDialog` générique réutilisé dans le module.
- **RdvDayModal.tsx** — Vue "journée" des RDV avec drag & drop horaire. `dayRdvs` = RDV du jour non annulés triés par heure. RDV liés à une commande (`r.commandeId`) : **drag interdit** (`e.preventDefault()`). `handleDropOnHour` déplace le RDV à une nouvelle heure le même jour (`onMoveRdvSameDay`); `handleDropOnOther` (zone "autre date") déclenche `onRequestOtherDate` pour ouvrir `RdvRescheduleModal`. Le sélecteur de statut par ligne n'affiche que `statutOptions` calculées via `allowedStatuts`; les RDV verrouillés (`needsConfirmation` vrai et pas encore confirmés) affichent un badge Lock/attention.
- **RdvFormModal.tsx** — Formulaire complet de création/édition d'un RDV-tâche : recherche de personne (`travailleurApi.search`), recherche de client (`clientApiService`), sélection de la tâche du catalogue, ajout de produits (`RdvProductSection`), lieu/téléphone, date/heure (min 04:00, max 23:59), créneaux libres suggérés (`freeSlots`), commentaires, sélection du statut. `validate()` : client, tâche, date, heures requis et `heureFin > heureDebut`. Si la date change en édition et que le nouveau statut n'est ni `termine` ni `annule`, une confirmation supplémentaire est demandée (`confirmCreate`) avant soumission finale (déplacement de RDV existant).
- **RdvProductSection.tsx** — Sélection de produits pour un RDV (catégorisation via `catOf(description)`), gestion quantité/prix/ville de livraison/frais de prestation. `handleAdd` valide : produit sélectionné, quantité > 0 et ≤ stock disponible, prix de vente ≥ 0. Peut déclencher une mise à jour du prix de vente catalogue si l'utilisateur a modifié le prix via l'override (`productApiService.updateSellingPrice`).
- **RdvRescheduleModal.tsx** — Reprogrammation d'un RDV : valide date/heures renseignées et `heureFin > heureDebut` avant `onConfirm`.
- **RdvTacheCalendar.tsx** — Calendrier mensuel drag & drop (RDV liés à une commande non déplaçables), mode "pick-date" pour choisir directement une date lors d'un report (clic sur une case appelle `onDayPicked`), et RDV clignotants (`blinkIds`, Set) en attente de confirmation.
- **RdvTacheView.tsx** — Vue orchestrant le module RDV (calendrier + modales). Poll périodique (`setInterval`) de `rdvTachesApi.getByMonth` pour rafraîchissement quasi temps réel (compare `updatedAt`/`id` pour éviter les re-renders inutiles). `rdvsToConfirm` = `getRdvsToConfirm(rdvs)`; `confirmMode` s'auto-désactive si la liste devient vide. Règles de verrouillage strictes : **toute action (édition, suppression, déplacement, changement de statut) sur un RDV lié à une commande (`commandeId`) est bloquée** avec toast "RDV verrouillé — modifiez-le depuis la page Commandes". `createSaleFromRdv(rdv)` : quand un RDV passe à `termine` (et n'a pas déjà de `saleId`), transforme ses produits en vente via `saleApiService.create` (agrège prix de vente/achat/livraison/prestation), puis relie l'id de vente au RDV (`rdvTachesApi.update(id, {saleId})`).
- **RdvTachesHero.tsx** — En-tête avec compteurs et bouton "Confirmer RDV" (affiche le nombre de RDV en attente de confirmation, active `confirmMode` pour faire clignoter les RDV concernés dans le calendrier).

### 7bis.5 `src/components/tache/`

- **TacheCalendar.tsx** — Calendrier mensuel des tâches avec drag & drop. Charge `indisponibleApi.getAll()`. Règles d'indisponibilité identiques au module RDV (journée complète, plage partielle, exceptions). `handleDrop`/`handleDragOver` bloquent le drop sur un jour totalement indisponible.
- **TacheConfirmDialog.tsx** — Confirmation générique suppression/déplacement de tâche.
- **TacheDayModal.tsx** — Vue journée avec drag & drop horaire. `useCountdown` calcule le temps restant avant l'heure de fin d'une tâche (affiche "⏰ À vérifier" à expiration). Règles de conflit lors d'un déplacement (`handleDrop`) :
  1. Refuse si le nouveau créneau dépasse minuit (`newEndMinutes > 23*60+59`).
  2. Vérifie les conflits avec les **autres tâches de la même personne** (`personTaches`) sur le nouveau créneau.
  3. Si la personne est **administratrice** (`isAdminTravailleur`), vérifie en plus les conflits avec ses **RDV** (`rdvApiService.getAll()`, exclut `annule`/`termine`).
  4. Toute tâche `pertinent` ou verrouillée (`lockedIds`) ne peut être déplacée (`handleDragStart` empêche le drag).
- **TacheFormModal.tsx** — Formulaire tâche. Calcule les plages occupées de la journée pour la personne choisie (tâches + RDV si administrateur) afin d'afficher les créneaux libres (`availableRanges`) et bloquer les créneaux occupés. `validationMessage()` : journée totalement indisponible → refus; horaires hors [04:00–23:59] → refus; durée < 1 minute → refus; chevauchement avec une indisponibilité déclarée → refus avec motif; chevauchement avec un créneau déjà occupé (tâche ou RDV) → refus avec libellé de la source en conflit.
- **TacheHero.tsx** — En-tête avec compteurs (tâches non terminées, tâches du jour), boutons d'action (ajouter tâche/travailleur, voir jour/semaine, partager tâches, partage sélectif, voir commentaires).
- **TacheNotificationBar.tsx** / **TacheTicker.tsx** — Bandeau de notifications de tâches expirées (heure de fin dépassée sans validation) et ticker de défilement.
- **TacheValidationModal.tsx** — Modale de validation manuelle d'une tâche en fin d'échéance.
- **TacheView.tsx** — Vue orchestrant le module Tâches (calendrier mensuel + modales jour/semaine + notifications). Points clés :
  - **Verrouillage lié aux RDV** : `lockedIds` = ensemble des tâches dont `computeLockStateForTache(...) === 'locked'` (calculé à partir des entrées de confirmation RDV `confEntries`, cohérent avec la fenêtre 24h→1h décrite plus haut). `blockIfLocked(id)` bloque toute action (édition/suppression/déplacement/validation) avec toast "🔒 Tâche verrouillée — Le RDV associé n'est pas confirmé « maintenu »".
  - **Auto-complétion** (`parametreTache.autoCompleteOnDone`) : toutes les minutes, marque automatiquement `completed=true` les tâches dont la date est passée ou dont l'heure de fin du jour même est dépassée (`tacheApi.update(id, {completed:true})`), en évitant les doublons via `autoCompletedRef`.
  - **Notifications d'expiration** : toutes les minutes, détecte les tâches du jour non complétées dont l'heure de fin est dépassée et ajoute une notification (message "Vérifiez si cette tâche est terminée !"), une seule fois par tâche (`notifiedRef`).
  - Les tâches d'`importance: 'pertinent'` ne peuvent **jamais** être déplacées (drag ou modale), avec toast d'interdiction.
  - Déplacement calendrier mensuel (`handleCalendarDrag`) : refuse si tâche verrouillée ou pertinente.
  - `handleMoveTache` refuse un déplacement dépassant minuit.
  - Chargement combiné mensuel: `tacheApi.getByMonth`, `travailleurApi.getAll`, `parametresApi.getParametreTache`.
  - Compteur de commentaires de partage non lus (`shareCommentsApi.default.unread()`).
- **TacheWeekModal.tsx** — Vue semaine, charge les tâches via une API dédiée (`getByWeek`) et les regroupe par jour, triées par heure de début.

### 7bis.6 `src/components/notes/` (Kanban)

- **constants.ts** — `NOTE_COLORS`, `COLUMN_COLORS` (palettes), `VOICE_REPLACEMENTS` (regex de ponctuation intelligente pour la dictée vocale) et `applySmartPunctuation(text)` qui applique ces remplacements séquentiellement.
- **ColumnFormModal.tsx** — Création/édition d'une colonne Kanban (titre + couleur parmi `COLUMN_COLORS`).
- **ConfirmModal.tsx** — Confirmation générique avec protection anti double-clic (`isSubmitting`).
- **DrawingCanvas.tsx** — Canvas de dessin (souris + tactile) intégré aux notes : `getPos` convertit les coordonnées écran en coordonnées canvas en tenant compte du ratio d'échelle (`scaleX`/`scaleY`). Sauvegarde en dataURL JPEG (`toDataURL('image/jpeg', 0.9)`).
- **KanbanColumn.tsx** — Colonne Kanban avec **drag & drop de notes** : indicateur de position de dépôt (`dropIndicatorIndex`) calculé pendant le survol, drop possible entre deux notes ou en bas de colonne. Menu contextuel colonne (éditer/supprimer).
- **NoteCard.tsx** — Carte de note riche : dictée vocale (Web Speech API), mise en forme (gras/souligné par ligne), pièces jointes (upload/suppression), historique de "parcours" éditable avec réordonnancement par drag & drop, confirmation avant suppression d'une entrée d'historique (`confirmDeleteHistory`), refus de suppression si c'est la dernière entrée restante ("Il faut garder au moins un parcours"). Actions d'édition/suppression protégées par confirmation (`confirmAction`).
- **NoteFormModal.tsx** — Formulaire de note : titre, contenu (avec dictée vocale via `SpeechRecognition`, ajoutée en fin de texte via bouton dédié), mise en gras/soulignage ligne par ligne (`boldLines`/`underlineLines`), couleur (`NOTE_COLORS`), dessin (`DrawingCanvas`, upload via `noteApi.uploadDrawing`), fichiers joints (upload multiple `noteApi.uploadFichiers`, suppression individuelle), sélection de colonne cible.
- **NotesHero.tsx** — En-tête avec actions (nouvelle note, nouvelle colonne, partager, partage sélectif, voir commentaires).
- **NotesKanbanView.tsx** — Orchestrateur du Kanban :
  - Chargement combiné `noteApi.getAll()` + `noteApi.getColumns()`.
  - Toute mutation (créer/modifier/supprimer note ou colonne) passe par une **confirmation préalable** (`setConfirmAction({message, action})`) avant l'appel API réel.
  - **Drag & drop** (`handleDrop`) : si la note est déposée dans **sa colonne d'origine**, réordonnancement local optimiste (`splice` pour replacer, recalcul des `order` de 0..n) puis persistance batch via `noteApi.reorder(updates)` (rollback = `fetchData()` en cas d'échec) — **sans confirmation** (réorganisation directe). Si déposée dans une **autre colonne**, une confirmation est demandée ("Déplacer cette note vers ... ?") avant `noteApi.move(noteId, targetColId, order)` (ajoutée en fin de colonne cible).
  - Suppression de colonne : confirmation avec avertissement que les notes seront déplacées (comportement délégué au back-end).
  - Compteur de commentaires de partage non lus, boutons de partage (lien global) et partage sélectif.

### 7bis.7 `src/components/shared/` (composants transverses)

- **AddressActionModal.tsx** — Modale + hook `useAddressNavigation()` réutilisables : ouvre Google Maps/Waze/Apple Maps selon plate-forme (mobile détecté via `useIsMobile`), avec `React.memo` pour éviter les re-renders.
- **BackButton.tsx** — Bouton retour intelligent : masqué sur certaines routes (`HIDDEN_ROUTES`), utilise `window.history.length > 1 ? navigate(-1) : navigate('/')`.
- **ConfirmDialog.tsx** — Dialog de confirmation générique très utilisé dans l'app (`title`, `description`, boutons personnalisables, variantes visuelles, état `isLoading`/`disabled`, contenu additionnel optionnel).
- **LoadingOverlay.tsx** — Overlay ou bloc de chargement (`PremiumLoading`) avec variantes (taille, overlay plein écran ou en ligne).
- **LuxeHero.tsx** / **PageHero.tsx** — En-têtes de page premium réutilisables avec particules animées, badge, titre en dégradé, actions optionnelles, formatage de la date/mois courant (`date-fns` + locale `fr`).
- **Pagination.tsx** — Pagination générique avancée : calcule les pages visibles avec ellipses (`visiblePages`) au-delà de 7 pages, scroll automatique vers une ref cible après changement de page (`scrollTargetRef`), affichage optionnel du compteur d'éléments ("x-y sur n").
- **SelectiveShareModal.tsx** — Génération de liens de partage **filtrés** pour 3 types de données (`pointage`, `taches`, `notes`). Étapes (`step: 'filters' | 'count' | 'result'`) :
  1. **Filtres** spécifiques au type : pour `notes`, sélection par colonne (`notesAllColumns` ou sélection fine de colonnes/notes individuelles `notesSelection`); pour `pointage`/`taches`, filtre par personne (`selectedPersonne`), par période (`selectAll` ou mode `jours`/`semaines`/`mois`/`annees` avec sélections multiples `selectedDays`/`selectedWeeks`/`selectedMonths`/`selectedYears`), par entreprise (`pointage`), par importance (`taches`: tout/pertinent/optionnel).
  2. **Validation** (`handleValidate`) : pour les notes en sélection fine, exige au moins une colonne cochée, sinon toast d'erreur.
  3. **Nombre de liens** (`linkCount`, incrémentable/décrémentable, min 1).
  4. **Génération** (`handleGenerate`) : appelle `shareLinksApi.generate(type, filters)` `linkCount` fois, affiche les liens générés avec code d'accès, copie presse-papier (`handleCopy`, lien + code).
- **ShareCommentsViewer.tsx** — Visualiseur des commentaires laissés via les liens de partage. Recharge à l'ouverture (`shareCommentsApi.list(type)`) et **en temps réel** via un événement custom `share-comment-received` (SSE côté app) filtré par `type`. Marque un commentaire comme lu au clic (`markRead`), affiche un instantané HTML (`snapshotFile` → `fetch` + injection dans un `<iframe>`), permet le téléchargement d'un résumé PDF/texte des commentaires, et la suppression (confirmée en deux clics via `deleteConfirmId`) — **suppression uniquement autorisée si le commentaire est déjà lu** (règle imposée côté logique du composant).
- **ShareLinkModal.tsx** — Gestion simple des liens de partage globaux (sans filtre) pour un type donné : liste (`shareLinksApi.list`), génération (`generate`), révocation (`revoke`), copie lien+code.
- **SharedCommentForm.tsx** — Formulaire affiché **côté page publique de partage** (consultée via lien) permettant à un tiers de laisser des commentaires. Étapes (`mode`) : `idle` → `commenting` → `validated` → `sent`, ou `already` si déjà commenté (vérifié via `shareCommentsApi.check(token)`). Commentaires **inline** par élément (`inlineComments`, indexés, avec libellé généré selon `dataType`: pointage/taches/notes) ou un commentaire général. `handleValidate` exige nom+prénom renseignés et au moins un commentaire (inline ou général), envoie via `shareCommentsApi.submit(token, {...})`, obtient un `commentId`. `handleSend` finalise l'envoi (`shareCommentsApi.send(commentId)`), passage à l'état `sent`. Un mode "minimisé" (`minimized`) permet de réduire le panneau pendant la consultation.
- **StatBadge.tsx** — Badge statistique réutilisable (icône + valeur + variante de couleur/taille).
- **UnifiedSearchBar.tsx** — Barre de recherche générique avec debounce configurable (`debounceMs`), nombre minimum de caractères (`minChars`) avant déclenchement de `onChange`, affichage optionnel dans une `Card`, compteur de résultats, bouton d'effacement.
- **index.ts** — Ré-exports publics de tout le dossier `shared/`.

### 7bis.8 Règles métier transverses à retenir pour la reconstruction

1. **Téléphones/adresses multiples** : partout dans le module Clients, les données sont stockées en tableaux (`phones[]`, `addresses[]`, `villes[]` synchronisé par index avec `addresses[]`). **L'élément d'index 0 est toujours considéré comme "Principal"**; le rendre principal implique un `splice` pour le replacer en tête (et son entrée ville associée suit le même mouvement).
2. **Fusion de clients** : nécessite au minimum 2 clients sélectionnés, et les champs finaux (nom, au moins un téléphone, adresse) sont obligatoires; la photo finale est choisie explicitement parmi celles des clients fusionnés.
3. **Verrou de confirmation RDV (24h → 1h)** : un RDV créé plus de 24h à l'avance doit être confirmé "maintenu" dès qu'il entre dans la fenêtre des 24 dernières heures avant son début; tant qu'il n'est ni confirmé ni traité, il reste modifiable via le flux de confirmation (maintenu / annulé / reporté) mais toute tâche associée est **verrouillée** (non éditable/supprimable/déplaçable) — le déverrouillage survient à la confirmation "maintenu", à l'annulation ou à la terminaison du RDV. Ce verrou est calculé par `needsConfirmation`/`allowedStatuts` (utils/rdvConfirmation.ts) et par `computeLockStateForTache` côté tâches.
4. **RDV liés à une commande** (`commandeId` renseigné) : **totalement verrouillés** dans le module RDV/Tâches — toute action (édition, suppression, déplacement drag & drop, changement de statut) est bloquée avec redirection logique vers la page Commandes, qui reste seule autorisée à modifier ces RDV.
5. **Indisponibilités et exceptions** : une indisponibilité peut couvrir une journée entière ou une plage horaire; une **exception** (`ind.exception === true`) rouvre explicitement un créneau normalement indisponible. Les calendriers RDV/Tâches appliquent systématiquement ces règles pour griser/bloquer le drag & drop et signaler les créneaux limitrophes.
6. **Kanban Notes** : le drag & drop dans la même colonne réordonne silencieusement (sans confirmation) via un `order` recalculé et persisté en batch; le déplacement vers une autre colonne demande toujours une confirmation utilisateur avant l'appel API.
7. **Liens de partage & commentaires** : deux mécanismes coexistent — un partage "global" simple (`ShareLinkModal`) et un partage "sélectif" avec filtres avancés par type de données (`SelectiveShareModal`, filtres différents selon pointage/tâches/notes). Les commentaires reçus via un lien sont visualisables en temps réel (événement `share-comment-received`), marqués lus au clic, et ne peuvent être supprimés qu'une fois lus.

---

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

---

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

---

## 8. COMPOSANTS UI shadcn (55 fichiers)

| Fichier | Lignes | Rôle |
|---|---|---|
| `src/components/ui/accordion.tsx` | 56 |  |
| `src/components/ui/alert-dialog.tsx` | 139 |  |
| `src/components/ui/alert.tsx` | 59 |  |
| `src/components/ui/aspect-ratio.tsx` | 5 |  |
| `src/components/ui/avatar.tsx` | 48 |  |
| `src/components/ui/badge.tsx` | 37 |  |
| `src/components/ui/breadcrumb.tsx` | 115 |  |
| `src/components/ui/button.tsx` | 102 |  |
| `src/components/ui/calendar.tsx` | 67 |  |
| `src/components/ui/card.tsx` | 79 |  |
| `src/components/ui/carousel.tsx` | 260 |  |
| `src/components/ui/chart.tsx` | 370 | Format: { THEME_NAME: CSS_SELECTOR } |
| `src/components/ui/checkbox.tsx` | 28 |  |
| `src/components/ui/collapsible.tsx` | 9 |  |
| `src/components/ui/command.tsx` | 153 |  |
| `src/components/ui/context-menu.tsx` | 198 |  |
| `src/components/ui/dialog.tsx` | 126 |  |
| `src/components/ui/drawer.tsx` | 116 |  |
| `src/components/ui/dropdown-menu.tsx` | 198 |  |
| `src/components/ui/form.tsx` | 176 |  |
| `src/components/ui/hover-card.tsx` | 27 |  |
| `src/components/ui/input-otp.tsx` | 69 |  |
| `src/components/ui/input.tsx` | 22 |  |
| `src/components/ui/label.tsx` | 24 |  |
| `src/components/ui/loading/LoadingDots.tsx` | 55 |  |
| `src/components/ui/loading/LoadingSkeleton.tsx` | 67 |  |
| `src/components/ui/loading/LoadingSpinner.tsx` | 67 |  |
| `src/components/ui/loading/index.ts` | 4 |  |
| `src/components/ui/menubar.tsx` | 234 |  |
| `src/components/ui/navigation-menu.tsx` | 129 |  |
| `src/components/ui/pagination.tsx` | 117 |  |
| `src/components/ui/popover.tsx` | 29 |  |
| `src/components/ui/premium-loading.tsx` | 111 |  |
| `src/components/ui/professional-loading.tsx` | 96 |  |
| `src/components/ui/progress.tsx` | 26 |  |
| `src/components/ui/radio-group.tsx` | 42 |  |
| `src/components/ui/resizable.tsx` | 43 |  |
| `src/components/ui/scroll-area.tsx` | 46 |  |
| `src/components/ui/select.tsx` | 158 |  |
| `src/components/ui/separator.tsx` | 29 |  |
| `src/components/ui/sheet.tsx` | 137 |  |
| `src/components/ui/sidebar.tsx` | 761 |  |
| `src/components/ui/skeleton.tsx` | 15 |  |
| `src/components/ui/slider.tsx` | 26 |  |
| `src/components/ui/sonner.tsx` | 53 |  |
| `src/components/ui/switch.tsx` | 27 |  |
| `src/components/ui/table.tsx` | 117 |  |
| `src/components/ui/tabs.tsx` | 54 |  |
| `src/components/ui/textarea.tsx` | 24 |  |
| `src/components/ui/toast.tsx` | 127 |  |
| `src/components/ui/toaster.tsx` | 33 |  |
| `src/components/ui/toggle-group.tsx` | 59 |  |
| `src/components/ui/toggle.tsx` | 43 |  |
| `src/components/ui/tooltip.tsx` | 28 |  |
| `src/components/ui/use-toast.ts` | 3 |  |

---

## 9. HOOKS (30 fichiers)

| Fichier | Lignes | Exports | Rôle |
|---|---|---|---|
| `src/hooks/index.ts` | 11 | — | Export centralisé de tous les hooks personnalisés |
| `src/hooks/use-auto-logout.tsx` | 189 | `useAutoLogout` |  |
| `src/hooks/use-chat-notification.ts` | 75 | `ChatNotification`, `useChatNotification` | Luxurious chime notification sound using Web Audio API |
| `src/hooks/use-currency-formatter.ts` | 22 | — | Hook personnalisé pour formater les valeurs monétaires en euros Utilise l'API Intl.NumberFormat pour un formatage cohérent @returns Une fonction qui p… |
| `src/hooks/use-error-boundary.tsx` | 103 | `useErrorBoundary`, `ErrorBoundaryProvider`, `useAsyncError` |  |
| `src/hooks/use-messages.ts` | 147 | `Message`, `useMessages` |  |
| `src/hooks/use-mobile.tsx` | 23 | `useIsMobile`, `useMobile` |  |
| `src/hooks/use-professional-data.tsx` | 28 | `useProfessionalData`, `usePaginatedData` | Create hooks for professional data management |
| `src/hooks/use-realtime-sync.ts` | 65 | `setFormProtection`, `isFormProtected`, `useRealtimeSync` | useRealtimeSync — NO polling Synchronisation is fully driven by SSE push from the backend. This hook only provides a manual `forceSync` escape-hatch a… |
| `src/hooks/use-sse.ts` | 114 | `useSSE` |  |
| `src/hooks/use-toast.ts` | 191 | `reducer` |  |
| `src/hooks/use-visit-logger.ts` | 94 | `useVisitLogger` | useVisitLogger.ts — Enregistre la visite initiale puis chaque changement de route (page consultée) dans l'historique des connexions. - Une session nav… |
| `src/hooks/useAttributeKinds.ts` | 64 | `notifyKindsChanged`, `useAttributeKinds` | useAttributeKinds — Hook central pour la gestion des TYPES d'attributs produits. Fournit CRUD sur les kinds + événement de synchronisation entre compo… |
| `src/hooks/useBusinessCalculations.ts` | 52 | `BusinessCalculations`, `useBusinessCalculations` | Interface pour les statistiques de ventes (immuable) |
| `src/hooks/useClientSync.ts` | 129 | `useClientSync` |  |
| `src/hooks/useClients.ts` | 197 | `useClients`, `useClientsPagination` | Hook personnalisé pour la gestion des clients |
| `src/hooks/useCommandes.ts` | 271 | `useCommandes`, `useCommandesFilter`, `useCommandeCart` | Hook personnalisé pour la gestion des commandes |
| `src/hooks/useCommandesLogic.ts` | 1615 | `useCommandesLogic` | ============================================================================= useCommandesLogic - Hook de logique métier pour CommandesPage ==========… |
| `src/hooks/useComptabilite.ts` | 755 | `MONTHS`, `ModalStates`, `BarChartData`, `PieChartData`, `useComptabilite` | useComptabilite - Hook personnalisé pour la logique métier du module Comptabilité Ce hook centralise toute la logique métier, les états et les calculs… |
| `src/hooks/useLightMotion.ts` | 33 | `useLightMotion` | useLightMotion Détecte (une seule fois, au montage) si l'appareil doit recevoir une version allégée des décorations animées : petits écrans ou préfére… |
| `src/hooks/useObjectif.ts` | 68 | `useObjectif` | This will fetch and recalculate from sales.json automatically |
| `src/hooks/useOptimization.ts` | 275 | `useDebounce`, `useDebouncedCallback`, `useThrottledCallback`, `useDeepMemo`, `usePagination`, `useFilteredData`, `useSortedData`, `useLocalCache`, `useIntersectionObserver` | Hook de debounce pour optimiser les requêtes |
| `src/hooks/usePhoneActions.ts` | 53 | `usePhoneActions` | Hook pour les actions téléphoniques (appel, SMS) |
| `src/hooks/useProductAttributes.ts` | 89 | `notifyValuesChanged`, `useProductAttributes` | useProductAttributes — Charge et met en cache les valeurs d'un type d'attribut. Le `kind` passé peut être : - un id de kind (`k_xxx`) provenant de use… |
| `src/hooks/useProducts.ts` | 155 | `useProducts` | Hook personnalisé pour la gestion des produits |
| `src/hooks/useRdv.ts` | 192 | `useRdv` | Charger tous les RDV |
| `src/hooks/useRealtimeCommentNotifications.ts` | 64 | `useRealtimeCommentNotifications` | Hook that listens to SSE `share-comment-received` events in real-time. Shows a toast notification instantly when a new comment arrives, |
| `src/hooks/useSales.ts` | 171 | `useSales` | Hook personnalisé pour la gestion des ventes |
| `src/hooks/useSessionUnique.ts` | 91 | `useSessionUnique` | useSessionUnique.ts — CONTROLLER de la session unique par profil. Rôle : - heartbeat toutes les 2 s vers /api/connecte-profil-unique/poll - déconnexio… |
| `src/hooks/useYearlyData.ts` | 216 | `YearlyStats`, `MonthlyStats`, `getSaleValues`, `filterSalesByYear`, `filterSalesByMonthYear`, `useYearlyData` |  |

---


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

---

## 10. CONTEXTES (4)

| Fichier | Lignes | Exports | Rôle |
|---|---|---|---|
| `src/contexts/AppContext.tsx` | 436 | `AppProvider`, `useApp` | AppContext.tsx - Contexte global de l'application Fournit les données partagées (produits, ventes) et les fonctions CRUD à tous les composants via Rea… |
| `src/contexts/AuthContext.tsx` | 388 | `AuthProvider`, `useAuth` | AuthContext.tsx - Contexte d'authentification Gère l'état de connexion, le token JWT, le profil utilisateur, et les fonctions login/logout/register/re… |
| `src/contexts/FormProtectionContext.tsx` | 63 | `FormProtectionProvider`, `useFormProtection` |  |
| `src/contexts/ThemeContext.tsx` | 69 | `ThemeProvider`, `useTheme` |  |

---

## 11. STORES ZUSTAND (3)

| Fichier | Lignes | Exports | Rôle |
|---|---|---|---|
| `src/store/appStore.ts` | 75 | `useAppStore` | App Store — État global de l'application (Zustand) Centralise : produits, ventes, clients, chargement, erreurs Remplace progressivement AppContext pou… |
| `src/store/authStore.ts` | 38 | `useAuthStore` | Auth Store — État d'authentification (Zustand) Gère : utilisateur courant, token, statut de connexion |
| `src/store/index.ts` | 10 | — | Store — Point d'entrée centralisé pour le state management (Zustand) Architecture MVC : - Models (types/) : définitions des données - Views (component… |

---

## 12. SERVICES (67 fichiers)

| Fichier | Lignes | Exports | Rôle |
|---|---|---|---|
| `src/services/BusinessCalculationService.ts` | 123 | `ProfitCalculationInput`, `MarginCalculationInput`, `TotalCostCalculationInput`, `BusinessCalculationService` | Service de calculs commerciaux (fonctions pures) Toutes les fonctions sont pures : même entrée = même sortie, aucun effet de bord |
| `src/services/FormatService.ts` | 213 | `FormatService` | Service de formatage (fonctions pures) Toutes les fonctions sont déterministes et sans effets de bord |
| `src/services/api/api.ts` | 80 | — | api.ts — Instance Axios centralisée pour toutes les requêtes HTTP Configuration : - baseURL : VITE_API_BASE_URL ou https://server-gestion-ventes.onren… |
| `src/services/api/attributKindsApi.ts` | 65 | `AttributeKindDef`, `AttributeValue`, `attributKindsApi` | attributKindsApi.ts — API pour la gestion dynamique des types d'attributs produits (kinds) et de leurs valeurs. Chaque kind possède son propre fichier… |
| `src/services/api/authApi.ts` | 77 | `authApiService` | Service API pour l'authentification |
| `src/services/api/availabilityApi.ts` | 17 | `BusySlot`, `FreeSlot` |  |
| `src/services/api/avanceApi.ts` | 27 | `Avance` |  |
| `src/services/api/beneficeApi.ts` | 67 | `Benefice`, `beneficeApiService` | Service API pour les bénéfices |
| `src/services/api/blockageIpApi.ts` | 72 | `BlockedIp`, `IpCheckResult` | blockageIpApi — Gestion des adresses IP bloquées Endpoints serveur : - GET    /api/blockage-ip/check  (public) - GET    /api/blockage-ip        (proté… |
| `src/services/api/clientApi.ts` | 38 | `clientApiService` | Service API pour les clients |
| `src/services/api/commandeApi.ts` | 48 | `commandeApiService` | Service API pour les commandes |
| `src/services/api/comptaApi.ts` | 86 | `ComptaMonthData`, `ComptaYearlySummary`, `comptaApiService` | Service API pour les données de comptabilité |
| `src/services/api/confirmationRdvApi.ts` | 45 | `ConfirmationRdvEntry`, `confirmationRdvApi` |  |
| `src/services/api/connecteProfilUniqueApi.ts` | 169 | `DeviceContext`, `SessionConflict`, `PendingLogoutRequest`, `SessionNotification`, `PollResult`, `getClientKey`, `getDeviceContext`, `SESSION_ID_KEY`, `connecteProfilUniqueApi` | connecteProfilUniqueApi.ts — Service API (MODEL) pour la session unique. Toutes les requêtes vers /api/connecte-profil-unique sont centralisées ici. |
| `src/services/api/depenseApi.ts` | 45 | `depenseApiService` | Service API pour les dépenses |
| `src/services/api/entrepriseApi.ts` | 20 | `Entreprise` |  |
| `src/services/api/epargneApi.ts` | 121 | `EpargneOperation`, `EpargneCompte`, `EpargneOwner`, `epargneApi`, `arToFmg`, `formatAr`, `formatFmg` | epargneApi.ts - Service API pour les comptes d'épargne (accès admin principale) |
| `src/services/api/fideliteApi.ts` | 117 | `FideliteSaleEntry`, `FideliteEntry`, `fideliteApiService` | fideliteApi — Récupération des données de fidélité client depuis fidelite.json. Fallback: si l'endpoint /api/fidelite n'est pas disponible (ancien ser… |
| `src/services/api/fournisseurApi.ts` | 41 | `Fournisseur`, `fournisseurApiService` | Service API pour les fournisseurs Permet la recherche, la création et la récupération des fournisseurs. |
| `src/services/api/historiqueConnexionApi.ts` | 35 | `HistoriqueEntry` | historiqueConnexionApi.ts — API client pour l'historique des connexions / visites. |
| `src/services/api/index.ts` | 43 | — | index.ts — Export centralisé de tous les services API Architecture MVC : cette couche "Services" gère tous les appels HTTP. Chaque fichier correspond … |
| `src/services/api/indisponibleApi.ts` | 110 | `Indisponibilite`, `DisponibiliteCheck` |  |
| `src/services/api/listesFideliteApi.ts` | 56 | `FideliteTierConfig`, `listesFideliteApi`, `tierForCount` | listesFideliteApi — CRUD des paliers de fidélité configurables. Backend: server/db/listes-fidelite.json (via /api/listes-fidelite). ⚠️ Aucun palier n'… |
| `src/services/api/moduleSettingsApi.ts` | 45 | `ModuleSettings` |  |
| `src/services/api/noteApi.ts` | 101 | `NoteColumn`, `NoteHistoryEntry`, `NoteFichier`, `Note`, `getDrawingUrl`, `getFichierUrl` |  |
| `src/services/api/noteShareApi.ts` | 8 | — |  |
| `src/services/api/nouvelleAchatApi.ts` | 110 | `nouvelleAchatApiService` | Service API pour les nouveaux achats et dépenses |
| `src/services/api/objectifApi.ts` | 73 | `ObjectifData`, `MonthlyData`, `ObjectifChange`, `BeneficeMensuel`, `ObjectifHistorique`, `objectifApi` |  |
| `src/services/api/parametresApi.ts` | 35 | `PrixPointage`, `ParametreTache` |  |
| `src/services/api/pointageApi.ts` | 29 | `PointageEntry` |  |
| `src/services/api/pointageAutoApi.ts` | 42 | `PointageAutoEntry` | pointageAutoApi — Client API pour le pointage automatique Gère les règles configurées dans ProfilePage > Paramètres > Pointage automatique. Chaque règ… |
| `src/services/api/pointageAutoDeclancheApi.ts` | 50 | `PointageAutoDeclancheEntry` | pointageAutoDeclancheApi — Persistence du chrono multi-admin Quand une règle de pointage automatique doit déclencher un chrono, on enregistre l'état d… |
| `src/services/api/pointageAutoSessionsApi.ts` | 36 | `PointageAutoSession` | pointageAutoSessionsApi — Synchronisation multi-admin des notifications de pointage automatique (voir server/routes/pointageAutoSessions.js). |
| `src/services/api/pointageDeletedApi.ts` | 24 | `PointageDeletedFingerprint` | pointageDeletedApi — Empreintes des pointages supprimés Empêche le pointage automatique de recréer un pointage qui a été supprimé manuellement par l'a… |
| `src/services/api/prepaLivraisonApi.ts` | 38 | `PrepaLivraisonEntry`, `prepaLivraisonApi` |  |
| `src/services/api/pretFamilleApi.ts` | 38 | `pretFamilleApiService` | Service API pour les prêts familles |
| `src/services/api/pretProduitApi.ts` | 42 | `pretProduitApiService` | Service API pour les prêts produits |
| `src/services/api/prixProductsApi.ts` | 54 | `PrixProductEntry`, `PrixProductPayload`, `prixProductsApiService` | prixProductsApi.ts — Service API pour l'historique des prix d'achat |
| `src/services/api/productApi.ts` | 147 | `productApiService` | Service API pour les produits |
| `src/services/api/productCommentsApi.ts` | 51 | `ProductComment`, `ProductRatingInfo`, `productCommentsApi` |  |
| `src/services/api/profileApi.ts` | 60 | `ProfileData` | profileApi — Service API pour le profil utilisateur Endpoints : - GET /api/profile : récupérer le profil - PUT /api/profile : modifier les infos perso… |
| `src/services/api/rdvApi.ts` | 56 | `rdvApiService` | Récupérer tous les rendez-vous |
| `src/services/api/rdvNotificationsApi.ts` | 98 | `RdvNotification`, `rdvNotificationsApi` |  |
| `src/services/api/rdvTachesApi.ts` | 65 | `RdvTacheStatut`, `RdvProduit`, `RdvTache`, `FreeSlot` | Produit rattaché à un RDV-tâche (panier enregistré dans rdv-taches.json) */ |
| `src/services/api/remboursementApi.ts` | 30 | `remboursementApiService` |  |
| `src/services/api/saleApi.ts` | 47 | `saleApiService` | Service API pour les ventes |
| `src/services/api/settingsApi.ts` | 83 | `AppSettings` | settingsApi — Service API pour les paramètres de l'application Endpoints : - GET /api/settings : récupérer les paramètres globaux + statut admin - PUT… |
| `src/services/api/shareCommentsApi.ts` | 138 | `CommentItemData`, `ShareComment`, `UnreadCounts` | shareCommentsApi.ts Service API pour la gestion des commentaires sur les liens partagés. Routes publiques (sans auth) : - submit : Soumettre des comme… |
| `src/services/api/shareLinksApi.ts` | 49 | `ShareLink` |  |
| `src/services/api/tacheApi.ts` | 29 | `Tache` |  |
| `src/services/api/tachesRdvApi.ts` | 19 | `TacheRdvCatalog` |  |
| `src/services/api/travailleurApi.ts` | 23 | `Travailleur` |  |
| `src/services/api/villesApi.ts` | 42 | `LivraisonVille`, `clientsVillesApi`, `livraisonVilleApi` | Service API pour les villes (clients + livraison) |
| `src/services/apiReachability.ts` | 51 | `isApiReachable`, `resetApiReachability` | apiReachability.ts — Sonde de disponibilité de l'API. Objectif : ne jamais ouvrir de connexion SSE (EventSource) quand le serveur est injoignable (Ren… |
| `src/services/dataOptimizationService.ts` | 332 | `dataOptimizationService`, `useOptimizedSalesData`, `useOptimizedProductData` | Interface pour les calculs de ventes optimisés (immuable) |
| `src/services/optimizedRealtimeService.ts` | 438 | `SyncData`, `optimizedRealtimeService` |  |
| `src/services/rdvFromReservationService.ts` | 125 | `rdvFromReservationService` | Service pour créer automatiquement un RDV depuis une réservation |
| `src/services/realtime/DataCacheManager.ts` | 24 | `DataCacheManager` |  |
| `src/services/realtime/EventSourceManager.ts` | 166 | `EventSourceManager` | EventSourceManager - SSE Push Mode Receives data changes from the backend via Server-Sent Events. No polling — the backend pushes data instantly when … |
| `src/services/realtime/RealtimeService.ts` | 208 | `realtimeService` | RealtimeService — SSE Push Only NO periodic polling. Data is pushed from the backend via SSE the instant a file changes on disk. The frontend only syn… |
| `src/services/realtime/types.ts` | 27 | `SyncData`, `SyncEvent`, `ConnectionConfig` |  |
| `src/services/realtimeService.ts` | 8 | — | Export the new modular realtime service |
| `src/services/reservationRdvSyncService.ts` | 173 | `reservationRdvSyncService` | ============================================================================= Service de synchronisation entre Réservation et Rendez-vous ============… |
| `src/services/sseBase.ts` | 30 | `getSseBaseURL` | sseBase.ts — Détermine la base d'URL à utiliser pour les connexions SSE (et la sonde /api/health). Objectif : éviter les erreurs CORS en passant par l… |
| `src/services/syncService.ts` | 16 | `SyncData`, `syncService` | Réexporter le service temps réel pour compatibilité |
| `src/service/api.ts` | 271 | `authService`, `productService`, `salesService`, `depenseService`, `versementService`, `bankService`, `pretFamilleService`, `pretProduitService`, `beneficeService`, `marketingService`, `commandeService`, `clientService` | COUCHE DE COMPATIBILITÉ — Redirige vers src/services/api/ Ce fichier maintient la rétrocompatibilité avec les anciens imports : import { productServic… |
| `src/service/beneficeService.ts` | 13 | `beneficeService` | COUCHE DE COMPATIBILITÉ — Redirige vers src/services/api/beneficeApi avec les anciens noms de méthodes pour rétrocompatibilité |

Règles des services API :
- `src/services/api/api.ts` : instance axios unique, `baseURL = import.meta.env.VITE_API_BASE_URL`,
  timeout 30 s, `axios-retry` (2 tentatives, backoff exponentiel), intercepteur d'ajout du JWT depuis
  `localStorage`, intercepteur 401 → purge du token + événement `auth:logout`.
- Chaque ressource possède son fichier `xxxApi.ts` exportant un objet de méthodes CRUD typées.
- `src/services/api/index.ts` réexporte tous les services.
- Temps réel : `services/realtime/{EventSourceManager, DataCacheManager, RealtimeService, types}.ts`
  + `sseBase.ts` + `syncService.ts` : connexion `EventSource` sur `/api/sync/events`, reconnexion
  exponentielle, cache mémoire, invalidation par type d'entité, timeout d'inactivité 72 h.

---

## 13. LIB (8) & UTILS (8)

| Fichier | Lignes | Exports | Rôle |
|---|---|---|---|
| `src/lib/antiTamper.ts` | 140 | `installAntiTamper` | antiTamper.ts — Défenses front additives (anti-clone / anti-embarquement / anti-exfiltration) Installé une seule fois au démarrage depuis main.tsx, ap… |
| `src/lib/barcodeCodec.ts` | 52 | `decodeBarcode`, `getBarcodeValue` | barcodeCodec.ts Encodage / décodage du code-barre obfusqué stocké dans products.json. Le serveur stocke le code-barre sous forme de plusieurs segments… |
| `src/lib/performance.ts` | 385 | `dataCache`, `debounce`, `throttle`, `deduplicateRequest`, `createBatcher`, `performanceMonitor`, `prefetchRoute`, `prefetchImage`, `createLazyLoader`, `calculateVisibleRange`, `cleanupMemory` | Service d'optimisation des performances pour le frontend Inclut: Cache, debouncing, throttling, lazy loading helpers |
| `src/lib/proofOfWork.ts` | 89 | `PowResult`, `createChallenge`, `solveProofOfWork`, `storeProof` | proofOfWork.ts — Preuve de travail légère (anti-bot / anti-automatisation) Utilisée par la page de vérification de sécurité : le navigateur doit trouv… |
| `src/lib/runtimeSecurity.ts` | 55 | `installRuntimeSecurity` | runtimeSecurity.ts — Durcissement runtime léger (zéro impact perf notable). Installé une seule fois au démarrage depuis main.tsx. - Blocage de la poll… |
| `src/lib/security.ts` | 368 | `sanitizeString`, `sanitizeObject`, `safeEncodeURI`, `isSafeUrl`, `validators`, `generateSecureId`, `maskSensitiveData`, `maskEmail`, `checkPasswordStrength`, `RateLimiter`, `generateCSRFToken`, `storeCSRFToken` | Utilitaires de sécurité complets pour le frontend Inclut: XSS protection, validation, rate limiting, CSRF, sanitization |
| `src/lib/utils.ts` | 6 | `cn` |  |
| `src/lib/validation.ts` | 125 | `emailSchema`, `phoneSchema`, `passwordSchema`, `amountSchema`, `quantitySchema`, `idSchema`, `dateSchema`, `clientSchema`, `productSchema`, `saleProductSchema`, `saleSchema`, `messageSchema` | Schémas de validation Zod pour sécuriser les entrées |

| Fichier | Lignes | Exports | Rôle |
|---|---|---|---|
| `src/utils/clientCharacteristic.ts` | 101 | `ClientCaracteristiqueType`, `ClientCaracteristique`, `computeClientCaracteristique`, `CARACTERISTIQUES`, `getCaracteristiqueByLabel` | Caractéristique client calculée à partir des bases clients/sales/commandes. |
| `src/utils/clientMatch.ts` | 92 | `ClientLike`, `TypedClient`, `MatchField`, `ClientMatch`, `findMatchingClients`, `clientHasDifference`, `canCreateNewDespiteMatches`, `matchSignature` | Utilitaires de détection de doublons clients. Compare nom, téléphones et adresses avec la base existante. |
| `src/utils/helpers.ts` | 51 | `formatCurrency`, `formatDate`, `formatNumber`, `truncateText`, `generateId`, `debounce`, `throttle` | Helpers — Fonctions utilitaires génériques |
| `src/utils/index.ts` | 9 | — | Utils — Fonctions utilitaires centralisées Point d'entrée unique pour toutes les fonctions utilitaires. Nouveau code doit importer depuis @/utils au l… |
| `src/utils/rdvConfirmation.ts` | 59 | `rdvStartDate`, `isAutoConfirmed`, `needsConfirmation`, `getRdvsToConfirm`, `allowedStatuts` | rdvConfirmation.ts Règles de confirmation des RDV (module RDV / Pointage). - Un RDV créé à MOINS de 24h de son heure de début est "auto-confirmé" : on… |
| `src/utils/rdvConfirmationLock.ts` | 115 | `RdvLockState`, `computeLockStateForCommande`, `computeLockStateForTache`, `autoCancelCommandeIfNeeded`, `autoCancelTacheIfNeeded` | ============================================================================= rdvConfirmationLock - Verrouillage des commandes/tâches liées à un RDV =… |
| `src/utils/sessionsHistoryPdf.ts` | 88 | `SessionPdfRow`, `exportSessionsHistoryPdf` | sessionsHistoryPdf.ts — Génération du PDF de l'historique des connexions / déconnexions (usage interne entreprise). Le document est marqué "usage inte… |
| `src/utils/validators.ts` | 29 | `validateEmail`, `validatePhone`, `validateRequired`, `sanitizeInput` | Validators — Fonctions de validation des entrées |

---

## 14. TYPES (10)

| Fichier | Lignes | Rôle |
|---|---|---|
| `src/types/auth.ts` | 56 | Types pour l'authentification |
| `src/types/client.ts` | 28 | Types pour les clients |
| `src/types/commande.ts` | 74 | Types pour les commandes |
| `src/types/comptabilite.ts` | 79 | Types pour les nouveaux achats et dépenses |
| `src/types/depense.ts` | 28 | Types pour les dépenses |
| `src/types/index.ts` | 58 | Export centralisé de tous les types |
| `src/types/pret.ts` | 52 | Types pour les prêts |
| `src/types/product.ts` | 86 | Types pour les produits |
| `src/types/rdv.ts` | 50 | Types pour les rendez-vous |
| `src/types/sale.ts` | 62 | Types pour les ventes |

Contenu intégral des contrats principaux :

```ts
// src/types/index.ts
// Export centralisé de tous les types

// Types d'authentification
export type {
  User,
  LoginCredentials,
  RegisterCredentials,
  RegistrationData,
  PasswordResetRequest,
  PasswordResetData,
  AuthResponse,
} from './auth';

// Types de clients
export type {
  Client,
  ClientFormData,
  ClientSearchResult,
} from './client';

// Types de produits
export type {
  Product,
  ProductFormData,
} from './product';

// Types de ventes
export type {
  Sale,
  SaleProduct,
  SaleFormData,
} from './sale';

// Types de prêts
export type {
  PretDetail,
  PaiementDetail,
  PretFamille,
  PretProduit,
  PretFamilleFormData,
  PretProduitFormData,
} from './pret';

// Types de dépenses
export type {
  DepenseFixe,
  DepenseDuMois,
  DepenseFormData,
} from './depense';

// Types de commandes
export type {
  Commande,
  CommandeProduit,
  CommandeType,
  CommandeStatut,
  CommandeFormData,
} from './commande';
```

```ts
// src/types/auth.ts
// Types pour l'authentification

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  address?: string;
  phone?: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  phone: string;
  acceptTerms: boolean;
}

export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  phone: string;
  acceptTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
```

```ts
// src/types/client.ts
// Types pour les clients

export interface Client {
  id: string;
  nom: string;
  phone: string; // Rétrocompatibilité: premier numéro (principal)
  phones: string[]; // Tous les numéros de téléphone
  adresse: string; // Rétrocompatibilité: première adresse (principale)
  addresses: string[]; // Toutes les adresses
  ville?: string; // Ville principale (rétrocompatibilité = villes[0])
  villes?: string[]; // Ville par adresse (même index que addresses)
  dateCreation: string;
  photo?: string;
}

export interface ClientFormData {
  nom: string;
  phones: string[];
  addresses: string[];
  ville?: string;
  villes?: string[];
  photo?: File | null;
}

export interface ClientSearchResult {
  clients: Client[];
  total: number;
}
```

```ts
// src/types/product.ts
// Types pour les produits

/**
 * Code-barre obfusqué tel que stocké dans products.json.
 * Le frontend (page Produits) sait le décoder pour afficher un vrai code-barre.
 */
export interface EncodedBarcode {
  v: number;       // version du format
  s: string;       // sel
  p: string[];     // segments encodés
  c: number;       // checksum
}

/**
 * Caractéristique persistée d'un produit.
 * - nom : description du produit
 * - numero : taille extraite (ex: "26")
 * - codeBarre : valeur réelle du code-barre OU forme obfusquée (objet)
 * - code : code produit lisible (ex: P-26-TKEAPJ)
 */
export interface ProductCaracteristique {
  nom: string;
  numero: string;
  codeBarre: string | EncodedBarcode;
  code: string;
}

export interface ProductAchat {
  date: string;
  quantity: number;
  purchasePrice: number;
  fournisseur?: string;
  /** Si false, cette quantité n'est PAS ajoutée au stock vendable (défaut: true) */
  disponible?: boolean;
  /** Lien vers l'enregistrement nouvelle_achat.json (facultatif) */
  nouvelleAchatId?: string;
}

export interface ProductVente {
  date: string;
  quantity: number;
  sellingPrice: number;
}

export interface ProductFournisseurHistory {
  nom: string;
  dateDebut: string;
}

/** Point d'historique du prix de vente unitaire. */
export interface SellingPricePoint {
  price: number;
  date: string;
}


export interface Product {
  id: string;
  code?: string; // Code unique du produit (7 caractères: P/T + chiffres + lettres)
  description: string;
  purchasePrice: number;
  quantity: number;
  sellingPrice?: number;
  profit?: number;
  reserver?: string; // "oui" si le produit est réservé
  photos?: string[]; // URLs des photos du produit (stockées dans /uploads)
  mainPhoto?: string; // URL de la photo principale
  fournisseur?: string; // Nom du fournisseur
  caracteristique?: ProductCaracteristique;
  dateAchat?: string; // Date du premier achat
  achats?: ProductAchat[]; // Historique des achats
  ventes?: ProductVente[]; // Historique des ventes
  fournisseursHistory?: ProductFournisseurHistory[]; // Chronologie des fournisseurs
  sellingPriceHistory?: SellingPricePoint[]; // Évolution du prix de vente unitaire
}


export interface ProductFormData {
  description: string;
  purchasePrice: number;
  quantity: number;
  sellingPrice?: number;
  fournisseur?: string;
  dateAchat?: string;
  newPurchase?: ProductAchat;
}
```

```ts
// src/types/sale.ts
// Types pour les ventes

export interface SaleProduct {
  productId: string;
  description: string;
  quantitySold: number;
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
  deliveryFee?: number;
  deliveryLocation?: string;
  /** Montant ou pourcentage saisi pour la réduction */
  reduction?: number;
  /** Type de réduction: 'amount' (par unité) ou 'percent' (% du PU) */
  reductionType?: '' | 'amount' | 'percent';
  /** Prix de vente total AVANT application de la réduction */
  sellingPriceBeforeReduction?: number;
  /** Montant total de réduction appliquée */
  reductionAmount?: number;
  /** Tarif standard de la ville (avant ajustement) */
  originalDeliveryFee?: number;
  /** Ajustement appliqué sur les frais (- réduction / + augmentation) */
  deliveryFeeAdjustment?: number;
}

export interface Sale {
  id: string;
  date: string;
  // Nouvelle structure multi-produits
  products?: SaleProduct[];
  totalPurchasePrice?: number;
  totalSellingPrice?: number;
  totalProfit?: number;
  totalDeliveryFee?: number;
  // Ancien format pour compatibilité
  productId?: string;
  description?: string;
  quantitySold?: number;
  purchasePrice?: number;
  sellingPrice?: number;
  profit?: number;
  deliveryFee?: number;
  // Informations client
  clientName?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientVille?: string;
  // Informations d'avance
  reste?: number;
  nextPaymentDate?: string;
  // Remboursement
  isRefund?: boolean;
  originalSaleId?: string;
}

export interface SaleFormData {
  date: string;
  products: SaleProduct[];
  clientName?: string;
  clientAddress?: string;
  clientPhone?: string;
}
```

```ts
// src/types/commande.ts
// Types pour les commandes

export type CommandeReductionType = '' | 'amount' | 'percent';

export interface CommandeProduit {
  nom: string;
  prixUnitaire: number;
  quantite: number;
  prixVente: number;
  /** Réduction appliquée à la ligne (facultatif) */
  reduction?: number;
  reductionType?: CommandeReductionType;
  /** Livraison */
  deliveryLocation?: string;
  deliveryFee?: number;
  /** Frais de base de la ville (avant override) */
  baseDeliveryFee?: number;
}

export type CommandeType = 'commande' | 'reservation' | 'rdv';
export type CommandeStatut = 'en_attente' | 'en_route' | 'arrive' | 'valide' | 'annule' | 'reporter' | 'ulterieur';

export interface Commande {
  id: string;
  clientNom: string;
  clientPhone: string;
  clientAddress: string;
  type: CommandeType;
  produits: CommandeProduit[];
  dateCommande: string;
  dateArrivagePrevue?: string;
  dateEcheance?: string;
  horaire?: string;
  horaireFin?: string;
  statut: CommandeStatut;
  notificationEnvoyee?: boolean;
  createdAt?: string;
  updatedAt?: string;
  saleId?: string;
  overdueTimerStart?: string;
  clientCaracteristique?: string;
  /** Id du RDV lié dans rdv-taches.json (si type 'rdv') */
  rdvTacheId?: string;
  /** Réservation ultérieure : purge auto après 10j si pas de bascule */
  reservationUlterieure?: boolean;
  /** Date/heure ISO d'expiration (10 jours après création si ulterieur) */
  expiresAt?: string;
  /** Date choisie pour la réservation ultérieure (facultative, <= +10j) */
  ulterieurDate?: string;
  /** Dernière notification 24h envoyée */
  ulterieurLastNotifiedAt?: string;
  /** Traçabilité de l'enregistrement */
  enregistreLe?: string;
  createdByName?: string;
  createdById?: string;
  /** Réservation créée à moins de 24h de l'échéance : RDV maintenu automatiquement */
  confirmationAuto?: boolean;
}


export interface CommandeFormData {
  clientNom: string;
  clientPhone: string;
  clientAddress: string;
  type: CommandeType;
  produits: CommandeProduit[];
  dateArrivagePrevue?: string;
  dateEcheance?: string;
  horaire?: string;
  horaireFin?: string;
  reservationUlterieure?: boolean;
  ulterieurDate?: string;
  expiresAt?: string;
}
```

```ts
// src/types/rdv.ts
// Types pour les rendez-vous
export interface RDV {
  id: string;
  titre: string;
  description?: string;
  clientNom: string;
  clientTelephone?: string;
  clientAdresse?: string;
  date: string; // Format: YYYY-MM-DD
  heureDebut: string; // Format: HH:mm
  heureFin: string; // Format: HH:mm
  lieu?: string;
  statut: 'planifie' | 'confirme' | 'annule' | 'termine' | 'reporte';
  // Informations produit (si créé depuis une réservation)
  produits?: RDVProduit[];
  // Lien avec la commande/réservation
  commandeId?: string;
  // Notifications
  notificationEnvoyee?: boolean;
  rappelEnvoye?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RDVProduit {
  nom: string;
  quantite: number;
  prixUnitaire: number;
  prixVente: number;
}

export type RDVFormData = Omit<RDV, 'id' | 'createdAt' | 'updatedAt'> & {
  notes?: string;
};

export interface RDVConflict {
  rdv: RDV;
  message: string;
}

// Type pour créer un RDV depuis une réservation
export interface RDVFromReservation {
  clientNom: string;
  clientTelephone: string;
  clientAdresse: string;
  date: string;
  horaire: string;
  produits: RDVProduit[];
  commandeId: string;
}
```

```ts
// src/types/pret.ts
// Types pour les prêts

export interface PretDetail {
  date: string;
  montant: number;
}

export interface PaiementDetail {
  date: string;
  montant: number;
}

export interface PretFamille {
  id: string;
  nom: string;
  pretTotal: number;
  soldeRestant: number;
  dernierRemboursement: number;
  dateRemboursement: string;
  remboursements?: PaiementDetail[];
  prets?: PretDetail[];
}

export interface PretProduit {
  id: string;
  description: string;
  nom?: string;
  date: string;
  datePaiement?: string;
  phone?: string;
  prixVente: number;
  avanceRecue: number;
  reste: number;
  estPaye: boolean;
  productId?: string;
  paiements?: PaiementDetail[];
}

export interface PretFamilleFormData {
  nom: string;
  pretTotal: number;
}

export interface PretProduitFormData {
  description: string;
  nom: string;
  date: string;
  datePaiement?: string;
  phone?: string;
  prixVente: number;
  avanceRecue: number;
}
```

```ts
// src/types/depense.ts
// Types pour les dépenses

export interface DepenseFixe {
  free: number;
  internetZeop: number;
  assuranceVoiture: number;
  autreDepense: number;
  assuranceVie: number;
  total: number;
}

export interface DepenseDuMois {
  id: string;
  description: string;
  categorie: string;
  date: string;
  debit: string;
  credit: string;
  solde: number;
}

export interface DepenseFormData {
  description: string;
  categorie: string;
  date: string;
  debit: string;
  credit: string;
}
```

```ts
// src/types/comptabilite.ts
// Types pour les nouveaux achats et dépenses

export interface NouvelleAchat {
  id: string;
  date: string;
  productId?: string;
  productDescription: string;
  purchasePrice: number;
  quantity: number;
  fournisseur: string;
  caracteristiques: string;
  totalCost: number;
  type: 'achat_produit' | 'taxes' | 'carburant' | 'autre_depense';
  description?: string;
  categorie?: string;
  /** URL relative (ex: /uploads/depense/recu-xxx.pdf) du reçu de dépense — facultatif */
  receiptUrl?: string | null;
  /** Indique si la quantité de cet achat est disponible à la vente (défaut: true) */
  disponible?: boolean;
  /** Index de l'achat dans product.achats (rempli côté serveur à la création) */
  productAchatIndex?: number | null;
}

export interface NouvelleAchatFormData {
  productId?: string;
  productDescription: string;
  purchasePrice: number;
  /** Prix de vente unitaire (persisté dans products.json) — facultatif */
  sellingPrice?: number;
  quantity: number;
  fournisseur?: string;
  caracteristiques?: string;
  date?: string;
  /** Disponibilité de l'achat (défaut: true). Si false, la quantité n'est PAS vendable. */
  disponible?: boolean;
  /** URL de la facture d'achat déjà uploadée — facultatif */
  receiptUrl?: string | null;
}

export interface DepenseFormData {
  description: string;
  montant: number;
  type: 'taxes' | 'carburant' | 'autre_depense';
  categorie?: string;
  date?: string;
  /** URL du reçu déjà uploadé (utilisée côté backend lors de l'enregistrement) */
  receiptUrl?: string | null;
}

export interface MonthlyStats {
  totalAchats: number;
  totalDepenses: number;
  achatsCount: number;
  depensesCount: number;
  totalGeneral: number;
  byType: Record<string, { total: number; count: number }>;
}

export interface YearlyStats extends MonthlyStats {
  byMonth: Record<number, { achats: number; depenses: number }>;
}

export interface ComptabiliteData {
  // Données des ventes
  salesTotal: number;
  salesProfit: number;
  salesCost: number;
  salesCount: number;
  
  // Données des achats/dépenses
  achatsTotal: number;
  depensesTotal: number;
  
  // Calculs finaux
  beneficeReel: number;
  totalDebit: number;
  totalCredit: number;
  soldeNet: number;
}
```

---

## 15. TESTS (22)

| Fichier | Lignes | Rôle |
|---|---|---|
| `src/tests/components/ClientsPage.test.tsx` | 147 | Mock des services directement dans vi.mock pour éviter les problèmes de hoisting |
| `src/tests/components/StatCard.test.tsx` | 79 | Importation des utilitaires de test React Testing Library pour le rendu et la recherche d'éléments |
| `src/tests/components/dashboard/AddSaleForm.test.tsx` | 95 | Mock des services |
| `src/tests/components/dashboard/Inventaire.test.tsx` | 88 | Mock des services |
| `src/tests/components/dashboard/VentesProduits.test.tsx` | 52 | Mock des services |
| `src/tests/components/layout/Header.test.tsx` | 77 | Mock du hook useAuth |
| `src/tests/components/ui/Button.test.tsx` | 54 | Importation de React pour les références |
| `src/tests/components/ui/Card.test.tsx` | 343 | Test unitaire complet des composants Card UI |
| `src/tests/components/ui/Input.test.tsx` | 107 |  |
| `src/tests/e2e/complete-user-journey.test.ts` | 181 | Mock Playwright since it's not available in the test environment |
| `src/tests/e2e/userJourney.test.ts` | 231 | Mock Playwright pour les tests E2E sans installation |
| `src/tests/hooks/useAuth.test.tsx` | 106 | Mock the auth service |
| `src/tests/hooks/useBusinessCalculations.test.tsx` | 153 | Importation de renderHook pour tester les hooks React |
| `src/tests/hooks/useClientSync.test.tsx` | 59 | Mock the realtime service |
| `src/tests/hooks/useRealtimeSync.test.tsx` | 36 | Mock the app context |
| `src/tests/integration/SalesWorkflow.test.tsx` | 245 | Mock des services directement dans vi.mock pour éviter les problèmes de hoisting |
| `src/tests/performance/performance.test.ts` | 196 | Mock performance APIs |
| `src/tests/services/BusinessCalculationService.test.ts` | 284 | Importation des fonctions de test Vitest |
| `src/tests/services/ClientService.test.ts` | 301 | Mock des données |
| `src/tests/services/FormatService.test.ts` | 167 | Use regex to handle different space characters (regular space and narrow no-break space) |
| `src/tests/setup.ts` | 27 | Fichier de configuration pour les tests - importe les matchers Jest DOM |
| `src/tests/utils/testMocks.ts` | 62 | Mock services créés directement ici pour éviter les problèmes de hoisting |

Vitest + Testing Library + jsdom, configuration dans `vitest.config.ts` et `src/tests/setup.ts`,
mocks partagés dans `src/tests/utils/testMocks.ts`.

---

## 16. ASSETS & PUBLIC

| Fichier | Lignes | Rôle |
|---|---|---|
| `src/assets/logo.png` | 10938 |  |

Fichiers publics : `public/images/Riziky.png`, `public/images/favicon.ico`, `public/images/logo.ico`, `public/images/noise.svg`, `public/placeholder.svg`, `public/robots.txt`, `public/sitemap.xml`.

---

## 17. BACKEND — `server/server.js`

Montage des préfixes API (à reproduire tel quel) :

- `/api/auth` → `authRoutes`
- `/api/products` → `productRoutes`
- `/api/products-vendu` → `productsVenduRoutes`
- `/api/sales` → `salesRoutes`
- `/api/fidelite` → `fideliteRoutes`
- `/api/listes-fidelite` → `listesFideliteRoutes`
- `/api/clients` → `clientRoutes`
- `/api/clients-villes` → `clientsVillesRoutes`
- `/api/livraison-villes` → `livraisonVilleRoutes`
- `/api/pretfamilles` → `pretFamillesRoutes`
- `/api/pretproduits` → `pretProduitsRoutes`
- `/api/depenses` → `depensesRoutes`
- `/api/versements` → `versementRoutes`
- `/api/banks` → `banksRoutes`
- `/api/epargne` → `epargneRoutes`
- `/api/prix-products` → `prixProductsRoutes`
- `/api/sync` → `syncRoutes`
- `/api/benefices` → `beneficesRoutes`
- `/api/messages` → `messagesRoutes`
- `/api/commandes` → `commandesRoutes`
- `/api/rdv` → `rdvRoutes`
- `/api/rdv-notifications` → `rdvNotificationsRoutes`
- `/api/objectif` → `objectifRoutes`
- `/api/nouvelle-achat` → `nouvelleAchatRoutes`
- `/api/compta` → `comptaRoutes`
- `/api/remboursements` → `remboursementsRoutes`
- `/api/fournisseurs` → `fournisseursRoutes`
- `/api/entreprises` → `entrepriseRoutes`
- `/api/pointages` → `pointageRoutes`
- `/api/pointages-auto` → `pointageAutoRoutes`
- `/api/pointages-deleted` → `pointageDeletedRoutes`
- `/api/pointages-auto-sessions` → `pointageAutoSessionsRoutes`
- `/api/pointages-auto-declanche` → `pointageAutoDeclancheRoutes`
- `/api/travailleurs` → `travailleurRoutes`
- `/api/taches` → `tacheRoutes`
- `/api/taches-rdv` → `tachesRdvRoutes`
- `/api/rdv-taches` → `rdvTachesRoutes`
- `/api/notes` → `notesRoutes`
- `/api/notes-share` → `notesShareRoutes`
- `/api/share-links` → `shareLinksRoutes`
- `/api/avances` → `avanceRoutes`
- `/api/profile` → `profileRoutes`
- `/api/messagerie` → `messagerieRoutes`
- `/api/settings` → `settingsRoutes`
- `/api/indisponible` → `indisponibleRoutes`
- `/api/module-settings` → `moduleSettingsRoutes`
- `/api/parametres` → `parametresRoutes`
- `/api/encryption` → `encryptionRoutes`
- `/api/share-comments` → `shareCommentsRoutes`
- `/api/product-comments` → `productCommentsRoutes`
- `/api/maintenance` → `maintenanceRoutes`
- `/api/prepa-livraison` → `prepaLivraisonRoutes`
- `/api/confirmation-rdv` → `confirmationRdvRoutes`
- `/api/historique-connexion` → `historiqueConnexionRoutes`
- `/api/availability` → `require`
- `/api/blockage-ip` → `require`
- `/api/connecte-profil-unique` → `require`
- `/api/modele-produits` → `productAttributeRoutes`
- `/api/taille-produits` → `productAttributeRoutes`
- `/api/couleur-produits` → `productAttributeRoutes`
- `/api/devant-produits` → `productAttributeRoutes`
- `/api/autres-produits` → `productAttributeRoutes`
- `/api/attribut-kinds` → `require`

### 17.1 Routes (59)

| Fichier | Lignes | Rôle |
|---|---|---|
| `server/routes/attributKinds.js` | 211 | Routes API pour la gestion dynamique des ATTRIBUTS PRODUIT. - Un "kind" (type d'attribut) est stocké dans server/db/attribut_kinds.json. - Chaque kind… |
| `server/routes/auth.js` | 359 | auth.js - Routes d'authentification Gestion de la connexion, inscription et réinitialisation de mot de passe. Inclut : rate limiting, blocage après N … |
| `server/routes/availability.js` | 159 | availability.js - Créneaux disponibles agrégés (commandes + rdv-taches + tâches) GET /api/availability/slots?date=YYYY-MM-DD[&excludeCommandeId=xxx] →… |
| `server/routes/avance.js` | 42 | avance.js - Routes API pour la gestion des avances sur salaire CRUD pour les avances versées aux travailleurs. |
| `server/routes/banks.js` | 66 | banks.js - Routes API pour la gestion des banques (bank.json) |
| `server/routes/benefices.js` | 147 | benefices.js - Routes API pour le calcul et suivi des bénéfices Gestion des marges, bénéfices nets et rapports financiers. |
| `server/routes/blockageIp.js` | 92 | ============================================================================= Routes Blocage IP ======================================================… |
| `server/routes/clients.js` | 320 | clients.js - Routes API pour la gestion des clients CRUD complet avec upload de photo, recherche et filtrage. |
| `server/routes/clientsVilles.js` | 81 | clientsVilles.js - Routes API pour la liste des villes des clients |
| `server/routes/commandes.js` | 105 | commandes.js - Routes API pour la gestion des commandes fournisseurs CRUD complet pour les commandes avec : - Création et suivi des commandes fourniss… |
| `server/routes/compta.js` | 101 | compta.js - Routes API pour la comptabilité Gestion des écritures comptables, soldes et rapports financiers. |
| `server/routes/confirmationRdv.js` | 123 | Routes Confirmation RDV Snapshot des rendez-vous dans les prochaines 24h + statut de confirmation. Statut: 'en_attente' / 'maintenu' / 'annule' / 'rep… |
| `server/routes/connecteProfilUnique.js` | 27 | ============================================================================= Routes — /api/connecte-profil-unique ===================================… |
| `server/routes/depenses.js` | 176 | depenses.js - Routes API pour la gestion des dépenses mensuelles CRUD pour les dépenses avec catégorisation et suivi mensuel. |
| `server/routes/encryption.js` | 171 | Routes pour la gestion du cryptage des données |
| `server/routes/entreprise.js` | 64 | entreprise.js - Routes API pour la gestion des entreprises (pointage) CRUD pour les entreprises associées au système de pointage. |
| `server/routes/epargne.js` | 422 | epargne.js - Routes API pour les comptes d'épargne - Un fichier de base de données par propriétaire : db/compte-<NOM>.json - Un index chiffré : db/com… |
| `server/routes/fidelite.js` | 36 | Routes de fidélité client. GET /api/fidelite         -> map complet GET /api/fidelite/:name   -> entrée pour un client POST /api/fidelite/rebuild -> r… |
| `server/routes/fournisseurs.js` | 65 | Routes API pour les fournisseurs GET  /api/fournisseurs          → Liste complète GET  /api/fournisseurs/search?q= → Recherche par nom POST /api/fourn… |
| `server/routes/historiqueConnexion.js` | 120 | historiqueConnexion.js - Historique des connexions et visites du site. Enregistre chaque tentative de connexion (succès / échec / bloqué) et chaque vi… |
| `server/routes/indisponible.js` | 248 | Routes Indisponibilité - Gestion des jours/heures indisponibles Supporte la récurrence (hebdomadaire) avec groupId |
| `server/routes/listesFidelite.js` | 48 | Routes CRUD des paliers de fidélité (listes-fidelite.json). Chaque modification déclenche un rebuild de fidelite.json pour resynchroniser les tiers de… |
| `server/routes/livraisonVille.js` | 89 | livraisonVille.js - Routes API pour les villes de livraison avec frais |
| `server/routes/maintenance.js` | 241 | Routes Maintenance - GET  /api/maintenance/status      : public - PUT  /api/maintenance/toggle      : admin principale - POST /api/maintenance/check-a… |
| `server/routes/messagerie.js` | 975 | messagerie.js - Routes API pour le système de messagerie/chat en temps réel Chat admin avec conversations, SSE pour temps réel, et historique des mess… |
| `server/routes/messages.js` | 104 | messages.js - Routes API pour la messagerie interne Gestion des messages internes avec compteur de non-lus et marquage. |
| `server/routes/moduleSettings.js` | 91 | Routes Module Settings - Paramètres spécifiques par module |
| `server/routes/notes.js` | 222 | notes.js - Routes API pour la gestion des notes (post-its) CRUD pour les notes avec support de colonnes, dessins et mémos vocaux. |
| `server/routes/notesShare.js` | 113 | notesShare.js - Routes API pour le partage des notes via token Ce module gère le partage en lecture seule des notes : - POST /generate : Génère un tok… |
| `server/routes/nouvelleAchat.js` | 240 | nouvelleAchat.js - Routes API pour la gestion des achats/approvisionnements CRUD pour les nouveaux achats de stock avec calcul du prix de revient. |
| `server/routes/objectif.js` | 107 | objectif.js - Routes API pour la gestion des objectifs de ventes Définition et suivi des objectifs mensuels/annuels avec calcul de progression. |
| `server/routes/parametres.js` | 72 | Routes Prix Pointage & Paramètre Tâches |
| `server/routes/pointage.js` | 97 | pointage.js - Routes API pour la gestion du pointage des travailleurs CRUD complet pour les entrées de pointage (heures travaillées, montants, entrepr… |
| `server/routes/pointageAuto.js` | 104 | ============================================================================= Routes Pointage Automatique ============================================… |
| `server/routes/pointageAutoDeclanche.js` | 137 | ============================================================================= Routes Pointage Auto Déclenché — PERSISTENCE DU CHRONO MULTI-ADMIN =====… |
| `server/routes/pointageAutoSessions.js` | 146 | ============================================================================= Routes Pointage Auto Sessions — Synchronisation multi-admin ============… |
| `server/routes/pointageDeleted.js` | 88 | ============================================================================= Routes Pointage Deleted (empreintes) ===================================… |
| `server/routes/prepaLivraison.js` | 104 | Routes Préparation Livraison Stocke un snapshot des commandes/réservations (en_attente, valide, annule, reporter) + l'état de préparation (termine, st… |
| `server/routes/pretfamilles.js` | 103 | Route pour obtenir tous les prêts familles |
| `server/routes/pretproduits.js` | 140 | Route pour obtenir tous les prêts produits |
| `server/routes/prixproducts.js` | 139 | prixproducts.js - Routes API pour l'historique des prix d'achat Enregistre chaque variation de prix d'achat (augmentation, diminution, stable) avec to… |
| `server/routes/productAttributes.js` | 53 | Routes API pour les attributs produits : /api/modele-produits, /api/taille-produits, /api/couleur-produits, /api/devant-produits Toutes utilisent la m… |
| `server/routes/productComments.js` | 107 | productComments.js - Routes API pour les commentaires sur les produits CRUD pour les commentaires associés aux produits (avis, notes internes). |
| `server/routes/products.js` | 564 | products.js - Routes API pour la gestion des produits CRUD complet pour les produits avec support de : - Upload d'images produit - Gestion du stock (e… |
| `server/routes/productsVendu.js` | 132 | productsVendu.js — Liste des produits par volume de ventes Agrège les ventes depuis sales.json et les stocks depuis products.json pour produire une li… |
| `server/routes/profile.js` | 281 | profile.js - Routes API pour la gestion du profil utilisateur Modification des informations personnelles, photo de profil, changement de mot de passe … |
| `server/routes/rdv.js` | 233 | rdv.js - Routes API pour la gestion des rendez-vous CRUD complet avec notifications, rappels et lien avec les clients. |
| `server/routes/rdvNotifications.js` | 137 | Get all notifications |
| `server/routes/rdvTaches.js` | 248 | rdvTaches.js - RDV liés aux tâches de coiffure (tissages, tresses, perruques, etc.) Stocke dans server/db/rdv-taches.json Champs : id, personneId, per… |
| `server/routes/remboursements.js` | 218 | remboursements.js - Routes API pour la gestion des remboursements clients CRUD pour les remboursements avec suivi des statuts et historique. |
| `server/routes/sales.js` | 670 | sales.js - Routes API pour la gestion des ventes CRUD complet pour les ventes avec : - Enregistrement de ventes (produits, quantités, prix) - Mise à j… |
| `server/routes/settings.js` | 1178 | ============================================================================= Routes Paramètres - Gestion des données et configuration ===============… |
| `server/routes/shareComments.js` | 517 | shareComments.js - Routes API pour les commentaires sur les liens partagés Ce module gère le cycle de vie complet des commentaires : Stockage : - lien… |
| `server/routes/shareLinks.js` | 329 | shareLinks.js - Routes API pour la gestion des liens de partage sécurisés Permet de créer des liens de partage pour les données (pointage, tâches, not… |
| `server/routes/sync.js` | 183 | sync.js - Routes API pour la synchronisation en temps réel (SSE) Gère les Server-Sent Events pour notifier les clients des changements de données. |
| `server/routes/tache.js` | 165 | tache.js - Routes API pour la gestion des tâches CRUD complet pour les tâches avec support de : - Création, modification, suppression de tâches - Marq… |
| `server/routes/tachesRdv.js` | 64 | tachesRdv.js - Catalogue des types de tâches RDV (tissage, tresse, perruque, etc.) Stocke dans server/db/taches-rdv.json |
| `server/routes/travailleur.js` | 74 | travailleur.js - Routes API pour la gestion des travailleurs CRUD pour les travailleurs utilisés dans le pointage et les tâches. |
| `server/routes/versement.js` | 130 | versement.js - Routes API pour la gestion des versements espèce Stocke les versements espèce et le montant maximum mensuel autorisé. Calcul "fenêtre g… |

### 17.2 Contrôleurs (19)

| Fichier | Lignes | Rôle |
|---|---|---|
| `server/controllers/authController.js` | 241 | ============================================================================= Contrôleur Authentification - Logique métier de connexion/inscription ==… |
| `server/controllers/beneficeController.js` | 65 | ============================================================================= Contrôleur Bénéfices - Logique métier des calculs de bénéfices =========… |
| `server/controllers/clientController.js` | 154 | ============================================================================= Contrôleur Clients - Logique métier CRUD des clients ===================… |
| `server/controllers/commandeController.js` | 49 | ============================================================================= Contrôleur Commandes - Logique métier des commandes/réservations =======… |
| `server/controllers/comptaController.js` | 67 | ComptaController — Logique métier pour la comptabilité |
| `server/controllers/connecteProfilUniqueController.js` | 550 | ============================================================================= Controller — ConnecteProfilUnique (session unique par profil) ==========… |
| `server/controllers/crudControllers.js` | 201 | ============================================================================= Contrôleurs CRUD simples - Entités secondaires =========================… |
| `server/controllers/depenseController.js` | 84 | ============================================================================= Contrôleur Dépenses - Logique métier des mouvements financiers =========… |
| `server/controllers/index.js` | 24 | ============================================================================= Index des contrôleurs — Export centralisé ==============================… |
| `server/controllers/messageController.js` | 49 | ============================================================================= Contrôleur Messages - Logique métier des messages contact ==============… |
| `server/controllers/objectifController.js` | 46 | ============================================================================= Contrôleur Objectif - Logique métier des objectifs de vente ============… |
| `server/controllers/pointageController.js` | 58 | ============================================================================= Contrôleur Pointage - Logique métier du suivi temps ====================… |
| `server/controllers/pretFamilleController.js` | 61 | PretFamilleController — Logique métier pour les prêts famille |
| `server/controllers/pretProduitController.js` | 82 | PretProduitController — Logique métier pour les prêts produits |
| `server/controllers/productController.js` | 176 | ============================================================================= Contrôleur Produits - Logique métier CRUD des produits =================… |
| `server/controllers/rdvController.js` | 113 | ============================================================================= Contrôleur RDV - Logique métier des rendez-vous ========================… |
| `server/controllers/remboursementController.js` | 154 | RemboursementController — Logique métier pour les remboursements |
| `server/controllers/saleController.js` | 137 | ============================================================================= Contrôleur Ventes - Logique métier CRUD des ventes =====================… |
| `server/controllers/tacheController.js` | 102 | ============================================================================= Contrôleur Tâches - Logique métier du planning des tâches ==============… |

### 17.3 Modèles (29)

| Fichier | Lignes | Rôle |
|---|---|---|
| `server/models/Avance.js` | 59 |  |
| `server/models/Benefice.js` | 97 | Initialize JSON file if it doesn't exist |
| `server/models/BlockageIp.js` | 137 | ============================================================================= Modèle BlockageIp — liste des adresses IP bloquées =====================… |
| `server/models/Client.js` | 228 | Normalise un client pour s'assurer que phones/addresses sont toujours des tableaux. Gère la rétrocompatibilité avec les anciens champs "phone" / "adre… |
| `server/models/Commande.js` | 57 |  |
| `server/models/Compta.js` | 198 | Initialiser le fichier s'il n'existe pas |
| `server/models/ConnecteProfilUnique.js` | 160 | ============================================================================= Model — ConnecteProfilUnique (db/connecte-profil-unique.json) ==========… |
| `server/models/DepenseDuMois.js` | 482 | Fonction pour lire toutes les données de la base |
| `server/models/Entreprise.js` | 75 |  |
| `server/models/Fidelite.js` | 111 | Fidelite - Modèle pour la fidélité client. Recalcule depuis sales.json et persiste dans fidelite.json. Structure: { [nomClientNormalise]: { name, coun… |
| `server/models/Fournisseur.js` | 104 | Modèle Fournisseur - CRUD pour fournisseurs.json Gère la liste des fournisseurs enregistrés. Un fournisseur est automatiquement créé lors d'un achat s… |
| `server/models/ListesFidelite.js` | 118 | ListesFidelite - CRUD sur listes-fidelite.json (paliers de fidélité configurables). Chaque palier: { id, label, min, max/null, order, grad }. max=null… |
| `server/models/Message.js` | 108 |  |
| `server/models/Note.js` | 221 |  |
| `server/models/NouvelleAchat.js` | 495 | Initialiser le fichier s'il n'existe pas |
| `server/models/Objectif.js` | 637 |  |
| `server/models/Pointage.js` | 119 |  |
| `server/models/PretFamille.js` | 122 | Fonction pour lire tous les prêts familles |
| `server/models/PretProduit.js` | 143 | Fonction pour lire tous les prêts produits |
| `server/models/Product.js` | 757 | ============================================ CARACTERISTIQUE : extraction + obfuscation du code-barre ============================================ |
| `server/models/ProductAttribute.js` | 56 | ProductAttribute - Factory générique pour attributs de produit (modele, taille, couleur, devant). Chaque attribut est stocké dans son propre fichier J… |
| `server/models/ProductComment.js` | 105 |  |
| `server/models/Rdv.js` | 244 | Ensure the file exists |
| `server/models/RdvNotification.js` | 242 | Ensure the file exists |
| `server/models/Remboursement.js` | 62 |  |
| `server/models/Sale.js` | 321 | Get all sales |
| `server/models/Tache.js` | 374 |  |
| `server/models/Travailleur.js` | 90 |  |
| `server/models/User.js` | 161 | Get all users Helper to safely get users array |

### 17.4 Middlewares (12)

| Fichier | Lignes | Rôle |
|---|---|---|
| `server/middleware/auth.js` | 43 | ============================================================================= Middleware d'authentification JWT ======================================… |
| `server/middleware/dbHelper.js` | 38 | dbHelper — Centralized JSON database read/write with encryption support All models should use these functions instead of direct fs.readFileSync/writeF… |
| `server/middleware/encryption.js` | 329 | Middleware de cryptage/décryptage transparent des données JSON Utilise AES-256-CBC pour chiffrer toutes les données stockées dans les fichiers JSON. L… |
| `server/middleware/ipBlocklist.js` | 51 | ============================================================================= Middleware global de blocage d'IP ======================================… |
| `server/middleware/patchDbIO.js` | 159 | patchDbIO — Monkey-patches fs.readFileSync and fs.writeFileSync to transparently encrypt/decrypt JSON files in the server/db/ directory. This must be … |
| `server/middleware/security.js` | 355 | Middleware de sécurité pour le serveur Express Inclut: Rate limiting, validation, sanitization, headers sécurisés |
| `server/middleware/sync.js` | 542 |  |
| `server/middleware/threatShield.js` | 565 | ============================================================================= threatShield.js — Bouclier adaptatif anti-intrusion (moteur heuristique)… |
| `server/middleware/upload.js` | 107 | Ensure uploads directory exists |
| `server/middleware/uploadAchat.js` | 48 | uploadAchat.js — Multer middleware spécialisé pour les factures d'achats produits - Accepte images (jpg/jpeg/png/gif/webp) ET PDF - Stocke les fichier… |
| `server/middleware/uploadDepense.js` | 49 | uploadDepense.js — Multer middleware spécialisé pour les reçus de dépenses - Accepte images (jpg/png/gif/webp) ET PDF - Stocke les fichiers dans serve… |
| `server/middleware/validation.js` | 98 | Schémas de validation pour les différentes routes |

### 17.5 Services & configuration serveur

| Fichier | Lignes | Rôle |
|---|---|---|
| `server/services/availabilityService.js` | 90 | ============================================================================= Service de disponibilité - Vérifie les créneaux indisponibles ==========… |
| `server/services/fileService.js` | 70 | ============================================================================= Service de gestion des fichiers JSON - Lecture/écriture sécurisée ======… |
| `server/services/reservationCleanupService.js` | 72 | Service de nettoyage automatique des réservations ultérieures - Purge les réservations avec statut 'ulterieur' passées expiresAt (10 jours) - Fournit … |
| `server/config/jwtSecret.js` | 75 | ============================================================================= jwtSecret.js — Secret JWT fort, généré et persisté automatiquement =====… |
| `server/config/passport.js` | 50 | Local Strategy |
| `server/security/intrusionStore.js` | 138 | intrusionStore — Base de données des intrusions détectées. Toutes les tentatives d'intrusion (signatures, honeypots, scanners, anomalies comportementa… |
| `server/security/keyVault.js` | 105 | keyVault — Coffre-fort local pour la clé de cryptage des données. Objectif : la VRAIE clé de cryptage ne doit JAMAIS apparaître en clair dans `server/… |

---


## 17bis. LOGIQUE DÉTAILLÉE DU BACKEND

Cette section décrit exhaustivement le backend Express (`server/`) : point d'entrée, middlewares de sécurité, chiffrement transparent, synchronisation temps réel, session unique, sauvegarde/restauration, maintenance, liens de partage, modèles et endpoints. Base de données = fichiers JSON dans `server/db/`, chiffrés au repos en AES‑256‑CBC de façon transparente.

### 17bis.1 Point d'entrée — `server/server.js`

Ordre d'initialisation critique :

1. `require('./middleware/patchDbIO')` — **DOIT** être le tout premier require, avant tout modèle, car il monkey-patche `fs.readFileSync` / `fs.writeFileSync` / `fs.promises.readFile` / `fs.promises.writeFile` pour chiffrer/déchiffrer de façon transparente tous les fichiers `.json` de `server/db/`.
2. Chargement d'Express, body-parser, cors, compression, bcryptjs, dotenv.
3. Pile de middlewares globale, dans cet ordre exact :
   - `compression()` — désactivée sur `/api/sync/events` et `/api/messagerie/events` (flux SSE longs).
   - `securityHeadersMiddleware` (headers de sécurité).
   - CORS (`cors(corsOptions)`) — doit être avant le rate limit.
   - `GET /api/health` — sonde de disponibilité publique (retourne `{ ok:true, timestamp }`).
   - Rate limit général (`rateLimitMiddleware('general')`), exempté sur `/api/sync/events`, `/api/messagerie/events`, `/api/connecte-profil-unique/*`.
   - `suspiciousActivityLogger` (logging simple, non bloquant).
   - `threatShield()` — bouclier anti-intrusion (voir 17bis.4).
   - `ipBlocklistMiddleware` — blocage IP globale (voir 17bis.5).
   - `bodyParser.json({limit:'10mb'})` et `urlencoded`.
   - `sanitizeMiddleware` — exempté sur `/api/notes/upload-drawing` et `/api/settings/restore` (payloads volumineux/chiffrés).
4. Création des dossiers `server/db` et `server/uploads` s'ils n'existent pas.
5. Seed automatique de plusieurs fichiers JSON à la première exécution s'ils sont absents (`products.json`, `sales.json`, `clients.json`, `pretfamilles.json`, `pretproduits.json`, `depensedumois.json`, `depensefixe.json`, `benefice.json`, `commandes.json`, `remboursement.json`, `pointageauto.json`) avec des données d'exemple pour certains.
6. Migration automatique des produits : si un produit n'a pas de `code` ou de `caracteristique` (objet), appel de `Product.generateCodesForExistingProducts()`. Couvre première installation, restauration de vieille sauvegarde, ou reset après delete-all.
7. Reconstruction de `fidelite.json` depuis `sales.json` au démarrage (`Fidelite.rebuild()`).
8. Montage de toutes les routes sous `/api/...` (liste complète en 17bis.9).
9. Deux endpoints de supervision sécurité protégés par `authMiddleware` déclarés directement dans `server.js` :
   - `GET /api/security/shield-stats` → statistiques du threat shield.
   - `GET /api/security/intrusions` → journal des intrusions filtrable (`limit`,`severity`,`mode`,`ip`,`since`).
   - `DELETE /api/security/intrusions` → purge du journal, réservé à `administrateur principale`.
10. Service statique `/uploads` avec headers CORS dédiés (permet cross-origin sur les fichiers uploadés).
11. Handler 404 générique JSON, puis handler d'erreurs globales (masque la stack trace en production).
12. Gestion des signaux : `SIGTERM` → arrêt propre ; `uncaughtException` → arrêt (exit 1) ; `unhandledRejection` → log seul.
13. Démarrage de `services/reservationCleanupService` (purge des réservations > 10 jours).
14. `app.listen(PORT)`, `PORT = process.env.PORT || 10000`.

CORS : liste blanche fixe (`localhost:3000/8080/8081`, domaines Render/Vercel/Lovable connus) + toute origine contenant `lovable.app` ou `lovableproject.com` autorisée automatiquement. En production, toute origine hors liste est refusée ; en développement, tout est autorisé par défaut. `credentials:true`.

### 17bis.2 Authentification JWT — `middleware/auth.js` + `controllers/authController.js`

- JWT signé avec un secret obtenu via `config/jwtSecret.js` (`getJwtSecret()`), expiration **8 heures** (`expiresIn: '8h'`).
- Le middleware `authMiddleware` lit `Authorization: Bearer <token>`, vérifie le JWT, recharge l'utilisateur complet depuis `models/User` par `decoded.id`, l'attache à `req.user`. Retourne 401 si token absent/invalide/utilisateur introuvable.
- `POST /api/auth/login` : recherche par email (insensible à la casse). Vérifie que le profil est complet (id/email/firstName/lastName), sinon 401. Anti-brute-force par compte :
  - `maxAttempts = user.nombreConnexion || 5`, `lockoutMinutes = user.tempsBlocage || 15`.
  - Si `lockedUntil` dans le futur → 423 avec `remainingSeconds`.
  - Si le verrou est expiré, réinitialisation silencieuse (`failedAttempts:0, lockedUntil:null`).
  - Mot de passe faux → incrémente `failedAttempts` ; si atteint `maxAttempts`, fixe `lockedUntil = now + lockoutMinutes` et retourne 423 ; sinon 401 avec compteur restant.
  - Succès → reset des compteurs, émission JWT `{id,email}`, exécution best-effort de `Fidelite.rebuild()`.
- `POST /api/auth/register` : vérifie confirmation de mot de passe, `acceptTerms`, longueur mdp ≥ 6, unicité de l'email. Crée l'utilisateur (mot de passe haché bcrypt, salt 10), retourne JWT immédiatement.
- `POST /api/auth/check-email` : retourne existence + état de verrouillage sans authentifier.
- `POST /api/auth/reset-password-request` : vérifie juste l'existence de l'email.
- `POST /api/auth/reset-password` : exige mdp fort (min/maj/chiffre/spécial, ≥6 caractères) et différent de l'ancien (`User.updatePassword` refuse si identique après hash).
- `GET /api/auth/verify` : vérifie un token et renvoie l'utilisateur (sans mot de passe).

Modèle `User` (`models/User.js`, fichier `users.json`) : `_getUsers()` lit toujours un tableau (sécurisé contre blobs chiffrés non déchiffrés). Champs attendus par utilisateur : `id, email, password (hash bcrypt), firstName, lastName, gender, address, phone, role?, specification?, failedAttempts?, lockedUntil?, nombreConnexion?, tempsBlocage?, profilePhoto?`. Rôles connus : absent (utilisateur simple), `administrateur`, `administrateur principale` (accès total, seul à pouvoir gérer maintenance/rôles/suppression totale).

### 17bis.3 Chiffrement transparent des fichiers DB

Deux couches complémentaires :

**a) `middleware/encryption.js`** — logique de chiffrement AES‑256‑CBC :
- Algorithme `aes-256-cbc`, clé dérivée par `crypto.scryptSync(keyString, 'riziky-encryption-salt-2024', 32)`, mise en cache (`derivedKeyCache`).
- Format chiffré sur disque : `{ "__encrypted": true, "iv": "<hex>", "data": "<hex>" }`.
- Fichiers **jamais chiffrés** (`EXCLUDED_FILES`) : `encryption.json`, `auto-sauvegarde.json`, `settings.json`, `moduleSettings.json`.
- Config stockée dans `db/encryption.json` : `{ enabled, activatedAt, keySealed, keyHint, keyFingerprint, keyProtected }` — **la clé en clair n'est jamais persistée** ; elle est scellée via `security/keyVault.js` (AES‑256‑GCM avec une clé maître locale) puis reconstituée en mémoire à la lecture (`getEncryptionConfig()`), avec cache invalidé sur changement de `mtimeMs` du fichier.
- Fonctions exposées : `readJsonDecrypted`, `writeJsonEncrypted`, `encryptAllData(key)`, `decryptAllData(key)`, `reEncryptAllData(oldKey,newKey)`, `isEncrypted`, `shouldEncryptFile`.

**b) `middleware/patchDbIO.js`** — patch global de bas niveau :
- Remplace `fs.readFileSync`/`fs.writeFileSync` (sync) et `fs.promises.readFile`/`writeFile` (async) : si le chemin résolu est dans `server/db/` et que le fichier n'est pas exclu, déchiffre automatiquement à la lecture (si le contenu est `__encrypted` et que la config est active) et chiffre automatiquement à l'écriture (si la config est active et que la donnée n'est pas déjà chiffrée). Garantit que **tous les modèles**, même ceux utilisant directement `fs.*`, bénéficient du chiffrement sans modification.
- Doit être chargé une seule fois, en tout premier, avant tout modèle.

**c) `middleware/dbHelper.js`** — API canonique recommandée pour les modèles : `readDb(fileNameOrPath)` / `writeDb(fileNameOrPath, data)`, qui délèguent à `readJsonDecrypted` / `writeJsonEncrypted`.

**d) `security/keyVault.js`** — coffre-fort de la clé de chiffrement :
- Clé maître 512 bits : priorité à `process.env.MASTER_ENCRYPTION_KEY`, sinon générée aléatoirement et stockée dans `server/security/master.key` (chmod 600, hors de `db/`, jamais sauvegardée/exposée).
- `sealKey(plainKey)` → scelle en AES‑256‑GCM `{v,iv,tag,data}` ; `openKey(sealed)` → déscelle.
- `fingerprint(plainKey)` → empreinte SHA‑256 tronquée (contrôle d'intégrité sans exposer la clé).
- `hint(plainKey)` → indice masqué (1er caractère + points).

**e) Routes `/api/encryption`** (réservées à `administrateur principale`) :
- `GET /status` → `{enabled, hasKey, keyHint, keyFingerprint, keyProtected, activatedAt}`.
- `POST /activate {encryptionKey}` (≥10 caractères) → chiffre tous les fichiers existants puis sauvegarde la config scellée.
- `POST /deactivate {encryptionKey}` → vérifie la clé, désactive la config (pour que les prochaines écritures soient en clair), puis déchiffre tous les fichiers.
- `POST /change-key {currentKey newKey}` (≥10) → `reEncryptAllData` puis sauvegarde nouvelle config.

### 17bis.4 Bouclier anti-intrusion — `middleware/threatShield.js`

Moteur heuristique + comportemental additif (n'altère aucune route). Composants :

- **Signatures d'attaque** (regex pondérées) : SQLi, SQLi tautologie, SQLi DDL, SQLi temporisé, NoSQLi, XSS, path traversal, LFI, RCE shell, SSTI, pollution de prototype, CRLF, désérialisation, SQLi file, XXE. Chaque signature ajoute un poids `w` au score du profil si elle matche l'URL+body+query+params.
- **Honeypots** : liste de chemins de scan connus (`/wp-login.php`, `/.env`, `/.git`, `/phpmyadmin`, etc.) → score +100 si détecté.
- **UA scanners** (`sqlmap`, `nikto`, `nmap`, etc.) → +100 ; UA vide → +12 ; UA headless (`puppeteer`, `curl/`, etc.) sur route `/api/*` → +6.
- **En-têtes anormaux** : `x-forwarded-host` avec valeurs multiples/caractères invalides (hors dev) → +10 ; `transfer-encoding` + `content-length` simultanés (request smuggling) → +60 ; corps > 12 Mo → +25.
- **Extensions suspectes** (`.php`,`.asp`,`.sql`,`.env`, etc.) → +45.
- **Moteur comportemental en ligne** par empreinte (`fingerprint = sha256(ip|ua|accept-language)`, tronqué 24 car.) : apprentissage EWMA du taux de requêtes (`ewmaRate`, `ewmaVar`), calcul d'un z-score. Détecte : rafale anormale (`burst-anomaly`, z>6 et rate>8 après 30 hits) → +18 ; scan de surface (>60 chemins distincts, >40/min) → +35 ; énumération (>25 404) → +30 ; brute-force (≥8 échecs d'auth) → +40.
- **Réponse graduée** : bannissement progressif selon `BAN_LADDER = [1min, 5min, 30min, 6h, 24h]`, incrémenté par profil (`banLevel`). Un ban s'applique à la fois sur le fingerprint et sur l'IP brute (`ip:<ip>`). Retour HTTP 403 avec header `Retry-After` pendant le bannissement.
- **Décroissance périodique** (toutes les 60 s) : le score de chaque profil diminue de 25 ; les profils inactifs > 30 min sont supprimés ; le journal est flush.
- **Mode observation** : en développement (`NODE_ENV !== 'production'`) et IP loopback, jamais de blocage réel (observation seule).
- **Chemins exemptés** du moteur comportemental : `/api/sync/events`, `/api/messagerie/events` (flux longs).
- **Persistance** : état des bans dans `server/security/threat-shield.json` (hors `db/`, non affecté par "supprimer tout"). Journal rotatif (500 dernières entrées) dans `server/security/threat-log.json`.
- **Base de données des intrusions** (`security/intrusionStore.js`, fichier `db/intrusions.json`, donc chiffré/sauvegardé comme les autres données) : chaque incident est enregistré avec IP, UA parsé (navigateur/OS/appareil), méthode, chemin, query, body (redacté sur les clés sensibles), en-têtes filtrés, tags, score, sévérité (`critique/eleve/moyen/faible`), action, durée de ban. Écriture tamponnée (flush tous les 20 événements ou 5 s). `query()` permet filtrage par sévérité/mode/ip/date ; `stats()` calcule les agrégats (top IP, top chemins, top navigateurs, répartition par sévérité, 24h glissantes).
- Supervision exposée via `GET/DELETE /api/security/intrusions` et `GET /api/security/shield-stats` (voir 17bis.1).

### 17bis.5 Blocage IP global — `middleware/ipBlocklist.js` + `models/BlockageIp.js`

- Fichier `db/blockage-ip.json` : `{ "ips": [ { id, ip, reason, active, createdAt, createdBy, updatedAt } ] }`.
- `normalizeIp` : trim, minuscule, retire le préfixe IPv4-mapped `::ffff:`.
- Un blocage est actif par défaut (`entry.active !== false` → compat. anciennes entrées).
- Middleware global `ipBlocklistMiddleware` (monté juste après `threatShield`) : laisse toujours passer OPTIONS et `/api/blockage-ip/check` ; sinon, si l'IP appelante correspond à une entrée **active**, renvoie 403 `{error, blocked:true, ip, reason, message}`.
- Routes `/api/blockage-ip` :
  - `GET /check` (public) → statut de l'IP appelante.
  - `GET /` (auth) → liste + IP courante.
  - `POST /` (auth) → ajoute un blocage (`ip`,`reason`) ; refuse de bloquer sa propre IP ; refuse les doublons.
  - `PUT /:id` (auth) → modifie IP/motif (mêmes contraintes anti-auto-blocage/doublon).
  - `PATCH /:id/active` (auth) → active/désactive un blocage sans le supprimer (`{active:boolean}`).
  - `DELETE /:id` (auth) → supprime par id ou par IP normalisée.

### 17bis.6 Middleware de sécurité générique — `middleware/security.js`

- `RateLimiter` (fenêtre glissante en mémoire) : général 500 req/min, `auth` 10 req/min, `strict` 5 req/min. Nettoyage périodique toutes les 60 s. `rateLimitMiddleware(type)` ajoute `X-RateLimit-Remaining`, renvoie 429 + `Retry-After` si dépassé ; jamais appliqué aux requêtes `OPTIONS`.
- `sanitizeMiddleware` : nettoie récursivement `req.body/query/params` — supprime `<`,`>`, `javascript:`, gestionnaires `on...=`, `data:`, tronque chaînes à 10000 caractères, tableaux à 1000 éléments, objets à 100 clés, profondeur max 5.
- `securityHeadersMiddleware` : `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, retire `X-Powered-By`, `Referrer-Policy: no-referrer`, `Permissions-Policy` étendue (désactive geoloc/caméra/micro/etc.), `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-site`. CSP stricte (`default-src 'none'`) sauf pour les routes servant du contenu (`/uploads`, `/share`, `/comment`) où une CSP plus permissive est appliquée (styles/scripts inline autorisés). `Strict-Transport-Security` uniquement en production.
- `validateRequest(schema)` : middleware factory utilisant `validators` (email, phone, password, id, text, number, date, boolean) et les schémas de `middleware/validation.js` (login, register, resetPassword, product, sale, client, message, rdv, commande, depense, pretFamille, pretProduit). Utilisé notamment sur `/api/auth/login` et `/api/auth/register`.
- `suspiciousActivityLogger` : détection légère (path traversal, XSS, SQLi, opérateurs Mongo) → log console uniquement, ne bloque jamais.

### 17bis.7 Synchronisation temps réel (SSE) — `middleware/sync.js` + `routes/sync.js`

Singleton `SyncManager` :

- **Surveillance de fichiers** (`fs.watch`) sur une liste fixe de fichiers `db/*.json` incluant `products.json, sales.json, pretfamilles.json, pretproduits.json, depensedumois.json, depensefixe.json, nouvelle_achat.json, clients.json, messages.json, rdv.json, rdv-taches.json, rdvNotifications.json, remboursement.json, commandes.json, historique-connexion.json`. À chaque changement réel (comparaison de hash JSON, pas juste mtime), notifie tous les clients SSE via l'événement `data-changed` avec `{type, data, timestamp, file}`. Les ventes (`sales`) sont filtrées sur le mois courant avant envoi (`filterCurrentMonthSales`).
- **Endpoint SSE** `GET /api/sync/events` (public, pas d'auth) : headers SSE stricts (`text/event-stream`, `no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no`), heartbeat toutes les 30 s, timeout de sécurité à 5 minutes, cleanup sur `close/end/error`. À la connexion, envoie immédiatement l'état courant de tous les fichiers surveillés.
- **`POST /api/sync/force-sync`** (auth) : diffuse un événement `force-sync` à tous les clients connectés.
- **`GET /api/sync/status`** (public) : calcule un hash SHA‑256 du contenu JSON normalisé de chaque fichier `db/*.json` (sauf `settings.json`), combine en `dataChangeToken` global ; renvoie aussi `autoBackupState` et `sleepState`.
- **`GET /api/sync/test`** (public) : ping simple utilisé pour le self-keep-alive.
- **Veille (sleep) 72h / idle 96h** : `idleTimeoutMs` interne fixé à **96 heures** (le texte du code mentionne "72h" dans les commentaires mais la constante réelle est `96 * 60 * 60 * 1000`). Si aucune donnée n'a changé et aucun client ne s'est reconnecté pendant cette durée, le serveur entre en "sommeil" (`isSleeping=true`), stoppe le self-ping, et diffuse l'événement `server-sleep` aux clients. Le minuteur est réarmé (`wakeUp(reason)`) à chaque : (a) nouvelle connexion client SSE (`client-connected`), (b) changement réel de données autre que `settings` (`data-change`). Le réveil diffuse `server-awake { timestamp, reason }`.
- **Self-ping keep-alive** (anti spin-down Render free-tier) : toutes les 10 minutes, ping HTTP/HTTPS de son propre `/api/sync/test` (URL déduite de `RENDER_EXTERNAL_URL` ou `SELF_PING_URL` ou `localhost:PORT`), désactivé pendant le sommeil.
- **État de sauvegarde automatique** (`autoBackupState`) : à chaque changement de données (hors `settings.json`), on programme un signal de sauvegarde automatique après une fenêtre de stabilité de **5 minutes** sans nouveau changement (`autoBackupStableWindowMs`). Si le signal se déclenche (`autoBackupState.signal=true`, `activationId` unique), un événement `auto-backup-state` est diffusé — le frontend peut alors lancer une sauvegarde automatique. `markBackupCompleted(mode)` réinitialise l'état après une sauvegarde manuelle ou auto.

### 17bis.8 Sauvegarde / restauration / maintenance des données — `routes/settings.js`

Toutes les routes sont sous `/api/settings`, protégées `authMiddleware`, avec contrôle de rôle (`isAdmin` = `administrateur` ou `administrateur principale`, `isAdminPrincipale` = uniquement `administrateur principale`).

**Gestion des utilisateurs** (admin principale) :
- `GET /users` : liste sans mots de passe.
- `PUT /user-role {userId,newRole}` : `newRole` doit être `''` ou `'administrateur'` ; impossible de modifier l'admin principale.
- `DELETE /user/:id` : supprime le compte (sauf admin principale), supprime sa photo de profil, nettoie ses références dans `pointage.json/rdv.json/taches.json`.
- `PUT /user-specification {userId,specification}` : seul un `administrateur` peut recevoir `specification:'live'`.

**Paramètres généraux** : `GET/PUT /` — fusionne avec `DEFAULT_SETTINGS` (siteName, language, timezone, currency, dateFormat, notifications{...}, display{...}, security{...}, backup{lastBackupDate,autoBackup,autoBackupIntervalDays}).

**Sauvegarde (`POST /backup`, admin)** :
1. Exige `encryptionCode` (≥6 caractères).
2. Collecte **dynamiquement tous** les fichiers `.json` de `db/` (`getDbFiles()`), déchiffrés (`readJson`), dans un objet `backupData[filename] = data`.
3. Ajoute `_metadata: {backupDate, version:'1.0', filesCount}`.
4. Chiffre l'ensemble en AES‑256‑CBC avec `crypto.scryptSync(encryptionCode,'riziky-salt-2024',32)`, IV aléatoire.
5. Calcule un `checksum` SHA‑256 du JSON en clair, et un `codeHash` bcrypt du code de chiffrement (pour vérification ultérieure sans stocker le code en clair).
6. Renvoie `{success, backup:{iv,data,checksum,codeHash}, filename}` ; met à jour `settings.backup.lastBackupDate` ; appelle `syncManager.markBackupCompleted('manual')`.

**Sauvegarde automatique (`POST /auto-backup`, admin)** : identique mais utilise le mot de passe réel de l'utilisateur connecté comme code de chiffrement (vérifié par bcrypt contre `users.json`), nomme le fichier avec le nom de l'utilisateur, marque `markBackupCompleted('auto')`.

**Restauration (`POST /restore`, admin)** :
1. Exige `{encryptedData, decryptionCode}`. Si `encryptedData.codeHash` présent, vérifie `bcrypt.compareSync`.
2. Déchiffre avec le même algorithme/sel ; vérifie le `checksum` SHA‑256 (fichier corrompu sinon).
3. Fusionne intelligemment (`mergeRestoreData`) chaque fichier de la sauvegarde avec le fichier local existant, **sauf** pour la liste `REPLACE_ON_RESTORE` (remplacement intégral, pas de fusion) :
   ```
   REPLACE_ON_RESTORE = [
     'objectif.json', 'products.json', 'nouvelle_achat.json',
     'pretproduits.json', 'pretfamilles.json', 'avance.json',
     'sales.json', 'remboursement.json', 'compta.json', 'benefice.json',
     'depensedumois.json', 'depensefixe.json', 'pointage.json',
     'pointageauto.json', 'pointageDeleted.json', 'pointageAutoSessions.json'
   ]
   ```
   Raison : ces fichiers contiennent des états numériques (stocks, soldes, objectifs) où une fusion par id perdrait les valeurs mises à jour.
   De même, tout fichier d'épargne (`comptes-epargne.json` ou `compte-*.json`) est toujours remplacé intégralement (jamais fusionné).
4. Pour les autres fichiers, `mergeRestoreData` fusionne récursivement tableaux/objets : les éléments sont identifiés par une clé d'identité stable (`mois+annee`, `year+month`, ou en priorité `id,_id,email,code,reference,numero,phone,nom,name`), les éléments identiques (stringification triée) sont ignorés, les nouveaux sont ajoutés, les éléments modifiés sont fusionnés récursivement. Un changement de type de conteneur (array↔objet) ou un remplacement d'un conteneur vide entraîne un remplacement direct.
5. Après restauration : régénère les codes/caractéristiques produits manquants, reconstruit `fidelite.json`.
6. Retourne `{success, status:'unchanged'|'updated', message, metadata, updatedFilesCount, unchangedFilesCount, totalAddedEntries}`.

**Suppression totale (`POST /delete-all`, admin principale uniquement)** :
- Exige le mot de passe de l'admin principale connecté (vérifié bcrypt).
- Préserve les comptes `administrateur principale` (reset des compteurs de sécurité), tout le reste des utilisateurs est supprimé.
- Parcourt **dynamiquement tous** les fichiers `.json` de `db/` :
  - `users.json` → remplacé par la liste des admins principaux préservés.
  - `comptes-epargne.json` → vidé en `[]`.
  - `compte-*.json` (épargne individuelle) → fichier supprimé du disque.
  - Fichiers listés dans `ARRAY_FILES` (grande liste : ventes, produits, clients, notes, pointages, messages, etc.) → vidés en `[]`.
  - `auto-injecter.json` et `auto-sauvegarde.json` → préservés puis explicitement réinitialisés (`autoInjecter:true`, `autoSauvegarde:false`) pour redéclencher une demande d'injection de données sur une base vide.
  - Tous les autres fichiers → vidés en `[]` ou `{}` selon leur forme actuelle (heuristique).
  - `timeoutinactive.json` et `tentativeblocage.json` → réinitialisés à `{}`.

**Suppression sélective (`POST /bulk-delete`, admin principale)** : `type ∈ {sales,products,clients,notes}`, soit par `ids[]`, soit `deleteAll` (avec filtre optionnel mois/année pour les ventes). `GET /bulk-data` fournit un aperçu léger paginable pour la modale de sélection.

**Flags d'automatisation** :
- `GET/PUT /auto-sauvegarde` — active/désactive la sauvegarde automatique (fichier `auto-sauvegarde.json`, exclu du chiffrement).
- `GET/PUT /auto-injecter` — active/désactive la proposition d'injection automatique de données de démo (fichier `auto-injecter.json`).
- `GET /needs-injection` — vrai si `autoInjecter` actif ET qu'au moins un fichier métier critique (`products, sales, clients, rdv, tache, notes, pointage`) est vide ET que `users.json` ne contient que des admins principaux.
- `POST /verify-password` — vérifie le mot de passe admin courant (utilisé avant actions sensibles côté front).

### 17bis.9 Mode maintenance — `routes/maintenance.js`

Fichier `db/maintenance.json` : `{ maintenant, activatedAt, activatedBy, message, scheduled:[], autoActiveId }`.

- `GET /api/maintenance/status` (public) : renvoie `{maintenant, message, activatedAt}` après avoir "tické" le scheduler.
- `POST /api/maintenance/check-admin {email}` (public) : indique si l'email correspond à un `administrateur principale` (permet au frontend de laisser passer cet admin même en maintenance).
- `PUT /api/maintenance/toggle` (admin principale) : active/désactive manuellement, fixe message personnalisé.
- CRUD `/scheduled` (admin principale) : programme une maintenance future avec `startAt + days/hours` de durée. Un scheduler interne (`setInterval` 30 s) active automatiquement la maintenance programmée dès que `now ∈ [startAt, endAt)` (`triggered=true`, `autoActiveId=id`), puis la désactive automatiquement à `endAt`.

### 17bis.10 Session unique par profil — `routes/connecteProfilUnique.js` + `controllers/connecteProfilUniqueController.js` + `models/ConnecteProfilUnique.js`

Fichier `db/connecte-profil-unique.json` : tableau d'entrées `{ id, userId, email, nom, role, ip, browser, os, device, timezone, userAgent, deviceKey, firstSeenAt, active, currentSessionId, historique:[{sessionId,dateConnexion,heureConnexion,connecteAt,ip,browser,os,device,timezone,dateDeconnexion,heureDeconnexion,deconnecteAt,motif}], logoutRequest, notifications:[], forceLogout, forceLogoutReason, lastSeenAt }`.

Règles métier :
- Une entrée est identifiée par `userId + deviceKey` (empreinte poste/navigateur).
- **Utilisateur non admin principal** : ne peut être connecté qu'à un seul endroit à la fois. `POST /check {userId,role}` détecte un conflit (autre `deviceKey` actif pour le même `userId`) et renvoie les détails de la session concurrente (IP, navigateur, date/heure).
- **Résolution du conflit** via `POST /request-logout {targetEntryId, mode}` :
  - `mode='auto'` : déconnexion immédiate et forcée du poste distant (`forceLogout=true`), notification "verte/rouge" à tous les admins principaux actifs.
  - `mode='manuel'` : crée une demande `pending` avec expiration à **+5 minutes** (`MANUAL_REQUEST_TIMEOUT_MS`). Le poste distant est notifié en polling et répond via `POST /respond-logout {accept}` (accepté → déconnexion ; refusé → statut `refused`). Sans réponse après 5 minutes, `processExpirations()` force la déconnexion (`granted_timeout`).
- `GET /request-status/:requestId` : suivi côté demandeur du statut (`pending/granted/refused/granted_timeout/unknown`).
- `POST /poll {sessionId}` : heartbeat appelé périodiquement par le frontend ; détecte une déconnexion forcée à distance (`forceLogout`) ou une session remplacée (`isCurrent=false`), met à jour `lastSeenAt`, retourne les demandes de déconnexion en attente et les notifications.
- **Administrateur principal** : connexions multiples autorisées sans restriction ; chaque nouvelle connexion notifie toutes ses autres sessions actives (`principal_login`), et à la connexion il reçoit un résumé quotidien des connexions/déconnexions survenues avant son arrivée (`daily_summary`).
- Toute connexion/déconnexion (tous profils) génère une notification "verte" (`user_login`) ou "rouge" (`user_logout`) envoyée à toutes les sessions actives d'administrateurs principaux.
- `GET /actives`, `GET /` (liste complète), `DELETE /` (reset) — endpoints d'administration/diagnostic.
- Une session est considérée active tant que le heartbeat (`poll`) est reçu régulièrement ; sinon `processExpirations()` la ferme comme "session inactive (navigateur fermé)".
- Cette route est explicitement exemptée du rate-limit général et du threat shield comportemental strict, car le heartbeat est fréquent (`app.use` dans `server.js`).

### 17bis.11 Liens de partage

**a) `routes/shareLinks.js`** (données internes : notes / pointage / tâches) — fichiers `db/shareTokens.json`, `db/lienIp.json` :
- `POST /generate` (auth) `{type: 'notes'|'pointage'|'taches', filters}` : génère un `token` (32 bytes hex) et un `accessCode` (4 bytes hex majuscule). Stocke `{id, token, accessCode, type, filters, active, createdAt}`.
- `GET /list` (auth) : liste des liens actifs, filtrable par type.
- `DELETE /revoke/:id` (auth) : désactive le lien et supprime les verrouillages IP associés.
- `POST /verify/:token` (public) `{accessCode}` : si code correct, **verrouille le lien sur la première IP appelante** (`lienIp.json`) ; les connexions suivantes doivent provenir de cette même IP, sinon 403 "Accès refusé... déjà associé à un autre appareil".
- `GET /view/:token` (public, IP-locked) : sert les données filtrées selon le `type` et les `filters` stockés (filtre par date — jours/mois/semaines/années —, par personne, par colonnes/notes sélectionnées, par entreprise, par importance). Ne fonctionne que si l'IP appelante correspond à celle enregistrée lors de la vérification.

**b) `routes/notesShare.js`** : mécanisme équivalent simplifié dédié aux notes (`generate`, `revoke`, `view/:token`).

**c) `routes/shareComments.js`** : liens de partage "commentés" (captures/snapshots avec retour asynchrone) — soumission publique de commentaires sur un token (`submit/:token`), envoi (`send/:id`), vérification (`check/:token`), liste/lecture authentifiées, export/import JSON, suppression.

### 17bis.12 Modèles de données principaux (`server/models/`)

Tous les modèles lisent/écrivent via `dbHelper` (`readDb`/`writeDb`) ou directement `fs.*` (patché de façon transparente par `patchDbIO`). Schémas des fichiers JSON les plus structurants :

| Fichier | Forme | Champs clés |
|---|---|---|
| `users.json` | array | `id, email, password(hash), firstName, lastName, gender, address, phone, role?, specification?, failedAttempts, lockedUntil, nombreConnexion, tempsBlocage, profilePhoto?` |
| `products.json` | array | `id, description, purchasePrice, sellingPrice?, quantity, code, caracteristique:{nom,numero,codeBarre,code}, photos?[]` |
| `sales.json` | array | `id, date, products:[{productId,quantity,salePrice,...}], clientId?, clientName?, totalSellingPrice, ...` |
| `clients.json` | array | `id, nom, phone, adresse, dateCreation, photo?` |
| `pretfamilles.json` | array | `id, nom, pretTotal, soldeRestant, dernierRemboursement, dateRemboursement` |
| `pretproduits.json` | array | `id, nom, phone, date, description, prixVente, avanceRecue, reste, estPaye, dateProchaineVente` |
| `depensedumois.json` | array | `id, date, description, categorie, debit, credit, solde` |
| `depensefixe.json` | object | `free, internetZeop, assuranceVoiture, autreDepense, assuranceVie, total` |
| `benefice.json` | array | bénéfices calculés par période/produit |
| `commandes.json` | array | commandes clients |
| `remboursement.json` | array | remboursements liés aux ventes |
| `pointageauto.json` | array | pointages automatiques |
| `blockage-ip.json` | object | `{ips:[{id,ip,reason,active,createdAt,createdBy,updatedAt}]}` |
| `encryption.json` | object (non chiffré) | `{enabled, activatedAt, keySealed{v,iv,tag,data}, keyHint, keyFingerprint, keyProtected}` |
| `maintenance.json` | object | `{maintenant, activatedAt, activatedBy, message, scheduled:[{id,startAt,endAt,days,hours,message,createdAt,createdBy,triggered}], autoActiveId}` |
| `connecte-profil-unique.json` | array | voir 17bis.10 |
| `intrusions.json` | array | voir 17bis.4 (structure `record()`) |
| `settings.json` | object (non chiffré) | voir `DEFAULT_SETTINGS` en 17bis.8 |
| `auto-sauvegarde.json` | object (non chiffré) | `{autoSauvegarde:boolean}` |
| `auto-injecter.json` | object | `{autoInjecter:boolean}` |
| `shareTokens.json` | array | voir 17bis.11 |
| `lienIp.json` | array | `{id, tokenId, token, ip, type, registeredAt}` |
| `moduleSettings.json` | object (non chiffré) | configuration d'activation de modules |

Les fichiers non listés (attributs produits, fidélité, épargne, messagerie, RDV, tâches, notes, historique de connexion, etc.) suivent le même principe : un tableau ou objet simple par domaine, chiffré transparent, avec un modèle dédié dans `server/models/` exposant des méthodes CRUD (`getAll/getById/create/update/remove`) et parfois des méthodes métiers spécifiques (ex. `Product.generateCodesForExistingProducts()`, `Fidelite.rebuild()`).

### 17bis.13 Tableau complet des endpoints par fichier de routes

Toutes les routes sont préfixées par `/api/<segment>` monté dans `server.js` (segment indiqué entre parenthèses). Auth : `authMiddleware` (JWT) sauf mention "public". `auth` = alias local du même middleware dans certains fichiers.

**auth.js** (`/api/auth`) — public sauf verify
- GET `/verify` (JWT requis) — vérifie le token
- GET `/health` — health check
- POST `/login` (validation schema `login`)
- POST `/check-email`
- POST `/register` (validation schema `register`)
- POST `/reset-password-request`
- POST `/reset-password`

**attributKinds.js** (`/api/attribut-kinds`, auth) — CRUD des types d'attributs dynamiques + leurs valeurs
- GET `/`, POST `/`, PUT `/:id`, DELETE `/:id`
- GET `/:id/values`, POST `/:id/values`, PUT `/:id/values/:vid`, DELETE `/:id/values/:vid`

**availability.js** (`/api/availability`, auth)
- GET `/slots`, GET `/check`

**avance.js** (`/api/avances`, auth)
- GET `/`, POST `/`, DELETE `/:id`

**banks.js** (`/api/banks`, auth)
- GET `/`, POST `/`, DELETE `/:id`

**benefices.js** (`/api/benefices`, auth)
- GET `/`, GET `/product/:productId`, POST `/`, PUT `/:id`, DELETE `/:id`

**blockageIp.js** (`/api/blockage-ip`) — voir 17bis.5
- GET `/check` (public), GET `/` (auth), POST `/` (auth), PUT `/:id` (auth), PATCH `/:id/active` (auth), DELETE `/:id` (auth)

**clients.js** (`/api/clients`, auth)
- GET `/`, GET `/:id`, POST `/` (upload photo), PUT `/:id` (upload photo), DELETE `/:id`, POST `/merge` (upload photo)

**clientsVilles.js** (`/api/clients-villes`, auth)
- GET `/`, POST `/`, PUT `/:original`, DELETE `/:ville`

**commandes.js** (`/api/commandes`, auth)
- GET `/`, GET `/expiring-soon`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`

**compta.js** (`/api/compta`, pas d'auth explicite dans ce fichier)
- GET `/`, GET `/monthly/:year/:month`, GET `/yearly/:year`, GET `/summary/:year`, POST `/calculate/:year/:month`, POST `/recalculate/:year`

**confirmationRdv.js** (`/api/confirmation-rdv`, auth)
- GET `/`, POST `/sync`, PATCH `/:id`

**connecteProfilUnique.js** (`/api/connecte-profil-unique`, public — voir 17bis.10)
- POST `/check`, POST `/register-login`, POST `/logout`, POST `/request-logout`, GET `/request-status/:requestId`, POST `/respond-logout`, POST `/poll`, GET `/actives`, GET `/`, DELETE `/`

**depenses.js** (`/api/depenses`, auth)
- GET `/mouvements`, GET `/mouvements/:id`, POST `/mouvements`, PUT `/mouvements/:id`, DELETE `/mouvements/:id`
- GET `/fixe`, PUT `/fixe`, POST `/reset`, GET `/check-month`
- GET `/rsa`, PUT `/rsa`, POST `/auto-entries`

**encryption.js** (`/api/encryption`, auth, admin principale) — voir 17bis.3
- GET `/status`, POST `/activate`, POST `/deactivate`, POST `/change-key`

**entreprise.js** (`/api/entreprises`, auth)
- GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`

**epargne.js** (`/api/epargne`, auth, admin principale uniquement pour la plupart)
- POST `/verify-admin`, GET `/` , POST `/`, PUT `/:ownerId`, DELETE `/:ownerId`
- POST `/:ownerId/comptes`, PUT `/:ownerId/comptes/:compteId`, DELETE `/:ownerId/comptes/:compteId`
- POST `/:ownerId/comptes/:compteId/operations`, PUT `/:ownerId/comptes/:compteId/operations/:opId`, DELETE `/:ownerId/comptes/:compteId/operations/:opId`

**fidelite.js** (`/api/fidelite`, public)
- GET `/`, GET `/:name`, POST `/rebuild`

**fournisseurs.js** (`/api/fournisseurs`, auth)
- GET `/`, GET `/search`, POST `/`, DELETE `/:id`

**historiqueConnexion.js** (`/api/historique-connexion`, public)
- GET `/`, POST `/visit`, DELETE `/`
- Expose `logEntry` sur `app.locals.logHistorique` pour être appelé depuis d'autres routes (ex. login).

**indisponible.js** (`/api/indisponible`, auth)
- GET `/`, POST `/`, PUT `/:id`, DELETE `/:id`, DELETE `/group/:groupId`, POST `/check`

**listesFidelite.js** (`/api/listes-fidelite`, public)
- GET `/`, PUT `/`, POST `/`, PUT `/:id`, DELETE `/:id`

**livraisonVille.js** (`/api/livraison-villes`, auth)
- GET `/`, POST `/`, PUT `/:ville`, DELETE `/:ville`

**maintenance.js** (`/api/maintenance`) — voir 17bis.9
- GET `/status` (public), POST `/check-admin` (public), PUT `/toggle` (admin principale)
- GET/POST `/scheduled`, PUT/DELETE `/scheduled/:id` (admin principale)

**messagerie.js** (`/api/messagerie`, mixte public/auth) — chat visiteur↔admin + chat inter-admins + groupes
- GET `/events` (SSE public), GET `/admin-status` (public)
- GET `/admin-users`, `/admin-conversations`, `/admin-messages/:otherAdminId`, POST `/admin-send`, PUT `/admin-mark-read/:otherAdminId`, GET `/admin-unread-count` (auth)
- GET `/conversations` (auth), GET `/messages/:visitorId/:adminId` (public), POST `/send` (public), POST `/typing`/`admin-typing` (public)
- PUT `/mark-read/:visitorId/:adminId` (public), GET `/unread-count/:adminId` (public)
- PUT `/edit/:messageId` (public), DELETE `/delete/:messageId` (public), DELETE `/admin-delete-own/:messageId` (auth), DELETE `/admin-hide/:messageId` (auth)
- POST `/like/:messageId` (public)
- Groupes admin : POST `/group/create`, GET `/groups`, GET `/group-messages/:groupId`, POST `/group-send`, PUT `/group-mark-read/:groupId`, PUT `/group/rename/:groupId`, POST `/group-typing` (auth)
- Groupes visiteur : GET `/visitor-groups/:visitorId`, GET `/visitor-group-messages/:groupId/:visitorId`, POST `/visitor-group-send`, PUT `/visitor-group-mark-read/:groupId/:visitorId`, POST `/visitor-group-typing` (public)

**messages.js** (`/api/messages`)
- POST `/` (public), GET `/` (auth), GET `/unread-count` (auth), PUT `/:id/read` (auth), PUT `/:id/unread` (auth), DELETE `/:id` (auth)

**moduleSettings.js** (`/api/module-settings`, auth)
- GET `/`, GET `/:module`, PUT `/:module`

**notes.js** (`/api/notes`, auth)
- POST `/upload-fichier`, POST `/upload-fichiers` (multi), DELETE `/fichier`, POST `/upload-drawing`
- GET `/`, POST `/`, PUT `/:id`, DELETE `/:id`, PUT `/:id/move`, PUT `/batch/reorder`
- GET/POST `/columns`, PUT/DELETE `/columns/:id`

**notesShare.js** (`/api/notes-share`)
- POST `/generate` (auth), DELETE `/revoke` (auth), GET `/view/:token` (public)

**nouvelleAchat.js** (`/api/nouvelle-achat`, auth)
- POST `/depense/upload-receipt`, POST `/achat/upload-receipt`
- GET `/`, GET `/monthly/:year/:month`, GET `/yearly/:year`, GET `/stats/monthly/:year/:month`, GET `/stats/yearly/:year`, GET `/:id`
- POST `/`, POST `/depense`, PUT `/:id`, DELETE `/:id`

**objectif.js** (`/api/objectif`, auth)
- GET `/`, GET `/historique`, PUT `/objectif`, POST `/recalculate`, POST `/save-monthly`, POST `/reset`

**parametres.js** (`/api/parametres`, auth)
- GET/PUT `/prixpointage`, GET/PUT `/parametretache`

**pointage.js** (`/api/pointages`, auth) — CRUD standard : GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`

**pointageAuto.js** (`/api/pointages-auto`, auth) — CRUD standard identique

**pointageAutoDeclanche.js** (`/api/pointages-auto-declanche`, auth)
- GET `/`, POST `/`, PATCH `/:id`, DELETE `/cleanup`

**pointageAutoSessions.js** (`/api/pointages-auto-sessions`, auth)
- GET `/`, POST `/`, PATCH `/:id`, DELETE `/cleanup`

**pointageDeleted.js** (`/api/pointages-deleted`, auth)
- GET `/`, POST `/`, DELETE `/`

**prepaLivraison.js** (`/api/prepa-livraison`, auth)
- GET `/`, POST `/sync`, PATCH `/:id`

**pretfamilles.js** (`/api/pretfamilles`, auth)
- GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`, GET `/search/nom`

**pretproduits.js** (`/api/pretproduits`, auth)
- GET `/`, GET `/search`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`, POST `/transfer`

**prixproducts.js** (`/api/prix-products`, auth)
- GET `/`, GET `/product/:productId`, POST `/`, DELETE `/:id`

**productAttributes.js** (monté 5 fois : `/api/modele-produits`, `/api/taille-produits`, `/api/couleur-produits`, `/api/devant-produits`, `/api/autres-produits`, auth)
- GET `/`, POST `/`, PUT `/:id`, DELETE `/:id` (routeur factory générique)

**productComments.js** (`/api/product-comments`)
- GET `/ratings` (public), GET `/product/:productId` (public), POST `/` (auth), PUT `/:id` (auth), DELETE `/bulk` (auth), DELETE `/:id` (auth), DELETE `/product/:productId` (auth)

**products.js** (`/api/products`)
- GET `/` (public), POST `/generate-codes` (auth), GET `/search` (public), GET `/:id` (public)
- POST `/` (auth), POST `/with-photos` (auth, upload multi 6), PUT `/:id` (auth), DELETE `/:id` (auth, suite tronquée mais standard)

**productsVendu.js** (`/api/products-vendu`) — non détaillé ligne par ligne, expose la consultation des produits vendus (agrégats de ventes)

**profile.js** (`/api/profile`, auth)
- GET `/`, PUT `/`, POST `/photo` (upload), PUT `/password`
- GET/PUT `/security-settings`, GET/PUT `/timeout-settings`

**rdv.js** (`/api/rdv`, auth)
- GET `/`, GET `/search`, GET `/search-clients`, GET `/week`, GET `/conflicts`, GET `/:id`
- POST `/`, PUT `/:id`, PUT `/by-commande/:commandeId`, DELETE `/:id`, DELETE `/by-commande/:commandeId`

**rdvNotifications.js** (`/api/rdv-notifications`, auth)
- GET `/`, GET `/unread`, GET `/count`, POST `/check`, PUT `/:id/read`, DELETE `/:id`
- GET `/by-rdv/:rdvId`, PUT `/status/:rdvId`, PUT `/by-rdv/:rdvId`, DELETE `/by-rdv/:rdvId`

**rdvTaches.js** (`/api/rdv-taches`, public dans ce fichier)
- GET `/`, GET `/free-slots`, POST `/`, PUT `/by-commande/:commandeId`, DELETE `/by-commande/:commandeId`, PUT `/:id`, DELETE `/:id`

**remboursements.js** (`/api/remboursements`, auth)
- GET `/`, GET `/by-month`, GET `/search-sales`, POST `/`, DELETE `/:id`

**sales.js** (`/api/sales`, auth)
- GET `/`, GET `/by-month`, GET `/by-year`, GET `/yearly-stats`, POST `/`, PUT `/:id`, DELETE `/:id`, POST `/export-month`

**settings.js** (`/api/settings`) — voir 17bis.8 pour le détail complet des règles métier
- GET `/`, GET `/users`, PUT `/user-role`, DELETE `/user/:id`, PUT `/user-specification`, PUT `/`
- POST `/backup`, POST `/restore`, POST `/delete-all`, POST `/bulk-delete`, GET `/bulk-data`, POST `/auto-backup`, POST `/verify-password`
- GET/PUT `/auto-sauvegarde`, GET/PUT `/auto-injecter`, GET `/needs-injection`

**shareComments.js** (`/api/share-comments`) — mixte public/auth, voir 17bis.11
- POST `/submit/:token`, POST `/send/:id`, GET `/check/:token` (public)
- GET `/list`, GET `/unread`, PATCH `/read/:id`, GET `/detail/:id`, GET `/snapshot/:filename`, POST `/sync-html`, POST `/import-json`, DELETE `/delete/:id`, GET `/export-json` (auth)

**shareLinks.js** (`/api/share-links`) — voir 17bis.11
- POST `/generate` (auth), GET `/list` (auth), DELETE `/revoke/:id` (auth), POST `/verify/:token` (public), GET `/view/:token` (public)

**sync.js** (`/api/sync`) — voir 17bis.7
- GET `/events` (public, SSE), POST `/force-sync` (auth), GET `/status` (public), GET `/test` (public)

**tache.js** (`/api/taches`, public dans ce fichier)
- GET `/`, GET `/:id`, POST `/`, PUT `/:id`, PUT `/by-commande/:commandeId`, DELETE `/:id`, DELETE `/by-commande/:commandeId`

**tachesRdv.js** (`/api/taches-rdv`, public dans ce fichier)
- GET `/`, POST `/`, PUT `/:id`, DELETE `/:id`

**travailleur.js** (`/api/travailleurs`, auth)
- GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`

**versement.js** (`/api/versements`, auth)
- GET `/`, PUT `/max`, POST `/`, PUT `/:id`, DELETE `/:id`

Routes additionnelles montées directement dans `server.js` sans fichier dédié listé ci-dessus : `/api/health` (santé), `/api/security/shield-stats`, `/api/security/intrusions` (GET/DELETE).

### 17bis.14 Services (`server/services/`)

- **`availabilityService.js`** : calcule les créneaux disponibles/occupés pour la prise de RDV (utilisé par `routes/availability.js`).
- **`fileService.js`** : utilitaires génériques de lecture/écriture/suppression de fichiers uploadés.
- **`reservationCleanupService.js`** : démarré au boot du serveur (`start()`), purge périodiquement les réservations/indisponibilités dont la date est dépassée de plus de 10 jours.

### 17bis.15 Upload de fichiers (`middleware/upload.js`, `uploadAchat.js`, `uploadDepense.js`)

Trois instances Multer distinctes, chacune ciblant un sous-dossier de `server/uploads/` (photos clients/produits, justificatifs d'achats, justificatifs de dépenses), avec restrictions de type MIME et de taille. Les fichiers sont servis statiquement via `/uploads` avec CORS et cache appropriés (voir 17bis.1, point 10).

---

## 18. BASE DE DONNÉES JSON (77 fichiers)

Chaque fichier est un tableau ou un objet JSON lu/écrit via `server/models/*` et
`server/middleware/dbHelper.js` (+ `patchDbIO.js` pour l'atomicité, `encryption.js` pour le chiffrement).

- `server/db/admin-messages.json`
- `server/db/attribut_kinds.json`
- `server/db/auto-injecter.json`
- `server/db/auto-sauvegarde.json`
- `server/db/autre_attribut.json`
- `server/db/autres_attribut.json`
- `server/db/autresproduits.json`
- `server/db/avance.json`
- `server/db/bank.json`
- `server/db/benefice.json`
- `server/db/blockage-ip.json`
- `server/db/clients-villes.json`
- `server/db/clients.json`
- `server/db/commandes.json`
- `server/db/comment-share.json`
- `server/db/compta.json`
- `server/db/confirmation-rdv.json`
- `server/db/connecte-profil-unique.json`
- `server/db/couleur_attribut.json`
- `server/db/couleurproduits.json`
- `server/db/depensedumois.json`
- `server/db/depensefixe.json`
- `server/db/devantproduits.json`
- `server/db/encryption.json`
- `server/db/entreprise.json`
- `server/db/fidelite.json`
- `server/db/fournisseurs.json`
- `server/db/group-chats.json`
- `server/db/group-messages.json`
- `server/db/historique-connexion.json`
- `server/db/indisponible.json`
- `server/db/intrusions.json`
- `server/db/lienIp.json`
- `server/db/lienpartagecommente.json`
- `server/db/listes-fidelite.json`
- `server/db/livraison-ville.json`
- `server/db/maintenance.json`
- `server/db/messagerie.json`
- `server/db/messages.json`
- `server/db/modele_attribut.json`
- `server/db/modeleproduit.json`
- `server/db/moduleSettings.json`
- `server/db/montant-verser.json`
- `server/db/noteColumns.json`
- `server/db/notes.json`
- `server/db/nouvelle_achat.json`
- `server/db/objectif.json`
- `server/db/parametretache.json`
- `server/db/pointage.json`
- `server/db/pointageAutoSessions.json`
- `server/db/pointageDeleted.json`
- `server/db/pointageauto.json`
- `server/db/pointageautodeclanche.json`
- `server/db/prepa-livraison.json`
- `server/db/pretfamilles.json`
- `server/db/pretproduits.json`
- `server/db/prixpointage.json`
- `server/db/prixproducts.json`
- `server/db/productComments.json`
- `server/db/products.json`
- `server/db/products.vendu.json`
- `server/db/rdv-taches.json`
- `server/db/rdv.json`
- `server/db/rdvNotifications.json`
- `server/db/remboursement.json`
- `server/db/rsa.json`
- `server/db/sales.json`
- `server/db/settings.json`
- `server/db/shareTokens.json`
- `server/db/tache.json`
- `server/db/taches-rdv.json`
- `server/db/taille_pouces_attribut.json`
- `server/db/tailleproduits.json`
- `server/db/tentativeblocage.json`
- `server/db/timeoutinactive.json`
- `server/db/travailleur.json`
- `server/db/users.json`

Dossiers d'upload : `server/uploads/` (photos clients, photos produits, notes/dessin),
`server/uploads/depense/` (justificatifs de dépense PDF/image, ouverts en `_blank` en lecture seule
avec proposition de téléchargement), `server/uploads/achat/`.

---

## 19. SÉCURITÉ (front + back)

Front :
- `src/lib/security.ts`, `runtimeSecurity.ts`, `antiTamper.ts`, `proofOfWork.ts`, `validation.ts`,
  `frontendSecurity.ts` (initialisé dans `main.tsx`) : anti-framing, anti-tabnabbing, blocage des URL
  dangereuses, blocage des dépôts de fichiers hors zone, nettoyage d'URL suspectes, suppression des logs
  en production, surveillance des rejets de promesses.
- `SecurityCheckPage` : vérification anti-bot obligatoire avant tout rendu (validité 24 h).
- `SessionUniqueWatcher` + `useSessionUnique` : une seule session active par compte, redirection
  `/session-conflict`.
- `ProtectedRoute` : contrôle du JWT et du rôle.
- Accès administrateur principal (`AdminPrincipalGate`) : mot de passe re-demandé, `PasswordStrengthChecker`,
  3 tentatives puis verrouillage 15 minutes.

Back :
- `middleware/auth.js` (JWT), `security.js` (helmet-like, rate limiting), `threatShield.js`,
  `ipBlocklist.js`, `validation.js`, `encryption.js` (AES + `server/security/keyVault.js`, `master.key`),
  journalisation des intrusions (`server/security/intrusionStore.js`, `threat-log.json`).
- Rôles stockés côté serveur uniquement ; jamais de rôle de confiance en `localStorage`.

---

## 20. TEMPS RÉEL

- SSE serveur : `server/middleware/sync.js` + `server/routes/sync.js`, endpoint `/api/sync/events`.
- Toute écriture (create/update/delete) diffuse `{ type, entity, data }`.
- Surveillance de fichiers pour `pointage.json`, `notes.json`, `tache.json` et les entités principales.
- Client : `EventSourceManager` (reconnexion exponentielle), `DataCacheManager`, `RealtimeService`,
  hooks `use-sse.ts` / `use-realtime-sync.ts`, indicateur `RealtimeStatus`.
- Inactivité tolérée : 72 h après la dernière donnée sans coupure de synchronisation.

---

## 21. RÈGLES MÉTIER PARTICULIÈRES À NE PAS OUBLIER

1. **Ventes** : regroupement par jour dans `SalesTable` avec cadre rouge épais et ligne de totaux
   (prix de vente, quantité, prix d'achat, livraison, bénéfice) **à l'intérieur** du cadre.
2. **Commandes** : type « Réservation ultérieure » limité à 10 jours, champs date/heure désactivés ;
   heure de fin optionnelle via bouton « + », sinon début + 1 h propagé à RDV et Tâches.
3. **Réservations** : suivi `enregistreLe`, `createdByName`, `createdById` ; réservation créée à moins de
   24 h de l'échéance → `confirmationAuto` (maintenue automatiquement).
4. **Créneaux annulés** : libérés et réutilisables (tâches annulées/terminées exclues des conflits).
5. **Livraison** : bouton « Livraison » à droite du bouton Total, clignotant/shimmer tant qu'une
   préparation reste en cours (`prepa-livraison.json`).
6. **Confirmation RDV** : fenêtre de 24 h, statuts Maintenu / Annulé / Reporter (nouvelle date obligatoire).
7. **Pointage automatique** : compte à rebours persistant dans `pointageautodeclanche.json`,
   idempotence date + travailleur + entreprise.
8. **Avances** : si le montant saisi est inférieur au total de la période, sélection obligatoire des
   jours exclus jusqu'à égalité exacte.
9. **Épargne** : montants affichés en Ar puis en Fmg (Ar × 5), historique versement/retrait avec
   modification et suppression confirmées, données chiffrées.
10. **Auto-injection** : si les bases critiques (products, sales, clients, rdv, tache, notes, pointage)
    sont vides, overlay bloquant plein écran pendant 5 minutes jusqu'à décision oui/non.
11. **Suppression totale** : purge dynamique des bases sauf l'administrateur principal ;
    `auto-injecter.json` reste activé, `auto-sauvegarde.json` repasse à `false`.
12. **Attributs produits** : suppression persistante via tombstones (`attribut_kinds_deleted.json`) ;
    l'UI n'affiche que les attributs réellement présents en base, sinon état vide.
13. **Dépenses** : justificatif photo/PDF au-dessus du champ date, stocké dans `uploads/depense`,
    consultable en nouvel onglet sans téléchargement forcé.
14. **Produits dans les achats** : photo principale + photos secondaires ajoutables/supprimables,
    synchronisées en base à la validation (remplacement complet).
15. **Messagerie** : compteurs de non-lus propagés conversation → onglet → icône flottante,
    remise à zéro uniquement à la lecture.

---

## 22. SEO

`index.html` + `src/components/SEOHead.tsx` : `<title>` < 60 caractères avec mot-clé,
`<meta name="description">` < 160 caractères, `og:title/description/type/image` (URL absolue 1200×630),
`twitter:card`, `lang="fr"`, viewport responsive, canonical, JSON-LD, un seul `<h1>` par page,
`alt` sur toutes les images, `public/robots.txt` et `public/sitemap.xml` à jour.

---

## 23. DOCUMENTATION À REGÉNÉRER (27 fichiers)

| Fichier | Lignes | Rôle |
|---|---|---|
| `docs/API_DOCUMENTATION.md` | 1187 | 🔌 Référence API |
| `docs/ARCHITECTURE.md` | 101 | 🏗️ Architecture |
| `docs/BACKEND.md` | 1154 | 🛠️ Documentation Backend (Express) |
| `docs/BASE_DE_DONNEES.md` | 79 | 💾 Base de données (fichiers JSON) |
| `docs/CAHIER_DE_CHARGE.md` | 347 | 📘 Cahier des charges |
| `docs/COMPOSANTS.md` | 5792 | 🧩 Spécification de tous les composants métier |
| `docs/COMPOSANTS_UI.md` | 69 | 🎛️ Bibliothèque de composants UI |
| `docs/DEPLOYMENT.md` | 16 | 📦 Déploiement |
| `docs/DOCUMENTATION_COMPLETE.md` | 363 | Documentation Complète du Projet - Gestion des Ventes |
| `docs/DOCUMENTATION_PROJET.md` | 580 | 📚 Documentation Complète - Système de Gestion Commerciale |
| `docs/FRONTEND.md` | 120 | 🖼️ Documentation Frontend |
| `docs/GUIDE_DEMARRAGE.md` | 27 | 🚀 Guide de démarrage |
| `docs/GUIDE_MODIFICATION.md` | 193 | 🔧 Guide de modification — « pour modifier X, il faut toucher ces fichiers » |
| `docs/GUIDE_UTILISATION.md` | 47 | 📖 Guide d'utilisation |
| `docs/MAINTENANCE_GUIDE.md` | 27 | 🛠️ Guide de maintenance |
| `docs/PAGES.md` | 931 | 📄 Spécification de toutes les pages |
| `docs/PARTAGE.md` | 23 | 🔗 Partage et commentaires visiteurs |
| `docs/PARTAGE_COMMENTAIRES.md` | 223 | 🔗 Documentation Partage et Commentaires — Riziky Gestion |
| `docs/PERFORMANCE.md` | 21 | 🚀 Performance |
| `docs/PRD_RIZIKY_STUDIO_COMPLET.md` | 505 | PRD COMPLET — RIZIKY-STUDIO |
| `docs/PROJET-COMPLET_GUIDE.md` | 968 | 📘 Guide Complet du Projet - Gestion des Ventes |
| `docs/README.md` | 44 | 📚 Documentation VentePro — Sommaire général |
| `docs/RESUME_COMPLET_PROJET.md` | 270 | 📋 RÉSUMÉ COMPLET DU PROJET — Gestion Ventes & Agendas |
| `docs/SECURITE.md` | 87 | 🔐 Sécurité |
| `docs/SESSION_UNIQUE.md` | 91 | Session unique par profil (`connecte-profil-unique.json`) |
| `docs/TEMPS_REEL.md` | 20 | ⚡ Synchronisation temps réel (SSE) |
| `docs/TESTS_GUIDE.md` | 23 | 🧪 Guide des tests |

---

## 24. CONFIGURATION RACINE

```
.env
.git
.gitgnore
README.md
bun.lock
components.json
eslint.config.js
index.html
package-lock.json
package.json
postcss.config.js
tailwind.config.ts
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vercel.json
vite.config.ts
vitest.config.ts
```

- `vite.config.ts` : alias `@` → `./src`, port 8080, plugins react-swc + lovable-tagger.
- `vitest.config.ts` : environnement jsdom, setup `src/tests/setup.ts`.
- `vercel.json` : réécriture SPA vers `/index.html`.
- `.env` front : `VITE_API_BASE_URL`. `server/.env` : `PORT`, `JWT_SECRET`, clés de chiffrement.

---

## 24bis. DÉPENDANCES (`package.json`)

L'application s'appelle `gestion-ventes` (version 5.0.0, `"type": "module"`, Node >= 18, licence MIT). Le `package.json` définit les scripts : `dev` (vite), `build` (vite build), `build:dev`, `lint` (eslint), `preview`, `test` (vitest).

### 24bis.1 Dependencies (production)

**Framework & routage :**
- `react` ^19.2.0, `react-dom` ^19.2.0 — UI.
- `react-router-dom` ^7.12.0 — routage SPA.
- `@tanstack/react-query` ^5.90.17 — cache et requêtes serveur.
- `zustand` ^5.0.12 — stores d'état légers.
- `next-themes` ^0.4.6 — bascule thème clair/sombre.

**Formulaires & validation :**
- `react-hook-form` ^7.71.1 — gestion des formulaires.
- `@hookform/resolvers` ^5.2.2 — pont react-hook-form ↔ zod.
- `zod` ^4.3.5 — schémas de validation.

**Composants UI (Radix / shadcn) :** `@radix-ui/react-accordion` ^1.2.12, `react-alert-dialog` ^1.1.15, `react-aspect-ratio` ^1.1.8, `react-avatar` ^1.1.11, `react-checkbox` ^1.3.3, `react-collapsible` ^1.1.12, `react-context-menu` ^2.2.16, `react-dialog` ^1.1.15, `react-dropdown-menu` ^2.1.16, `react-hover-card` ^1.1.15, `react-label` ^2.1.8, `react-menubar` ^1.1.16, `react-navigation-menu` ^1.2.14, `react-popover` ^1.1.15, `react-progress` ^1.1.8, `react-radio-group` ^1.3.8, `react-scroll-area` ^1.2.10, `react-select` ^2.2.6, `react-separator` ^1.1.8, `react-slider` ^1.3.6, `react-slot` ^1.2.4, `react-switch` ^1.2.6, `react-tabs` ^1.1.13, `react-toast` ^1.2.15, `react-toggle` ^1.1.10, `react-toggle-group` ^1.1.11, `react-tooltip` ^1.2.8, `react-visually-hidden` ^1.2.4.
- `cmdk` ^1.1.1 — palette de commandes.
- `vaul` ^1.1.2 — tiroirs (drawers) mobiles.
- `embla-carousel-react` ^8.6.0 — carrousels.
- `input-otp` ^1.4.2 — saisie de codes OTP.
- `react-resizable-panels` ^3.0.6 — panneaux redimensionnables.
- `react-day-picker` ^9.13.0 — sélecteur de dates.
- `sonner` ^2.0.7 — toasts.
- `lucide-react` ^0.562.0 — icônes.
- `class-variance-authority` ^0.7.1, `clsx` ^2.1.1, `tailwind-merge` ^3.4.0 — composition des classes.

**Style & animation :**
- `tailwindcss-animate` ^1.0.7 — animations Tailwind.
- `@tailwindcss/aspect-ratio` ^0.4.2, `@tailwindcss/container-queries` ^0.1.1, `@tailwindcss/postcss` ^4.1.17 — plugins Tailwind.
- `framer-motion` ^12.38.0 — animations déclaratives.

**Données & visualisation :**
- `axios` ^1.14.0 + `axios-retry` ^4.5.0 — client HTTP avec retries.
- `@supabase/supabase-js` ^2.97.0 — client Supabase.
- `recharts` ^3.6.0 — graphiques (ventes, bénéfices, évolution des prix).
- `date-fns` ^4.1.0 — manipulation des dates.

**Documents & exports :**
- `jspdf` ^4.2.1 + `jspdf-autotable` ^5.0.7 — génération PDF avec tableaux.
- `html2canvas` ^1.4.1 — capture DOM vers image.
- `jsbarcode` ^3.12.3 — codes-barres.

**Backend (dépendances listées côté front, servies par le serveur Express) :**
- `cors` ^2.8.5 — CORS. (Le serveur utilise aussi Express, JWT, etc. — voir section 17.)

**Tests (en dependencies) :**
- `@testing-library/dom` ^10.4.1, `@testing-library/jest-dom` ^6.9.1, `@testing-library/react` ^16.3.0, `vitest` ^4.0.8.

### 24bis.2 DevDependencies (développement)

- `vite` ^7.3.1 + `@vitejs/plugin-react` ^5.1.1 + `@vitejs/plugin-react-swc` ^4.2.2 — bundler et plugins React.
- `@lovable.dev/vite-plugin-dev-server-bridge` ^1.0.2, `@lovable.dev/vite-plugin-hmr-gate` ^1.8.0, `lovable-tagger` ^1.3.3 — outillage Lovable (HMR, tagging).
- `typescript` ^5.9.3 + `@types/node` ^24.10.13, `@types/react` ^19.2.18, `@types/react-dom` ^19.2.3 — typage.
- `tailwindcss` ^3.4.17 + `postcss` ^8.5.6 + `autoprefixer` ^10.4.22 + `@tailwindcss/typography` ^0.5.19 — pipeline CSS.
- `eslint` ^9.39.1 + `@eslint/js` ^9.39.1 + `typescript-eslint` ^8.46.4 + `eslint-plugin-react-hooks` ^7.0.1 + `eslint-plugin-react-refresh` ^0.4.24 + `globals` ^16.5.0 — lint.
- `jsdom` ^27.4.0 — DOM pour les tests vitest.
- `baseline-browser-mapping` ^2.9.14 — ciblage navigateurs.

---

## 25. CRITÈRE DE FIN

La reconstruction est terminée quand :
- tous les fichiers des sections 6 à 18 existent et compilent (`tsc` sans erreur, `vite build` OK) ;
- le serveur démarre et expose tous les préfixes `/api` de la section 17 ;
- la synchronisation SSE fonctionne ;
- chaque page se rend en mode clair et sombre, en mobile et desktop, sans couleur codée en dur.
