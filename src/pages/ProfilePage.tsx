/**
 * ProfilePage — Page principale du profil utilisateur (refactorisée).
 *
 * Onglets :
 * - Profil : ProfileCard + ProfileInfoCard + PasswordSection
 * - Paramètres (admin) : ParametresSection
 * - Sécurité (admin principal) : SecuriteSection + MaintenanceSection
 *
 * Sous-composants extraits :
 * - ProfileHero        : en-tête héroïque animé
 * - ProfileTabsNav     : boutons de navigation entre onglets
 * - ProfileConfirmDialogs : 3 dialogues de confirmation
 */
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import profileApi, { ProfileData } from '@/services/api/profileApi';
import { authService } from '@/service/api';
import SEOHead from '@/components/SEOHead';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import OtpVerificationForm from '@/components/auth/OtpVerificationForm';

import ProfileCard from '@/components/profile/ProfileCard';
import ProfileInfoCard from '@/components/profile/ProfileInfoCard';
import PasswordSection from '@/components/profile/PasswordSection';
import ParametresSection from '@/components/profile/ParametresSection';
import SecuriteSection from '@/components/profile/SecuriteSection';
import MaintenanceSection from '@/components/profile/MaintenanceSection';
import ProfileHero from '@/components/profile/ProfileHero';
import ProfileTabsNav, { ProfileTab } from '@/components/profile/ProfileTabsNav';
import ProfileConfirmDialogs from '@/components/profile/ProfileConfirmDialogs';

