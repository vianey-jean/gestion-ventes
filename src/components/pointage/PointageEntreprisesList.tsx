import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Euro, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Entreprise } from '@/services/api/entrepriseApi';

interface PointageEntreprisesListProps {
  entreprises: Entreprise[];
}

const PointageEntreprisesList: React.FC<PointageEntreprisesListProps> = ({ entreprises }) => {
  const [show, setShow] = useState(true);

  if (entreprises.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      className="mt-6 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl p-4 sm:p-6">
      <button onClick={() => setShow(!show)}
        className="w-full flex items-center justify-between mb-4 cursor-pointer hover:opacity-80 transition-opacity">
        <h3 className="text-lg font-black bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
          <Building2 className="h-5 w-5 text-cyan-500" /> Listes des Entreprises ({entreprises.length})
        </h3>
        {show ? <ChevronUp className="h-5 w-5 text-cyan-500" /> : <ChevronDown className="h-5 w-5 text-cyan-500" />}
      </button>
      {show && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {entreprises.map(ent => (
            <div key={ent.id} className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm">{ent.nom}</h4>
                  {ent.adresse && <p className="text-xs text-muted-foreground mt-1">{ent.adresse}</p>}
                </div>
                <span className={cn(
                  'text-[10px] px-2 py-1 rounded-full font-bold',
                  ent.typePaiement === 'journalier' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                )}>
                  {ent.typePaiement === 'journalier' ? 'Journalier' : 'Horaire'}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <Euro className="h-4 w-4 text-emerald-500" />
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {ent.prix}€ {ent.typePaiement === 'horaire' ? '/h' : '/jour'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PointageEntreprisesList;
