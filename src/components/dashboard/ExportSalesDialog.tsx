
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
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
   * Génère le PDF avec les données des ventes - Version Premium
   * @param sales - Liste des ventes à exporter
   * @param month - Mois sélectionné (0-11)
   * @param year - Année sélectionnée
   */
  const generatePDF = (sales: Sale[], month: number, year: number) => {
    const doc = new jsPDF();
    
    // En-tête premium avec gradient simulé
    doc.setFillColor(153, 51, 204); // Bleu premium 
    doc.rect(0, 0, 210, 35, 'F');
    
    // Titre principal en blanc
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('RAPPORT DE VENTES PREMIUM', 105, 15, { align: 'center' });
    
    // Sous-titre avec période
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(`${monthNames[month]} ${year}`, 105, 25, { align: 'center' });
    
    // Ligne de séparation élégante
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(2);
    doc.line(20, 40, 190, 40);

    // Préparer le corps du tableau - Gestion ventes multi-produits ET simples
    const tableBody = [];
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.date).toLocaleDateString('fr-FR');
      
      if (sale.products && Array.isArray(sale.products)) {
        // Vente multi-produits - chaque produit sur une ligne séparée
        sale.products.forEach((product, idx) => {
          const quantity = isAdvanceProduct(product.description) ? 0 : product.quantitySold;
          
          tableBody.push([
            idx === 0 ? saleDate : '', // Date seulement sur la première ligne
            product.description || 'Inconnu',
            `${product.purchasePrice.toFixed(2)} €`,
            quantity.toString(),
            `${product.sellingPrice.toFixed(2)} €`,
            `${product.profit.toFixed(2)} €`,
          ]);
        });
      } else {
        // Vente simple (ancien format)
        const achatPrice = typeof sale.purchasePrice === 'number' ? sale.purchasePrice : 0;
        const quantity = isAdvanceProduct(sale.description || '') ? 0 : (typeof sale.quantitySold === 'number' ? sale.quantitySold : 0);
        const ventePrice = typeof sale.sellingPrice === 'number' ? sale.sellingPrice : 0;
        const profit = typeof sale.profit === 'number' ? sale.profit : 0;

        tableBody.push([
          saleDate,
          sale.description || 'Inconnu',
          `${achatPrice.toFixed(2)} €`,
          quantity.toString(),
          `${ventePrice.toFixed(2)} €`,
          `${profit.toFixed(2)} €`,
        ]);
      }
    });

    // Calcul des totaux - Compatible avec ventes multi-produits ET simples
    const totalQuantite = sales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        // Vente multi-produits
        return sum + sale.products.reduce((productSum, product) => {
          return productSum + (isAdvanceProduct(product.description) ? 0 : product.quantitySold);
        }, 0);
      } else {
        // Vente simple
        return sum + (isAdvanceProduct(sale.description || '') ? 0 : (typeof sale.quantitySold === 'number' ? sale.quantitySold : 0));
      }
    }, 0);
    
    const totalVente = sales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        // Vente multi-produits
        return sum + sale.products.reduce((productSum, product) => productSum + product.sellingPrice, 0);
      } else {
        // Vente simple
        return sum + (typeof sale.sellingPrice === 'number' ? sale.sellingPrice : 0);
      }
    }, 0);
    
    const totalAchat = sales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        // Vente multi-produits
        return sum + sale.products.reduce((productSum, product) => productSum + product.purchasePrice, 0);
      } else {
        // Vente simple
        const prixAchat = typeof sale.purchasePrice === 'number' ? sale.purchasePrice : 0;
        return sum + prixAchat;
      }
    }, 0);
    
    const totalProfit = sales.reduce((sum, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        // Vente multi-produits
        return sum + sale.products.reduce((productSum, product) => productSum + product.profit, 0);
      } else {
        // Vente simple
        return sum + (typeof sale.profit === 'number' ? sale.profit : 0);
      }
    }, 0);

    // Ligne de totaux premium
    tableBody.push([
      '', 
      'TOTAUX',
      `${totalAchat.toFixed(2)} €`,
      totalQuantite.toString(),
      `${totalVente.toFixed(2)} €`,
      `${totalProfit.toFixed(2)} €`,
    ]);

    // Tableau premium avec style moderne
    autoTable(doc, {
      startY: 50,
      head: [['Date', 'Produit', 'Prix Achat', 'Qté', 'Prix Vendu', 'Bénéfice']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235], // Bleu premium
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center',
        valign: 'middle',
        cellPadding: 8,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 6,
        halign: 'center',
        valign: 'middle',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Gris très clair pour alternance
      },
      styles: {
        lineColor: [203, 213, 225], // Bordures grises élégantes
        lineWidth: 0.5,
        font: 'helvetica',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 }, // Date
        1: { halign: 'left', cellWidth: 50 },   // Produit
        2: { halign: 'right', cellWidth: 25 },  // Prix Achat
        3: { halign: 'center', cellWidth: 20 }, // Quantité
        4: { halign: 'right', cellWidth: 25 },  // Prix Vendu
        5: { halign: 'right', cellWidth: 25 },  // Bénéfice
      },
      didParseCell: (data) => {
        // Styling spécial pour la ligne de totaux
        if (data.row.index === tableBody.length - 1) {
          data.cell.styles.fillColor = [220, 252, 231]; // Vert très clair
          data.cell.styles.textColor = [22, 101, 52];   // Vert foncé
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 8;
        }
      },
      margin: { top: 50, left: 20, right: 20 },
    });

    // Footer premium avec informations additionnelles
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, finalY, { align: 'center' });
    
    // Ligne de séparation footer
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(20, finalY + 5, 190, finalY + 5);
    
    doc.setFontSize(8);
    doc.text('Rapport confidentiel - Usage interne uniquement', 105, finalY + 12, { align: 'center' });

    doc.save(`rapport_ventes_premium_${monthNames[month]}_${year}.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 border-0 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <FileText className="h-8 w-8 text-white" />
            </motion.div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isConfirming ? 'Confirmation d\'exportation' : 'Exportation Premium'}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Génération de rapport PDF professionnel
            </p>
          </DialogHeader>
          
          <AnimatePresence mode="wait">
            {!isConfirming ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 py-4"
              >
                <div className="grid grid-cols-2 gap-6">
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Label htmlFor="month" className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Mois
                    </Label>
                    <Select 
                      value={selectedMonth.toString()} 
                      onValueChange={(value) => setSelectedMonth(Number(value))}
                    >
                      <SelectTrigger 
                        id="month" 
                        className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <SelectValue placeholder="Sélectionner le mois" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-0 shadow-xl">
                        {monthNames.map((month, index) => (
                          <SelectItem 
                            key={month} 
                            value={index.toString()}
                            className="rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                          >
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="year" className="text-sm font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      Année
                    </Label>
                    <Select 
                      value={selectedYear.toString()} 
                      onValueChange={(value) => setSelectedYear(Number(value))}
                    >
                      <SelectTrigger 
                        id="year" 
                        className="w-full h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <SelectValue placeholder="Sélectionner l'année" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-0 shadow-xl">
                        {years.map((year) => (
                          <SelectItem 
                            key={year} 
                            value={year.toString()}
                            className="rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                          >
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>

                <motion.div 
                  className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200/50"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Format PDF Premium
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Tableau professionnel avec en-tête personnalisé et totaux mis en évidence
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                <DialogFooter className="pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleClose}
                    className="rounded-xl border-2 hover:bg-gray-50"
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleProceed} 
                    className="ml-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Continuer
                  </Button>
                </DialogFooter>
              </motion.div>
            ) : (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="py-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Download className="h-10 w-10 text-white" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Exporter les ventes de{' '}
                    <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {monthNames[selectedMonth]} {selectedYear}
                    </span>
                  </p>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200/50">
                    <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Génération d'un rapport PDF professionnel avec analyse détaillée
                    </p>
                  </div>
                </motion.div>
                
                <DialogFooter className="pt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsConfirming(false)}
                    className="rounded-xl border-2 hover:bg-gray-50"
                  >
                    Retour
                  </Button>
                  <Button 
                    onClick={handleExport} 
                    disabled={isLoading}
                    className="ml-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Génération...
                      </motion.div>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Générer le PDF
                      </span>
                    )}
                  </Button>
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportSalesDialog;
