
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClientSync } from '@/hooks/useClientSync';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Phone, MapPin, Users, Sparkles, Crown, Star, Diamond } from 'lucide-react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ConfirmDeleteDialog from '@/components/dashboard/forms/ConfirmDeleteDialog';

interface Client {
  id: string;
  nom: string;
  phone: string;
  adresse: string;
  dateCreation: string;
}

const ClientsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { clients, isLoading, refetch } = useClientSync();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    phone: '',
    adresse: ''
  });

  // Dialogues de confirmation
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

  const resetForm = () => {
    setFormData({ nom: '', phone: '', adresse: '' });
    setEditingClient(null);
  };

  const handleAddClient = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setFormData({
      nom: client.nom,
      phone: client.phone,
      adresse: client.adresse
    });
    setEditingClient(client);
    setIsAddDialogOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim() || !formData.phone.trim() || !formData.adresse.trim()) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    if (editingClient) {
      setShowEditConfirm(true);
    } else {
      setShowAddConfirm(true);
    }
  };

  const confirmAdd = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_BASE_URL}/api/clients`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: "Succès", 
        description: "Client ajouté avec succès",
        className: "notification-success",
      });
      
      setIsAddDialogOpen(false);
      setShowAddConfirm(false);
      resetForm();
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmEdit = async () => {
    if (!editingClient) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/api/clients/${editingClient.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: "Succès",
        description: "Client mis à jour avec succès",
        className: "notification-success",
      });
      
      setIsAddDialogOpen(false);
      setShowEditConfirm(false);
      resetForm();
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/clients/${clientToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: "Succès",
        description: "Client supprimé avec succès", 
        className: "notification-success",
      });
      
      setShowDeleteConfirm(false);
      setClientToDelete(null);
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin mx-auto"></div>
            <Diamond className="w-10 h-10 text-purple-600 dark:text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-6 text-gray-700 dark:text-gray-200 font-semibold text-lg">Chargement de votre portefeuille premium...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-950">
      <Navbar />
      <ScrollToTop />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 dark:from-purple-800 dark:via-violet-800 dark:to-indigo-800">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Particules flottantes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-4 h-4 bg-yellow-300/30 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-6 h-6 bg-pink-300/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-32 left-40 w-5 h-5 bg-blue-300/30 rounded-full animate-pulse"></div>
          <div className="absolute top-60 left-1/2 w-3 h-3 bg-green-300/30 rounded-full animate-bounce"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="relative">
                <Crown className="w-16 h-16 text-yellow-300 animate-pulse" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text">
                Portefeuille <span className="text-transparent bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 bg-clip-text animate-pulse">Élite</span>
              </h1>
              <div className="relative">
                <Diamond className="w-16 h-16 text-purple-200 animate-spin-slow" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
              </div>
            </div>
            
            <p className="text-2xl text-purple-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Gérez vos clients VIP avec une sophistication et une élégance incomparables
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-emerald-300" />
                  <span className="text-white font-bold text-xl">{clients.length} Client{clients.length > 1 ? 's' : ''} Premium</span>
                </div>
              </div>
              
              <Button 
                onClick={handleAddClient} 
                className="group bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 text-black font-bold px-10 py-6 rounded-2xl shadow-2xl hover:shadow-yellow-500/30 transform hover:-translate-y-2 transition-all duration-500 border-2 border-yellow-300/50"
              >
                <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-lg">Nouveau Client Élite</span>
                <Sparkles className="w-6 h-6 ml-3 group-hover:scale-125 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 max-w-7xl">
        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {clients.map((client, index) => (
            <Card 
              key={client.id} 
              className="group hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 hover:rotate-1 bg-gradient-to-br from-white via-gray-50 to-purple-50/30 dark:from-gray-800 dark:via-gray-900 dark:to-purple-900/30 backdrop-blur-sm border-0 shadow-xl hover:shadow-purple-500/25 relative overflow-hidden"
              style={{
                animationDelay: `${index * 150}ms`
              }}
            >
              {/* Premium Badge animé */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-black text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 animate-bounce">
                <Star className="w-3 h-3 inline mr-1" />
                ÉLITE
              </div>
              
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Halo lumineux */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                      {client.nom}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <span className="inline-flex items-center gap-1">
                        <Crown className="w-3 h-3 text-yellow-500" />
                        Membre depuis le {new Date(client.dateCreation).toLocaleDateString('fr-FR')}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClient(client)}
                      className="h-10 w-10 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full hover:scale-110 transition-transform duration-200"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClient(client)}
                      className="h-10 w-10 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full hover:scale-110 transition-transform duration-200"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 rounded-xl border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-200 font-semibold">{client.phone}</span>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-lg mt-0.5">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-2">{client.adresse}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State Ultra Premium */}
        {clients.length === 0 && (
          <div className="text-center py-32">
            <div className="relative inline-flex items-center justify-center w-48 h-48 bg-gradient-to-br from-purple-100 via-violet-100 to-indigo-100 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-indigo-900/20 rounded-full mb-16 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full animate-ping"></div>
              <Users className="w-24 h-24 text-purple-600 dark:text-purple-400 relative z-10" />
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Votre Empire Clientèle vous attend
            </h3>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-3xl mx-auto leading-relaxed">
              Commencez à construire votre réseau exclusif de clients VIP avec notre système de gestion ultra-premium
            </p>
            
            <Button 
              onClick={handleAddClient} 
              className="group bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white text-xl px-16 py-8 rounded-2xl shadow-2xl hover:shadow-purple-500/30 transform hover:-translate-y-3 transition-all duration-500 border-2 border-purple-400/30"
            >
              <Crown className="w-8 h-8 mr-4 group-hover:rotate-12 transition-transform duration-300" />
              Créer votre Premier Client Élite
              <Sparkles className="w-8 h-8 ml-4 group-hover:scale-125 transition-transform duration-300" />
            </Button>
          </div>
        )}
      </div>

      <Footer />
      
      {/* Dialog Principal */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingClient ? 'Modifier le client' : 'Nouveau client'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {editingClient ? 'Modifiez les informations du client.' : 'Ajoutez un nouveau client à votre portefeuille.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nom complet</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Nom et prénom"
                  className="border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ex: 0692123456"
                  className="border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adresse" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Adresse</Label>
                <Input
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  placeholder="Adresse complète"
                  className="border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
                className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {editingClient ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogues de confirmation */}
      <Dialog open={showAddConfirm} onOpenChange={setShowAddConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer l'ajout</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment ajouter ce client à votre portefeuille ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddConfirm(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={confirmAdd} disabled={isSubmitting}>
              {isSubmitting ? 'Ajout...' : 'Oui, ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditConfirm} onOpenChange={setShowEditConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la modification</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment modifier les informations de ce client ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditConfirm(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={confirmEdit} disabled={isSubmitting}>
              {isSubmitting ? 'Modification...' : 'Oui, modifier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setClientToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        description={`Voulez-vous vraiment supprimer ${clientToDelete?.nom} de votre portefeuille ?`}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ClientsPage;
