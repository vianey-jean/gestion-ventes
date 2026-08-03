/**
 * CommandeTableRow — ligne du tableau des commandes (vue desktop).
 */
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModernTableRow, ModernTableCell } from '@/components/dashboard/forms/ModernTable';
import { Edit, Trash2, Sparkles } from 'lucide-react';
import ClientFideliteMarquee from './ClientFideliteMarquee';
import { CommandeRowProps, getCommandeTotal } from './types';

const CommandeTableRow: React.FC<CommandeRowProps> = ({
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
  const renderDateCell = () => {
    if (commande.type === 'commande') {
      return (
        <div>
          <div className="text-xs text-muted-foreground">Arrivage:</div>
          <div>{new Date(commande.dateArrivagePrevue || '').toLocaleDateString()}</div>
          {commande.horaire && (
            <div className="text-xs text-muted-foreground mt-1">
              Horaire: {commande.horaire}
            </div>
          )}
        </div>
      );
    }

    const echeance = new Date(commande.dateEcheance || '');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const echeanceDate = new Date(echeance);
    echeanceDate.setHours(0, 0, 0, 0);

    const diffTime = echeanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isOverdue = diffDays < 0;
    const isNearDeadline = diffDays >= 0 && diffDays <= 2;

    return (
      <div>
        <div className="text-xs text-muted-foreground">Échéance:</div>
        <div className={
          isOverdue
            ? "animate-pulse text-red-600 dark:text-red-500 font-bold"
            : isNearDeadline
              ? "animate-pulse text-green-600 dark:text-green-500 font-bold"
              : ""
        }>
          {echeance.toLocaleDateString()}
        </div>
        {commande.horaire && (
          <div className={`text-xs mt-1 ${isOverdue
            ? "animate-pulse text-red-600 dark:text-red-500 font-semibold"
            : isNearDeadline
              ? "animate-pulse text-green-600 dark:text-green-500 font-semibold"
              : "text-muted-foreground"
            }`}>
            Horaire: {commande.horaire}
          </div>
        )}
      </div>
    );
  };

  return (
    <ModernTableRow className={`bg-gradient-to-r from-purple-50/30 via-pink-50/20 to-indigo-50/30 dark:from-gray-900/20 dark:via-purple-900/10 dark:to-indigo-900/10 hover:shadow-lg hover:bg-gradient-to-r hover:from-purple-100/40 hover:via-pink-100/30 hover:to-indigo-100/30 transition-all duration-500 rounded-xl  ${locked ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
      <ModernTableCell className="align-top w-52">
        <button
          type="button"
          onClick={() => onClientClick?.(commande)}
          className="text-left w-full group rounded-lg hover:bg-purple-100/40 dark:hover:bg-purple-900/20 px-1.5 py-1 -mx-1.5 transition-colors"
          title="Voir le détail du client"
        >
          <div className="font-semibold text-purple-800 dark:text-purple-200 group-hover:underline whitespace-normal break-words">{commande.clientNom}</div>
          <ClientFideliteMarquee fidelite={fidelite ?? null} />
          <div className="text-xs text-muted-foreground whitespace-normal break-words">{commande.clientAddress}</div>
        </button>
      </ModernTableCell>
      <ModernTableCell className="align-top">
        <span className="text-sm whitespace-normal break-words text-gray-700 dark:text-gray-300">{commande.clientPhone}</span>
      </ModernTableCell>
      <ModernTableCell className="align-top w-52">
        {commande.produits.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onProductClick?.(p.nom)}
            className="block text-left w-full text-sm space-y-0.5 rounded-lg hover:bg-pink-100/40 dark:hover:bg-pink-900/20 px-1.5 py-1 -mx-1.5 transition-colors"
            title="Voir le détail du produit"
          >
            <div className="font-medium text-purple-700 dark:text-purple-300 hover:underline whitespace-normal break-words inline-flex items-center gap-1">
              {p.nom}
              <Sparkles className="h-3 w-3 text-fuchsia-500 opacity-60" />
            </div>
            <div className="text-xs text-muted-foreground">
              Qté: <span className="font-bold text-red-600">{p.quantite}</span>
            </div>
          </button>
        ))}
      </ModernTableCell>
      <ModernTableCell className="align-top">
        {commande.produits.map((p, idx) => (
          <div key={idx} className="text-sm space-y-0.5">
            <div className="text-gray-600 dark:text-gray-400">Unitaire: {p.prixUnitaire}€</div>
            <div className="font-semibold text-purple-700 dark:text-purple-300">Vente: {p.prixVente}€</div>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t-2 border-red-300 dark:border-red-700">
          <div className="text-base font-extrabold text-red-600 dark:text-red-500 shadow-sm">
            Total: {getCommandeTotal(commande).toFixed(2)}€
          </div>
        </div>
      </ModernTableCell>
      <ModernTableCell className="align-top">
        <Badge
          className={
            commande.type === 'commande'
              ? "bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-500 text-white shadow-md hover:from-purple-700 hover:via-pink-600 hover:to-indigo-600"
              : commande.type === 'rdv'
                ? "bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-md hover:from-amber-600 hover:via-orange-600 hover:to-rose-600"
                : "bg-gradient-to-br from-blue-500 via-cyan-400 to-green-400 text-white shadow-md hover:from-blue-600 hover:via-cyan-500 hover:to-green-500"
          }
          variant={commande.type === 'commande' ? 'default' : 'secondary'}
        >
          {commande.type === 'commande' ? 'Commande' : commande.type === 'rdv' ? 'RDV' : 'Réservation'}
        </Badge>
      </ModernTableCell>
      <ModernTableCell className="align-top text-sm">
        {renderDateCell()}
      </ModernTableCell>
      <ModernTableCell className="align-top">
        <Select
          value={commande.statut}
          onValueChange={(value) => handleStatusChange(commande.id, value as any)}
        >
          <SelectTrigger className="w-36 bg-white/50 dark:bg-gray-800/40 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
            {getStatusOptions(commande.type).map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={
                  option.value === 'en_route' ? 'text-purple-600 font-semibold' :
                    option.value === 'arrive' ? 'text-green-600 font-semibold' :
                      option.value === 'en_attente' ? 'text-red-600 font-semibold' :
                        option.value === 'valide' ? 'text-blue-600 font-semibold' :
                          option.value === 'annule' ? 'text-gray-600 font-semibold' :
                            option.value === 'reporter' ? 'text-blue-500 font-semibold' :
                              ''
                }
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ModernTableCell>
      <ModernTableCell className="align-top">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(commande)}
            className="hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-xl shadow-sm transition-all duration-300"
            title="Modifier"
          >
            <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(commande.id)}
            className="hover:bg-gradient-to-r hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/30 dark:hover:to-rose-900/30 rounded-xl shadow-sm transition-all duration-300"
            title="Supprimer"
          >
            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
          </Button>
        </div>
      </ModernTableCell>
    </ModernTableRow>
  );
};

export default CommandeTableRow;
