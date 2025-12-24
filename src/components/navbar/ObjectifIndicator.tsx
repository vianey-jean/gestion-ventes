import React, { useState } from 'react';
import { Plus, Target, Edit2, Check, X } from 'lucide-react';
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

const ObjectifIndicator: React.FC = () => {
  const { data, loading, updateObjectif } = useObjectif();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newObjectif, setNewObjectif] = useState('');
  const [editValue, setEditValue] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getProgressColor = () => {
    if (!data) return 'text-muted-foreground';
    
    const percentage = (data.totalVentesMois / data.objectif) * 100;
    
    if (percentage >= 100) return 'text-green-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleAddObjectif = async () => {
    const value = parseFloat(newObjectif);
    if (isNaN(value) || value <= 0) {
      toast.error('Veuillez entrer une valeur valide');
      return;
    }

    try {
      await updateObjectif(value);
      setNewObjectif('');
      setIsDialogOpen(false);
      toast.success('Objectif mis à jour');
    } catch {
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

    try {
      await updateObjectif(value);
      setIsEditing(false);
      toast.success('Objectif mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 animate-pulse">
        <div className="h-4 w-16 bg-muted rounded"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
      <Target className="h-3.5 w-3.5 text-primary hidden sm:block" />
      
      {/* Total Ventes */}
      <span className={`font-bold text-xl sm:text-sm ${getProgressColor()}`}>
        {formatCurrency(data.totalVentesMois)}
      </span>
      
      <span className="font-bold text-muted-foreground text-xl">|</span>
      
      {/* Objectif - Editable */}
      {isEditing ? (
        <div className="font-bold text-xl flex items-center gap-1">
          <Input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-6 w-16 text-xs px-1"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={handleEditSave}
          >
            <Check className="h-3 w-3 text-green-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={handleEditCancel}
          >
            <X className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      ) : (
        <button
          onClick={handleEditStart}
          className="font-bold text-xl sm:text-sm text-primary hover:underline cursor-pointer flex items-center gap-0.5"
        >
          {formatCurrency(data.objectif)}
          <Edit2 className="font-bold h-4 w-4 opacity-50 text-green-800" />
        </button>
      )}
      
      {/* Add New Objectif Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full bg-primary/20 hover:bg-primary/30"
          >
            <Plus className="h-4 w-4 text- font-bold" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Nouvel Objectif du Mois
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Objectif de ventes (€)
              </label>
              <Input
                type="number"
                placeholder="Ex: 2000"
                value={newObjectif}
                onChange={(e) => setNewObjectif(e.target.value)}
                className="text-lg"
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Objectif actuel: <strong>{formatCurrency(data.objectif)}</strong></p>
              <p>Ventes ce mois: <strong className={getProgressColor()}>{formatCurrency(data.totalVentesMois)}</strong></p>
            </div>
            
            <Button onClick={handleAddObjectif} className="w-full">
              <Target className="mr-2 h-4 w-4" />
              Définir l'objectif
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ObjectifIndicator;
