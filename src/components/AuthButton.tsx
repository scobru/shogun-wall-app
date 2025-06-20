import React from 'react';
import { ShogunButton } from 'shogun-button-react';
import { useAuth } from '../utils/AuthContext';

/**
 * Componente di autenticazione che usa ShogunButton
 */
export const AuthButton: React.FC = () => {
  const { isLoggedIn, username, currentUsername } = useAuth();

  if (isLoggedIn && username) {
    // L'utente è autenticato con Shogun, ShogunButton mostrerà l'avatar e il menu
    return <ShogunButton />;
  }

  // L'utente non è autenticato, ShogunButton mostrerà il pulsante di login
  return <ShogunButton />;
};

export default AuthButton; 