# Guide Complet de Modification CSS du Projet

## Table des Matières
1. [Introduction](#introduction)
2. [Structure des Fichiers CSS](#structure-des-fichiers-css)
3. [Système de Design Tokens](#système-de-design-tokens)
4. [Classes Utilitaires Responsive](#classes-utilitaires-responsive)
5. [Modification des Composants](#modification-des-composants)
6. [Breakpoints et Media Queries](#breakpoints-et-media-queries)
7. [Thèmes Clair/Sombre](#thèmes-clairsombre)
8. [Exemples Pratiques](#exemples-pratiques)
9. [Bonnes Pratiques](#bonnes-pratiques)

---

## Introduction

Ce projet utilise **Tailwind CSS** comme framework CSS principal avec un système de design tokens personnalisé. Toutes les modifications CSS doivent suivre cette approche pour maintenir la cohérence et la maintenabilité du code.

### Technologies CSS Utilisées
- **Tailwind CSS**: Framework CSS utilitaire
- **CSS Variables**: Pour les tokens de design (couleurs, espacements)
- **shadcn/ui**: Composants UI pré-stylés et personnalisables

---

## Structure des Fichiers CSS

### Fichiers Principaux

```
src/
├── index.css                          # Variables CSS globales et tokens
├── tailwind.config.ts                 # Configuration Tailwind
├── styles/                            # Styles supplémentaires
│   ├── accessibility.css
│   ├── base/
│   │   ├── contrast.css
│   │   ├── motion.css
│   │   └── typography.css
│   ├── components/
│   │   ├── forms.css
│   │   └── navigation.css
│   └── utilities/
│       └── screen-reader.css
```

### index.css
Contient toutes les variables CSS (design tokens) pour les couleurs, espacements, et autres propriétés de style.

```css
:root {
  /* Couleurs principales */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  
  /* Espacements */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

### tailwind.config.ts
Configure les extensions Tailwind, les breakpoints personnalisés et les plugins.

```typescript
export default {
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
}
```

---

## Système de Design Tokens

### Couleurs

Utilisez toujours les variables CSS pour les couleurs au lieu de valeurs en dur :

```tsx
// ❌ MAUVAIS
<div className="bg-blue-500 text-white">

// ✅ BON
<div className="bg-primary text-primary-foreground">
```

### Variables de Couleurs Disponibles

| Variable | Usage |
|----------|-------|
| `--background` | Fond principal de l'application |
| `--foreground` | Texte principal |
| `--primary` | Couleur primaire de la marque |
| `--secondary` | Couleur secondaire |
| `--accent` | Couleur d'accentuation |
| `--muted` | Éléments en sourdine |
| `--destructive` | Actions destructives (supprimer, erreurs) |

### Espacements

Utilisez les classes Tailwind standard pour les espacements :

```tsx
// Padding responsive
<div className="p-2 sm:p-4 md:p-6 lg:p-8">

// Margin responsive
<div className="m-2 sm:m-4 md:m-6 lg:m-8">

// Gap (pour flex et grid)
<div className="gap-2 sm:gap-4 md:gap-6">
```

---

## Classes Utilitaires Responsive

### Principe Mobile-First

Tailwind CSS utilise une approche mobile-first. Les classes sans préfixe s'appliquent aux petits écrans, et les préfixes (`sm:`, `md:`, etc.) ajoutent des styles pour les écrans plus grands.

```tsx
// Commence petit (mobile), puis grandit
<div className="text-sm md:text-base lg:text-lg">
  Texte responsive
</div>
```

### Conteneurs

```tsx
// Conteneur responsive avec padding adaptatif
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  Contenu centré
</div>
```

### Grilles Responsives

```tsx
// Grille 1 colonne sur mobile, 2 sur tablette, 3 sur desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Élément 1</div>
  <div>Élément 2</div>
  <div>Élément 3</div>
</div>
```

### Cartes Responsives

```tsx
<div className="
  bg-card 
  rounded-lg sm:rounded-xl lg:rounded-2xl
  p-4 sm:p-6 lg:p-8
  shadow-sm sm:shadow-md lg:shadow-lg
">
  Contenu de la carte
</div>
```

### Typographie Responsive

```tsx
// Titres
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  Grand Titre
</h1>

// Paragraphe
<p className="text-sm sm:text-base md:text-lg">
  Texte du paragraphe
</p>
```

### Boutons Responsives

```tsx
<button className="
  px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3
  text-xs sm:text-sm md:text-base
  rounded-lg sm:rounded-xl
">
  Bouton responsive
</button>
```

### Tableaux Responsives

```tsx
<div className="overflow-x-auto -mx-4 sm:mx-0">
  <table className="w-full text-xs sm:text-sm md:text-base">
    <thead>
      <tr>
        <th className="px-2 py-2 sm:px-4 sm:py-3">
          En-tête
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="px-2 py-2 sm:px-4 sm:py-3">
          Donnée
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Dialogues/Modales Responsives

```tsx
<Dialog>
  <DialogContent className="
    w-[95vw] sm:w-[90vw] md:max-w-lg
    max-h-[90vh] overflow-y-auto
    p-4 sm:p-6
  ">
    Contenu du dialogue
  </DialogContent>
</Dialog>
```

---

## Modification des Composants

### Navbar

**Fichier**: `src/components/Navbar.tsx`

```tsx
// Logo responsive
<img 
  src={logo} 
  alt="Logo" 
  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" 
/>

// Menu items
<button className="
  px-3 py-2 sm:px-4 sm:py-2
  text-xs sm:text-sm md:text-base
  rounded-lg
">
  Menu
</button>
```

### Pages

Toutes les pages doivent avoir un padding responsive :

```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
  {/* Contenu de la page */}
</div>
```

### Composants de Tableau

**Fichier**: `src/components/ui/table.tsx`

```tsx
<Table className="w-full text-xs sm:text-sm md:text-base">
  <TableHeader>
    <TableRow>
      <TableHead className="px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3">
        En-tête
      </TableHead>
    </TableRow>
  </TableHeader>
</Table>
```

### Composants de Bouton

**Fichier**: `src/components/ui/button.tsx`

Classes de taille disponibles :
- `size="xs"` → Mobile très petit
- `size="sm"` → Mobile/Tablette
- `size="default"` → Desktop standard
- `size="lg"` → Desktop large

```tsx
const buttonVariants = cva({
  variants: {
    size: {
      xs: "h-7 px-2 text-xs",
      sm: "h-8 px-3 text-sm",
      default: "h-9 px-4 text-sm sm:h-10 sm:px-5 sm:text-base",
      lg: "h-10 px-6 text-base sm:h-11 sm:px-8 sm:text-lg",
    }
  }
});
```

---

## Breakpoints et Media Queries

### Breakpoints Tailwind

| Préfixe | Taille minimale | Appareil |
|---------|----------------|----------|
| (défaut) | 0px | Mobile |
| `xs:` | 475px | Grand mobile |
| `sm:` | 640px | Tablette portrait |
| `md:` | 768px | Tablette paysage |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Grand desktop |
| `2xl:` | 1536px | Très grand desktop |

### Utilisation dans tailwind.config.ts

```typescript
export default {
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        // Ajouter des breakpoints personnalisés si nécessaire
        '3xl': '1920px',
      },
    },
  },
}
```

### Classes Utilitaires par Appareil

```tsx
// Visible seulement sur mobile
<div className="block sm:hidden">
  Menu mobile
</div>

// Visible seulement sur desktop
<div className="hidden lg:block">
  Menu desktop
</div>

// Flex direction responsive
<div className="flex flex-col md:flex-row gap-4">
  <div>Élément 1</div>
  <div>Élément 2</div>
</div>
```

---

## Thèmes Clair/Sombre

### Structure des Thèmes

Le projet supporte automatiquement les thèmes clair et sombre via la classe `dark:`.

```tsx
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
">
  Contenu avec thème
</div>
```

### Variables CSS pour les Thèmes

Dans `index.css` :

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Utilisation dans les Composants

```tsx
// ✅ BON - Utilise les variables CSS
<div className="bg-background text-foreground">

// ❌ MAUVAIS - Couleurs en dur
<div className="bg-white text-black dark:bg-black dark:text-white">
```

---

## Exemples Pratiques

### Exemple 1: Card Responsive

```tsx
<Card className="
  bg-card 
  rounded-lg sm:rounded-xl lg:rounded-2xl
  p-4 sm:p-6 lg:p-8
  shadow-sm hover:shadow-md
  transition-all duration-300
">
  <div className="space-y-3 sm:space-y-4">
    <h2 className="
      text-lg sm:text-xl md:text-2xl 
      font-bold 
      text-card-foreground
    ">
      Titre de la Card
    </h2>
    
    <p className="
      text-sm sm:text-base 
      text-muted-foreground
    ">
      Description de la card
    </p>
    
    <Button className="
      w-full sm:w-auto
      text-xs sm:text-sm
    ">
      Action
    </Button>
  </div>
</Card>
```

### Exemple 2: Formulaire Responsive

```tsx
<form className="space-y-4 sm:space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label className="text-sm sm:text-base">
        Nom
      </Label>
      <Input 
        className="
          h-9 sm:h-10 md:h-11
          text-sm sm:text-base
          px-3 sm:px-4
        " 
      />
    </div>
    
    <div className="space-y-2">
      <Label className="text-sm sm:text-base">
        Email
      </Label>
      <Input 
        type="email"
        className="
          h-9 sm:h-10 md:h-11
          text-sm sm:text-base
          px-3 sm:px-4
        " 
      />
    </div>
  </div>
  
  <Button 
    type="submit"
    className="
      w-full sm:w-auto
      px-6 sm:px-8 md:px-10
      py-2 sm:py-2.5 md:py-3
      text-sm sm:text-base
    "
  >
    Envoyer
  </Button>
</form>
```

### Exemple 3: Navigation Responsive

```tsx
<nav className="
  bg-background/95 
  backdrop-blur 
  border-b border-border
  sticky top-0 z-50
">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <img 
          src={logo} 
          alt="Logo" 
          className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" 
        />
        <span className="
          text-base sm:text-lg md:text-xl 
          font-bold
        ">
          MonApp
        </span>
      </div>
      
      {/* Menu Desktop */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6">
        <a 
          href="#" 
          className="
            text-sm lg:text-base
            hover:text-primary
            transition-colors
          "
        >
          Accueil
        </a>
        <a 
          href="#" 
          className="
            text-sm lg:text-base
            hover:text-primary
            transition-colors
          "
        >
          À propos
        </a>
      </div>
      
      {/* Menu Mobile Toggle */}
      <button className="md:hidden p-2">
        <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </div>
  </div>
</nav>
```

### Exemple 4: Graphique/Chart Responsive

```tsx
<div className="
  bg-card 
  rounded-lg sm:rounded-xl
  p-3 sm:p-4 md:p-6
">
  <h3 className="
    text-base sm:text-lg md:text-xl 
    font-semibold 
    mb-3 sm:mb-4
  ">
    Statistiques
  </h3>
  
  <div className="
    h-48 sm:h-64 md:h-80 lg:h-96
    overflow-x-auto
  ">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis 
          tick={{ fontSize: 10 }}
          className="text-xs sm:text-sm"
        />
        <YAxis 
          tick={{ fontSize: 10 }}
          className="text-xs sm:text-sm"
        />
        <Line strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>
```

---

## Bonnes Pratiques

### 1. Approche Mobile-First

Toujours commencer par le style mobile, puis ajouter les adaptations pour les écrans plus grands :

```tsx
// ✅ BON
<div className="text-sm md:text-base lg:text-lg">

// ❌ MAUVAIS (Desktop-first)
<div className="text-lg md:text-base sm:text-sm">
```

### 2. Utiliser les Variables CSS

Ne jamais utiliser de couleurs en dur. Toujours utiliser les tokens de design :

```tsx
// ✅ BON
<div className="bg-primary text-primary-foreground">

// ❌ MAUVAIS
<div className="bg-blue-600 text-white">
```

### 3. Classes Utilitaires > CSS Personnalisé

Privilégier les classes utilitaires Tailwind au CSS personnalisé :

```tsx
// ✅ BON
<div className="flex items-center gap-4 p-4 rounded-lg">

// ❌ MAUVAIS (sauf si absolument nécessaire)
<div className="custom-container">
// dans un fichier CSS séparé
.custom-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
}
```

### 4. Éviter les Valeurs Fixes

Utiliser des valeurs relatives et responsive :

```tsx
// ✅ BON
<div className="w-full sm:w-auto max-w-md">

// ❌ MAUVAIS
<div className="w-[500px]">
```

### 5. Design Tokens pour la Cohérence

Utiliser les spacing, colors et autres tokens définis dans `index.css` et `tailwind.config.ts` :

```tsx
// ✅ BON
<div className="gap-2 sm:gap-4 md:gap-6">

// ❌ MAUVAIS (valeurs arbitraires)
<div className="gap-[13px] sm:gap-[27px]">
```

### 6. Accessibilité

Toujours penser à l'accessibilité lors de la modification des styles :

```tsx
// Contraste suffisant
<button className="
  bg-primary text-primary-foreground
  hover:bg-primary/90
  focus:ring-2 focus:ring-primary focus:ring-offset-2
">
  Bouton accessible
</button>

// Tailles tactiles suffisantes (minimum 44x44px)
<button className="min-h-[44px] min-w-[44px] p-2">
  <Icon className="h-5 w-5" />
</button>
```

### 7. Performance

Minimiser les animations et transitions sur mobile :

```tsx
<div className="
  transition-all duration-300
  hover:scale-105
  sm:hover:scale-110
">
  Élément avec animation
</div>
```

### 8. Tests Multi-Appareils

Toujours tester les modifications sur :
- Mobile (375px - 640px)
- Tablette (640px - 1024px)
- Desktop (1024px+)

### 9. Consistance Visuelle

Maintenir la cohérence des espacements et des tailles à travers tout le projet :

```tsx
// Standard pour les cards
<Card className="p-4 sm:p-6 lg:p-8">

// Standard pour les sections
<section className="py-8 sm:py-12 lg:py-16">

// Standard pour les conteneurs
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
```

### 10. Documentation

Toujours documenter les classes CSS personnalisées et les composants stylés complexes.

---

## Maintenance et Mise à Jour

### Vérifier la Cohérence

Régulièrement vérifier que tous les composants suivent les mêmes patterns de responsive design :

```bash
# Rechercher les valeurs en dur
grep -r "w-\[" src/
grep -r "h-\[" src/

# Rechercher les couleurs non-token
grep -r "bg-blue-" src/
grep -r "text-red-" src/
```

### Optimisation

Purger les classes CSS inutilisées avec la configuration Tailwind :

```javascript
// tailwind.config.ts
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
}
```

---

## Ressources Supplémentaires

- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [CSS Variables MDN](https://developer.mozilla.org/fr/docs/Web/CSS/Using_CSS_custom_properties)
- [Responsive Design Best Practices](https://web.dev/responsive-web-design-basics/)

---

## Conclusion

En suivant ce guide, vous pouvez maintenir un code CSS cohérent, responsive et maintenable. N'oubliez pas :

1. **Mobile-first** toujours
2. **Design tokens** pour la cohérence
3. **Classes utilitaires** > CSS personnalisé
4. **Tester** sur tous les appareils
5. **Documenter** vos modifications

Pour toute question ou suggestion d'amélioration de ce guide, contactez l'équipe de développement.
