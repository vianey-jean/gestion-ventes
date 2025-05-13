
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

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }

    // Reset email validation when email is changed
    if (name === 'email') {
      setIsEmailValid(true);
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      gender: value,
    });

    // Clear error when field is edited
    if (errors.gender) {
      setErrors({
        ...errors,
        gender: '',
      });
    }
  };

  const validateEmail = async () => {
    if (!formData.email) {
      setIsEmailValid(true); // Reset to true if email is empty
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

  // Gestion du changement de validité du mot de passe
  const handlePasswordValidityChange = (isValid: boolean) => {
    setIsPasswordValid(isValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});
    setIsSubmitting(true);

    // Validate all fields
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

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide';
    }

    // Password validation
    if (formData.password && !validatePassword()) {
      newErrors.password = 'Le mot de passe ne répond pas aux exigences de sécurité';
    }

    // Confirm password validation
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // If there are errors, set them and stop form submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Check if email is already used
    if (!isEmailValid) {
      setIsSubmitting(false);
      return;
    }

    // Submit form
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

  // Compute if the form is valid and the button should be enabled
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

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Inscription</CardTitle>
              <CardDescription className="text-center">
                Créez un compte pour accéder à toutes les fonctionnalités
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Jean"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Dupont"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="exemple@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={validateEmail}
                    disabled={isEmailChecking}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                  {isEmailChecking && (
                    <p className="text-sm text-gray-500">Vérification de l'email...</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Genre</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Homme</SelectItem>
                        <SelectItem value="female">Femme</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-red-500">{errors.gender}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+33 6 12 34 56 78"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Rue de Paris, 75001 Paris"
                    value={formData.address}
                    onChange={handleChange}
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <PasswordInput
                      id="password"
                      name="password"
                      placeholder=""
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                    />
                    <PasswordStrengthChecker 
                      password={formData.password} 
                      onValidityChange={handlePasswordValidityChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <PasswordInput
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder=""
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
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
                    className={errors.acceptTerms ? "border-red-500" : ""}
                  />
                  <Label
                    htmlFor="acceptTerms"
                    className={`text-sm ${errors.acceptTerms ? "text-red-500" : ""}`}
                  >
                    J'accepte les conditions générales d'utilisation et la politique de confidentialité
                  </Label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-red-500">{errors.acceptTerms}</p>
                )}
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-app-red hover:bg-opacity-90"
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : isEmailChecking ? "Vérification..." : "S'inscrire"}
                </Button>

                <p className="text-sm text-center">
                  Vous avez déjà un compte?{" "}
                  <Link to="/login" className="text-app-blue hover:underline">
                    Se connecter
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
