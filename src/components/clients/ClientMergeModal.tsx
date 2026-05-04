/**
 * ClientMergeModal - Modale de fusion de plusieurs clients en un seul.
 *
 * Flux:
 *  1. L'utilisateur sélectionne 2 clients ou plus dans la liste.
 *  2. Pour chaque champ (nom, téléphones, adresse, photo), il choisit
 *     parmi les valeurs existantes ou en saisit une nouvelle.
 *  3. À l'enregistrement, un nouveau client est créé et tous les clients
 *     sources sélectionnés sont supprimés via POST /api/clients/merge.
 */

import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Trash2, Merge, Search } from 'lucide-react';

interface Client {
  id: string;
  nom: string;
  phone: string;
  phones: string[];
  adresse: string;
  photo?: string;
}

interface ClientMergeModalProps {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  onMerged: () => void;
}

const ClientMergeModal: React.FC<ClientMergeModalProps> = ({ open, onClose, clients, onMerged }) => {
  const { toast } = useToast();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [nom, setNom] = useState('');
  const [phones, setPhones] = useState<string[]>(['']);
  const [adresse, setAdresse] = useState('');
  const [keepPhotoFromId, setKeepPhotoFromId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset à l'ouverture
  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setSearch('');
      setNom('');
      setPhones(['']);
      setAdresse('');
      setKeepPhotoFromId('');
    }
  }, [open]);

  const selectedClients = useMemo(
    () => clients.filter(c => selectedIds.includes(c.id)),
    [clients, selectedIds]
  );

  // Pré-remplir les champs avec les valeurs du premier sélectionné
  useEffect(() => {
    if (selectedClients.length > 0 && !nom) {
      const first = selectedClients[0];
      setNom(first.nom);
      setPhones(first.phones && first.phones.length > 0 ? [...first.phones] : ['']);
      setAdresse(first.adresse);
      if (first.photo) setKeepPhotoFromId(first.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds.length]);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(c =>
      c.nom.toLowerCase().includes(q) ||
      (c.phones || []).some(p => p.includes(search)) ||
      c.adresse.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Récupère toutes les valeurs candidates pour un champ donné
  const candidatePhones = useMemo(() => {
    const set = new Set<string>();
    selectedClients.forEach(c => (c.phones || []).forEach(p => p && set.add(p)));
    return Array.from(set);
  }, [selectedClients]);

  const candidateAddresses = useMemo(
    () => Array.from(new Set(selectedClients.map(c => c.adresse).filter(Boolean))),
    [selectedClients]
  );

  const candidateNames = useMemo(
    () => Array.from(new Set(selectedClients.map(c => c.nom).filter(Boolean))),
    [selectedClients]
  );

  const handleMerge = async () => {
    if (selectedIds.length < 2) {
      toast({ title: 'Erreur', description: 'Sélectionnez au moins 2 clients', variant: 'destructive' });
      return;
    }
    const validPhones = phones.filter(p => p.trim());
    if (!nom.trim() || validPhones.length === 0 || !adresse.trim()) {
      toast({ title: 'Erreur', description: 'Nom, téléphone et adresse requis', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('sourceIds', JSON.stringify(selectedIds));
      fd.append('nom', nom.trim());
      fd.append('phones', JSON.stringify(validPhones));
      fd.append('adresse', adresse.trim());
      if (keepPhotoFromId) fd.append('keepPhotoFromId', keepPhotoFromId);

      await axios.post(`${API_BASE_URL}/api/clients/merge`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      toast({ title: 'Succès', description: `${selectedIds.length} clients fusionnés en 1`, className: 'notification-success' });
      onMerged();
      onClose();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Erreur lors de la fusion', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            <Merge className="w-6 h-6 text-orange-500" />
            Fusionner des clients
          </DialogTitle>
          <DialogDescription>
            Sélectionnez 2 clients ou plus, puis choisissez les informations à conserver. Les clients sélectionnés seront remplacés par un seul nouveau client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Étape 1: Sélection */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">1. Clients à fusionner ({selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''})</Label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
              {filteredClients.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground text-center">Aucun client</div>
              )}
              {filteredClients.map(c => (
                <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    checked={selectedIds.includes(c.id)}
                    onCheckedChange={() => toggleSelect(c.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{c.nom}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {(c.phones || []).join(' · ')} — {c.adresse}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedIds.length >= 2 && (
            <>
              {/* Étape 2: Nom */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">2. Nom du nouveau client</Label>
                <div className="flex flex-wrap gap-2">
                  {candidateNames.map(n => (
                    <Button key={n} type="button" variant={nom === n ? 'default' : 'outline'} size="sm" onClick={() => setNom(n)}>
                      {n}
                    </Button>
                  ))}
                </div>
                <Input value={nom} onChange={e => setNom(e.target.value)} placeholder="Ou saisir un nouveau nom" />
              </div>

              {/* Étape 3: Téléphones */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">3. Téléphone(s)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPhones([...phones, ''])}>
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {candidatePhones.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {candidatePhones.map(p => (
                      <Button key={p} type="button" variant="outline" size="sm" onClick={() => {
                        if (!phones.includes(p)) setPhones(prev => prev[0] === '' ? [p] : [...prev, p]);
                      }}>
                        + {p}
                      </Button>
                    ))}
                  </div>
                )}
                {phones.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={p} onChange={e => setPhones(prev => prev.map((x, j) => j === i ? e.target.value : x))} placeholder={`Téléphone ${i + 1}`} />
                    {phones.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => setPhones(prev => prev.filter((_, j) => j !== i))}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Étape 4: Adresse */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">4. Adresse</Label>
                <div className="flex flex-wrap gap-2">
                  {candidateAddresses.map(a => (
                    <Button key={a} type="button" variant={adresse === a ? 'default' : 'outline'} size="sm" onClick={() => setAdresse(a)}>
                      {a}
                    </Button>
                  ))}
                </div>
                <Input value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="Ou saisir une nouvelle adresse" />
              </div>

              {/* Étape 5: Photo */}
              {selectedClients.some(c => c.photo) && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">5. Photo à conserver</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant={keepPhotoFromId === '' ? 'default' : 'outline'} size="sm" onClick={() => setKeepPhotoFromId('')}>
                      Aucune
                    </Button>
                    {selectedClients.filter(c => c.photo).map(c => (
                      <Button key={c.id} type="button" variant={keepPhotoFromId === c.id ? 'default' : 'outline'} size="sm" onClick={() => setKeepPhotoFromId(c.id)}>
                        Photo de {c.nom}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
          <Button
            onClick={handleMerge}
            disabled={isSubmitting || selectedIds.length < 2}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
          >
            <Merge className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Fusion...' : `Fusionner ${selectedIds.length} clients`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientMergeModal;
