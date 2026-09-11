/**
 * AchatSearchBar - Loupe de recherche d'achats produits (en-tête comptabilité)
 *
 * - Icône loupe : au survol ou au clic, une barre de recherche apparaît.
 * - À partir de 3 caractères : liste des achats produits correspondants
 *   (nom du produit, date d'achat, fournisseur, prix d'achat).
 * - Chaque ligne : icône verte (modifier) + icône rouge (supprimer), avec confirmation.
 * - La modification ouvre AchatEditModal ; achat + produit sont synchronisés côté serveur.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Pencil, Trash2, Loader2, Package, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { NouvelleAchat } from '@/types/comptabilite';
import nouvelleAchatApiService from '@/services/api/nouvelleAchatApi';
import AchatEditModal from './modals/AchatEditModal';

export interface AchatSearchBarProps {
  onUpdateAchat: (id: string, data: Partial<NouvelleAchat>) => Promise<void>;
  onDeleteAchat: (id: string) => Promise<void>;
}

const formatEuro = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

const normalize = (s: string) =>
  (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

/** Toutes les représentations texte d'un achat utilisées pour la recherche */
const buildHaystack = (a: NouvelleAchat): string => {
  const d = a.date ? new Date(a.date) : null;
  const dateStrs = d && !isNaN(d.getTime())
    ? [
        format(d, 'dd/MM/yyyy'),
        format(d, 'dd-MM-yyyy'),
        format(d, 'yyyy-MM-dd'),
        format(d, 'd MMMM yyyy', { locale: fr }),
        format(d, 'MMMM yyyy', { locale: fr }),
      ]
    : [];
  const price = Number(a.purchasePrice) || 0;
  const priceStrs = [
    price.toString(),
    price.toFixed(2),
    price.toFixed(2).replace('.', ','),
    (Number(a.totalCost) || 0).toString(),
    (Number(a.totalCost) || 0).toFixed(2).replace('.', ','),
  ];
  return normalize(
    [a.productDescription, a.fournisseur, a.caracteristiques, ...dateStrs, ...priceStrs].join(' | ')
  );
};

