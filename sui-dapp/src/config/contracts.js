// Contract configuration - Deployed on Sui Testnet
// Deployed: 29 Kasım 2025
// Transaction: Gh1V5JqVKdABekPhbbGMiCkM7jiMYXBuSWFjAm9nbqMt
// ✅ Project terminology refactoring complete
// ✅ Double endorsement prevention enabled
// ✅ Frontend endorsement tracking enabled
// ✅ Display Standard enabled (NFT visualization)
// ✅ Modular architecture with semantic naming

export const CONTRACTS = {
  PACKAGE_ID: "0x7add2d6e923e19ff1dc31f22502251fd35036c92a4cf414a2999b475a9045bf4",
  PROJECT_REGISTRY: "0x33f874d994bf04178847f58e1cd185c5007421c343520126d51b7c1701265ae3",
  USERNAME_REGISTRY: "0x20e2732119f6c8e61df8ac1fc80e0f284fa0cf8176996346b05ce155da2dc709",
  NETWORK: "testnet",
  
  // Backward compatibility aliases
  get CONTRIBUTION_REGISTRY() { return this.PROJECT_REGISTRY; },
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
