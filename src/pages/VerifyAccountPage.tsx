/**
 * VerifyAccountPage.tsx — Page cible du lien de validation envoyé par email.
 * Affiche un bouton « Valider mon compte » qui active définitivement le compte.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '@/service/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyAccountPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'success'>('loading');
  const [info, setInfo] = useState<{ email?: string; firstName?: string }>({});
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    (async () => {
      try {
        const res = await authService.verifyAccountToken(token);
        if (res?.valid) { setInfo({ email: res.email, firstName: res.firstName }); setStatus('valid'); }
        else setStatus('invalid');
      } catch { setStatus('invalid'); }
    })();
  }, [token]);

  const handleActivate = async () => {
    if (!token) return;
    setActivating(true);
    try {
      const res = await authService.activateAccount(token);
      if (res?.success) {
        setStatus('success');
        toast({
          title: 'Compte validé !',
          description: 'Votre compte est maintenant actif. Vous pouvez vous connecter.',
          className: 'bg-green-600 text-white border-green-600',
        });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast({ title: 'Erreur', description: res?.message || 'Activation impossible', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Erreur', description: err?.response?.data?.message || 'Activation impossible', variant: 'destructive' });
    } finally {
      setActivating(false);
    }
  };

  if (status === 'loading') {
    return <Layout><PremiumLoading text="Vérification du lien..." size="md" overlay variant="default" /></Layout>;
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="relative bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] shadow-2xl rounded-3xl overflow-hidden text-white">
            <CardHeader className="text-center pt-10">
              <div className="flex justify-center mb-4">
                {status === 'invalid'
                  ? <XCircle className="h-16 w-16 text-red-400" />
                  : status === 'success'
                  ? <CheckCircle2 className="h-16 w-16 text-emerald-400" />
                  : <Sparkles className="h-16 w-16 text-blue-400" />}
              </div>
              <CardTitle className="text-2xl">
                {status === 'invalid' ? 'Lien invalide ou expiré' : status === 'success' ? 'Compte validé !' : 'Validation de votre compte'}
              </CardTitle>
              <CardDescription className="text-purple-200/70 mt-2">
                {status === 'invalid'
                  ? "Ce lien n'est plus valide. Veuillez recommencer l'inscription."
                  : status === 'success'
                  ? 'Redirection vers la connexion...'
                  : `Bonjour ${info.firstName || ''}, cliquez sur le bouton ci-dessous pour valider définitivement votre compte ${info.email}.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-10 pt-4">
              {status === 'valid' && (
                <Button onClick={handleActivate} disabled={activating} className="w-full h-14 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white font-bold rounded-xl">
                  {activating ? 'Activation...' : 'Valider mon compte'}
                </Button>
              )}
              {status === 'invalid' && (
                <Button onClick={() => navigate('/register')} className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl">
                  Créer un nouveau compte
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default VerifyAccountPage;
