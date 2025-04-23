
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Sale } from '@/types';

interface SalesTableProps {
  sales: Sale[];
  onRowClick: (sale: Sale) => void;
}

/**
 * Tableau des ventes
 * @param sales - Liste des ventes à afficher
 * @param onRowClick - Fonction appelée lorsqu'une ligne est cliquée
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
  
  // Calculer les totaux
  const totalSellingPrice = sales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const totalQuantitySold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
  const totalPurchasePrice = sales.reduce((sum, sale) => sum + (sale.purchasePrice * sale.quantitySold), 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Date</TableHead>
            <TableHead className="font-bold">Description</TableHead>
            <TableHead className="text-right font-bold">Prix de vente</TableHead>
            <TableHead className="text-right font-bold">Quantité</TableHead>
            <TableHead className="text-right font-bold">Prix d'achat</TableHead>
            <TableHead className="text-right font-bold">Bénéfice</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                Aucune vente enregistrée pour ce mois
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow 
                key={sale.id} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onRowClick(sale)}
              >
                <TableCell>{formatDate(sale.date)}</TableCell>
                <TableCell>{sale.description}</TableCell>
                <TableCell className="text-right">{formatCurrency(sale.sellingPrice)}</TableCell>
                <TableCell className="text-right">{sale.quantitySold}</TableCell>
                <TableCell className="text-right">{formatCurrency(sale.purchasePrice)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(sale.profit)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        {sales.length > 0 && (
          <TableFooter>
            <TableRow className="bg-gray-50 font-semibold">
              <TableCell colSpan={2} className="text-right">
                Totaux:
              </TableCell>
              <TableCell className="text-right text-app-blue">
                {formatCurrency(totalSellingPrice)}
              </TableCell>
              <TableCell className="text-right text-app-purple">
                {totalQuantitySold}
              </TableCell>
              <TableCell className="text-right text-gray-700">
                {formatCurrency(totalPurchasePrice)}
              </TableCell>
              <TableCell className="text-right text-app-green">
                {formatCurrency(totalProfit)}
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
};

export default SalesTable;
