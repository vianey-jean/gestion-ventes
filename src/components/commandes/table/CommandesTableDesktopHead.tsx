/**
 * CommandesTableDesktopHead — en-tête du tableau desktop avec tri par date.
 */
import React from 'react';
import { ModernTableHeader, ModernTableRow, ModernTableHead } from '@/components/dashboard/forms/ModernTable';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  sortDateAsc: boolean;
  setSortDateAsc: (v: boolean) => void;
}

const CommandesTableDesktopHead: React.FC<Props> = ({ sortDateAsc, setSortDateAsc }) => (
  <ModernTableHeader>
    <ModernTableRow>
      <ModernTableHead className="w-52">Client</ModernTableHead>
      <ModernTableHead>Contact</ModernTableHead>
      <ModernTableHead className="w-52">Produit</ModernTableHead>
      <ModernTableHead>Prix</ModernTableHead>
      <ModernTableHead>Type</ModernTableHead>
      <ModernTableHead>
        <button
          onClick={() => setSortDateAsc(!sortDateAsc)}
          className="flex items-center gap-2 hover:text-primary transition-colors"
          title={sortDateAsc ? "Trier du plus loin au plus proche" : "Trier du plus proche au plus loin"}
        >
          Date
          {sortDateAsc ? (
            <ArrowDown className="h-4 w-4 text-purple-600" />
          ) : (
            <ArrowUp className="h-4 w-4 text-purple-600" />
          )}
        </button>
      </ModernTableHead>
      <ModernTableHead>Statut</ModernTableHead>
      <ModernTableHead>Actions</ModernTableHead>
    </ModernTableRow>
  </ModernTableHeader>
);

export default CommandesTableDesktopHead;
