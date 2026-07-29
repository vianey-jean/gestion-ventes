# 🎛️ Bibliothèque de composants UI

Composants de base issus de **shadcn/ui** (Radix + Tailwind) et surcouches maison. Ils ne contiennent aucune logique métier et sont pilotés uniquement par leurs props et les tokens du design system.

| Fichier | Exports | Lignes |
|---|---|---|
| `src/components/ui/accordion.tsx` | — | 57 |
| `src/components/ui/alert-dialog.tsx` | — | 140 |
| `src/components/ui/alert.tsx` | — | 60 |
| `src/components/ui/aspect-ratio.tsx` | — | 6 |
| `src/components/ui/avatar.tsx` | — | 49 |
| `src/components/ui/badge.tsx` | — | 38 |
| `src/components/ui/breadcrumb.tsx` | — | 116 |
| `src/components/ui/button.tsx` | — | 103 |
| `src/components/ui/calendar.tsx` | — | 68 |
| `src/components/ui/card.tsx` | — | 80 |
| `src/components/ui/carousel.tsx` | — | 261 |
| `src/components/ui/chart.tsx` | — | 371 |
| `src/components/ui/checkbox.tsx` | — | 29 |
| `src/components/ui/collapsible.tsx` | — | 10 |
| `src/components/ui/command.tsx` | — | 154 |
| `src/components/ui/context-menu.tsx` | — | 199 |
| `src/components/ui/dialog.tsx` | — | 127 |
| `src/components/ui/drawer.tsx` | — | 117 |
| `src/components/ui/dropdown-menu.tsx` | — | 199 |
| `src/components/ui/form.tsx` | — | 177 |
| `src/components/ui/hover-card.tsx` | — | 28 |
| `src/components/ui/input-otp.tsx` | — | 70 |
| `src/components/ui/input.tsx` | — | 23 |
| `src/components/ui/label.tsx` | — | 25 |
| `src/components/ui/loading/LoadingDots.tsx` | `LoadingDots` | 56 |
| `src/components/ui/loading/LoadingSkeleton.tsx` | `LoadingSkeleton` | 68 |
| `src/components/ui/loading/LoadingSpinner.tsx` | `LoadingSpinner` | 68 |
| `src/components/ui/loading/index.ts` | — | 5 |
| `src/components/ui/menubar.tsx` | — | 235 |
| `src/components/ui/navigation-menu.tsx` | — | 130 |
| `src/components/ui/pagination.tsx` | — | 118 |
| `src/components/ui/popover.tsx` | — | 30 |
| `src/components/ui/premium-loading.tsx` | — | 102 |
| `src/components/ui/professional-loading.tsx` | — | 97 |
| `src/components/ui/progress.tsx` | — | 27 |
| `src/components/ui/radio-group.tsx` | — | 43 |
| `src/components/ui/resizable.tsx` | — | 44 |
| `src/components/ui/scroll-area.tsx` | — | 47 |
| `src/components/ui/select.tsx` | — | 159 |
| `src/components/ui/separator.tsx` | — | 30 |
| `src/components/ui/sheet.tsx` | — | 138 |
| `src/components/ui/sidebar.tsx` | — | 762 |
| `src/components/ui/skeleton.tsx` | — | 16 |
| `src/components/ui/slider.tsx` | — | 27 |
| `src/components/ui/sonner.tsx` | — | 54 |
| `src/components/ui/switch.tsx` | — | 28 |
| `src/components/ui/table.tsx` | — | 118 |
| `src/components/ui/tabs.tsx` | — | 55 |
| `src/components/ui/textarea.tsx` | — | 25 |
| `src/components/ui/toast.tsx` | — | 128 |
| `src/components/ui/toaster.tsx` | `Toaster` | 34 |
| `src/components/ui/toggle-group.tsx` | — | 60 |
| `src/components/ui/toggle.tsx` | — | 44 |
| `src/components/ui/tooltip.tsx` | — | 29 |
| `src/components/ui/use-toast.ts` | — | 4 |

## Règles d'usage

- **Ne jamais** coder de couleur en dur dans ces composants : utiliser les variantes et les tokens sémantiques.
- Toute variante nouvelle se déclare via `class-variance-authority` dans le fichier du composant.
- Les composants de chargement maison : `premium-loading`, `professional-loading`, `loading/LoadingDots`, `loading/LoadingSkeleton`, `loading/LoadingSpinner`.
- Accessibilité : les surcouches `accessibility/AccessibleButton` et `accessibility/AccessibleInput` ajoutent labels, focus visibles et annonces lecteur d'écran.

