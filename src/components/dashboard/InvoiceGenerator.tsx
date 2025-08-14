
// Résumé :
// Ce composant React affiche une interface moderne pour générer des factures PDF à partir des ventes historiques.
// Il permet de filtrer les ventes par année et par nom de client, d'afficher les détails d'une vente sélectionnée,
// puis de générer une facture esthétique au format PDF, avec une gestion optimisée des produits sur plusieurs pages.
// Le pied de page est maintenant organisé en deux colonnes :
// - À gauche : Informations de paiement
// - À droite : Message de remerciement et mentions légales

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
import { Sale, SaleProduct } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  FileText, Search, Calendar, User, MapPin,
  Phone, CreditCard, Download, Eye, Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

  const filteredSalesByYear = allSales.filter(
    sale => new Date(sale.date).getFullYear().toString() === searchYear
  );

  const filteredSalesByName = searchName.length >= 3
    ? filteredSalesByYear.filter(sale =>
        sale.clientName?.toLowerCase().includes(searchName.toLowerCase())
      )
    : [];

  const handleSaleSelect = (sale: Sale) => {
    setSelectedSale(sale);
    setShowSaleDetails(true);
  };

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

    // Couleurs définies comme des tuples [r, g, b]
    const primaryViolet: [number, number, number] = [153, 51, 204];
    const primaryBlue: [number, number, number] = [51, 153, 204];
    const lightGray: [number, number, number] = [248, 249, 250];
    const darkGray: [number, number, number] = [52, 58, 64];

    // === EN-TÊTE ===
    doc.setFillColor(...primaryViolet);
    doc.rect(0, 0, pageWidth, 50, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28).setFont('helvetica', 'bold');
    doc.text('Riziky Beauté', 20, 25);

    doc.setFontSize(12).setFont('helvetica', 'normal');
    doc.text('Votre partenaire beauté à La Réunion', 20, 35);
    doc.text('10 Allée des Beryls Bleus, 97400 Saint-Denis', 20, 45);

    doc.setTextColor(255, 0, 0).setFontSize(36).setFont('helvetica', 'bold');
    doc.text('FACTURE', pageWidth - 85, 35);

    // === INFOS ENTREPRISE / FACTURE ===
    const leftX = 20;
    const rightX = pageWidth - 80;
    const infoY = 65;
    const date = new Date(sale.date);
    const invoiceNumber = `${date.getFullYear()}-${sale.id.toString().padStart(3, '0')}`;
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 30);

    doc.setFontSize(11).setTextColor(...darkGray).setFont('helvetica', 'bold');
    doc.text('Riziky Beauté', leftX, infoY);
    doc.setFont('helvetica', 'normal').setFontSize(10);
    doc.text('10 Allée des Beryls Bleus', leftX, infoY + 8);
    doc.text('97400 Saint-Denis, La Réunion', leftX, infoY + 16);
    doc.text('Tél: 0692 19 87 01', leftX, infoY + 24);
    doc.text('SIRET : 123 456 789 00010', leftX, infoY + 32);

    doc.setFont('helvetica', 'bold');
    doc.text('Facture n°', rightX, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceNumber, rightX, infoY + 8);

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
    doc.setFillColor(...lightGray).rect(20, clientY, pageWidth - 40, 35, 'F');
    doc.setDrawColor(...primaryBlue).setLineWidth(0.5);
    doc.rect(20, clientY, pageWidth - 40, 35, 'S');

    doc.setTextColor(...primaryBlue).setFontSize(12).setFont('helvetica', 'bold');
    doc.text('Expédier à:', 25, clientY + 12);

    doc.setTextColor(...darkGray).setFontSize(11).setFont('helvetica', 'bold');
    doc.text(sale.clientName || '', 25, clientY + 22);

    doc.setFont('helvetica', 'normal').setFontSize(10);
    if (sale.clientAddress) doc.text(sale.clientAddress, 25, clientY + 30);
    if (sale.clientPhone) doc.text(`Tél: ${sale.clientPhone}`, 120, clientY + 30);

    // === PRODUITS ===
    const products: SaleProduct[] =
      sale.products && sale.products.length > 0
        ? sale.products
        : [{
            description: sale.description || '',
            quantitySold: sale.quantitySold || 0,
            sellingPrice: sale.sellingPrice || 0
          } as SaleProduct];

    const tableData = products.map(prod => [
      prod.description || '',
      (prod.quantitySold || 0).toString(),
      formatEuro(prod.quantitySold ? (prod.sellingPrice || 0) / prod.quantitySold : 0),
      formatEuro(prod.sellingPrice || 0)
    ]);

    autoTable(doc, {
      startY: 170,
      head: [['DESCRIPTION', 'QTÉ', 'PRIX UNIT.', 'MONTANT EUR']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: primaryBlue, textColor: 255, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { textColor: darkGray, fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { overflow: 'linebreak', cellWidth: 'wrap', halign: 'center' },
      columnStyles: {
        0: { halign: 'left', cellWidth: 80 }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Calcul du total correctement typé
    const totalAmount = products.reduce((sum: number, product: SaleProduct) => sum + (product.sellingPrice || 0), 0);

    // === TOTAUX ===
    const totalsX = pageWidth - 100;
    doc.setFontSize(10).setTextColor(...darkGray);
    doc.text('Sous-total HT:', totalsX - 30, finalY);
    doc.text(formatEuro(totalAmount), totalsX + 15, finalY);
    doc.text('TVA (0%):', totalsX - 30, finalY + 10);
    doc.text('0,00 €', totalsX + 15, finalY + 10);

    doc.setFillColor(...primaryBlue).rect(totalsX - 35, finalY + 15, 75, 12, 'F');
    doc.setTextColor(255, 0, 0).setFontSize(12).setFont('helvetica', 'bold');
    doc.text('Total TTC:', totalsX - 30, finalY + 23);
    doc.text(formatEuro(totalAmount), totalsX + 15, finalY + 23);

    // === PIED DE PAGE EN 2 COLONNES ===
    const footerStartY = pageHeight - 40;
    doc.setDrawColor(...primaryBlue).setLineWidth(1);
    doc.line(20, footerStartY, pageWidth - 20, footerStartY);

    // Colonne gauche
    doc.setTextColor(...darkGray).setFont('helvetica', 'bold').setFontSize(10);
    doc.text('Informations de paiement :', 20, footerStartY + 10);

    doc.setFont('helvetica', 'normal').setFontSize(9);
    doc.text(`Date de paiement : ${date.toLocaleDateString('fr-FR')}`, 20, footerStartY + 18);
    doc.text('Mode de paiement : Espèces', 20, footerStartY + 26);
    doc.text('Paiement à réception de facture', 20, footerStartY + 34);

    // Colonne droite
    doc.setFont('helvetica', 'bold').setTextColor(...primaryBlue).setFontSize(10);
    doc.text('Merci de votre confiance !', pageWidth - 20, footerStartY + 10, { align: 'right' });

    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(120, 120, 120);
    doc.text('Riziky Beauté - Votre partenaire beauté à La Réunion', pageWidth - 20, footerStartY + 18, { align: 'right' });
    doc.text('TVA non applicable - Article 293B du CGI', pageWidth - 20, footerStartY + 26, { align: 'right' });

    doc.save(`Facture_${sale.clientName?.replace(/\s+/g, '_')}_${sale.id}.pdf`);
    toast({
      title: 'Facture générée',
      description: `La facture pour ${sale.clientName} a été générée avec succès.`,
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

      <ScrollArea className="h-[calc(90vh-100px)] px-6 pb-6">
        <div className="space-y-6">
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
                                  ? sale.products.reduce((sum: number, p) => sum + (p.quantitySold || 0), 0)
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

      <ScrollArea className="h-[calc(90vh-100px)] px-6 pb-6">
        {selectedSale && (
          <div className="space-y-6">
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
                        ? selectedSale.products.reduce((sum: number, p) => sum + (p.quantitySold || 0), 0)
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
