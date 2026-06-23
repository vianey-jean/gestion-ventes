/**
 * ProduitsToolbar.tsx
 * Barre de recherche + 4 boutons d'action principaux (Ajouter, Modifier,
 * Voir plus vendu, Fusionner) pour la page Produits.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Pencil, Star, Merge } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  setShowSearchResults: (v: boolean) => void;
  onAdd: () => void;
  onEdit: () => void;
  onVendu: () => void;
  onMerge: () => void;
}

const ProduitsToolbar: React.FC<Props> = ({
  searchQuery, setSearchQuery, setShowSearchResults,
  onAdd, onEdit, onVendu, onMerge,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="flex flex-col xl:flex-row gap-4 xl:items-center w-full"
  >
    <div className="relative flex-1 w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-violet-400" />
        <Input
          placeholder="Rechercher un produit (3 caractères min.)..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchResults(e.target.value.length >= 3);
          }}
          onFocus={() => { if (searchQuery.length >= 3) setShowSearchResults(true); }}
          onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
          className="pl-11 sm:pl-12 h-12 sm:h-14 rounded-2xl border-2 border-violet-200/50 dark:border-violet-800/30 bg-white/80 dark:bg-white/5 backdrop-blur-xl focus:border-violet-500 shadow-lg shadow-violet-500/5 text-sm sm:text-base font-medium transition-all duration-300 w-full"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex gap-3 w-full xl:w-auto">
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
        <Button onClick={onAdd} className="w-full xl:w-auto h-12 sm:h-14 px-4 sm:px-6 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-600 hover:via-green-700 hover:to-teal-700 text-white shadow-lg sm:shadow-xl shadow-green-500/25 hover:shadow-2xl hover:shadow-green-500/40 transition-all duration-300 border-0">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Ajouter Produit
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
        <Button onClick={onEdit} className="w-full xl:w-auto h-12 sm:h-14 px-4 sm:px-6 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-lg sm:shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 border-0">
          <Pencil className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Modifier Produit
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
        <Button onClick={onVendu} className="w-full xl:w-auto h-12 sm:h-14 px-4 sm:px-6 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white shadow-lg sm:shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 border-0">
          <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Voir plus vendu
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
        <Button onClick={onMerge} className="w-full xl:w-auto h-12 sm:h-14 px-4 sm:px-6 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:via-amber-600 hover:to-red-600 text-white shadow-lg sm:shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 border-0">
          <Merge className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Fusionner Produit
        </Button>
      </motion.div>
    </div>
  </motion.div>
);

export default ProduitsToolbar;
