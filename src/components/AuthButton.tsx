import React from 'react';
import { ShogunButton, ShogunButtonProvider } from 'shogun-button-react';
import { useAuth } from '../utils/AuthContext';

/**
 * Componente di autenticazione che usa ShogunButton
 */
export const AuthButton: React.FC = () => {
  const { isLoggedIn, username, currentUsername, shogun } = useAuth();

  // Se shogun non è ancora inizializzato, mostra un loading
  if (!shogun) {
    return <div style={{ 
      padding: '8px 16px', 
      fontSize: '14px',
      color: '#666'
    }}>🔄</div>;
  }

  return (
    <ShogunButtonProvider
      sdk={shogun}
      options={{
        appName: "Wallie.io",
        showOauth: true,
        showWebauthn: true,
        showMetamask: true,
        showNostr: true,
      }}
      onLoginSuccess={(data) => {
        console.log('✅ Login Shogun success in AuthButton:', data);
      }}
      onSignupSuccess={(data) => {
        console.log('✅ Signup Shogun success in AuthButton:', data);
      }}
      onError={(error: unknown) => {
        console.error('❌ Errore Shogun in AuthButton:', error);
      }}
    >
      <ShogunButton />
    </ShogunButtonProvider>
  );
};

export default AuthButton; 