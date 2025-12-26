import React, { useEffect, useState } from 'react';
import { Plus, Target, Edit2, Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useObjectif } from '@/hooks/useObjectif';
import { toast } from 'sonner';
import ObjectifStatsModal from './ObjectifStatsModal';
import { cn } from '@/lib/utils';

// Composant animation célébration
const Celebration: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;

  const confettiCount = 40;
  const fireworksCount = 20;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {/* Feux d'artifice */}
      {[...Array(fireworksCount)].map((_, i) => {
        const angle = Math.random() * 360;
        const distance = 40 + Math.random() * 80;
        const duration = 0.8 + Math.random() * 0.7;
        const delay = Math.random() * 1;
        const colorChoices = ['#f87171', '#fb7185', '#f43f5e', '#ef4444', '#dc2626'];
        const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];

        return (
          <span
            key={`firework-${i}`}
            className="absolute block w-2 h-2 rounded-full animate-firework"
            style={{
              backgroundColor: color,
              transform: `rotate(${angle}deg) translateY(0)`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}

      {/* Confettis ballon éclaté */}
      {[...Array(confettiCount)].map((_, i) => {
        const size = 3 + Math.random() * 3;
        const left = Math.random() * 100;
        const delay = Math.random();
        const duration = 1.5 + Math.random() * 1;
        const colors = ['#f87171', '#fb7185', '#facc15', '#22c55e', '#3b82f6', '#f97316'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return (
          <span
            key={`confetti-${i}`}
            className="absolute w-1 h-2 rounded-sm"
            style={{
              left: `${left}%`,
              top: `10%`,
              backgroundColor: color,
              animation: `confetti-fall ${duration}s linear ${delay}s infinite`,
            }}
          />
        );
      })}

      <style jsx>{`
        @keyframes firework {
          0% { transform: translateY(0) scale(0.5); opacity: 1; }
          50% { transform: translateY(-80px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-120px) scale(0); opacity: 0; }
        }
        .animate-firework { animation: firework linear infinite; }

        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const ObjectifIndicator: React.FC = () => {
  const { data, loading, updateObjectif } = useObjectif();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newObjectif, setNewObjectif] = useState('');
  const [editValue, setEditValue] = useState('');
  const [celebrationActive, setCelebrationActive] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const getProgressColor = () => {
    if (!data) return 'text-muted-foreground';
    const percentage = (data.totalVentesMois / data.objectif) * 100;
    if (percentage >= 100) return 'text-emerald-500';
    if (percentage >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const refuseDecrease = () => {
    toast.error('❌ On ne peut pas diminuer un objectif');
    setIsDialogOpen(false);
    setIsEditing(false);
  };

  const handleAddObjectif = async () => {
    const value = parseFloat(newObjectif);
    if (isNaN(value) || value <= 0) {
      toast.error('Veuillez entrer une valeur valide');
      return;
    }
    if (data && value <= data.objectif) {
      refuseDecrease();
      return;
    }
    try {
      await updateObjectif(value);
      setNewObjectif('');
      setIsDialogOpen(false);
      toast.success('Objectif mis à jour 🎯');

      if (data && value > data.totalVentesMois) {
        setCelebrationActive(false); // Stop animations si nouvel objectif > ventes
      }
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleEditStart = () => {
    if (data) {
      setEditValue(data.objectif.toString());
      setIsEditing(true);
    }
  };

  const handleEditSave = async () => {
    const value = parseFloat(editValue);
    if (isNaN(value) || value <= 0) {
      toast.error('Veuillez entrer une valeur valide');
      return;
    }
    if (data && value <= data.objectif) {
      refuseDecrease();
      return;
    }
    try {
      await updateObjectif(value);
      setIsEditing(false);
      toast.success('Objectif mis à jour 🎯');
      if (data && value > data.totalVentesMois) {
        setCelebrationActive(false);
      }
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  // Activation automatique de la célébration
  useEffect(() => {
    if (!data) return;
    if (data.totalVentesMois >= data.objectif) {
      setCelebrationActive(true);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-200/30 dark:border-violet-800/30 animate-pulse">
        <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    );
  }

  if (!data) return null;

  const celebrate = celebrationActive;

  return (
    <div
      className={cn(
        'relative flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-lg backdrop-blur-xl',
        'bg-gradient-to-r from-slate-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-violet-950',
        celebrate && 'ring-2 ring-emerald-400/40 animate-pulse'
      )}
    >
      {/* Célébration complète */}
      <Celebration show={celebrate} />

      {/* Total Ventes */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:block">
          Ventes
        </span>
        <span className={cn('font-bold text-sm', getProgressColor())}>
          {formatCurrency(data.totalVentesMois)}
        </span>
      </div>

      {/* Separator */}
      <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

      {/* Objectif - Editable */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:block">
          Objectif
        </span>
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="font-bold h-7 w-20 text-xs px-2 rounded-lg"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20"
              onClick={handleEditSave}
            >
              <Check className="h-3 w-3 text-emerald-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg bg-rose-500/10 hover:bg-rose-500/20"
              onClick={handleEditCancel}
            >
              <X className="h-3 w-3 text-rose-500" />
            </Button>
          </div>
        ) : (
          <button
            onClick={handleEditStart}
            className="font-bold text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 cursor-pointer flex items-center gap-1 transition-colors"
          >
            {formatCurrency(data.objectif)}
            <Edit2 className="h-3 w-3 opacity-50" />
          </button>
        )}
      </div>

      {/* Add New Objectif Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 transition-all duration-300 hover:scale-110"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950 border-violet-200/50 dark:border-violet-800/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent font-bold">
                Nouvel Objectif du Mois
              </span>
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Objectif de ventes (€)
              </label>
              <Input
                type="number"
                placeholder="Ex: 2000"
                value={newObjectif}
                onChange={(e) => setNewObjectif(e.target.value)}
                className="text-lg h-12 rounded-xl border-slate-200/50 dark:border-slate-700/50 focus:ring-2 focus:ring-violet-500/30"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Objectif actuel: <strong className="text-violet-600 dark:text-violet-400">{formatCurrency(data.objectif)}</strong>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ventes ce mois: <strong className={getProgressColor()}>{formatCurrency(data.totalVentesMois)}</strong>
              </p>
            </div>

            <Button
              onClick={handleAddObjectif}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02]"
            >
              <Target className="mr-2 h-5 w-5" />
              Définir l'objectif
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ObjectifStatsModal />
    </div>
  );
};

export default ObjectifIndicator;
