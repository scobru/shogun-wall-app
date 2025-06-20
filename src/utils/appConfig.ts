/**
 * Configurazione dell'applicazione Wallie.io
 * Gestisce token segreti e parametri di sicurezza
 */

// Token segreto univoco per Wallie.io nel Developer Token System
// In produzione questo dovrebbe essere caricato da variabili d'ambiente
export const APP_CONFIG = {
  // Token segreto per decrittare le credenziali ricevute dall'auth app
  SECRET_TOKEN: process.env.WALLIE_SECRET_TOKEN || '+sVycI6Ov2J89A0IP7eyWIa1b2qXNQmd6b7/94aJ41sFoxI67XXbHbD24w0SJbssy5FYwtatmPQFclgfOCTFBw==',
  
  // URL dell'applicazione di autenticazione
  AUTH_APP_URL: process.env.AUTH_APP_URL || 'http://localhost:8080',
  
  // Durata della sessione (7 giorni)
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000,
  
  // Informazioni dell'app per la registrazione
  APP_INFO: {
    name: 'HAL9000',
    description: 'Decentralized social platform',
    version: '1.0.0'
  },
  
  // Origini autorizzate per postMessage
  ALLOWED_ORIGINS: [
    'http://localhost:8080', // Shogun Auth app (sviluppo)
    'http://localhost:3000', // Wallie.io (sviluppo)
    // In produzione aggiungi i domini reali
  ]
};

/**
 * Verifica se un'origine è autorizzata
 */
export function isAllowedOrigin(origin: string): boolean {
  return APP_CONFIG.ALLOWED_ORIGINS.includes(origin);
}

/**
 * Genera URL per l'autenticazione con informazioni dell'app
 */
export function getAuthUrl(): string {
  const params = new URLSearchParams({
    app_name: APP_CONFIG.APP_INFO.name,
    app_url: window.location.origin,
    return_url: window.location.href
  });
  
  return `${APP_CONFIG.AUTH_APP_URL}?${params.toString()}`;
}

export default APP_CONFIG; 