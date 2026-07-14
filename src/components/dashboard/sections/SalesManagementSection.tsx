
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
import RefundForm from '@/components/dashboard/RefundForm';
import ViewRefundsModal from '@/components/dashboard/ViewRefundsModal';
import { AccessibleButton } from '@/components/accessibility/AccessibleButton';
import { PlusCircle, Edit, ShoppingCart, FileText, FileSignature, Package, FileDown, Layers, PenLine, CirclePlus, Users, RotateCcw, Eye, MapPin, MapPinned, ArrowLeftRight } from 'lucide-react';
import VentesParClientsModal from '@/components/dashboard/VentesParClientsModal';
import AddLivraisonVilleModal from '@/components/dashboard/forms/modals/AddLivraisonVilleModal';
import LivraisonVilleListModal from '@/components/dashboard/forms/modals/LivraisonVilleListModal';
import EchangerVentesModal from '@/components/dashboard/forms/modals/EchangerVentesModal';
import { cn } from '@/lib/utils';


interface SalesManagementSectionProps {
  sales: Sale[];
  products: Product[];
  currentMonth: number;
  currentYear: number;
  showActions?: boolean;
  /** Mois cible (1-12) affiché à la place du mois en cours (navigation ClientFideliteModal). */
  overrideMonth?: number;
  overrideYear?: number;
  highlightSaleId?: string;
  onReturnToCurrent?: () => void;
}


const monthNames = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
];

