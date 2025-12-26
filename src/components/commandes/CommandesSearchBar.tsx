/**
 * Barre de recherche et actions pour la page Commandes
 */
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Printer, Calendar, Zap, Award, Sparkles } from 'lucide-react';
import { Commande } from '@/types/commande';

interface CommandesSearchBarProps {
  commandeSearch: string;
  setCommandeSearch: (value: string) => void;
  exportDialogOpen: boolean;
  setExportDialogOpen: (open: boolean) => void;
  exportDate: string;
  setExportDate: (date: string) => void;
  commandesForExportDate: Commande[];
  handleExportPDF: () => void;
  onNewCommande: () => void;
}

const CommandesSearchBar: React.FC<CommandesSearchBarProps> = ({
  commandeSearch,
  setCommandeSearch,
  exportDialogOpen,
  setExportDialogOpen,
  exportDate,
  setExportDate,
  commandesForExportDate,
  handleExportPDF,
  onNewCommande
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center shadow-2xl">
            <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Commandes Premium
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2 text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
              Gestion d'élite de vos commandes
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full md:w-auto">
        {/* Barre de recherche */}
        <div className="relative flex-1 sm:flex-initial sm:w-64 md:w-80">
          <Input
            value={commandeSearch}
            onChange={(e) => setCommandeSearch(e.target.value)}
            placeholder="🔍 Rechercher (min. 3 car.)..."
            className="border-2 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 bg-white dark:bg-gray-900 shadow-lg pl-4 text-sm"
          />
          {commandeSearch.length > 0 && commandeSearch.length < 3 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {3 - commandeSearch.length} car.
            </div>
          )}
        </div>
        
        {/* Boutons */}
        <div className="flex gap-2 sm:gap-3">
          {/* Bouton Imprimer */}
          <Dialog open={exportDialogOpen} onOpenChange={(open) => {
            setExportDialogOpen(open);
            if (!open) setExportDate('');
          }}>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-lg text-xs sm:text-sm px-3 sm:px-4" size="default">
                <Printer className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Imprimer</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] sm:max-w-md bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40 dark:from-gray-900 dark:via-blue-900/30 dark:to-indigo-900/30 backdrop-blur-2xl border-2 border-blue-300/50 dark:border-blue-600/50">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  Exporter les commandes
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Sélectionnez une date pour exporter les commandes/réservations en PDF
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="exportDate" className="text-sm font-semibold mb-2 block">
                    📅 Date à exporter
                  </Label>
                  <Input
                    id="exportDate"
                    type="date"
                    value={exportDate}
                    onChange={(e) => setExportDate(e.target.value)}
                    className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500"
                  />
                </div>
                
                {exportDate && (
                  <div className="p-3 sm:p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
                    <p className="text-sm">
                      <span className="font-semibold">Date:</span>{' '}
                      {new Date(exportDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm mt-2">
                      <span className="font-semibold">Nombre:</span>{' '}
                      <span className={commandesForExportDate.length > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                        {commandesForExportDate.length}
                      </span>
                    </p>
                  </div>
                )}
                
                {exportDate && commandesForExportDate.length > 0 && (
                  <Button 
                    onClick={handleExportPDF}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Exporter en PDF
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={onNewCommande}
            className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-purple-500/50 border-0 text-xs sm:text-sm px-3 sm:px-4" 
            size="default"
          >
            <Zap className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle Commande</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommandesSearchBar;
