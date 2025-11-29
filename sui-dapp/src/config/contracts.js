// Contract configuration - Deployed on Sui Testnet
// Deployed: 30 November 2025
// Transaction: Ar9dmdHJTF46nms2LPBjTLhLQrsGph3BAsRnvghyVHWQ

export const CONTRACTS = {
  PACKAGE_ID: "0xdb0f5cdf05d5e03ceee2c00c4bfafe7e6a95a12f198362c7080017d1c57d28fb",
  PROJECT_REGISTRY: "0x373ca7995f0c408bc88355504633516a4a0e0aaffd3e93c9deb9d28000232861",
  USERNAME_REGISTRY: "0x4e893f556ca298e3ce4ce63c7e6c0f4311f6fa774b3d32f0349a59287e10b11e",
  NETWORK: "testnet",
  
  // Backward compatibility aliases
  get CONTRIBUTION_REGISTRY() { return this.PROJECT_REGISTRY; },
};

// Messaging configuration
export const MESSAGING_CONFIG = {
  PACKAGE_ID: "0xdb0f5cdf05d5e03ceee2c00c4bfafe7e6a95a12f198362c7080017d1c57d28fb",
  MESSAGE_SENT_EVENT: "0xdb0f5cdf05d5e03ceee2c00c4bfafe7e6a95a12f198362c7080017d1c57d28fb::messaging::MessageSent",
};

export const PROJECT_TYPES = [
  { value: "PULL REQUEST", label: "Pull Request", emoji: "🔀" },
  { value: "HACKATHON", label: "Hackathon", emoji: "🏆" },
  { value: "DOCUMENTATION", label: "Documentation", emoji: "📚" },
  { value: "PEER REVIEW", label: "Peer Review", emoji: "👥" },
  { value: "MENTORSHIP", label: "Mentorship", emoji: "🎓" },
  { value: "OPEN SOURCE", label: "Open Source", emoji: "💻" },
  { value: "WORKSHOP", label: "Workshop", emoji: "🎪" },
  { value: "OTHER", label: "Other", emoji: "✨" },
];

// Backward compatibility
export const CONTRIBUTION_TYPES = PROJECT_TYPES;

export const getExplorerUrl = (objectId, network = CONTRACTS.NETWORK) => {
  return `https://suiscan.xyz/${network}/object/${objectId}`;
};

export const getTxExplorerUrl = (txDigest, network = CONTRACTS.NETWORK) => {
  return `https://suiscan.xyz/${network}/tx/${txDigest}`;
};
