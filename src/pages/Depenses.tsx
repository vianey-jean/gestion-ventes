/** Depenses.tsx - Redirection vers la page dépenses dans le dashboard */

import React from 'react';
import { Navigate } from 'react-router-dom';

const Depenses: React.FC = () => {
  // Redirige vers la page Dashboard qui contient la gestion des dépenses
  return <Navigate to="/" replace />;
};

export default Depenses;
