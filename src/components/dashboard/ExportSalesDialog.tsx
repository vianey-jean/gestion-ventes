
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale } from '@/types';
import { salesService } from '@/service/api';

// Noms des mois en français
const monthNames = [
  'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'
];

// Pour les années dans le dropdown, commençant par l'année courante et remontant à 5 ans
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

interface ExportSalesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Composant pour l'exportation des ventes en PDF
 * Permet de sélectionner un mois et une année pour l'exportation
 */
const ExportSalesDialog: React.FC<ExportSalesDialogProps> = ({ isOpen, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fermer et réinitialiser la confirmation
  const handleClose = () => {
    setIsConfirming(false);
    onClose();
  };

  // Passer à l'étape de confirmation
  const handleProceed = () => {
    setIsConfirming(true);
  };

  /**
   * Vérifie si le produit est une avance
   * @param description - Description du produit
   * @returns true si c'est une avance, false sinon
   */
  const isAdvanceProduct = (description: string) => {
    return description.toLowerCase().includes('avance');
  };

  /**
   * Gère l'exportation des ventes en PDF
   */
  const handleExport = async () => {
    setIsLoading(true);
    
    try {
      // Important: Month numbers in JavaScript Date are 0-based (0 = January, 1 = February, etc.)
      // But in our date strings in the database, they are 1-based (01 = January, 02 = February, etc.)
      // So we add 1 to match the format in the database
      const monthForDB = selectedMonth + 1; // Convert from 0-based to 1-based
      
      // Récupérer les ventes pour le mois et l'année sélectionnés
      const sales = await salesService.getSales(monthForDB, selectedYear);
      
      if (!sales || sales.length === 0) {
        toast({
          title: "Aucune vente à exporter",
          description: `Aucune vente trouvée pour ${monthNames[selectedMonth]} ${selectedYear}.`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      console.log(`Exporting sales for month ${monthForDB} and year ${selectedYear}`);
      console.log(`Found ${sales.length} sales to export`);
      
      // Créer le PDF
      generatePDF(sales, selectedMonth, selectedYear);
      
      toast({
        title: "Export réussi",
        description: `Les ventes de ${monthNames[selectedMonth]} ${selectedYear} ont été exportées.`,
      });
    } catch (error) {
      console.error("Error exporting sales:", error);
      toast({
        title: "Erreur d'export",
        description: "Une erreur s'est produite lors de l'exportation des ventes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  /**
   * Génère le PDF avec les données des ventes
   * @param sales - Liste des ventes à exporter
   * @param month - Mois sélectionné (0-11)
   * @param year - Année sélectionnée
   */
  const generatePDF = (sales: Sale[], month: number, year: number) => {
    const doc = new jsPDF();
    doc.text(`Rapport de ventes – ${monthNames[month]} ${year}`, 14, 20);
  
    // Préparer le corps du tableau
    const tableBody = sales.map(sale => {
      // Obtenir les valeurs formatées
      const achatPrice = typeof sale.purchasePrice === 'number' ? sale.purchasePrice : 0;
      const quantity = isAdvanceProduct(sale.description) ? 0 : (typeof sale.quantitySold === 'number' ? sale.quantitySold : 0);
      const ventePrice = typeof sale.sellingPrice === 'number' ? sale.sellingPrice : 0;
      const profit = typeof sale.profit === 'number' ? sale.profit : 0;
  
      return [
        new Date(sale.date).toLocaleDateString('fr-FR'),
        sale.description || 'Inconnu',
        achatPrice.toFixed(2),
        quantity,
        ventePrice.toFixed(2),
        profit.toFixed(2),
      ];
    });
  
    // Calcul des totaux - exactement comme dans SalesTable
    const totalQuantite = sales.reduce((sum, sale) => {
      return sum + (isAdvanceProduct(sale.description) ? 0 : (typeof sale.quantitySold === 'number' ? sale.quantitySold : 0));
    }, 0);
    
    const totalVente = sales.reduce((sum, sale) => {
      return sum + (typeof sale.sellingPrice === 'number' ? sale.sellingPrice : 0);
    }, 0);
    
    const totalAchat = sales.reduce((sum, sale) => {
      const quantite = isAdvanceProduct(sale.description) ? 0 : (typeof sale.quantitySold === 'number' ? sale.quantitySold : 0);
      const prixAchat = typeof sale.purchasePrice === 'number' ? sale.purchasePrice : 0;
      return sum + (prixAchat * quantite);
    }, 0);
    
    const totalProfit = sales.reduce((sum, sale) => {
      return sum + (typeof sale.profit === 'number' ? sale.profit : 0);
    }, 0);
  
    // Ajouter la ligne des totaux avec le total des prix d'achat
    tableBody.push([
      '', // Date vide
      'TOTAL',
      totalAchat.toFixed(2),
      totalQuantite,
      totalVente.toFixed(2),
      totalProfit.toFixed(2),
    ]);
  
    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Produit', 'Prix Achat (€)', 'Quantité', 'Prix Vendu (€)', 'Bénéfice (€)']],
      body: tableBody,
      foot: [['', '', '', '', '', '']],
      headStyles: {
        fillColor: [0, 0, 255],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      footStyles: {
        fillColor: [255, 255, 255],
        textColor: [255, 0, 0],
        fontStyle: 'bold'
      },
      didDrawCell: (data) => {
        // Colorer la dernière ligne (totaux) en rouge
        if (data.row.index === tableBody.length - 1) {
           doc.setTextColor(234, 56, 76);        // Rouge
           doc.setFont(undefined, 'bold');       // Gras
           doc.setFillColor(240, 240, 240);      // Fond gris clair
        } else {
          doc.setTextColor(0, 0, 0);            // Noir
          doc.setFont(undefined, 'normal');     // Normal
         }}
    });
  
    doc.save(`ventes_${monthNames[month]}_${year}.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isConfirming ? 'Confirmer l\'exportation' : 'Exporter les ventes'}
          </DialogTitle>
        </DialogHeader>
        
        {!isConfirming ? (
          // Formulaire de sélection du mois et de l'année
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Mois</Label>
                <Select 
                  value={selectedMonth.toString()} 
                  onValueChange={(value) => setSelectedMonth(Number(value))}
                >
                  <SelectTrigger id="month" className="w-full">
                    <SelectValue placeholder="Sélectionner le mois" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((month, index) => (
                      <SelectItem key={month} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Année</Label>
                <Select 
                  value={selectedYear.toString()} 
                  onValueChange={(value) => setSelectedYear(Number(value))}
                >
                  <SelectTrigger id="year" className="w-full">
                    <SelectValue placeholder="Sélectionner l'année" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={handleProceed} className="ml-2">
                Suivant
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // Écran de confirmation
          <div className="py-6">
            <p className="mb-6 text-center">
              Voulez-vous exporter vers PDF les ventes du mois 
              <span className="font-bold"> {monthNames[selectedMonth]} </span> 
              et de l'année <span className="font-bold">{selectedYear}</span> ?
            </p>
            
            <p className="mb-4 text-sm text-gray-500">
              Note: Cette opération n'affectera pas les données dans la base de données.
            </p>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirming(false)}>
                Retour
              </Button>
              <Button 
                onClick={handleExport} 
                className="ml-2"
                disabled={isLoading}
              >
                {isLoading ? "Exportation..." : "Confirmer l'export"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportSalesDialog;
