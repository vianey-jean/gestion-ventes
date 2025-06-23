import React from 'react';
import { TableBody, TableCell, TableFooter, TableRow } from '@/components/ui/table';
import { ModernTable, ModernTableHeader, ModernTableRow, ModernTableHead, ModernTableCell } from '@/components/dashboard/forms/ModernTable';
import { Sale } from '@/types';
import { TrendingUp, Package, Euro, Calendar } from 'lucide-react';

interface SalesTableProps {
  sales: Sale[];
  onRowClick: (sale: Sale) => void;
}

/**
 * Tableau des ventes modernisé
 */
const SalesTable: React.FC<SalesTableProps> = ({ sales, onRowClick }) => {
  // Formater une date au format local
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  // Formater un montant en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  // Vérifier si le produit est une avance
  const isAdvanceProduct = (description: string) => {
    return description.includes("Avance Perruque ou Tissages");
  };
  
  // Obtenir la quantité à afficher selon le type de produit
  const getDisplayQuantity = (sale: Sale) => {
    return isAdvanceProduct(sale.description) ? 0 : sale.quantitySold;
  };
  
  // Calculer les totaux
  const totalSellingPrice = sales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const totalQuantitySold = sales.reduce((sum, sale) => {
    return sum + (isAdvanceProduct(sale.description) ? 0 : sale.quantitySold);
  }, 0);
  const totalPurchasePrice = sales.reduce((sum, sale) => sum + (sale.purchasePrice * sale.quantitySold), 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  
  return (
    <ModernTable>
      <ModernTableHeader>
        <TableRow>
          <ModernTableHead>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Date</span>
            </div>
          </ModernTableHead>
          <ModernTableHead>
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Description</span>
            </div>
          </ModernTableHead>
          <ModernTableHead className="text-right">
            <div className="flex items-center justify-end space-x-2">
              <Euro className="h-4 w-4" />
              <span>Prix de vente</span>
            </div>
          </ModernTableHead>
          <ModernTableHead className="text-right">Quantité</ModernTableHead>
          <ModernTableHead className="text-right">Prix d'achat</ModernTableHead>
          <ModernTableHead className="text-right">
            <div className="flex items-center justify-end space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Bénéfice</span>
            </div>
          </ModernTableHead>
        </TableRow>
      </ModernTableHeader>
      <TableBody>
        {sales.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
              <div className="flex flex-col items-center space-y-2">
                <Package className="h-12 w-12 text-gray-300" />
                <p>Aucune vente enregistrée pour ce mois</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          sales.map((sale) => (
            <ModernTableRow 
              key={sale.id} 
              onClick={() => onRowClick(sale)}
            >
              <ModernTableCell>{formatDate(sale.date)}</ModernTableCell>
              <ModernTableCell className="font-medium">{sale.description}</ModernTableCell>
              <ModernTableCell className="text-right font-semibold text-green-600">
                {formatCurrency(sale.sellingPrice)}
              </ModernTableCell>
              <ModernTableCell className="text-right">{getDisplayQuantity(sale)}</ModernTableCell>
              <ModernTableCell className="text-right text-gray-600">
                {formatCurrency(sale.purchasePrice)}
              </ModernTableCell>
              <ModernTableCell className="text-right font-bold text-blue-600">
                {formatCurrency(sale.profit)}
              </ModernTableCell>
            </ModernTableRow>
          ))
        )}
      </TableBody>
      {sales.length > 0 && (
        <TableFooter>
          <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 font-bold">
            <TableCell colSpan={2} className="text-right text-lg">
              Totaux:
            </TableCell>
            <TableCell className="text-right text-lg text-green-600 font-bold">
              {formatCurrency(totalSellingPrice)}
            </TableCell>
            <TableCell className="text-right text-lg text-purple-600 font-bold">
              {totalQuantitySold}
            </TableCell>
            <TableCell className="text-right text-lg text-gray-700 font-bold">
              {formatCurrency(totalPurchasePrice)}
            </TableCell>
            <TableCell className="text-right text-lg text-blue-600 font-bold">
              {formatCurrency(totalProfit)}
            </TableCell>
          </TableRow>
        </TableFooter>
      )}
    </ModernTable>
  );
};

export default SalesTable;
