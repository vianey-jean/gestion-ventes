
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { Product, Sale } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import ProductSearchInput from './ProductSearchInput';
import SalePriceInput from './forms/SalePriceInput';
import SaleQuantityInput from './forms/SaleQuantityInput';
import ConfirmDeleteDialog from './forms/ConfirmDeleteDialog';

interface AddSaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  editSale?: Sale;
}

/**
 * Formulaire pour ajouter ou modifier une vente
 */
const AddSaleForm: React.FC<AddSaleFormProps> = ({ isOpen, onClose, editSale }) => {
  // Récupérer les fonctions et données du contexte
  const { products, addSale, updateSale, deleteSale } = useApp();
  const { toast } = useToast();
  
  // État pour les données du formulaire
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    description: '',
    productId: '',
    sellingPrice: '',
    quantitySold: '1',
    purchasePrice: '',
    profit: '',
  });
  
  // États pour gérer le formulaire
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxQuantity, setMaxQuantity] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Effet pour initialiser le formulaire avec les données d'une vente existante
  useEffect(() => {
    if (editSale) {
      // Trouver le produit correspondant à la vente
      const product = products.find(p => p.id === editSale.productId);
      
      // Initialiser le formulaire avec les données de la vente
      setFormData({
        date: new Date(editSale.date).toISOString().split('T')[0],
        description: editSale.description,
        productId: String(editSale.productId),
        sellingPrice: editSale.sellingPrice.toString(),
        quantitySold: editSale.quantitySold.toString(),
        purchasePrice: editSale.purchasePrice.toString(),
        profit: editSale.profit.toString(),
      });
      
      // Définir le produit sélectionné et calculer le stock maximum
      if (product) {
        setSelectedProduct(product);
        const editQuantity = editSale ? Number(editSale.quantitySold) : 0;
        const productQuantity = product.quantity !== undefined ? product.quantity : 0;
        setMaxQuantity(productQuantity + editQuantity);
      }
    } else {
      // Réinitialiser le formulaire pour un nouvel ajout
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        productId: '',
        sellingPrice: '',
        quantitySold: '1',
        purchasePrice: '',
        profit: '',
      });
      setSelectedProduct(null);
      setMaxQuantity(0);
    }
  }, [editSale, products, isOpen]);

  // Fonction pour calculer le profit
  const updateProfit = (price: string, quantity: string) => {
    if (formData.purchasePrice && price && quantity) {
      // Calculer le profit = (prix de vente - prix d'achat) * quantité
      const profit = (Number(price) - Number(formData.purchasePrice)) * Number(quantity);
      setFormData(prev => ({
        ...prev,
        profit: profit.toFixed(2),
      }));
    }
  };

  // Gestionnaire pour le changement de prix de vente
  const handleSellingPriceChange = (price: string) => {
    setFormData(prev => {
      updateProfit(price, prev.quantitySold);
      return {
        ...prev,
        sellingPrice: price,
      };
    });
  };

  // Gestionnaire pour le changement de quantité
  const handleQuantityChange = (quantity: string) => {
    setFormData(prev => {
      updateProfit(prev.sellingPrice, quantity);
      return {
        ...prev,
        quantitySold: quantity,
      };
    });
  };

  // Vérifier si le stock est épuisé
  const isOutOfStock = selectedProduct && (selectedProduct.quantity === 0 || selectedProduct.quantity === undefined);

  // Gestionnaire pour la sélection d'un produit
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    
    // Calculer le stock maximum disponible
    const productQuantity = product.quantity !== undefined ? product.quantity : 0;
    setMaxQuantity(productQuantity);
    
    // Initialiser les données du formulaire avec les infos du produit
    setFormData(prev => {
      const newData = {
        ...prev,
        description: product.description,
        productId: String(product.id),
        purchasePrice: product.purchasePrice.toString(),
        sellingPrice: (product.purchasePrice * 1.2).toFixed(2), // Prix de vente suggéré: +20%
        quantitySold: '1',
      };
      updateProfit(newData.sellingPrice, newData.quantitySold);
      return newData;
    });
  };

  // Fonction pour soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || isOutOfStock) {
      toast({
        title: "Erreur",
        description: "Stock épuisé. Impossible d'ajouter cette vente.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Préparer les données de la vente
      const saleData = {
        date: formData.date,
        productId: formData.productId,
        description: formData.description,
        sellingPrice: Number(formData.sellingPrice),
        quantitySold: Number(formData.quantitySold),
        purchasePrice: Number(formData.purchasePrice),
        profit: Number(formData.profit),
      };

      // Mettre à jour ou ajouter la vente
      let success: boolean | Sale = false;
      
      if (editSale && updateSale) {
        success = await updateSale({ ...saleData, id: editSale.id });
      } else if (addSale) {
        success = await addSale(saleData);
      }
      
      if (success) {
        toast({
          title: "Succès",
          description: editSale ? "Vente mise à jour avec succès" : "Vente ajoutée avec succès",
          variant: "default",
          className: "notification-success",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour gérer la suppression
  const handleDelete = async () => {
    if (!editSale || !deleteSale) return;
    
    setIsSubmitting(true);
    try {
      const success = await deleteSale(editSale.id);
      if (success) {
        toast({
          title: "Succès",
          description: "La vente a été supprimée avec succès",
          variant: "default",
          className: "notification-success",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Calculer si le profit est négatif
  const isProfitNegative = Number(formData.profit) < 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editSale ? 'Modifier la vente' : 'Ajouter une vente'}</DialogTitle>
            <DialogDescription>
              {editSale ? 'Modifiez les détails de la vente.' : 'Enregistrez une nouvelle vente.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Date de vente */}
              <div className="space-y-2">
                <Label htmlFor="date">Date de vente</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              
              {/* Sélection du produit */}
              <div className="space-y-2">
                <Label htmlFor="description">Produit</Label>
                {editSale ? (
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    readOnly
                    disabled
                  />
                ) : (
                  <ProductSearchInput onProductSelect={handleProductSelect} />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Prix d'achat */}
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Prix d'achat (€)</Label>
                  <Input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    readOnly
                    disabled
                  />
                </div>
                
                {/* Prix de vente avec composant dédié */}
                <SalePriceInput 
                  price={formData.sellingPrice}
                  onChange={handleSellingPriceChange}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Quantité vendue avec composant dédié */}
                <SaleQuantityInput
                  quantity={formData.quantitySold}
                  maxQuantity={maxQuantity}
                  onChange={handleQuantityChange}
                  disabled={isSubmitting || isOutOfStock}
                  showAvailableStock={!!selectedProduct}
                />
                
                {/* Bénéfice calculé */}
                <div className="space-y-2">
                  <Label htmlFor="profit">Bénéfice (€)</Label>
                  <Input
                    id="profit"
                    name="profit"
                    type="number"
                    step="0.01"
                    value={formData.profit}
                    readOnly
                    disabled
                    className={isProfitNegative ? "border-red-500 bg-red-50" : ""}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              {/* Bouton supprimer (uniquement en mode édition) */}
              {editSale && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
              
              {/* Bouton annuler */}
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              
              {/* Bouton enregistrer */}
              <Button
                type="submit"
                className="bg-app-green hover:bg-opacity-90"
                disabled={isSubmitting || (!editSale && (!selectedProduct || isOutOfStock))}
              >
                {isSubmitting 
                  ? "Enregistrement..." 
                  : isOutOfStock && !editSale
                    ? "Stock épuisé" 
                    : editSale 
                      ? "Mettre à jour" 
                      : "Ajouter"
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression */}
      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer la vente"
        description="Êtes-vous sûr de vouloir supprimer cette vente ? Cette action ne peut pas être annulée."
      />
    </>
  );
};

export default AddSaleForm;
