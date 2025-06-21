import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { ShogunCore } from 'shogun-core';
import { ShogunButtonProvider, useShogun as useShogunButton } from 'shogun-button-react';
import useLocalStorage from './useLocalStorage';
import gun from '../api/gun';
import 'gun/sea.js';

// Define the shape of our combined auth context
interface AuthContextType {
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  userPub: string | null;
  username: string | null;
  userPubFormatted: string | null;
  localUsername: string | null;
  setLocalUsername: (username: string | null) => void;
  currentUsername: string | null;
  hasAnyAuth: boolean;
  loading: boolean;
  error: string | null;
  logout: () => void;
  redirectToAuth: () => void;
  shogun: ShogunCore | null;
  login: (method: string, ...args: any[]) => Promise<any>;
  signUp: (method: string, ...args: any[]) => Promise<any>;
}

// 1. Create a new AuthContext for the Wallie.io app
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. The main provider that will be used in App.tsx
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shogun, setShogun] = useState<ShogunCore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize ShogunCore once
  useEffect(() => {
    const initializeShogun = async () => {
      try {
        console.log('🚀 Initializing ShogunCore for Wallie.io...');
        const shogunCore = new ShogunCore({
          gunInstance: gun,
          peers: ["http://localhost:8765/gun"],
          web3: { enabled: true },
          webauthn: { enabled: true, rpName: "Wallie.io" },
          nostr: { enabled: true },
          oauth: {
            enabled: true,
            providers: {
              google: {
                clientId: "15241942495-ftd3cs98qvem6snh6isbabc3adoc9f4p.apps.googleusercontent.com",
                clientSecret: "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",
                redirectUri: "http://localhost:3000/auth/callback",
                scope: ["openid", "email", "profile"],
              },
            },
          },
        });
        setShogun(shogunCore);
        console.log('✅ ShogunCore initialized for Wallie.io');
        setLoading(false);
      } catch (err: unknown) {
        console.error('❌ Error initializing ShogunCore:', err);
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    };
    initializeShogun();
  }, []);

  if (loading) {
    return <div>🔄 Loading Shogun...</div>;
  }

  if (error) {
    return <div>❌ Error: {error}</div>;
  }

  if (!shogun) {
    return <div>🔄 Initializing Shogun...</div>;
  }

  // Wrap children with ShogunButtonProvider which now holds the auth state
  return (
    <ShogunButtonProvider sdk={shogun} options={{}} onError={setError}>
      <AuthBridge>{children}</AuthBridge>
    </ShogunButtonProvider>
  );
};

// 3. A bridge component to map the context from shogun-button-react to our app's context
const AuthBridge: React.FC<{ children: ReactNode }> = ({ children }) => {
  const shogunButtonContext = useShogunButton();
  const [localUsername, setLocalUsername] = useLocalStorage<string | null>('wallie_username', null);
  const [error, setError] = useState<string | null>(null);

  const formatPublicKey = (pubKey: string): string => {
    if (!pubKey || pubKey.length < 10) return pubKey;
    return `${pubKey.slice(0, 6)}...${pubKey.slice(-4)}`;
  };
  
  const value: AuthContextType = {
    ...shogunButtonContext,
    isAuthenticated: shogunButtonContext.isLoggedIn,
    userPubFormatted: shogunButtonContext.userPub ? formatPublicKey(shogunButtonContext.userPub) : null,
    localUsername,
    setLocalUsername,
    currentUsername: shogunButtonContext.username || localUsername,
    hasAnyAuth: shogunButtonContext.isLoggedIn || !!localUsername,
    loading: false, // Loading is handled in the parent
    error: error,
    redirectToAuth: () => {
      alert('Authentication is available via the Shogun button in the top right!');
    },
    logout: () => {
        shogunButtonContext.logout();
        setLocalUsername(null);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. The final hook used by the application components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 