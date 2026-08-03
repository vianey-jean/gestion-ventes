/**
 * CommandeMobileCard — carte d'une commande (vue mobile).
 */
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2 } from 'lucide-react';
import ClientFideliteMarquee from './ClientFideliteMarquee';
import { CommandeRowProps, getCommandeTotal } from './types';

const CommandeMobileCard: React.FC<CommandeRowProps> = ({
  commande,
  handleEdit,
  handleStatusChange,
  setDeleteId,
  getStatusOptions,
  onClientClick,
  onProductClick,
  locked,
  fidelite,
}) => {
  const totalPrice = getCommandeTotal(commande);

  const getDateInfo = () => {
    if (commande.type === 'commande') {
      return {
        label: 'Arrivage',
        date: new Date(commande.dateArrivagePrevue || '').toLocaleDateString(),
        isOverdue: false,
        isNearDeadline: false
      };
    }

    const echeance = new Date(commande.dateEcheance || '');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const echeanceDate = new Date(echeance);
    echeanceDate.setHours(0, 0, 0, 0);

    const diffTime = echeanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      label: 'Échéance',
      date: echeance.toLocaleDateString(),
      isOverdue: diffDays < 0,
      isNearDeadline: diffDays >= 0 && diffDays <= 2
    };
  };

  const dateInfo = getDateInfo();

  return (
    <div className={`p-4 border-b border-purple-100 dark:border-purple-800/30 hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-pink-50/20 hover:to-indigo-50/30 dark:hover:from-purple-900/10 dark:hover:via-pink-900/10 dark:hover:to-indigo-900/10 transition-all duration-500 shadow-lg  rounded-2xl ${locked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
      {/* En-tête: Client + Type */}
      <div className="flex justify-between items-start mb-3">
        <button
          type="button"
          onClick={() => onClientClick?.(commande)}
          className="flex-1 min-w-0 text-left rounded-lg hover:bg-purple-100/40 dark:hover:bg-purple-900/20 -mx-1 px-1 py-0.5 transition-colors"
          title="Voir le détail du client"
        >
          <h3 className="font-extrabold text-lg text-purple-800 dark:text-purple-200 truncate hover:underline">{commande.clientNom}</h3>
          <ClientFideliteMarquee fidelite={fidelite ?? null} />
          <p className="text-xs text-muted-foreground truncate">{commande.clientAddress}</p>
          <p className="text-xs text-muted-foreground">{commande.clientPhone}</p>
        </button>
        <Badge
          className={`ml-2 text-xs px-3 py-1 rounded-full font-semibold shadow-md ${commande.type === 'commande'
            ? "bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-500 text-white"
            : commande.type === 'rdv'
              ? "bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white"
              : "bg-gradient-to-br from-blue-500 via-cyan-400 to-green-400 text-white"
            }`}
        >
          {commande.type === 'commande' ? 'CMD' : commande.type === 'rdv' ? 'RDV' : 'RES'}
        </Badge>
      </div>

      {/* Produits */}
      <div className="mb-3 space-y-1">
        {commande.produits.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onProductClick?.(p.nom)}
            className="w-full flex justify-between text-sm rounded-md hover:bg-pink-100/40 dark:hover:bg-pink-900/20 px-1 py-0.5 -mx-1 transition-colors"
            title="Voir le détail du produit"
          >
            <span className="truncate flex-1 font-medium text-gray-800 dark:text-gray-200 text-left hover:underline">{p.nom} <span className="text-red-600 font-bold">{`x${p.quantite}`}</span></span>
            <span className="font-semibold ml-2 text-purple-700 dark:text-purple-300">{p.prixVente}€</span>
          </button>
        ))}
        <div className="pt-2 border-t border-red-200 dark:border-red-800">
          <div className="flex justify-between">
            <span className="font-bold text-red-600 dark:text-red-400 tracking-wide">Total</span>
            <span className="font-black text-red-600 dark:text-red-400 text-lg">{totalPrice.toFixed(2)}€</span>
          </div>
        </div>
      </div>

      {/* Date + Statut */}
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <div className={`text-xs px-3 py-1 rounded-full font-semibold shadow-sm ${dateInfo.isOverdue
          ? "bg-red-100 text-red-700 animate-pulse"
          : dateInfo.isNearDeadline
            ? "bg-green-100 text-green-700 animate-pulse"
            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}>
          {dateInfo.label}: {dateInfo.date}
          {commande.horaire && ` ${commande.horaire}`}
        </div>

        <Select
          value={commande.statut}
          onValueChange={(value) => handleStatusChange(commande.id, value as any)}
        >
          <SelectTrigger className="h-8 w-28 text-xs bg-white/50 dark:bg-gray-800/40 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
            {getStatusOptions(commande.type).map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs font-semibold hover:bg-purple-50 dark:hover:bg-purple-800/30 transition-colors">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEdit(commande)}
          className="flex-1 text-xs h-8 bg-white/40 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
        >
          <Edit className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
          Modifier
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteId(commande.id)}
          className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs h-8 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default CommandeMobileCard;
