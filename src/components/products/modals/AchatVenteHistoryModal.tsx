/**
 * AchatVenteHistoryModal.tsx — Historique complet stock (achats + ventes) d'un produit.
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Eye, Edit, Trash2, PackagePlus, ShoppingBag } from 'lucide-react';
import { Product } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  selectedProduct: Product | null;
  togglingAchatIndex: number | null;
  onToggleAchatDispo: (i: number, next: boolean) => void;
  onViewAchat: (i: number) => void;
  onEditAchat: (i: number) => void;
  onDeleteAchat: (i: number) => void;
  onViewVente: (i: number) => void;
  onEditVente: (i: number) => void;
  onDeleteVente: (i: number) => void;
}

const AchatVenteHistoryModal: React.FC<Props> = ({
  open, onOpenChange, selectedProduct, togglingAchatIndex,
  onToggleAchatDispo, onViewAchat, onEditAchat, onDeleteAchat,
  onViewVente, onEditVente, onDeleteVente,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-xl bg-gradient-to-br from-slate-900 via-emerald-900/30 to-teal-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
          <Eye className="h-5 w-5 text-emerald-400" />
          Historique stock — {selectedProduct?.description}
        </DialogTitle>
      </DialogHeader>
      {selectedProduct && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30">
            <p className="text-white/70 text-xs font-semibold">Reste en stock</p>
            <p className={cn("text-3xl font-black", selectedProduct.quantity > 0 ? "text-emerald-300" : "text-red-400")}>
              {selectedProduct.quantity} unité{selectedProduct.quantity > 1 ? 's' : ''}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-2">
              <PackagePlus className="h-4 w-4" /> Achats ({selectedProduct.achats?.length || 0})
            </h4>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(selectedProduct.achats || [])
                .map((a, originalIndex) => ({ a, originalIndex }))
                .slice()
                .sort((x, y) => new Date(x.a.date).getTime() - new Date(y.a.date).getTime())
                .map(({ a, originalIndex }) => {
                  const isDispo = a.disponible !== false;
                  const isToggling = togglingAchatIndex === originalIndex;
                  return (
                    <div key={originalIndex}
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl border transition-all",
                        isDispo ? "bg-white/5 border-white/10" : "bg-rose-500/10 border-rose-400/30"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white/90 text-sm font-semibold">+{a.quantity} unité{a.quantity > 1 ? 's' : ''}</p>
                          <Badge className={cn("text-[10px] font-bold border-0", isDispo ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200")}>
                            {isDispo ? '✓ Disponible' : '✕ Indisponible'}
                          </Badge>
                        </div>
                        <p className="text-white/50 text-xs mt-1">
                          {new Date(a.date).toLocaleDateString('fr-FR')}{a.fournisseur ? ` • ${a.fournisseur}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <span className="text-amber-300 font-bold whitespace-nowrap">{a.purchasePrice}€</span>
                        <Button size="sm" variant="outline" disabled={isToggling}
                          onClick={() => onToggleAchatDispo(originalIndex, !isDispo)}
                          className={cn(
                            "h-8 px-3 text-[11px] sm:text-xs rounded-lg border-0 font-bold transition-all whitespace-nowrap",
                            isDispo
                              ? "bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white"
                              : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                          )}
                        >
                          {isToggling ? '…' : isDispo ? '→ Indisponible' : '→ Disponible'}
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10" onClick={() => onViewAchat(originalIndex)} title="Voir">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-300 hover:text-amber-200 hover:bg-amber-500/10" onClick={() => onEditAchat(originalIndex)} title="Modifier">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-300 hover:text-rose-200 hover:bg-rose-500/10" onClick={() => onDeleteAchat(originalIndex)} title="Supprimer">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {(!selectedProduct.achats || selectedProduct.achats.length === 0) && (
                <p className="text-white/40 text-sm italic">Aucun achat enregistré</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-rose-300 mb-2 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Ventes ({selectedProduct.ventes?.length || 0})
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {(selectedProduct.ventes || [])
                .map((v, originalIndex) => ({ v, originalIndex }))
                .slice()
                .sort((x, y) => new Date(x.v.date).getTime() - new Date(y.v.date).getTime())
                .map(({ v, originalIndex }) => (
                  <div key={originalIndex} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex-1 min-w-0">
                      <p className="text-white/90 text-sm font-semibold">-{v.quantity} unité{v.quantity > 1 ? 's' : ''}</p>
                      <p className="text-white/50 text-xs">{new Date(v.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                      <span className="text-emerald-300 font-bold whitespace-nowrap">{v.sellingPrice}€</span>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10" onClick={() => onViewVente(originalIndex)} title="Voir">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-300 hover:text-amber-200 hover:bg-amber-500/10" onClick={() => onEditVente(originalIndex)} title="Modifier">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-300 hover:text-rose-200 hover:bg-rose-500/10" onClick={() => onDeleteVente(originalIndex)} title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              {(!selectedProduct.ventes || selectedProduct.ventes.length === 0) && (
                <p className="text-white/40 text-sm italic">Aucune vente enregistrée</p>
              )}
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

export default AchatVenteHistoryModal;
