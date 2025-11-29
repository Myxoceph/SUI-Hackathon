import { createContext, useContext, useState, useEffect } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, getExtendedEphemeralPublicKey } from '@mysten/sui/zklogin';
import { genAddressSeed, getZkLoginSignature } from '@mysten/sui/zklogin';
import { jwtToAddress } from '@mysten/sui/zklogin';
import { useSuiClient } from '@mysten/dapp-kit';
import { 
  ZKLOGIN_CONFIG, 
  generateEphemeralData, 
  buildGoogleAuthUrl,
  decodeJwt 
} from '@/config/zklogin';
import { toast } from 'sonner';

const ZKLoginContext = createContext(null);

export const ZKLoginProvider = ({ children }) => {
  const [zkAccount, setZkAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ephemeralKeyPair, setEphemeralKeyPair] = useState(null);
  const client = useSuiClient();

  // Load saved session on mount
  useEffect(() => {
    const loadSession = () => {
      try {
        const savedSession = localStorage.getItem('zklogin_session');
        if (savedSession) {
          const session = JSON.parse(savedSession);
          
          // Check if salt is in correct format (hex string, 32 chars = 16 bytes)
          const isValidSalt = session.salt && 
                             typeof session.salt === 'string' && 
                             /^[0-9a-f]{32}$/i.test(session.salt);
          
          // Check if session is still valid
          if (session.expiresAt && Date.now() < session.expiresAt && isValidSalt) {
            setZkAccount(session);
            
            // Restore ephemeral keypair if available
            if (session.ephemeralPrivateKey) {
              try {
                // Decode base64 to Uint8Array (32 bytes)
                const binaryString = atob(session.ephemeralPrivateKey);
                const secretKey = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  secretKey[i] = binaryString.charCodeAt(i);
                }
                const keypair = Ed25519Keypair.fromSecretKey(secretKey);
                setEphemeralKeyPair(keypair);
              } catch (error) {
                console.error('Error restoring keypair:', error);
              }
            }
          } else {
            // Session expired or invalid salt format, clear it
            console.log('[ZKLogin] Clearing invalid session:', isValidSalt ? 'expired' : 'invalid salt format');
            localStorage.removeItem('zklogin_session');
          }
        }
      } catch (error) {
        console.error('Error loading ZKLogin session:', error);
        localStorage.removeItem('zklogin_session');
      }
    };

    loadSession();
  }, []);

  /**
   * Initiate Google OAuth login flow
   */
  const loginWithGoogle = async () => {
    console.log('[ZKLogin] loginWithGoogle called');
    
    if (!ZKLOGIN_CONFIG.GOOGLE_CLIENT_ID) {
      console.error('[ZKLogin] Google Client ID not configured');
      toast.error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env');
      return;
    }

    console.log('[ZKLogin] Google Client ID found:', ZKLOGIN_CONFIG.GOOGLE_CLIENT_ID);
    setLoading(true);
    
    try {
      // Generate ephemeral keypair
      const keypair = new Ed25519Keypair();
      console.log('[ZKLogin] Ephemeral keypair generated');
      
      const ephemeralData = generateEphemeralData();
      console.log('[ZKLogin] Ephemeral data generated:', ephemeralData);
      
      // Generate nonce from ephemeral public key
      const ephemeralPublicKey = keypair.getPublicKey();
      const nonce = generateNonce(
        ephemeralPublicKey,
        ephemeralData.maxEpoch,
        ephemeralData.randomness
      );
      console.log('[ZKLogin] Nonce generated:', nonce);

      // Store ephemeral data in session storage (temporary)
      // Extract the first 32 bytes of the secret key and convert to base64
      const fullSecretKey = keypair.getSecretKey();
      const secretKey32 = fullSecretKey.slice(0, 32); // Get first 32 bytes
      const secretKeyBase64 = btoa(String.fromCharCode(...secretKey32));
      
      sessionStorage.setItem('zklogin_ephemeral', JSON.stringify({
        ...ephemeralData,
        ephemeralPrivateKey: secretKeyBase64,
        nonce,
      }));
      console.log('[ZKLogin] Ephemeral data stored in sessionStorage');

      // Build and redirect to Google OAuth
      const authUrl = buildGoogleAuthUrl(nonce);
      console.log('[ZKLogin] Redirecting to:', authUrl);
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('[ZKLogin] Initialization error:', error);
      toast.error('Failed to initialize login');
      setLoading(false);
    }
  };

  /**
   * Handle OAuth callback with JWT token
   */
  const handleCallback = async (jwtToken) => {
    console.log('[ZKLogin] handleCallback called');
    setLoading(true);
    
    try {
      // Retrieve ephemeral data from session storage
      const ephemeralDataStr = sessionStorage.getItem('zklogin_ephemeral');
      console.log('[ZKLogin] Ephemeral data from session:', ephemeralDataStr ? 'FOUND' : 'NOT FOUND');
      
      if (!ephemeralDataStr) {
        throw new Error('No ephemeral data found. Please try logging in again.');
      }

      const ephemeralData = JSON.parse(ephemeralDataStr);
      console.log('[ZKLogin] Ephemeral data parsed:', ephemeralData);
      
      // Recreate keypair from stored base64 secret key (32 bytes)
      const binaryString = atob(ephemeralData.ephemeralPrivateKey);
      const secretKey = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        secretKey[i] = binaryString.charCodeAt(i);
      }
      const keypair = Ed25519Keypair.fromSecretKey(secretKey);
      console.log('[ZKLogin] Keypair recreated successfully');

      // Decode JWT to get user info
      const decodedJwt = decodeJwt(jwtToken);
      console.log('[ZKLogin] JWT decoded:', decodedJwt);
      console.log('[ZKLogin] JWT nonce:', decodedJwt.nonce);
      console.log('[ZKLogin] Stored nonce:', ephemeralData.nonce);
      
      if (!decodedJwt) {
        throw new Error('Invalid JWT token');
      }
      
      // Verify nonce matches
      if (decodedJwt.nonce !== ephemeralData.nonce) {
        console.error('[ZKLogin] Nonce mismatch! JWT:', decodedJwt.nonce, 'Stored:', ephemeralData.nonce);
        throw new Error('Nonce mismatch. Please try logging in again.');
      }
      console.log('[ZKLogin] Nonce verified successfully');

      // Generate a deterministic salt based on user's sub (subject identifier)
      // In production, you should use a backend service to manage salts securely
      console.log('[ZKLogin] Generating salt for user:', decodedJwt.sub);
      const salt = await generateSalt(decodedJwt.sub);
      console.log('[ZKLogin] Salt generated:', salt);

      // Derive ZK address from JWT
      console.log('[ZKLogin] Deriving ZK address...');
      const userAddress = jwtToAddress(jwtToken, BigInt('0x' + salt));
      console.log('[ZKLogin] ZK Address derived:', userAddress);

      // Create account object
      // Extract first 32 bytes and convert to base64
      const fullSecretKey = keypair.getSecretKey();
      const secretKey32 = fullSecretKey.slice(0, 32);
      const base64Key = btoa(String.fromCharCode(...secretKey32));
      
      const account = {
        address: userAddress,
        provider: 'google',
        email: decodedJwt.email,
        name: decodedJwt.name,
        picture: decodedJwt.picture,
        sub: decodedJwt.sub,
        jwtToken,
        salt,
        ephemeralPrivateKey: base64Key,
        randomness: ephemeralData.randomness,
        maxEpoch: ephemeralData.maxEpoch,
        expiresAt: decodedJwt.exp * 1000, // Convert to milliseconds
      };

      console.log('[ZKLogin] Account object created:', { ...account, jwtToken: '***', ephemeralPrivateKey: '***' });

      // Save to state and storage
      setZkAccount(account);
      setEphemeralKeyPair(keypair);
      localStorage.setItem('zklogin_session', JSON.stringify(account));
      console.log('[ZKLogin] Session saved to localStorage');
      
      // Clear temporary session storage
      sessionStorage.removeItem('zklogin_ephemeral');
      console.log('[ZKLogin] Ephemeral data cleared from sessionStorage');

      toast.success(`Welcome, ${decodedJwt.name || 'User'}!`);
      
      return account;
    } catch (error) {
      console.error('[ZKLogin] Callback error:', error);
      toast.error(error.message || 'Authentication failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign and execute transaction with ZKLogin
   */
  const signAndExecuteZkTransaction = async (transactionBlock) => {
    if (!zkAccount || !ephemeralKeyPair) {
      throw new Error('ZKLogin not initialized. Please log in first.');
    }

    try {
      // Reload account from localStorage to ensure fresh data
      const savedSession = localStorage.getItem('zklogin_session');
      const freshAccount = savedSession ? JSON.parse(savedSession) : zkAccount;
      
      console.log('[ZKLogin] Using account salt:', freshAccount.salt, 'length:', freshAccount.salt?.length);

      // Check if session is still valid
      if (Date.now() >= freshAccount.expiresAt) {
        throw new Error('Session expired. Please log in again.');
      }

      // Set sender
      transactionBlock.setSenderIfNotSet(freshAccount.address);

      // Build transaction
      const txBytes = await transactionBlock.build({ client });

      // Sign with ephemeral key
      const signature = await ephemeralKeyPair.signTransaction(txBytes);

      // Get ZK proof from prover service
      const zkProof = await getZkProof(freshAccount);

      // Combine signature with ZK proof
      const zkSignature = getZkLoginSignature({
        inputs: {
          ...zkProof,
          addressSeed: genAddressSeed(
            BigInt('0x' + freshAccount.salt),
            'sub',
            freshAccount.sub,
            decodedJwt(freshAccount.jwtToken).aud
          ).toString(),
        },
        maxEpoch: zkAccount.maxEpoch,
        userSignature: signature.signature,
      });

      // Execute transaction
      const result = await client.executeTransactionBlock({
        transactionBlock: txBytes,
        signature: zkSignature,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      return result;
    } catch (error) {
      console.error('ZKLogin transaction error:', error);
      throw error;
    }
  };

  /**
   * Logout - clear all ZKLogin data
   */
  const logout = () => {
    setZkAccount(null);
    setEphemeralKeyPair(null);
    localStorage.removeItem('zklogin_session');
    sessionStorage.removeItem('zklogin_ephemeral');
    
    // Clear all ZKLogin related data (for migration)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('zklogin_') || key.includes('ephemeral')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('zklogin_') || key.includes('ephemeral')) {
        sessionStorage.removeItem(key);
      }
    });
    
    toast.success('Logged out successfully');
  };

  const value = {
    zkAccount,
    isZkConnected: !!zkAccount,
    loading,
    loginWithGoogle,
    handleCallback,
    signAndExecuteZkTransaction,
    logout,
  };

  return (
    <ZKLoginContext.Provider value={value}>
      {children}
    </ZKLoginContext.Provider>
  );
};

