/**
 * Backend Sponsorship Service Integration
 * Communication with backend for Walrus deployment
 */

import { Transaction } from '@mysten/sui/transactions';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Check if backend sponsorship is available
 */
export async function checkBackendSponsorship() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/sponsorship/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Backend sponsorship check failed:', error);
    return {
      available: false,
      error: error.message,
      fallback: 'Direct Enoki sponsorship through wallet',
    };
  }
}

/**
 * Request transaction sponsorship from backend
 * @param {Transaction} transaction - Sui transaction object
 * @param {string} sender - User's wallet address
 * @param {string} network - Network name (testnet/mainnet)
 */
export async function requestSponsoredTransaction(transaction, sender, network = 'testnet') {
  try {
    // Serialize transaction to base64
    const transactionBytes = await transaction.build();
    const transactionData = Buffer.from(transactionBytes).toString('base64');

    const response = await fetch(`${BACKEND_URL}/api/sponsorship/sponsor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionData,
        sender,
        network,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Sponsorship failed');
    }

    return {
      success: true,
      sponsoredTransaction: data.sponsoredTransaction,
    };
  } catch (error) {
    console.error('Transaction sponsorship failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Execute sponsored transaction through backend
 * @param {Object} sponsoredTransaction - Sponsored transaction from backend
 * @param {string} signature - User's signature
 */
export async function executeSponsoredTransaction(sponsoredTransaction, signature) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/sponsorship/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sponsoredTransaction,
        signature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Execution failed');
    }

    return {
      success: true,
      digest: data.digest,
      effects: data.effects,
    };
  } catch (error) {
    console.error('Transaction execution failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Helper: Check if backend sponsorship should be used
 * Returns true if VITE_BACKEND_URL is configured
 */
export function shouldUseBackendSponsorship() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  return !!(backendUrl && !backendUrl.includes('localhost'));
}

/**
 * Helper: Get sponsorship mode for UI display
 */
export function getSponsorshipMode() {
  if (shouldUseBackendSponsorship()) {
    return {
      mode: 'backend',
      label: 'Backend Sponsored',
      description: 'Transactions sponsored by backend service',
    };
  }
  
  const enokiKey = import.meta.env.VITE_ENOKI_PUBLIC_KEY;
  if (enokiKey && !enokiKey.includes('YOUR_KEY_HERE')) {
    return {
      mode: 'enoki',
      label: 'Enoki Direct',
      description: 'Transactions sponsored through Enoki wallet',
    };
  }
  
  return {
    mode: 'none',
    label: 'No Sponsorship',
    description: 'User pays gas fees',
  };
}
