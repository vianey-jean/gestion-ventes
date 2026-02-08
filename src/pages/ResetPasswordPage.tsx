import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PasswordInput from '@/components/PasswordInput';
import PasswordStrengthChecker from '@/components/PasswordStrengthChecker';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import { KeyRound, Mail, ArrowLeft, Shield, CheckCircle } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetPasswordRequest, resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; newPassword?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  
  const validatePassword = () => {
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
    const hasMinLength = newPassword.length >= 6;
    
    return hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar && hasMinLength;
  };
  
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrors({});
    
    if (!email) {
      setErrors({ email: 'Veuillez entrer votre email' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Veuillez entrer un email valide' });
      return;
    }
    
    setIsLoading(true);
    const success = await resetPasswordRequest({ email });
    setIsLoading(false);
    
    if (success) {
      setEmailVerified(true);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrors({});
    
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};
    
    if (!newPassword) {
      newErrors.newPassword = 'Veuillez entrer un nouveau mot de passe';
    } else if (!validatePassword()) {
      newErrors.newPassword = 'Le mot de passe ne répond pas aux exigences de sécurité';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    const success = await resetPassword({
      email,
      newPassword,
      confirmPassword,
    });
    setIsLoading(false);
    
    if (success) {
      navigate('/login');
    }
  };
  
  const handlePasswordValidityChange = (isValid: boolean) => {
    setIsPasswordValid(isValid);
  };

  // Show loading during form submission
  if (isLoading) {
    return (
      <Layout>
        <PremiumLoading 
          text="Traitement en cours..."
          size="md"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-slate-900 flex items-center justify-center p-4">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader className="text-center pb-8 pt-10">
              <div className="flex justify-center mb-6">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                  emailVerified 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600'
                }`}>
                  {emailVerified ? (
                    <CheckCircle className="h-10 w-10 text-white" />
                  ) : (
                    <KeyRound className="h-10 w-10 text-white" />
                  )}
                </div>
              </div>
              
              <CardTitle className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 ${
                emailVerified 
                  ? 'from-green-600 to-emerald-600' 
                  : 'from-blue-600 to-purple-600'
              }`}>
                {emailVerified ? 'Nouveau mot de passe' : 'Récupération'}
              </CardTitle>
              
              <CardDescription className="text-gray-600 dark:text-gray-300 text-lg mt-2">
                {emailVerified
                  ? "Créez un mot de passe sécurisé pour votre compte"
                  : "Saisissez votre email pour réinitialiser votre mot de passe"}
              </CardDescription>

              {emailVerified && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 animate-in fade-in-50">
                  <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                    <Mail className="h-5 w-5" />
                    <span className="text-sm font-medium">Email vérifié avec succès</span>
                  </div>
                </div>
              )}
            </CardHeader>
            
            {!emailVerified ? (
              <form onSubmit={handleEmailSubmit}>
                <CardContent className="space-y-6 px-8">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Adresse email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className={`h-14 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl transition-all duration-200 ${
                        errors.email 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                          : "border-blue-200 dark:border-blue-700 focus:border-blue-500 focus:ring-blue-500/20"
                      } focus:ring-4`}
                    />
                    {errors.email && (
                      <div className="flex items-center gap-2 text-red-500 text-sm animate-in fade-in-50">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {errors.email}
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-6 px-8 pb-10">
                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Vérification...
                      </>
                    ) : (
                      <>
                        <Mail className="h-5 w-5" />
                        Envoyer le lien
                      </>
                    )}
                  </Button>
                  
                  <div className="flex justify-between w-full text-sm">
                    <Link 
                      to="/login" 
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Retour à la connexion
                    </Link>
                    <Link 
                      to="/register" 
                      className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium hover:underline transition-colors"
                    >
                      Créer un compte
                    </Link>
                  </div>
                </CardFooter>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit}>
                <CardContent className="space-y-6 px-8">
                  <div className="space-y-3">
                    <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Nouveau mot de passe
                    </Label>
                    <PasswordInput
                      id="newPassword"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      error={errors.newPassword}
                      disabled={isLoading}
                      className="h-14"
                    />
                    <PasswordStrengthChecker 
                      password={newPassword}
                      onValidityChange={handlePasswordValidityChange}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Confirmer le mot de passe
                    </Label>
                    <PasswordInput
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={errors.confirmPassword}
                      disabled={isLoading}
                      className="h-14"
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-6 px-8 pb-10">
                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                    disabled={isLoading || !isPasswordValid || !confirmPassword}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Traitement...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Réinitialiser le mot de passe
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
