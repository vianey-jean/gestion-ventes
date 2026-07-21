/**
 * ClientConfirmDialogs — Boîtes de dialogue de confirmation
 * pour l'ajout et la modification d'un client.
 */
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  showAdd: boolean;
  setShowAdd: (v: boolean) => void;
  showEdit: boolean;
  setShowEdit: (v: boolean) => void;
  isSubmitting: boolean;
  onConfirmAdd: () => void;
  onConfirmEdit: () => void;
}

const ClientConfirmDialogs: React.FC<Props> = ({
  showAdd, setShowAdd, showEdit, setShowEdit, isSubmitting, onConfirmAdd, onConfirmEdit,
}) => (
  <>
    <Dialog open={showAdd} onOpenChange={setShowAdd}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmer l'ajout</DialogTitle>
          <DialogDescription>Voulez-vous vraiment ajouter ce client ?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAdd(false)} disabled={isSubmitting}>Annuler</Button>
          <Button onClick={onConfirmAdd} disabled={isSubmitting}>
            {isSubmitting ? 'Ajout...' : 'Oui, ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={showEdit} onOpenChange={setShowEdit}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmer la modification</DialogTitle>
          <DialogDescription>Voulez-vous vraiment modifier ce client ?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEdit(false)} disabled={isSubmitting}>Annuler</Button>
          <Button onClick={onConfirmEdit} disabled={isSubmitting}>
            {isSubmitting ? 'Modification...' : 'Oui, modifier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
);

export default ClientConfirmDialogs;