const SalesManagementSection: React.FC<SalesManagementSectionProps> = ({
  sales,
  products,
  currentMonth,
  currentYear,
  showActions = true,
  overrideMonth,
  overrideYear,
  highlightSaleId,
  onReturnToCurrent,
}) => {
  const isOverride =
    typeof overrideMonth === 'number' && typeof overrideYear === 'number';
  const displayMonth = isOverride ? overrideMonth! : currentMonth;
  const displayYear = isOverride ? overrideYear! : currentYear;

  const [addSaleDialogOpen, setAddSaleDialogOpen] = useState(false);
  const [multiProductSaleDialogOpen, setMultiProductSaleDialogOpen] = useState(false);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [invoiceGeneratorOpen, setInvoiceGeneratorOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>(undefined);
  const [ventesParClientsOpen, setVentesParClientsOpen] = useState(false);
  const [refundFormOpen, setRefundFormOpen] = useState(false);
  const [refundFromSale, setRefundFromSale] = useState<Sale | undefined>(undefined);
  const [viewRefundsOpen, setViewRefundsOpen] = useState(false);
  const [detailVilleLivraisonOpen, setDetailVilleLivraisonOpen] = useState(false);
  const [echangerVentesOpen, setEchangerVentesOpen] = useState(false);

  const handleRowClick = (sale: Sale) => {
    setSelectedSale(sale);
    
    if (sale.products && sale.products.length > 0) {
      setMultiProductSaleDialogOpen(true);
    } else {
      setAddSaleDialogOpen(true);
    }
  };

  // Handle refund from sale edit form
  const handleRefundFromSale = (sale: Sale) => {
    setSelectedSale(undefined);
    setMultiProductSaleDialogOpen(false);
    setAddSaleDialogOpen(false);
    setRefundFromSale(sale);
    setRefundFormOpen(true);
  };

  const actions = [
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
},
{
  icon: Users,
  label: 'Ventes par Clients',
  onClick: () => setVentesParClientsOpen(true),
  gradient: 'green' as const,
  'aria-label': 'Voir les ventes groupées par client'
},
{
  icon: RotateCcw,
  label: 'Remboursement',
  onClick: () => { setRefundFromSale(undefined); setRefundFormOpen(true); },
  gradient: 'red' as const,
  'aria-label': 'Ouvrir le formulaire de remboursement'
},
{
  icon: Eye,
  label: 'Voir Remboursements',
  onClick: () => setViewRefundsOpen(true),
  gradient: 'blue' as const,
  'aria-label': 'Voir les remboursements du mois'
},
{
  icon: MapPinned,
  label: 'Détail ville livraison',
  onClick: () => setDetailVilleLivraisonOpen(true),
  gradient: 'purple' as const,
  'aria-label': 'Voir et gérer les villes de livraison'
},
{
  icon: ArrowLeftRight,
  label: 'Echanger ventes',
  onClick: () => setEchangerVentesOpen(true),
  gradient: 'orange' as const,
  'aria-label': 'Échanger les produits d\'une vente existante'
}
  ];

  return (
    <section aria-labelledby="sales-management-title">
      {isOverride && (
        <style>{`
          @keyframes rizikyMonthBlink {
            0%,100% { color:#065f46; text-shadow:0 0 12px rgba(16,185,129,.9), 0 0 24px rgba(16,185,129,.6); }
            50%     { color:#10b981; text-shadow:0 0 4px rgba(16,185,129,.25); }
          }
          .riziky-month-blink { animation: rizikyMonthBlink 1s ease-in-out infinite; }
        `}</style>
      )}
      <ModernContainer 
        title="Gestion des Ventes" 
        icon={ShoppingCart}
        gradient="neutral"
        headerActions={
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {isOverride ? 'Ventes affichées' : 'Mois en cours'}
              </p>
              <p className={cn(
                "text-lg font-black",
                isOverride
                  ? "riziky-month-blink inline-flex items-center gap-1"
                  : "text-primary"
              )}>
                {isOverride && '📅 '}Ventes {monthNames[displayMonth - 1]} {displayYear}
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
        {(() => {
          const multiProductAction = actions.find(a => a.label === 'Ajouter vente multi-produits');
          const otherActions = actions.filter(a => a.label !== 'Ajouter vente multi-produits');
          return (
            <div className="mb-8 space-y-4">
              {multiProductAction && (
                <div className="flex flex-wrap gap-4" role="toolbar" aria-label="Action principale">
                  <ModernActionButton
                    key={multiProductAction.label}
                    icon={multiProductAction.icon}
                    onClick={multiProductAction.onClick}
                    gradient={multiProductAction.gradient}
                    buttonSize="md"
                    aria-label={multiProductAction['aria-label']}
                  >
                    {multiProductAction.label}
                  </ModernActionButton>
                </div>
              )}
              <div
                aria-hidden={!showActions}
                className={cn(
                  "flex flex-wrap gap-4 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  showActions
                    ? "opacity-100 max-h-[1200px] translate-y-0 pointer-events-auto"
                    : "opacity-0 max-h-0 -translate-y-2 pointer-events-none"
                )}
                role="toolbar"
                aria-label="Actions secondaires de gestion des ventes"
              >
                {otherActions.map((action) => (
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
            </div>
          );
        })()}

        
        {/* Tableau des ventes */}
        <div 
          className="bg-card rounded-xl shadow-lg overflow-hidden"
          role="region"
          aria-label="Tableau des ventes du mois"
        >
          <SalesTable 
            sales={sales} 
            onRowClick={handleRowClick}
            overrideMonth={overrideMonth}
            overrideYear={overrideYear}
            highlightSaleId={highlightSaleId}
          />
        </div>
        
        {/* Message informatif */}
        <div 
          className="text-sm text-muted-foreground mt-4 p-4 bg-primary/5 rounded-lg"
          role="status"
          aria-live="polite"
        >
          <p className="font-medium text-primary">
            📅 Affichage automatique du mois en cours: {monthNames[currentMonth - 1]} {currentYear}
          </p>
          <p className="text-primary/70 mt-1">
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
          onRefund={handleRefundFromSale}
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
          onRefund={handleRefundFromSale}
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

      <VentesParClientsModal
        isOpen={ventesParClientsOpen}
        onClose={() => setVentesParClientsOpen(false)}
      />

      <RefundForm
        isOpen={refundFormOpen}
        onClose={() => { setRefundFormOpen(false); setRefundFromSale(undefined); }}
        editSale={refundFromSale}
      />

      <ViewRefundsModal
        isOpen={viewRefundsOpen}
        onClose={() => setViewRefundsOpen(false)}
      />


      <LivraisonVilleListModal
        isOpen={detailVilleLivraisonOpen}
        onClose={() => setDetailVilleLivraisonOpen(false)}
      />

      <EchangerVentesModal
        isOpen={echangerVentesOpen}
        onClose={() => setEchangerVentesOpen(false)}
      />
    </section>
  );
};

export default SalesManagementSection;
