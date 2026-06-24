/**
 * CitiesManagerModal - Modale réutilisable pour gérer la liste des villes clients
 * Permet : voir, ajouter (+), modifier, supprimer (avec confirmation).
 */
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clientsVillesApi } from '@/services/api/villesApi';
import CityFormModal from './CityFormModal';
import ConfirmModal from '@/components/notes/ConfirmModal';

export interface CitiesManagerModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const CitiesManagerModal: React.FC<CitiesManagerModalProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [villes, setVilles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ message: string; action: () => Promise<void> | void } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const list = await clientsVillesApi.getAll();
      setVilles(list);
    } catch {
      toast({ title: 'Erreur de chargement', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const handleAdd = async (ville: string) => {
    try {
      const list = await clientsVillesApi.add(ville);
      setVilles(list);
      toast({ title: '✅ Ville ajoutée' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const handleUpdate = (original: string) => async (ville: string) => {
    setConfirm({
      message: `Renommer "${original}" en "${ville}" ?`,
      action: async () => {
        try {
          const list = await clientsVillesApi.update(original, ville);
          setVilles(list);
          toast({ title: '✅ Ville modifiée' });
        } catch (e: any) {
          toast({
            title: 'Erreur',
            description: e?.response?.data?.message,
            variant: 'destructive',
          });
        } finally {
          setConfirm(null);
          setEditing(null);
        }
      },
    });
  };

  const handleDelete = (ville: string) => {
    setConfirm({
      message: `Supprimer définitivement la ville "${ville}" ?`,
      action: async () => {
        try {
          const list = await clientsVillesApi.remove(ville);
          setVilles(list);
          toast({ title: '✅ Ville supprimée' });
        } catch {
          toast({ title: 'Erreur', variant: 'destructive' });
        } finally {
          setConfirm(null);
        }
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-500" /> Villes des clients ({villes.length})
              </DialogTitle>
              <Button
                size="sm"
                onClick={() => setShowAdd(true)}
                aria-label="Ajouter une ville"
                className="h-9 w-9 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto pr-1 -mr-1 space-y-2 mt-2">
            {loading && (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
              </div>
            )}
            {!loading && villes.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Aucune ville enregistrée</p>
            )}
            {!loading &&
              villes.map((v) => (
                <div
                  key={v}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="h-4 w-4 text-purple-500 shrink-0" />
                    <span className="font-medium truncate">{v}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(v)}
                      aria-label={`Modifier ${v}`}
                      className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(v)}
                      aria-label={`Supprimer ${v}`}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      <CityFormModal
        open={showAdd}
        onOpenChange={setShowAdd}
        title="Ajouter une ville"
        confirmLabel="Ajouter"
        onSubmit={handleAdd}
      />

      <CityFormModal
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        initialValue={editing || ''}
        title="Modifier la ville"
        confirmLabel="Enregistrer"
        onSubmit={editing ? handleUpdate(editing) : async () => {}}
      />

      {confirm && (
        <ConfirmModal
          open={true}
          message={confirm.message}
          onConfirm={confirm.action}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
};

export default CitiesManagerModal;
