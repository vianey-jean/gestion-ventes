// Types pour les clients

export interface Client {
  id: string;
  nom: string;
  phone: string; // Rétrocompatibilité: premier numéro (principal)
  phones: string[]; // Tous les numéros de téléphone
  adresse: string; // Rétrocompatibilité: première adresse (principale)
  addresses: string[]; // Toutes les adresses
  dateCreation: string;
  photo?: string;
}

export interface ClientFormData {
  nom: string;
  phones: string[];
  addresses: string[];
  photo?: File | null;
}

export interface ClientSearchResult {
  clients: Client[];
  total: number;
}
