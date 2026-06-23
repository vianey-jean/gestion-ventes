/**
 * AchatVenteSubModals.tsx
 * Sous-modales réutilisables pour la page Produits :
 *  - Voir / Modifier / Supprimer un achat
 *  - Voir / Modifier / Supprimer une vente
 *  - Historique fournisseurs
 *
 * Toute la logique reste dans ProduitsPage (états et handlers passés en props).
 */
import React from 'react';
import { Eye, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import FournisseurAutocomplete from '@/components/dashboard/FournisseurAutocomplete';

export interface AchatEditForm {
  date: string;
  quantity: string;
  purchasePrice: string;
  fournisseur: string;
  disponible: boolean;
}

export interface VenteEditForm {
  date: string;
  quantity: string;
  sellingPrice: string;
}

interface Props {
  selectedProduct: Product | null;

  // Achat
  achatViewIndex: number | null;
  setAchatViewIndex: (i: number | null) => void;
  achatEditIndex: number | null;
  setAchatEditIndex: (i: number | null) => void;
  achatDeleteIndex: number | null;
  setAchatDeleteIndex: (i: number | null) => void;
  achatEditForm: AchatEditForm;
  setAchatEditForm: React.Dispatch<React.SetStateAction<AchatEditForm>>;
  achatSaving: boolean;
  achatDeleting: boolean;
  handleSaveAchat: () => void;
  handleDeleteAchat: () => void;

  // Vente
  venteViewIndex: number | null;
  setVenteViewIndex: (i: number | null) => void;
  venteEditIndex: number | null;
  setVenteEditIndex: (i: number | null) => void;
  venteDeleteIndex: number | null;
  setVenteDeleteIndex: (i: number | null) => void;
  venteEditForm: VenteEditForm;
  setVenteEditForm: React.Dispatch<React.SetStateAction<VenteEditForm>>;
  venteSaving: boolean;
  venteDeleting: boolean;
  handleSaveVente: () => void;
  handleDeleteVente: () => void;

  // Historique fournisseurs
  isFournHistoryOpen: boolean;
  setIsFournHistoryOpen: (o: boolean) => void;
}

const AchatVenteSubModals: React.FC<Props> = ({
  selectedProduct,
  achatViewIndex, setAchatViewIndex,
  achatEditIndex, setAchatEditIndex,
  achatDeleteIndex, setAchatDeleteIndex,
  achatEditForm, setAchatEditForm,
  achatSaving, achatDeleting,
  handleSaveAchat, handleDeleteAchat,
  venteViewIndex, setVenteViewIndex,
  venteEditIndex, setVenteEditIndex,
  venteDeleteIndex, setVenteDeleteIndex,
  venteEditForm, setVenteEditForm,
  venteSaving, venteDeleting,
  handleSaveVente, handleDeleteVente,
  isFournHistoryOpen, setIsFournHistoryOpen,
}) => {
  return (
    <>
      {/* ===== Sous-modales Achat ===== */}
      <Dialog open={achatViewIndex !== null} onOpenChange={(o) => !o && setAchatViewIndex(null)}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-emerald-900/30 to-teal-900/20 border border-white/10 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
              <Eye className="h-5 w-5" /> Détails de l'achat
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && achatViewIndex !== null && selectedProduct.achats?.[achatViewIndex] && (() => {
            const a = selectedProduct.achats[achatViewIndex];
            const isDispo = a.disponible !== false;
            return (
              <div className="space-y-2 text-sm">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Date :</span> <span className="text-white font-semibold">{new Date(a.date).toLocaleDateString('fr-FR')}</span></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Quantité :</span> <span className="text-white font-semibold">+{a.quantity}</span></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Prix d'achat :</span> <span className="text-amber-300 font-bold">{a.purchasePrice}€</span></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Fournisseur :</span> <span className="text-cyan-300 font-semibold">{a.fournisseur || '—'}</span></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Disponibilité :</span> <Badge className={cn('ml-2 border-0', isDispo ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200')}>{isDispo ? '✓ Disponible' : '✕ Indisponible'}</Badge></div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button onClick={() => setAchatViewIndex(null)} variant="outline">Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={achatEditIndex !== null} onOpenChange={(o) => !o && setAchatEditIndex(null)}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-amber-900/30 to-orange-900/20 border border-white/10 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
              <Edit className="h-5 w-5" /> Modifier l'achat
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-white/80 text-xs">Date</Label>
              <Input type="date" value={achatEditForm.date} onChange={(e) => setAchatEditForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/80 text-xs">Quantité</Label>
              <Input type="number" min="0" value={achatEditForm.quantity} onChange={(e) => setAchatEditForm(f => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/80 text-xs">Prix d'achat (€)</Label>
              <Input type="number" step="0.01" min="0" value={achatEditForm.purchasePrice} onChange={(e) => setAchatEditForm(f => ({ ...f, purchasePrice: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <FournisseurAutocomplete
                value={achatEditForm.fournisseur}
                onChange={(val) => setAchatEditForm(f => ({ ...f, fournisseur: val }))}
                variant="dark"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 p-2 rounded-lg bg-white/5">
              <Checkbox id="achat-dispo-edit" checked={achatEditForm.disponible} onCheckedChange={(c) => setAchatEditForm(f => ({ ...f, disponible: !!c }))} />
              <Label htmlFor="achat-dispo-edit" className="text-white/80 text-sm cursor-pointer">Disponible (compte dans le stock vendable)</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAchatEditIndex(null)} disabled={achatSaving}>Annuler</Button>
            <Button onClick={handleSaveAchat} disabled={achatSaving} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              {achatSaving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={achatDeleteIndex !== null} onOpenChange={(o) => !o && setAchatDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet achat ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Si l'achat était disponible, sa quantité sera retirée du stock vendable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={achatDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAchat} disabled={achatDeleting} className="bg-red-600 hover:bg-red-700">
              {achatDeleting ? 'Suppression…' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ===== Sous-modales Vente ===== */}
      <Dialog open={venteViewIndex !== null} onOpenChange={(o) => !o && setVenteViewIndex(null)}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-rose-900/30 to-pink-900/20 border border-white/10 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
              <Eye className="h-5 w-5" /> Détails de la vente
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && venteViewIndex !== null && selectedProduct.ventes?.[venteViewIndex] && (() => {
            const v = selectedProduct.ventes[venteViewIndex];
            return (
              <div className="space-y-2 text-sm">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Date :</span> <span className="text-white font-semibold">{new Date(v.date).toLocaleDateString('fr-FR')}</span></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Quantité :</span> <span className="text-white font-semibold">-{v.quantity}</span></div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10"><span className="text-white/60">Prix de vente :</span> <span className="text-emerald-300 font-bold">{v.sellingPrice}€</span></div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button onClick={() => setVenteViewIndex(null)} variant="outline">Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={venteEditIndex !== null} onOpenChange={(o) => !o && setVenteEditIndex(null)}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-amber-900/30 to-orange-900/20 border border-white/10 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
              <Edit className="h-5 w-5" /> Modifier la vente
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-white/80 text-xs">Date</Label>
              <Input type="date" value={venteEditForm.date} onChange={(e) => setVenteEditForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/80 text-xs">Quantité</Label>
              <Input type="number" min="0" value={venteEditForm.quantity} onChange={(e) => setVenteEditForm(f => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/80 text-xs">Prix de vente (€)</Label>
              <Input type="number" step="0.01" min="0" value={venteEditForm.sellingPrice} onChange={(e) => setVenteEditForm(f => ({ ...f, sellingPrice: e.target.value }))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setVenteEditIndex(null)} disabled={venteSaving}>Annuler</Button>
            <Button onClick={handleSaveVente} disabled={venteSaving} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              {venteSaving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={venteDeleteIndex !== null} onOpenChange={(o) => !o && setVenteDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette vente ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La quantité vendue sera rendue au stock du produit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={venteDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVente} disabled={venteDeleting} className="bg-red-600 hover:bg-red-700">
              {venteDeleting ? 'Suppression…' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========== MODALE HISTORIQUE FOURNISSEURS ========== */}
      <Dialog open={isFournHistoryOpen} onOpenChange={setIsFournHistoryOpen}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-slate-900 via-cyan-900/30 to-blue-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
              <Eye className="h-5 w-5 text-cyan-400" />
              Historique fournisseurs
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (() => {
            const hist = (selectedProduct.fournisseursHistory || []).slice().sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());
            return (
              <div className="space-y-2">
                {hist.length === 0 && (
                  <p className="text-white/40 text-sm italic">Aucun fournisseur enregistré</p>
                )}
                {hist.map((f, i) => {
                  const dateFin = i < hist.length - 1 ? hist[i + 1].dateDebut : null;
                  return (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-cyan-300 font-bold text-base">{f.nom}</p>
                      <p className="text-white/50 text-xs mt-1">
                        Du {new Date(f.dateDebut).toLocaleDateString('fr-FR')}
                        {dateFin
                          ? ` au ${new Date(dateFin).toLocaleDateString('fr-FR')}`
                          : ' — En cours'}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AchatVenteSubModals;
