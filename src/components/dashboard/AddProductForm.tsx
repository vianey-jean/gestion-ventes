import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PackagePlus, XCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface AddProductFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ isOpen, onClose }) => {
  const { addProduct } = useApp();

  const [formData, setFormData] = useState({
    description: '',
    purchasePrice: '',
    quantity: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!formData.description) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.purchasePrice) {
      newErrors.purchasePrice = "Le prix d'achat est requis";
    } else if (isNaN(Number(formData.purchasePrice)) || Number(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = "Le prix d'achat doit être un nombre positif";
    }

    if (!formData.quantity) {
      newErrors.quantity = 'La quantité est requise';
    } else if (
      isNaN(Number(formData.quantity)) ||
      !Number.isInteger(Number(formData.quantity)) ||
      Number(formData.quantity) < 0
    ) {
      newErrors.quantity = 'La quantité doit être un nombre entier positif';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 👉 Ouvre la confirmation luxe
    setOpenConfirm(true);
  };

  const confirmAddProduct = async () => {
    setIsSubmitting(true);

    try {
      await addProduct({
        description: formData.description,
        purchasePrice: Number(formData.purchasePrice),
        quantity: Number(formData.quantity),
      });

      setFormData({
        description: '',
        purchasePrice: '',
        quantity: '',
      });

      setOpenConfirm(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau produit à votre inventaire.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  name="description"
                  placeholder="Nom du produit"
                  value={formData.description}
                  onChange={handleChange}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prix d'achat (€)</Label>
                  <Input
                    name="purchasePrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    className={errors.purchasePrice ? 'border-red-500' : ''}
                  />
                  {errors.purchasePrice && (
                    <p className="text-sm text-red-500">{errors.purchasePrice}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Quantité</Label>
                  <Input
                    name="quantity"
                    type="number"
                    step="1"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={errors.quantity ? 'border-red-500' : ''}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-500">{errors.quantity}</p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-app-red hover:bg-opacity-90"
                disabled={isSubmitting}
              >
                Ajouter le produit
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
              <PackagePlus className="w-5 h-5 text-emerald-600" />
              Confirmer l’ajout du produit
            </AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment ajouter ce produit à votre inventaire ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Annuler
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmAddProduct}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddProductForm;
