// Formulaire d'ajout/modification de client avec support multi-téléphones
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientFormData } from '@/types/client';
import { Sparkles, Plus, Trash2 } from 'lucide-react';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: ClientFormData;
  setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>;
  isEditing: boolean;
  isSubmitting: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEditing,
  isSubmitting,
}) => {
  // Ajouter un nouveau champ téléphone
  const addPhone = () => {
    setFormData(prev => ({ ...prev, phones: [...prev.phones, ''] }));
  };

  // Supprimer un numéro de téléphone
  const removePhone = (index: number) => {
    if (formData.phones.length <= 1) return; // Garder au moins 1
    setFormData(prev => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index)
    }));
  };

  // Modifier un numéro de téléphone
  const updatePhone = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      phones: prev.phones.map((p, i) => i === index ? value : p)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-indigo-900/30 border-2 border-purple-200 dark:border-purple-700 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            {isEditing ? 'Modifier le Client Élite' : 'Nouveau Client Élite'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            {isEditing 
              ? 'Modifiez les informations de votre client VIP' 
              : 'Ajoutez un nouveau membre à votre cercle élite'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom" className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
                Nom complet
              </Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Entrez le nom du client..."
                className="border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 rounded-xl py-3 text-base sm:text-lg"
                required
              />
            </div>
            
            {/* Multi-téléphones */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Téléphone(s)
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addPhone}
                  className="h-8 w-8 p-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.phones.map((phone, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => updatePhone(index, e.target.value)}
                        placeholder={index === 0 ? "Téléphone principal" : `Téléphone ${index + 1}`}
                        className="border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 rounded-xl py-3 text-base sm:text-lg pr-16"
                        required={index === 0}
                      />
                      {index === 0 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                          Principal
                        </span>
                      )}
                    </div>
                    {formData.phones.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhone(index)}
                        className="h-8 w-8 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse" className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
                Adresse
              </Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="Adresse complète..."
                className="border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-500 rounded-xl py-3 text-base sm:text-lg"
                required
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? 'En cours...' : (isEditing ? 'Mettre à jour' : 'Ajouter le client')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientForm;
