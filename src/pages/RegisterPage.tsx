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
    const hasSpecialChar = /[!@#$%^&*()_+\-\=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
    const hasMinLength = formData.password.length >= 6;

    return hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar && hasMinLength;
  };

  // IMPORTANT: même règle que le backend (server/middleware/security.js)
  const validatePhone = (phone: string) => {
    const cleaned = phone.trim();
    const regex = /^[0-9+\-\s()]{6,20}$/;
    return regex.test(cleaned);
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

    // IMPORTANT: même règle que le backend (6-20 caractères, chiffres et + - espaces parenthèses)
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Veuillez entrer un numéro de téléphone valide (au moins 6 caractères).';
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

    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender as 'male' | 'female' | 'other',
        address: formData.address,
        phone: formData.phone.trim(),
        acceptTerms: formData.acceptTerms,
      });

      if (success) {
        // Rediriger vers la page de connexion après inscription réussie
        toast({
          title: "Compte créé avec succès !",
          description: "Vous pouvez maintenant vous connecter avec vos identifiants.",
          className: "bg-green-600 text-white border-green-600",
        });
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);

      const apiData = error?.response?.data;
      const apiDetails = Array.isArray(apiData?.details) ? apiData.details.join(' • ') : null;
      const message = apiData?.message || apiDetails || "Une erreur s'est produite lors de la création du compte";

      toast({
        title: "Erreur d'inscription",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-slate-900 py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/6 w-80 h-80 bg-purple-400/20 rounded-full blur-4xl animate-pulse animate-fadeIn"></div>
          <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-pink-400/20 rounded-full blur-4xl animate-pulse delay-1000 animate-fadeIn"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-400/20 to-fuchsia-400/20 rounded-full blur-4xl animate-rotateSlow opacity-70"></div>
        </div>

        <div className="relative container mx-auto max-w-4xl">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-shadow duration-500">
            <CardHeader className="text-center pb-8 pt-10">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl flex items-center justify-center shadow-xl animate-pulseGlow">
                  <UserPlus className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent animate-textGlow">
                Créer un compte
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-lg mt-2">
                Rejoignez notre communauté et découvrez toutes nos fonctionnalités
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-8 px-8">

                {/* Personal Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-purple-600 animate-bounce" />
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
                        } focus:ring-4 focus:ring-purple-500/30 shadow-lg hover:shadow-xl`}
                      />
                      {errors.firstName && (
                        <span className="text-sm text-red-500 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                          {errors.firstName}
                        </span>
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
                        } focus:ring-4 focus:ring-purple-500/30 shadow-lg hover:shadow-xl`}
                      />
                      {errors.lastName && (
                        <span className="text-sm text-red-500 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                          {errors.lastName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email */}
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
                      } focus:ring-4 focus:ring-purple-500/30 shadow-lg hover:shadow-xl`}
                    />
                    {errors.email && (
                      <span className="text-sm text-red-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                        {errors.email}
                      </span>
                    )}
                    {isEmailChecking && (
                      <span className="text-sm text-purple-600 flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin inline-block"></span>
                        Vérification de l'email...
                      </span>
                    )}
                  </div>

                  {/* Gender & Phone */}
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
                        } focus:ring-4 focus:ring-purple-500/30 shadow-lg hover:shadow-xl`}>
                          <SelectValue placeholder="Sélectionnez votre genre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Homme</SelectItem>
                          <SelectItem value="female">Femme</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && (
                        <span className="text-sm text-red-500 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                          {errors.gender}
                        </span>
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
                        } focus:ring-4 focus:ring-purple-500/30 shadow-lg hover:shadow-xl`}
                      />
                      {errors.phone && (
                        <span className="text-sm text-red-500 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                          {errors.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Address */}
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
                      } focus:ring-4 focus:ring-purple-500/30 shadow-lg hover:shadow-xl`}
                    />
                    {errors.address && (
                      <span className="text-sm text-red-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                        {errors.address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Security Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-purple-600 animate-pulse" />
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
                        className="h-12 shadow-lg hover:shadow-xl transition-shadow duration-300"
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
                        className="h-12 shadow-lg hover:shadow-xl transition-shadow duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-purple-50/40 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 shadow-md hover:shadow-lg transition-shadow duration-300">
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
                </div>

              </CardContent>

              <CardFooter className="flex flex-col space-y-6 px-8 pb-10">
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 animate-buttonGlow"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isEmailChecking ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Vérification...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 animate-pulse" />
                      Créer mon compte
                    </>
                  )}
                </Button>

           <div className="text-center mt-6">
  <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl font-medium flex items-center justify-center gap-2">
    <span className="inline-block animate-pulse text-purple-500 dark:text-purple-400">
      🔑
    </span>
    Déjà membre? 
    <Link
      to="/login"
      className="ml-2 relative inline-block text-transparent font-bold bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 
                 hover:from-pink-500 hover:via-purple-500 hover:to-violet-500 
                 transition-all duration-500 ease-in-out 
                 shadow-lg hover:shadow-2xl 
                 transform hover:scale-105 hover:translate-y-[-2px] 
                 animate-textGlow"
    >
      Se Connecter
      <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-10 blur-xl animate-pulseGlow"></span>
    </Link>
    <span className="inline-block animate-bounce text-purple-500 dark:text-purple-400">
      ✨
    </span>
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
