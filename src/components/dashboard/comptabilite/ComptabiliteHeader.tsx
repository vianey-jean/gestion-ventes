/**
 * ComptabiliteHeader - En-tête du module comptabilité
 * 
 * Contient le titre, les sélecteurs de période et les boutons d'action.
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, ShoppingCart, Receipt, FileDown } from 'lucide-react';
import { MONTHS } from '@/hooks/useComptabilite';

export interface ComptabiliteHeaderProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onNewAchat: () => void;
  onNewDepense: () => void;
  onExport: () => void;
}

const ComptabiliteHeader: React.FC<ComptabiliteHeaderProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onNewAchat,
  onNewDepense,
  onExport
}) => {
  return (
    <Card className="bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-green-900/40 border-emerald-500/30 shadow-2xl backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-xl">
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
            Module Comptabilité
          </CardTitle>
        </div>
        <CardDescription className="text-black-300 text-lg">
          Gérez vos achats, dépenses et analysez votre rentabilité
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Select value={selectedMonth.toString()} onValueChange={onMonthChange}>
            <SelectTrigger className="w-40 bg-white/10 border-white/20 text-red-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-red-800">
              {MONTHS.map((month, index) => (
                <SelectItem key={index} value={(index + 1).toString()}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear.toString()} onValueChange={onYearChange}>
            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-red-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={onNewAchat}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Nouvel Achat
          </Button>
          
          <Button
            onClick={onNewDepense}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-xl"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Nouvelle Dépense
          </Button>
          
          <Button
            onClick={onExport}
            className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-xl"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComptabiliteHeader;
