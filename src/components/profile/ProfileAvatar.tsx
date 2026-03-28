/**
 * ProfileAvatar — Avatar de profil avec anneaux pulsants
 * 
 * Affiche la photo de profil (ou icône par défaut) entourée de deux
 * anneaux verts animés (animation greenPulse définie dans ProfilePage).
 * Un bouton caméra en bas à droite permet de changer la photo.
 * 
 * Cliquer sur l'avatar déclenche onClickUpload pour ouvrir le sélecteur de fichier.
 */
import React from 'react';
import { User, Camera } from 'lucide-react';
import profileApi from '@/services/api/profileApi';

interface ProfileAvatarProps {
  /** URL complète de la photo de profil (ou null pour l'icône par défaut) */
  photoUrl: string | null;
  /** Callback déclenché au clic pour ouvrir le sélecteur de fichier */
  onClickUpload: () => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ photoUrl, onClickUpload }) => {
  return (
    <div className="relative cursor-pointer" onClick={onClickUpload}>
      <div className="relative" style={{ width: 160, height: 160 }}>
        {/* Premier anneau pulsant vert (externe) */}
        <div className="absolute inset-0 rounded-full border-[3px] border-emerald-400" style={{ animation: 'greenPulse 1s ease-in-out infinite' }} />
        {/* Deuxième anneau pulsant vert (interne, décalé de 0.5s) */}
        <div className="absolute rounded-full border-[3px] border-emerald-500" style={{ inset: 6, animation: 'greenPulse 1s ease-in-out infinite 0.5s' }} />
        {/* Conteneur de la photo avec fond gradient par défaut */}
        <div className="absolute rounded-full overflow-hidden bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center" style={{ inset: 12 }}>
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-1/2 h-1/2 text-white" />
          )}
        </div>
      </div>
      {/* Bouton caméra pour changer la photo */}
      <div className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg border-2 border-white dark:border-[#0a0020] hover:scale-110 transition-transform">
        <Camera className="w-5 h-5 text-white" />
      </div>
    </div>
  );
};

export default ProfileAvatar;
