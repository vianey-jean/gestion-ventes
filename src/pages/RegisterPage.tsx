import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

import { Checkbox } from "@/components/ui/checkbox";

import { useToast } from "@/hooks/use-toast";

import PasswordInput from "@/components/PasswordInput";
import PasswordStrengthChecker from "@/components/PasswordStrengthChecker";
import Layout from "@/components/Layout";
import PremiumLoading from "@/components/ui/premium-loading";
import SEOHead from "@/components/SEOHead";
import { useLightMotion } from "@/hooks/useLightMotion";

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

import {
  motion,
  AnimatePresence,
} from "framer-motion";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { light, particleCount } = useLightMotion();

  const {
    register,
    checkEmail,
  } = useAuth();

  const { toast } = useToast();

  /*
   * ==========================================================================
   * THEME
   * ==========================================================================
   *
   * IMPORTANT :
   *
   * Le thème n'est PAS géré ici.
   *
   * Le Navbar/Layout existant ajoute ou retire :
   *
   * document.documentElement.classList.add("dark")
   *
   * ou
   *
   * document.documentElement.classList.remove("dark")
   *
   * Cette page observe simplement cette modification.
   */

  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }

    return document.documentElement.classList.contains(
      "dark"
    );
  });

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const updateTheme = () => {
      setIsDark(
        document.documentElement.classList.contains(
          "dark"
        )
      );
    };

    // Vérification initiale
    updateTheme();

    /*
     * On observe les changements sur <html>.
     *
     * Lorsque le bouton de la navbar fait :
     *
     * <html class="dark">
     *
     * ou enlève "dark",
     *
     * RegisterPage est automatiquement actualisée.
     */
    const observer = new MutationObserver(
      (mutations) => {
        for (const mutation of mutations) {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class"
          ) {
            updateTheme();
          }
        }
      }
    );

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: ["class"],
      }
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * ==========================================================================
   * FORM DATA
   * ==========================================================================
   */

  const [formData, setFormData] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      gender: "",
      address: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    });

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [isEmailChecking, setIsEmailChecking] =
    useState(false);

  const [isEmailValid, setIsEmailValid] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isPasswordValid, setIsPasswordValid] =
    useState(false);

  const [showPasswordChecker, setShowPasswordChecker] =
    useState(true);

  /*
   * ==========================================================================
   * HANDLE INPUT
   * ==========================================================================
   */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
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

  /*
   * ==========================================================================
   * SELECT
   * ==========================================================================
   */

  const handleSelectChange = (
    value: string
  ) => {
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
   * ==========================================================================
   * EMAIL VALIDATION
   * ==========================================================================
   */

  const validateEmail = async () => {
    if (!formData.email) {
      setIsEmailValid(true);
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email:
          "Veuillez entrer un email valide",
      }));

      setIsEmailValid(false);

      return;
    }

    setIsEmailChecking(true);

    try {
      const emailExists =
        await checkEmail(
          formData.email
        );

      if (emailExists) {
        setErrors((prev) => ({
          ...prev,
          email:
            "Cet email est déjà utilisé",
        }));

        setIsEmailValid(false);

        toast({
          title: "Email déjà utilisé",
          description:
            "Veuillez utiliser une autre adresse email.",
          variant: "destructive",
        });
      } else {
        setIsEmailValid(true);

        setErrors((prev) => ({
          ...prev,
          email: "",
        }));
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'email:",
        error
      );
    } finally {
      setIsEmailChecking(false);
    }
  };

  /*
   * ==========================================================================
   * EMAIL DEBOUNCE
   * ==========================================================================
   */

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (
        formData.email &&
        formData.email.includes("@")
      ) {
        validateEmail();
      }
    }, 600);

    return () => {
      clearTimeout(debounce);
    };
  }, [formData.email]);

  /*
   * ==========================================================================
   * PASSWORD VALIDATION
   * ==========================================================================
   */

  const validatePassword = () => {
    const hasLowerCase =
      /[a-z]/.test(
        formData.password
      );

    const hasUpperCase =
      /[A-Z]/.test(
        formData.password
      );

    const hasNumber =
      /[0-9]/.test(
        formData.password
      );

    const hasSpecialChar =
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
        formData.password
      );

    const hasMinLength =
      formData.password.length >= 6;

    return (
      hasLowerCase &&
      hasUpperCase &&
      hasNumber &&
      hasSpecialChar &&
      hasMinLength
    );
  };

  /*
   * ==========================================================================
   * PHONE VALIDATION
   * ==========================================================================
   */

  const validatePhone = (
    phone: string
  ) => {
    const cleaned =
      phone.trim();

    const regex =
      /^[0-9+\-\s()]{6,20}$/;

    return regex.test(cleaned);
  };

  /*
   * ==========================================================================
   * PASSWORD CALLBACK
   * ==========================================================================
   */

  const handlePasswordValidityChange =
    (isValid: boolean) => {
      setIsPasswordValid(
        isValid
      );

      setShowPasswordChecker(
        !isValid
      );
    };

  /*
   * ==========================================================================
   * SUBMIT
   * ==========================================================================
   */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setErrors({});
    setIsSubmitting(true);

    const newErrors: Record<
      string,
      string
    > = {};

    if (!formData.firstName) {
      newErrors.firstName =
        "Le prénom est requis";
    }

    if (!formData.lastName) {
      newErrors.lastName =
        "Le nom est requis";
    }

    if (!formData.email) {
      newErrors.email =
        "L'email est requis";
    }

    if (!formData.gender) {
      newErrors.gender =
        "Le genre est requis";
    }

    if (!formData.address) {
      newErrors.address =
        "L'adresse est requise";
    }

    if (!formData.phone) {
      newErrors.phone =
        "Le téléphone est requis";
    }

    if (!formData.password) {
      newErrors.password =
        "Le mot de passe est requis";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "La confirmation du mot de passe est requise";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms =
        "Vous devez accepter les conditions";
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      formData.email &&
      !emailRegex.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Veuillez entrer un email valide";
    }

    if (
      formData.phone &&
      !validatePhone(
        formData.phone
      )
    ) {
      newErrors.phone =
        "Veuillez entrer un numéro de téléphone valide.";
    }

    if (
      formData.password &&
      !validatePassword()
    ) {
      newErrors.password =
        "Le mot de passe ne répond pas aux exigences de sécurité";
    }

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !==
        formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Les mots de passe ne correspondent pas";
    }

    if (
      Object.keys(newErrors)
        .length > 0
    ) {
      setErrors(
        newErrors
      );

      setIsSubmitting(false);

      return;
    }

    if (!isEmailValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      const success =
        await register({
          email: formData.email,
          password:
            formData.password,
          confirmPassword:
            formData.confirmPassword,
          firstName:
            formData.firstName,
          lastName:
            formData.lastName,
          gender:
            formData.gender as
              | "male"
              | "female"
              | "other",
          address:
            formData.address,
          phone:
            formData.phone.trim(),
          acceptTerms:
            formData.acceptTerms,
        });

      if (success) {
        toast({
          title:
            "Compte créé avec succès !",
          description:
            "Vous pouvez maintenant vous connecter avec vos identifiants.",
          className:
            "bg-emerald-600 text-white border-emerald-600",
        });

        navigate("/login");
      }
    } catch (error: any) {
      console.error(
        "Erreur lors de l'inscription:",
        error
      );

      const apiData =
        error?.response?.data;

      const apiDetails =
        Array.isArray(
          apiData?.details
        )
          ? apiData.details.join(
              " • "
            )
          : null;

      const message =
        apiData?.message ||
        apiDetails ||
        "Une erreur s'est produite lors de la création du compte";

      toast({
        title:
          "Erreur d'inscription",
        description:
          message,
        variant:
          "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ==========================================================================
   * FORM VALID
   * ==========================================================================
   */

  const isFormValid =
    Boolean(
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
        Object.keys(errors).filter(
          (key) =>
            errors[key]
        ).length === 0
    );

  /*
   * ==========================================================================
   * LOADING
   * ==========================================================================
   */

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

  /*
   * ==========================================================================
   * THEME CLASSES
   * ==========================================================================
   */

  const pageBackground =
    isDark
      ? "bg-[#05050a]"
      : "bg-[#f6f7fb]";

  const primaryText =
    isDark
      ? "text-white"
      : "text-slate-900";

  const secondaryText =
    isDark
      ? "text-slate-300/70"
      : "text-slate-600";

  const mutedText =
    isDark
      ? "text-slate-400/60"
      : "text-slate-500";

  const cardBackground =
    isDark
      ? "bg-white/[0.065]"
      : "bg-white/85";

  const cardBorder =
    isDark
      ? "border-white/[0.10]"
      : "border-slate-200/80";

  const inputBackground =
    isDark
      ? "bg-white/[0.045]"
      : "bg-white";

  const inputBorder =
    isDark
      ? "border-white/[0.10]"
      : "border-slate-200";

  const inputText =
    isDark
      ? "text-white placeholder:text-slate-500"
      : "text-slate-900 placeholder:text-slate-400";

  const labelText =
    isDark
      ? "text-slate-200/80"
      : "text-slate-700";

  /*
   * ==========================================================================
   * INPUT CLASSES
   * ==========================================================================
   */

  const inputClasses = (
    hasError: boolean
  ) => `
    relative
    h-12
    w-full
    rounded-xl
    ${inputBackground}
    ${inputBorder}
    ${inputText}
    shadow-sm
    transition-all
    duration-300
    hover:border-violet-400/40
    focus:border-violet-400/70
    focus:ring-4
    focus:ring-violet-500/10
    focus:bg-white/[0.08]
    ${
      hasError
        ? "border-red-400/70 focus:border-red-400 focus:ring-red-500/10"
        : ""
    }
  `;

  /*
   * ==========================================================================
   * FEATURES
   * ==========================================================================
   */

  const features = [
    {
      icon: BarChart3,
      label: "Dashboard",
      desc: "Vue globale",
      color:
        "from-violet-500 to-purple-600",
    },
    {
      icon: Users,
      label: "Clients",
      desc: "Gestion CRM",
      color:
        "from-blue-500 to-cyan-500",
    },
    {
      icon: Package,
      label: "Inventaire",
      desc: "Stock temps réel",
      color:
        "from-emerald-500 to-teal-500",
    },
    {
      icon: TrendingUp,
      label: "Rapports",
      desc: "Analyses avancées",
      color:
        "from-pink-500 to-rose-500",
    },
  ];

  /*
   * ==========================================================================
   * RETURN
   * ==========================================================================
   */

  return (
    <Layout>
      <SEOHead
        title="Inscription"
        description="Créer un compte sur Gestion Vente"
      />

      <div
        className={`
          relative
          min-h-screen
          overflow-hidden
          transition-colors
          duration-700
          ${pageBackground}
        `}
      >
        {/* ================================================================== */}
        {/* BACKGROUND                                                         */}
        {/* ================================================================== */}

        <AnimatePresence mode="wait">
          <motion.div
            key={
              isDark
                ? "dark"
                : "light"
            }
            initial={{
              opacity: 0,
            }}
            animate={light ? undefined : {
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="pointer-events-none absolute inset-0"
          >
            {isDark ? (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(124,58,237,0.20),transparent_28%),radial-gradient(circle_at_85%_70%,rgba(236,72,153,0.14),transparent_30%),radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_45%)]" />

                <div className="absolute inset-0 bg-gradient-to-br from-[#080812] via-[#0b0818] to-[#05050a]" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(124,58,237,0.10),transparent_28%),radial-gradient(circle_at_85%_70%,rgba(236,72,153,0.08),transparent_30%),radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.06),transparent_45%)]" />

                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-violet-50/60" />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ================================================================== */}
        {/* ORBS                                                               */}
        {/* ================================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={light ? undefined : {
              x: [0, 80, 0],
              y: [0, -50, 0],
              scale: [
                1,
                1.12,
                1,
              ],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`
              absolute
              -left-32
              -top-32
              h-[420px]
              w-[420px]
              rounded-full
              blur-[100px]
              ${
                isDark
                  ? "bg-violet-600/20"
                  : "bg-violet-400/20"
              }
            `}
          />

          <motion.div
            animate={light ? undefined : {
              x: [0, -100, 0],
              y: [0, 60, 0],
              scale: [
                1,
                1.18,
                1,
              ],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`
              absolute
              -bottom-40
              -right-32
              h-[520px]
              w-[520px]
              rounded-full
              blur-[110px]
              ${
                isDark
                  ? "bg-fuchsia-600/15"
                  : "bg-pink-400/15"
              }
            `}
          />

          <motion.div
            animate={light ? undefined : {
              x: [
                0,
                50,
                -30,
                0,
              ],
              y: [
                0,
                -40,
                30,
                0,
              ],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`
              absolute
              left-1/2
              top-1/2
              h-[600px]
              w-[600px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              blur-[130px]
              ${
                isDark
                  ? "bg-blue-600/8"
                  : "bg-blue-400/8"
              }
            `}
          />

          {/* Particles */}
          {Array.from({
            length: particleCount,
          }).map(
            (_, index) => (
              <motion.span
                key={index}
                animate={{
                  y: [
                    0,
                    -35,
                    0,
                  ],
                  x: [
                    0,
                    index % 2
                      ? 12
                      : -12,
                    0,
                  ],
                  opacity: [
                    0.1,
                    0.65,
                    0.1,
                  ],
                  scale: [
                    0.8,
                    1.2,
                    0.8,
                  ],
                }}
                transition={{
                  duration:
                    5 +
                    (index % 6),
                  repeat: Infinity,
                  delay:
                    index * 0.25,
                  ease: "easeInOut",
                }}
                className={`
                  absolute
                  h-1
                  w-1
                  rounded-full
                  ${
                    isDark
                      ? "bg-violet-300"
                      : "bg-violet-500"
                  }
                `}
                style={{
                  left: `${
                    5 +
                    ((index *
                      7) %
                      90)
                  }%`,
                  top: `${
                    8 +
                    ((index *
                      13) %
                      85)
                  }%`,
                }}
              />
            )
          )}
        </div>

        {/* ================================================================== */}
        {/* GRID                                                                */}
        {/* ================================================================== */}

        <div
          className={`
            pointer-events-none
            absolute
            inset-0
            bg-[linear-gradient(rgba(120,100,180,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(120,100,180,0.5)_1px,transparent_1px)]
            bg-[size:64px_64px]
            ${
              isDark
                ? "opacity-[0.035]"
                : "opacity-[0.045]"
            }
          `}
        />

        {/* ================================================================== */}
        {/* MAIN                                                                */}
        {/* ================================================================== */}

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 35,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.9,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
            className="w-full max-w-7xl"
          >
            <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              {/* ============================================================ */}
              {/* LEFT                                                           */}
              {/* ============================================================ */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: -40,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.2,
                  duration: 0.8,
                }}
                className="hidden lg:block"
              >
                {/* Badge */}
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.35,
                  }}
                  className={`
                    mb-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    px-4
                    py-2
                    backdrop-blur-xl
                    ${
                      isDark
                        ? "border-violet-400/20 bg-violet-500/10 text-violet-300"
                        : "border-violet-200 bg-violet-50 text-violet-700"
                    }
                  `}
                >
                  <motion.span
                    animate={{
                      scale: [
                        1,
                        1.35,
                        1,
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="h-2 w-2 rounded-full bg-emerald-400"
                  />

                  <Sparkles className="h-3.5 w-3.5" />

                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                    Nouvelle génération
                  </span>
                </motion.div>

                {/* Title */}
                <h1
                  className={`
                    mb-6
                    text-5xl
                    font-black
                    leading-[1.05]
                    tracking-[-0.04em]
                    xl:text-6xl
                    ${primaryText}
                  `}
                >
                  Gérez votre
                  activité
                  <span className="block">
                    avec{" "}
                    <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 bg-clip-text text-transparent">
                      élégance.
                    </span>
                  </span>
                </h1>

                <p
                  className={`
                    mb-9
                    max-w-xl
                    text-lg
                    leading-relaxed
                    ${secondaryText}
                  `}
                >
                  Une plateforme moderne
                  pour gérer vos ventes,
                  vos clients, votre
                  inventaire et vos
                  performances depuis une
                  interface unique.
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3">
                  {features.map(
                    (
                      item,
                      index
                    ) => {
                      const Icon =
                        item.icon;

                      return (
                        <motion.div
                          key={
                            item.label
                          }
                          initial={{
                            opacity: 0,
                            y: 20,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay:
                              0.45 +
                              index *
                                0.1,
                          }}
                          whileHover={{
                            y: -6,
                            scale: 1.025,
                          }}
                          className={`
                            group
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            p-4
                            backdrop-blur-xl
                            transition-all
                            duration-500
                            ${
                              isDark
                                ? "border-white/[0.08] bg-white/[0.045] hover:border-violet-400/30 hover:bg-white/[0.07]"
                                : "border-slate-200 bg-white/70 hover:border-violet-300 hover:bg-white"
                            }
                          `}
                        >
                          <div
                            className={`
                              absolute
                              inset-0
                              bg-gradient-to-br
                              ${item.color}
                              opacity-0
                              transition-opacity
                              duration-500
                              group-hover:opacity-[0.06]
                            `}
                          />

                          <div
                            className={`
                              relative
                              mb-3
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-xl
                              bg-gradient-to-br
                              ${item.color}
                              shadow-lg
                            `}
                          >
                            <Icon className="h-5 w-5 text-white" />
                          </div>

                          <p
                            className={`
                              relative
                              text-sm
                              font-bold
                              ${primaryText}
                            `}
                          >
                            {
                              item.label
                            }
                          </p>

                          <p
                            className={`
                              relative
                              mt-1
                              text-xs
                              ${mutedText}
                            `}
                          >
                            {
                              item.desc
                            }
                          </p>
                        </motion.div>
                      );
                    }
                  )}
                </div>

                {/* Trust */}
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 1,
                  }}
                  className="mt-8 flex flex-wrap gap-5"
                >
                  {[
                    {
                      icon: LockKeyhole,
                      text: "Données sécurisées",
                    },
                    {
                      icon: Zap,
                      text: "Rapide & moderne",
                    },
                    {
                      icon: Globe2,
                      text: "Accessible partout",
                    },
                  ].map(
                    (item) => {
                      const Icon =
                        item.icon;

                      return (
                        <div
                          key={
                            item.text
                          }
                          className={`
                            flex
                            items-center
                            gap-2
                            text-xs
                            ${mutedText}
                          `}
                        >
                          <Icon className="h-3.5 w-3.5 text-violet-500" />
                          {
                            item.text
                          }
                        </div>
                      );
                    }
                  )}
                </motion.div>
              </motion.div>

              {/* ============================================================ */}
              {/* RIGHT                                                           */}
              {/* ============================================================ */}

              <div className="relative w-full">
                {/* Outer aura */}
                <motion.div
                  animate={{
                    opacity: [
                      0.25,
                      0.55,
                      0.25,
                    ],
                    scale: [
                      0.98,
                      1.015,
                      0.98,
                    ],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    absolute
                    -inset-5
                    rounded-[2.5rem]
                    bg-gradient-to-r
                    from-violet-500/20
                    via-fuchsia-500/15
                    to-blue-500/20
                    blur-2xl
                  "
                />

                {/* Rotating halo */}
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="
                    pointer-events-none
                    absolute
                    -inset-3
                    rounded-[2rem]
                    bg-[conic-gradient(from_0deg,transparent,rgba(139,92,246,0.45),transparent,rgba(236,72,153,0.35),transparent)]
                    opacity-50
                  "
                />

                <Card
                  className={`
                    relative
                    overflow-hidden
                    rounded-[2rem]
                    border
                    backdrop-blur-2xl
                    shadow-2xl
                    transition-all
                    duration-700
                    ${cardBackground}
                    ${cardBorder}
                    ${
                      isDark
                        ? "shadow-black/40"
                        : "shadow-slate-300/40"
                    }
                  `}
                >
                  {/* Glass reflection */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-x-0
                      top-0
                      h-40
                      bg-gradient-to-b
                      from-white/[0.10]
                      to-transparent
                    "
                  />

                  {/* Moving shimmer */}
                  <motion.div
                    animate={{
                      x: [
                        "-100%",
                        "200%",
                      ],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut",
                    }}
                    className="
                      pointer-events-none
                      absolute
                      top-0
                      h-px
                      w-1/2
                      bg-gradient-to-r
                      from-transparent
                      via-white/70
                      to-transparent
                    "
                  />

                  {/* ====================================================== */}
                  {/* HEADER                                                    */}
                  {/* ====================================================== */}

                  <CardHeader className="relative px-6 pb-6 pt-9 sm:px-9">
                    <motion.div
                      initial={{
                        scale: 0,
                        rotate: -90,
                      }}
                      animate={{
                        scale: 1,
                        rotate: 0,
                      }}
                      transition={{
                        delay: 0.4,
                        duration: 0.7,
                        type: "spring",
                        bounce: 0.45,
                      }}
                      className="mb-5 flex justify-center"
                    >
                      <div className="relative">
                        {/* rotating ring */}
                        <motion.div
                          animate={{
                            rotate: 360,
                          }}
                          transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="
                            absolute
                            -inset-3
                            rounded-[1.6rem]
                            border
                            border-dashed
                            border-violet-400/30
                          "
                        />

                        {/* icon */}
                        <motion.div
                          animate={{
                            scale: [
                              1,
                              1.06,
                              1,
                            ],
                            boxShadow: [
                              "0 0 20px rgba(139,92,246,.15)",
                              "0 0 45px rgba(139,92,246,.35)",
                              "0 0 20px rgba(139,92,246,.15)",
                            ],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                          }}
                          className="
                            relative
                            flex
                            h-20
                            w-20
                            items-center
                            justify-center
                            rounded-[1.5rem]
                            border
                            border-white/20
                            bg-gradient-to-br
                            from-violet-500
                            via-purple-600
                            to-fuchsia-600
                            shadow-2xl
                          "
                        >
                          <UserPlus className="h-9 w-9 text-white" />
                        </motion.div>

                        {/* crown */}
                        <motion.div
                          animate={{
                            rotate: 360,
                          }}
                          transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="
                            absolute
                            -right-3
                            -top-3
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-full
                            bg-gradient-to-br
                            from-amber-300
                            to-orange-500
                            shadow-lg
                          "
                        >
                          <Crown className="h-3.5 w-3.5 text-white" />
                        </motion.div>

                        {/* star */}
                        <motion.div
                          animate={{
                            scale: [
                              1,
                              1.25,
                              1,
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                          className="
                            absolute
                            -bottom-2
                            -left-2
                            flex
                            h-6
                            w-6
                            items-center
                            justify-center
                            rounded-full
                            bg-gradient-to-br
                            from-pink-400
                            to-rose-500
                          "
                        >
                          <Star className="h-3 w-3 text-white" />
                        </motion.div>
                      </div>
                    </motion.div>

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
                        text-sm
                        ${secondaryText}
                      `}
                    >
                      Rejoignez-nous et
                      découvrez une
                      nouvelle façon de
                      gérer votre activité.
                    </CardDescription>

                    {/* Security badges */}
                    <div className="mt-5 flex items-center justify-center gap-4">
                      {[
                        {
                          icon: Shield,
                          text: "Sécurisé",
                        },
                        {
                          icon: KeyRound,
                          text: "Chiffré",
                        },
                        {
                          icon: Fingerprint,
                          text: "Protégé",
                        },
                      ].map(
                        (
                          item,
                          index
                        ) => {
                          const Icon =
                            item.icon;

                          return (
                            <React.Fragment
                              key={
                                item.text
                              }
                            >
                              {index >
                                0 && (
                                <span
                                  className={`
                                    h-1
                                    w-1
                                    rounded-full
                                    ${
                                      isDark
                                        ? "bg-white/20"
                                        : "bg-slate-300"
                                    }
                                  `}
                                />
                              )}

                              <div
                                className={`
                                  flex
                                  items-center
                                  gap-1.5
                                  text-[11px]
                                  font-medium
                                  ${mutedText}
                                `}
                              >
                                <Icon className="h-3.5 w-3.5 text-violet-500" />

                                {
                                  item.text
                                }
                              </div>
                            </React.Fragment>
                          );
                        }
                      )}
                    </div>
                  </CardHeader>

                  {/* ====================================================== */}
                  {/* FORM                                                      */}
                  {/* ====================================================== */}

                  <form
                    onSubmit={
                      handleSubmit
                    }
                  >
                    <CardContent className="relative space-y-8 px-6 sm:px-9">
                      {/* ================================================== */}
                      {/* PERSONAL INFORMATION                                  */}
                      {/* ================================================== */}

                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 15,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: 0.55,
                        }}
                        className="space-y-5"
                      >
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
                            value={
                              formData.firstName
                            }
                            onChange={
                              handleChange
                            }
                            error={
                              errors.firstName
                            }
                            labelClass={
                              labelText
                            }
                            inputClasses={inputClasses(
                              !!errors.firstName
                            )}
                          />

                          <Field
                            id="lastName"
                            name="lastName"
                            label="Nom"
                            placeholder="Dupont"
                            value={
                              formData.lastName
                            }
                            onChange={
                              handleChange
                            }
                            error={
                              errors.lastName
                            }
                            labelClass={
                              labelText
                            }
                            inputClasses={inputClasses(
                              !!errors.lastName
                            )}
                          />
                        </div>

                        {/* EMAIL */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className={`
                              flex
                              items-center
                              gap-2
                              text-sm
                              font-semibold
                              ${labelText}
                            `}
                          >
                            <Mail className="h-4 w-4 text-violet-500" />

                            Adresse email
                          </Label>

                          <AnimatedInputWrapper>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              autoComplete="email"
                              placeholder="exemple@email.com"
                              value={
                                formData.email
                              }
                              onChange={
                                handleChange
                              }
                              onBlur={
                                validateEmail
                              }
                              disabled={
                                isEmailChecking
                              }
                              className={inputClasses(
                                !!errors.email
                              )}
                            />
                          </AnimatedInputWrapper>

                          <AnimatePresence>
                            {errors.email && (
                              <ErrorMessage
                                message={
                                  errors.email
                                }
                              />
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {isEmailChecking && (
                              <motion.span
                                initial={{
                                  opacity: 0,
                                  y: -5,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                exit={{
                                  opacity: 0,
                                }}
                                className="flex items-center gap-2 text-xs text-violet-500"
                              >
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" />

                                Vérification de
                                l'email...
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* GENDER + PHONE */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label
                              htmlFor="gender"
                              className={`
                                text-sm
                                font-semibold
                                ${labelText}
                              `}
                            >
                              Genre
                            </Label>

                            <Select
                              value={
                                formData.gender
                              }
                              onValueChange={
                                handleSelectChange
                              }
                            >
                              <SelectTrigger
                                className={`
                                  h-12
                                  rounded-xl
                                  ${inputBackground}
                                  ${inputBorder}
                                  ${inputText}
                                  transition-all
                                  duration-300
                                  focus:border-violet-400/60
                                  focus:ring-4
                                  focus:ring-violet-500/10
                                  ${
                                    errors.gender
                                      ? "border-red-400/70"
                                      : ""
                                  }
                                `}
                              >
                                <SelectValue placeholder="Sélectionnez votre genre" />
                              </SelectTrigger>

                              <SelectContent
                                className={`
                                  border
                                  backdrop-blur-xl
                                  ${
                                    isDark
                                      ? "border-white/10 bg-slate-950/95 text-white"
                                      : "border-slate-200 bg-white/95 text-slate-900"
                                  }
                                `}
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
                                message={
                                  errors.gender
                                }
                              />
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="phone"
                              className={`
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-semibold
                                ${labelText}
                              `}
                            >
                              <Phone className="h-4 w-4 text-violet-500" />

                              Téléphone
                            </Label>

                            <AnimatedInputWrapper>
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                placeholder="+33 6 12 34 56 78"
                                value={
                                  formData.phone
                                }
                                onChange={
                                  handleChange
                                }
                                className={inputClasses(
                                  !!errors.phone
                                )}
                              />
                            </AnimatedInputWrapper>

                            {errors.phone && (
                              <ErrorMessage
                                message={
                                  errors.phone
                                }
                              />
                            )}
                          </div>
                        </div>

                        {/* ADDRESS */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="address"
                            className={`
                              flex
                              items-center
                              gap-2
                              text-sm
                              font-semibold
                              ${labelText}
                            `}
                          >
                            <MapPin className="h-4 w-4 text-violet-500" />

                            Adresse
                          </Label>

                          <AnimatedInputWrapper>
                            <Input
                              id="address"
                              name="address"
                              autoComplete="street-address"
                              placeholder="123 Rue de Paris, 75001 Paris"
                              value={
                                formData.address
                              }
                              onChange={
                                handleChange
                              }
                              className={inputClasses(
                                !!errors.address
                              )}
                            />
                          </AnimatedInputWrapper>

                          {errors.address && (
                            <ErrorMessage
                              message={
                                errors.address
                              }
                            />
                          )}
                        </div>
                      </motion.div>

                      {/* ================================================== */}
                      {/* SECURITY                                              */}
                      {/* ================================================== */}

                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 15,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: 0.7,
                        }}
                        className="space-y-5"
                      >
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
                              className={`
                                text-sm
                                font-semibold
                                ${labelText}
                              `}
                            >
                              Mot de passe
                            </Label>

                            <PasswordInput
                              id="password"
                              name="password"
                              placeholder="••••••••"
                              value={
                                formData.password
                              }
                              onChange={
                                handleChange
                              }
                              error={
                                errors.password
                              }
                              className={`
                                h-12
                                rounded-xl
                                ${inputBackground}
                                ${inputBorder}
                                ${inputText}
                                focus:ring-4
                                focus:ring-violet-500/10
                              `}
                            />

                            <AnimatePresence>
                              {showPasswordChecker && (
                                <motion.div
                                  initial={{
                                    opacity: 0,
                                    height: 0,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    height: "auto",
                                  }}
                                  exit={{
                                    opacity: 0,
                                    height: 0,
                                  }}
                                >
                                  <PasswordStrengthChecker
                                    password={
                                      formData.password
                                    }
                                    onValidityChange={
                                      handlePasswordValidityChange
                                    }
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* CONFIRM PASSWORD */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="confirmPassword"
                              className={`
                                text-sm
                                font-semibold
                                ${labelText}
                              `}
                            >
                              Confirmer le
                              mot de passe
                            </Label>

                            <PasswordInput
                              id="confirmPassword"
                              name="confirmPassword"
                              placeholder="••••••••"
                              value={
                                formData.confirmPassword
                              }
                              onChange={
                                handleChange
                              }
                              error={
                                errors.confirmPassword
                              }
                              className={`
                                h-12
                                rounded-xl
                                ${inputBackground}
                                ${inputBorder}
                                ${inputText}
                                focus:ring-4
                                focus:ring-violet-500/10
                              `}
                            />

                            {formData.confirmPassword &&
                              formData.password ===
                                formData.confirmPassword && (
                                <motion.div
                                  initial={{
                                    opacity: 0,
                                    x: -5,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    x: 0,
                                  }}
                                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-500"
                                >
                                  <CircleCheck className="h-3.5 w-3.5" />

                                  Les mots de
                                  passe
                                  correspondent
                                </motion.div>
                              )}
                          </div>
                        </div>
                      </motion.div>

                      {/* ================================================== */}
                      {/* TERMS                                                 */}
                      {/* ================================================== */}

                      <motion.div
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        transition={{
                          delay: 0.85,
                        }}
                      >
                        <motion.div
                          whileHover={{
                            scale: 1.005,
                          }}
                          className={`
                            flex
                            items-start
                            gap-3
                            rounded-2xl
                            border
                            p-4
                            transition-all
                            duration-300
                            ${
                              isDark
                                ? "border-white/[0.07] bg-white/[0.035] hover:bg-white/[0.05]"
                                : "border-slate-200 bg-slate-50/70 hover:bg-white"
                            }
                            ${
                              errors.acceptTerms
                                ? "border-red-400/50"
                                : ""
                            }
                          `}
                        >
                          <Checkbox
                            id="acceptTerms"
                            name="acceptTerms"
                            checked={
                              formData.acceptTerms
                            }
                            onCheckedChange={(
                              checked
                            ) => {
                              setFormData(
                                (prev) => ({
                                  ...prev,
                                  acceptTerms:
                                    checked as boolean,
                                })
                              );

                              if (
                                errors.acceptTerms
                              ) {
                                setErrors(
                                  (prev) => ({
                                    ...prev,
                                    acceptTerms:
                                      "",
                                  })
                                );
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
                              className="
                                font-semibold
                                text-violet-500
                                underline-offset-4
                                hover:underline
                              "
                            >
                              conditions
                              générales
                            </Link>{" "}
                            d'utilisation et
                            la{" "}
                            <Link
                              to="/privacy"
                              className="
                                font-semibold
                                text-violet-500
                                underline-offset-4
                                hover:underline
                              "
                            >
                              politique de
                              confidentialité
                            </Link>
                            .
                          </Label>
                        </motion.div>

                        {errors.acceptTerms && (
                          <ErrorMessage
                            message={
                              errors.acceptTerms
                            }
                          />
                        )}
                      </motion.div>
                    </CardContent>

                    {/* ==================================================== */}
                    {/* FOOTER                                                  */}
                    {/* ==================================================== */}

                    <CardFooter className="relative flex flex-col gap-5 px-6 pb-9 pt-7 sm:px-9">
                      <motion.div
                        whileHover={
                          isFormValid
                            ? {
                                scale: 1.015,
                              }
                            : {}
                        }
                        whileTap={
                          isFormValid
                            ? {
                                scale: 0.985,
                              }
                            : {}
                        }
                        className="w-full"
                      >
                        <Button
                          type="submit"
                          disabled={
                            !isFormValid ||
                            isSubmitting
                          }
                          className="
                            group
                            relative
                            h-14
                            w-full
                            overflow-hidden
                            rounded-xl
                            border
                            border-white/10
                            bg-gradient-to-r
                            from-violet-600
                            via-fuchsia-600
                            to-blue-600
                            text-base
                            font-bold
                            text-white
                            shadow-[0_20px_45px_rgba(124,58,237,0.25)]
                            transition-all
                            duration-500
                            hover:shadow-[0_25px_60px_rgba(124,58,237,0.4)]
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                          "
                        >
                          {/* Button shimmer */}
                          <motion.span
                            animate={{
                              x: [
                                "-150%",
                                "150%",
                              ],
                            }}
                            transition={{
                              duration: 2.8,
                              repeat: Infinity,
                              repeatDelay: 2,
                              ease: "easeInOut",
                            }}
                            className="
                              absolute
                              inset-y-0
                              w-1/3
                              -skew-x-12
                              bg-gradient-to-r
                              from-transparent
                              via-white/20
                              to-transparent
                            "
                          />

                          <span className="relative flex items-center justify-center gap-3">
                            {isEmailChecking ? (
                              <>
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                Vérification...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />

                                Créer mon
                                compte

                                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                              </>
                            )}
                          </span>
                        </Button>
                      </motion.div>

                      <div className="text-center">
                        <p
                          className={`
                            text-sm
                            ${secondaryText}
                          `}
                        >
                          Déjà membre ?{" "}
                          <Link
                            to="/login"
                            className="
                              font-bold
                              text-violet-500
                              transition-colors
                              hover:text-fuchsia-500
                            "
                          >
                            Se connecter
                          </Link>
                        </p>
                      </div>
                    </CardFooter>
                  </form>

                  {/* Bottom glow */}
                  <div
                    className="
                      absolute
                      bottom-0
                      left-1/2
                      h-px
                      w-2/3
                      -translate-x-1/2
                      bg-gradient-to-r
                      from-transparent
                      via-violet-500/60
                      to-transparent
                    "
                  />
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

/*
|--------------------------------------------------------------------------
| ANIMATED INPUT WRAPPER
|--------------------------------------------------------------------------
*/

interface AnimatedInputWrapperProps {
  children: React.ReactNode;
}

const AnimatedInputWrapper: React.FC<
  AnimatedInputWrapperProps
> = ({ children }) => {
  return (
    <div className="group relative">
      <div
        className="
          pointer-events-none
          absolute
          -inset-[1px]
          rounded-xl
          bg-gradient-to-r
          from-violet-500/30
          via-fuchsia-500/20
          to-blue-500/30
          opacity-0
          blur-[2px]
          transition-all
          duration-300
          group-focus-within:opacity-100
        "
      />

      <div className="relative">
        {children}
      </div>
    </div>
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
        className={`
          text-sm
          font-semibold
          ${labelClass}
        `}
      >
        {label}
      </Label>

      <AnimatedInputWrapper>
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
      </AnimatedInputWrapper>

      {error && (
        <ErrorMessage
          message={error}
        />
      )}
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

const SectionTitle: React.FC<
  SectionTitleProps
> = ({
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
            ${
              isDark
                ? "text-white"
                : "text-slate-900"
            }
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
| ERROR MESSAGE
|--------------------------------------------------------------------------
*/

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<
  ErrorMessageProps
> = ({ message }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -5,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -5,
      }}
      className="
        flex
        items-center
        gap-2
        text-xs
        font-medium
        text-red-500
      "
    >
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

      {message}
    </motion.div>
  );
};

export default RegisterPage;