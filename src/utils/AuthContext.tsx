import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { ShogunCore } from 'shogun-core';
import { ShogunButtonProvider, useShogun } from 'shogun-button-react';
import useLocalStorage from './useLocalStorage';
import gun from '../api/gun';
import { getStoredUsernameForPublicKey, formatPublicKey } from './usernameMap';
import 'gun/sea.js';


import dotenv from 'dotenv';
dotenv.config();

// Define the shape of our auth context
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
  refreshUsername: () => Promise<void>;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Bridge component to map shogun-button-react context to our app context
const AuthBridge: React.FC<{ children: ReactNode; shogun: ShogunCore }> = ({ children, shogun }) => {
  const shogunContext = useShogun();
  const [localUsername, setLocalUsername] = useLocalStorage<string | null>('wallie_username', null);
  const [error] = useState<string | null>(null);
  const [storedUsername, setStoredUsername] = useState<string | null>(null);

  // Use the improved formatPublicKey from usernameMap

  // Function to refresh stored username from Gun.js
  const refreshUsername = async (): Promise<void> => {
    if (shogunContext.userPub) {
      try {
        const username = await getStoredUsernameForPublicKey(shogunContext.userPub);
        setStoredUsername(username);
      } catch (error) {
        console.error('Error refreshing username:', error);
      }
    }
  };

  // Load stored username when userPub changes
  useEffect(() => {
    if (shogunContext.userPub) {
      refreshUsername();
    } else {
      setStoredUsername(null);
    }
  }, [shogunContext.userPub]);
  
  const value: AuthContextType = {
    ...shogunContext,
    isAuthenticated: shogunContext.isLoggedIn,
    userPubFormatted: shogunContext.userPub ? formatPublicKey(shogunContext.userPub, 16) : null,
    localUsername,
    setLocalUsername,
    currentUsername: storedUsername || shogunContext.username || localUsername,
    hasAnyAuth: shogunContext.isLoggedIn || !!localUsername,
    loading: false,
    error: error,
    shogun: shogun,
    refreshUsername,
    redirectToAuth: () => {
      alert('Authentication is available via the Shogun button in the top right!');
    },
    logout: () => {
      shogunContext.logout();
      setLocalUsername(null);
      setStoredUsername(null);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Main AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shogun, setShogun] = useState<ShogunCore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize ShogunCore once
  useEffect(() => {
    const initializeShogun = async () => {
      try {
        console.log('🚀 Initializing ShogunCore for Shogun-Wall...');
        
        // Wait a bit for Gun to be fully initialized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verify Gun instance is properly initialized
        if (!gun || typeof gun.user !== 'function') {
          throw new Error('Gun instance is not properly initialized');
        }
        
        const shogunCore = new ShogunCore({
          gunInstance: gun as any,
          web3: { enabled: true },
          webauthn: { 
            enabled: true, 
            rpName: "HAL9000" 
          },
          nostr: { enabled: true },
          oauth: {
            enabled: true,
            providers: {
              google: {
                clientId:
                  process.env.REACT_APP_GOOGLE_CLIENT_ID,
                clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
                redirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI,
                scope: ["openid", "email", "profile"],
                authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
                tokenUrl: "https://oauth2.googleapis.com/token",
                userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
              },
            },
          },
          scope: "shogun-wall",
          peers: ["wss://ruling-mastodon-improved.ngrok-free.app/gun","wss://peer.Shogun-Wall/gun","wss://gun-manhattan.herokuapp.com/gun"],
          logging: {
            enabled: true,
            level : "info",
          }
        });
        
        setShogun(shogunCore);
        console.log('✅ ShogunCore initialized for Shogun-Wall');
        setLoading(false);
      } catch (err: unknown) {
        console.error('❌ Error initializing ShogunCore:', err);
        console.warn('🔄 Continuing without ShogunCore - some features may be limited');
        
        // Continue without ShogunCore for basic functionality
        setShogun(null);
        setError(null); // Don't show error to user, just continue
        setLoading(false);
      }
    };
    
    initializeShogun();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>🔄 Loading Shogun...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>❌ Error: {error}</div>
      </div>
    );
  }

  if (!shogun) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>🔄 Initializing Shogun...</div>
      </div>
    );
  }

  const providerOptions = {
    appName: "Shogun-Wall",
    showOauth: true,
    showWebauthn: true,
    showMetamask: true,
    showNostr: true,
  };

  return (
    <ShogunButtonProvider 
      sdk={shogun} 
      options={providerOptions}
      onLoginSuccess={(data) => {
        console.log('Login successful!', data);
      }}
      onSignupSuccess={(data) => {
        console.log('Signup successful!', data);
      }}
      onError={(error) => {
        console.error('Auth error:', error);
      }}
    >
      <AuthBridge shogun={shogun}>
        {children}
      </AuthBridge>
    </ShogunButtonProvider>
  );
};

// Hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 