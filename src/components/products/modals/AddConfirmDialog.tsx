/**
 * AddConfirmDialog.tsx — Confirmation d'ajout produit.
 */
import React from 'react';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { PackagePlus, CheckCircle2, XCircle } from 'lucide-react';
import type { AddProductForm } from './AddProductModal';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  addForm: AddProductForm;
  photoCount: number;
  isSubmitting: boolean;
  onConfirm: () => void;
}

const AddConfirmDialog: React.FC<Props> = ({ open, onOpenChange, addForm, photoCount, isSubmitting, onConfirm }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="bg-gradient-to-br from-white via-emerald-50/30 to-green-50/50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
      <AlertDialogHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
          <PackagePlus className="h-8 w-8 text-white" />
        </div>
        <AlertDialogTitle className="text-xl font-black bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
          ✨ Confirmer l'ajout
        </AlertDialogTitle>
        <AlertDialogDescription className="text-muted-foreground font-medium">
          Voulez-vous vraiment ajouter ce produit ?
        </AlertDialogDescription>
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border-2 border-emerald-100 dark:border-emerald-800/30 text-left space-y-2">
          <div className="flex justify-between"><span className="text-muted-foreground text-sm">Produit:</span><span className="font-bold">{addForm.description}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground text-sm">Prix:</span><span className="font-bold text-amber-600">{addForm.purchasePrice}€</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground text-sm">Quantité:</span><span className="font-bold text-blue-600">{addForm.quantity}</span></div>
          {addForm.fournisseur && <div className="flex justify-between"><span className="text-muted-foreground text-sm">Fournisseur:</span><span className="font-bold text-orange-600">{addForm.fournisseur}</span></div>}
          {photoCount > 0 && <div className="flex justify-between"><span className="text-muted-foreground text-sm">Photos:</span><span className="font-bold text-purple-600">{photoCount}</span></div>}
        </div>
      </AlertDialogHeader>
      <AlertDialogFooter className="flex gap-3 pt-4">
        <AlertDialogCancel className="flex-1 rounded-xl border-2 font-bold"><XCircle className="h-5 w-5 mr-2" />Annuler</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={isSubmitting}
          className="flex-1 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 border-0"
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />{isSubmitting ? 'Ajout...' : 'Confirmer'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default AddConfirmDialog;
