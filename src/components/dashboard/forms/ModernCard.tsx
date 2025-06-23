
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ModernCardProps {
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

const ModernCard: React.FC<ModernCardProps> = ({
  title,
  icon: Icon,
  children,
  className = "",
  headerActions
}) => {
  return (
    <Card className={`card-3d border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 ${className}`}>
      {(title || Icon || headerActions) && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {Icon && (
                <div className="p-2 rounded-lg bg-gradient-to-br from-app-blue to-app-purple text-white">
                  <Icon className="h-5 w-5" />
                </div>
              )}
              {title && (
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {title}
                </CardTitle>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center space-x-2">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};

export default ModernCard;