const AchatSearchBar: React.FC<AchatSearchBarProps> = ({ onUpdateAchat, onDeleteAchat }) => {
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [allAchats, setAllAchats] = useState<NouvelleAchat[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [pendingEdit, setPendingEdit] = useState<NouvelleAchat | null>(null);
  const [editing, setEditing] = useState<NouvelleAchat | null>(null);
  const [pendingDelete, setPendingDelete] = useState<NouvelleAchat | null>(null);
  const [deleting, setDeleting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<number | null>(null);

  const isOpen = expanded || focused || query.length > 0;

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const data = await nouvelleAchatApiService.getAll();
      setAllAchats(Array.isArray(data) ? data : []);
      setLoaded(true);
    } catch (e) {
      console.error('Erreur chargement achats (recherche):', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger la liste complète des achats à la première ouverture
  useEffect(() => {
    if (isOpen && !loaded && !loading) loadAll();
  }, [isOpen, loaded, loading, loadAll]);

  // Focus automatique à l'ouverture
  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = normalize(query);
    if (q.length < 3) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return allAchats
      .filter(a => a.type === 'achat_produit')
      .filter(a => {
        const hay = buildHaystack(a);
        return tokens.every(t => hay.includes(t));
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);
  }, [query, allAchats]);

  const showList = isOpen && query.trim().length >= 3;

  const handleMouseEnter = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setExpanded(true);
  };
  const handleMouseLeave = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setExpanded(false), 250);
  };

  const reset = () => {
    setQuery('');
    setExpanded(false);
    setFocused(false);
    inputRef.current?.blur();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await onDeleteAchat(pendingDelete.id);
      setAllAchats(prev => prev.filter(a => a.id !== pendingDelete.id));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const handleSaveEdit = async (id: string, data: Partial<NouvelleAchat>) => {
    await onUpdateAchat(id, data);
    await loadAll();
  };

  return (
    <>
      <PopoverPrimitive.Root open={showList}>
        <PopoverPrimitive.Anchor asChild>
          <div
            className="relative flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              aria-label="Rechercher un achat"
              onClick={() => {
                setExpanded(v => !v || true);
                inputRef.current?.focus();
              }}
              className={cn(
                'flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border-2 border-emerald-400/30 bg-white/10 text-emerald-100 transition-all duration-300 hover:bg-white/20 hover:scale-105 shadow-lg',
                isOpen && 'bg-emerald-600/40 border-emerald-400/60 text-white'
              )}
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="achat-search-input"
                  initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                  animate={{ width: 'min(16rem, 60vw)', opacity: 1, marginLeft: 8 }}
                  exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="relative overflow-hidden"
                >
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={e => {
                      if (e.key === 'Escape') reset();
                    }}
                    placeholder="Produit, date, fournisseur, prix…"
                    className="h-9 sm:h-10 rounded-xl bg-white/10 border-2 border-emerald-400/30 text-emerald-50 placeholder:text-emerald-200/60 pr-8 text-xs sm:text-sm focus-visible:ring-emerald-400/50"
                  />
                  {query && (
                    <button
                      type="button"
                      aria-label="Effacer la recherche"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => setQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-200/70 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PopoverPrimitive.Anchor>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={8}
            onOpenAutoFocus={e => e.preventDefault()}
            onCloseAutoFocus={e => e.preventDefault()}
            onInteractOutside={e => {
              const target = e.target as HTMLElement | null;
              if (target && inputRef.current && inputRef.current.contains(target)) {
                e.preventDefault();
                return;
              }
              reset();
            }}
            className="z-50 w-[min(34rem,92vw)] rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/95 backdrop-blur-xl text-emerald-50 shadow-2xl shadow-emerald-900/40 p-2 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2"
          >
            <div className="flex items-center justify-between px-2 py-1.5 text-[11px] uppercase tracking-wider text-emerald-300/80">
              <span className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                Achats produits
              </span>
              <span>
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  `${results.length} résultat${results.length > 1 ? 's' : ''}`
                )}
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
              {!loading && results.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-emerald-200/70">
                  Aucun achat ne correspond à « {query} »
                </div>
              )}

              {results.map(a => {
                const d = a.date ? new Date(a.date) : null;
                const dateLabel = d && !isNaN(d.getTime()) ? format(d, 'dd/MM/yyyy', { locale: fr }) : '—';
                return (
                  <div
                    key={a.id}
                    className="group flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{a.productDescription}</p>
                      <p className="truncate text-[11px] text-emerald-200/80">
                        {dateLabel}
                        {a.fournisseur ? ` · ${a.fournisseur}` : ''}
                        {` · ${formatEuro(Number(a.purchasePrice) || 0)} × ${a.quantity}`}
                        {` · total ${formatEuro(Number(a.totalCost) || 0)}`}
                        {a.disponible === false ? ' · indisponible' : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Modifier cet achat"
                        title="Modifier"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => setPendingEdit(a)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 transition-all hover:bg-emerald-500 hover:text-white hover:scale-110"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Supprimer cet achat"
                        title="Supprimer"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => setPendingDelete(a)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-300 transition-all hover:bg-red-500 hover:text-white hover:scale-110"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {/* Confirmation avant modification */}
      <AlertDialog open={!!pendingEdit} onOpenChange={open => !open && setPendingEdit(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-emerald-500/20">
                <Pencil className="h-6 w-6 text-emerald-500" />
              </div>
              <AlertDialogTitle className="text-xl">Modifier cet achat ?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Voulez-vous vraiment modifier l'achat
              {pendingEdit ? <> « <strong>{pendingEdit.productDescription}</strong> »</> : null} ?
              <span className="text-muted-foreground text-sm mt-2 block">
                Les modifications seront appliquées à l'achat et au produit correspondant.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setEditing(pendingEdit);
                setPendingEdit(null);
              }}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Oui, modifier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Formulaire de modification */}
      <AchatEditModal
        achat={editing}
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        onSave={handleSaveEdit}
      />

      {/* Confirmation avant suppression */}
      <AlertDialog open={!!pendingDelete} onOpenChange={open => !open && !deleting && setPendingDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-full bg-red-500/20">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <AlertDialogTitle className="text-xl">Supprimer cet achat ?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Voulez-vous vraiment supprimer l'achat
              {pendingDelete ? <> « <strong>{pendingDelete.productDescription}</strong> »</> : null} ?
              <span className="text-muted-foreground text-sm mt-2 block">
                La quantité ajoutée sera retirée du stock et le prix d'achat / fournisseur du produit
                reviendront à leur valeur précédant cet achat. Si le produit a été créé par cet achat, il sera supprimé.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl" disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Oui, supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AchatSearchBar;
