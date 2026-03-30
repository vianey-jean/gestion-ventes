import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, message, onConfirm, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    if (isSubmitting) return; // empêche double clic
    setIsSubmitting(true);

    try {
      onConfirm();
    } finally {
      // si vous voulez fermer le modal automatiquement après confirmation, réinitialisez isSubmitting après un court délai
      // setIsSubmitting(false); // sinon laissez à true jusqu'à ce que le modal se ferme
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return; // empêche annulation pendant submission si nécessaire
    onCancel();
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-sm p-5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-white/20 dark:border-white/10 rounded-3xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Confirmation</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 rounded-xl"
            disabled={isSubmitting} // désactive pendant la confirmation
          >
            Non
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg"
            disabled={isSubmitting} // désactive pour empêcher double clic
          >
            {isSubmitting ? 'Confirmation...' : 'Oui, confirmer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;