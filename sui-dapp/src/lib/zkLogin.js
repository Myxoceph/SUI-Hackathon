/**
 * @deprecated This file is kept for backward compatibility only.
 * Enoki SDK (@mysten/enoki) now handles all zkLogin authentication automatically.
 * Use EnokiFlow component and @mysten/dapp-kit hooks instead.
 */

import { jwtDecode } from "jwt-decode";

/**
 * Utility: Decode JWT token
 */
export const decodeJwt = (jwt) => {
  try {
    return jwtDecode(jwt);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    throw error;
  }
};

/**
 * Utility: Open SUI faucet in new tab with pre-filled address
 * NOTE: With Enoki sponsored gas, this is only needed as fallback
 */
export const openFaucet = (address) => {
  const faucetUrl = `https://faucet.sui.io/?address=${address}`;
  window.open(faucetUrl, '_blank');
};

// Legacy exports for backward compatibility
export const zkLoginService = {
  decodeJwt,
  openFaucet,
};
