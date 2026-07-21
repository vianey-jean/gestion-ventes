import React from 'react';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, XCircle } from 'lucide-react';
import { Product } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  selectedProduct: Product | null;
  isSubmitting: boolean;
  onConfirm: () => void;
}

const DeleteConfirmDialog: React.FC<Props> = ({ open, onOpenChange, selectedProduct, isSubmitting, onConfirm }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="bg-gradient-to-br from-white via-red-50/30 to-rose-50/50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
      <AlertDialogHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 via-red-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30 animate-pulse">
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>
        <AlertDialogTitle className="text-2xl font-black bg-gradient-to-r from-red-600 via-red-700 to-rose-700 bg-clip-text text-transparent">
          ⚠️ Supprimer ce produit ?
        </AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="space-y-2">
            <p className="font-semibold text-red-600">Vous êtes sur le point de supprimer définitivement :</p>
            <p className="text-lg font-bold bg-red-100/50 dark:bg-red-900/20 px-4 py-2 rounded-xl">"{selectedProduct?.description}"</p>
            <p className="text-sm text-red-500 mt-4">⚠️ Cette action est <span className="font-bold">irréversible</span>. Toutes les données et photos seront perdues.</p>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="flex gap-3 pt-6">
        <AlertDialogCancel className="flex-1 rounded-xl border-2 font-semibold"><XCircle className="mr-2 h-5 w-5" />Annuler</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={isSubmitting}
          className="flex-1 rounded-xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700 text-white border-0 shadow-lg shadow-red-500/30"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          {isSubmitting ? 'Suppression...' : 'Confirmer la suppression'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default DeleteConfirmDialog;
