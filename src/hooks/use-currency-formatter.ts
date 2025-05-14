
/**
 * Hook personnalisé pour formater les valeurs monétaires en euros
 * Utilise l'API Intl.NumberFormat pour un formatage cohérent
 * 
 * @returns Une fonction qui prend un nombre et renvoie une chaîne formatée
 */
const useCurrencyFormatter = () => {
  const formatEuro = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  return { formatEuro };
};

export default useCurrencyFormatter;
