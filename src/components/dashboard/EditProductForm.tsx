import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Pencil, XCircle } from 'lucide-react';
import { productService } from '@/service/api';
import { Product } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import ProductSearchInput from './ProductSearchInput';

interface EditProductFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: '',
    description: '',
    purchasePrice: 0,
    quantity: 0,
    additionalQuantity: 0,
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        id: selectedProduct.id,
        description: selectedProduct.description,
        purchasePrice: selectedProduct.purchasePrice,
        quantity: selectedProduct.quantity,
        additionalQuantity: 0,
      });
    }
  }, [selectedProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'description' ? value : Number(value),
    });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id) {
      toast({
        title: 'Erreur',
        description: "Veuillez sélectionner un produit d'abord",
        variant: 'destructive',
        className: 'notification-erreur',
      });
      return;
    }

    // 👉 Ouvre la confirmation premium
    setOpenConfirm(true);
  };

  const confirmUpdate = async () => {
    try {
      setIsLoading(true);

      const updatedProduct = {
        id: formData.id,
        description: formData.description,
        purchasePrice: formData.purchasePrice,
        quantity: formData.quantity + formData.additionalQuantity,
      };

      await productService.updateProduct(updatedProduct);

      toast({
        title: 'Succès',
        description: 'Le produit a été modifié avec succès',
        className: 'notification-success',
      });

      setOpenConfirm(false);
      onClose();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Une erreur s'est produite lors de la modification du produit",
        variant: 'destructive',
        className: 'notification-erreur',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier un produit</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rechercher un produit</Label>
              <ProductSearchInput onProductSelect={handleSelectProduct} context="edit" />
            </div>

            {selectedProduct && (
              <>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prix d'achat</Label>
                  <Input
                    name="purchasePrice"
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quantité actuelle</Label>
                  <Input value={formData.quantity} readOnly className="bg-gray-100" />
                </div>

                <div className="space-y-2">
                  <Label>Ajouter quantité</Label>
                  <Input
                    name="additionalQuantity"
                    type="number"
                    value={formData.additionalQuantity}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-gray-500">
                    Quantité totale après modification :{' '}
                    {formData.quantity + formData.additionalQuantity}
                  </p>
                </div>
              </>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-app-blue hover:bg-opacity-90"
                disabled={!selectedProduct || isLoading}
              >
                Modifier le produit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 🔥 CONFIRMATION PREMIUM */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent className="rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <Pencil className="w-5 h-5 text-blue-600" />
              Confirmer la modification
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action mettra à jour définitivement les informations du produit.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUpdate}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditProductForm;
