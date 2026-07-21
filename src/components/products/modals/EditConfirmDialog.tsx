import React from 'react';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  isSubmitting: boolean;
  onConfirm: () => void;
}

const EditConfirmDialog: React.FC<Props> = ({ open, onOpenChange, isSubmitting, onConfirm }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
      <AlertDialogHeader className="text-center space-y-4">
        <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
          <CheckCircle2 className="h-7 w-7 text-white" />
        </div>
        <AlertDialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          Confirmer la modification
        </AlertDialogTitle>
        <AlertDialogDescription className="text-muted-foreground">
          Voulez-vous vraiment modifier ce produit ?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="flex gap-3 pt-4">
        <AlertDialogCancel className="rounded-xl border-2 font-bold">Annuler</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={isSubmitting}
          className="rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-0"
        >
          {isSubmitting ? 'Modification...' : 'Confirmer'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default EditConfirmDialog;
