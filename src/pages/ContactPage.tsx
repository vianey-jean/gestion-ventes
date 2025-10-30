
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Globe, Shield, Sparkles } from 'lucide-react';
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
    destinataireId: '1' // ID de l'utilisateur par défaut (admin)
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
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await sendMessage(formData);
      
      setIsSubmitted(true);
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.",
      });

      // Reset form
      setFormData({
        expediteurNom: '',
        expediteurEmail: '',
        expediteurTelephone: '',
        sujet: '',
        contenu: '',
        destinataireId: '1'
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
     <Layout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-100 dark:from-emerald-900 dark:via-teal-900 dark:to-blue-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl">
          <CardContent className="pt-12 pb-10">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-2xl opacity-30"></div>
              <CheckCircle className="relative h-24 w-24 text-emerald-500 mx-auto animate-pulse" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Message Envoyé !
            </h2>
            <div className="text-slate-600 dark:text-slate-300 mb-8 text-lg leading-relaxed">
              Merci pour votre message. Notre équipe d'experts vous répondra dans les plus brefs délais avec une attention particulière.
            </div>
            <Button 
              onClick={() => setIsSubmitted(false)} 
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 text-lg font-semibold shadow-xl hover:shadow-emerald-500/25 transition-all duration-300"
            >
              <Send className="mr-3 h-5 w-5" />
              Envoyer un autre message
            </Button>
          </CardContent>
        </Card>
      </div>
       </Layout>
    );
  }

  return (
     <Layout>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16">
        {/* Header Premium */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="relative inline-block mb-4 sm:mb-6 md:mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-full blur-3xl opacity-20"></div>
           
              <motion.h1
                  initial={{ opacity: 0, y: 60, scale: 0.9 }}   // Apparition douce avec léger zoom
                  animate={{ opacity: 1, y: 0, scale: 1 }}      // Monte + grossit légèrement
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="text-5xl md:text-6xl font-extrabold 
                            bg-gradient-to-r from-purple-600 via-red-600 to-indigo-600 
                            bg-[length:200%_200%] animate-gradient 
                            bg-clip-text text-transparent mb-6 text-center text-3d"
                >
                  Contactez-nous
                </motion.h1>
          </div>
          <div className="max-w-3xl mx-auto px-3 sm:px-4">
            <div className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-6 sm:mb-8">
              Une question ? Un projet ? Notre équipe d'experts est à votre disposition pour vous accompagner dans votre réussite.
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8 text-xs sm:text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 shrink-0" />
                <span>Sécurisé & Confidentiel</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 shrink-0" />
                <span>Réponse sous 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 shrink-0" />
                <span>Service </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12 max-w-7xl mx-auto">
          {/* Formulaire de contact premium */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl">
              <CardHeader className="pb-4 sm:pb-6 md:pb-8 p-4 sm:p-6">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-lg sm:text-xl md:text-2xl">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg shrink-0">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                    Envoyez-nous un message
                  </span>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 mt-2 sm:mt-3">
                  Remplissez le formulaire ci-dessous. Chaque message est traité avec soin par notre équipe dédiée.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="expediteurNom" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                        Nom complet *
                      </Label>
                      <Input
                        id="expediteurNom"
                        name="expediteurNom"
                        value={formData.expediteurNom}
                        onChange={handleChange}
                        placeholder="Votre nom complet"
                        required
                        className="h-12 px-4 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 text-base"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="expediteurEmail" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                        Adresse email *
                      </Label>
                      <Input
                        id="expediteurEmail"
                        name="expediteurEmail"
                        type="email"
                        value={formData.expediteurEmail}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        required
                        className="h-12 px-4 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="expediteurTelephone" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                      Numéro de téléphone
                    </Label>
                    <Input
                      id="expediteurTelephone"
                      name="expediteurTelephone"
                      value={formData.expediteurTelephone}
                      onChange={handleChange}
                      placeholder="Votre numéro de téléphone"
                      className="h-12 px-4 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="sujet" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                      Sujet de votre demande *
                    </Label>
                    <Select onValueChange={(value) => handleSelectChange('sujet', value)} value={formData.sujet}>
                      <SelectTrigger className="h-12 px-4 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 text-base">
                        <SelectValue placeholder="Choisissez le sujet de votre demande" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl">
                        <SelectItem value="Demande d'information">💡 Demande d'information</SelectItem>
                        <SelectItem value="Support technique">🔧 Support technique</SelectItem>
                        <SelectItem value="Partenariat">🤝 Partenariat</SelectItem>
                        <SelectItem value="Consultation">👨‍💼 Consultation personnalisée</SelectItem>
                        <SelectItem value="Autre">📧 Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="contenu" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                      Votre message *
                    </Label>
                    <Textarea
                      id="contenu"
                      name="contenu"
                      value={formData.contenu}
                      onChange={handleChange}
                      placeholder="Décrivez votre demande en détail. Plus vous serez précis, mieux nous pourrons vous aider..."
                      rows={6}
                      required
                      className="p-4 bg-slate-50/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 text-base resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 rounded-xl"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="mr-3 h-5 w-5" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Informations de contact premium */}
          <div className="space-y-8">
            <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  Nos coordonnées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200/30 dark:border-blue-700/30">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100 text-base">Email :</div>
                    <div className="text-slate-600 dark:text-slate-300">vianey.jean@ymail.com</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200/30 dark:border-emerald-700/30">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100 text-base">Ligne Directe</div>
                    <div className="text-slate-600 dark:text-slate-300">+262 692 84 23 70</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200/30 dark:border-orange-700/30">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100 text-base">Siège Social</div>
                    <div className="text-slate-600 dark:text-slate-300">10 Allée des Béryls Bleus, 97400 Saint Denis</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  Horaires :
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-base">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-700/50 dark:to-blue-900/20 rounded-xl">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Lundi - Vendredi</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">8h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-700/50 dark:to-blue-900/20 rounded-xl">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Samedi</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">9h00 - 12h00</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50/50 to-pink-50/50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Dimanche</span>
                    <span className="text-red-600 dark:text-red-400 font-medium">Fermé</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carte de garantie premium */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-2xl border border-purple-200/30 dark:border-purple-700/30">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full blur-xl opacity-20"></div>
                  <Sparkles className="relative h-12 w-12 text-purple-600 mx-auto" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Garantie :
                </h3>
                <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Réponse garantie sous 24h avec un suivi personnalisé par nos experts.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    
  </Layout>
  );

};

export default ContactPage;
