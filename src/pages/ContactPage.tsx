import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Shield,
  MessageCircle,
  ArrowRight,
  Headphones,
  Sparkles,
  Crown,
  Gem,
  Zap,
  Globe,
  Clock,
  Star,
  MessageSquare,
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { useMessages } from '@/hooks/use-messages';
import LiveChatVisitor from '@/components/livechat/LiveChatVisitor';
import SEOHead from '@/components/SEOHead';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://server-gestion-ventes.onrender.com';

const INITIAL_FORM = {
  expediteurNom: '',
  expediteurEmail: '',
  expediteurTelephone: '',
  sujet: '',
  contenu: '',
  destinataireId: '1',
};

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'vianey.jean@ymail.com',
    color: 'from-blue-500 to-purple-600',
  },
  {
    icon: Phone,
    label: 'Téléphone',
    value: '+262 00 00 00',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: MapPin,
    label: 'Adresse',
    value: 'Saint-Denis, La Réunion',
    color: 'from-violet-500 to-indigo-600',
  },
];

const STATS = [
  {
    icon: Shield,
    value: 'Sécurisé',
    label: 'Échanges protégés',
  },
  {
    icon: Clock,
    value: '24h',
    label: 'Délai de réponse',
  },
  {
    icon: Globe,
    value: 'Cloud',
    label: 'Accessible partout',
  },
];

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [liveAdminId, setLiveAdminId] = useState('1');
  const [submittedName, setSubmittedName] = useState('');

  const { toast } = useToast();
  const { sendMessage } = useMessages();

  // ---------------------------------------------------------
  // LOAD SAVED VISITOR NAME
  // ---------------------------------------------------------

  useEffect(() => {
    try {
      const savedName = localStorage.getItem('livechat_pseudo');

      if (savedName) {
        setSubmittedName(savedName);
      }
    } catch {
      // localStorage indisponible
    }
  }, []);

  // ---------------------------------------------------------
  // ADMIN STATUS
  // ---------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const checkAdminStatus = async () => {
      const controller = new AbortController();

      const timeout = window.setTimeout(() => {
        controller.abort();
      }, 5000);

      try {
        const response = await fetch(
          `${API_BASE}/api/messagerie/admin-status`,
          {
            method: 'GET',
            signal: controller.signal,
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error('Admin status unavailable');
        }

        const data = await response.json();

        if (!mounted) return;

        setAdminOnline(Boolean(data.online));

        if (data.adminId) {
          setLiveAdminId(String(data.adminId));
        }
      } catch {
        if (mounted) {
          setAdminOnline(false);
        }
      } finally {
        window.clearTimeout(timeout);
      }
    };

    checkAdminStatus();

    // 30 secondes au lieu de 10 secondes.
    // Beaucoup moins de requêtes inutiles.
    const interval = window.setInterval(
      checkAdminStatus,
      30000
    );

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  // ---------------------------------------------------------
  // INPUT
  // ---------------------------------------------------------

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubjectChange = (value: string) => {
    setFormData((previous) => ({
      ...previous,
      sujet: value,
    }));
  };

  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const name = formData.expediteurNom.trim();
    const email = formData.expediteurEmail.trim();
    const subject = formData.sujet.trim();
    const content = formData.contenu.trim();

    if (!name || !email || !subject || !content) {
      toast({
        title: 'Erreur',
        description:
          'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
        className: 'notification-erreur',
      });

      return;
    }

    setIsSubmitting(true);

    try {
      await sendMessage({
        ...formData,
        expediteurNom: name,
        expediteurEmail: email,
        sujet: subject,
        contenu: content,
      });

      try {
        localStorage.setItem('livechat_pseudo', name);
      } catch {
        // localStorage indisponible
      }

      setSubmittedName(name);
      setIsSubmitted(true);
      setFormData(INITIAL_FORM);

      toast({
        title: 'Message envoyé',
        description:
          'Votre message a été envoyé avec succès.',
      });
    } catch {
      toast({
        title: 'Erreur',
        description:
          "Une erreur s'est produite lors de l'envoi.",
        variant: 'destructive',
        className: 'notification-erreur',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // SUCCESS PAGE
  // ---------------------------------------------------------

  if (isSubmitted) {
    return (
      <Layout>
        <SEOHead
          title="Message envoyé"
          description="Votre message a été envoyé à l'équipe Gestion Vente."
          canonical="https://riziky-ventes.vercel.app/contact"
        />

        <main className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-[#02030a] sm:px-6">
          {/* Simple background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-xl">
            <Card className="overflow-hidden rounded-3xl border-slate-900/10 bg-white dark:border-white/10 dark:bg-[#0b0b14]">
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

              <CardContent className="px-6 py-10 text-center sm:px-10 sm:py-12">
                {/* Success icon */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-xl shadow-emerald-500/20">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>

                <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-100 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <span className="text-[10px] font-semibold text-slate-500 dark:text-white/50">
                    Message transmis avec succès
                  </span>
                </div>

                <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                  Message
                  <span className="block bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300">
                    envoyé !
                  </span>
                </h2>

                <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-slate-500 dark:text-white/45 sm:text-base">
                  Merci pour votre message. Notre équipe vous
                  répondra dans les plus brefs délais.
                </p>

                <div className="mt-8 space-y-3">
                  <Button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="h-14 w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Send className="mr-3 h-5 w-5" />
                    Envoyer un autre message
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setShowLiveChat(true)}
                    disabled={!adminOnline}
                    className={
                      adminOnline
                        ? 'h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 text-base font-bold text-white shadow-lg shadow-violet-500/20'
                        : 'h-14 w-full cursor-not-allowed rounded-2xl border border-slate-900/10 bg-slate-100 text-base font-bold text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white/30'
                    }
                  >
                    <MessageCircle className="mr-3 h-5 w-5" />

                    {adminOnline
                      ? 'Chat en direct'
                      : 'Chat hors ligne'}

                    {adminOnline && (
                      <span className="ml-2 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">
                        LIVE
                      </span>
                    )}
                  </Button>
                </div>

                <div className="mt-7 flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-white/30">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  Vos échanges sont traités de manière sécurisée.
                </div>
              </CardContent>
            </Card>
          </div>

          {showLiveChat && adminOnline && (
            <LiveChatVisitor
              visitorNom={submittedName || 'Visiteur'}
              adminId={liveAdminId}
              onClose={() => setShowLiveChat(false)}
            />
          )}
        </main>
      </Layout>
    );
  }

  // ---------------------------------------------------------
  // MAIN PAGE
  // ---------------------------------------------------------

  return (
    <Layout>
      <SEOHead
        title="Contact"
        description="Contactez l'équipe Gestion Vente. Support technique, partenariat ou consultation - nous répondons sous 24h."
        canonical="https://riziky-ventes.vercel.app/contact"
      />

      <main className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-[#02030a]">
        {/* ---------------------------------------------------
            LIGHT BACKGROUND
        --------------------------------------------------- */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-400/10 blur-3xl dark:bg-fuchsia-600/10" />

          <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-600/10" />

          <div className="absolute inset-0 opacity-30 dark:opacity-20 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:70px_70px]" />
        </div>

        {/* ---------------------------------------------------
            CONTENT
        --------------------------------------------------- */}

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          {/* -------------------------------------------------
              HEADER
          -------------------------------------------------- */}

          <header className="mb-10 text-center sm:mb-12">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-3 py-1.5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Gem className="h-3 w-3 text-white" />
              </span>

              <span className="text-xs font-semibold text-slate-700 dark:text-white/80">
                Premium Business Support
              </span>

              <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Parlons de votre
              <span className="block bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent dark:from-fuchsia-400 dark:via-violet-400 dark:to-cyan-300">
                projet.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-white/45 sm:text-base lg:text-lg">
              Une question ? Un projet ? Notre équipe est à
              votre disposition pour vous accompagner.
            </p>

            {/* Stats */}
            <div className="mt-7 flex flex-wrap justify-center gap-2 sm:gap-3">
              {STATS.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/5 sm:px-4 sm:py-2.5"
                  >
                    <Icon className="h-4 w-4 text-violet-600 dark:text-fuchsia-400" />

                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.value}
                      </div>

                      <div className="text-[10px] text-slate-500 dark:text-white/40">
                        {item.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </header>

          {/* -------------------------------------------------
              MAIN GRID
          -------------------------------------------------- */}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
            {/* ------------------------------------------------
                FORM
            ------------------------------------------------- */}

            <Card className="overflow-hidden rounded-3xl border-slate-900/10 bg-white dark:border-white/10 dark:bg-[#0b0b14]">
              <div className="h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500" />

              <CardHeader className="px-5 pb-5 pt-6 sm:px-8 sm:pt-8">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 shadow-lg shadow-violet-500/20">
                    <Mail className="h-7 w-7 text-white" />
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full border border-slate-900/10 bg-slate-100 px-2.5 py-1.5 dark:border-white/10 dark:bg-white/5">
                    <span
                      className={
                        adminOnline
                          ? 'h-1.5 w-1.5 rounded-full bg-emerald-500'
                          : 'h-1.5 w-1.5 rounded-full bg-slate-400'
                      }
                    />

                    <span className="text-[10px] font-semibold text-slate-500 dark:text-white/50">
                      {adminOnline
                        ? 'Équipe en ligne'
                        : 'Équipe disponible'}
                    </span>
                  </div>
                </div>

                <CardTitle className="mt-5 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Envoyez-nous un{' '}
                  <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent dark:from-fuchsia-400 dark:via-violet-400 dark:to-cyan-300">
                    message.
                  </span>
                </CardTitle>

                <CardDescription className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-white/45">
                  Chaque demande est traitée avec soin par notre
                  équipe.
                </CardDescription>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge
                    icon={Shield}
                    label="Sécurisé"
                  />

                  <Badge
                    icon={Zap}
                    label="Rapide"
                  />

                  <Badge
                    icon={Sparkles}
                    label="Premium"
                  />
                </div>
              </CardHeader>

              <CardContent className="px-5 pb-7 sm:px-8 sm:pb-8">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* Nom + Email */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <FormField
                      id="expediteurNom"
                      label="Nom complet *"
                      icon={Crown}
                    >
                      <Input
                        id="expediteurNom"
                        name="expediteurNom"
                        value={formData.expediteurNom}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        autoComplete="name"
                        required
                        className={INPUT_CLASS}
                      />
                    </FormField>

                    <FormField
                      id="expediteurEmail"
                      label="Email *"
                      icon={Mail}
                    >
                      <Input
                        id="expediteurEmail"
                        name="expediteurEmail"
                        type="email"
                        value={formData.expediteurEmail}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        autoComplete="email"
                        required
                        className={INPUT_CLASS}
                      />
                    </FormField>
                  </div>

                  {/* Téléphone */}
                  <FormField
                    id="expediteurTelephone"
                    label="Téléphone"
                    icon={Phone}
                  >
                    <Input
                      id="expediteurTelephone"
                      name="expediteurTelephone"
                      type="tel"
                      value={formData.expediteurTelephone}
                      onChange={handleChange}
                      placeholder="Votre numéro"
                      autoComplete="tel"
                      className={INPUT_CLASS}
                    />
                  </FormField>

                  {/* Sujet */}
                  <FormField
                    id="sujet"
                    label="Sujet *"
                    icon={MessageSquare}
                  >
                    <Select
                      value={formData.sujet}
                      onValueChange={handleSubjectChange}
                    >
                      <SelectTrigger className={INPUT_CLASS}>
                        <SelectValue placeholder="Choisissez le sujet" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Demande d'information">
                          💡 Information
                        </SelectItem>

                        <SelectItem value="Support technique">
                          🔧 Support technique
                        </SelectItem>

                        <SelectItem value="Partenariat">
                          🤝 Partenariat
                        </SelectItem>

                        <SelectItem value="Consultation">
                          👨‍💼 Consultation
                        </SelectItem>

                        <SelectItem value="Autre">
                          📧 Autre
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  {/* Message */}
                  <FormField
                    id="contenu"
                    label="Message *"
                    icon={MessageCircle}
                  >
                    <Textarea
                      id="contenu"
                      name="contenu"
                      value={formData.contenu}
                      onChange={handleChange}
                      placeholder="Décrivez votre demande..."
                      rows={6}
                      required
                      className={`${INPUT_CLASS} min-h-[150px] resize-none py-4`}
                    />
                  </FormField>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 text-base font-bold text-white shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="mr-3 h-5 w-5" />
                        Envoyer le message
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-center text-[10px] text-slate-400 dark:text-white/30">
                    <Shield className="h-3.5 w-3.5 shrink-0 text-emerald-500" />

                    <span>
                      Vos données sont protégées et traitées avec
                      confidentialité.
                    </span>

                    <Star className="h-3 w-3 shrink-0 text-amber-500" />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* ------------------------------------------------
                RIGHT COLUMN
            ------------------------------------------------- */}

            <aside className="space-y-6">
              {/* Contact information */}
              <Card className="overflow-hidden rounded-3xl border-slate-900/10 bg-white dark:border-white/10 dark:bg-[#0b0b14]">
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

                <CardHeader className="p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                      <Globe className="h-6 w-6 text-white" />
                    </div>

                    <div>
                      <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                        Nos coordonnées
                      </CardTitle>

                      <CardDescription className="mt-1 text-xs text-slate-500 dark:text-white/40">
                        Retrouvez-nous facilement.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
                  {CONTACT_INFO.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 rounded-2xl border border-slate-900/10 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5 sm:p-4"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color}`}
                        >
                          <Icon className="h-4 w-4 text-white" />
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-700 dark:text-white/75">
                            {item.label}
                          </div>

                          <div className="mt-0.5 break-words text-xs text-slate-500 dark:text-white/40">
                            {item.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="rounded-3xl border-slate-900/10 bg-white dark:border-white/10 dark:bg-[#0b0b14]">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                      <Headphones className="h-5 w-5 text-violet-600 dark:text-fuchsia-400" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Besoin d'aide ?
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
                        Notre équipe est là pour vous accompagner.
                      </p>
                    </div>
                  </div>

                  {adminOnline && (
                    <Button
                      type="button"
                      onClick={() => setShowLiveChat(true)}
                      className="mt-5 h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 text-sm font-bold text-white"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Démarrer le chat
                    </Button>
                  )}

                  {!adminOnline && (
                    <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-3 text-xs font-medium text-slate-500 dark:bg-white/5 dark:text-white/40">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      Chat actuellement hors ligne
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>

        {/* ---------------------------------------------------
            LIVE CHAT
        --------------------------------------------------- */}

        {showLiveChat && adminOnline && (
          <LiveChatVisitor
            visitorNom={submittedName || 'Visiteur'}
            adminId={liveAdminId}
            onClose={() => setShowLiveChat(false)}
          />
        )}
      </main>
    </Layout>
  );
};

// ============================================================
// SHARED STYLES
// ============================================================

const INPUT_CLASS =
  'h-14 w-full rounded-2xl border border-slate-900/10 bg-slate-100 px-4 text-slate-900 placeholder:text-slate-400 focus:border-violet-500/50 focus:bg-white focus:outline-none dark:border-white/[0.08] dark:bg-white/[0.045] dark:text-white dark:placeholder:text-white/20 dark:focus:border-fuchsia-400/50 dark:focus:bg-white/[0.07]';

// ============================================================
// BADGE
// ============================================================

interface BadgeProps {
  icon: React.ElementType;
  label: string;
}

const Badge: React.FC<BadgeProps> = ({
  icon: Icon,
  label,
}) => {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-slate-900/10 bg-slate-100 px-2.5 py-1.5 dark:border-white/[0.07] dark:bg-white/[0.035]">
      <Icon className="h-3 w-3 text-violet-600 dark:text-fuchsia-400" />

      <span className="text-[10px] font-semibold text-slate-500 dark:text-white/50">
        {label}
      </span>
    </div>
  );
};

// ============================================================
// FORM FIELD
// ============================================================

interface FormFieldProps {
  id: string;
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  icon: Icon,
  children,
}) => {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white/75"
      >
        <Icon className="h-4 w-4 text-violet-600 dark:text-fuchsia-400" />

        {label}
      </Label>

      {children}
    </div>
  );
};

export default ContactPage;