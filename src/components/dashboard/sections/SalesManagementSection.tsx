
import React, { useState } from 'react';
import { Sale, Product } from '@/types';
import ModernContainer from '@/components/dashboard/forms/ModernContainer';
import ModernActionButton from '@/components/dashboard/forms/ModernActionButton';
import SalesTable from '@/components/dashboard/SalesTable';
import AddSaleForm from '@/components/dashboard/AddSaleForm';
import MultiProductSaleForm from '@/components/dashboard/forms/MultiProductSaleForm';
import AddProductForm from '@/components/dashboard/AddProductForm';
import EditProductForm from '@/components/dashboard/EditProductForm';
import ExportSalesDialog from '@/components/dashboard/ExportSalesDialog';
import InvoiceGenerator from '@/components/dashboard/InvoiceGenerator';
import { AccessibleButton } from '@/components/accessibility/AccessibleButton';
import { PlusCircle, Edit, ShoppingCart, FileText, FileSignature, Package, FileDown, Layers, PenLine, CirclePlus } from 'lucide-react';

interface SalesManagementSectionProps {
  sales: Sale[];
  products: Product[];
  currentMonth: number;
  currentYear: number;
}

const monthNames = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
];

const SalesManagementSection: React.FC<SalesManagementSectionProps> = ({
  sales,
  products,
  currentMonth,
  currentYear
}) => {
  // États pour gérer les dialogues
  const [addSaleDialogOpen, setAddSaleDialogOpen] = useState(false);
  const [multiProductSaleDialogOpen, setMultiProductSaleDialogOpen] = useState(false);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [invoiceGeneratorOpen, setInvoiceGeneratorOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>(undefined);

  const handleRowClick = (sale: Sale) => {
    setSelectedSale(sale);
    
    // Vérifier si c'est une vente multi-produits
    if (sale.products && sale.products.length > 0) {
      setMultiProductSaleDialogOpen(true);
    } else {
      setAddSaleDialogOpen(true);
    }
  };

  const actions = [
   {
  icon: CirclePlus,
  label: 'Ajouter un produit',
  onClick: () => setAddProductDialogOpen(true),
  gradient: 'red' as const,
  'aria-label': 'Ouvrir le formulaire d\'ajout de produit'
},
{
  icon: PenLine,
  label: 'Modifier un produit',
  onClick: () => setEditProductDialogOpen(true),
  gradient: 'blue' as const,
  'aria-label': 'Ouvrir le formulaire de modification de produit'
},
{
  icon: Layers,
  label: 'Ajouter vente multi-produits',
  onClick: () => setMultiProductSaleDialogOpen(true),
  gradient: 'orange' as const,
  'aria-label': 'Ouvrir le formulaire de vente avec plusieurs produits'
},

   {
  icon: FileSignature,
  label: 'Facture par Client',
  onClick: () => setInvoiceGeneratorOpen(true),
  gradient: 'purple' as const,
  'aria-label': 'Ouvrir le générateur de factures'
}
  ];

  return (
    <section aria-labelledby="sales-management-title">
      <ModernContainer 
        title="Gestion des Ventes" 
        icon={ShoppingCart}
        gradient="neutral"
        headerActions={
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Mois en cours</p>
              <p className="text-lg font-bold text-blue-500">
                {monthNames[currentMonth - 1]} {currentYear}
              </p>
            </div>
            <AccessibleButton
              ariaLabel="Exporter les données de vente"
              announceOnClick="Ouverture de la boîte de dialogue d'export"
              onClick={() => setExportDialogOpen(true)}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Générer
            </AccessibleButton>
          </div>
        }
      >
        {/* Boutons d'action */}
        <div 
          className="flex flex-wrap gap-4 mb-8"
          role="toolbar"
          aria-label="Actions de gestion des ventes"
        >
          {actions.map((action, index) => (
            <ModernActionButton
              key={action.label}
              icon={action.icon}
              onClick={action.onClick}
              gradient={action.gradient}
              buttonSize="md"
              aria-label={action['aria-label']}
            >
              {action.label}
            </ModernActionButton>
          ))}
        </div>
        
        {/* Tableau des ventes */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          role="region"
          aria-label="Tableau des ventes du mois"
        >
          <SalesTable 
            sales={sales} 
            onRowClick={handleRowClick}
          />
        </div>
        
        {/* Message informatif accessible */}
        <div 
          className="text-sm text-gray-500 mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
          role="status"
          aria-live="polite"
        >
          <p className="font-medium text-blue-700 dark:text-blue-300">
            📅 Affichage automatique du mois en cours: {monthNames[currentMonth - 1]} {currentYear}
          </p>
          <p className="text-blue-600 dark:text-blue-400 mt-1">
            Les données se mettront automatiquement à jour le 1er du mois prochain.
          </p>
        </div>
      </ModernContainer>

      {/* Dialogues modaux */}
      {addSaleDialogOpen && (
        <AddSaleForm 
          isOpen={addSaleDialogOpen} 
          onClose={() => {
            setAddSaleDialogOpen(false);
            setSelectedSale(undefined);
          }} 
          editSale={selectedSale}
        />
      )}
      
      {multiProductSaleDialogOpen && (
        <MultiProductSaleForm 
          isOpen={multiProductSaleDialogOpen} 
          onClose={() => {
            setMultiProductSaleDialogOpen(false);
            setSelectedSale(undefined);
          }} 
          editSale={selectedSale}
        />
      )}
      
      {addProductDialogOpen && (
        <AddProductForm 
          isOpen={addProductDialogOpen} 
          onClose={() => setAddProductDialogOpen(false)} 
        />
      )}
      
      {editProductDialogOpen && (
        <EditProductForm
          isOpen={editProductDialogOpen}
          onClose={() => setEditProductDialogOpen(false)}
        />
      )}
      
      <ExportSalesDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      />

      <InvoiceGenerator
        isOpen={invoiceGeneratorOpen}
        onClose={() => setInvoiceGeneratorOpen(false)}
      />
    </section>
  );
};

export default SalesManagementSection;
