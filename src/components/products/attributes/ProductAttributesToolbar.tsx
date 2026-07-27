/**
 * ProductAttributesToolbar — Barre dynamique regroupant les boutons des TYPES
 * d'attribut produit (kinds) provenant de la base. Un bouton "+" à droite
 * permet de créer un nouveau type (fichier `<slug>_attribut.json` créé
 * automatiquement côté serveur).
 * L'affichage/masquage des boutons est persisté dans localStorage.
 */
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Palette, Plus, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import useAttributeKinds from '@/hooks/useAttributeKinds';
import ProductAttributeManagerButton from './ProductAttributeManagerButton';

const STORAGE_KEY = 'produits.attributesToolbar.visible';

const COLOR_CHOICES: { label: string; value: string; preview: string }[] = [
  { label: 'Violet',   value: 'from-purple-500 to-fuchsia-600', preview: 'bg-gradient-to-r from-purple-500 to-fuchsia-600' },
  { label: 'Ciel',     value: 'from-sky-500 to-cyan-600',       preview: 'bg-gradient-to-r from-sky-500 to-cyan-600' },
  { label: 'Rose',     value: 'from-pink-500 to-rose-600',      preview: 'bg-gradient-to-r from-pink-500 to-rose-600' },
  { label: 'Ambre',    value: 'from-amber-500 to-orange-600',   preview: 'bg-gradient-to-r from-amber-500 to-orange-600' },
  { label: 'Émeraude', value: 'from-emerald-500 to-teal-600',   preview: 'bg-gradient-to-r from-emerald-500 to-teal-600' },
  { label: 'Indigo',   value: 'from-indigo-500 to-violet-600',  preview: 'bg-gradient-to-r from-indigo-500 to-violet-600' },
  { label: 'Rouge',    value: 'from-red-500 to-orange-600',     preview: 'bg-gradient-to-r from-red-500 to-orange-600' },
  { label: 'Bleu',     value: 'from-blue-500 to-cyan-600',      preview: 'bg-gradient-to-r from-blue-500 to-cyan-600' },
];

const ProductAttributesToolbar: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw === null ? true : raw === 'true';
    } catch { return true; }
  });

  const { kinds, loading, createKind } = useAttributeKinds();
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<string>(COLOR_CHOICES[0].value);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(visible)); } catch { /* noop */ }
  }, [visible]);

  const handleCreate = async () => {
    const val = newName.trim();
    if (!val) { toast({ title: 'Erreur', description: 'Nom requis', variant: 'destructive' }); return; }
    try {
      setSaving(true);
      await createKind(val, newColor);
      toast({ title: 'Attribut créé', description: `« ${val} » enregistré`, className: 'notification-success' });
      setNewName('');
      setNewColor(COLOR_CHOICES[0].value);
      setAddOpen(false);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Création impossible';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <div className="rounded-2xl border border-violet-200/30 dark:border-violet-800/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-3 sm:p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-violet-500/30 shrink-0">
            <Palette className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-foreground truncate">Attributs produit</p>
            <p className="text-[11px] text-muted-foreground truncate">{kinds.length} type{kinds.length > 1 ? 's' : ''} d'attribut</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setVisible(v => !v)}
          className="rounded-xl h-9 shrink-0"
          aria-label={visible ? 'Cacher les boutons' : 'Afficher les boutons'}
        >
          {visible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span className="ml-1 hidden sm:inline text-xs font-bold">{visible ? 'Cacher' : 'Afficher'}</span>
        </Button>
      </div>

      {visible && (
        <div className="flex flex-wrap items-center gap-2">
          {loading && kinds.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
            </div>
          ) : (
            kinds.map(k => <ProductAttributeManagerButton key={k.id} kind={k} />)
          )}
          <Button
            type="button"
            onClick={() => setAddOpen(true)}
            className="h-11 sm:h-12 w-11 sm:w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 hover:brightness-110 text-white shadow-lg shadow-violet-500/30 p-0"
            aria-label="Ajouter un type d'attribut"
            title="Ajouter un type d'attribut"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={(v) => { if (!saving) setAddOpen(v); }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau type d'attribut</DialogTitle>
            <DialogDescription>
              Le fichier <code>&lt;nom&gt;_attribut.json</code> sera créé automatiquement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Nom du type d'attribut</Label>
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="ex : Densité, Longueur, Matière..."
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            <div className="pt-2 space-y-2">
              <Label>Couleur du bouton</Label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_CHOICES.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setNewColor(c.value)}
                    className={`h-10 rounded-xl ${c.preview} text-white text-[11px] font-bold shadow-md transition ring-offset-2 ${newColor === c.value ? 'ring-2 ring-violet-600' : 'opacity-80 hover:opacity-100'}`}
                    title={c.label}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>Annuler</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? 'Création…' : 'Créer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductAttributesToolbar;
