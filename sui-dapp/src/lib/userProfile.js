// User profile management
export const getUserProfile = (address) => {
  if (!address) return null;
  
  try {
    const data = localStorage.getItem(`user_${address}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error reading user profile:", error);
    return null;
  }
};

export const saveUserProfile = (address, profile) => {
  if (!address) return false;
  
  try {
    localStorage.setItem(`user_${address}`, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error("Error saving user profile:", error);
    return false;
  }
};

export const updateUserProfile = (address, updates) => {
  const profile = getUserProfile(address);
  if (!profile) return false;
  
  const updatedProfile = {
    ...profile,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  return saveUserProfile(address, updatedProfile);
};

export const isNewUser = (address) => {
  return !getUserProfile(address);
};

// Username validation
export const isValidUsername = (username) => {
  if (!username) return false;
  if (username.length < 3 || username.length > 20) return false;
  return /^[a-zA-Z0-9_-]+$/.test(username);
};

// Check if username is taken (mock - will be replaced with smart contract call)
export const isUsernameTaken = async (username) => {
  // TODO: Check on blockchain
  await new Promise(resolve => setTimeout(resolve, 500));
  return false;
};
