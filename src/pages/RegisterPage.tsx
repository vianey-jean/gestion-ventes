import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import PasswordInput from '@/components/PasswordInput';
import PasswordStrengthChecker from '@/components/PasswordStrengthChecker';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import { UserPlus, Mail, User, Phone, MapPin, Shield, Sparkles } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, checkEmail } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    address: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }

    if (name === 'email') {
      setIsEmailValid(true);
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      gender: value,
    });

    if (errors.gender) {
      setErrors({
        ...errors,
        gender: '',
      });
    }
  };

  const validateEmail = async () => {
    if (!formData.email) {
      setIsEmailValid(true);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Veuillez entrer un email valide',
      }));
      setIsEmailValid(false);
      return;
    }

    setIsEmailChecking(true);
    const emailExists = await checkEmail(formData.email);
    setIsEmailChecking(false);

    if (emailExists) {
      setErrors(prev => ({
        ...prev,
        email: 'Cet email est déjà utilisé',
      }));
      setIsEmailValid(false);
      toast({
        title: "Email déjà utilisé",
        description: "Veuillez utiliser une autre adresse email.",
        variant: "destructive"
      });
    } else {
      setIsEmailValid(true);
      setErrors(prev => ({
        ...prev,
        email: '',
      }));
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (formData.email && formData.email.includes('@')) {
        validateEmail();
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [formData.email]);

  const validatePassword = () => {
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
    const hasMinLength = formData.password.length >= 8;

    return hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar && hasMinLength;
  };

  const handlePasswordValidityChange = (isValid: boolean) => {
    setIsPasswordValid(isValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    setIsSubmitting(true);

    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName) newErrors.lastName = 'Le nom est requis';
    if (!formData.email) newErrors.email = "L'email est requis";
    if (!formData.gender) newErrors.gender = 'Le genre est requis';
    if (!formData.address) newErrors.address = "L'adresse est requise";
    if (!formData.phone) newErrors.phone = 'Le téléphone est requis';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les conditions';

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide';
    }

    if (formData.password && !validatePassword()) {
      newErrors.password = 'Le mot de passe ne répond pas aux exigences de sécurité';
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    if (!isEmailValid) {
      setIsSubmitting(false);
      return;
    }

    const success = await register({
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender as 'male' | 'female' | 'other',
      address: formData.address,
      phone: formData.phone,
      acceptTerms: formData.acceptTerms,
    });

    if (success) {
      navigate('/dashboard');
    }
    setIsSubmitting(false);
  };

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.gender &&
    formData.address &&
    formData.phone &&
    formData.password &&
    formData.confirmPassword &&
    formData.acceptTerms &&
    isEmailValid &&
    isPasswordValid &&
    !isEmailChecking &&
    Object.keys(errors).filter(key => errors[key]).length === 0;

  // Show loading during form submission
  if (isSubmitting) {
    return (
      <Layout>
        <PremiumLoading 
          text="Création du compte..."
          size="lg"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Background decorations */}
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-slate-900 py-12 px-4">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/6 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-400/10 to-fuchsia-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto max-w-4xl">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader className="text-center pb-8 pt-10">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserPlus className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Créer un compte
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-lg mt-2">
                Rejoignez notre communauté et découvrez toutes nos fonctionnalités
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-8 px-8">
                {/* Personal Info Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Informations personnelles</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Prénom
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Jean"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`h-12 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl transition-all duration-200 ${
                          errors.firstName ? "border-red-500" : "border-purple-200 dark:border-purple-700 focus:border-purple-500"
                        } focus:ring-4 focus:ring-purple-500/20`}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-500 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Nom
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Dupont"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`h-12 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl transition-all duration-200 ${
                          errors.lastName ? "border-red-500" : "border-purple-200 dark:border-purple-700 focus:border-purple-500"
                        } focus:ring-4 focus:ring-purple-500/20`}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-500 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Adresse email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={validateEmail}
                      disabled={isEmailChecking}
                      className={`h-12 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl transition-all duration-200 ${
                        errors.email ? "border-red-500" : "border-purple-200 dark:border-purple-700 focus:border-purple-500"
                      } focus:ring-4 focus:ring-purple-500/20`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {errors.email}
                      </p>
                    )}
                    {isEmailChecking && (
                      <p className="text-sm text-purple-600 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                        Vérification de l'email...
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="gender" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Genre
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={handleSelectChange}
                      >
                        <SelectTrigger className={`h-12 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl transition-all duration-200 ${
                          errors.gender ? "border-red-500" : "border-purple-200 dark:border-purple-700"
                        }`}>
                          <SelectValue placeholder="Sélectionnez votre genre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Homme</SelectItem>
                          <SelectItem value="female">Femme</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && (
                        <p className="text-sm text-red-500 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {errors.gender}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Téléphone
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="+33 6 12 34 56 78"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`h-12 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl transition-all duration-200 ${
                          errors.phone ? "border-red-500" : "border-purple-200 dark:border-purple-700 focus:border-purple-500"
                        } focus:ring-4 focus:ring-purple-500/20`}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Adresse
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="123 Rue de Paris, 75001 Paris"
                      value={formData.address}
                      onChange={handleChange}
                      className={`h-12 bg-white/50 dark:bg-gray-700/50 border-2 rounded-xl transition-all duration-200 ${
                        errors.address ? "border-red-500" : "border-purple-200 dark:border-purple-700 focus:border-purple-500"
                      } focus:ring-4 focus:ring-purple-500/20`}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Security Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Sécurité du compte</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Mot de passe
                      </Label>
                      <PasswordInput
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        className="h-12"
                      />
                      <PasswordStrengthChecker 
                        password={formData.password} 
                        onValidityChange={handlePasswordValidityChange}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Confirmer le mot de passe
                      </Label>
                      <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <Checkbox
                      id="acceptTerms"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          acceptTerms: checked as boolean,
                        })
                      }
                      className="mt-1"
                    />
                    <Label
                      htmlFor="acceptTerms"
                      className={`text-sm leading-relaxed cursor-pointer ${
                        errors.acceptTerms ? "text-red-500" : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      J'accepte les{" "}
                      <Link to="/terms" className="text-purple-600 hover:text-purple-700 underline">
                        conditions générales d'utilisation
                      </Link>{" "}
                      et la{" "}
                      <Link to="/privacy" className="text-purple-600 hover:text-purple-700 underline">
                        politique de confidentialité
                      </Link>
                    </Label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-sm text-red-500 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      {errors.acceptTerms}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-6 px-8 pb-10">
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isEmailChecking ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Vérification...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Créer mon compte
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    Déjà membre?{" "}
                    <Link 
                      to="/login" 
                      className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-semibold hover:underline transition-colors"
                    >
                      Se connecter
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
