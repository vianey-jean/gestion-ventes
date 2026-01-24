/**
 * AchatsHistoriqueList - Liste historique des achats et dépenses
 * 
 * RÔLE :
 * Ce composant affiche la liste des achats et dépenses enregistrés
 * pour un mois donné. Chaque entrée affiche :
 * - Icône selon le type (achat produit, taxes, carburant, autre)
 * - Description du produit ou de la dépense
 * - Date et fournisseur (si applicable)
 * - Coût total et quantité
 * 
 * PROPS :
 * - achats: NouvelleAchat[] - Liste des achats/dépenses à afficher
 * - formatEuro: (value: number) => string - Fonction de formatage monétaire
 * - selectedMonth: number - Mois sélectionné (1-12)
 * - selectedYear: number - Année sélectionnée
 * - months: string[] - Tableau des noms de mois
 * 
 * DÉPENDANCES :
 * - @/components/ui/card
 * - @/components/ui/badge
 * - @/types/comptabilite (NouvelleAchat)
 * - lucide-react (Package, Receipt, Fuel, DollarSign)
 * - framer-motion
 * 
 * UTILISÉ PAR :
 * - ComptabiliteModule.tsx (onglet Historique)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Receipt, Fuel, DollarSign, Sparkles } from 'lucide-react';
import { NouvelleAchat } from '@/types/comptabilite';
import { motion } from 'framer-motion';

// ============================================
// INTERFACE DES PROPS
// ============================================
export interface AchatsHistoriqueListProps {
  /** Liste des achats et dépenses à afficher */
  achats: NouvelleAchat[];
  /** Fonction de formatage des montants en euros */
  formatEuro: (value: number) => string;
  /** Mois sélectionné (1-12) */
  selectedMonth: number;
  /** Année sélectionnée */
  selectedYear: number;
  /** Tableau des noms de mois en français */
  months: string[];
}

// ============================================
// FONCTION UTILITAIRE - Obtenir l'icône selon le type
// ============================================
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'achat_produit':
      return <Package className="h-5 w-5 text-blue-400" />;
    case 'taxes':
      return <Receipt className="h-5 w-5 text-red-400" />;
    case 'carburant':
      return <Fuel className="h-5 w-5 text-orange-400" />;
    default:
      return <DollarSign className="h-5 w-5 text-purple-400" />;
  }
};

// ============================================
// FONCTION UTILITAIRE - Obtenir la classe CSS selon le type
// ============================================
const getTypeClass = (type: string) => {
  switch (type) {
    case 'achat_produit':
      return 'bg-blue-500/20';
    case 'taxes':
      return 'bg-red-500/20';
    case 'carburant':
      return 'bg-orange-500/20';
    default:
      return 'bg-purple-500/20';
  }
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const AchatsHistoriqueList: React.FC<AchatsHistoriqueListProps> = ({
  achats,
  formatEuro,
  selectedMonth,
  selectedYear,
  months
}) => {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      {/* En-tête avec titre animé */}
      <CardHeader className="flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="
            flex items-center gap-3 px-6 py-4
            rounded-2xl
            bg-white/70 dark:bg-white/10
            backdrop-blur-xl
            shadow-[0_20px_50px_rgba(0,0,0,0.15)]
            border border-white/30
          "
        >
          <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
          <CardTitle
            className="
              text-xl font-semibold tracking-wide
              bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900
              dark:from-white dark:via-gray-300 dark:to-white
              bg-clip-text text-transparent
              text-center
            "
          >
            Historique des Achats & Dépenses
            <span className="block text-sm text-green-600 font-bold mt-1 opacity-80">
              {months[selectedMonth - 1]} {selectedYear}
            </span>
          </CardTitle>
        </motion.div>
      </CardHeader>
      
      <CardContent>
        {/* Liste des achats/dépenses ou message si vide */}
        {achats.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {achats.map((achat) => (
              <div
                key={achat.id}
                className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
              >
                {/* Partie gauche: Icône et informations */}
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getTypeClass(achat.type)}`}>
                    {getTypeIcon(achat.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {achat.productDescription || achat.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(achat.date).toLocaleDateString('fr-FR')}
                      {achat.fournisseur && ` • ${achat.fournisseur}`}
                    </p>
                  </div>
                </div>
                
                {/* Partie droite: Coût et quantité */}
                <div className="text-right">
                  <p className="font-bold text-red-400">-{formatEuro(achat.totalCost)}</p>
                  {achat.quantity && (
                    <Badge variant="outline" className="mt-1">
                      Qté: {achat.quantity}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Aucun achat ou dépense pour {months[selectedMonth - 1]} {selectedYear}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchatsHistoriqueList;
