/**
 * ProfileConfirmDialogs — Boîtes de dialogue de confirmation
 * pour la modification du profil, le changement de mot de passe
 * et l'upload d'une nouvelle photo de profil.
 */
import React from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Camera, Lock, Shield } from 'lucide-react';

interface Props {
  confirmProfile: boolean;
  setConfirmProfile: (v: boolean) => void;
  onSaveProfile: () => void;

  confirmPassword: boolean;
  setConfirmPassword: (v: boolean) => void;
  onChangePassword: () => void;

  confirmPhoto: boolean;
  setConfirmPhoto: (v: boolean) => void;
  photoPreview: string | null;
  onUploadPhoto: () => void;

  saving: boolean;
  onPhotoDialogClose: () => void;
}

const ProfileConfirmDialogs: React.FC<Props> = ({
  confirmProfile, setConfirmProfile, onSaveProfile,
  confirmPassword, setConfirmPassword, onChangePassword,
  confirmPhoto, setConfirmPhoto, photoPreview, onUploadPhoto,
  saving, onPhotoDialogClose,
}) => (
  <>
    <AlertDialog open={confirmProfile} onOpenChange={setConfirmProfile}>
      <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-violet-200/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-violet-500" /> Confirmer la modification</AlertDialogTitle>
          <AlertDialogDescription>Voulez-vous enregistrer les modifications de votre profil ?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onSaveProfile} disabled={saving} className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            {saving ? 'Enregistrement...' : 'Confirmer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={confirmPassword} onOpenChange={setConfirmPassword}>
      <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-violet-200/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-rose-500" /> Confirmer le changement de mot de passe</AlertDialogTitle>
          <AlertDialogDescription>Voulez-vous vraiment changer votre mot de passe ? Cette action est irréversible.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onChangePassword} disabled={saving} className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white">
            {saving ? 'Modification...' : 'Confirmer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={confirmPhoto} onOpenChange={(v) => { setConfirmPhoto(v); if (!v) onPhotoDialogClose(); }}>
      <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-violet-200/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2"><Camera className="w-5 h-5 text-violet-500" /> Confirmer la photo</AlertDialogTitle>
          <AlertDialogDescription>Voulez-vous utiliser cette photo comme photo de profil ?</AlertDialogDescription>
        </AlertDialogHeader>
        {photoPreview && (
          <div className="flex justify-center py-4">
            <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-violet-300/30" />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onUploadPhoto} disabled={saving} className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
            {saving ? 'Envoi...' : 'Confirmer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
);

export default ProfileConfirmDialogs;
