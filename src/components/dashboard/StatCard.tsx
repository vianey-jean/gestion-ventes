
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Composant de carte statistique réutilisable 
 * Utilisé dans le tableau de bord pour afficher différentes métriques
 * 
 * @param title - Titre principal de la carte
 * @param description - Description secondaire sous le titre
 * @param value - Valeur principale à afficher (peut être formatée)
 * @param valueClassName - Classes CSS à appliquer à la valeur
 */
interface StatCardProps {
  title: string;
  description: string;
  value: React.ReactNode;
  valueClassName?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  description, 
  value, 
  valueClassName = "text-gray-700" 
}) => {
  return (
    <Card className='card-3d'>
      <CardHeader className="pb-2 p-3 sm:p-4 md:p-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${valueClassName}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
};

export default StatCard;
