// Types pour les clients

export interface Client {
  id: string;
  nom: string;
  phone: string; // Rétrocompatibilité: premier numéro
  phones: string[]; // Tous les numéros de téléphone
  adresse: string;
  dateCreation: string;
  photo?: string; // Chemin vers la photo du client (optionnel)
}

export interface ClientFormData {
  nom: string;
  phones: string[]; // Tableau de numéros
  adresse: string;
  photo?: File | null; // Fichier photo (optionnel)
}

export interface ClientSearchResult {
  clients: Client[];
  total: number;
}