const ProfilePage: React.FC = () => {
  const { user, verifySession } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ProfileTab>('profil');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', gender: '', address: '', phone: '' });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [isNewPasswordValid, setIsNewPasswordValid] = useState(false);

  const [confirmProfile, setConfirmProfile] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false);
  const [confirmPhoto, setConfirmPhoto] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 2FA — changement de mot de passe
  const [showPwOtpDialog, setShowPwOtpDialog] = useState(false);
  const [pwChallenge, setPwChallenge] = useState<{ challengeId: string; method: 'email' | 'sms'; maskedDestination: string } | null>(null);
  const [pwOtpError, setPwOtpError] = useState<string | null>(null);
  const [verifyingPwOtp, setVerifyingPwOtp] = useState(false);
  const [resendingPwOtp, setResendingPwOtp] = useState(false);

  const userRole = (profile as any)?.role || (user as any)?.role || '';
  const isAdminPrincipal = userRole === 'administrateur principale';
  const isAdmin = userRole === 'administrateur' || isAdminPrincipal;
  const canSeeSettings = isAdmin;

  useEffect(() => { fetchProfile(); }, []);

  // Ouverture directe d'un onglet via ?tab=securite (notifications de connexion)
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab === 'securite' || tab === 'parametres' || tab === 'profil') {
      setActiveTab(tab as ProfileTab);
      if (window.location.hash) {
        setTimeout(() => {
          document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
        }, 600);
      }
    }
  }, []);


  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      setProfile(data);
      setEditForm({
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender || '',
        address: data.address || '',
        phone: data.phone || '',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setConfirmPhoto(true);
  };

  const uploadPhoto = async () => {
    if (!pendingPhoto) return;
    try {
      setSaving(true);
      const result = await profileApi.uploadPhoto(pendingPhoto);
      setProfile(prev => (prev ? { ...prev, profilePhoto: result.photoUrl } : prev));
      localStorage.setItem('user', JSON.stringify({ ...profile, profilePhoto: result.photoUrl }));
      await verifySession();
      toast({ title: '✅ Photo mise à jour', description: 'Votre photo de profil a été enregistrée', className: 'bg-green-600 text-white border-green-600' });
    } catch {
      toast({ title: 'Erreur', description: "Échec de l'envoi de la photo", variant: 'destructive' });
    } finally {
      setSaving(false); setPendingPhoto(null); setPhotoPreview(null);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const result = await profileApi.updateProfile(editForm);
      setProfile(result.user);
      localStorage.setItem('user', JSON.stringify(result.user));
      await verifySession();
      setEditing(false);
      toast({ title: '✅ Profil mis à jour', description: 'Vos informations ont été enregistrées', className: 'bg-green-600 text-white border-green-600' });
    } catch {
      toast({ title: 'Erreur', description: 'Échec de la mise à jour', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    try {
      setSaving(true);
      // Étape 1 : on demande un code de vérification à 6 chiffres (2FA) avant
      // d'appliquer le changement de mot de passe.
      const challenge = await authService.requestChangePasswordOtp();
      setPwChallenge(challenge);
      setPwOtpError(null);
      setConfirmPassword(false);
      setShowPwOtpDialog(true);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Erreur lors de l'envoi du code de vérification";
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const verifyPasswordOtp = async (code: string) => {
    if (!pwChallenge) return;
    try {
      setVerifyingPwOtp(true);
      setPwOtpError(null);
      const result = await authService.verifyChangePassword({
        challengeId: pwChallenge.challengeId,
        code,
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        confirmPassword: pwForm.confirmPassword,
      });
      if (result.success) {
        toast({ title: '✅ Mot de passe modifié', description: 'Votre mot de passe a été changé avec succès', className: 'bg-green-600 text-white border-green-600' });
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        setShowPwOtpDialog(false);
        setPwChallenge(null);
      }
    } catch (e: any) {
      setPwOtpError(e?.response?.data?.message || 'Code incorrect');
    } finally {
      setVerifyingPwOtp(false);
    }
  };

  const resendPasswordOtp = async () => {
    if (!pwChallenge) return;
    try {
      setResendingPwOtp(true);
      const result = await authService.resendChangePasswordOtp(pwChallenge.challengeId);
      if (result.success !== false) {
        toast({ title: 'Code renvoyé', description: 'Un nouveau code vous a été envoyé' });
      } else {
        toast({ title: 'Erreur', description: result.message || 'Impossible de renvoyer le code', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Erreur', description: e?.response?.data?.message || 'Erreur lors du renvoi', variant: 'destructive' });
    } finally {
      setResendingPwOtp(false);
    }
  };

  const photoUrl = profile?.profilePhoto ? profileApi.getPhotoUrl(profile.profilePhoto) : null;

  if (loading) {
    return (
      <Layout>
        <PremiumLoading text="Chargement du profil..." size="xl" overlay={true} variant="default" />
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title="Profil" description="Gestion du profil utilisateur" />
      <style>{`
        @keyframes greenPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
          50% { opacity: 0.5; box-shadow: 0 0 15px 5px rgba(52, 211, 153, 0.3); }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/20 dark:from-[#030014] dark:via-[#0a0020] dark:to-[#0e0030] py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-6">

          <ProfileHero />

          <ProfileTabsNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            canSeeSettings={canSeeSettings}
            isAdminPrincipal={isAdminPrincipal}
          />

          {activeTab === 'profil' && (
            <>
              <ProfileCard
                photoUrl={photoUrl}
                firstName={profile?.firstName}
                lastName={profile?.lastName}
                email={profile?.email}
                userRole={userRole}
                onClickUpload={() => fileInputRef.current?.click()}
              />
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoSelect} />

              <ProfileInfoCard
                profile={profile}
                editing={editing}
                editForm={editForm}
                setEditForm={setEditForm}
                onEdit={() => setEditing(true)}
                onCancel={() => setEditing(false)}
                onSave={() => setConfirmProfile(true)}
              />

              <PasswordSection
                showPasswordForm={showPasswordForm}
                setShowPasswordForm={setShowPasswordForm}
                pwForm={pwForm}
                setPwForm={setPwForm}
                showPw={showPw}
                setShowPw={setShowPw}
                isNewPasswordValid={isNewPasswordValid}
                setIsNewPasswordValid={setIsNewPasswordValid}
                onSubmit={() => setConfirmPassword(true)}
              />
            </>
          )}

          {activeTab === 'parametres' && canSeeSettings && (
            <ParametresSection userRole={userRole} />
          )}

          {activeTab === 'securite' && isAdminPrincipal && (
            <>
              <SecuriteSection userRole={userRole} />
              <MaintenanceSection userRole={userRole} />
            </>
          )}
        </div>
      </div>

      <ProfileConfirmDialogs
        confirmProfile={confirmProfile}
        setConfirmProfile={setConfirmProfile}
        onSaveProfile={saveProfile}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        onChangePassword={changePassword}
        confirmPhoto={confirmPhoto}
        setConfirmPhoto={setConfirmPhoto}
        photoPreview={photoPreview}
        onUploadPhoto={uploadPhoto}
        saving={saving}
        onPhotoDialogClose={() => { setPendingPhoto(null); setPhotoPreview(null); }}
      />

      {/* Étape 2FA : validation du code à 6 chiffres pour le changement de mot de passe */}
      <Dialog open={showPwOtpDialog} onOpenChange={(open) => { if (!open) { setShowPwOtpDialog(false); setPwChallenge(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Vérification en 2 étapes</DialogTitle>
          </DialogHeader>
          {pwChallenge && (
            <OtpVerificationForm
              maskedDestination={pwChallenge.maskedDestination}
              method={pwChallenge.method}
              onVerify={verifyPasswordOtp}
              onResend={resendPasswordOtp}
              error={pwOtpError}
              isVerifying={verifyingPwOtp}
              isResending={resendingPwOtp}
              title="Confirmez le changement"
              description="Un code de vérification vous a été envoyé pour confirmer le changement de votre mot de passe."
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProfilePage;
