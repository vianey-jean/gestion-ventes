/**
 * Modale de détection de doublons clients.
 * Affiche les clients existants qui matchent une saisie en cours
 * et propose : utiliser un client existant (avec possibilité de modifier
 * ses infos), ou créer un nouveau client distinct.
 */
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, UserCheck, UserPlus, Phone, MapPin, User, Edit3, Save, X } from 'lucide-react';
import type { ClientLike, ClientMatch, MatchField, TypedClient } from '@/utils/clientMatch';
import { canCreateNewDespiteMatches } from '@/utils/clientMatch';

interface DuplicateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: ClientMatch[];
  typed: TypedClient;
  /** L'utilisateur a choisi d'utiliser un client existant (éventuellement édité) */
  onUseExisting: (client: ClientLike) => void;
  /** L'utilisateur veut créer un nouveau client malgré les correspondances */
  onCreateNew?: () => void;
  /** Permet d'enregistrer une mise à jour du client existant dans la base */
  onUpdateClient?: (clientId: string, patch: { nom: string; phones: string[]; addresses: string[] }) => Promise<void>;
}

const fieldLabel: Record<MatchField, string> = {
  nom: 'Nom',
  phone: 'Téléphone',
  address: 'Adresse',
};

const DuplicateClientModal: React.FC<DuplicateClientModalProps> = ({
  isOpen,
  onClose,
  matches,
  typed,
  onUseExisting,
  onCreateNew,
  onUpdateClient,
}) => {
  const canCreate = canCreateNewDespiteMatches(matches, typed);
  const [editingClient, setEditingClient] = useState<ClientLike | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editPhones, setEditPhones] = useState<string[]>(['']);
  const [editAddresses, setEditAddresses] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) setEditingClient(null);
  }, [isOpen]);

  const startEdit = (c: ClientLike) => {
    setEditingClient(c);
    setEditNom(c.nom || '');
    const phones = c.phones && c.phones.length ? c.phones : c.phone ? [c.phone] : [''];
    setEditPhones(phones.length ? phones : ['']);
    const addresses = c.addresses && c.addresses.length ? c.addresses : c.adresse ? [c.adresse] : [''];
    setEditAddresses(addresses.length ? addresses : ['']);
  };

  const saveEdit = async () => {
    if (!editingClient || !editingClient.id) return;
    const cleanPhones = editPhones.map((p) => p.trim()).filter(Boolean);
    const cleanAddresses = editAddresses.map((a) => a.trim()).filter(Boolean);
    if (!editNom.trim() || cleanPhones.length === 0 || cleanAddresses.length === 0) return;
    setSaving(true);
    try {
      if (onUpdateClient) {
        await onUpdateClient(editingClient.id, {
          nom: editNom.trim(),
          phones: cleanPhones,
          addresses: cleanAddresses,
        });
      }
      const updated: ClientLike = {
        ...editingClient,
        nom: editNom.trim(),
        phones: cleanPhones,
        phone: cleanPhones[0],
        addresses: cleanAddresses,
        adresse: cleanAddresses[0],
      };
      onUseExisting(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-white via-amber-50/40 to-orange-50/40 dark:from-gray-900 dark:via-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300/60 dark:border-amber-700/60 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl md:text-2xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            <AlertTriangle className="h-7 w-7 text-amber-500 animate-pulse shrink-0" />
            Client(s) déjà existant(s)
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Une ou plusieurs informations saisies correspondent à un client existant.
            Choisissez d'utiliser un client existant (éventuellement avec modification),
            ou créez un nouveau client si les données sont vraiment différentes.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-3 py-2">
            {matches.map(({ client, fields }) => {
              const isEditing = editingClient && editingClient.id === client.id;
              return (
                <div
                  key={client.id || client.nom}
                  className="rounded-2xl border-2 border-amber-200/70 dark:border-amber-800/50 bg-white/80 dark:bg-gray-900/60 p-4 shadow-md"
                >
                  {!isEditing ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-500" />
                          {client.nom}
                        </div>
                        {fields.map((f) => (
                          <Badge key={f} className="bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-200">
                            ⚠ {fieldLabel[f]} identique
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {(client.phones && client.phones.length ? client.phones : [client.phone]).filter(Boolean).map((p, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-emerald-500" /> {p}
                          </div>
                        ))}
                        {(client.addresses && client.addresses.length ? client.addresses : [client.adresse]).filter(Boolean).map((a, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-blue-500" /> {a}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => { onUseExisting(client); onClose(); }}
                          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Utiliser ce client
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(client)}
                          className="border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Modifier puis utiliser
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="font-semibold text-sm flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <Edit3 className="h-4 w-4" /> Modification de "{client.nom}"
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Nom</Label>
                        <Input value={editNom} onChange={(e) => setEditNom(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Téléphone(s)</Label>
                        {editPhones.map((p, i) => (
                          <Input
                            key={i}
                            value={p}
                            onChange={(e) => setEditPhones((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                            placeholder={i === 0 ? 'Principal' : `Téléphone ${i + 1}`}
                          />
                        ))}
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditPhones((p) => [...p, ''])}>
                          + Ajouter un numéro
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Adresse(s)</Label>
                        {editAddresses.map((a, i) => (
                          <Input
                            key={i}
                            value={a}
                            onChange={(e) => setEditAddresses((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                            placeholder={i === 0 ? 'Principale' : `Adresse ${i + 1}`}
                          />
                        ))}
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditAddresses((p) => [...p, ''])}>
                          + Ajouter une adresse
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={saveEdit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          <Save className="h-4 w-4 mr-1" />
                          {saving ? 'Enregistrement…' : 'Enregistrer & utiliser'}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setEditingClient(null)}>
                          <X className="h-4 w-4 mr-1" /> Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4 gap-2 flex-wrap sm:flex-nowrap">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          {onCreateNew && (
            <Button
              type="button"
              onClick={() => { onCreateNew(); onClose(); }}
              disabled={!canCreate}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-50"
              title={canCreate ? '' : 'Modifiez au moins un champ pour créer un nouveau client distinct'}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Créer un nouveau client
            </Button>
          )}
        </DialogFooter>
        {!canCreate && onCreateNew && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
            Tous les champs saisis correspondent exactement. Modifiez au moins un nom, téléphone
            ou adresse pour pouvoir créer un nouveau client distinct.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateClientModal;
