
# COMPOSANTS RÉUTILISABLES

## Vue d'ensemble

Cette documentation présente les composants réutilisables conçus selon les principes de composition et d'immutabilité.

## Composants UI de Base

### 1. StatCard - Carte de Statistiques

```typescript
interface StatCardProps {
  readonly title: string;
  readonly value: number | string;
  readonly icon?: React.ComponentType<{ className?: string }>;
  readonly className?: string;
  readonly variant?: 'default' | 'success' | 'warning' | 'error';
}

/**
 * Composant pur pour afficher une statistique
 * Mémoïsé pour éviter les re-renders inutiles
 */
const StatCard: React.FC<StatCardProps> = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  className,
  variant = 'default' 
}) => {
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200'
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
          {Icon && (
            <Icon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';
```

### 2. LoadingState - États de Chargement

```typescript
interface LoadingStateProps {
  readonly isLoading: boolean;
  readonly error?: string | null;
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
  readonly errorFallback?: React.ComponentType<{ error: string }>;
}

/**
 * Composant de gestion des états de chargement et d'erreur
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  children,
  fallback = <ProfessionalLoading />,
  errorFallback: ErrorComponent = DefaultErrorComponent
}) => {
  if (error) {
    return <ErrorComponent error={error} />;
  }

  if (isLoading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
```

### 3. EmptyState - État Vide

```typescript
interface EmptyStateProps {
  readonly title: string;
  readonly description?: string;
  readonly icon?: React.ComponentType<{ className?: string }>;
  readonly action?: {
    readonly label: string;
    readonly onClick: () => void;
  };
  readonly className?: string;
}

/**
 * Composant pour les états vides
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Package,
  action,
  className
}) => (
  <div className={cn("text-center py-12", className)}>
    <Icon className="mx-auto h-12 w-12 text-muted-foreground" />
    <h3 className="mt-4 text-lg font-semibold">{title}</h3>
    {description && (
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    )}
    {action && (
      <Button onClick={action.onClick} className="mt-6">
        {action.label}
      </Button>
    )}
  </div>
);
```

## Composants de Formulaires

### 1. FormField - Champ de Formulaire

```typescript
interface FormFieldProps {
  readonly label: string;
  readonly name: string;
  readonly type?: 'text' | 'number' | 'email' | 'password';
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly error?: string;
  readonly value: string | number;
  readonly onChange: (value: string | number) => void;
  readonly className?: string;
}

/**
 * Composant de champ de formulaire réutilisable
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  error,
  value,
  onChange,
  className
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) : e.target.value;
    onChange(newValue);
  }, [onChange, type]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={cn(error && "border-red-500")}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
```

### 2. SearchInput - Champ de Recherche

```typescript
interface SearchInputProps {
  readonly placeholder?: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onClear?: () => void;
  readonly className?: string;
}

/**
 * Composant de recherche avec debouncing
 */
const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Rechercher...",
  value,
  onChange,
  onClear,
  className
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onClear?.();
  }, [onClear]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-10 pr-10"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
```

## Composants de Layout

### 1. PageHeader - En-tête de Page

```typescript
interface PageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: React.ReactNode;
  readonly breadcrumbs?: readonly BreadcrumbItem[];
  readonly className?: string;
}

interface BreadcrumbItem {
  readonly label: string;
  readonly href?: string;
}

/**
 * Composant d'en-tête de page standardisé
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className
}) => (
  <header className={cn("space-y-4 pb-6", className)}>
    {breadcrumbs && breadcrumbs.length > 0 && (
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
              {item.href ? (
                <Link to={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  </header>
);
```

### 2. DataTable - Tableau de Données

```typescript
interface DataTableProps<T> {
  readonly data: readonly T[];
  readonly columns: readonly Column<T>[];
  readonly onRowClick?: (item: T) => void;
  readonly onRowSelect?: (selectedItems: readonly T[]) => void;
  readonly loading?: boolean;
  readonly emptyState?: React.ReactNode;
  readonly className?: string;
}

interface Column<T> {
  readonly key: keyof T;
  readonly header: string;
  readonly render?: (value: T[keyof T], item: T) => React.ReactNode;
  readonly sortable?: boolean;
  readonly width?: string;
}

/**
 * Composant de tableau de données générique
 */
function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  onRowSelect,
  loading = false,
  emptyState,
  className
}: DataTableProps<T>) {
  const [selectedItems, setSelectedItems] = useState<readonly string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = useCallback((key: keyof T) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelection = checked ? data.map(item => item.id) : [];
    setSelectedItems(newSelection);
    onRowSelect?.(data.filter(item => newSelection.includes(item.id)));
  }, [data, onRowSelect]);

  const handleSelectItem = useCallback((itemId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedItems, itemId]
      : selectedItems.filter(id => id !== itemId);
    
    setSelectedItems(newSelection);
    onRowSelect?.(data.filter(item => newSelection.includes(item.id)));
  }, [selectedItems, data, onRowSelect]);

  if (loading) {
    return <TableSkeleton />;
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {onRowSelect && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedItems.length === data.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={cn(
                  column.width && `w-${column.width}`,
                  column.sortable && "cursor-pointer hover:bg-muted/50"
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-2">
                  <span>{column.header}</span>
                  {column.sortable && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow
              key={item.id}
              className={cn(
                onRowClick && "cursor-pointer hover:bg-muted/50",
                selectedItems.includes(item.id) && "bg-muted/50"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {onRowSelect && (
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) => 
                      handleSelectItem(item.id, checked as boolean)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={String(column.key)}>
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key])
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

## Hooks Réutilisables

### 1. useDebounce - Debouncing

```typescript
/**
 * Hook pour le debouncing des valeurs
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### 2. useLocalStorage - Stockage Local

```typescript
/**
 * Hook pour la gestion du localStorage avec TypeScript
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
```

### 3. usePrevious - Valeur Précédente

```typescript
/**
 * Hook pour accéder à la valeur précédente
 */
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}
```

## Services Réutilisables

### 1. ValidationService - Validation

```typescript
/**
 * Service de validation pure
 */
export const ValidationService = {
  /**
   * Valide un email
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valide un numéro de téléphone
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  /**
   * Valide un prix
   */
  isValidPrice(price: number): boolean {
    return typeof price === 'number' && price >= 0 && !isNaN(price);
  },

  /**
   * Valide une quantité
   */
  isValidQuantity(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity >= 0;
  }
};
```

### 2. FormatService - Formatage

```typescript
/**
 * Service de formatage pure
 */
export const FormatService = {
  /**
   * Formate un prix en devise
   */
  formatCurrency(amount: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency
    }).format(amount);
  },

  /**
   * Formate une date
   */
  formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: format === 'short' ? 'short' : 'long'
    }).format(dateObj);
  },

  /**
   * Formate un nombre
   */
  formatNumber(number: number, decimals = 0): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  }
};
```

Ces composants réutilisables permettent de :

1. **Réduire la duplication de code** - Composants utilisables partout
2. **Maintenir la cohérence** - Style et comportement uniformes
3. **Faciliter les tests** - Composants isolés et purs
4. **Améliorer la maintenabilité** - Modifications centralisées
5. **Respecter l'immutabilité** - Props en lecture seule
6. **Optimiser les performances** - Mémoïsation automatique

