/**
 * Environment Variable Validation
 * Validates required env vars at build/runtime
 */

const requiredEnvVars = {
  VITE_ENOKI_PUBLIC_KEY: 'Enoki public API key',
  VITE_GOOGLE_CLIENT_ID: 'Google OAuth client ID',
}

const optionalEnvVars = {
  VITE_BACKEND_URL: 'Backend sponsorship service URL',
}

/**
 * Validate environment variables
 * @param {boolean} isProduction - Whether running in production
 * @throws {Error} If required vars are missing in production
 */
export const validateEnv = (isProduction = false) => {
  const missing = []
  const warnings = []

  // Check required vars
  for (const [key, description] of Object.entries(requiredEnvVars)) {
    const value = import.meta.env[key]
    if (!value || value.includes('YOUR_')) {
      missing.push(`${key} (${description})`)
    }
  }

  // Check optional vars
  for (const [key, description] of Object.entries(optionalEnvVars)) {
    const value = import.meta.env[key]
    if (!value || value.includes('YOUR_')) {
      warnings.push(`${key} (${description})`)
    }
  }

  // In production, throw error for missing required vars
  if (isProduction && missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
        `Please check your .env file and ensure all required variables are set.`
    )
  }

  // Log warnings for optional vars
  if (warnings.length > 0) {
    console.warn(
      `⚠️ Optional environment variables not set:\n${warnings.join('\n')}\n` +
        `Some features may be limited.`
    )
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  }
}

/**
 * Get environment info
 */
export const getEnvInfo = () => {
  return {
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    hasEnoki: !!(
      import.meta.env.VITE_ENOKI_PUBLIC_KEY &&
      !import.meta.env.VITE_ENOKI_PUBLIC_KEY.includes('YOUR_')
    ),
    hasBackend: !!(
      import.meta.env.VITE_BACKEND_URL &&
      !import.meta.env.VITE_BACKEND_URL.includes('localhost')
    ),
    hasGoogleAuth: !!(
      import.meta.env.VITE_GOOGLE_CLIENT_ID &&
      !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('YOUR_')
    ),
  }
}

// Run validation on import (development only)
if (import.meta.env.DEV) {
  const result = validateEnv(false)
  if (result.missing.length > 0) {
    console.error('❌ Missing required environment variables:', result.missing)
  }
}
