import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart3, Building2, Users, User } from 'lucide-react';
import { PointageEntry } from '@/services/api/pointageApi';

interface YearlyTotalModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  year: number;
  yearlyPointages: PointageEntry[];
  loading: boolean;
}

const YearlyTotalModal: React.FC<YearlyTotalModalProps> = ({
  open, onOpenChange, year, yearlyPointages, loading
}) => {
  const yearlyByEntreprise = yearlyPointages.reduce((acc, p) => {
    const key = p.entrepriseNom || p.entrepriseId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {} as Record<string, PointageEntry[]>);

  const yearlyByPerson = yearlyPointages.reduce((acc, p) => {
    const name = (p as any).travailleurNom || 'Sans nom';
    if (!acc[name]) acc[name] = [];
    acc[name].push(p);
    return acc;
  }, {} as Record<string, PointageEntry[]>);

  const yearlyGlobalTotal = yearlyPointages.reduce((s, p) => s + p.montantTotal, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-amber-900/30 to-orange-900/20 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            📊 Total de l'année {year}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8"><p className="text-white/60 font-bold">⏳ Chargement...</p></div>
        ) : yearlyPointages.length === 0 ? (
          <div className="text-center py-8"><p className="text-white/50 font-bold">Aucun pointage en {year}</p></div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-center">
              <p className="text-xs text-white/60 mb-1">TOTAL ANNUEL {year}</p>
              <p className="text-3xl font-black text-emerald-400">{yearlyGlobalTotal.toFixed(2)}€</p>
              <p className="text-xs text-white/50 mt-1">{yearlyPointages.length} pointage(s)</p>
            </div>

            <div>
              <h4 className="text-sm font-black text-white/80 mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-cyan-400" /> Par Entreprise
              </h4>
              {Object.entries(yearlyByEntreprise).map(([entName, pts]) => {
                const total = pts.reduce((s, p) => s + p.montantTotal, 0);
                const totalHeures = pts.reduce((s, p) => s + (p.heures || 0), 0);
                const totalJours = pts.filter(p => p.typePaiement === 'journalier').length;
                return (
                  <div key={entName} className="p-3 rounded-xl bg-white/10 border border-white/10 mb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-white">{entName}</p>
                        <p className="text-xs text-white/50">
                          {totalJours > 0 && `${totalJours} jour(s) `}
                          {totalHeures > 0 && `${totalHeures}h `}
                          — {pts.length} pointage(s)
                        </p>
                      </div>
                      <span className="text-lg font-black text-emerald-400">{total.toFixed(2)}€</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <h4 className="text-sm font-black text-white/80 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" /> Par Personne
              </h4>
              {Object.entries(yearlyByPerson).map(([name, pts]) => {
                const total = pts.reduce((s, p) => s + p.montantTotal, 0);
                return (
                  <div key={name} className="p-3 rounded-xl bg-white/10 border border-white/10 mb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          <User className="h-3 w-3 text-purple-400" /> {name}
                        </p>
                        <p className="text-xs text-white/50">{pts.length} pointage(s)</p>
                      </div>
                      <span className="text-lg font-black text-emerald-400">{total.toFixed(2)}€</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default YearlyTotalModal;
