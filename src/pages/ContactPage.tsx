import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react';

const ContactPage: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      toast({
        title: "Message envoyé",
        description: "Nous vous répondrons dans les plus brefs délais.",
        className: "notification-success",
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      
      setIsSubmitting(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <Layout>
        <PremiumLoading 
          text="Chargement du Contact"
          size="lg"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }

  // Show loading during form submission
  if (isSubmitting) {
    return (
      <Layout>
        <PremiumLoading 
          text="Envoi du message..."
          size="md"
          overlay={true}
          variant="default"
        />
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-slate-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 py-24">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-4 h-4 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-20 w-2 h-2 bg-white rounded-full animate-ping"></div>
            <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-white rounded-full animate-bounce"></div>
          </div>
          
          <div className="relative container mx-auto px-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <MessageCircle className="h-4 w-4 mr-2" />
              Nous sommes là pour vous aider
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Contactez-nous
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Votre avis compte. Partagez vos questions, suggestions ou demandes d'assistance.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Info Cards */}
              <div className="lg:col-span-1 space-y-6">
                <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notre Bureau</h3>
                      <p className="text-purple-600 dark:text-purple-400">Visitez-nous</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    123 Rue de Commerce<br />
                    75001 Paris, France
                  </p>
                </div>

                <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Email</h3>
                      <p className="text-blue-600 dark:text-blue-400">Écrivez-nous</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">contact@gestion-vente.com</p>
                </div>

                <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Phone className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Téléphone</h3>
                      <p className="text-green-600 dark:text-green-400">Appelez-nous</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">+33 1 23 45 67 89</p>
                </div>

                {/* Horaires */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white">
                  <div className="flex items-center mb-6">
                    <Clock className="h-8 w-8 mr-3" />
                    <h3 className="text-xl font-bold">Horaires d'ouverture</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Lundi - Vendredi</span>
                      <span className="text-indigo-100">9h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Samedi</span>
                      <span className="text-indigo-100">9h00 - 12h00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Dimanche</span>
                      <span className="text-indigo-100">Fermé</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      Envoyez-nous un message
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      Remplissez le formulaire et nous vous répondrons rapidement
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Nom complet
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Votre nom"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="h-14 bg-white/50 dark:bg-gray-700/50 border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 focus:ring-4 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="votre@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="h-14 bg-white/50 dark:bg-gray-700/50 border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 focus:ring-4 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="subject" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Sujet
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Sujet de votre message"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="h-14 bg-white/50 dark:bg-gray-700/50 border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 focus:ring-4 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="message" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Votre message détaillé..."
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="bg-white/50 dark:bg-gray-700/50 border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 focus:ring-4 transition-all duration-200 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-16 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                      disabled={isSubmitting}
                    >
                      <Send className="h-5 w-5" />
                      Envoyer le message
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
