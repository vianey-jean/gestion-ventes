/**
 * ClientCardItem — Carte client (grille) avec photo, actions
 * (voir détail, modifier, supprimer), badge fidélité, téléphones et adresse.
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Edit, Eye, MapPin, Phone, Star, Trash2, User } from 'lucide-react';
import ClientFideliteBadge from './ClientFideliteBadge';

interface ClientLike {
  id: string;
  nom: string;
  phone: string;
  phones?: string[];
  adresse: string;
  dateCreation: string;
  photo?: string;
}

interface Props {
  client: ClientLike;
  index: number;
  photoUrl: string | null;
  onOpenPhotoZoom: (url: string, name: string) => void;
  onPhoneClick: (phone: string) => void;
  onAddressClick: (address: string) => void;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ClientCardItem: React.FC<Props> = ({
  client, index, photoUrl, onOpenPhotoZoom, onPhoneClick, onAddressClick, onDetail, onEdit, onDelete,
}) => (
  <Card
    className="group hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 card-mirror-light dark:card-mirror mirror-shine backdrop-blur-sm shadow-xl hover:shadow-purple-500/25 relative"
    style={{ animationDelay: `${index * 150}ms` }}
  >
    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-black text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 animate-bounce z-30">
      <Star className="w-3 h-3 inline mr-1" />ÉLITE
    </div>

    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-20 pointer-events-none"></div>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 rounded-3xl opacity-0 group-hover:opacity-15 blur transition-opacity duration-500 pointer-events-none"></div>

    <CardHeader className="pb-4 relative z-10">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="shrink-0 cursor-pointer group/photo"
            onClick={() => { if (photoUrl) onOpenPhotoZoom(photoUrl, client.nom); }}
          >
            {photoUrl ? (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2 ring-purple-400/50 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 shadow-lg group-hover/photo:ring-purple-500 group-hover/photo:scale-110 transition-all duration-300">
                <img
                  src={photoUrl}
                  alt={client.nom}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                />
                <div className="hidden w-full h-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 flex items-center justify-center ring-2 ring-purple-400/30 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 shadow-lg">
                <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 break-words">
              {client.nom}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className="inline-flex items-center gap-1">
                <Crown className="w-3 h-3 text-yellow-500" />
                Depuis le {new Date(client.dateCreation).toLocaleDateString('fr-FR')}
              </span>
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 shrink-0">
          <Button variant="ghost" size="sm" onClick={onDetail} className="h-10 w-10 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-full hover:scale-110 transition-transform duration-200" title="Voir détail">
            <Eye className="w-4 h-4 text-purple-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit} className="h-10 w-10 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full hover:scale-110 transition-transform duration-200">
            <Edit className="w-4 h-4 text-blue-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="h-10 w-10 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full hover:scale-110 transition-transform duration-200">
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>
    </CardHeader>

    <div className="px-6 pb-2 relative z-10">
      <ClientFideliteBadge clientName={client.nom} />
    </div>

    <CardContent className="relative z-10">
      <div className="space-y-4">
        <div className="space-y-2">
          {(client.phones && client.phones.length > 0 ? client.phones : [client.phone]).map((phone, phoneIndex) => (
            <div key={phoneIndex} onClick={() => onPhoneClick(phone)} className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 rounded-xl border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm cursor-pointer hover:scale-[1.02] transition-transform duration-200">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <span className="text-gray-700 dark:text-gray-200 font-semibold hover:text-green-600 dark:hover:text-green-400 transition-colors">{phone}</span>
                {phoneIndex === 0 && client.phones && client.phones.length > 1 && (
                  <span className="ml-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Principal</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div onClick={() => onAddressClick(client.adresse)} className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm cursor-pointer hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-lg mt-0.5">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{client.adresse}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ClientCardItem;
