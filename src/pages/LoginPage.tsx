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
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import axios from 'axios';

const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, checkEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [userName, setUserName] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const handleEmailCheck = async () => {
    if (!email) {
      setErrors({ ...errors, email: 'Veuillez entrer votre email' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ ...errors, email: 'Veuillez entrer un email valide' });
      return;
    }
    
    setIsCheckingEmail(true);
    try {
      const response = await axios.post(`${AUTH_BASE_URL}/api/auth/check-email`, { email });

      setIsCheckingEmail(false);
      
      if (response.data.exists) {
        setEmailExists(true);
        setShowPasswordField(true);
        setUserName(`${response.data.user.firstName} ${response.data.user.lastName}`);
      } else {
        setEmailExists(false);
        setShowPasswordField(false);
        setErrors({ ...errors, email: 'Ce profil n\'existe pas' });
      }
    } catch (error) {
      setIsCheckingEmail(false);
      setEmailExists(false);
      setShowPasswordField(false);
      setErrors({ ...errors, email: 'Une erreur s\'est produite' });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrors({});
    
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Veuillez entrer votre email' }));
      return;
    }
    
    if (showPasswordField && !password) {
      setErrors(prev => ({ ...prev, password: 'Veuillez entrer votre mot de passe' }));
      return;
    }
    
    if (!showPasswordField) {
      await handleEmailCheck();
      return;
    }
    
    setIsLoggingIn(true);
    const success = await login({ email, password });
    if (success) {
      navigate('/dashboard');
    }
    setIsLoggingIn(false);
  };
  
  const handlePasswordValidityChange = (isValid: boolean) => {
    setIsPasswordValid(isValid);
  };

  // Show loading during login process
  if (isLoggingIn) {
    return (
      <Layout>
        <PremiumLoading 
          text="Connexion en cours..."
          size="lg"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-slate-900 flex items-center justify-center p-4">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-400/10 to-violet-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader className="text-center pb-8 pt-10">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Lock className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Connexion
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-lg mt-2">
                Accédez à votre espace personnel
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setShowPasswordField(false);
                      setEmailExists(false);
                      if (errors.email) {
                        setErrors({ ...errors, email: undefined });
                      }
                    }}
                    onBlur={handleEmailCheck}
                    disabled={isCheckingEmail || showPasswordField}
                    className={`h-14 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl transition-all duration-200 ${
                      errors.email 
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                        : "border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-purple-500/20"
                    } focus:ring-4`}
                  />
                  {errors.email && (
                    <div className="flex items-center gap-2 text-red-500 text-sm animate-in fade-in-50">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      {errors.email}
                    </div>
                  )}
                  {emailExists && (
                    <div className="flex items-center gap-2 text-green-600 text-sm animate-in fade-in-50">
                      <Sparkles className="h-4 w-4" />
                      Bienvenue {userName}
                    </div>
                  )}
                </div>
                
                {showPasswordField && (
                  <div className="space-y-3 animate-in fade-in-50 slide-in-from-top-4 duration-300">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Mot de passe
                    </Label>
                    <PasswordInput
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={errors.password}
                      className="h-14"
                    />
                    <PasswordStrengthChecker 
                      password={password} 
                      onValidityChange={handlePasswordValidityChange}
                    />
                    <div className="text-sm text-right">
                      <Link 
                        to="/reset-password" 
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium hover:underline transition-colors"
                      >
                        Mot de passe oublié?
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
              
              {/* <CardFooter className="flex flex-col space-y-6 px-8 pb-10">
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                  disabled={isCheckingEmail || (showPasswordField && !isPasswordValid)}
                >
                  {isCheckingEmail ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Vérification...
                    </>
                  ) : showPasswordField ? (
                    <>
                      <Lock className="h-5 w-5" />
                      Se connecter
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-5 w-5" />
                      Continuer
                    </>
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    Nouveau sur  plateforme?{" "}
                  </p>
                  <p>
                    <Link 
                      to="/register" 
                      className="h-5 w-5 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-semibold hover:underline transition-colors"
                    >
                      Créer un compte
                    </Link>
                  </p>
                </div>
              </CardFooter> */}
 <CardFooter className="flex flex-row space-x-4 px-8 pb-10">
  {/* Bouton principal - Connexion */}
  <Button
    type="submit"
    className="w-1/2 h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 
               hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 
               text-white font-bold text-lg rounded-xl shadow-lg 
               hover:shadow-xl transform hover:scale-105 
               transition-all duration-300 flex items-center justify-center gap-3"
    disabled={isCheckingEmail || (showPasswordField && !isPasswordValid)}
  >
    {isCheckingEmail ? (
      <>
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        Vérification...
      </>
    ) : showPasswordField ? (
      <>
        <Lock className="h-5 w-5" />
        Se connecter
      </>
    ) : (
      <>
        <ArrowRight className="h-5 w-5" />
        Continuer
      </>
    )}
  </Button>

  {/* Bouton secondaire - Créer un compte */}
  <Link to="/register" className="w-1/2">
    <Button
      className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 
                 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 
                 text-white hover:text-black font-bold text-lg rounded-xl shadow-lg 
                 hover:shadow-xl transform hover:scale-105 ">
      Créer un compte
    </Button>
  </Link>
</CardFooter>



            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
