
import React from 'react';
import { TableBody, TableCell, TableFooter, TableRow } from '@/components/ui/table';
import { ModernTable, ModernTableHeader, ModernTableRow, ModernTableHead, ModernTableCell } from '@/components/dashboard/forms/ModernTable';
import { Sale } from '@/types';
import { TrendingUp, Package, Euro, Calendar, Sparkles, Award } from 'lucide-react';

interface SalesTableProps {
  sales: Sale[];
  onRowClick: (sale: Sale) => void;
}

/**
 * Tableau des ventes modernisé et luxueux
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
    <div className="bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* Header avec gradient luxueux */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Tableau des Ventes Premium</h3>
            <p className="text-white/80 text-sm">Visualisation avancée de vos performances</p>
          </div>
          <div className="ml-auto">
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
          </div>
        </div>
      </div>

      <ModernTable>
        <ModernTableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-none">
            <ModernTableHead className="bg-transparent">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-full p-1">
                  <Calendar className="h-3 w-3 text-white" />
                </div>
                <span className='text-red-600 font-bold text-sm'>Date</span>
              </div>
            </ModernTableHead>
            <ModernTableHead className="bg-transparent">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-1">
                  <Package className="h-3 w-3 text-white" />
                </div>
                <span className='text-red-600 font-bold text-sm'>Description</span>
              </div>
            </ModernTableHead>
            <ModernTableHead className="text-right bg-transparent">
              <div className="flex items-center justify-end space-x-2">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-1">
                  <Euro className="h-3 w-3 text-white" />
                </div>
                <span className='text-red-600 font-bold text-sm'>Prix de vente</span>
              </div>
            </ModernTableHead>
            <ModernTableHead className="text-right bg-transparent">
              <span className='text-red-600 font-bold text-sm'>Quantité</span>
            </ModernTableHead>
            <ModernTableHead className="text-right bg-transparent">
              <span className='text-red-600 font-bold text-sm'>Prix d'achat</span>
            </ModernTableHead>
            <ModernTableHead className="text-right bg-transparent">
              <div className="flex items-center justify-end space-x-2">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-1">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                <span className='text-red-600 font-bold text-sm'>Bénéfice</span>
              </div>
            </ModernTableHead>
          </TableRow>
        </ModernTableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full p-6">
                    <Package className="h-12 w-12 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Aucune vente enregistrée</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Commencez à ajouter vos premières ventes</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale, index) => (
              <ModernTableRow 
                key={sale.id} 
                onClick={() => onRowClick(sale)}
                className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 hover:shadow-lg border-b border-gray-100/50 dark:border-gray-700/50"
              >
                <ModernTableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{formatDate(sale.date)}</span>
                  </div>
                </ModernTableCell>
                <ModernTableCell className="font-medium">
                  <div className="max-w-xs">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{sale.description}</p>
                  </div>
                </ModernTableCell>
                <ModernTableCell className="text-right">
                  <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 px-3 py-1 rounded-full inline-block">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(sale.sellingPrice)}
                    </span>
                  </div>
                </ModernTableCell>
                <ModernTableCell className="text-right">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-3 py-1 rounded-full inline-block">
                    <span className="font-semibold text-purple-700 dark:text-purple-400">
                      {getDisplayQuantity(sale)}
                    </span>
                  </div>
                </ModernTableCell>
                <ModernTableCell className="text-right">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {formatCurrency(sale.purchasePrice)}
                  </span>
                </ModernTableCell>
                <ModernTableCell className="text-right">
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 px-3 py-1 rounded-full inline-block">
                    <span className="font-bold text-orange-700 dark:text-orange-400">
                      {formatCurrency(sale.profit)}
                    </span>
                  </div>
                </ModernTableCell>
              </ModernTableRow>
            ))
          )}
        </TableBody>
        {sales.length > 0 && (
          <TableFooter>
            <TableRow className="bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 text-white border-none">
              <TableCell colSpan={2} className="text-right text-lg font-bold bg-transparent">
                <div className="flex items-center justify-end space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Totaux:</span>
                </div>
              </TableCell>
              <TableCell className="text-right bg-transparent">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                  <span className="text-lg font-bold text-emerald-200">
                    {formatCurrency(totalSellingPrice)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right bg-transparent">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                  <span className="text-lg font-bold text-purple-200">
                    {totalQuantitySold}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right bg-transparent">
                <span className="text-lg font-bold text-gray-200">
                  {formatCurrency(totalPurchasePrice)}
                </span>
              </TableCell>
              <TableCell className="text-right bg-transparent">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                  <span className="text-lg font-bold text-yellow-200">
                    {formatCurrency(totalProfit)}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </ModernTable>
    </div>
  );
};

export default SalesTable;
