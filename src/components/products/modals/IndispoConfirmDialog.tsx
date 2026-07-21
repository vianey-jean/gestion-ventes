import React from 'react';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { PackageX, CheckCircle } from 'lucide-react';
import { Product } from '@/types';

interface Props {
  target: Product | null;
  processing: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (e: React.MouseEvent) => void;
}

const IndispoConfirmDialog: React.FC<Props> = ({ target, processing, onOpenChange, onConfirm }) => (
  <AlertDialog open={!!target} onOpenChange={(open) => { if (!open && !processing) onOpenChange(false); }}>
    <AlertDialogContent className="bg-white dark:bg-gray-900 border-2 border-amber-300 shadow-2xl rounded-2xl max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-3 text-xl font-black">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
            <PackageX className="h-6 w-6 text-white" />
          </div>
          Rendre disponible ?
        </AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="space-y-3 pt-2 text-sm">
            {target && (() => {
              const qty = (target.achats || []).filter(a => a && a.disponible === false).reduce((s, a) => s + (Number(a.quantity) || 0), 0);
              return (
                <>
                  <div className="text-gray-700 dark:text-gray-200">
                    Confirmez-vous que <span className="font-bold text-amber-700">{qty}</span> unité(s) de <span className="font-bold">« {target.description} »</span> sont vraiment disponibles ?
                  </div>
                  <div className="text-xs text-gray-500 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg p-3">
                    Ces quantités seront ajoutées au stock vendable et les achats correspondants passeront à « Disponible » dans l'historique.
                  </div>
                </>
              );
            })()}
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="flex gap-3 pt-4">
        <AlertDialogCancel className="flex-1 rounded-xl border-2 font-bold" disabled={processing}>
          Annuler
        </AlertDialogCancel>
        <AlertDialogAction
          disabled={processing}
          className="flex-1 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
          onClick={onConfirm}
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Oui, disponible
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default IndispoConfirmDialog;