export const useZKLogin = () => {
  const context = useContext(ZKLoginContext);
  if (!context) {
    throw new Error('useZKLogin must be used within ZKLoginProvider');
  }
  return context;
};

// Helper Functions

/**
 * Generate a deterministic salt for a user
 * In production, this should be done by a secure backend service
 */
async function generateSalt(userIdentifier) {
  // Simple deterministic salt generation
  // WARNING: In production, use a proper backend service to generate and store salts
  const encoder = new TextEncoder();
  const data = encoder.encode(userIdentifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // Return first 16 bytes as hex string (32 characters)
  return hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get ZK proof from Mysten Labs prover service
 * Note: This is a simplified version. Full implementation requires proper proof generation
 */
async function getZkProof(account) {
  try {
    console.log('[ZKLogin] Getting ZK proof...');
    
    // Decode base64 to Uint8Array (32 bytes)
    const binaryString = atob(account.ephemeralPrivateKey);
    const secretKey = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      secretKey[i] = binaryString.charCodeAt(i);
    }
    const keypair = Ed25519Keypair.fromSecretKey(secretKey);
    const extendedPubKey = getExtendedEphemeralPublicKey(keypair.getPublicKey());
    
    console.log('[ZKLogin] Recreated keypair public key:', keypair.getPublicKey().toBase64());
    console.log('[ZKLogin] Extended public key:', extendedPubKey);
    console.log('[ZKLogin] Randomness:', account.randomness);
    console.log('[ZKLogin] MaxEpoch:', account.maxEpoch);
    
    // Verify nonce computation
    const computedNonce = generateNonce(
      keypair.getPublicKey(),
      account.maxEpoch,
      account.randomness
    );
    console.log('[ZKLogin] Computed nonce from data:', computedNonce);
    console.log('[ZKLogin] Expected nonce (from JWT):', account.jwtToken ? decodeJwt(account.jwtToken).nonce : 'N/A');
    
    // Convert hex salt to BigInt string for prover
    const saltBigInt = BigInt('0x' + account.salt).toString();
    
    const proofRequest = {
      jwt: account.jwtToken,
      extendedEphemeralPublicKey: extendedPubKey,
      maxEpoch: account.maxEpoch,
      jwtRandomness: account.randomness,
      salt: saltBigInt,
      keyClaimName: 'sub',
    };
    
    console.log('[ZKLogin] Proof request:', {
      ...proofRequest,
      jwt: '***' + account.jwtToken.slice(-20),
      extendedEphemeralPublicKey: extendedPubKey,
      salt: saltBigInt,
      saltOriginal: account.salt,
      saltLength: saltBigInt.length,
      saltType: typeof saltBigInt
    });
    
    const response = await fetch(`${ZKLOGIN_CONFIG.PROVER_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proofRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ZKLogin] Prover error:', response.status, errorText);
      throw new Error(`Prover service error (${response.status}): ${errorText}`);
    }

    const proof = await response.json();
    console.log('[ZKLogin] Proof received successfully');
    return proof;
  } catch (error) {
    console.error('[ZKLogin] Error getting ZK proof:', error);
    throw new Error('Failed to generate ZK proof. Transaction cannot be signed.');
  }
}
