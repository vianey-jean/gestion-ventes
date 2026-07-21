/**
 * ClientAddressActionModal — Choix de l'application de navigation
 * pour ouvrir une adresse client (Google Maps, Waze, Apple Maps).
 */
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onGoogleMaps: () => void;
  onWaze: () => void;
  onAppleMaps: () => void;
}

const ClientAddressActionModal: React.FC<Props> = ({ open, onOpenChange, onGoogleMaps, onWaze, onAppleMaps }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md bg-white/95 dark:bg-[#0a0020]/95 backdrop-blur-2xl border border-violet-200/20 dark:border-violet-800/20 shadow-2xl rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full">
            <Navigation className="w-5 h-5 text-white" />
          </div>Navigation
        </DialogTitle>
        <DialogDescription className="text-gray-600 dark:text-gray-400">Ouvrir l'adresse dans quelle application ?</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <Button onClick={onGoogleMaps} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg">
          <MapPin className="w-6 h-6" />Google Maps
        </Button>
        <Button onClick={onWaze} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg">
          <Navigation className="w-6 h-6" />Waze
        </Button>
        <Button onClick={onAppleMaps} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white py-6 text-lg font-semibold rounded-xl shadow-lg">
          <MapPin className="w-6 h-6" />Apple Maps
        </Button>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">Annuler</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ClientAddressActionModal;
