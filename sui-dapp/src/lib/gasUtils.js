/**
 * Gas Sponsorship Utilities
 * Functions for checking and managing Enoki sponsorship
 */

import { isGasError as checkIsGasError, getUserFriendlyError } from './errors'

/**
 * Detect if Enoki sponsorship is active
 * @param {Object} client - Sui client instance
 * @param {string} address - Wallet address
 * @returns {Promise<Object>} Sponsorship status
 */
export const checkEnokiSponsorship = async (client, address) => {
  try {
    const isEnokiWallet = address?.startsWith('0x')

    if (!isEnokiWallet) {
      return { isSponsored: false, reason: 'Not an Enoki wallet' }
    }

    const apiKey = import.meta.env.VITE_ENOKI_PUBLIC_KEY
    if (!apiKey || apiKey.includes('YOUR_KEY_HERE')) {
      return { isSponsored: false, reason: 'No Enoki API key' }
    }

    return {
      isSponsored: true,
      reason: 'Enoki configured - check Portal for sponsorship status',
      note: 'Enable sponsorship in https://portal.enoki.mystenlabs.com/',
    }
  } catch (error) {
    console.error('Error checking sponsorship:', error)
    return { isSponsored: false, reason: error.message }
  }
}

/**
 * Re-export error handling functions for backward compatibility
 * @deprecated Import from @/lib/errors instead
 */
export const isGasError = checkIsGasError
export const getGasErrorMessage = getUserFriendlyError
