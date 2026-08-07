/**
 * sessionsHistoryPdf.ts — Génération du PDF de l'historique des
 * connexions / déconnexions (usage interne entreprise).
 *
 * Le document est marqué "usage interne" et comporte un bloc de
 * signature de la direction. Il est directement téléchargé (.pdf).
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface SessionPdfRow {
  date: string;
  heure: string;
  evenement: string;
  profil: string;
  role: string;
  ip: string;
  navigateur: string;
  os: string;
  appareil: string;
}

const fmtNow = () =>
  new Date().toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const exportSessionsHistoryPdf = (
  periodeLabel: string,
  rows: SessionPdfRow[],
  entreprise = 'Direction'
) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // En-tête
  doc.setFillColor(14, 116, 200);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('Historique des connexions et déconnexions', 12, 10);
  doc.setFontSize(9);
  doc.text(`${periodeLabel} — édité le ${fmtNow()}`, 12, 17);

  doc.setTextColor(180, 0, 0);
  doc.setFontSize(8);
  doc.text('DOCUMENT INTERNE — NE PAS PARTAGER', pageWidth - 12, 12, { align: 'right' });

  autoTable(doc, {
    startY: 28,
    head: [['Date', 'Heure', 'Événement', 'Profil', 'Rôle', 'IP', 'Navigateur', 'OS', 'Appareil']],
    body: rows.map((r) => [
      r.date, r.heure, r.evenement, r.profil, r.role, r.ip, r.navigateur, r.os, r.appareil,
    ]),
    styles: { fontSize: 8, cellPadding: 1.8 },
    headStyles: { fillColor: [14, 116, 200], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    theme: 'grid',
  });

  // Pied de page : mention + signature
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 40;
  let y = finalY + 12;
  if (y > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    y = 25;
  }

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(8);
  doc.text(
    "Données à usage strictement interne à l'entreprise. Toute diffusion, copie ou partage hors de l'entreprise est interdit.",
    12, y
  );
  doc.text(`Total des évènements : ${rows.length}`, 12, y + 5);

  doc.setFontSize(9);
  doc.text('Signature de la direction :', pageWidth - 90, y + 12);
  doc.line(pageWidth - 90, y + 24, pageWidth - 12, y + 24);
  doc.setFontSize(8);
  doc.text(entreprise, pageWidth - 90, y + 29);

  const slug = periodeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  doc.save(`historique-connexions-${slug}-${new Date().toISOString().slice(0, 10)}.pdf`);
};

export default exportSessionsHistoryPdf;
