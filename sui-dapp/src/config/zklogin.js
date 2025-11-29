import { generateNonce, generateRandomness } from '@mysten/sui/zklogin';

/**
 * ZKLogin Configuration
 * Set up OAuth provider credentials in .env file
 */
export const ZKLOGIN_CONFIG = {
  // OAuth Client IDs - add these to your .env file
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  
  // Redirect URI - should match OAuth app configuration
  REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || window.location.origin + '/auth/callback',
  
  // Supported OAuth providers
  PROVIDERS: {
    GOOGLE: 'https://accounts.google.com',
  },

  // Mysten Labs prover service endpoints
  PROVER_URL: 'https://prover-dev.mystenlabs.com/v1',
  SALT_SERVICE_URL: import.meta.env.VITE_SALT_SERVICE_URL || '/api/zklogin/salt',
};

/**
 * Generate ephemeral keypair data for ZKLogin session
 * @returns {Object} Contains randomness, nonce, and max epoch
 */
export const generateEphemeralData = () => {
  const randomness = generateRandomness();
  const maxEpoch = 10; // Ephemeral key valid for 10 epochs (~10 days)
  
  return {
    randomness: randomness.toString(),
    maxEpoch,
  };
};

/**
 * Build Google OAuth URL with nonce
 * @param {string} nonce - The nonce generated for this session
 * @returns {string} Complete OAuth authorization URL
 */
export const buildGoogleAuthUrl = (nonce) => {
  const params = new URLSearchParams({
    client_id: ZKLOGIN_CONFIG.GOOGLE_CLIENT_ID,
    redirect_uri: ZKLOGIN_CONFIG.REDIRECT_URI,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: nonce,
    prompt: 'select_account',
  });

  return `${ZKLOGIN_CONFIG.PROVIDERS.GOOGLE}/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Extract ID token from OAuth callback URL (hash or query string)
 * @returns {string|null} JWT token or null if not found
 */
export const extractTokenFromHash = () => {
  console.log('[zklogin] Full URL:', window.location.href);
  console.log('[zklogin] Hash:', window.location.hash);
  console.log('[zklogin] Search:', window.location.search);
  
  // Try to get from hash first (standard OAuth implicit flow)
  // Remove the '#' character if present
  let hash = window.location.hash;
  if (hash.startsWith('#')) {
    hash = hash.substring(1);
  }
  
  if (hash) {
    const hashParams = new URLSearchParams(hash);
    console.log('[zklogin] Hash params:', Array.from(hashParams.entries()));
    
    const idToken = hashParams.get('id_token');
    if (idToken) {
      console.log('[zklogin] ID token found in hash');
      return idToken;
    }
  }
  
  // Try to get from query string (alternative)
  const searchParams = new URLSearchParams(window.location.search);
  const idToken = searchParams.get('id_token');
  if (idToken) {
    console.log('[zklogin] ID token found in query string');
    return idToken;
  }
  
  // Check for error parameters
  const hashParams = hash ? new URLSearchParams(hash) : null;
  const error = hashParams?.get('error') || searchParams.get('error');
  if (error) {
    const errorDesc = hashParams?.get('error_description') || searchParams.get('error_description') || 'Unknown error';
    console.error('[zklogin] OAuth error:', error, errorDesc);
    throw new Error(`OAuth error: ${error} - ${errorDesc}`);
  }
  
  console.error('[zklogin] No ID token found in URL');
  console.error('[zklogin] Available hash params:', hash ? Array.from(new URLSearchParams(hash).keys()) : []);
  console.error('[zklogin] Available query params:', Array.from(searchParams.keys()));
  
  return null;
};

/**
 * Decode JWT token (without verification - for display purposes only)
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};
