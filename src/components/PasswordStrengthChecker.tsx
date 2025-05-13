
import React, { useEffect } from 'react';

interface PasswordStrengthCheckerProps {
  password: string;
  onValidityChange?: (isValid: boolean) => void;
}

/**
 * Composant qui vérifie la force du mot de passe
 * et affiche les critères requis
 */
const PasswordStrengthChecker: React.FC<PasswordStrengthCheckerProps> = ({ 
  password, 
  onValidityChange 
}) => {
  // Vérifie les différents critères du mot de passe
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasMinLength = password.length >= 8;
  
  // Détermine si tous les critères sont remplis
  const isPasswordValid = hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar && hasMinLength;
  
  // Notifie le parent quand la validité change
  useEffect(() => {
    if (onValidityChange) {
      onValidityChange(isPasswordValid);
    }
  }, [isPasswordValid, onValidityChange]);
  
  return (
    <section className="mt-2">
      <details open>
        <summary className="text-sm font-medium mb-1">Le mot de passe doit contenir:</summary>
        <ul className="space-y-1 text-xs">
          <li className={`flex items-center ${hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
            <mark className={`h-1.5 w-1.5 rounded-full mr-2 ${hasMinLength ? 'bg-green-600' : 'bg-gray-300'}`}></mark>
            Au moins 8 caractères
          </li>
          <li className={`flex items-center ${hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
            <mark className={`h-1.5 w-1.5 rounded-full mr-2 ${hasUpperCase ? 'bg-green-600' : 'bg-gray-300'}`}></mark>
            Au moins une majuscule
          </li>
          <li className={`flex items-center ${hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
            <mark className={`h-1.5 w-1.5 rounded-full mr-2 ${hasLowerCase ? 'bg-green-600' : 'bg-gray-300'}`}></mark>
            Au moins une minuscule
          </li>
          <li className={`flex items-center ${hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
            <mark className={`h-1.5 w-1.5 rounded-full mr-2 ${hasNumber ? 'bg-green-600' : 'bg-gray-300'}`}></mark>
            Au moins un chiffre
          </li>
          <li className={`flex items-center ${hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
            <mark className={`h-1.5 w-1.5 rounded-full mr-2 ${hasSpecialChar ? 'bg-green-600' : 'bg-gray-300'}`}></mark>
            Au moins un caractère spécial
          </li>
        </ul>
      </details>
    </section>
  );
};

export default PasswordStrengthChecker;
