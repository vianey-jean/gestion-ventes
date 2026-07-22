/**
 * ClientsPage - Page de gestion des clients (refactorisée en sous-composants).
 * Fonctionnalités : recherche, tri par nom, filtre fidélité, filtre ville,
 * ajout/édition/suppression avec confirmations, actions téléphone / adresse,
 * gestion des doublons, fusion, gestion des villes, détail & fidélité.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClientSync } from '@/hooks/useClientSync';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Users } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import Layout from '@/components/Layout';
import PremiumLoading from '@/components/ui/premium-loading';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';

import { clientsVillesApi } from '@/services/api/villesApi';
import fideliteApiService, { FideliteEntry } from '@/services/api/fideliteApi';

import ConfirmDeleteDialog from '@/components/dashboard/forms/ConfirmDeleteDialog';
import ClientDetailModal from '@/components/clients/ClientDetailModal';
import ClientPhotoZoomModal from '@/components/clients/ClientPhotoZoomModal';
import ClientMergeModal from '@/components/clients/ClientMergeModal';
import DuplicateClientModal from '@/components/clients/DuplicateClientModal';
import CitiesManagerModal from '@/components/clients/CitiesManagerModal';
import ClientFilterBar, { FidelityTier } from '@/components/clients/ClientFilterBar';
import ClientPhoneActionModal from '@/components/clients/ClientPhoneActionModal';
import ClientAddressActionModal from '@/components/clients/ClientAddressActionModal';
import ClientConfirmDialogs from '@/components/clients/ClientConfirmDialogs';
import ClientFormDialog, { ClientFormData } from '@/components/clients/ClientFormDialog';
import ClientPagination from '@/components/clients/ClientPagination';
import ClientCardItem from '@/components/clients/ClientCardItem';
import FideliteListModal from '@/components/clients/FideliteListModal';

import { ClientHero, ClientSearchSection } from './clients';

import { findMatchingClients, type ClientMatch } from '@/utils/clientMatch';

interface Client {
  id: string;
  nom: string;
  phone: string;
  phones: string[];
  adresse: string;
  addresses?: string[];
  ville?: string;
  villes?: string[];
  dateCreation: string;
  photo?: string;
}

const norm = (s: string) => (s || '').trim().toLowerCase();

const ClientsPage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { isAuthenticated } = useAuth();
  const { clients, isLoading, refetch } = useClientSync();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // États principaux
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({ nom: '', phones: [''], addresses: [''], ville: '', villes: [''] });
  const [availableVilles, setAvailableVilles] = useState<string[]>([]);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [clientSortDir, setClientSortDir] = useState<'asc' | 'desc'>('asc');
  const [tierFilter, setTierFilter] = useState<FidelityTier | null>(null);
  const [villeFilter, setVilleFilter] = useState<string | null>(null);

  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const [phoneActionOpen, setPhoneActionOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState('');
  const [addressActionOpen, setAddressActionOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');

  const [zoomPhoto, setZoomPhoto] = useState<{ url: string; name: string } | null>(null);
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [isVillesOpen, setIsVillesOpen] = useState(false);
  const [isFideliteListOpen, setIsFideliteListOpen] = useState(false);

  const [detailClient, setDetailClient] = useState<Client | null>(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<ClientMatch[]>([]);

  const [fideliteMap, setFideliteMap] = useState<Record<string, FideliteEntry>>({});

  const photoInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

  // Charger villes disponibles pour le formulaire
  useEffect(() => {
    if (isAddDialogOpen) {
      clientsVillesApi.getAll().then(setAvailableVilles).catch(() => setAvailableVilles([]));
    }
  }, [isAddDialogOpen]);

  // Charger la fidélité (utilisé pour le filtre) — rechargée aussi quand les
  // paliers (listes-fidelite.json) sont modifiés, car le backend recalcule
  // fidelite.json à chaque changement.
  useEffect(() => {
    const load = () => fideliteApiService.getAll().then(setFideliteMap).catch(() => setFideliteMap({}));
    load();
    const onSales = () => load();
    window.addEventListener('sales-updated', onSales);
    window.addEventListener('listes-fidelite-updated', onSales);
    return () => {
      window.removeEventListener('sales-updated', onSales);
      window.removeEventListener('listes-fidelite-updated', onSales);
    };
  }, []);


  // Photo handling
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setRemoveExistingPhoto(false);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemoveExistingPhoto(Boolean(editingClient?.photo));
    if (photoInputRef.current) photoInputRef.current.value = '';
  };
  const getClientPhotoUrl = (client: Client) => (client.photo ? `${API_BASE_URL}${client.photo}` : null);

  // Handlers téléphone/adresse
  const handlePhoneClick = (phone: string) => { setSelectedPhone(phone); setPhoneActionOpen(true); };
  const handleCall = () => { window.location.href = `tel:${selectedPhone}`; setPhoneActionOpen(false); };
  const handleMessage = () => {
    if (isMobile) window.location.href = `sms:${selectedPhone}`;
    else toast({ title: 'Message', description: `Préparez un message pour ${selectedPhone}`, className: 'notification-success' });
    setPhoneActionOpen(false);
  };
  const handleAddressClick = (address: string) => {
    if (isMobile) { setSelectedAddress(address); setAddressActionOpen(true); }
    else window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };
  const openGoogleMaps = () => { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAddress)}`, '_blank'); setAddressActionOpen(false); };
  const openWaze = () => { window.open(`https://waze.com/ul?q=${encodeURIComponent(selectedAddress)}`, '_blank'); setAddressActionOpen(false); };
  const openAppleMaps = () => { window.open(`https://maps.apple.com/?q=${encodeURIComponent(selectedAddress)}`, '_blank'); setAddressActionOpen(false); };

  // Filtrage
  const filteredClients = useMemo(() => {
    let result = searchQuery.length >= 3
      ? clients.filter(c =>
          c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.phones || []).some(p => p.includes(searchQuery)) ||
          c.phone?.includes(searchQuery) ||
          c.adresse.toLowerCase().includes(searchQuery.toLowerCase()))
      : [...clients];

    if (tierFilter) {
      result = result.filter(c => {
        const entry = fideliteMap[norm(c.nom)];
        const tier = entry?.tier || 'nouveau';
        return tier === tierFilter;
      });
    }

    if (villeFilter) {
      const vf = villeFilter.toLowerCase();
      result = result.filter(c => {
        const villes: string[] = Array.isArray((c as any).villes) ? (c as any).villes : [];
        if (villes.some(v => (v || '').toLowerCase() === vf)) return true;
        if (((c as any).ville || '').toLowerCase() === vf) return true;
        return false;
      });
    }

    result.sort((a, b) => {
      const cmp = a.nom.localeCompare(b.nom, 'fr');
      return clientSortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [clients, searchQuery, clientSortDir, tierFilter, villeFilter, fideliteMap]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  useEffect(() => { setCurrentPage(1); }, [searchQuery, tierFilter, villeFilter]);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage]);

  // CRUD
  const resetForm = () => {
    setFormData({ nom: '', phones: [''], addresses: [''], ville: '', villes: [''] });
    setEditingClient(null); setPhotoFile(null); setPhotoPreview(null); setRemoveExistingPhoto(false);
  };
  const handleAddClient = () => { resetForm(); setIsAddDialogOpen(true); };
  const handleEditClient = (client: Client) => {
    const phones = client.phones && client.phones.length > 0 ? client.phones : [client.phone || ''];
    const addresses = client.addresses && client.addresses.length > 0 ? client.addresses : [client.adresse || ''];
    const rawVilles = Array.isArray((client as any).villes) ? (client as any).villes : [];
    const villes = addresses.map((_, i) => (rawVilles[i] !== undefined ? rawVilles[i] : (i === 0 ? ((client as any).ville || '') : '')));
    setFormData({ nom: client.nom, phones, addresses, ville: villes[0] || '', villes });
    setEditingClient(client);
    setPhotoFile(null);
    setPhotoPreview(client.photo ? getClientPhotoUrl(client) : null);
    setRemoveExistingPhoto(false);
    setIsAddDialogOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validPhones = formData.phones.filter(p => p.trim());
    const validAddresses = formData.addresses.filter(a => a.trim());
    if (!formData.nom.trim() || validPhones.length === 0 || validAddresses.length === 0) {
      toast({ title: 'Erreur', description: 'Le nom, au moins un téléphone et une adresse sont obligatoires', variant: 'destructive', className: 'notification-erreur' });
      return;
    }
    if (editingClient) { setShowEditConfirm(true); return; }
    const matches = findMatchingClients(clients as any, { nom: formData.nom, phones: validPhones, addresses: validAddresses });
    if (matches.length > 0) { setDuplicateMatches(matches); setDuplicateModalOpen(true); return; }
    setShowAddConfirm(true);
  };

  const buildFormData = () => {
    const fd = new FormData();
    const validAddresses: string[] = [];
    const validVilles: string[] = [];
    formData.addresses.forEach((a, i) => {
      if (a.trim()) { validAddresses.push(a); validVilles.push((formData.villes[i] || '').trim()); }
    });
    const validPhones = formData.phones.filter(p => p.trim());
    fd.append('nom', formData.nom);
    fd.append('phones', JSON.stringify(validPhones));
    fd.append('addresses', JSON.stringify(validAddresses));
    fd.append('adresse', validAddresses[0] || '');
    fd.append('villes', JSON.stringify(validVilles));
    fd.append('ville', (validVilles[0] || formData.ville || '').trim());
    if (photoFile) fd.append('photo', photoFile);
    if (editingClient && removeExistingPhoto && !photoFile) fd.append('removePhoto', 'true');
    return fd;
  };

  const persistNewVilles = async () => {
    const known = new Set(availableVilles.map(v => v.toLowerCase()));
    const toAdd = (formData.villes || []).map(v => (v || '').trim()).filter(v => v && !known.has(v.toLowerCase()));
    for (const v of toAdd) { try { await clientsVillesApi.add(v); } catch {} }
  };

  const confirmAdd = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await persistNewVilles();
      const fd = buildFormData();
      await axios.post(`${API_BASE_URL}/api/clients`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      toast({ title: 'Succès', description: 'Client ajouté avec succès', className: 'notification-success' });
      setIsAddDialogOpen(false); setShowAddConfirm(false); resetForm(); refetch();
    } catch {
      toast({ title: 'Erreur', description: "Une erreur est survenue lors de l'ajout", variant: 'destructive', className: 'notification-erreur' });
    } finally { setIsSubmitting(false); }
  };

  const confirmEdit = async () => {
    if (!editingClient) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await persistNewVilles();
      const fd = buildFormData();
      await axios.put(`${API_BASE_URL}/api/clients/${editingClient.id}`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      toast({ title: 'Succès', description: 'Client mis à jour avec succès', className: 'notification-success' });
      setIsAddDialogOpen(false); setShowEditConfirm(false); resetForm(); refetch();
    } catch {
      toast({ title: 'Erreur', description: 'Une erreur est survenue lors de la modification', variant: 'destructive', className: 'notification-erreur' });
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteClient = (client: Client) => { setClientToDelete(client); setShowDeleteConfirm(true); };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/clients/${clientToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: 'Succès', description: 'Client supprimé avec succès', className: 'notification-success' });
      setShowDeleteConfirm(false); setClientToDelete(null); refetch();
    } catch {
      toast({ title: 'Erreur', description: 'Erreur lors de la suppression', variant: 'destructive', className: 'notification-erreur' });
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) {
    if (embedded) return <PremiumLoading text="Bienvenue sur Listes des Clients" size="xl" overlay={false} variant="default" />;
    return <Layout><PremiumLoading text="Bienvenue sur Listes des Clients" size="xl" overlay={true} variant="default" /></Layout>;
  }

  const mainContent = (
    <>
      <SEOHead title="Clients" description="Gestion des clients - Liste et suivi des clients" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/50 dark:from-[#030014] dark:via-[#0a0020]/80 dark:to-[#0e0030]">
        {!embedded && <Navbar />}
        {!embedded && <ScrollToTop />}

        <ClientHero
          clientCount={clients.length}
          onAddClient={handleAddClient}
          onMergeClient={() => setIsMergeOpen(true)}
          onShowVilles={() => setIsVillesOpen(true)}
          onShowFidelites={() => setIsFideliteListOpen(true)}
        />


        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-20 max-w-7xl">
          <ClientSearchSection
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredCount={filteredClients.length}
          />

          {/* Barre de tri + filtres */}
          <ClientFilterBar
            sortDir={clientSortDir}
            onToggleSort={() => setClientSortDir(p => (p === 'asc' ? 'desc' : 'asc'))}
            tierFilter={tierFilter}
            onChangeTier={setTierFilter}
            villeFilter={villeFilter}
            onChangeVille={setVilleFilter}
          />

          {/* Grille des clients */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {paginatedClients.map((client, index) => (
              <ClientCardItem
                key={client.id}
                client={client}
                index={index}
                photoUrl={getClientPhotoUrl(client)}
                onOpenPhotoZoom={(url, name) => setZoomPhoto({ url, name })}
                onPhoneClick={handlePhoneClick}
                onAddressClick={handleAddressClick}
                onDetail={() => setDetailClient(client)}
                onEdit={() => handleEditClient(client)}
                onDelete={() => handleDeleteClient(client)}
              />
            ))}
          </div>

          {/* Empty state recherche */}
          {searchQuery.length >= 3 && filteredClients.length === 0 && (
            <div className="text-center py-20">
              <div className="relative inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-full mb-8 shadow-xl">
                <Users className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">Aucun client trouvé</h3>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">Aucun client ne correspond à votre recherche "{searchQuery}"</p>
              <Button onClick={() => setSearchQuery('')} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl">Effacer la recherche</Button>
            </div>
          )}

          {/* Pagination */}
          <ClientPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={setCurrentPage}
          />

          {/* Empty state global */}
          {clients.length === 0 && searchQuery.length === 0 && (
            <div className="text-center py-32">
              <div className="relative inline-flex items-center justify-center w-48 h-48 bg-gradient-to-br from-purple-100 via-violet-100 to-indigo-100 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-indigo-900/20 rounded-full mb-16 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-full animate-pulse"></div>
                <Users className="w-24 h-24 text-purple-600 dark:text-purple-400 relative z-10" />
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                  <Crown className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Votre Empire Clientèle vous attend</h3>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-3xl mx-auto leading-relaxed">Commencez à construire votre réseau exclusif de clients VIP</p>
              <Button onClick={handleAddClient} className="group bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white text-xl px-16 py-8 rounded-2xl shadow-2xl hover:shadow-purple-500/30 transform hover:-translate-y-3 transition-all duration-500 border-2 border-purple-400/30">
                <Crown className="w-8 h-8 mr-4 group-hover:rotate-12 transition-transform duration-300" />
                Créer votre Premier Client Élite
                <Sparkles className="w-8 h-8 ml-4 group-hover:scale-125 transition-transform duration-300" />
              </Button>
            </div>
          )}
        </div>

        {!embedded && <Footer />}

        {/* Dialog principal ajout/modification */}
        <ClientFormDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          editing={!!editingClient}
          formData={formData}
          setFormData={setFormData}
          availableVilles={availableVilles}
          photoInputRef={photoInputRef}
          photoPreview={photoPreview}
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
          onPhotoSelect={handlePhotoSelect}
          onRemovePhoto={removePhoto}
        />

        {/* Confirmations */}
        <ClientConfirmDialogs
          showAdd={showAddConfirm}
          setShowAdd={setShowAddConfirm}
          showEdit={showEditConfirm}
          setShowEdit={setShowEditConfirm}
          isSubmitting={isSubmitting}
          onConfirmAdd={confirmAdd}
          onConfirmEdit={confirmEdit}
        />

        <ConfirmDeleteDialog
          isOpen={showDeleteConfirm}
          onClose={() => { setShowDeleteConfirm(false); setClientToDelete(null); }}
          onConfirm={confirmDelete}
          title="Confirmer la suppression"
          description={`Voulez-vous vraiment supprimer ${clientToDelete?.nom} ?`}
          isSubmitting={isSubmitting}
        />

        {/* Modale téléphone */}
        <ClientPhoneActionModal
          open={phoneActionOpen}
          onOpenChange={setPhoneActionOpen}
          phone={selectedPhone}
          isMobile={isMobile}
          onCall={handleCall}
          onMessage={handleMessage}
        />

        {/* Modale adresse (mobile) */}
        <ClientAddressActionModal
          open={addressActionOpen}
          onOpenChange={setAddressActionOpen}
          onGoogleMaps={openGoogleMaps}
          onWaze={openWaze}
          onAppleMaps={openAppleMaps}
        />

        {/* Photo zoom */}
        {zoomPhoto && (
          <ClientPhotoZoomModal
            isOpen={!!zoomPhoto}
            onClose={() => setZoomPhoto(null)}
            photoUrl={zoomPhoto.url}
            clientName={zoomPhoto.name}
          />
        )}

        {/* Fusion */}
        <ClientMergeModal
          open={isMergeOpen}
          onClose={() => setIsMergeOpen(false)}
          clients={clients}
          onMerged={() => refetch()}
        />

        <CitiesManagerModal open={isVillesOpen} onOpenChange={setIsVillesOpen} />

        {/* Gestion des paliers de fidélité (Nouveau/Standard/Bon/Fidèle/VIP) */}
        <FideliteListModal open={isFideliteListOpen} onOpenChange={setIsFideliteListOpen} />


        {/* Détail client */}
        <ClientDetailModal
          open={!!detailClient}
          onOpenChange={(o) => { if (!o) setDetailClient(null); }}
          client={detailClient}
          photoUrl={detailClient ? getClientPhotoUrl(detailClient as any) : null}
        />

        {/* Modale de doublons clients */}
        <DuplicateClientModal
          isOpen={duplicateModalOpen}
          onClose={() => setDuplicateModalOpen(false)}
          matches={duplicateMatches}
          typed={{
            nom: formData.nom,
            phones: formData.phones.filter(p => p.trim()),
            addresses: formData.addresses.filter(a => a.trim()),
          }}
          onUseExisting={(c) => {
            setDuplicateModalOpen(false);
            setIsAddDialogOpen(false);
            resetForm();
            refetch();
            toast({ title: 'Client enregistré', description: `${(c as any).nom} a été pris en compte`, className: 'notification-success' });
          }}
          onUpdateClient={async (clientId, patch) => {
            try {
              const token = localStorage.getItem('token');
              const fd = new FormData();
              fd.append('nom', patch.nom);
              fd.append('phones', JSON.stringify(patch.phones));
              fd.append('addresses', JSON.stringify(patch.addresses));
              fd.append('adresse', patch.addresses[0] || '');
              await axios.put(`${API_BASE_URL}/api/clients/${clientId}`, fd, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
              });
              toast({ title: 'Client mis à jour', description: `${patch.nom} a été modifié`, className: 'notification-success' });
              refetch();
            } catch (err) {
              console.error(err);
              toast({ title: 'Erreur', description: 'Mise à jour impossible', variant: 'destructive', className: 'notification-erreur' });
            }
          }}
          onCreateNew={() => setShowAddConfirm(true)}
        />
      </div>
    </>
  );

  if (embedded) return mainContent;
  return mainContent;
};

export default ClientsPage;
