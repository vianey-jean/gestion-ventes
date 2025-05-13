
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
    const hasMinLength = newPassword.length >= 8;
    
    return hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar && hasMinLength;
  };
  
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate email
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
    
    // Reset errors
    setErrors({});
    
    // Validate passwords
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
  
  // Gestion du changement de validité du mot de passe
  const handlePasswordValidityChange = (isValid: boolean) => {
    setIsPasswordValid(isValid);
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Réinitialisation du mot de passe
              </CardTitle>
              <CardDescription className="text-center">
                {emailVerified
                  ? "Créez un nouveau mot de passe pour votre compte"
                  : "Entrez votre email pour réinitialiser votre mot de passe"}
              </CardDescription>
            </CardHeader>
            
            {!emailVerified ? (
              <form onSubmit={handleEmailSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-app-red hover:bg-opacity-90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Vérification..." : "Continuer"}
                  </Button>
                  
                  <div className="flex justify-between w-full text-sm">
                    <Link to="/login" className="text-app-blue hover:underline">
                      Retour à la connexion
                    </Link>
                    <Link to="/register" className="text-app-blue hover:underline">
                      Créer un compte
                    </Link>
                  </div>
                </CardFooter>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <PasswordInput
                      id="newPassword"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      error={errors.newPassword}
                      disabled={isLoading}
                    />
                    <PasswordStrengthChecker 
                      password={newPassword}
                      onValidityChange={handlePasswordValidityChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <PasswordInput
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={errors.confirmPassword}
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-app-red hover:bg-opacity-90"
                    disabled={isLoading || !isPasswordValid || !confirmPassword}
                  >
                    {isLoading ? "Traitement..." : "Réinitialiser le mot de passe"}
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
