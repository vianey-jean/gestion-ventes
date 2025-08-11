
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientSync } from '@/hooks/useClientSync';

interface Client {
  id: string;
  nom: string;
  phone: string;
  adresse: string;
}

interface ClientSearchInputProps {
  onClientSelect: (client: Client | null) => void;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ClientSearchInput: React.FC<ClientSearchInputProps> = ({
  onClientSelect,
  value,
  onChange,
  disabled = false
}) => {
  const { searchClients } = useClientSync();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Client[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Recherche des clients
  useEffect(() => {
    if (isSelecting) {
      setIsSelecting(false);
      return;
    }

    if (value.length >= 3) {
      const results = searchClients(value);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [value, searchClients, isSelecting]);

  // Gestion clic à l'extérieur et changement de focus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleFocusChange = (event: FocusEvent) => {
      // Si le focus va vers un autre élément qui n'est pas le dropdown
      if (
        event.target !== inputRef.current &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('focusin', handleFocusChange);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('focusin', handleFocusChange);
    };
  }, []);

  // Sélection d'un client
  const handleClientSelect = (client: Client) => {
    setIsSelecting(true);
    onChange(client.nom);
    onClientSelect(client);
    setSuggestions([]);
    setIsOpen(false); // Fermer immédiatement le dropdown
  };

  // Changement dans l'input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (newValue.length < 3) {
      onClientSelect(null);
    }
  };

  // Gestionnaire pour fermer le dropdown quand on clique ailleurs dans le formulaire
  const handleInputBlur = () => {
    // Délai pour permettre au clic sur une suggestion de s'exécuter
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div className="relative">
      <Label htmlFor="clientName">Nom du client</Label>
      <Input
        ref={inputRef}
        id="clientName"
        value={value}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder="Saisir au moins 3 caractères pour rechercher..."
        disabled={disabled}
        autoComplete="off"
      />

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((client) => (
            <button
              key={client.id}
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors"
              onClick={() => handleClientSelect(client)}
              onMouseDown={(e) => e.preventDefault()} // Empêche le blur de l'input
            >
              <div className="font-medium text-gray-900 dark:text-white">{client.nom}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{client.phone}</div>
              <div className="text-sm text-gray-500 dark:text-gray-500 truncate">{client.adresse}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientSearchInput;
