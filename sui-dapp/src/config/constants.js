/**
 * Global Application Constants
 * Centralized configuration for the entire app
 */

// Application info
export const APP_INFO = {
  name: 'AYS Team Platform',
  description: 'Decentralized project collaboration platform on Sui',
  version: '1.0.0',
  network: 'testnet',
}

// Feature flags
export const FEATURES = {
  SPONSORSHIP_ENABLED: true,
  MESSAGING_ENABLED: true,
  JOBS_ENABLED: true,
  LEADERBOARD_ENABLED: true,
}

// API endpoints
export const API_ENDPOINTS = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || '',
  FAUCET_URL: 'https://faucet.sui.io',
  EXPLORER_BASE: 'https://suiscan.xyz',
}

// Blockchain constants
export const BLOCKCHAIN = {
  SUI_DECIMALS: 9,
  MIN_GAS_BUDGET: 0.01, // 0.01 SUI minimum
  MIST_PER_SUI: 1_000_000_000,
}

// UI/UX constants
export const UI = {
  TOAST_DURATION: 3000,
  MAX_USERNAME_LENGTH: 20,
  MIN_USERNAME_LENGTH: 3,
  MAX_PROJECT_TITLE: 100,
  MAX_PROJECT_DESC: 500,
  MAX_JOB_TITLE: 100,
  MAX_JOB_DESC: 1000,
  ITEMS_PER_PAGE: 12,
}

// Time constants
export const TIME = {
  QUERY_STALE_TIME: 60 * 1000, // 1 minute
  QUERY_CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  FETCH_TIMEOUT: 10000, // 10 seconds
  LONG_FETCH_TIMEOUT: 15000, // 15 seconds
}

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFIX: 'user_',
  PROJECTS_PREFIX: 'projects_',
  JOBS_PREFIX: 'jobs_',
  THEME: 'theme',
}

// Validation patterns
export const VALIDATION = {
  USERNAME_PATTERN: /^[a-zA-Z0-9_]{3,20}$/,
  URL_PATTERN: /^https?:\/\/.+/,
  ADDRESS_PATTERN: /^0x[a-fA-F0-9]{64}$/,
}

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  INSUFFICIENT_GAS: 'Insufficient gas for this transaction',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_USERNAME:
    'Username must be 3-20 characters (letters, numbers, underscore)',
  USERNAME_TAKEN: 'Username already taken',
}

// Success messages
export const SUCCESS_MESSAGES = {
  TRANSACTION_SUCCESS: 'Transaction successful!',
  USERNAME_REGISTERED: 'Username registered successfully!',
  PROJECT_CREATED: 'Project created successfully!',
  JOB_CREATED: 'Job created successfully!',
  ENDORSEMENT_ADDED: 'Endorsement added!',
}
