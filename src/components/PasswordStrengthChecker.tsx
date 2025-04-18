
import React from 'react';

interface PasswordStrengthCheckerProps {
  password: string;
}

const PasswordStrengthChecker: React.FC<PasswordStrengthCheckerProps> = ({ password }) => {
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasMinLength = password.length >= 8;
  
  return (
    <div className="mt-2">
      <p className="text-sm font-medium mb-1">Le mot de passe doit contenir:</p>
      <ul className="space-y-1 text-xs">
        <li className={`flex items-center ${hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
          <span className={`h-1.5 w-1.5 rounded-full mr-2 ${hasMinLength ? 'bg-green-600' : 'bg-gray-300'}`}></span>
          Au moins 8 caractères
        </li>
        <li className={`flex items-center ${hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
          <span className={`h-1.5 w-1.5 rounded-full mr-2 ${hasUpperCase ? 'bg-green-600' : 'bg-gray-300'}`}></span>
          Au moins une majuscule
        </li>
        <li className={`flex items-center ${hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
          <span className={`h-1.5 w-1.5 rounded-full mr-2 ${hasLowerCase ? 'bg-green-600' : 'bg-gray-300'}`}></span>
          Au moins une minuscule
        </li>
        <li className={`flex items-center ${hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
          <span className={`h-1.5 w-1.5 rounded-full mr-2 ${hasNumber ? 'bg-green-600' : 'bg-gray-300'}`}></span>
          Au moins un chiffre
        </li>
        <li className={`flex items-center ${hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
          <span className={`h-1.5 w-1.5 rounded-full mr-2 ${hasSpecialChar ? 'bg-green-600' : 'bg-gray-300'}`}></span>
          Au moins un caractère spécial
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrengthChecker;
