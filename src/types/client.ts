// Types pour les clients

export interface Client {
  id: string;
  nom: string;
  phone: string; // Rétrocompatibilité: premier numéro (principal)
  phones: string[]; // Tous les numéros de téléphone
  adresse: string; // Rétrocompatibilité: première adresse (principale)
  addresses: string[]; // Toutes les adresses
  ville?: string; // Ville principale (rétrocompatibilité = villes[0])
  villes?: string[]; // Ville par adresse (même index que addresses)
  dateCreation: string;
  photo?: string;
}

export interface ClientFormData {
  nom: string;
  phones: string[];
  addresses: string[];
  ville?: string;
  villes?: string[];
  photo?: File | null;
}

export interface ClientSearchResult {
  clients: Client[];
  total: number;
}
