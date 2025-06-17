import React, { createContext, useContext, ReactNode } from 'react';
import { useShogunAuth, ShogunAuthState } from './useShogunAuth';
import useLocalStorage from './useLocalStorage';

interface AuthContextType extends ShogunAuthState {
  // Funzioni di autenticazione
  logout: () => void;
  redirectToAuth: () => void;
  
  // Username locale (guest) come fallback
  localUsername: string | null;
  setLocalUsername: (username: string | null) => void;
  
  // Username effettivo da utilizzare (Shogun o locale)
  currentUsername: string | null;
  
  // Stato complessivo di autenticazione
  hasAnyAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const shogunAuth = useShogunAuth();
  const [localUsername, setLocalUsername] = useLocalStorage<string | null>('username', null);
  
  // Determina l'username da utilizzare: Shogun ha priorità su locale
  const currentUsername = shogunAuth.isAuthenticated 
    ? shogunAuth.username 
    : localUsername;
    
  // Debug log
  React.useEffect(() => {
    console.log('🔍 AuthContext Debug:', {
      shogunAuth: {
        isAuthenticated: shogunAuth.isAuthenticated,
        username: shogunAuth.username,
        userPub: shogunAuth.userPub,
        loading: shogunAuth.loading
      },
      localUsername,
      currentUsername,
      hasAnyAuth: shogunAuth.isAuthenticated || !!localUsername
    });
  }, [shogunAuth.isAuthenticated, shogunAuth.username, shogunAuth.userPub, localUsername, currentUsername]);
  
  // Verifica se c'è almeno un tipo di autenticazione
  const hasAnyAuth = shogunAuth.isAuthenticated || !!localUsername;
  
  const contextValue: AuthContextType = {
    ...shogunAuth,
    localUsername,
    setLocalUsername,
    currentUsername,
    hasAnyAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 