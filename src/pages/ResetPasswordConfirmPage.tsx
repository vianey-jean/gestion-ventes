/**
 * ResetPasswordConfirmPage.tsx — Page cible du lien de réinitialisation
 * envoyé par email. Permet de saisir un nouveau mot de passe et de confirmer.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '@/service/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PasswordInput from '@/components/PasswordInput';
import PasswordStrengthChecker from '@/components/PasswordStrengthChecker';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import { useToast } from '@/hooks/use-toast';
import { Shield, XCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPasswordConfirmPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'success'>('loading');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    (async () => {
      try {
        const res = await authService.verifyResetPasswordToken(token);
        if (res?.valid) { setEmail(res.email); setStatus('valid'); }
        else setStatus('invalid');
      } catch { setStatus('invalid'); }
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!newPassword) newErrors.newPassword = 'Nouveau mot de passe requis';
    else if (!isPasswordValid) newErrors.newPassword = 'Mot de passe insuffisant';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirmez le mot de passe';
    else if (confirmPassword !== newPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSubmitting(true);
    try {
      const res = await authService.confirmResetPassword({ token: token!, newPassword, confirmPassword });
      if (res?.success) {
        setStatus('success');
        toast({ title: 'Mot de passe modifié', description: 'Vous pouvez maintenant vous connecter.', className: 'bg-green-600 text-white border-green-600' });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast({ title: 'Erreur', description: res?.message || 'Échec de la réinitialisation', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Erreur', description: err?.response?.data?.message || 'Échec de la réinitialisation', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') return <Layout><PremiumLoading text="Vérification du lien..." size="md" overlay variant="default" /></Layout>;

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="relative bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] shadow-2xl rounded-3xl overflow-hidden text-white">
            <CardHeader className="text-center pt-10">
              <div className="flex justify-center mb-4">
                {status === 'invalid' ? <XCircle className="h-16 w-16 text-red-400" />
                  : status === 'success' ? <CheckCircle2 className="h-16 w-16 text-emerald-400" />
                  : <KeyRound className="h-16 w-16 text-blue-400" />}
              </div>
              <CardTitle className="text-2xl">
                {status === 'invalid' ? 'Lien invalide ou expiré' : status === 'success' ? 'Mot de passe modifié' : 'Nouveau mot de passe'}
              </CardTitle>
              <CardDescription className="text-purple-200/70 mt-2">
                {status === 'invalid' ? "Ce lien n'est plus valide. Recommencez la procédure."
                  : status === 'success' ? 'Redirection vers la connexion...'
                  : `Définissez un nouveau mot de passe pour ${email}`}
              </CardDescription>
            </CardHeader>
            {status === 'valid' && (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 px-8">
                  <Label className="text-sm font-semibold text-purple-200/80 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" /> Nouveau mot de passe
                  </Label>
                  <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} error={errors.newPassword} disabled={submitting} className="h-14 bg-white/[0.06] border-white/[0.1] text-white rounded-xl" />
                  <PasswordStrengthChecker password={newPassword} onValidityChange={setIsPasswordValid} />
                  <Label className="text-sm font-semibold text-purple-200/80">Confirmer le mot de passe</Label>
                  <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} disabled={submitting} className="h-14 bg-white/[0.06] border-white/[0.1] text-white rounded-xl" />
                </CardContent>
                <CardFooter className="px-8 pb-10">
                  <Button type="submit" disabled={submitting || !isPasswordValid || !confirmPassword} className="w-full h-14 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white font-bold rounded-xl">
                    {submitting ? 'Enregistrement...' : 'Réinitialiser le mot de passe'}
                  </Button>
                </CardFooter>
              </form>
            )}
            {status === 'invalid' && (
              <CardContent className="px-8 pb-10">
                <Button onClick={() => navigate('/reset-password')} className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl">Recommencer</Button>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ResetPasswordConfirmPage;
