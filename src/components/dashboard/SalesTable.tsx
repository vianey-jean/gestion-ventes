import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Sale } from '@/types';

interface SalesTableProps {
  sales: Sale[];
  onRowClick: (sale: Sale) => void;
}

const SalesTable: React.FC<SalesTableProps> = ({ sales, onRowClick }) => {
  // Format date to display in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  // Calculate totals
  const totalSellingPrice = sales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const totalQuantitySold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Prix de vente</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
            <TableHead className="text-right">Prix d'achat</TableHead>
            <TableHead className="text-right">Bénéfice</TableHead>
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
              <TableCell></TableCell>
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
