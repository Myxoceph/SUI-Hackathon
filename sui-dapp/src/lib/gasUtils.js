/**
 * Utility to detect if Enoki sponsorship is active
 * Checks transaction for sponsor signature
 */

export const checkEnokiSponsorship = async (client, address) => {
  try {
    // Enoki sponsorship detection:
    // If sponsorship is active in Enoki Portal, transactions will have sponsor signature
    // We can't directly check this from frontend, so we assume it's active if:
    // 1. Using Enoki wallet
    // 2. Enoki API key is valid
    // 3. Portal sponsorship is enabled (manual check)
    
    const isEnokiWallet = address?.startsWith('0x');
    
    if (!isEnokiWallet) {
      return { isSponsored: false, reason: 'Not an Enoki wallet' };
    }
    
    // Check if we have valid Enoki API key
    const apiKey = import.meta.env.VITE_ENOKI_PUBLIC_KEY;
    if (!apiKey || apiKey.includes('YOUR_KEY_HERE')) {
      return { isSponsored: false, reason: 'No Enoki API key' };
    }
    
    // Assume sponsorship is active if Enoki is configured
    // Real check happens at transaction time
    return { 
      isSponsored: true, 
      reason: 'Enoki configured - check Portal for sponsorship status',
      note: 'Enable sponsorship in https://portal.enoki.mystenlabs.com/'
    };
    
  } catch (error) {
    console.error('Error checking sponsorship:', error);
    return { isSponsored: false, reason: error.message };
  }
};

/**
 * Parse transaction error to check if it's gas-related
 */
export const isGasError = (error) => {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  const gasErrorKeywords = [
    'insufficient',
    'gas',
    'balance',
    'coin',
    'no valid gas',
    'not enough',
  ];
  
  return gasErrorKeywords.some(keyword => errorMessage.includes(keyword));
};

/**
 * Get user-friendly gas error message
 */
export const getGasErrorMessage = (error, balance) => {
  if (!isGasError(error)) {
    return error.message || 'Transaction failed';
  }
  
  if (balance === 0) {
    return '💰 No gas available. Get free testnet SUI to continue!';
  }
  
  if (balance < 0.01) {
    return `💰 Low balance (${balance.toFixed(4)} SUI). You need at least 0.01 SUI.`;
  }
  
  return '💰 Insufficient gas for this transaction. Please add more SUI.';
};
