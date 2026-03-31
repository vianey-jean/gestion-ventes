
import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService } from '@/services/realtimeService';
import axios from 'axios';

interface Client {
  id: string;
  nom: string;
  phone: string;
  phones: string[];
  adresse: string;
  dateCreation: string;
}

/**
 * Normalise un client côté frontend pour garantir que phones est toujours un tableau
 */
const normalizeClient = (client: any): Client => {
  const phones = client.phones && Array.isArray(client.phones) && client.phones.length > 0
    ? client.phones
    : (client.phone ? [client.phone] : []);
  return {
    ...client,
    phones,
    phone: phones[0] || '',
  };
};

export const useClientSync = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const lastDataRef = useRef<Client[]>([]);

  const fetchClients = useCallback(async (isInitialLoad = false) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';
      
      const response = await axios.get(`${API_BASE_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Clients chargés:', response.data);
      
      // Normaliser tous les clients
      const newData = (response.data || []).map(normalizeClient);
      const hasChanged = JSON.stringify(lastDataRef.current) !== JSON.stringify(newData);
      
      if (hasChanged || isInitialLoad) {
        setClients(newData);
        lastDataRef.current = newData;
      }
      
      if (isInitialLoad) {
        setHasInitialLoad(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des clients:', error);
      
      if (!hasInitialLoad) {
        setClients([]);
        lastDataRef.current = [];
      }
      setIsLoading(false);
    }
  }, [hasInitialLoad]);

  useEffect(() => {
    console.log('🔌 Initialisation du hook useClientSync avec synchronisation temps réel');
    
    fetchClients(true);

    const token = localStorage.getItem('token');
    realtimeService.connect(token);

    const unsubscribe = realtimeService.addDataListener((data) => {
      console.log('📡 Données reçues en temps réel:', data);
      
      if (data.clients) {
        console.log('👥 Mise à jour des clients en temps réel:', data.clients);
        
        const newData = (data.clients || []).map(normalizeClient);
        const hasChanged = JSON.stringify(lastDataRef.current) !== JSON.stringify(newData);
        
        if (hasChanged) {
          setClients(newData);
          lastDataRef.current = newData;
          setIsLoading(false);
        }
      }
    });

    const unsubscribeSync = realtimeService.addSyncListener((event) => {
      console.log('🔄 Événement de sync reçu:', event);
      
      if (event.type === 'force-sync') {
        console.log('🚀 Force sync détecté, rechargement des clients');
        fetchClients(false);
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

  const refetch = useCallback(() => {
    fetchClients(false);
  }, [fetchClients]);

  return {
    clients,
    isLoading: isLoading && !hasInitialLoad,
    searchClients,
    refetch
  };
};
