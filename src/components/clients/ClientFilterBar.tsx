/**
 * ClientFilterBar — Barre de tri/filtres au-dessus de la grille clients.
 * - Tri par nom (asc/desc)
 * - Filtre par niveau de fidélité (Nouveau, Standard, Bon, Fidèle, VIP)
 * - Filtre par ville (chargée depuis clients-villes.json)
 */
import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Crown, MapPin, X } from 'lucide-react';
import { clientsVillesApi } from '@/services/api/villesApi';
import listesFideliteApi, { FideliteTierConfig } from '@/services/api/listesFideliteApi';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

/** Tier alias : id du palier tel que stocké dans listes-fidelite.json. */
export type FidelityTier = string;


interface Props {
  sortDir: 'asc' | 'desc';
  onToggleSort: () => void;
  tierFilter: FidelityTier | null;
  onChangeTier: (t: FidelityTier | null) => void;
  villeFilter: string | null;
  onChangeVille: (v: string | null) => void;
}

const ClientFilterBar: React.FC<Props> = ({
  sortDir, onToggleSort, tierFilter, onChangeTier, villeFilter, onChangeVille,
}) => {
  const [villes, setVilles] = useState<string[]>([]);
  const [tiers, setTiers] = useState<FideliteTierConfig[]>([]);

  useEffect(() => {
    clientsVillesApi.getAll().then(setVilles).catch(() => setVilles([]));
    const loadTiers = () => listesFideliteApi.getAll().then(setTiers).catch(() => setTiers([]));
    loadTiers();
    window.addEventListener('listes-fidelite-updated', loadTiers);
    return () => window.removeEventListener('listes-fidelite-updated', loadTiers);
  }, []);

  const currentTier = tiers.find(t => t.id === tierFilter);


  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Tri par nom */}
      <button
        onClick={onToggleSort}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-white/5 border border-violet-200/30 dark:border-violet-800/30 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all text-sm font-semibold text-violet-700 dark:text-violet-300"
      >
        Nom
        <span className="flex flex-col">
          <ArrowUp className={`h-3 w-3 ${sortDir === 'asc' ? 'text-violet-500' : 'text-violet-300/40'}`} />
          <ArrowDown className={`h-3 w-3 -mt-1 ${sortDir === 'desc' ? 'text-violet-500' : 'text-violet-300/40'}`} />
        </span>
        <span className="text-xs text-muted-foreground">({sortDir === 'asc' ? 'A → Z' : 'Z → A'})</span>
      </button>

      {/* Filtre fidélité */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
              currentTier
                ? `bg-gradient-to-r ${currentTier.grad} text-white border-transparent shadow-md`
                : 'bg-white/80 dark:bg-white/5 border-amber-200/40 dark:border-amber-800/30 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-300'
            }`}
          >
            <Crown className="h-4 w-4" />
            Fidélité{currentTier ? ` : ${currentTier.label}` : ''}
            {currentTier && (
              <X
                className="h-3.5 w-3.5 ml-1 opacity-80 hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); onChangeTier(null); }}
              />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel>Filtrer par fidélité</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {tiers.map(t => (
            <DropdownMenuItem key={t.id} onClick={() => onChangeTier(t.id)}>
              <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 bg-gradient-to-r ${t.grad}`} />
              {t.label}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onChangeTier(null)}>
            Toutes les fidélités
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filtre villes */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
              villeFilter
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-md'
                : 'bg-white/80 dark:bg-white/5 border-blue-200/40 dark:border-blue-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300'
            }`}
          >
            <MapPin className="h-4 w-4" />
            Ville{villeFilter ? ` : ${villeFilter}` : ''}
            {villeFilter && (
              <X
                className="h-3.5 w-3.5 ml-1 opacity-80 hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); onChangeVille(null); }}
              />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 max-h-80 overflow-y-auto">
          <DropdownMenuLabel>Filtrer par ville</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {villes.length === 0 && (
            <DropdownMenuItem disabled>Aucune ville enregistrée</DropdownMenuItem>
          )}
          {villes.map(v => (
            <DropdownMenuItem key={v} onClick={() => onChangeVille(v)}>
              <MapPin className="h-3.5 w-3.5 mr-2 text-blue-500" />
              {v}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onChangeVille(null)}>
            Toutes les villes
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ClientFilterBar;
