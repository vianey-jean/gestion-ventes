// Types pour les clients

export interface Client {
  id: string;
  nom: string;
  phone: string; // Rétrocompatibilité: premier numéro
  phones: string[]; // Tous les numéros de téléphone
  adresse: string;
  dateCreation: string;
}

export interface ClientFormData {
  nom: string;
  phones: string[]; // Tableau de numéros
  adresse: string;
}

export interface ClientSearchResult {
  clients: Client[];
  total: number;
}
