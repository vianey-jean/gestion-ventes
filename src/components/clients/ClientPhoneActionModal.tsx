/**
 * ClientPhoneActionModal — Modale d'actions sur un numéro de téléphone client.
 * Permet d'appeler ou d'envoyer un message (SMS sur mobile).
 */
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Phone, PhoneCall, MessageSquare } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  phone: string;
  isMobile: boolean;
  onCall: () => void;
  onMessage: () => void;
}

const ClientPhoneActionModal: React.FC<Props> = ({ open, onOpenChange, phone, isMobile, onCall, onMessage }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md bg-white/95 dark:bg-[#0a0020]/95 backdrop-blur-2xl border border-violet-200/20 dark:border-violet-800/20 shadow-2xl rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full">
            <Phone className="w-5 h-5 text-white" />
          </div>
          {phone}
        </DialogTitle>
        <DialogDescription className="text-gray-600 dark:text-gray-400">Que souhaitez-vous faire ?</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <Button onClick={onCall} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg">
          <PhoneCall className="w-6 h-6" />Appeler ce numéro
        </Button>
        <Button onClick={onMessage} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg">
          <MessageSquare className="w-6 h-6" />{isMobile ? 'Envoyer un SMS' : 'Envoyer un message'}
        </Button>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">Annuler</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ClientPhoneActionModal;
