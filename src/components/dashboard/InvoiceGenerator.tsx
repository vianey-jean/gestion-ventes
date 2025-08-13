// Résumé :
// Ce composant React affiche une interface moderne pour générer des factures PDF à partir des ventes historiques.
// Il permet de filtrer les ventes par année et par nom de client, d'afficher les détails d'une vente sélectionnée,
// puis de générer une facture esthétique au format PDF en un clic.

import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Sale } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  FileText, Search, Calendar, User, MapPin,
  Phone, CreditCard, Download, Eye, Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';

interface InvoiceGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ isOpen, onClose }) => {
  const { allSales } = useApp();
  const { toast } = useToast();
  const { formatEuro } = useCurrencyFormatter();

  const [searchYear, setSearchYear] = useState('2025');
  const [searchName, setSearchName] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);

  // === FILTRAGE DES VENTES ===

  const filteredSalesByYear = allSales.filter(sale =>
    new Date(sale.date).getFullYear().toString() === searchYear
  );

  const filteredSalesByName = searchName.length >= 3
    ? filteredSalesByYear.filter(sale =>
        sale.clientName?.toLowerCase().includes(searchName.toLowerCase())
      )
    : [];

  // === SÉLECTION D'UNE VENTE ===

  const handleSaleSelect = (sale: Sale) => {
    setSelectedSale(sale);
    setShowSaleDetails(true);
  };

