import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, ArrowLeftRight, Plus, Package, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Sale, SaleProduct, Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import saleApiService from '@/services/api/saleApi';
import api from '@/services/api/api';
import SaleProductCard from '../sections/SaleProductCard';
import { livraisonVilleApi, LivraisonVille } from '@/services/api/villesApi';
import {
  FormProduct,
  ReductionType,
  createEmptyFormProduct,
  computeReductionAmount,
} from '../types/saleFormTypes';

interface EchangerVentesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Normalise une vente legacy single-produit en SaleProduct[] */
const normalizeSaleProducts = (sale: Sale): SaleProduct[] => {
  if (sale.products && sale.products.length > 0) return sale.products;
  if (sale.productId && sale.description) {
    return [{
      productId: sale.productId,
      description: sale.description,
      quantitySold: sale.quantitySold || 0,
      purchasePrice: sale.purchasePrice || 0,
      sellingPrice: sale.sellingPrice || 0,
      profit: sale.profit || 0,
      deliveryFee: sale.deliveryFee || 0,
    }];
  }
  return [];
};

const EchangerVentesModal: React.FC<EchangerVentesModalProps> = ({ isOpen, onClose }) => {
  const { sales, products, refreshData } = useApp() as any;
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [removedIndexes, setRemovedIndexes] = useState<Set<number>>(new Set());
  const [newProducts, setNewProducts] = useState<FormProduct[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [villesLivraison, setVillesLivraison] = useState<LivraisonVille[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedSale(null);
      setRemovedIndexes(new Set());
      setNewProducts([]);
      setConfirmOpen(false);
      return;
    }
    // Charger TOUTES les ventes (toutes années/mois confondus) pour la recherche
    saleApiService.getAll()
      .then((all) => setAllSales(Array.isArray(all) ? all : []))
      .catch(() => setAllSales(Array.isArray(sales) ? sales : []));
    // Charger les villes de livraison pour récupérer le tarif d'origine
    livraisonVilleApi.getAll().then(setVillesLivraison).catch(() => setVillesLivraison([]));
  }, [isOpen]);

  // Filtrage des ventes — exige au moins 3 caractères, recherche dans TOUT l'historique
  const filteredSales = useMemo(() => {
    const source = allSales.length > 0 ? allSales : (Array.isArray(sales) ? sales : []);
    const term = searchTerm.trim().toLowerCase();
    if (term.length < 3) return [];
    return source.filter((s: Sale) => {
      if (s.isRefund) return false;
      const name = (s.clientName || '').toLowerCase();
      const dateStr = (s.date || '').toLowerCase();
      const prods = normalizeSaleProducts(s);
      const descs = prods.map(p => (p.description || '').toLowerCase()).join(' | ');
      return name.includes(term) || dateStr.includes(term) || descs.includes(term);
    }).slice(0, 50);
  }, [allSales, sales, searchTerm]);

  const toggleRemove = (idx: number) => {
    setRemovedIndexes(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  // ====== Gestion des nouvelles lignes via FormProduct / SaleProductCard ======
  const addNewProductLine = () => setNewProducts(prev => [...prev, createEmptyFormProduct()]);
  const removeNewProductLine = (idx: number) => setNewProducts(prev => prev.filter((_, i) => i !== idx));

  const recomputeProfit = (p: FormProduct): string => {
    const qty = Number(p.quantitySold || 0);
    const sell = Number(p.sellingPriceUnit || 0);
    const buy = Number(p.purchasePriceUnit || 0);
    const reductionAmount = computeReductionAmount(sell, qty, Number(p.reduction || 0), p.reductionType);
    return String(((sell * qty) - reductionAmount) - (buy * qty));
  };

  const handleProductSelect = (prod: Product, index: number) => {
    setNewProducts(prev => prev.map((p, i) => {
      if (i !== index) return p;
      const updated: FormProduct = {
        ...p,
        productId: prod.id,
        description: prod.description,
        selectedProduct: prod,
        purchasePriceUnit: String(prod.purchasePrice || 0),
        sellingPriceUnit: String(prod.sellingPrice || 0),
        maxQuantity: prod.quantity || 0,
      };
      return { ...updated, profit: recomputeProfit(updated) };
    }));
  };

  const handleSellingPriceChange = (value: string, index: number) => {
    setNewProducts(prev => prev.map((p, i) => {
      if (i !== index) return p;
      const updated = { ...p, sellingPriceUnit: value };
      return { ...updated, profit: recomputeProfit(updated) };
    }));
  };

  const handleQuantityChange = (value: string, index: number) => {
    setNewProducts(prev => prev.map((p, i) => {
      if (i !== index) return p;
      const requested = Number(value || 0);
      if (p.selectedProduct && requested > (p.maxQuantity || 0)) {
        toast({
          title: 'Quantité dépassée',
          description: `Stock disponible: ${p.maxQuantity} pour ${p.description}`,
          variant: 'destructive',
        });
        return p;
      }
      const updated = { ...p, quantitySold: value };
      return { ...updated, profit: recomputeProfit(updated) };
    }));
  };

  const handleAvanceChange = (value: string, index: number) => {
    setNewProducts(prev => prev.map((p, i) => i === index ? { ...p, avancePretProduit: value } : p));
  };

  const handleDeliveryChange = (location: string, fee: string, index: number) => {
    setNewProducts(prev => prev.map((p, i) => i === index ? { ...p, deliveryLocation: location, deliveryFee: fee } : p));
  };

  const handleReductionChange = (value: string, type: ReductionType, index: number) => {
    setNewProducts(prev => prev.map((p, i) => {
      if (i !== index) return p;
      const updated = { ...p, reduction: value, reductionType: type };
      return { ...updated, profit: recomputeProfit(updated) };
    }));
  };

  // ====== Totaux ======
  const saleProductsList = selectedSale ? normalizeSaleProducts(selectedSale) : [];
  const keptProducts = saleProductsList.filter((_, i) => !removedIndexes.has(i));

  const builtNewSaleProducts: SaleProduct[] = useMemo(() => {
    return newProducts.filter(np => np.productId && Number(np.quantitySold) > 0).map(np => {
      const qty = Number(np.quantitySold || 0);
      const unitPurchase = Number(np.purchasePriceUnit || 0);
      const unitSelling = Number(np.sellingPriceUnit || 0);
      const reduction = Number(np.reduction || 0);
      const reductionAmount = computeReductionAmount(unitSelling, qty, reduction, np.reductionType);
      const sellingTotalBefore = unitSelling * qty;
      const totalSelling = sellingTotalBefore - reductionAmount;
      const totalPurchase = unitPurchase * qty;
      const deliveryFee = Number(np.deliveryFee || 0);
      const cityEntry = villesLivraison.find(
        v => v.ville.toLowerCase() === (np.deliveryLocation || '').toLowerCase()
      );
      const originalDeliveryFee = cityEntry ? Number(cityEntry.fee) : deliveryFee;
      const deliveryFeeAdjustment = deliveryFee - originalDeliveryFee;
      return {
        productId: np.productId,
        description: np.description,
        quantitySold: qty,
        // On stocke les TOTAUX (unité × quantité) pour rester cohérent avec le format
        // utilisé par MultiProductSaleForm et par toutes les autres ventes de sales.json.
        purchasePrice: totalPurchase,
        sellingPrice: totalSelling,
        profit: totalSelling - totalPurchase,
        deliveryFee,
        deliveryLocation: np.deliveryLocation,
        originalDeliveryFee,
        deliveryFeeAdjustment,
        reduction,
        reductionType: np.reductionType,
        reductionAmount,
        sellingPriceBeforeReduction: sellingTotalBefore,
      } as SaleProduct;
    });
  }, [newProducts, villesLivraison]);

  const newTotals = useMemo(() => {
    const allLines: SaleProduct[] = [...keptProducts, ...builtNewSaleProducts];
    // purchasePrice / sellingPrice sont désormais des TOTAUX pour toutes les lignes
    // (kept = déjà en total dans sales.json, new = converti ci-dessus).
    const totalPurchasePrice = allLines.reduce((s, p) => s + (p.purchasePrice || 0), 0);
    const totalSellingPrice = allLines.reduce((s, p) => {
      const before = p.sellingPriceBeforeReduction ?? (p.sellingPrice || 0);
      const reduc = p.reductionAmount ?? 0;
      // Si sellingPrice est déjà "après réduction", ne pas re-soustraire
      return s + (p.sellingPriceBeforeReduction != null ? (before - reduc) : (p.sellingPrice || 0));
    }, 0);
    const totalProfit = allLines.reduce((s, p) => s + (p.profit || 0), 0);
    const totalDeliveryFee = allLines.reduce((s, p) => s + (p.deliveryFee || 0), 0);
    return { allLines, totalPurchasePrice, totalSellingPrice, totalProfit, totalDeliveryFee };
  }, [keptProducts, builtNewSaleProducts]);

  const canValidate = !!selectedSale && (removedIndexes.size > 0 || builtNewSaleProducts.length > 0);

  const handleValidate = () => {
    if (!selectedSale) return;
    if (!canValidate) {
      toast({ title: 'Aucun changement', description: 'Sélectionnez au moins un produit à retirer ou à ajouter.', variant: 'destructive' });
      return;
    }
    for (const np of builtNewSaleProducts) {
      const p = (products as Product[]).find(x => x.id === np.productId);
      if (!p) {
        toast({ title: 'Produit introuvable', description: np.description, variant: 'destructive' });
        return;
      }
      if ((p.quantity ?? 0) < np.quantitySold) {
        toast({ title: 'Stock insuffisant', description: `${p.description}: stock ${p.quantity}, demandé ${np.quantitySold}`, variant: 'destructive' });
        return;
      }
    }
    setConfirmOpen(true);
  };

  const performExchange = async () => {
    if (!selectedSale) return;
    setIsSubmitting(true);
    try {
      // 1. Restaurer le stock des produits retirés
      for (const idx of Array.from(removedIndexes)) {
        const removed = saleProductsList[idx];
        if (!removed?.productId) continue;
        const isAvance = (removed.description || '').toLowerCase().includes('avance');
        if (isAvance) continue;
        const p = (products as Product[]).find(x => x.id === removed.productId);
        const current = p?.quantity ?? 0;
        try {
          await api.put(`/api/products/${removed.productId}`, { quantity: current + (removed.quantitySold || 0) });
        } catch (e) { console.error('restore stock fail', e); }
      }

      // 2. Décrémenter le stock pour les nouveaux produits
      for (const np of builtNewSaleProducts) {
        const p = (products as Product[]).find(x => x.id === np.productId);
        const current = p?.quantity ?? 0;
        try {
          await api.put(`/api/products/${np.productId}`, { quantity: Math.max(0, current - np.quantitySold) });
        } catch (e) { console.error('decrement stock fail', e); }
      }

      // 3. Construire la nouvelle vente (même date, même client)
      const updatedProducts: SaleProduct[] = newTotals.allLines;

      if (updatedProducts.length === 0) {
        await saleApiService.delete(selectedSale.id);
        toast({ title: 'Vente supprimée', description: 'Tous les produits ont été retirés, la vente a été supprimée.' });
      } else {
        const payload: Partial<Sale> = {
          date: selectedSale.date,
          clientName: selectedSale.clientName,
          clientPhone: selectedSale.clientPhone,
          clientAddress: selectedSale.clientAddress,
          clientVille: selectedSale.clientVille,
          products: updatedProducts,
          totalPurchasePrice: newTotals.totalPurchasePrice,
          totalSellingPrice: newTotals.totalSellingPrice,
          totalProfit: newTotals.totalProfit,
          totalDeliveryFee: newTotals.totalDeliveryFee,
        };
        await saleApiService.update(selectedSale.id, payload);
        toast({ title: 'Échange effectué ✅', description: 'La vente a été mise à jour avec les nouveaux produits.' });
      }

      try { await refreshData?.(); } catch {}
      setConfirmOpen(false);
      onClose();
    } catch (err: any) {
      console.error('Erreur échange ventes:', err);
      toast({ title: 'Erreur', description: err?.message || "Impossible d'effectuer l'échange", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900/30 to-indigo-900/20 border border-white/10 rounded-3xl text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-purple-300" />
              Échanger des ventes
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Recherchez une vente, retirez les produits à échanger et ajoutez les nouveaux.
            </DialogDescription>
          </DialogHeader>

          {!selectedSale && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Saisir au moins 3 caractères (client, produit ou date YYYY-MM-DD)..."
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
                {searchTerm.trim().length < 3 && (
                  <p className="text-white/50 text-sm text-center py-8">Saisissez au moins 3 caractères pour rechercher.</p>
                )}
                {searchTerm.trim().length >= 3 && filteredSales.length === 0 && (
                  <p className="text-white/50 text-sm text-center py-8">Aucune vente trouvée.</p>
                )}
                {filteredSales.map((s: Sale) => {
                  const prods = normalizeSaleProducts(s);
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedSale(s); setRemovedIndexes(new Set()); setNewProducts([]); }}
                      className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-purple-200">{s.clientName || 'Client inconnu'}</p>
                          <p className="text-xs text-white/60">{s.date}</p>
                          <p className="text-xs text-white/70 truncate mt-1">
                            {prods.map(p => `${p.description} ×${p.quantitySold}`).join(' • ')}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-emerald-300 whitespace-nowrap">
                          {(s.totalSellingPrice ?? s.sellingPrice ?? 0).toFixed(2)} €
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedSale && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                <div>
                  <p className="text-sm text-white/60">Vente sélectionnée</p>
                  <p className="font-semibold">{selectedSale.clientName || 'Client inconnu'} — {selectedSale.date}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-white/70 hover:text-white" onClick={() => { setSelectedSale(null); setRemovedIndexes(new Set()); setNewProducts([]); }}>
                  <X className="h-4 w-4 mr-1" /> Changer
                </Button>
              </div>

              {/* Produits actuels */}
              <div>
                <Label className="text-purple-200 font-semibold">Produits de la vente — cocher pour retirer</Label>
                <div className="space-y-2 mt-2">
                  {saleProductsList.map((p, idx) => {
                    const removed = removedIndexes.has(idx);
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition cursor-pointer ${removed ? 'bg-red-500/10 border-red-500/40 line-through opacity-70' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        onClick={() => toggleRemove(idx)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <input type="checkbox" checked={removed} onChange={() => toggleRemove(idx)} className="accent-red-500" />
                            <Package className="h-4 w-4 text-purple-300" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{p.description}</p>
                              <p className="text-xs text-white/60">
                                Qté: {p.quantitySold} • PU achat: {(p.purchasePrice || 0).toFixed(2)} € • PU vente: {(p.sellingPrice || 0).toFixed(2)} €
                                {p.deliveryFee ? ` • Livraison: ${p.deliveryFee.toFixed(2)} €` : ''}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-emerald-300 whitespace-nowrap">
                            {((p.sellingPrice || 0) * (p.quantitySold || 0)).toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nouveaux produits via SaleProductCard */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-purple-200 font-semibold">Nouveaux produits à ajouter</Label>
                  <Button size="sm" type="button" onClick={addNewProductLine} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </div>
                <div className="space-y-3 mt-2">
                  {newProducts.length === 0 && (
                    <p className="text-white/40 text-sm">Aucun nouveau produit. Cliquez sur "Ajouter".</p>
                  )}
                  {newProducts.map((line, idx) => (
                    <SaleProductCard
                      key={idx}
                      product={line}
                      index={idx}
                      canDelete={true}
                      isSubmitting={isSubmitting}
                      onProductSelect={handleProductSelect}
                      onSellingPriceChange={handleSellingPriceChange}
                      onQuantityChange={handleQuantityChange}
                      onDeleteProduct={removeNewProductLine}
                      onAvanceChange={handleAvanceChange}
                      onDeliveryChange={handleDeliveryChange}
                      onShowSlideshow={() => {}}
                      onReductionChange={handleReductionChange}
                      clientVille={selectedSale.clientVille}
                    />
                  ))}
                </div>
              </div>

              {/* Totaux */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xs text-white/60">Total Achat</p>
                  <p className="font-bold text-amber-300">{newTotals.totalPurchasePrice.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Total Vente</p>
                  <p className="font-bold text-emerald-300">{newTotals.totalSellingPrice.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Bénéfice</p>
                  <p className={`font-bold ${newTotals.totalProfit >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{newTotals.totalProfit.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Livraison</p>
                  <p className="font-bold text-blue-300">{newTotals.totalDeliveryFee.toFixed(2)} €</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose} className="border-red-400/40 hover:bg-red-500/10">
                  <span className="text-red-400 font-bold">Annuler</span>
                </Button>
                <Button onClick={handleValidate} disabled={!canValidate || isSubmitting} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  <ArrowLeftRight className="h-4 w-4 mr-1" /> Valider l'échange
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-slate-900 border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'échange ?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Les produits retirés seront remis en stock et les nouveaux produits seront décrémentés du stock. La date de la vente sera conservée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-red-400/40 hover:bg-red-500/10">
              <span className="text-red-400 font-bold">Annuler</span>
            </AlertDialogCancel>
            <AlertDialogAction disabled={isSubmitting} onClick={performExchange} className="bg-purple-600 hover:bg-purple-700">
              {isSubmitting ? 'Traitement...' : 'Confirmer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EchangerVentesModal;
