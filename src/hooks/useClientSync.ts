
import { useState, useEffect, useCallback } from 'react';
import { realtimeService } from '@/services/realtimeService';
import axios from 'axios';

interface Client {
  id: string;
  nom: string;
  phone: string;
  adresse: string;
  dateCreation: string;
}

export const useClientSync = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';
      
      const response = await axios.get(`${API_BASE_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Clients chargés:', response.data);
      setClients(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des clients:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('🔌 Initialisation du hook useClientSync avec synchronisation temps réel');
    
    // Chargement initial
    fetchClients();

    // Connexion au service de synchronisation en temps réel
    const token = localStorage.getItem('token');
    realtimeService.connect(token);

    // Écouter les changements en temps réel pour les clients
    const unsubscribe = realtimeService.addDataListener((data) => {
      console.log('📡 Données reçues en temps réel:', data);
      
      if (data.clients) {
        console.log('👥 Mise à jour des clients en temps réel:', data.clients);
        setClients(data.clients);
        setIsLoading(false);
      }
    });

    // Écouter les événements de synchronisation
    const unsubscribeSync = realtimeService.addSyncListener((event) => {
      console.log('🔄 Événement de sync reçu:', event);
      
      if (event.type === 'force-sync') {
        console.log('🚀 Force sync détecté, rechargement des clients');
        fetchClients();
      }
    });

    return () => {
      console.log('🔌 Nettoyage du hook useClientSync');
      unsubscribe();
      unsubscribeSync();
    };
  }, [fetchClients]);

  const searchClients = useCallback((query: string): Client[] => {
    if (query.length < 3) return [];
    
    return clients.filter(client => 
      client.nom.toLowerCase().includes(query.toLowerCase())
    );
  }, [clients]);

  return {
    clients,
    isLoading,
    searchClients,
    refetch: fetchClients
  };
};
