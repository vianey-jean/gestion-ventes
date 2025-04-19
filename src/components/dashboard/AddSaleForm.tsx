import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { Product, Sale } from '@/types';
import ProductSearchInput from './ProductSearchInput';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddSaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  editSale?: Sale;
}

const AddSaleForm: React.FC<AddSaleFormProps> = ({ isOpen, onClose, editSale }) => {
  const { addSale, updateSale, deleteSale, products } = useApp();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    productId: '',
    sellingPrice: '',
    quantitySold: '1',
    purchasePrice: '',
    profit: '',
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxQuantity, setMaxQuantity] = useState(0);

  useEffect(() => {
    if (editSale) {
      const product = products.find(p => p.id === editSale.productId);
      if (product) {
        setSelectedProduct(product);
        setMaxQuantity(product.quantity + editSale.quantitySold);
      }
      setFormData({
        date: new Date(editSale.date).toISOString().split('T')[0],
        description: editSale.description,
        productId: editSale.productId,
        sellingPrice: editSale.sellingPrice.toFixed(2),
        quantitySold: editSale.quantitySold.toString(),
        purchasePrice: editSale.purchasePrice.toFixed(2),
        profit: editSale.profit.toFixed(2),
      });
    }
  }, [editSale, products]);

  const updateProfit = (price: string, quantity: string, purchasePrice: string) => {
    const selling = Number(price);
    const qty = Number(quantity);
    const purchase = Number(purchasePrice);
    if (!isNaN(selling) && !isNaN(qty) && !isNaN(purchase)) {
      const profit = (selling - purchase) * qty;
      setFormData(prev => ({
        ...prev,
        profit: profit.toFixed(2),
      }));
    }
  };

  const handleQuantityChange = (increment: boolean) => {
    const currentQty = Number(formData.quantitySold);
    let newQty = increment ? currentQty + 1 : currentQty - 1;
    if (newQty < 1) newQty = 1;
    if (newQty > maxQuantity) {
      toast({
        title: "Quantité insuffisante",
        description: `Stock disponible: ${maxQuantity} unités`,
        variant: "destructive",
      });
      return;
    }
    const qtyStr = newQty.toString();
    updateProfit(formData.sellingPrice, qtyStr, formData.purchasePrice);
    setFormData(prev => ({
      ...prev,
      quantitySold: qtyStr,
    }));
  };

  const handlePriceChange = (increment: boolean) => {
    const currentPrice = Number(formData.sellingPrice);
    const step = 1;
    const newPrice = increment ? currentPrice + step : currentPrice - step;
    if (newPrice < 0) return;
    const priceStr = newPrice.toFixed(2);
    updateProfit(priceStr, formData.quantitySold, formData.purchasePrice);
    setFormData(prev => ({
      ...prev,
      sellingPrice: priceStr,
    }));
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setMaxQuantity(product.quantity + (editSale?.quantitySold || 0));
    const defaultSellingPrice = (product.purchasePrice * 1.2).toFixed(2);
    const defaultQty = '1';
    updateProfit(defaultSellingPrice, defaultQty, product.purchasePrice.toFixed(2));
    setFormData({
      date: formData.date,
      description: product.description,
      productId: product.id,
      purchasePrice: product.purchasePrice.toFixed(2),
      sellingPrice: defaultSellingPrice,
      quantitySold: defaultQty,
      profit: ((Number(defaultSellingPrice) - product.purchasePrice) * 1).toFixed(2),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { productId, sellingPrice, quantitySold, purchasePrice, profit } = formData;

    if (!productId || !sellingPrice || !quantitySold || !purchasePrice || !profit) {
      toast({
        title: "Champs manquants",
        description: "Veuillez compléter toutes les informations avant de valider.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const saleData: Omit<Sale, 'id'> = {
        date: formData.date,
        productId,
        description: formData.description,
        sellingPrice: Number(sellingPrice),
        quantitySold: Number(quantitySold),
        purchasePrice: Number(purchasePrice),
        profit: Number(profit),
      };

      if (editSale) {
        await updateSale({ ...saleData, id: editSale.id });
      } else {
        await addSale(saleData);
      }

      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editSale) return;
    try {
      await deleteSale(editSale.id);
      toast({
        title: "Vente supprimée",
        description: "La vente a été supprimée avec succès.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la vente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editSale ? 'Modifier la vente' : 'Ajouter une vente'}</DialogTitle>
          <DialogDescription>
            {editSale ? 'Modifiez les détails de la vente ou supprimez-la.' : 'Enregistrez une nouvelle vente.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date de vente</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Produit</Label>
              {editSale ? (
                <Input value={formData.description} readOnly disabled />
              ) : (
                <ProductSearchInput onProductSelect={handleProductSelect} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prix d'achat (€)</Label>
                <Input value={formData.purchasePrice} readOnly disabled />
              </div>

              <div className="space-y-2">
                <Label>Prix de vente (€)</Label>
                <div className="flex items-center space-x-2">
                  <Button type="button" size="icon" variant="outline" onClick={() => handlePriceChange(false)}><Minus className="w-4 h-4" /></Button>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={e => {
                      const value = e.target.value;
                      updateProfit(value, formData.quantitySold, formData.purchasePrice);
                      setFormData(prev => ({ ...prev, sellingPrice: value }));
                    }}
                  />
                  <Button type="button" size="icon" variant="outline" onClick={() => handlePriceChange(true)}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantité vendue</Label>
                <div className="flex items-center space-x-2">
                  <Button type="button" size="icon" variant="outline" onClick={() => handleQuantityChange(false)}><Minus className="w-4 h-4" /></Button>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantitySold}
                    onChange={e => {
                      const value = e.target.value;
                      const num = Number(value);
                      if (num > maxQuantity) {
                        toast({
                          title: "Quantité insuffisante",
                          description: `Stock disponible: ${maxQuantity} unités`,
                          variant: "destructive",
                        });
                        return;
                      }
                      updateProfit(formData.sellingPrice, value, formData.purchasePrice);
                      setFormData(prev => ({ ...prev, quantitySold: value }));
                    }}
                  />
                  <Button type="button" size="icon" variant="outline" onClick={() => handleQuantityChange(true)}><Plus className="w-4 h-4" /></Button>
                </div>
                {selectedProduct && <p className="text-xs text-muted-foreground">Stock disponible: {maxQuantity}</p>}
              </div>

              <div className="space-y-2">
                <Label>Bénéfice (€)</Label>
                <Input value={formData.profit} readOnly disabled />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
              {editSale && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} className="bg-app-green hover:bg-opacity-90">
              {isSubmitting ? "Enregistrement..." : editSale ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSaleForm;
