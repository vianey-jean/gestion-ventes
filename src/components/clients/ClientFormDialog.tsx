/**
 * ClientFormDialog — Dialogue principal d'ajout / modification d'un client.
 * Gère photo, nom, téléphones multiples, adresses multiples + ville par adresse.
 */
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Plus } from 'lucide-react';

export interface ClientFormData {
  nom: string;
  phones: string[];
  addresses: string[];
  ville: string;
  villes: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: boolean;
  formData: ClientFormData;
  setFormData: React.Dispatch<React.SetStateAction<ClientFormData>>;
  availableVilles: string[];
  photoInputRef: React.RefObject<HTMLInputElement>;
  photoPreview: string | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onPhotoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
}

const ClientFormDialog: React.FC<Props> = ({
  open, onOpenChange, editing, formData, setFormData, availableVilles,
  photoInputRef, photoPreview, isSubmitting, onSubmit, onPhotoSelect, onRemovePhoto,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md bg-white/70 dark:bg-[#0a0020]/60 backdrop-blur-3xl border border-violet-200/20 dark:border-violet-800/20 shadow-[0_0_80px_-20px_rgba(139,92,246,0.4)] rounded-3xl animate-in fade-in zoom-in-95 duration-300">
      <DialogHeader className="space-y-2">
        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent animate-pulse">
          {editing ? 'Modifier le client' : 'Nouveau client'}
        </DialogTitle>
        <DialogDescription className="text-gray-600 dark:text-gray-400 transition-opacity duration-300">
          {editing ? 'Modifiez les informations du client.' : 'Ajoutez un nouveau client à votre portefeuille.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={onSubmit}>
        <div className="grid gap-6 py-6">
          {/* PHOTO */}
          <div className="flex flex-col items-center gap-2">
            <input ref={photoInputRef} type="file" accept="image/*" onChange={onPhotoSelect} className="hidden" />
            <div
              onClick={() => photoInputRef.current?.click()}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full cursor-pointer group/upload overflow-hidden ring-2 ring-dashed ring-purple-300/70 dark:ring-purple-700/60 hover:ring-purple-500 transition-all duration-500 ease-out shadow-xl hover:shadow-purple-500/30 hover:scale-105 active:scale-95"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover/upload:scale-110" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-100 via-violet-100 to-indigo-100 dark:from-purple-900/40 dark:via-violet-900/40 dark:to-indigo-900/40 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-purple-400 dark:text-purple-500 group-hover/upload:rotate-12 transition-transform duration-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-all duration-300 flex items-center justify-center rounded-full backdrop-blur-sm">
                <Camera className="w-6 h-6 text-white animate-bounce" />
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Photo (optionnel)</span>
            {photoPreview && (
              <button type="button" onClick={onRemovePhoto} className="text-xs text-red-500 hover:text-red-600 underline hover:scale-105 transition-transform">
                Retirer la photo
              </button>
            )}
          </div>

          {/* NOM */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nom complet</Label>
            <Input
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Nom et prénom"
              className="transition-all duration-300 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:scale-[1.01] focus:border-blue-500"
              required
            />
          </div>

          {/* TELEPHONES */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Téléphone(s)</Label>
              <Button type="button" variant="ghost" size="sm"
                onClick={() => setFormData(prev => ({ ...prev, phones: [...prev.phones, ''] }))}
                className="h-7 w-7 p-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-110 active:scale-95 transition-all duration-300 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-2">
              {formData.phones.map((phone, index) => (
                <div key={index} className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex-1 relative">
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        phones: prev.phones.map((p, i) => (i === index ? e.target.value : p)),
                      }))}
                      placeholder={index === 0 ? 'Téléphone principal' : `Téléphone ${index + 1}`}
                      className="pr-24 transition-all duration-300 focus:scale-[1.01]"
                      required={index === 0}
                    />
                    {index === 0 ? (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full animate-pulse">
                        Principal
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => {
                          const arr = [...prev.phones];
                          const [item] = arr.splice(index, 1);
                          arr.unshift(item);
                          return { ...prev, phones: arr };
                        })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-300/40 transition-all duration-300 hover:scale-105"
                      >
                        ★ Principal
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ADRESSES */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Adresse(s) &amp; Ville</Label>
              <Button type="button" variant="ghost" size="sm"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  addresses: [...prev.addresses, ''],
                  villes: [...(prev.villes || []), ''],
                }))}
                className="h-7 w-7 p-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:scale-110 active:scale-95 transition-all duration-300 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-3">
              {formData.addresses.map((addr, index) => {
                const villeVal = formData.villes[index] || '';
                const isCustomVille = villeVal && !availableVilles.some(v => v.toLowerCase() === villeVal.toLowerCase());
                return (
                  <div key={index} className="space-y-2 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-900/10 backdrop-blur-md hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <Input
                          value={addr}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            addresses: prev.addresses.map((a, i) => (i === index ? e.target.value : a)),
                          }))}
                          className="pr-24 transition-all duration-300 focus:scale-[1.01]"
                          placeholder={index === 0 ? 'Adresse principale' : `Adresse ${index + 1}`}
                          required={index === 0}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={isCustomVille ? '__custom__' : villeVal}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => {
                            const villesArr = [...(prev.villes || [])];
                            while (villesArr.length <= index) villesArr.push('');
                            villesArr[index] = val === '__custom__' ? '' : val;
                            return { ...prev, villes: villesArr };
                          });
                        }}
                        className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      >
                        <option value="">— Ville —</option>
                        {availableVilles.map(v => <option key={v} value={v}>{v}</option>)}
                        <option value="__custom__">+ Nouvelle ville</option>
                      </select>

                      {(isCustomVille || !villeVal) && (
                        <Input
                          value={isCustomVille ? villeVal : ''}
                          onChange={(e) => setFormData(prev => {
                            const villesArr = [...(prev.villes || [])];
                            while (villesArr.length <= index) villesArr.push('');
                            villesArr[index] = e.target.value;
                            return { ...prev, villes: villesArr };
                          })}
                          placeholder="Nouvelle ville"
                          className="transition-all duration-300 focus:scale-[1.01]"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="transition-all duration-300 hover:scale-105">
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 hover:scale-105 active:scale-95">
            {editing ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

export default ClientFormDialog;
