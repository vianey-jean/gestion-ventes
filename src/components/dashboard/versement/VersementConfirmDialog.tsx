/**
 * Dialogue de confirmation réutilisable (suppression / modification)
 */
import React from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import PremiumLoading from '@/components/ui/premium-loading';

interface VersementConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
  onConfirm: () => void;
  processing?: boolean;
}

const VersementConfirmDialog: React.FC<VersementConfirmDialogProps> = ({
  open, onOpenChange, title, message, onConfirm, processing = false
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900 border border-gray-200 dark:border-gray-700 rounded-2xl">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">
          {title}
        </AlertDialogTitle>
        <AlertDialogDescription className="text-sm text-gray-600 dark:text-gray-300">
          {message}
        </AlertDialogDescription>
      </AlertDialogHeader>
      {processing && <PremiumLoading text="Traitement en cours…" size="sm" variant="default" />}
      <AlertDialogFooter className="flex gap-2">
        <AlertDialogCancel onClick={() => onOpenChange(false)} className="rounded-xl border-gray-300 dark:border-gray-600">
          Non, annuler
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700"
        >
          Oui, confirmer
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default VersementConfirmDialog;
