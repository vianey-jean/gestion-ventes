
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Sale } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { FileText, Search, Calendar, User, MapPin, Phone, CreditCard, Download, Eye, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';

interface InvoiceGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ isOpen, onClose }) => {
  const { sales } = useApp();
  const { toast } = useToast();
  const { formatEuro } = useCurrencyFormatter();
  
  const [searchYear, setSearchYear] = useState(new Date().getFullYear().toString());
  const [searchName, setSearchName] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);

  // Filtrer les ventes par année
  const filteredSalesByYear = sales.filter(sale => {
    const saleYear = new Date(sale.date).getFullYear().toString();
    return saleYear === searchYear;
  });

  // Filtrer les ventes par nom (à partir de 3 caractères)
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
        title: "Erreur",
        description: "Impossible de générer la facture : nom du client manquant",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Couleurs et styles
    const primaryColor = [220, 38, 127]; // Rose moderne
    const secondaryColor = [99, 102, 241]; // Indigo
    const accentColor = [16, 185, 129]; // Emeraude
    const textColor = [31, 41, 55]; // Gris foncé
    
    // En-tête avec gradient visuel simulé
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 35, pageWidth, 5, 'F');
    
    // Logo et titre de l'entreprise
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RIZIKY BEAUTÉ', 20, 25);
    
    // Informations de l'entreprise
    doc.setFontSize(24);
    doc.setFont('helvetica', 'normal');
    doc.text('10 Allée des Beryls Bleus', 20, 55);
    doc.text('97400 Saint-Denis, La Réunion', 20, 65);
    doc.text('Tél: 0692 19 87 01', 20, 75);
    
    // Titre FACTURE avec style moderne
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', pageWidth - 80, 60);
    
    // Numéro de facture et date
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° ${sale.id}`, pageWidth - 80, 75);
    doc.text(`Date: ${new Date(sale.date).toLocaleDateString('fr-FR')}`, pageWidth - 80, 85);
    
    // Informations client avec encadré stylé
    const clientY = 100;
    doc.setFillColor(248, 250, 252); // Fond gris très clair
    doc.rect(20, clientY, pageWidth - 40, 40, 'F');
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(1);
    doc.rect(20, clientY, pageWidth - 40, 40, 'S');
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURÉ À:', 25, clientY + 15);
    
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(sale.clientName, 25, clientY + 25);
    if (sale.clientAddress) {
      doc.text(sale.clientAddress, 25, clientY + 32);
    }
    if (sale.clientPhone) {
      doc.text(`Tél: ${sale.clientPhone}`, 25, clientY + 39);
    }
    
    // Tableau des produits avec style moderne
    const tableY = clientY + 60;
    
    // En-tête du tableau avec gradient
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(20, tableY, pageWidth - 40, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉSIGNATION', 25, tableY + 10);
    doc.text('QTÉ', 100, tableY + 10);
    doc.text('PRIX UNIT.', 125, tableY + 10);
    doc.text('TOTAL HT', 160, tableY + 10);
    
    // Ligne du produit
    const rowY = tableY + 15;
    doc.setFillColor(255, 255, 255);
    doc.rect(20, rowY, pageWidth - 40, 15, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, rowY, pageWidth - 40, 15, 'S');
    
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(sale.description, 25, rowY + 10);
    doc.text(sale.quantitySold.toString(), 100, rowY + 10);
    
    const unitPrice = sale.quantitySold > 0 ? sale.sellingPrice / sale.quantitySold : sale.sellingPrice;
    doc.text(formatEuro(unitPrice), 125, rowY + 10);
    doc.text(formatEuro(sale.sellingPrice), 160, rowY + 10);
    
    // Total avec style élégant
    const totalY = rowY + 30;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(120, totalY, pageWidth - 140, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL TTC:', 125, totalY + 12);
    doc.text(formatEuro(sale.sellingPrice), 160, totalY + 12);
    
    // Bénéfice (information interne)
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Bénéfice: ${formatEuro(sale.profit)}`, 125, totalY + 20);
    
    // Pied de page élégant
    const footerY = doc.internal.pageSize.height - 30;
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(2);
    doc.line(20, footerY, pageWidth - 20, footerY);
    
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Merci de votre confiance !', pageWidth / 2, footerY + 10, { align: 'center' });
    doc.text('Riziky Beauté - Votre partenaire beauté à La Réunion', pageWidth / 2, footerY + 20, { align: 'center' });
    
    
    // Télécharger le PDF
    const fileName = `Facture_${sale.clientName?.replace(/\s+/g, '_')}_${sale.id}.pdf`;
    doc.save(fileName);
    
    toast({
      title: "Facture générée",
      description: `La facture pour ${sale.clientName} a été générée avec succès`,
      variant: "default",
      className: "notification-success",
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader className="text-center pb-6">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              Générateur de Factures Premium
            </DialogTitle>
          </DialogHeader>
          
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
                    onChange={(e) => setSearchYear(e.target.value)}
                    className="w-32 border-blue-300 focus:border-blue-500"
                  />
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {filteredSalesByYear.length} vente{filteredSalesByYear.length !== 1 ? 's' : ''} trouvée{filteredSalesByYear.length !== 1 ? 's' : ''}
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
                    Ventes de {searchName}
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
                                <div className="text-sm font-medium text-gray-700">{sale.description}</div>
                                {sale.clientPhone && (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Phone className="h-4 w-4" />
                                    {sale.clientPhone}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-emerald-600">
                                  {formatEuro(sale.sellingPrice)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Qté: {sale.quantitySold}
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
        </DialogContent>
      </Dialog>

      {/* Dialogue des détails de la vente */}
      <Dialog open={showSaleDetails} onOpenChange={setShowSaleDetails}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="text-center pb-6">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <Eye className="h-5 w-5 text-white" />
              </div>
              Détails de la Vente
            </DialogTitle>
          </DialogHeader>
          
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
                    Détails du Produit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date</Label>
                      <div className="text-lg font-semibold">{new Date(selectedSale.date).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Quantité</Label>
                      <div className="text-lg font-semibold">{selectedSale.quantitySold}</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Produit</Label>
                    <div className="text-lg font-semibold">{selectedSale.description}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Prix Total</Label>
                      <div className="text-xl font-bold text-emerald-600">{formatEuro(selectedSale.sellingPrice)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Bénéfice</Label>
                      <div className="text-xl font-bold text-purple-600">{formatEuro(selectedSale.profit)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bouton de génération de facture */}
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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoiceGenerator;
