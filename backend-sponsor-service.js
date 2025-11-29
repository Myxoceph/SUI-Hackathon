/**
 * Enoki Sponsorship Backend Service
 * PRIVATE API key ile transaction sponsorship
 */

import { EnokiClient } from '@mysten/enoki';

// PRIVATE API KEY - SADECE BACKEND'TE KULLAN!
const ENOKI_PRIVATE_KEY = process.env.ENOKI_PRIVATE_KEY;

const enokiClient = new EnokiClient({
  apiKey: ENOKI_PRIVATE_KEY,
});

/**
 * Sponsor a transaction
 * @param {Transaction} transaction - Sui transaction object
 * @param {string} userAddress - User's wallet address
 * @returns {Promise} Sponsored transaction
 */
export async function sponsorTransaction(transaction, userAddress) {
  try {
    // Enoki automatically sponsors the transaction if budget available
    const sponsored = await enokiClient.createSponsoredTransaction({
      transaction,
      sender: userAddress,
      network: 'testnet',
    });
    
    return {
      success: true,
      sponsored,
    };
  } catch (error) {
    console.error('Sponsorship failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check if sponsorship is available
 */
export async function checkSponsorshipStatus() {
  try {
    // Check Enoki account balance/limits
    const status = await enokiClient.getAccountInfo();
    return {
      available: true,
      balance: status.balance,
      dailyLimit: status.limits?.daily,
      remaining: status.limits?.remaining,
    };
  } catch (error) {
    console.error('Failed to check sponsorship:', error);
    return {
      available: false,
      error: error.message,
    };
  }
}
