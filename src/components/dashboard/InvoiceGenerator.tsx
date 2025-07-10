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
  // Utiliser allSales au lieu de sales pour avoir TOUTES les ventes historiques
  const { allSales } = useApp();
  const { toast } = useToast();
  const { formatEuro } = useCurrencyFormatter();
  
  // Commencer avec 2025 puisque c'est l'année de vos données
  const [searchYear, setSearchYear] = useState('2025');
  const [searchName, setSearchName] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);

  // Debug: afficher toutes les ventes historiques et leurs dates
  console.log('=== DEBUG FACTURES (TOUTES LES VENTES HISTORIQUES) ===');
  console.log('Toutes les ventes historiques dans AppContext:', allSales.map(sale => ({
    id: sale.id,
    date: sale.date,
    client: sale.clientName,
    description: sale.description
  })));

  // Filtrer les ventes par année complète (du 1er janvier au 31 décembre de l'année sélectionnée)
  const filteredSalesByYear = allSales.filter(sale => {
    const saleDate = new Date(sale.date);
    const saleYear = saleDate.getFullYear();
    const selectedYear = parseInt(searchYear);
    
    console.log(`Vente ID ${sale.id}: date=${sale.date}, année extraite=${saleYear}, année recherchée=${selectedYear}, client=${sale.clientName}`);
    
    // Vérifier que la vente est dans l'année sélectionnée
    return saleYear === selectedYear;
  });

  console.log(`Total ventes historiques: ${allSales.length}, Ventes pour ${searchYear}: ${filteredSalesByYear.length}`);
  console.log('Ventes filtrées par année:', filteredSalesByYear.map(sale => ({
    id: sale.id,
    date: sale.date,
    client: sale.clientName
  })));

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
    const pageHeight = doc.internal.pageSize.height;
    
    // Couleurs modernes inspirées de la photo
    const primaryBlue = [51, 153, 204]; // Bleu cyan moderne
    const lightGray = [248, 249, 250]; // Gris très clair
    const darkGray = [52, 58, 64]; // Gris foncé pour le texte
    const accentColor = [255, 193, 7]; // Jaune/doré pour les accents
    
    // En-tête avec style moderne - Fond coloré en haut
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Titre de l'entreprise - Style moderne
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('Riziky Beauté', 20, 25);
    
    // Sous-titre élégant
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Votre partenaire beauté à La Réunion', 20, 35);
    
    // Informations de contact dans l'en-tête
    doc.setFontSize(10);
    doc.text('10 Allée des Beryls Bleus', 20, 45);
    
    // FACTURE en gros sur la droite
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', pageWidth - 85, 35);
    
    // Informations de l'entreprise - Section gauche
    const companyInfoY = 65;
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Riziky Beauté', 20, companyInfoY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('10 Allée des Beryls Bleus', 20, companyInfoY + 8);
    doc.text('97400 Saint-Denis, La Réunion', 20, companyInfoY + 16);
    doc.text('Tél: 0692 19 87 01', 20, companyInfoY + 24);
    
    // Informations de facturation - Section droite
    const invoiceInfoY = companyInfoY;
    const rightX = pageWidth - 80;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Facture n°', rightX, invoiceInfoY);
    doc.setFont('helvetica', 'normal');
    doc.text(`2024-${sale.id.toString().padStart(3, '0')}`, rightX, invoiceInfoY + 8);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', rightX, invoiceInfoY + 20);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(sale.date).toLocaleDateString('fr-FR'), rightX, invoiceInfoY + 28);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Échéance:', rightX, invoiceInfoY + 40);
    doc.setFont('helvetica', 'normal');
    const echeanceDate = new Date(sale.date);
    echeanceDate.setDate(echeanceDate.getDate() + 30);
    doc.text(echeanceDate.toLocaleDateString('fr-FR'), rightX, invoiceInfoY + 48);
    
    // Section client avec bordure moderne
    const clientY = 125;
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
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(sale.clientName, 25, clientY + 22);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (sale.clientAddress) {
      doc.text(sale.clientAddress, 25, clientY + 30);
    }
    if (sale.clientPhone) {
      doc.text(`Tél: ${sale.clientPhone}`, 120, clientY + 30);
    }
    
    // Tableau des produits - Style moderne
    const tableY = 180;
    
    // En-tête du tableau avec gradient simulé
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(20, tableY, pageWidth - 40, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 25, tableY + 8);
    doc.text('QTÉ', 110, tableY + 8);
    doc.text('PRIX UNIT.', 130, tableY + 8);
    doc.text('MONTANT EUR', 160, tableY + 8);
    
    // Ligne de produit
    const rowY = tableY + 12;
    doc.setFillColor(255, 255, 255);
    doc.rect(20, rowY, pageWidth - 40, 15, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.rect(20, rowY, pageWidth - 40, 15, 'S');
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(sale.description, 25, rowY + 9);
    doc.text(sale.quantitySold.toString(), 115, rowY + 9);
    
    const unitPrice = sale.quantitySold > 0 ? sale.sellingPrice / sale.quantitySold : sale.sellingPrice;
    doc.text(formatEuro(unitPrice), 135, rowY + 9);
    doc.text(formatEuro(sale.sellingPrice), 165, rowY + 9);
    
    // Section totaux - Style moderne
    const totalsY = rowY + 35;
    const totalsX = pageWidth - 100;
    
    // Sous-total
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sous-total HT:', totalsX - 30, totalsY);
    doc.text(formatEuro(sale.sellingPrice), totalsX + 15, totalsY);
    
    // Ligne de séparation
    doc.setDrawColor(220, 220, 220);
    doc.line(totalsX - 30, totalsY + 3, totalsX + 35, totalsY + 3);
    
    // TVA (si applicable)
    doc.text('TVA (0%):', totalsX - 30, totalsY + 10);
    doc.text('0,00 €', totalsX + 15, totalsY + 10);
    
    // Total TTC - Mis en évidence
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(totalsX - 35, totalsY + 15, 75, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total TTC:', totalsX - 30, totalsY + 23);
    doc.text(formatEuro(sale.sellingPrice), totalsX + 15, totalsY + 23);
    
    // Informations de paiement
    const paymentY = totalsY + 45;
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations de paiement:', 20, paymentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Paiement à réception de facture', 20, paymentY + 8);
    doc.text('Modes de paiement acceptés: Espèces, Virement, Carte bancaire', 20, paymentY + 16);
    
    // Pied de page élégant
    const footerY = pageHeight - 40;
    doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setLineWidth(1);
    doc.line(20, footerY, pageWidth - 20, footerY);
    
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Merci de votre confiance !', pageWidth / 2, footerY + 10, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Riziky Beauté - Votre partenaire beauté à La Réunion', pageWidth / 2, footerY + 20, { align: 'center' });
    doc.text('TVA non applicable - Article 293B du CGI', pageWidth / 2, footerY + 28, { align: 'center' });
    
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
                    onChange={(e) => {
                      setSearchYear(e.target.value);
                      setSearchName(''); // Reset search name when year changes
                    }}
                    className="w-32 border-blue-300 focus:border-blue-500"
                  />
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {filteredSalesByYear.length} vente{filteredSalesByYear.length !== 1 ? 's' : ''} trouvée{filteredSalesByYear.length !== 1 ? 's' : ''} pour {searchYear}
                  </Badge>
                </div>
                
                {/* Debug info étendu */}
                {/*<div className="mt-2 text-xs text-gray-500">
                  <p>Debug: Total ventes historiques = {allSales.length}</p>
                  <p>Années disponibles: {[...new Set(allSales.map(sale => new Date(sale.date).getFullYear()))].sort().join(', ')}</p>
                  <p>Mois disponibles pour {searchYear}: {[...new Set(
                    allSales
                      .filter(sale => new Date(sale.date).getFullYear() === parseInt(searchYear))
                      .map(sale => new Date(sale.date).getMonth() + 1)
                  )].sort().join(', ')}</p>
                  <p>Dates complètes pour {searchYear}: {
                    allSales
                      .filter(sale => new Date(sale.date).getFullYear() === parseInt(searchYear))
                      .map(sale => sale.date)
                      .sort()
                      .join(', ')
                  }</p>
                </div>*/}
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
                    Ventes de {searchName} en {searchYear}
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
