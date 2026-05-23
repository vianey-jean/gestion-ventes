/**
 * ConfirmDialog.tsx - Petite confirmation générique pour modif/suppression RDV.
 */
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}

const ConfirmDialog: React.FC<Props> = ({ open, onOpenChange, title, description, confirmLabel, destructive, onConfirm }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="bg-slate-900/95 border border-white/10 backdrop-blur-2xl rounded-3xl">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-white">{title}</AlertDialogTitle>
        <AlertDialogDescription className="text-white/70">{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">Annuler</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className={destructive
            ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white hover:scale-105'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:scale-105'}>
          {confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ConfirmDialog;
