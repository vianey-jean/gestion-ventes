/**
 * ProductAttributeDialog — Modale de création d'une VALEUR d'attribut produit
 * pour un kind donné (identifié par son id + nom d'affichage).
 * Comprend :
 *  - un formulaire nom / description
 *  - un bouton "oeil" pour lister toutes les valeurs existantes du kind avec
 *    possibilité de modifier ou supprimer chaque valeur (avec confirmation).
 * Toute modification est persistée immédiatement en base et synchronisée
 * via l'event `attribut-values-changed` (déclenché par useProductAttributes).
 */
import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Pencil, Trash2, Check, X } from 'lucide-react';
import useProductAttributes from '@/hooks/useProductAttributes';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Identifiant du kind (legacy: 'modele' | 'taille' | ... ou kind id `k_xxx`) */
  kindKey: string;
  /** Nom affiché du kind (ex: "Modèle", "Couleur", "AAAA") */
  kindLabel: string;
}

const ProductAttributeDialog: React.FC<Props> = ({ open, onOpenChange, kindKey, kindLabel }) => {
  const { items, create, update, remove } = useProductAttributes(kindKey);
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showList, setShowList] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNom, setEditNom] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!nom.trim()) {
      toast({ title: 'Erreur', description: 'Le nom est requis', variant: 'destructive' });
      return;
    }
    try {
      setSaving(true);
      await create(nom.trim(), description.trim());
      toast({ title: 'Succès', description: `Ajouté à « ${kindLabel} »`, className: 'notification-success' });
      setNom(''); setDescription('');
    } catch {
      toast({ title: 'Erreur', description: "Impossible d'enregistrer", variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const startEdit = (id: string, currentNom: string) => {
    setEditingId(id); setEditNom(currentNom);
  };
  const cancelEdit = () => { setEditingId(null); setEditNom(''); };
  const confirmEdit = async (id: string) => {
    const val = editNom.trim();
    if (!val) { toast({ title: 'Erreur', description: 'Nom vide', variant: 'destructive' }); return; }
    try {
      await update(id, { nom: val });
      toast({ title: 'Modifié', className: 'notification-success' });
      cancelEdit();
    } catch { toast({ title: 'Erreur', description: 'Modification impossible', variant: 'destructive' }); }
  };

  const confirmDelete = async (id: string) => {
    try {
      await remove(id);
      toast({ title: 'Supprimé', className: 'notification-success' });
      setPendingDeleteId(null);
    } catch { toast({ title: 'Erreur', description: 'Suppression impossible', variant: 'destructive' }); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!saving) { onOpenChange(v); if (!v) { setShowList(false); cancelEdit(); setPendingDeleteId(null); } } }}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <DialogTitle className="truncate">Ajouter à « {kindLabel} »</DialogTitle>
              <DialogDescription>Renseignez un nom et une description facultative.</DialogDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowList(v => !v)}
              className="rounded-xl shrink-0"
              aria-label={showList ? 'Cacher la liste' : 'Voir toutes les valeurs'}
              title={showList ? 'Cacher la liste' : 'Voir toutes les valeurs'}
            >
              {showList ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nom</Label>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder={`ex : nouvelle valeur pour ${kindLabel}`} />
          </div>
          <div className="space-y-1.5">
            <Label>Description (facultatif)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          {showList && (
            <div className="rounded-xl border border-violet-200 dark:border-violet-800 max-h-64 overflow-y-auto">
              <div className="px-3 py-2 text-xs font-bold text-muted-foreground border-b border-violet-100 dark:border-violet-900/50">
                {items.length} valeur{items.length > 1 ? 's' : ''}
              </div>
              {items.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">Aucune valeur.</p>
              ) : (
                <ul className="divide-y divide-violet-100 dark:divide-violet-900/50">
                  {items.map(it => (
                    <li key={it.id} className="p-2 flex items-center gap-2">
                      {editingId === it.id ? (
                        <>
                          <Input value={editNom} onChange={(e) => setEditNom(e.target.value)} className="h-8 text-sm" />
                          <Button type="button" size="icon" className="h-8 w-8 rounded-lg" onClick={() => confirmEdit(it.id)} aria-label="Valider">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={cancelEdit} aria-label="Annuler">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : pendingDeleteId === it.id ? (
                        <>
                          <span className="flex-1 text-sm text-red-600 dark:text-red-400 font-medium truncate">Supprimer « {it.nom} » ?</span>
                          <Button type="button" variant="destructive" size="sm" className="h-8 rounded-lg" onClick={() => confirmDelete(it.id)}>Oui</Button>
                          <Button type="button" variant="outline" size="sm" className="h-8 rounded-lg" onClick={() => setPendingDeleteId(null)}>Non</Button>
                        </>
                      ) : (
                        <>
                          <span
                            className="flex-1 text-sm truncate cursor-pointer"
                            onDoubleClick={() => startEdit(it.id, it.nom)}
                            title="Double-cliquez pour modifier"
                          >{it.nom}</span>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(it.id, it.nom)} aria-label="Modifier">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => setPendingDeleteId(it.id)} aria-label="Supprimer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Fermer</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductAttributeDialog;
