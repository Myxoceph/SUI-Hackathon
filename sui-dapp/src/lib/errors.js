/**
 * Centralized Error Handling
 * Custom error classes and error handling utilities
 */

import { ERROR_MESSAGES } from '@/config/constants';

/**
 * Custom error classes
 */
export class WalletError extends Error {
  constructor(message = ERROR_MESSAGES.WALLET_NOT_CONNECTED) {
    super(message);
    this.name = 'WalletError';
  }
}

export class GasError extends Error {
  constructor(message = ERROR_MESSAGES.INSUFFICIENT_GAS, balance = 0) {
    super(message);
    this.name = 'GasError';
    this.balance = balance;
  }
}

export class TransactionError extends Error {
  constructor(message = ERROR_MESSAGES.TRANSACTION_FAILED, details = null) {
    super(message);
    this.name = 'TransactionError';
    this.details = details;
  }
}

export class NetworkError extends Error {
  constructor(message = ERROR_MESSAGES.NETWORK_ERROR) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Parse blockchain transaction errors
 */
export const parseTransactionError = (error) => {
  const errorMessage = error?.message?.toLowerCase() || error?.toString()?.toLowerCase() || '';
  
  // Gas related errors
  if (errorMessage.includes('insufficient') || 
      errorMessage.includes('gas') || 
      errorMessage.includes('balance') ||
      errorMessage.includes('no valid gas coins')) {
    return new GasError(ERROR_MESSAGES.INSUFFICIENT_GAS);
  }
  
  // Network errors
  if (errorMessage.includes('network') || 
      errorMessage.includes('timeout') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('connection')) {
    return new NetworkError(ERROR_MESSAGES.NETWORK_ERROR);
  }
  
  // User rejection
  if (errorMessage.includes('reject') || 
      errorMessage.includes('cancel') ||
      errorMessage.includes('denied')) {
    return new TransactionError('Transaction cancelled by user');
  }
  
  // Generic transaction error
  return new TransactionError(error?.message || ERROR_MESSAGES.TRANSACTION_FAILED, error);
};

/**
 * Check if error is gas-related
 */
export const isGasError = (error) => {
  return error instanceof GasError || 
         parseTransactionError(error) instanceof GasError;
};

/**
 * Check if error is network-related
 */
export const isNetworkError = (error) => {
  return error instanceof NetworkError || 
         parseTransactionError(error) instanceof NetworkError;
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyError = (error, balance = 0) => {
  const parsed = parseTransactionError(error);
  
  if (parsed instanceof GasError) {
    if (balance === 0) {
      return '💰 No gas available. Get free testnet SUI to continue!';
    }
    if (balance < 0.01) {
      return `💰 Low balance (${balance.toFixed(4)} SUI). You need at least 0.01 SUI.`;
    }
    return ERROR_MESSAGES.INSUFFICIENT_GAS;
  }
  
  if (parsed instanceof NetworkError) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  return parsed.message || ERROR_MESSAGES.TRANSACTION_FAILED;
};

/**
 * Safe error logger
 */
export const logError = (context, error, additionalInfo = {}) => {
  console.error(`[${context}]`, {
    error: error?.message || error,
    name: error?.name,
    stack: error?.stack,
    ...additionalInfo,
  });
};

/**
 * Error boundary fallback
 */
export const getErrorBoundaryMessage = (error) => {
  return {
    title: 'Something went wrong',
    message: error?.message || 'An unexpected error occurred',
    suggestion: 'Please try refreshing the page or contact support if the issue persists.',
  };
};
