/**
 * ProductAttributeManagerButton — Bouton d'un TYPE d'attribut (kind) dynamique.
 * Comportement :
 *  - Clic sur l'icône "+" : ouvre ProductAttributeDialog (ajout de valeur).
 *  - Simple clic sur le NOM du type : ne fait rien.
 *  - Double-clic sur le nom : passe en mode renommage.
 *  - Icône corbeille : suppression (avec confirmation) toujours active.
 * La couleur du bouton provient de `kind.color` si défini, sinon d'un hash
 * déterministe du slug pour garder une identité visuelle stable.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AttributeKindDef } from '@/services/api/attributKindsApi';
import useAttributeKinds from '@/hooks/useAttributeKinds';
import ProductAttributeDialog from './ProductAttributeDialog';

const GRADIENTS: { g: string; s: string }[] = [
  { g: 'from-purple-500 to-fuchsia-600', s: 'shadow-purple-500/30' },
  { g: 'from-sky-500 to-cyan-600', s: 'shadow-sky-500/30' },
  { g: 'from-pink-500 to-rose-600', s: 'shadow-pink-500/30' },
  { g: 'from-amber-500 to-orange-600', s: 'shadow-amber-500/30' },
  { g: 'from-emerald-500 to-teal-600', s: 'shadow-emerald-500/30' },
  { g: 'from-indigo-500 to-violet-600', s: 'shadow-indigo-500/30' },
  { g: 'from-red-500 to-orange-600', s: 'shadow-red-500/30' },
  { g: 'from-blue-500 to-cyan-600', s: 'shadow-blue-500/30' },
];

function pickGradient(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

interface Props {
  kind: AttributeKindDef;
  className?: string;
}

const ProductAttributeManagerButton: React.FC<Props> = ({ kind, className }) => {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(kind.nom);
  const [confirmDel, setConfirmDel] = useState(false);
  const { renameKind, deleteKind } = useAttributeKinds();
  const { toast } = useToast();

  const fallback = pickGradient(kind.slug || kind.nom);
  const gradient = kind.color && /from-.+to-.+/.test(kind.color) ? kind.color : fallback.g;
  const shadow = fallback.s;
  const dialogKey = kind.id;

  const handleRename = async () => {
    const val = renameValue.trim();
    if (!val || val === kind.nom) { setRenaming(false); setRenameValue(kind.nom); return; }
    try {
      await renameKind(kind.id, val);
      toast({ title: 'Renommé', description: `« ${kind.nom} » → « ${val} »`, className: 'notification-success' });
      setRenaming(false);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Renommage impossible';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteKind(kind.id);
      toast({ title: 'Supprimé', description: `Attribut « ${kind.nom} » supprimé`, className: 'notification-success' });
      setConfirmDel(false);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Suppression impossible';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
      setConfirmDel(false);
    }
  };

  return (
    <>
      <div className={`inline-flex items-stretch rounded-2xl overflow-hidden shadow-lg ${shadow} bg-gradient-to-r ${gradient} ${className || ''}`}>
        {renaming ? (
          <div className="flex items-center gap-1 px-2 bg-white/95 dark:bg-gray-900/95">
            <Input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setRenaming(false); setRenameValue(kind.nom); } }}
              className="h-9 text-sm w-40"
            />
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={handleRename} aria-label="Valider">
              <Check className="h-4 w-4" />
            </Button>
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setRenaming(false); setRenameValue(kind.nom); }} aria-label="Annuler">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="h-11 sm:h-12 pl-3 pr-2 text-white flex items-center hover:brightness-110 transition"
              aria-label={`Ajouter une valeur à ${kind.nom}`}
              title="Ajouter une valeur"
            >
              <Plus className="h-5 w-5" />
            </button>
            <span
              onDoubleClick={() => { setRenameValue(kind.nom); setRenaming(true); }}
              className="h-11 sm:h-12 pr-3 pl-1 font-bold text-sm text-white flex items-center select-none cursor-pointer"
              title="Double-cliquez pour renommer"
            >
              {kind.nom}
            </span>
            {confirmDel ? (
              <div className="flex items-center gap-1 px-2 bg-red-600/90">
                <span className="text-white text-xs font-bold">Supprimer ?</span>
                <Button type="button" size="sm" variant="secondary" className="h-7 rounded-md" onClick={handleDelete}>Oui</Button>
                <Button type="button" size="sm" variant="outline" className="h-7 rounded-md" onClick={() => setConfirmDel(false)}>Non</Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDel(true)}
                className="h-11 sm:h-12 px-2.5 border-l border-white/25 text-white transition hover:bg-black/20"
                aria-label="Supprimer cet attribut"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>

      <ProductAttributeDialog
        open={open}
        onOpenChange={setOpen}
        kindKey={dialogKey}
        kindLabel={kind.nom}
      />
    </>
  );
};

export default ProductAttributeManagerButton;
