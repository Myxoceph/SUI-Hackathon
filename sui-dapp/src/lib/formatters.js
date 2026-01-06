export const formatAddress = address => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const formatBalance = balance => {
  if (!balance) return '0'
  // Convert from MIST to SUI (1 SUI = 10^9 MIST)
  return (Number(balance) / 1_000_000_000).toFixed(4)
}

export const formatSui = mist => {
  if (!mist) return '0'
  // Convert from MIST to SUI (1 SUI = 10^9 MIST)
  const sui = Number(mist) / 1_000_000_000
  // Format with appropriate decimal places
  if (sui >= 1000) {
    return sui.toLocaleString('en-US', { maximumFractionDigits: 0 })
  } else if (sui >= 1) {
    return sui.toLocaleString('en-US', { maximumFractionDigits: 2 })
  } else {
    return sui.toLocaleString('en-US', { maximumFractionDigits: 4 })
  }
}

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Format a timestamp or epoch to relative time (e.g., "2 hours ago")
 * Handles both millisecond timestamps and Sui epoch numbers
 */
export const formatTimeAgo = timestamp => {
  if (!timestamp) return 'Recently'

  let date
  const ts = Number(timestamp)

  // If timestamp is very small (< 100000), it's likely an epoch number, not a real timestamp
  // Sui epochs are sequential numbers, so we treat small numbers as "recent"
  if (ts < 100000) {
    return 'Recently'
  }

  // If timestamp is in seconds (10 digits), convert to milliseconds
  if (ts < 10000000000) {
    date = new Date(ts * 1000)
  } else {
    date = new Date(ts)
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Recently'
  }

  const now = new Date()
  const diffMs = now - date

  // If date is in the future or very far in the past, return the date
  if (diffMs < 0 || diffMs > 365 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString()
  }

  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) {
    return 'Just now'
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString()
  }
}
