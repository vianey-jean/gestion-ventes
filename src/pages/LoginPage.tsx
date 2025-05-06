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
import axios from 'axios';

  // 🔁 URL de base récupérée depuis le .env
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
    
    const success = await login({ email, password });
    if (success) {
      navigate('/dashboard');
    }
  };
  
  return (
    <Layout >
      <main className="min-h-screen bg-gray-50">
        <article className="container mx-auto py-12 px-4">
          <section className="max-w-md mx-auto">
            <Card>
              <header>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
                  <CardDescription className="text-center">
                    Connectez-vous à votre compte pour accéder au tableau de bord
                  </CardDescription>
                </CardHeader>
              </header>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
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
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                    {emailExists && (
                      <p className="text-sm text-green-500">Bienvenue {userName}</p>
                    )}
                  </div>
                  
                  {showPasswordField && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <PasswordInput
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                      />
                      <PasswordStrengthChecker password={password} />
                      <div className="text-sm text-right">
                        <Link to="/reset-password" className="text-app-blue hover:underline">
                          Mot de passe oublié?
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <footer>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button
                      type="submit"
                      className="w-full bg-app-red hover:bg-opacity-90"
                      disabled={isCheckingEmail}
                    >
                      {isCheckingEmail ? "Vérification..." : showPasswordField ? "Connexion" : "Continuer"}
                    </Button>
                    
                    <p className="text-sm text-center">
                      Vous n'avez pas de compte?{" "}
                      <Link to="/register" className="text-app-blue hover:underline">
                        S'inscrire
                      </Link>
                    </p>
                  </CardFooter>
                </footer>
              </form>
            </Card>
          </section>
        </article>
      </main>
    </Layout>
  );
};

export default LoginPage;
