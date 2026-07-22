/**
 * Section Client Premium — extraite de CommandeFormDialog
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, Star } from 'lucide-react';
import type { ClientCaracteristique } from '@/utils/clientCharacteristic';

export interface ClientLite {
  id: string;
  nom: string;
  phone: string;
  phones?: string[];
  adresse: string;
  photo?: string;
}

export interface ClientSectionProps {
  clientPhotoUrl: string | null;
  clientNom: string;
  clientSearch: string;
  setClientSearch: (v: string) => void;
  setClientNom: (v: string) => void;
  setShowClientSuggestions: (v: boolean) => void;
  showClientSuggestions: boolean;
  filteredClients: ClientLite[];
  onClientPick: (c: ClientLite) => void;
  setSelectedClientPhoto: (p: string | null) => void;
  currentClientCaracteristique?: ClientCaracteristique | null;

  clientPhone: string;
  setClientPhone: (v: string) => void;
  clientPhones: string[];

  clientAddress: string;
  setClientAddress: (v: string) => void;

  clientVille: string;
  setClientVille?: (v: string) => void;
  availableVilles: string[];
  setAvailableVilles: (v: string[]) => void;
  isCustomVille: boolean;
}

const ClientSection: React.FC<ClientSectionProps> = ({
  clientPhotoUrl, clientNom, clientSearch, setClientSearch, setClientNom,
  setShowClientSuggestions, showClientSuggestions, filteredClients, onClientPick,
  setSelectedClientPhoto, currentClientCaracteristique,
  clientPhone, setClientPhone, clientPhones,
  clientAddress, setClientAddress,
  clientVille, setClientVille, availableVilles, setAvailableVilles, isCustomVille,
}) => {
  return (
    <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 border-2 border-blue-300 dark:border-blue-700 shadow-[0_8px_30px_rgba(59,130,246,0.3)]">
      <h3 className="font-black text-xl flex items-center gap-3 text-blue-700 dark:text-blue-300">
        <span className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm shadow-lg">
          <Crown className="h-5 w-5" />
        </span>
        <span className="flex items-center gap-2">
          Client Premium
          <Star className="h-5 w-5 text-yellow-500" />
        </span>
      </h3>

      {clientPhotoUrl && (
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 rounded-full blur-md opacity-70" />
            <img
              src={clientPhotoUrl}
              alt={clientNom || 'Client'}
              className="relative w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-2xl"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        </div>
      )}

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="clientNom" className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
            👤 Nom du Client
          </Label>
          {clientNom && clientNom.length >= 2 && currentClientCaracteristique && (
            <span className={`text-xs px-3 py-1 rounded-full font-bold tracking-wide ${currentClientCaracteristique.badgeClass}`}>
              {currentClientCaracteristique.label}
            </span>
          )}
        </div>
        <Input
          id="clientNom"
          value={clientSearch}
          onChange={(e) => {
            setClientSearch(e.target.value);
            setClientNom(e.target.value);
            setShowClientSuggestions(e.target.value.length >= 3);
            if (e.target.value.length < 3) setSelectedClientPhoto(null);
          }}
          placeholder="Saisir au moins 3 caractères..."
          className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm"
          required
        />
        {showClientSuggestions && filteredClients.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="p-3 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
                onClick={() => onClientPick(client)}
              >
                <div className="font-semibold text-gray-900 dark:text-white">{client.nom}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                  📱 {client.phone}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientPhone" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
            📞 Téléphone
          </Label>
          {clientPhones.length > 1 ? (
            <Select value={clientPhone} onValueChange={setClientPhone}>
              <SelectTrigger className="w-full border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm">
                <SelectValue placeholder="Choisir un numéro" />
              </SelectTrigger>
              <SelectContent>
                {clientPhones.map((phone, idx) => (
                  <SelectItem key={idx} value={phone}>
                    {phone} {idx === 0 ? '(principal)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="clientPhone"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="Numéro de téléphone"
              className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm"
              required
            />
          )}
        </div>

        <div>
          <Label htmlFor="clientAddress" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
            🏠 Adresse
          </Label>
          <Input
            id="clientAddress"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            placeholder="Adresse complète"
            className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm"
            required
          />
        </div>
      </div>

      {setClientVille && (
        <div>
          <Label htmlFor="clientVille" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
            🏙️ Ville {clientVille && (
              <span className="ml-2 text-xs font-normal text-emerald-600 dark:text-emerald-400">
                (pré-remplie depuis la fiche client)
              </span>
            )}
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={isCustomVille ? '__custom__' : (clientVille || '')}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '__custom__') setClientVille('');
                else setClientVille(val);
              }}
              className="w-full px-3 py-2 border-2 border-blue-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 shadow-sm"
            >
              <option value="">— Choisir une ville —</option>
              {availableVilles.map(v => <option key={v} value={v}>{v}</option>)}
              <option value="__custom__">+ Nouvelle ville…</option>
            </select>
            {(isCustomVille || !clientVille) && (
              <Input
                type="text"
                value={isCustomVille ? clientVille : ''}
                onChange={(e) => setClientVille(e.target.value)}
                onBlur={async () => {
                  const v = (clientVille || '').trim();
                  if (!v) return;
                  if (!availableVilles.some(x => x.toLowerCase() === v.toLowerCase())) {
                    try {
                      const { clientsVillesApi } = await import('@/services/api/villesApi');
                      const list = await clientsVillesApi.add(v);
                      if (Array.isArray(list)) setAvailableVilles(list);
                    } catch { }
                  }
                }}
                placeholder="Saisir une nouvelle ville"
                className="border-2 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-gray-900 shadow-sm"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSection;
