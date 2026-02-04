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
  Phone, Download, Eye, Sparkles, Crown
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';

/* =========================
   SIGNATURE DE MARQUE
========================= */
const BrandLogo = () => (
  <div className="flex items-center gap-3">
    <div className="
      w-10 h-10 rounded-2xl
      bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600
      shadow-lg shadow-purple-500/30
      flex items-center justify-center
    ">
      <Crown className="h-5 w-5 text-white" />
    </div>
    <span className="font-black tracking-wide text-lg">
      Riziky Beauté
    </span>
  </div>
);

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

  /* =========================
     LOGIQUE STRICTEMENT IDENTIQUE
  ========================= */
  const filteredSalesByYear = allSales.filter(
    sale => new Date(sale.date).getFullYear().toString() === searchYear
  );

  const filteredSalesByName =
    searchName.length >= 3
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

    /* 🔒 PDF : AUCUN CHANGEMENT */
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

    // *** MODIFICATION DEMANDÉE ***
    const dueDate = new Date(date);
    dueDate.setFullYear(dueDate.getFullYear() + 1);
    dueDate.setDate(dueDate.getDate() - 1);
    // ******************************

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
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 128, 0); // vert
    doc.text(dueDate.toLocaleDateString('fr-FR'), rightX + 25, infoY + 30);
    

    // === INFOS CLIENT ===
    const clientY = 120;
    doc.setFillColor(...lightGray).rect(20, clientY, pageWidth - 40, 35, 'F');
    doc.setDrawColor(...primaryBlue).setLineWidth(0.5);
    doc.rect(20, clientY, pageWidth - 40, 35, 'S');

    doc.setTextColor(...primaryBlue).setFontSize(12).setFont('helvetica', 'bold');
    doc.text('Expédier à :', 25, clientY + 12);

    doc.setTextColor(...darkGray).setFontSize(11).setFont('helvetica', 'bold');
    doc.text(sale.clientName || '', 25, clientY + 22);

    doc.setFont('helvetica', 'normal').setFontSize(10);
    if (sale.clientAddress) doc.text(sale.clientAddress, 25, clientY + 30);
    if (sale.clientPhone) {
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 0, 0); // rouge
  doc.text(`Tél: ${sale.clientPhone}`, 120, clientY + 30);

  // Réinitialisation des styles pour ne pas affecter la suite
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkGray);
}

    // === PRODUITS ===
    const products: SaleProduct[] =
      sale.products && sale.products.length > 0
        ? sale.products
        : [{
            description: sale.description || '',
            quantitySold: sale.quantitySold || 0,
            sellingPrice: sale.sellingPrice || 0,
            deliveryFee: sale.deliveryFee || 0
          } as SaleProduct];

    const tableData = products.map(prod => [
      prod.description || '',
      (prod.quantitySold || 0).toString(),
      formatEuro(prod.quantitySold ? (prod.sellingPrice || 0) / prod.quantitySold : 0),
      formatEuro(prod.sellingPrice || 0),
      formatEuro(prod.deliveryFee || 0)
    ]);

    autoTable(doc, {
      startY: 170,
      head: [['DESCRIPTION', 'QTÉ', 'PRIX UNIT.', 'MONTANT EUR', 'FRAIS LIVR.']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: primaryBlue, textColor: 255, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { textColor: darkGray, fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { overflow: 'linebreak', cellWidth: 'wrap', halign: 'center' },
      columnStyles: {
        0: { halign: 'left', cellWidth: 60 }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    const totalAmount = products.reduce((sum: number, product: SaleProduct) =>
      sum + (product.sellingPrice || 0), 0);
    
    const totalDeliveryFee = products.reduce((sum: number, product: SaleProduct) =>
      sum + (product.deliveryFee || 0), 0);

    // === TOTAUX ===
    const totalsX = pageWidth - 100;
    doc.setFontSize(10).setTextColor(...darkGray);
    doc.text('Sous-total HT:', totalsX - 30, finalY);
    doc.text(formatEuro(totalAmount), totalsX + 15, finalY);
    doc.text('Frais livraison:', totalsX - 30, finalY + 10);
    doc.text(formatEuro(totalDeliveryFee), totalsX + 15, finalY + 10);
    doc.text('TVA (0%):', totalsX - 30, finalY + 20);
    doc.text('0,00 €', totalsX + 15, finalY + 20);

    doc.setFillColor(...primaryBlue).rect(totalsX - 35, finalY + 25, 75, 12, 'F');
    doc.setTextColor(255, 0, 0).setFontSize(12).setFont('helvetica', 'bold');
    doc.text('Total TTC:', totalsX - 30, finalY + 33);
    doc.text(formatEuro(totalAmount + totalDeliveryFee), totalsX + 15, finalY + 33);

    // === PIED DE PAGE ===
    const footerStartY = pageHeight - 40;
    doc.setDrawColor(...primaryBlue).setLineWidth(1);
    doc.line(20, footerStartY, pageWidth - 20, footerStartY);

    doc.setTextColor(...darkGray).setFont('helvetica', 'bold').setFontSize(10);
    doc.text('Informations de paiement :', 20, footerStartY + 10);
    doc.setFont('helvetica', 'normal').setFontSize(9);
    doc.text(`Date de paiement : ${date.toLocaleDateString('fr-FR')}`, 20, footerStartY + 18);
    doc.text('Mode de paiement : Espèces', 20, footerStartY + 26);
    doc.text('Paiement à réception de facture', 20, footerStartY + 34);

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
  }
  return (
    <>
      {/* ================= MODAL PRINCIPAL ================= */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="
            sm:max-w-5xl p-0 overflow-hidden
            rounded-[28px]
            bg-gradient-to-br
              from-white via-gray-50 to-white
              dark:from-[#0B0D12] dark:via-[#111827] dark:to-[#0B0D12]
            border border-white/20 dark:border-white/10
            shadow-[0_30px_120px_-20px_rgba(0,0,0,0.6)]
            animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-500
          "
        >
          {/* ===== Header Apple / Linear ===== */}
          <DialogHeader
            className="
              px-8 py-6
              bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600
              text-white
            "
          >
            <DialogTitle className="flex items-center justify-between">
              <BrandLogo />
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span className="font-semibold tracking-wide">
                  Facturation Premium
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-120px)] px-8 py-8">
            <div className="space-y-10">

              {/* ===== Année ===== */}
              <Card className="
                rounded-3xl
                bg-white/70 dark:bg-white/5
                backdrop-blur-xl
                shadow-xl
                hover:shadow-2xl
                transition-all duration-300
              ">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                    <Calendar className="h-5 w-5" />
                    Année
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={searchYear}
                    onChange={(e) => {
                      setSearchYear(e.target.value);
                      setSearchName('');
                    }}
                    className="
                      w-32 text-center font-bold
                      rounded-xl
                      border-indigo-300 dark:border-indigo-600
                      bg-white/80 dark:bg-black/30
                    "
                  />
                  <Badge className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                    {filteredSalesByYear.length} ventes
                  </Badge>
                </CardContent>
              </Card>

              {/* ===== Recherche ===== */}
              <Card className="
                rounded-3xl
                bg-white/70 dark:bg-white/5
                backdrop-blur-xl
                shadow-xl
              ">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                    <Search className="h-5 w-5" />
                    Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Input
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Nom du client"
                    className="
                      flex-1 rounded-xl
                      bg-white/80 dark:bg-black/30
                      border-emerald-300 dark:border-emerald-600
                    "
                  />
                  {searchName.length >= 3 && (
                    <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      {filteredSalesByName.length} résultats
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* ===== Résultats ===== */}
              {searchName.length >= 3 && (
                <div className="space-y-4">
                  {filteredSalesByName.map(sale => (
                    <div
                      key={sale.id}
                      onClick={() => handleSaleSelect(sale)}
                      className="
                        group cursor-pointer
                        p-5 rounded-2xl
                        bg-white/80 dark:bg-white/5
                        backdrop-blur-xl
                        border border-transparent
                        hover:border-purple-400
                        hover:shadow-2xl
                        transition-all duration-300
                        hover:scale-[1.015]
                      "
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {sale.clientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(sale.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div className="font-black text-emerald-600 dark:text-emerald-400">
                          {formatEuro(sale.totalSellingPrice || sale.sellingPrice || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL DÉTAIL ================= */}
      <Dialog open={showSaleDetails} onOpenChange={setShowSaleDetails}>
        <DialogContent
          className="
            sm:max-w-3xl
            rounded-[28px]
            bg-gradient-to-br
              from-white to-gray-50
              dark:from-[#0B0D12] dark:to-[#111827]
            shadow-2xl
            animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-500
          "
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl font-black">
              <Eye className="h-6 w-6 text-emerald-500" />
              Détails de la vente
            </DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-6">
              <div className="text-lg font-semibold">
                {selectedSale.clientName}
              </div>

              <Button
                onClick={() => generateInvoicePDF(selectedSale)}
                className="
                  w-full py-4 rounded-2xl
                  font-black tracking-wide
                  bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600
                  hover:scale-105 hover:shadow-2xl
                  transition-all
                "
              >
                <Download className="h-5 w-5 mr-3" />
                Générer la facture PDF
                <Sparkles className="h-4 w-4 ml-3" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InvoiceGenerator;
