import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import PasswordInput from "@/components/PasswordInput";
import PasswordStrengthChecker from "@/components/PasswordStrengthChecker";
import Layout from "@/components/Layout";
import PremiumLoading from "@/components/ui/premium-loading";
import SEOHead from "@/components/SEOHead";

import {
  UserPlus,
  Mail,
  User,
  Phone,
  MapPin,
  Shield,
  Sparkles,
  Crown,
  Fingerprint,
  KeyRound,
  Star,
  BarChart3,
  Users,
  Package,
  TrendingUp,
  ArrowRight,
  LockKeyhole,
  Zap,
  Globe2,
  CircleCheck,
} from "lucide-react";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  address: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

type Errors = Record<string, string>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{6,20}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  gender: "",
  address: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, checkEmail } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [errors, setErrors] = useState<Errors>({});
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  /*
   * --------------------------------------------------------------------------
   * THEME
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    if (typeof document === "undefined") return;

    const updateTheme = () => {
      setIsDark(
        document.documentElement.classList.contains("dark")
      );
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  /*
   * --------------------------------------------------------------------------
   * INPUT
   * --------------------------------------------------------------------------
   */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "email") {
      setIsEmailValid(true);
    }
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value,
    }));

    if (errors.gender) {
      setErrors((prev) => ({
        ...prev,
        gender: "",
      }));
    }
  };

  /*
   * --------------------------------------------------------------------------
   * EMAIL
   * --------------------------------------------------------------------------
   */

  const validateEmail = async () => {
    const email = formData.email.trim();

    if (!email) {
      setIsEmailValid(true);
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Veuillez entrer un email valide",
      }));

      setIsEmailValid(false);
      return;
    }

    setIsEmailChecking(true);

    try {
      const exists = await checkEmail(email);

      if (exists) {
        setErrors((prev) => ({
          ...prev,
          email: "Cet email est déjà utilisé",
        }));

        setIsEmailValid(false);

        toast({
          title: "Email déjà utilisé",
          description:
            "Veuillez utiliser une autre adresse email.",
          variant: "destructive",
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          email: "",
        }));

        setIsEmailValid(true);
      }
    } catch (error) {
      console.error("Erreur de vérification email :", error);
    } finally {
      setIsEmailChecking(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * EMAIL DEBOUNCE
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    if (!formData.email.includes("@")) return;

    const timer = window.setTimeout(() => {
      validateEmail();
    }, 500);

    return () => window.clearTimeout(timer);
  }, [formData.email]);

  /*
   * --------------------------------------------------------------------------
   * PASSWORD
   * --------------------------------------------------------------------------
   */

  const handlePasswordValidityChange = (valid: boolean) => {
    setIsPasswordValid(valid);
  };

  /*
   * --------------------------------------------------------------------------
   * VALIDATION
   * --------------------------------------------------------------------------
   */

  const validateForm = (): Errors => {
    const newErrors: Errors = {};

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim();
    const address = formData.address.trim();
    const phone = formData.phone.trim();

    if (!firstName) {
      newErrors.firstName = "Le prénom est requis";
    }

    if (!lastName) {
      newErrors.lastName = "Le nom est requis";
    }

    if (!email) {
      newErrors.email = "L'email est requis";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Veuillez entrer un email valide";
    }

    if (!formData.gender) {
      newErrors.gender = "Le genre est requis";
    }

    if (!address) {
      newErrors.address = "L'adresse est requise";
    }

    if (!phone) {
      newErrors.phone = "Le téléphone est requis";
    } else if (!PHONE_REGEX.test(phone)) {
      newErrors.phone =
        "Veuillez entrer un numéro de téléphone valide.";
    }

    if (!formData.password) {
      newErrors.password =
        "Le mot de passe est requis";
    } else if (!PASSWORD_REGEX.test(formData.password)) {
      newErrors.password =
        "Le mot de passe ne répond pas aux exigences de sécurité";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "La confirmation du mot de passe est requise";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Les mots de passe ne correspondent pas";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms =
        "Vous devez accepter les conditions";
    }

    return newErrors;
  };

  /*
   * --------------------------------------------------------------------------
   * SUBMIT
   * --------------------------------------------------------------------------
   */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!isEmailValid || isEmailChecking) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const success = await register({
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender as
          | "male"
          | "female"
          | "other",
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        acceptTerms: formData.acceptTerms,
      });

      if (!success) {
        return;
      }

      toast({
        title: "Compte créé avec succès !",
        description:
          "Vous pouvez maintenant vous connecter avec vos identifiants.",
        className:
          "bg-emerald-600 text-white border-emerald-600",
      });

      navigate("/login");
    } catch (error: any) {
      console.error("Erreur d'inscription :", error);

      const apiData = error?.response?.data;

      const details = Array.isArray(apiData?.details)
        ? apiData.details.join(" • ")
        : "";

      const message =
        apiData?.message ||
        details ||
        "Une erreur s'est produite lors de la création du compte.";

      toast({
        title: "Erreur d'inscription",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * FORM VALID
   * --------------------------------------------------------------------------
   */

  const isFormValid =
    Boolean(
      formData.firstName.trim() &&
        formData.lastName.trim() &&
        formData.email.trim() &&
        formData.gender &&
        formData.address.trim() &&
        formData.phone.trim() &&
        formData.password &&
        formData.confirmPassword &&
        formData.acceptTerms &&
        isEmailValid &&
        isPasswordValid &&
        !isEmailChecking &&
        Object.values(errors).every((error) => !error)
    );

  /*
   * --------------------------------------------------------------------------
   * LOADING
   * --------------------------------------------------------------------------
   */

  if (isSubmitting) {
    return (
      <Layout>
        <PremiumLoading
          text="Création du compte..."
          size="lg"
          overlay
          variant="default"
        />
      </Layout>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * THEME
   * --------------------------------------------------------------------------
   */

  const pageBackground = isDark
    ? "bg-[#07070c]"
    : "bg-slate-50";

  const primaryText = isDark
    ? "text-white"
    : "text-slate-900";

  const secondaryText = isDark
    ? "text-slate-300"
    : "text-slate-600";

  const mutedText = isDark
    ? "text-slate-400"
    : "text-slate-500";

  const cardBackground = isDark
    ? "bg-white/[0.05]"
    : "bg-white";

  const cardBorder = isDark
    ? "border-white/10"
    : "border-slate-200";

  const inputBackground = isDark
    ? "bg-white/[0.04]"
    : "bg-white";

  const inputBorder = isDark
    ? "border-white/10"
    : "border-slate-200";

  const inputText = isDark
    ? "text-white placeholder:text-slate-500"
    : "text-slate-900 placeholder:text-slate-400";

  const labelText = isDark
    ? "text-slate-200"
    : "text-slate-700";

  const inputClasses = (hasError = false) =>
    `
      h-12
      w-full
      rounded-xl
      ${inputBackground}
      ${inputBorder}
      ${inputText}
      shadow-sm
      transition-colors
      focus:border-violet-500
      focus:ring-2
      focus:ring-violet-500/10
      ${
        hasError
          ? "border-red-400 focus:border-red-400 focus:ring-red-500/10"
          : ""
      }
    `;

  /*
   * --------------------------------------------------------------------------
   * FEATURES
   * --------------------------------------------------------------------------
   */

  const features = [
    {
      icon: BarChart3,
      label: "Dashboard",
      desc: "Vue globale",
      color: "from-violet-500 to-purple-600",
    },
    {
      icon: Users,
      label: "Clients",
      desc: "Gestion CRM",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Package,
      label: "Inventaire",
      desc: "Stock temps réel",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: TrendingUp,
      label: "Rapports",
      desc: "Analyses avancées",
      color: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Inscription"
        description="Créer un compte sur Gestion Vente"
      />

      <main
        className={`
          min-h-screen
          ${pageBackground}
          px-4
          py-10
          transition-colors
          sm:px-6
          lg:px-8
        `}
      >
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            {/* ---------------------------------------------------------------- */}
            {/* LEFT                                                             */}
            {/* ---------------------------------------------------------------- */}

            <section className="hidden lg:block">
              <div
                className={`
                  mb-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.15em]
                  ${
                    isDark
                      ? "border-violet-400/20 bg-violet-500/10 text-violet-300"
                      : "border-violet-200 bg-violet-50 text-violet-700"
                  }
                `}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <Sparkles className="h-3.5 w-3.5" />
                Nouvelle génération
              </div>

              <h1
                className={`
                  mb-6
                  max-w-xl
                  text-5xl
                  font-black
                  leading-tight
                  tracking-tight
                  xl:text-6xl
                  ${primaryText}
                `}
              >
                Gérez votre activité
                <span className="block">
                  avec{" "}
                  <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 bg-clip-text text-transparent">
                    élégance.
                  </span>
                </span>
              </h1>

              <p
                className={`
                  mb-8
                  max-w-xl
                  text-lg
                  leading-relaxed
                  ${secondaryText}
                `}
              >
                Une plateforme moderne pour gérer
                vos ventes, vos clients, votre
                inventaire et vos performances
                depuis une interface unique.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {features.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className={`
                        rounded-2xl
                        border
                        p-4
                        ${
                          isDark
                            ? "border-white/10 bg-white/[0.04]"
                            : "border-slate-200 bg-white"
                        }
                      `}
                    >
                      <div
                        className={`
                          mb-3
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          bg-gradient-to-br
                          ${item.color}
                        `}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>

                      <p
                        className={`text-sm font-bold ${primaryText}`}
                      >
                        {item.label}
                      </p>

                      <p
                        className={`mt-1 text-xs ${mutedText}`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div
                className={`
                  mt-8
                  flex
                  flex-wrap
                  gap-5
                  text-xs
                  ${mutedText}
                `}
              >
                <TrustItem
                  icon={LockKeyhole}
                  text="Données sécurisées"
                />

                <TrustItem
                  icon={Zap}
                  text="Rapide & moderne"
                />

                <TrustItem
                  icon={Globe2}
                  text="Accessible partout"
                />
              </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* FORM                                                             */}
            {/* ---------------------------------------------------------------- */}

            <Card
              className={`
                relative
                overflow-hidden
                rounded-3xl
                border
                shadow-xl
                ${cardBackground}
                ${cardBorder}
                ${
                  isDark
                    ? "shadow-black/30"
                    : "shadow-slate-200/70"
                }
              `}
            >
              <div className="absolute left-1/2 top-0 h-1 w-2/3 -translate-x-1/2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500" />

              <CardHeader className="px-6 pb-6 pt-9 sm:px-9">
                <div className="mb-5 flex justify-center">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 shadow-lg">
                      <UserPlus className="h-9 w-9 text-white" />
                    </div>

                    <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500">
                      <Crown className="h-3.5 w-3.5 text-white" />
                    </div>

                    <div className="absolute -bottom-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500">
                      <Star className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>

                <CardTitle
                  className={`
                    text-center
                    text-3xl
                    font-black
                    tracking-tight
                    ${primaryText}
                  `}
                >
                  Créer un compte
                </CardTitle>

                <CardDescription
                  className={`
                    mt-2
                    text-center
                    ${secondaryText}
                  `}
                >
                  Rejoignez-nous et découvrez une
                  nouvelle façon de gérer votre activité.
                </CardDescription>

                <div className="mt-5 flex items-center justify-center gap-4">
                  <SecurityBadge
                    icon={Shield}
                    text="Sécurisé"
                  />

                  <span
                    className={`h-1 w-1 rounded-full ${
                      isDark
                        ? "bg-white/20"
                        : "bg-slate-300"
                    }`}
                  />

                  <SecurityBadge
                    icon={KeyRound}
                    text="Chiffré"
                  />

                  <span
                    className={`h-1 w-1 rounded-full ${
                      isDark
                        ? "bg-white/20"
                        : "bg-slate-300"
                    }`}
                  />

                  <SecurityBadge
                    icon={Fingerprint}
                    text="Protégé"
                  />
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-8 px-6 sm:px-9">
                  {/* ---------------------------------------------------------- */}
                  {/* PERSONAL                                                     */}
                  {/* ---------------------------------------------------------- */}

                  <section className="space-y-5">
                    <SectionTitle
                      icon={
                        <User className="h-4 w-4 text-violet-500" />
                      }
                      title="Informations personnelles"
                      isDark={isDark}
                    />

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Field
                        id="firstName"
                        name="firstName"
                        label="Prénom"
                        placeholder="Jean"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                        labelClass={labelText}
                        inputClasses={inputClasses(
                          !!errors.firstName
                        )}
                      />

                      <Field
                        id="lastName"
                        name="lastName"
                        label="Nom"
                        placeholder="Dupont"
                        value={formData.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                        labelClass={labelText}
                        inputClasses={inputClasses(
                          !!errors.lastName
                        )}
                      />
                    </div>

                    {/* EMAIL */}

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className={`flex items-center gap-2 text-sm font-semibold ${labelText}`}
                      >
                        <Mail className="h-4 w-4 text-violet-500" />
                        Adresse email
                      </Label>

                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="exemple@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={validateEmail}
                        disabled={isEmailChecking}
                        className={inputClasses(
                          !!errors.email
                        )}
                      />

                      {errors.email && (
                        <ErrorMessage
                          message={errors.email}
                        />
                      )}

                      {isEmailChecking && (
                        <div className="flex items-center gap-2 text-xs text-violet-500">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" />
                          Vérification de l'email...
                        </div>
                      )}
                    </div>

                    {/* GENDER + PHONE */}

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="gender"
                          className={`text-sm font-semibold ${labelText}`}
                        >
                          Genre
                        </Label>

                        <Select
                          value={formData.gender}
                          onValueChange={
                            handleGenderChange
                          }
                        >
                          <SelectTrigger
                            className={`
                              h-12
                              rounded-xl
                              ${inputBackground}
                              ${inputBorder}
                              ${inputText}
                              focus:border-violet-500
                              focus:ring-2
                              focus:ring-violet-500/10
                              ${
                                errors.gender
                                  ? "border-red-400"
                                  : ""
                              }
                            `}
                          >
                            <SelectValue placeholder="Sélectionnez votre genre" />
                          </SelectTrigger>

                          <SelectContent
                            className={
                              isDark
                                ? "border-white/10 bg-slate-950 text-white"
                                : "border-slate-200 bg-white text-slate-900"
                            }
                          >
                            <SelectItem value="male">
                              Homme
                            </SelectItem>

                            <SelectItem value="female">
                              Femme
                            </SelectItem>

                            <SelectItem value="other">
                              Autre
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        {errors.gender && (
                          <ErrorMessage
                            message={errors.gender}
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className={`flex items-center gap-2 text-sm font-semibold ${labelText}`}
                        >
                          <Phone className="h-4 w-4 text-violet-500" />
                          Téléphone
                        </Label>

                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+33 6 12 34 56 78"
                          value={formData.phone}
                          onChange={handleChange}
                          className={inputClasses(
                            !!errors.phone
                          )}
                        />

                        {errors.phone && (
                          <ErrorMessage
                            message={errors.phone}
                          />
                        )}
                      </div>
                    </div>

                    {/* ADDRESS */}

                    <div className="space-y-2">
                      <Label
                        htmlFor="address"
                        className={`flex items-center gap-2 text-sm font-semibold ${labelText}`}
                      >
                        <MapPin className="h-4 w-4 text-violet-500" />
                        Adresse
                      </Label>

                      <Input
                        id="address"
                        name="address"
                        autoComplete="street-address"
                        placeholder="123 Rue de Paris, 75001 Paris"
                        value={formData.address}
                        onChange={handleChange}
                        className={inputClasses(
                          !!errors.address
                        )}
                      />

                      {errors.address && (
                        <ErrorMessage
                          message={errors.address}
                        />
                      )}
                    </div>
                  </section>

                  {/* ---------------------------------------------------------- */}
                  {/* SECURITY                                                     */}
                  {/* ---------------------------------------------------------- */}

                  <section className="space-y-5">
                    <SectionTitle
                      icon={
                        <Shield className="h-4 w-4 text-emerald-500" />
                      }
                      title="Sécurité du compte"
                      isDark={isDark}
                      emerald
                    />

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      {/* PASSWORD */}

                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className={`text-sm font-semibold ${labelText}`}
                        >
                          Mot de passe
                        </Label>

                        <PasswordInput
                          id="password"
                          name="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          error={errors.password}
                          className={`
                            h-12
                            rounded-xl
                            ${inputBackground}
                            ${inputBorder}
                            ${inputText}
                            focus:ring-2
                            focus:ring-violet-500/10
                          `}
                        />

                        {!isPasswordValid && (
                          <PasswordStrengthChecker
                            password={formData.password}
                            onValidityChange={
                              handlePasswordValidityChange
                            }
                          />
                        )}
                      </div>

                      {/* CONFIRM PASSWORD */}

                      <div className="space-y-2">
                        <Label
                          htmlFor="confirmPassword"
                          className={`text-sm font-semibold ${labelText}`}
                        >
                          Confirmer le mot de passe
                        </Label>

                        <PasswordInput
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="••••••••"
                          value={
                            formData.confirmPassword
                          }
                          onChange={handleChange}
                          error={
                            errors.confirmPassword
                          }
                          className={`
                            h-12
                            rounded-xl
                            ${inputBackground}
                            ${inputBorder}
                            ${inputText}
                            focus:ring-2
                            focus:ring-violet-500/10
                          `}
                        />

                        {formData.confirmPassword &&
                          formData.password ===
                            formData.confirmPassword && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                              <CircleCheck className="h-3.5 w-3.5" />
                              Les mots de passe
                              correspondent
                            </div>
                          )}
                      </div>
                    </div>
                  </section>

                  {/* ---------------------------------------------------------- */}
                  {/* TERMS                                                        */}
                  {/* ---------------------------------------------------------- */}

                  <section>
                    <div
                      className={`
                        flex
                        items-start
                        gap-3
                        rounded-2xl
                        border
                        p-4
                        ${
                          isDark
                            ? "border-white/10 bg-white/[0.03]"
                            : "border-slate-200 bg-slate-50"
                        }
                        ${
                          errors.acceptTerms
                            ? "border-red-400/60"
                            : ""
                        }
                      `}
                    >
                      <Checkbox
                        id="acceptTerms"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({
                            ...prev,
                            acceptTerms:
                              checked === true,
                          }));

                          if (errors.acceptTerms) {
                            setErrors((prev) => ({
                              ...prev,
                              acceptTerms: "",
                            }));
                          }
                        }}
                        className="
                          mt-0.5
                          border-violet-400/60
                          data-[state=checked]:border-violet-500
                          data-[state=checked]:bg-violet-500
                        "
                      />

                      <Label
                        htmlFor="acceptTerms"
                        className={`
                          cursor-pointer
                          text-sm
                          leading-relaxed
                          ${
                            errors.acceptTerms
                              ? "text-red-500"
                              : secondaryText
                          }
                        `}
                      >
                        J'accepte les{" "}
                        <Link
                          to="/terms"
                          className="font-semibold text-violet-500 hover:underline"
                        >
                          conditions générales
                        </Link>{" "}
                        d'utilisation et la{" "}
                        <Link
                          to="/privacy"
                          className="font-semibold text-violet-500 hover:underline"
                        >
                          politique de confidentialité
                        </Link>
                        .
                      </Label>
                    </div>

                    {errors.acceptTerms && (
                      <ErrorMessage
                        message={errors.acceptTerms}
                      />
                    )}
                  </section>
                </CardContent>

                {/* ------------------------------------------------------------ */}
                {/* FOOTER                                                        */}
                {/* ------------------------------------------------------------ */}

                <CardFooter className="flex flex-col gap-5 px-6 pb-9 pt-7 sm:px-9">
                  <Button
                    type="submit"
                    disabled={
                      !isFormValid || isSubmitting
                    }
                    className="
                      h-14
                      w-full
                      rounded-xl
                      bg-gradient-to-r
                      from-violet-600
                      via-fuchsia-600
                      to-blue-600
                      text-base
                      font-bold
                      text-white
                      shadow-lg
                      shadow-violet-500/20
                      transition-shadow
                      hover:shadow-xl
                      hover:shadow-violet-500/30
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <span className="flex items-center justify-center gap-3">
                      {isEmailChecking ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Vérification...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          Créer mon compte
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </span>
                  </Button>

                  <p
                    className={`text-center text-sm ${secondaryText}`}
                  >
                    Déjà membre ?{" "}
                    <Link
                      to="/login"
                      className="font-bold text-violet-500 hover:text-fuchsia-500"
                    >
                      Se connecter
                    </Link>
                  </p>
                </CardFooter>
              </form>

              <div className="absolute bottom-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
            </Card>
          </div>
        </div>
      </main>
    </Layout>
  );
};

/*
|--------------------------------------------------------------------------
| FIELD
|--------------------------------------------------------------------------
*/

interface FieldProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  error?: string;
  labelClass: string;
  inputClasses: string;
}

const Field: React.FC<FieldProps> = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  labelClass,
  inputClasses,
}) => {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className={`text-sm font-semibold ${labelClass}`}
      >
        {label}
      </Label>

      <Input
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={
          name === "firstName"
            ? "given-name"
            : "family-name"
        }
        className={inputClasses}
      />

      {error && <ErrorMessage message={error} />}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| SECTION TITLE
|--------------------------------------------------------------------------
*/

interface SectionTitleProps {
  icon: React.ReactNode;
  title: string;
  isDark: boolean;
  emerald?: boolean;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  icon,
  title,
  isDark,
  emerald = false,
}) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          ${
            emerald
              ? "border-emerald-500/20 bg-emerald-500/10"
              : "border-violet-500/20 bg-violet-500/10"
          }
        `}
      >
        {icon}
      </div>

      <div className="flex-1">
        <h3
          className={`
            text-base
            font-bold
            ${isDark ? "text-white" : "text-slate-900"}
          `}
        >
          {title}
        </h3>

        <div
          className={`
            mt-1
            h-px
            w-full
            bg-gradient-to-r
            ${
              emerald
                ? "from-emerald-500/30"
                : "from-violet-500/30"
            }
            to-transparent
          `}
        />
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| ERROR
|--------------------------------------------------------------------------
*/

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
}) => {
  return (
    <p className="flex items-center gap-2 text-xs font-medium text-red-500">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      {message}
    </p>
  );
};

/*
|--------------------------------------------------------------------------
| TRUST ITEM
|--------------------------------------------------------------------------
*/

interface TrustItemProps {
  icon: React.ElementType;
  text: string;
}

const TrustItem: React.FC<TrustItemProps> = ({
  icon: Icon,
  text,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-violet-500" />
      {text}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| SECURITY BADGE
|--------------------------------------------------------------------------
*/

interface SecurityBadgeProps {
  icon: React.ElementType;
  text: string;
}

const SecurityBadge: React.FC<SecurityBadgeProps> = ({
  icon: Icon,
  text,
}) => {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
      <Icon className="h-3.5 w-3.5 text-violet-500" />
      {text}
    </div>
  );
};

export default RegisterPage;