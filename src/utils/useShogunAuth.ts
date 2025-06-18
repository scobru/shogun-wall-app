import { useState, useEffect } from 'react';
import { getOrCreateUsernameForPublicKey, formatPublicKey } from './usernameMap';

// Verifica se l'ambiente è il browser
function isBrowser() {
  return typeof window !== 'undefined';
}

export interface ShogunAuthState {
  isAuthenticated: boolean;
  username: string | null;
  userPub: string | null;
  userPubFormatted: string | null;
  error: string | null;
  loading: boolean;
}

export function useShogunAuth() {
  const [authState, setAuthState] = useState<ShogunAuthState>({
    isAuthenticated: false,
    username: null,
    userPub: null,
    userPubFormatted: null,
    error: null,
    loading: true
  });

  // Setup PostMessage listener per ricevere credenziali
  useEffect(() => {
    if (!isBrowser()) return;

    // Segnala che questa finestra è pronta a ricevere credenziali
    const signalReady = () => {
      if (window.opener) {
        try {
          console.log('📡 HAL 9000 pronta per ricevere credenziali Shogun');
          window.opener.postMessage({
            type: 'shogun:auth:ready',
            timestamp: Date.now()
          }, 'http://localhost:8080');
        } catch (error) {
          console.warn('⚠️ Impossibile segnalare ready al parent window:', error);
        }
      }
    };

    // Segnala ready dopo che la pagina è caricata
    if (document.readyState === 'complete') {
      setTimeout(signalReady, 500);
    } else {
      window.addEventListener('load', () => {
        setTimeout(signalReady, 500);
      });
    }

    const handlePostMessage = async (event: MessageEvent) => {
      // Verifica l'origine per sicurezza
      if (event.origin !== 'http://localhost:8080') {
        console.warn(`⚠️ PostMessage da origine non autorizzata: ${event.origin}`);
        return;
      }

      if (event.data.type === 'shogun:auth:credentials') {
        console.log(`📥 HAL 9000 ricevute credenziali via PostMessage`);
        
        try {
          const { session } = event.data.data;
          
          // Conferma ricezione immediatamente
          if (event.source) {
            (event.source as Window).postMessage({
              type: 'shogun:auth:received',
              timestamp: Date.now()
            }, event.origin);
            console.log('✅ Conferma ricezione inviata da HAL 9000');
          }
          
          // Genera o recupera username randomico associato alla chiave pubblica
          const randomUsername = await getOrCreateUsernameForPublicKey(session.pub);
          console.log(`🔑 Username generato per l'utente: ${randomUsername}`);
          
          // Salva i dati dell'utente autenticato
          const userData = {
            username: randomUsername,
            userPub: session.pub,
            timestamp: Date.now()
          };
          
          // Salva in localStorage per persistenza
          if (isBrowser()) {
            localStorage.setItem('shogun_auth_user', JSON.stringify(userData));
          }
          
          setAuthState({
            isAuthenticated: true,
            username: userData.username,
            userPub: userData.userPub,
            userPubFormatted: formatPublicKey(userData.userPub),
            error: null,
            loading: false
          });
          
          console.log('✅ Autenticazione Shogun completata in HAL 9000');
          
        } catch (error) {
          console.error('❌ Errore durante l\'autenticazione via PostMessage:', error);
          setAuthState(prev => ({
            ...prev,
            error: `Errore autenticazione: ${(error as Error).message}`,
            loading: false
          }));
        }
      }
    };

    window.addEventListener('message', handlePostMessage);
    
    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, []);

  // Controllo per identificatori temporanei dall'URL (fallback)
  useEffect(() => {
    if (!isBrowser()) return;

    const checkTemporaryAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const tempAuthId = urlParams.get('temp_auth');
        
        if (tempAuthId) {
          console.log('🔍 HAL 9000 trovato identificatore temporaneo nell\'URL');
          
          const tempKey = `shogun_temp_auth_${tempAuthId}`;
          const tempData = sessionStorage.getItem(tempKey);
          
          if (tempData) {
            console.log('📦 HAL 9000 recupero credenziali temporanee');
            
            try {
              const credentials = JSON.parse(tempData);
              
              // Rimuovi le credenziali temporanee immediatamente per sicurezza
              sessionStorage.removeItem(tempKey);
              
              // Pulisci l'URL
              const url = new URL(window.location.href);
              url.searchParams.delete('temp_auth');
              window.history.replaceState({}, document.title, url.toString());
              
              // Genera o recupera username randomico associato alla chiave pubblica
              const randomUsername = await getOrCreateUsernameForPublicKey(credentials.session.pub);
              console.log(`🔑 Username generato per l'utente: ${randomUsername}`);
              
              // Salva i dati dell'utente
              const userData = {
                username: randomUsername,
                userPub: credentials.session.pub,
                timestamp: Date.now()
              };
              
              localStorage.setItem('shogun_auth_user', JSON.stringify(userData));
              
              setAuthState({
                isAuthenticated: true,
                username: userData.username,
                userPub: userData.userPub,
                userPubFormatted: formatPublicKey(userData.userPub),
                error: null,
                loading: false
              });
              
              console.log('✅ Autenticazione Shogun completata via fallback temporaneo');
              
            } catch (parseError) {
              console.error('❌ Errore nel parsing delle credenziali temporanee:', parseError);
              sessionStorage.removeItem(tempKey);
            }
          } else {
            console.warn('⚠️ Identificatore temporaneo trovato ma credenziali non disponibili');
          }
        }
      } catch (error) {
        console.error('❌ Errore nel controllo autenticazione temporanea:', error);
      }
    };

    checkTemporaryAuth();
  }, []);

  // Effetto per caricare credenziali salvate localmente
  useEffect(() => {
    if (!isBrowser()) return;

    const loadSavedAuth = () => {
      try {
        const savedAuth = localStorage.getItem('shogun_auth_user');
        if (savedAuth) {
          const userData = JSON.parse(savedAuth);
          
          // Verifica che i dati non siano scaduti (7 giorni)
          const sessionAge = Date.now() - userData.timestamp;
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 giorni
          
          if (sessionAge > maxAge) {
            console.log('⏰ Sessione Shogun scaduta, rimozione credenziali');
            localStorage.removeItem('shogun_auth_user');
            setAuthState(prev => ({ ...prev, loading: false }));
            return;
          }
          
          setAuthState({
            isAuthenticated: true,
            username: userData.username,
            userPub: userData.userPub,
            userPubFormatted: formatPublicKey(userData.userPub),
            error: null,
            loading: false
          });
          
          console.log('✅ Autenticazione Shogun caricata da storage locale:', userData);
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('❌ Errore nel caricamento autenticazione salvata:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    loadSavedAuth();
  }, []);

  // Funzione per effettuare il logout
  const logout = () => {
    try {
      if (isBrowser()) {
        localStorage.removeItem('shogun_auth_user');
      }
      
      setAuthState({
        isAuthenticated: false,
        username: null,
        userPub: null,
        userPubFormatted: null,
        error: null,
        loading: false
      });
      
      console.log('✅ Logout Shogun effettuato con successo');
    } catch (error) {
      console.error('❌ Errore durante il logout Shogun:', error);
    }
  };

  // Funzione per reindirizzare all'app di autenticazione
  const redirectToAuth = () => {
    if (!isBrowser()) return;
    
    const currentUrl = window.location.href;
    const authUrl = `http://localhost:8080?redirect=${encodeURIComponent(currentUrl)}`;
    console.log('🔄 Reindirizzamento da HAL 9000 a Shogun Auth:', authUrl);
    window.location.href = authUrl;
  };

  return {
    ...authState,
    logout,
    redirectToAuth
  };
} 