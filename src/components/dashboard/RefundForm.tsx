import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Sale } from '@/types';
import { Search, RotateCcw, Trash2, Euro, Package, X, AlertTriangle, Edit3 } from 'lucide-react';
import remboursementApiService from '@/services/api/remboursementApi';
import pretProduitApiService from '@/services/api/pretProduitApi';

interface RefundFormProps {
  isOpen: boolean;
  onClose: () => void;
  editSale?: Sale; // If provided, refund this specific sale
}

interface RefundProduct {
  productId: string;
  description: string;
  quantitySold: number;
  maxQuantity: number;
  purchasePriceUnit: number;
  refundPriceUnit: number;
  originalSellingPriceUnit: number;
  profit: number;
}

const RefundForm: React.FC<RefundFormProps> = ({ isOpen, onClose, editSale }) => {
  const { refreshData } = useApp();
  const { toast } = useToast();

  const [clientSearch, setClientSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [refundProducts, setRefundProducts] = useState<RefundProduct[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [linkedPrets, setLinkedPrets] = useState<any[]>([]);
  const [pretAction, setPretAction] = useState<'delete' | 'modify'>('delete');

  // Initialize from editSale if provided
  React.useEffect(() => {
    if (isOpen && editSale) {
      setSelectedSale(editSale);
      initRefundProducts(editSale);
      setClientSearch(editSale.clientName || '');
      setDate(new Date().toISOString().split('T')[0]);
      checkLinkedPrets(editSale);
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, editSale]);

  const resetForm = () => {
    setClientSearch('');
    setSearchResults([]);
    setSelectedSale(null);
    setRefundProducts([]);
    setDate(new Date().toISOString().split('T')[0]);
    setLinkedPrets([]);
    setPretAction('delete');
  };

  const initRefundProducts = (sale: Sale) => {
    if (sale.products && sale.products.length > 0) {
      setRefundProducts(sale.products.map(p => ({
        productId: p.productId,
        description: p.description,
        quantitySold: p.quantitySold,
        maxQuantity: p.quantitySold,
        purchasePriceUnit: p.purchasePrice / (p.quantitySold || 1),
        refundPriceUnit: p.sellingPrice / (p.quantitySold || 1),
        originalSellingPriceUnit: p.sellingPrice / (p.quantitySold || 1),
        profit: p.profit
      })));
    } else if (sale.productId) {
      setRefundProducts([{
        productId: sale.productId,
        description: sale.description || '',
        quantitySold: sale.quantitySold || 1,
        maxQuantity: sale.quantitySold || 1,
        purchasePriceUnit: (sale.purchasePrice || 0) / (sale.quantitySold || 1),
        refundPriceUnit: (sale.sellingPrice || 0) / (sale.quantitySold || 1),
        originalSellingPriceUnit: (sale.sellingPrice || 0) / (sale.quantitySold || 1),
        profit: sale.profit || 0
      }]);
    }
  };

  // Check if the sale has linked pret produits (advances)
  const checkLinkedPrets = async (sale: Sale) => {
    try {
      const allPrets = await pretProduitApiService.getAll();
      const clientName = sale.clientName?.toLowerCase() || '';
      const saleProducts = sale.products?.map(p => p.description?.toLowerCase()) || [sale.description?.toLowerCase()];
      
      const linked = allPrets.filter(pret => {
        const pretNom = (pret.nom || '').toLowerCase();
        const pretDesc = (pret.description || '').toLowerCase();
        return (pretNom.includes(clientName) || clientName.includes(pretNom)) &&
               saleProducts.some(sp => sp && (pretDesc.includes(sp) || sp.includes(pretDesc)));
      });
      
      setLinkedPrets(linked);
    } catch (error) {
      console.error('Error checking linked prets:', error);
    }
  };

  // Search sales by client name
  const handleSearch = useCallback(async (value: string) => {
    setClientSearch(value);
    if (value.length >= 3) {
      setIsSearching(true);
      try {
        const results = await remboursementApiService.searchSalesByClient(value);
        setSearchResults(results);
      } catch (error) {
        console.error('Erreur recherche:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  }, []);

  // Select a sale to refund
  const handleSelectSale = (sale: Sale) => {
    setSelectedSale(sale);
    setSearchResults([]);
    setClientSearch(sale.clientName || '');
    initRefundProducts(sale);
    checkLinkedPrets(sale);
  };

  // Remove a product from refund (keep at least 1)
  const removeProduct = (index: number) => {
    if (refundProducts.length <= 1) return;
    setRefundProducts(prev => prev.filter((_, i) => i !== index));
  };

  // Update quantity
  const updateQuantity = (index: number, value: string) => {
    const qty = Math.max(1, Math.min(Number(value) || 1, refundProducts[index].maxQuantity));
    setRefundProducts(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantitySold: qty,
        profit: (qty * updated[index].refundPriceUnit) - (qty * updated[index].purchasePriceUnit)
      };
      return updated;
    });
  };

  // Update refund price
  const updateRefundPrice = (index: number, value: string) => {
    const price = Number(value) || 0;
    setRefundProducts(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        refundPriceUnit: price,
        profit: (updated[index].quantitySold * price) - (updated[index].quantitySold * updated[index].purchasePriceUnit)
      };
      return updated;
    });
  };

  // Calculate totals
  const totals = refundProducts.reduce((acc, p) => ({
    totalRefundPrice: acc.totalRefundPrice + (p.quantitySold * p.refundPriceUnit),
    totalPurchasePrice: acc.totalPurchasePrice + (p.quantitySold * p.purchasePriceUnit),
    totalProfit: acc.totalProfit + p.profit
  }), { totalRefundPrice: 0, totalPurchasePrice: 0, totalProfit: 0 });

  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('fr-FR');

  // Handle pret produit when refunding
  const handlePretOnRefund = async () => {
    if (linkedPrets.length === 0) return;

    for (const pret of linkedPrets) {
      try {
        // Check which products are being refunded
        const refundedDescriptions = refundProducts.map(p => p.description.toLowerCase());
        const pretDesc = (pret.description || '').toLowerCase();
        
        const isLinked = refundedDescriptions.some(desc => pretDesc.includes(desc) || desc.includes(pretDesc));
        
        if (!isLinked) continue;

        if (pretAction === 'delete') {
          // Delete the pret produit entirely
          await pretProduitApiService.delete(pret.id);
          console.log(`🗑️ Prêt produit supprimé: ${pret.id}`);
        } else {
          // Modify: reduce the advance by the refund amount
          const refundTotal = totals.totalRefundPrice;
          const newAvance = Math.max(0, (pret.avanceRecue || 0) - refundTotal);
          const newReste = (pret.prixVente || 0) - newAvance;
          
          if (newAvance <= 0) {
            // If no advance left, delete the pret
            await pretProduitApiService.delete(pret.id);
            console.log(`🗑️ Prêt produit supprimé (avance à 0): ${pret.id}`);
          } else {
            await pretProduitApiService.update(pret.id, {
              avanceRecue: newAvance,
              reste: newReste,
              estPaye: newReste <= 0
            });
            console.log(`✏️ Prêt produit modifié: ${pret.id}, nouvelle avance: ${newAvance}`);
          }
        }
      } catch (error) {
        console.error('Erreur gestion prêt produit:', error);
      }
    }
  };

  // Submit refund
  const handleSubmit = async () => {
    if (!selectedSale || refundProducts.length === 0) return;
    setIsSubmitting(true);

    try {
      // Handle linked prets first
      await handlePretOnRefund();

      await remboursementApiService.create({
        originalSaleId: selectedSale.id,
        date,
        products: refundProducts.map(p => ({
          productId: p.productId,
          description: p.description,
          quantitySold: p.quantitySold,
          sellingPrice: p.quantitySold * p.refundPriceUnit,
          refundPrice: p.quantitySold * p.refundPriceUnit,
          refundPriceUnit: p.refundPriceUnit,
          purchasePrice: p.quantitySold * p.purchasePriceUnit,
          profit: p.profit
        })),
        totalRefundPrice: totals.totalRefundPrice,
        totalPurchasePrice: totals.totalPurchasePrice,
        totalProfit: totals.totalProfit,
        clientName: selectedSale.clientName,
        clientPhone: selectedSale.clientPhone,
        clientAddress: selectedSale.clientAddress
      });

      toast({
        title: "✅ Remboursement enregistré",
        description: `Remboursement de ${formatCurrency(totals.totalRefundPrice)} effectué avec succès${linkedPrets.length > 0 ? ' (prêt produit mis à jour)' : ''}`,
        className: "notification-success",
      });

      if (refreshData) refreshData();
      onClose();
    } catch (error) {
      console.error('Erreur remboursement:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement du remboursement",
        variant: "destructive",
        className: "notification-erreur",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.5)] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 backdrop-blur-sm">
              <RotateCcw className="h-5 w-5 text-amber-400" />
            </div>
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent font-black">
              Remboursement
            </span>
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Recherchez un client et sélectionnez la vente à rembourser
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label className="text-white/70">Date du remboursement</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white/[0.06] border-white/[0.1] text-white rounded-xl" />
          </div>

          {/* Search client */}
          {!selectedSale && (
            <div className="space-y-2">
              <Label className="text-white/70">Rechercher par nom du client (min. 3 caractères)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  value={clientSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Nom du client..."
                  className="pl-10 bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/20 rounded-xl"
                />
              </div>
              
              {isSearching && <p className="text-sm text-white/40">Recherche en cours...</p>}

              {searchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto border border-white/[0.08] rounded-xl divide-y divide-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
                  {searchResults.map((sale) => (
                    <div
                      key={sale.id}
                      onClick={() => handleSelectSale(sale)}
                      className="p-3 hover:bg-white/[0.06] cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-white/90">{sale.clientName}</p>
                          <p className="text-xs text-white/40">
                            {sale.products
                              ? sale.products.map(p => p.description).join(', ')
                              : sale.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-emerald-400">
                            {formatCurrency(sale.totalSellingPrice || sale.sellingPrice || 0)}
                          </p>
                          <p className="text-xs text-white/40">{formatDate(sale.date)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                  }
                </div>
              )}

              {clientSearch.length >= 3 && !isSearching && searchResults.length === 0 && (
                <p className="text-sm text-white/40">Aucune vente trouvée pour ce client</p>
              )}
            </div>
          )}

          {/* Selected sale info */}
          {selectedSale && (
            <>
              <div className="p-4 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-amber-400">
                      Vente sélectionnée - {selectedSale.clientName}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      Date: {formatDate(selectedSale.date)} • 
                      Total: {formatCurrency(selectedSale.totalSellingPrice || selectedSale.sellingPrice || 0)}
                    </p>
                  </div>
                  {!editSale && (
                    <Button variant="ghost" size="sm" onClick={resetForm} className="text-white/50 hover:text-white hover:bg-white/10">
                      <X className="h-4 w-4" /> Changer
                    </Button>
                  )}
                </div>
              </div>

              {/* Linked Pret Produit Warning */}
              {linkedPrets.length > 0 && (
                <div className="p-4 bg-yellow-500/[0.06] border border-yellow-500/20 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    <p className="font-bold text-sm text-yellow-400">
                      ⚠️ Cette vente a {linkedPrets.length} prêt(s) produit avec avance
                    </p>
                  </div>
                  {linkedPrets.map(pret => (
                    <div key={pret.id} className="text-xs text-white/50 mb-1">
                      • {pret.description} — Avance: {formatCurrency(pret.avanceRecue || 0)} / Reste: {formatCurrency(pret.reste || 0)}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant={pretAction === 'delete' ? 'default' : 'outline'}
                      onClick={() => setPretAction('delete')}
                      className={pretAction === 'delete' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                        : 'bg-white/[0.04] text-white/50 border-white/[0.1] hover:bg-white/[0.08]'}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Supprimer le prêt
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={pretAction === 'modify' ? 'default' : 'outline'}
                      onClick={() => setPretAction('modify')}
                      className={pretAction === 'modify' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30' 
                        : 'bg-white/[0.04] text-white/50 border-white/[0.1] hover:bg-white/[0.08]'}
                    >
                      <Edit3 className="h-3 w-3 mr-1" /> Modifier l'avance
                    </Button>
                  </div>
                </div>
              )}

              {/* Products to refund */}
              <div className="space-y-3">
                <Label className="text-sm font-bold text-white/70">Produits à rembourser</Label>
                {refundProducts.map((product, index) => (
                  <div key={index} className="p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl backdrop-blur-sm space-y-3 transition-all duration-300 hover:border-amber-500/20">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/20">
                          <Package className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="font-bold text-sm text-white/90">{product.description}</span>
                      </div>
                      {refundProducts.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-white/50">Quantité (max: {product.maxQuantity})</Label>
                        <Input
                          type="number"
                          min="1"
                          max={product.maxQuantity}
                          value={product.quantitySold}
                          onChange={(e) => updateQuantity(index, e.target.value)}
                          className="bg-white/[0.06] border-white/[0.1] text-white rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-white/50">Prix remb. unitaire (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={product.refundPriceUnit}
                          onChange={(e) => updateRefundPrice(index, e.target.value)}
                          className="bg-white/[0.06] border-white/[0.1] text-white rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-white/50">Total remboursement</Label>
                        <div className="h-10 flex items-center px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 font-black text-amber-400 text-sm">
                          {formatCurrency(product.quantitySold * product.refundPriceUnit)}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-white/40">
                      Prix d'achat unitaire: {formatCurrency(product.purchasePriceUnit)} • 
                      Bénéfice: <span className={product.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatCurrency(product.profit)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="p-4 bg-gradient-to-r from-amber-500/[0.06] to-orange-500/[0.06] border border-amber-500/20 rounded-xl backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-white/40">Total remboursement</p>
                    <p className="text-lg font-black text-amber-400">
                      {formatCurrency(totals.totalRefundPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Coût d'achat</p>
                    <p className="text-lg font-black text-white/60">
                      {formatCurrency(totals.totalPurchasePrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Impact bénéfice</p>
                    <p className="text-lg font-black text-red-400">
                      -{formatCurrency(Math.abs(totals.totalProfit))}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="bg-white/[0.04] border-white/[0.1] text-white/70 hover:bg-white/[0.08] hover:text-white">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedSale || refundProducts.length === 0}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg border border-amber-400/20"
          >
            {isSubmitting ? 'Enregistrement...' : '✓ Valider le remboursement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefundForm;
