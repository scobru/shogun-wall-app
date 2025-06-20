import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { ShogunCore } from 'shogun-core';
import useLocalStorage from './useLocalStorage';
import gun from '../api/gun';
import 'gun/sea.js';

interface AuthContextType {
  // Stato di autenticazione Shogun
  isLoggedIn: boolean;
  isAuthenticated: boolean; // Alias per isLoggedIn per compatibilità
  userPub: string | null;
  username: string | null;
  userPubFormatted: string | null; // Public key formattata
  
  // Username locale (guest) come fallback
  localUsername: string | null;
  setLocalUsername: (username: string | null) => void;
  
  // Username effettivo da utilizzare (Shogun o locale)
  currentUsername: string | null;
  
  // Stato complessivo di autenticazione
  hasAnyAuth: boolean;
  
  // Stati di loading ed errore
  loading: boolean;
  error: string | null;
  
  // Metodi di autenticazione
  logout: () => void;
  redirectToAuth: () => void;
  
  // Accesso al SDK Shogun
  shogun: ShogunCore | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Utility per formattare la public key
const formatPublicKey = (pubKey: string): string => {
  if (!pubKey || pubKey.length < 10) return pubKey;
  return `${pubKey.slice(0, 6)}...${pubKey.slice(-4)}`;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [shogun, setShogun] = useState<ShogunCore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localUsername, setLocalUsername] = useLocalStorage<string | null>('wallie_username', null);

  // Inizializza ShogunCore
  useEffect(() => {
    const initializeShogun = async () => {
      try {
        console.log('🚀 Inizializzando ShogunCore per Wallie.io...');
        setLoading(true);
        setError(null);
        
        const gunInstance = gun;

        const shogunCore = new ShogunCore({
          gunInstance: gunInstance,
          peers: ["http://localhost:8765/gun"],
          web3: { enabled: true },
          webauthn: {
            enabled: true,
            rpName: "Wallie.io",
          },
          nostr: { enabled: true },
          oauth: {
            enabled: true,
            providers: {
              google: {
                clientId: "15241942495-ftd3cs98qvem6snh6isbabc3adoc9f4p.apps.googleusercontent.com",
                clientSecret: "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",
                redirectUri: "http://localhost:3000/auth/callback",
                scope: ["openid", "email", "profile"],
                authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
                tokenUrl: "https://oauth2.googleapis.com/token",
                userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
              },
            },
          },
        });

        setShogun(shogunCore);
        console.log('✅ ShogunCore inizializzato per Wallie.io');
        setLoading(false);
        
      } catch (error: unknown) {
        console.error('❌ Errore inizializzazione ShogunCore:', error);
        setError(error instanceof Error ? error.message : String(error));
        setLoading(false);
      }
    };

    initializeShogun();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <div>🔄 Caricamento Shogun...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>❌ Errore: {error}</div>
        <button onClick={() => window.location.reload()}>
          Ricarica
        </button>
      </div>
    );
  }

  if (!shogun) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <div>🔄 Caricamento Shogun...</div>
      </div>
    );
  }

  return (
    <AuthProviderInner 
      shogun={shogun}
      localUsername={localUsername}
      setLocalUsername={setLocalUsername}
      globalError={error}
      setGlobalError={setError}
    >
      {children}
    </AuthProviderInner>
  );
};

interface AuthProviderInnerProps {
  children: ReactNode;
  shogun: ShogunCore;
  localUsername: string | null;
  setLocalUsername: (username: string | null) => void;
  globalError: string | null;
  setGlobalError: (error: string | null) => void;
}

const AuthProviderInner: React.FC<AuthProviderInnerProps> = ({ 
  children, 
  shogun, 
  localUsername, 
  setLocalUsername,
  globalError,
  setGlobalError
}) => {
  // Stato di autenticazione gestito direttamente con ShogunCore
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userPub, setUserPub] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Effetto per monitorare lo stato di autenticazione
  useEffect(() => {
    if (shogun) {
      const checkAuthStatus = () => {
        const logged = shogun.isLoggedIn();
        setIsLoggedIn(logged);
        
        if (logged) {
          // Cerca di ottenere informazioni utente dall'API RxJS
          const savedUserPub = shogun.rx.getUserPub();
          setUserPub(savedUserPub || null);
          
          // Per ora non abbiamo un modo diretto per ottenere username
          // Lo gestiremo negli eventi di login
          if (!username && savedUserPub) {
            setUsername(savedUserPub.slice(0, 8) + '...');
          }
        } else {
          setUserPub(null);
          setUsername(null);
        }
      };

      // Controllo iniziale
      checkAuthStatus();

      // Aggiungi listener per cambiamenti di stato (se disponibile)
      const interval = setInterval(checkAuthStatus, 1000);
      
      return () => clearInterval(interval);
    }
  }, [shogun]);

  const currentUsername = username || localUsername;
  const hasAnyAuth = isLoggedIn || !!localUsername;
  const userPubFormatted = userPub ? formatPublicKey(userPub) : null;

  // Metodo di logout
  const logout = async () => {
    try {
      console.log('🚪 Logout...');
      // Logout da Shogun se autenticato
      if (isLoggedIn && shogun) {
        await shogun.logout();
      }
      // Clear local username
      setLocalUsername(null);
      setGlobalError(null);
      console.log('✅ Logout completato');
      
      // Ricarica la pagina per pulire completamente lo stato
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: unknown) {
      console.error('❌ Errore durante logout:', error);
      setGlobalError(error instanceof Error ? error.message : String(error));
    }
  };

  // Metodo per reindirizzare all'autenticazione  
  const redirectToAuth = () => {
    // Per ora mostra un alert, in futuro potremmo implementare
    // una modal o reindirizzamento a una pagina dedicata
    alert('Funzionalità di autenticazione disponibile tramite il pulsante Shogun in alto a destra!');
  };

  const value: AuthContextType = {
    isLoggedIn,
    isAuthenticated: isLoggedIn, // Alias per compatibilità
    userPub,
    username,
    userPubFormatted,
    localUsername,
    setLocalUsername,
    currentUsername,
    hasAnyAuth,
    loading: false, // Loading gestito dal provider padre
    error: globalError,
    logout,
    redirectToAuth,
    shogun,
  };

  return (
    <AuthContext.Provider value={value}>
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