// === GÉNÉRATION DE LA FACTURE PDF ===
const generateInvoicePDF = (sale: Sale) => {
  if (!sale.clientName) {
    toast({
      title: 'Erreur',
      description: 'Nom du client manquant.',
      variant: 'destructive',
    });
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  const primaryViolet = [153, 51, 204];
  const primaryBlue = [51, 153, 204];
  const lightGray = [248, 249, 250];
  const darkGray = [52, 58, 64];

  // === EN-TÊTE ===
  doc.setFillColor(primaryViolet[0], primaryViolet[1], primaryViolet[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Riziky Beauté', 20, 25);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Votre partenaire beauté à La Réunion', 20, 35);
  doc.text('10 Allée des Beryls Bleus, 97400 Saint-Denis', 20, 45);

  doc.setTextColor(255, 0, 0);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', pageWidth - 85, 35);

  // === INFOS ENTREPRISE & FACTURE ===
  const leftX = 20;
  const rightX = pageWidth - 80;
  const infoY = 65;

  const date = new Date(sale.date);
  const invoiceNumber = `${date.getFullYear()}-${sale.id.toString().padStart(3, '0')}`;
  const dueDate = new Date(date);
  dueDate.setDate(dueDate.getDate() + 30);

  doc.setFontSize(11);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Riziky Beauté', leftX, infoY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('10 Allée des Beryls Bleus', leftX, infoY + 8);
  doc.text('97400 Saint-Denis, La Réunion', leftX, infoY + 16);
  doc.text('Tél: 0692 19 87 01', leftX, infoY + 24);
  doc.text('SIRET : 123 456 789 00010', leftX, infoY + 32);

  doc.setFont('helvetica', 'bold');
  doc.text('Facture n°', rightX, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceNumber || '', rightX, infoY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('Date :', rightX, infoY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(date.toLocaleDateString('fr-FR'), rightX + 25, infoY + 20);

  doc.setFont('helvetica', 'bold');
  doc.text('Échéance :', rightX, infoY + 30);
  doc.setFont('helvetica', 'normal');
  doc.text(dueDate.toLocaleDateString('fr-FR'), rightX + 25, infoY + 30);

  // === INFOS CLIENT ===
  const clientY = 120;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(20, clientY, pageWidth - 40, 35, 'F');
  doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setLineWidth(0.5);
  doc.rect(20, clientY, pageWidth - 40, 35, 'S');

  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Expédier à:', 25, clientY + 12);

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(sale.clientName || '', 25, clientY + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (sale.clientAddress) doc.text(sale.clientAddress, 25, clientY + 30);
  if (sale.clientPhone) doc.text(`Tél: ${sale.clientPhone}`, 120, clientY + 30);

  // === PRODUITS ===
  const tableY = 170;
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(20, tableY, pageWidth - 40, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DESCRIPTION', 25, tableY + 8);
  doc.text('QTÉ', 110, tableY + 8);
  doc.text('PRIX UNIT.', 130, tableY + 8);
  doc.text('MONTANT EUR', 160, tableY + 8);

  // Gestion des produits multiples ou simple
  const products = sale.products && sale.products.length > 0 
    ? sale.products 
    : [{
        productId: sale.productId || '',
        description: sale.description || '',
        quantitySold: sale.quantitySold || 0,
        purchasePrice: sale.purchasePrice || 0,
        sellingPrice: sale.sellingPrice || 0,
        profit: sale.profit || 0
      }];

  let currentRowY = tableY + 12;
  const rowHeight = 12;
  let totalAmount = 0;

  products.forEach((product, index) => {
    // Vérification des valeurs pour éviter NaN
    const quantity = typeof product.quantitySold === 'number' ? product.quantitySold : 0;
    const sellingPrice = typeof product.sellingPrice === 'number' ? product.sellingPrice : 0;
    const unitPrice = quantity > 0 ? sellingPrice / quantity : sellingPrice;
    
    // Ligne de produit
    doc.setFillColor(255, 255, 255);
    doc.rect(20, currentRowY, pageWidth - 40, rowHeight, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(20, currentRowY, pageWidth - 40, rowHeight, 'S');

    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    // Description avec retour à la ligne si trop longue
    const description = product.description || '';
    const maxDescriptionWidth = 80;
    const lines = doc.splitTextToSize(description, maxDescriptionWidth);
    
    if (lines.length > 1) {
      lines.forEach((line: string, lineIndex: number) => {
        doc.text(line, 25, currentRowY + 8 + (lineIndex * 4));
      });
      // Ajuster la hauteur de la ligne si nécessaire
      if (lines.length > 2) {
        currentRowY += (lines.length - 2) * 4;
      }
    } else {
      doc.text(description, 25, currentRowY + 8);
    }
    
    // Quantité, prix unitaire et montant
    doc.text(quantity.toString(), 115, currentRowY + 8);
    doc.text(formatEuro(unitPrice), 135, currentRowY + 8);
    doc.text(formatEuro(sellingPrice), 165, currentRowY + 8);
    
    totalAmount += sellingPrice;
    currentRowY += rowHeight;
  });

  // === TOTAUX + TVA + PAIEMENT ===
  const totalsY = currentRowY + 20;
  const totalsX = pageWidth - 100;

  doc.setFontSize(10);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Sous-total HT:', totalsX - 30, totalsY);
  doc.text(formatEuro(totalAmount), totalsX + 15, totalsY);
  doc.line(totalsX - 30, totalsY + 3, totalsX + 35, totalsY + 3);

  doc.text('TVA (0%):', totalsX - 30, totalsY + 10);
  doc.text('0,00 €', totalsX + 15, totalsY + 10);

  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(totalsX - 35, totalsY + 15, 75, 12, 'F');
  doc.setTextColor(255, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total TTC:', totalsX - 30, totalsY + 23);
  doc.text(formatEuro(totalAmount), totalsX + 15, totalsY + 23);

// === INFOS DE PAIEMENT ===
const paymentY = totalsY + 45;
doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.text('Informations de paiement:', 20, paymentY);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.text(`Date de paiement : ${date.toLocaleDateString('fr-FR')}`, 20, paymentY + 8);
doc.text('Mode de paiement : Espèces', 20, paymentY + 16);
doc.text('Paiement à réception de facture', 20, paymentY + 24);

// === PIED DE PAGE ===
// Ajouter un espace après les infos de paiement (+10)
const footerY = pageHeight - 40; // Vous pouvez laisser comme avant
doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
doc.setLineWidth(1);
doc.line(20, footerY, pageWidth - 20, footerY);


  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setFontSize(10);
  doc.text('Merci de votre confiance !', pageWidth / 2, footerY + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Riziky Beauté - Votre partenaire beauté à La Réunion', pageWidth / 2, footerY + 20, { align: 'center' });
  doc.text('TVA non applicable - Article 293B du CGI', pageWidth / 2, footerY + 28, { align: 'center' });

  // === SAUVEGARDE ===
  const fileName = `Facture_${sale.clientName?.replace(/\s+/g, '_')}_${sale.id}.pdf`;
  doc.save(fileName);

  toast({
    title: 'Facture générée',
    description: `La facture pour ${sale.clientName} a été générée avec succès.`,
    variant: 'default',
  });
};


  return (
   <>
  {/* Dialogue principal */}
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0">
      <DialogHeader className="text-center pb-6 pt-6 px-6">
        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          Générateur de Factures Premium
        </DialogTitle>
      </DialogHeader>

      {/* Zone scrollable */}
      <ScrollArea className="h-[calc(90vh-100px)] px-6 pb-6">
        <div className="space-y-6">
          {/* Recherche par année */}
          <Card className="border-2 border-gradient-to-r from-blue-200 to-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                <Calendar className="h-5 w-5" />
                Sélectionner l'année
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Label htmlFor="searchYear" className="font-medium">Année :</Label>
                <Input
                  id="searchYear"
                  type="number"
                  min="2020"
                  max="2030"
                  value={searchYear}
                  onChange={(e) => {
                    setSearchYear(e.target.value);
                    setSearchName('');
                  }}
                  className="w-32 border-blue-300 focus:border-blue-500"
                />
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {filteredSalesByYear.length} vente{filteredSalesByYear.length !== 1 ? 's' : ''} trouvée{filteredSalesByYear.length !== 1 ? 's' : ''} pour {searchYear}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recherche par nom client */}
          <Card className="border-2 border-gradient-to-r from-emerald-200 to-teal-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                <Search className="h-5 w-5" />
                Rechercher un client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Label htmlFor="searchName" className="font-medium">Nom du client :</Label>
                <Input
                  id="searchName"
                  placeholder="Saisir au moins 3 caractères..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="flex-1 border-emerald-300 focus:border-emerald-500"
                />
                {searchName.length >= 3 && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    {filteredSalesByName.length} résultat{filteredSalesByName.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Liste des ventes filtrées */}
          {searchName.length >= 3 && (
            <Card className="border-2 border-gradient-to-r from-purple-200 to-pink-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
                  <User className="h-5 w-5" />
                  Ventes de : {searchName} en {searchYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full">
                  <div className="space-y-3">
                    {filteredSalesByName.map((sale) => (
                      <Card
                        key={sale.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500 hover:border-l-pink-500"
                        onClick={() => handleSaleSelect(sale)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-purple-500" />
                                <span className="font-semibold text-purple-700">{sale.clientName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                {new Date(sale.date).toLocaleDateString('fr-FR')}
                              </div>
                              <div className="text-sm font-medium text-gray-700">
                                {sale.products && sale.products.length > 0
                                  ? `${sale.products.length} produit${sale.products.length > 1 ? 's' : ''}`
                                  : sale.description}
                              </div>
                              {sale.clientPhone && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Phone className="h-4 w-4" />
                                  {sale.clientPhone}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-emerald-600">
                                {sale.products && sale.products.length > 0
                                  ? formatEuro(sale.totalSellingPrice || 0)
                                  : formatEuro(sale.sellingPrice || 0)}
                              </div>
                              <div className="text-sm text-gray-500">
                                Qté: {sale.products && sale.products.length > 0
                                  ? sale.products.reduce((sum, p) => sum + (p.quantitySold || 0), 0)
                                  : (sale.quantitySold || 0)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filteredSalesByName.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune vente trouvée pour "{searchName}" en {searchYear}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>

  {/* Dialogue des détails de la vente */}
  <Dialog open={showSaleDetails} onOpenChange={setShowSaleDetails}>
    <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0">
      <DialogHeader className="text-center pb-6 pt-6 px-6">
        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <Eye className="h-5 w-5 text-white" />
          </div>
          Détails de la Vente
        </DialogTitle>
      </DialogHeader>

      {/* Scroll pour le contenu des détails */}
      <ScrollArea className="h-[calc(90vh-100px)] px-6 pb-6">
        {selectedSale && (
          <div className="space-y-6">
            {/* Informations client */}
            <Card className="border-2 border-gradient-to-r from-blue-200 to-indigo-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                  <User className="h-5 w-5" />
                  Informations Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold">{selectedSale.clientName}</span>
                </div>
                {selectedSale.clientAddress && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>{selectedSale.clientAddress}</span>
                  </div>
                )}
                {selectedSale.clientPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <span>{selectedSale.clientPhone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Détails du produit */}
            <Card className="border-2 border-gradient-to-r from-emerald-200 to-teal-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                  <CreditCard className="h-5 w-5" />
                  Détails de la Vente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date</Label>
                    <div className="text-lg font-semibold">{new Date(selectedSale.date).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Quantité Total</Label>
                    <div className="text-lg font-semibold">
                      {selectedSale.products && selectedSale.products.length > 0
                        ? selectedSale.products.reduce((sum, p) => sum + (p.quantitySold || 0), 0)
                        : (selectedSale.quantitySold || 0)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    {selectedSale.products && selectedSale.products.length > 0 ? 'Produits' : 'Produit'}
                  </Label>
                  {selectedSale.products && selectedSale.products.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSale.products.map((product, index) => (
                        <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                          <div className="font-medium">{product.description}</div>
                          <div className="text-gray-600">Qté: {product.quantitySold} - {formatEuro(product.sellingPrice || 0)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-lg font-semibold">{selectedSale.description}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Prix Total</Label>
                    <div className="text-xl font-bold text-emerald-600">
                      {selectedSale.products && selectedSale.products.length > 0
                        ? formatEuro(selectedSale.totalSellingPrice || 0)
                        : formatEuro(selectedSale.sellingPrice || 0)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Bénéfice</Label>
                    <div className="text-xl font-bold text-purple-600">
                      {selectedSale.products && selectedSale.products.length > 0
                        ? formatEuro(selectedSale.totalProfit || 0)
                        : formatEuro(selectedSale.profit || 0)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bouton de génération */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => generateInvoicePDF(selectedSale)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-white/20 rounded-lg">
                    <Download className="h-5 w-5" />
                  </div>
                  <span>Générer Facture Premium</span>
                  <Sparkles className="h-4 w-4" />
                </div>
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>
    </DialogContent>
  </Dialog>
</>

  );
};

export default InvoiceGenerator;
