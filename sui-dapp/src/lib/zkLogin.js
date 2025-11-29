import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { generateNonce, generateRandomness, jwtToAddress, getExtendedEphemeralPublicKey, getZkLoginSignature } from "@mysten/zklogin";
import { jwtDecode } from "jwt-decode";

export class ZkLoginService {
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    this.redirectUri = `${window.location.origin}/auth/callback`;
    this.maxEpoch = 10; // Maximum epoch for zkLogin proof validity
    this.enokiApiKey = import.meta.env.VITE_ENOKI_API_KEY;
    this.proverUrl = 'https://prover-dev.mystenlabs.com/v1';
  }

  // Generate OAuth URL for Google login
  getGoogleAuthUrl() {
    const ephemeralKeyPair = Ed25519Keypair.generate();
    const randomness = generateRandomness();
    const nonce = generateNonce(
      ephemeralKeyPair.getPublicKey(),
      this.maxEpoch,
      randomness
    );

    // Store for later use (serialize private key as base64)
    sessionStorage.setItem('zklogin_nonce', nonce);
    sessionStorage.setItem('zklogin_randomness', randomness);
    // Get the secret key and extract only the first 32 bytes (private key portion)
    const secretKey = ephemeralKeyPair.getSecretKey();
    const privateKeyBytes = secretKey.slice(0, 32); // First 32 bytes are the private key
    sessionStorage.setItem('zklogin_ephemeral_private_key', btoa(String.fromCharCode(...privateKeyBytes)));

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: nonce,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Parse JWT from URL fragment after OAuth redirect
  parseJwtFromUrl() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('id_token');
  }

  // Decode and get user info from JWT
  decodeJwt(jwt) {
    try {
      return jwtDecode(jwt);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      throw error;
    }
  }

  // Get Sui address from JWT
  async getSuiAddressFromJwt(jwt) {
    try {
      // Decode JWT to get user info
      const decodedJwt = this.decodeJwt(jwt);
      console.log('Decoded JWT:', decodedJwt);

      // For zkLogin, we need to derive the address from JWT + salt
      // This is a simplified version - in production you'd need ZK proof generation
      const userSalt = BigInt(decodedJwt.sub.replace(/\D/g, '').slice(0, 20) || '0');
      
      // Generate address using jwtToAddress with the user salt
      const address = jwtToAddress(jwt, userSalt);
      
      return address;
    } catch (error) {
      console.error('Error getting Sui address from JWT:', error);
      throw error;
    }
  }

  // Store user session
  storeSession(jwt, address) {
    sessionStorage.setItem('zklogin_jwt', jwt);
    sessionStorage.setItem('zklogin_address', address);
  }

  // Get stored session
  getSession() {
    const jwt = sessionStorage.getItem('zklogin_jwt');
    const address = sessionStorage.getItem('zklogin_address');
    
    if (jwt && address) {
      return { jwt, address };
    }
    return null;
  }

  // Clear session (logout)
  clearSession() {
    sessionStorage.removeItem('zklogin_jwt');
    sessionStorage.removeItem('zklogin_address');
    sessionStorage.removeItem('zklogin_nonce');
    sessionStorage.removeItem('zklogin_randomness');
    sessionStorage.removeItem('zklogin_ephemeral_private_key');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getSession();
  }

  // Get ZK proof from prover service
  async getZkProof(jwt, ephemeralPublicKey, maxEpoch, randomness, userSalt) {
    try {
      const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(ephemeralPublicKey);
      
      const requestPayload = {
        jwt,
        extendedEphemeralPublicKey,
        maxEpoch,
        jwtRandomness: randomness,
        salt: userSalt.toString(),
        keyClaimName: 'sub',
      };
      
      console.log('🔍 Requesting ZK proof from prover...', { 
        proverUrl: this.proverUrl,
        maxEpoch,
        saltLength: userSalt.toString().length 
      });
      
      const response = await fetch(this.proverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('❌ Prover error:', response.status, responseText);
        throw new Error(`Prover failed (${response.status}): ${responseText}`);
      }

      const zkProof = JSON.parse(responseText);
      console.log('✅ ZK proof received');
      return zkProof;
    } catch (error) {
      console.error('Error getting ZK proof:', error);
      throw error;
    }
  }

  // Create zkLogin signature for transaction
  async createZkLoginSignature(transactionBytes, jwt) {
    try {
      const session = this.getSession();
      if (!session) {
        throw new Error('No zkLogin session found');
      }

      const ephemeralPrivateKeyB64 = sessionStorage.getItem('zklogin_ephemeral_private_key');
      const randomness = sessionStorage.getItem('zklogin_randomness');
      
      if (!ephemeralPrivateKeyB64 || !randomness) {
        throw new Error('Missing ephemeral key or randomness');
      }

      // Recreate keypair from stored private key (base64 encoded)
      const privateKeyBytes = Uint8Array.from(atob(ephemeralPrivateKeyB64), c => c.charCodeAt(0));
      console.log('🔑 Restored private key length:', privateKeyBytes.length);
      
      if (privateKeyBytes.length !== 32) {
        throw new Error(`Invalid private key length: ${privateKeyBytes.length}, expected 32`);
      }
      
      const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
      console.log('✅ Keypair restored successfully');
      
      // Decode JWT to get user salt
      const decodedJwt = this.decodeJwt(jwt);
      const userSalt = BigInt(decodedJwt.sub.replace(/\D/g, '').slice(0, 20) || '0');

      // Get ZK proof from prover
      const zkProof = await this.getZkProof(
        jwt,
        ephemeralKeyPair.getPublicKey(),
        this.maxEpoch,
        randomness,
        userSalt
      );

      // Sign transaction with ephemeral key
      const { signature: ephemeralSignature } = await ephemeralKeyPair.signTransaction(transactionBytes);

      // Get final zkLogin signature
      const zkLoginSignature = getZkLoginSignature({
        inputs: zkProof,
        maxEpoch: this.maxEpoch,
        userSignature: ephemeralSignature,
      });

      return zkLoginSignature;
    } catch (error) {
      console.error('Error creating zkLogin signature:', error);
      throw error;
    }
  }

  // Request testnet SUI from faucet
  async requestTestnetSui(address) {
    try {
      const response = await fetch('https://faucet.testnet.sui.io/v1/gas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FixedAmountRequest: {
            recipient: address,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request testnet SUI');
      }

      return await response.json();
    } catch (error) {
      console.error('Error requesting testnet SUI:', error);
      throw error;
    }
  }

  // Execute transaction with zkLogin
  async executeTransaction(client, transactionBlock) {
    try {
      const session = this.getSession();
      if (!session) {
        throw new Error('No zkLogin session found');
      }

      // Set sender
      transactionBlock.setSender(session.address);

      // Check if address has gas coins
      try {
        const balance = await client.getBalance({ owner: session.address });
        if (BigInt(balance.totalBalance) === 0n) {
          console.log('⛽ No gas coins found. Requesting testnet SUI...');
          await this.requestTestnetSui(session.address);
          // Wait a bit for faucet transaction to complete
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (balanceError) {
        console.warn('Could not check balance:', balanceError);
      }

      // Build transaction
      const txBytes = await transactionBlock.build({ client });
      
      // Get zkLogin signature
      const signature = await this.createZkLoginSignature(txBytes, session.jwt);

      // Execute transaction
      const result = await client.executeTransactionBlock({
        transactionBlock: txBytes,
        signature,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      return { 
        digest: result.digest,
        effects: result.effects,
        objectChanges: result.objectChanges 
      };
    } catch (error) {
      console.error('Error executing transaction:', error);
      
      // If it's a gas error, provide helpful message
      if (error.message?.includes('gas')) {
        throw new Error(
          'Insufficient gas. Please request testnet SUI from https://faucet.testnet.sui.io/ for address: ' + 
          this.getSession()?.address
        );
      }
      
      throw error;
    }
  }
}

export const zkLoginService = new ZkLoginService();
