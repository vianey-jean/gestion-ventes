import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import profileApi, { ProfileData } from '@/services/api/profileApi';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Camera, Lock, Save, Edit3, Check, X, Eye, EyeOff, Shield, Sparkles, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const premiumBtnClass = "group relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold";

const ProfilePage: React.FC = () => {
  const { user, verifySession } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', gender: '', address: '', phone: '' });

  // Password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // Confirmations
  const [confirmProfile, setConfirmProfile] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false);
  const [confirmPhoto, setConfirmPhoto] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      setProfile(data);
      setEditForm({ firstName: data.firstName, lastName: data.lastName, gender: data.gender || '', address: data.address || '', phone: data.phone || '' });
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
      setProfile(prev => prev ? { ...prev, profilePhoto: result.photoUrl } : prev);
      localStorage.setItem('user', JSON.stringify({ ...profile, profilePhoto: result.photoUrl }));
      await verifySession();
      toast({ title: '✅ Photo mise à jour', description: 'Votre photo de profil a été enregistrée', className: 'bg-green-600 text-white border-green-600' });
    } catch (e) {
      toast({ title: 'Erreur', description: "Échec de l'envoi de la photo", variant: 'destructive' });
    } finally {
      setSaving(false);
      setPendingPhoto(null);
      setPhotoPreview(null);
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
    } catch (e) {
      toast({ title: 'Erreur', description: 'Échec de la mise à jour', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    try {
      setSaving(true);
      const result = await profileApi.changePassword(pwForm);
      if (result.success) {
        toast({ title: '✅ Mot de passe modifié', description: 'Votre mot de passe a été changé avec succès', className: 'bg-green-600 text-white border-green-600' });
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Erreur lors du changement de mot de passe';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const photoUrl = profile?.profilePhoto ? profileApi.getPhotoUrl(profile.profilePhoto) : null;

  const GreenPulseRings = ({ size = 160 }: { size?: number }) => (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-[3px] border-emerald-400" style={{ animation: 'greenPulse 1s ease-in-out infinite' }} />
      {/* Inner ring */}
      <div className="absolute rounded-full border-[3px] border-emerald-500" style={{ inset: 6, animation: 'greenPulse 1s ease-in-out infinite 0.5s' }} />
      {/* Photo container */}
      <div className="absolute rounded-full overflow-hidden bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center" style={{ inset: 12 }}>
        {photoUrl ? (
          <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <User className="w-1/2 h-1/2 text-white" />
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        @keyframes greenPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
          50% { opacity: 0.5; box-shadow: 0 0 15px 5px rgba(52, 211, 153, 0.3); }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/20 dark:from-[#030014] dark:via-[#0a0020] dark:to-[#0e0030] py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* HEADER */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-300/20 mb-4">
              <Crown className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400">Profil Utilisateur</span>
              <Sparkles className="w-3 h-3 text-fuchsia-500 animate-pulse" />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              Mon Profil
            </h1>
          </motion.div>

          {/* PROFILE CARD */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="relative rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-white/5 border border-violet-200/30 dark:border-violet-800/20 shadow-2xl shadow-violet-500/5 overflow-hidden p-8"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

            <div className="flex flex-col items-center gap-6">
              {/* PHOTO */}
              <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <GreenPulseRings size={160} />
                <div className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg border-2 border-white dark:border-[#0a0020] hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoSelect} />
              </div>

              {/* NAME */}
              <div className="text-center">
                <h2 className="text-2xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{profile?.email}</p>
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> En ligne
                </span>
              </div>
            </div>
          </motion.div>

          {/* INFO CARD */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="relative rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-white/5 border border-violet-200/30 dark:border-violet-800/20 shadow-2xl shadow-violet-500/5 overflow-hidden p-8"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-violet-500" /> Informations Personnelles
              </h3>
              {!editing ? (
                <Button onClick={() => setEditing(true)} className={`${premiumBtnClass} bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-violet-300/30 text-violet-600 dark:text-violet-400`}>
                  <Edit3 className="w-4 h-4 mr-2" /> Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={() => setEditing(false)} variant="ghost" className="rounded-xl text-rose-500"><X className="w-4 h-4 mr-1" /> Annuler</Button>
                  <Button onClick={() => setConfirmProfile(true)} className={`${premiumBtnClass} bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/30`}>
                    <Save className="w-4 h-4 mr-2" /> Enregistrer
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: User, label: 'Prénom', key: 'firstName' as const },
                { icon: User, label: 'Nom', key: 'lastName' as const },
                { icon: Mail, label: 'Email', key: 'email' as const, readonly: true },
                { icon: Phone, label: 'Téléphone', key: 'phone' as const },
                { icon: MapPin, label: 'Adresse', key: 'address' as const },
                { icon: User, label: 'Genre', key: 'gender' as const },
              ].map(({ icon: Icon, label, key, readonly }) => (
                <div key={key} className="rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-white/[0.02] border border-slate-200/50 dark:border-violet-800/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-violet-500" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                  </div>
                  {editing && !readonly ? (
                    key === 'gender' ? (
                      <select value={editForm.gender} onChange={e => setEditForm(p => ({ ...p, gender: e.target.value }))}
                        className="w-full rounded-xl border border-violet-200/30 dark:border-violet-800/20 bg-white dark:bg-white/5 px-3 py-2 text-sm">
                        <option value="male">Homme</option>
                        <option value="female">Femme</option>
                        <option value="other">Autre</option>
                      </select>
                    ) : (
                      <Input value={editForm[key as keyof typeof editForm] || ''} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                        className="rounded-xl border-violet-200/30 dark:border-violet-800/20" />
                    )
                  ) : (
                    <p className="text-sm font-semibold text-foreground">
                      {key === 'email' ? profile?.email : key === 'gender'
                        ? (profile?.gender === 'male' ? 'Homme' : profile?.gender === 'female' ? 'Femme' : 'Autre')
                        : (profile as any)?.[key] || '—'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* PASSWORD CARD */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="relative rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-white/5 border border-violet-200/30 dark:border-violet-800/20 shadow-2xl shadow-violet-500/5 overflow-hidden p-8"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-500" /> Sécurité — Mot de passe
              </h3>
              {!showPasswordForm && (
                <Button onClick={() => setShowPasswordForm(true)} className={`${premiumBtnClass} bg-gradient-to-r from-rose-500/10 to-orange-500/10 border-rose-300/30 text-rose-600 dark:text-rose-400`}>
                  <Lock className="w-4 h-4 mr-2" /> Changer le mot de passe
                </Button>
              )}
            </div>

            {showPasswordForm && (
              <div className="space-y-4 max-w-md">
                {[
                  { key: 'currentPassword' as const, label: 'Mot de passe actuel', show: showPw.current, toggle: () => setShowPw(p => ({ ...p, current: !p.current })) },
                  { key: 'newPassword' as const, label: 'Nouveau mot de passe', show: showPw.new, toggle: () => setShowPw(p => ({ ...p, new: !p.new })) },
                  { key: 'confirmPassword' as const, label: 'Confirmer le nouveau mot de passe', show: showPw.confirm, toggle: () => setShowPw(p => ({ ...p, confirm: !p.confirm })) },
                ].map(({ key, label, show, toggle }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
                    <div className="relative">
                      <Input type={show ? 'text' : 'password'} value={pwForm[key]} onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                        className="rounded-xl border-violet-200/30 dark:border-violet-800/20 pr-10" />
                      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => { setShowPasswordForm(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} variant="ghost" className="rounded-xl text-rose-500">
                    <X className="w-4 h-4 mr-1" /> Annuler
                  </Button>
                  <Button onClick={() => setConfirmPassword(true)} disabled={!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword}
                    className={`${premiumBtnClass} bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/30`}>
                    <Check className="w-4 h-4 mr-2" /> Valider
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

        </div>
      </div>

      {/* CONFIRM DIALOGS */}
      <AlertDialog open={confirmProfile} onOpenChange={setConfirmProfile}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-violet-200/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-violet-500" /> Confirmer la modification</AlertDialogTitle>
            <AlertDialogDescription>Voulez-vous enregistrer les modifications de votre profil ?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={saveProfile} disabled={saving} className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
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
            <AlertDialogAction onClick={changePassword} disabled={saving} className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white">
              {saving ? 'Modification...' : 'Confirmer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmPhoto} onOpenChange={v => { setConfirmPhoto(v); if (!v) { setPendingPhoto(null); setPhotoPreview(null); } }}>
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
            <AlertDialogAction onClick={uploadPhoto} disabled={saving} className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
              {saving ? 'Envoi...' : 'Confirmer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ProfilePage;
