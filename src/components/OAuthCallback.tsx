import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { shogun } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!shogun) {
          console.error('Shogun SDK not available');
          navigate('/');
          return;
        }

        const oauth = shogun.getPlugin('oauth') as any;
        if (!oauth) {
          console.error('OAuth plugin not available');
          navigate('/');
          return;
        }

        // Handle the OAuth callback
        // Extract code and state from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const provider = urlParams.get('provider') || 'google'; // Default to google if not specified

        if (!code) {
          console.error('No authorization code found in URL');
          navigate('/?error=no_code');
          return;
        }

        const result = await oauth.handleOAuthCallback(provider, code, state);
        
        if (result.success) {
          console.log('OAuth callback successful:', result);
          navigate('/');
        } else {
          console.error('OAuth callback failed:', result.error);
          navigate('/');
        }
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [shogun, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4">Processing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback; 