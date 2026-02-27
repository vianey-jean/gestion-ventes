import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Globe, Shield, Sparkles, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { useMessages } from '@/hooks/use-messages';
import { motion } from "framer-motion";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    expediteurNom: '',
    expediteurEmail: '',
    expediteurTelephone: '',
    sujet: '',
    contenu: '',
    destinataireId: '1'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { toast } = useToast();
  const { sendMessage } = useMessages();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.expediteurNom || !formData.expediteurEmail || !formData.sujet || !formData.contenu) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive", className: "notification-erreur" });
      return;
    }
    setIsSubmitting(true);
    try {
      await sendMessage(formData);
      setIsSubmitted(true);
      toast({ title: "Message envoyé", description: "Votre message a été envoyé avec succès." });
      setFormData({ expediteurNom: '', expediteurEmail: '', expediteurTelephone: '', sujet: '', contenu: '', destinataireId: '1' });
    } catch (error) {
      toast({ title: "Erreur", description: "Une erreur s'est produite lors de l'envoi.", variant: "destructive", className: "notification-erreur" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950/50 to-teal-950 flex items-center justify-center p-4">
          {/* Glass orbs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
          </div>

          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Card className="w-full max-w-lg text-center border-0 bg-white/[0.06] backdrop-blur-2xl border border-white/[0.1] shadow-[0_32px_64px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden">
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
              <CardContent className="pt-12 pb-10">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl" />
                  <CheckCircle className="relative h-24 w-24 text-emerald-400 mx-auto drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
                </div>
                <h2 className="text-4xl font-extrabold text-white mb-4">Message Envoyé !</h2>
                <div className="text-emerald-200/50 mb-8 text-lg leading-relaxed">
                  Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
                </div>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-lg font-semibold shadow-[0_20px_40px_rgba(16,185,129,0.3)] border border-white/10 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <Send className="mr-3 h-5 w-5" />
                  Envoyer un autre message
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950/50 to-indigo-950 relative">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
          <motion.div animate={{ x: [0, -30, 0], y: [0, 20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[120px]" />
        </div>

        {/* Grid */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

        <div className="relative container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] backdrop-blur-xl rounded-full border border-white/[0.08] mb-6">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-purple-300/80">Contact Premium</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
            >
              Contactez-nous
            </motion.h1>

            <div className="max-w-3xl mx-auto px-3 sm:px-4">
              <div className="text-sm sm:text-base md:text-lg text-purple-200/40 leading-relaxed mb-6 sm:mb-8">
                Une question ? Un projet ? Notre équipe est à votre disposition.
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-purple-300/40">
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Sécurisé</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-purple-400/20 rounded-full" />
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  <span>Réponse sous 24h</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-purple-400/20 rounded-full" />
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Service Premium</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 max-w-7xl mx-auto">
            {/* Formulaire */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
              <Card className="border-0 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
                <div className="h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
                <CardHeader className="pb-4 sm:pb-6 md:pb-8 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl text-white">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-[0_8px_20px_rgba(59,130,246,0.3)] border border-white/10">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    Envoyez-nous un message
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-purple-200/40 mt-2">
                    Chaque message est traité avec soin par notre équipe dédiée.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="expediteurNom" className="text-sm font-semibold text-purple-200/70">Nom complet *</Label>
                        <Input id="expediteurNom" name="expediteurNom" value={formData.expediteurNom} onChange={handleChange} placeholder="Votre nom" required className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-purple-300/25 rounded-xl focus:bg-white/[0.08] focus:border-purple-400/30" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expediteurEmail" className="text-sm font-semibold text-purple-200/70">Email *</Label>
                        <Input id="expediteurEmail" name="expediteurEmail" type="email" value={formData.expediteurEmail} onChange={handleChange} placeholder="votre@email.com" required className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-purple-300/25 rounded-xl focus:bg-white/[0.08] focus:border-purple-400/30" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expediteurTelephone" className="text-sm font-semibold text-purple-200/70">Téléphone</Label>
                      <Input id="expediteurTelephone" name="expediteurTelephone" value={formData.expediteurTelephone} onChange={handleChange} placeholder="Votre numéro" className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-purple-300/25 rounded-xl focus:bg-white/[0.08] focus:border-purple-400/30" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sujet" className="text-sm font-semibold text-purple-200/70">Sujet *</Label>
                      <Select onValueChange={(value) => handleSelectChange('sujet', value)} value={formData.sujet}>
                        <SelectTrigger className="h-12 bg-white/[0.04] border-white/[0.08] text-white rounded-xl focus:bg-white/[0.08] focus:border-purple-400/30">
                          <SelectValue placeholder="Choisissez le sujet" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
                          <SelectItem value="Demande d'information">💡 Information</SelectItem>
                          <SelectItem value="Support technique">🔧 Support technique</SelectItem>
                          <SelectItem value="Partenariat">🤝 Partenariat</SelectItem>
                          <SelectItem value="Consultation">👨‍💼 Consultation</SelectItem>
                          <SelectItem value="Autre">📧 Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contenu" className="text-sm font-semibold text-purple-200/70">Message *</Label>
                      <Textarea id="contenu" name="contenu" value={formData.contenu} onChange={handleChange} placeholder="Décrivez votre demande..." rows={6} required className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-purple-300/25 rounded-xl focus:bg-white/[0.08] focus:border-purple-400/30 resize-none" />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500 text-white text-lg font-semibold shadow-[0_20px_40px_rgba(79,70,229,0.3)] rounded-xl border border-white/10 transition-all duration-300 hover:scale-[1.02]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2" />Envoi...</>
                      ) : (
                        <><Send className="mr-3 h-5 w-5" />Envoyer le message</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Infos contact */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
              <Card className="border-0 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg text-white">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-[0_8px_20px_rgba(16,185,129,0.3)] border border-white/10">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    Nos coordonnées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: Mail, label: 'Email :', value: 'vianey.jean@ymail.com', gradient: 'from-blue-500/10 to-purple-500/10', borderColor: 'border-blue-500/10', iconBg: 'from-blue-500 to-purple-600' },
                    { icon: Phone, label: 'Ligne Directe', value: '+225 0505050505', gradient: 'from-emerald-500/10 to-teal-500/10', borderColor: 'border-emerald-500/10', iconBg: 'from-emerald-500 to-teal-600' },
                    { icon: MapPin, label: 'Adresse', value: 'Abidjan, Côte d\'Ivoire', gradient: 'from-purple-500/10 to-indigo-500/10', borderColor: 'border-purple-500/10', iconBg: 'from-purple-500 to-indigo-600' },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-4 p-4 bg-gradient-to-r ${item.gradient} rounded-2xl border ${item.borderColor} transition-all duration-300 hover:bg-white/[0.03]`}>
                      <div className={`p-2.5 bg-gradient-to-br ${item.iconBg} rounded-xl shadow-lg border border-white/10`}>
                        <item.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-purple-100/80 text-sm">{item.label}</div>
                        <div className="text-purple-200/50 text-sm">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
