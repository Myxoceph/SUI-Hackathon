// User profile management
export const getUserProfile = address => {
  if (!address) return null

  try {
    const data = localStorage.getItem(`user_${address}`)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error reading user profile:', error)
    return null
  }
}

export const saveUserProfile = (address, profile) => {
  if (!address) return false

  try {
    localStorage.setItem(`user_${address}`, JSON.stringify(profile))
    return true
  } catch (error) {
    console.error('Error saving user profile:', error)
    return false
  }
}

export const updateUserProfile = (address, updates) => {
  const profile = getUserProfile(address)
  if (!profile) return false

  const updatedProfile = {
    ...profile,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  return saveUserProfile(address, updatedProfile)
}

export const isNewUser = address => {
  return !getUserProfile(address)
}

// Username validation
export const isValidUsername = username => {
  if (!username) return false
  if (username.length < 3 || username.length > 20) return false
  return /^[a-zA-Z0-9_-]+$/.test(username)
}

// Check if username is taken
export const isUsernameTaken = username => {
  if (!username) return false

  const normalizedUsername = username.toLowerCase()

  // Check all localStorage keys for existing usernames
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('user_')) {
      try {
        const userData = JSON.parse(localStorage.getItem(key))
        if (userData?.username?.toLowerCase() === normalizedUsername) {
          return true
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }

  return false
}

// Get all users
export const getAllUsers = () => {
  const users = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('user_')) {
      try {
        const userData = JSON.parse(localStorage.getItem(key))
        if (userData?.username) {
          users.push(userData)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }

  return users
}
