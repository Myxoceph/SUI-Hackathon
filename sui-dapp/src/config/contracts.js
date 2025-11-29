// Contract configuration - will be populated after deployment
// Run: cd move && ./deploy.sh

export const CONTRACTS = {
  PACKAGE_ID: "TO_BE_DEPLOYED",
  CONTRIBUTION_REGISTRY: "TO_BE_DEPLOYED",
  USERNAME_REGISTRY: "TO_BE_DEPLOYED",
  NETWORK: "testnet", // or "devnet" for development
};

export const CONTRIBUTION_TYPES = [
  { value: "PULL REQUEST", label: "Pull Request", emoji: "🔀" },
  { value: "HACKATHON", label: "Hackathon", emoji: "🏆" },
  { value: "DOCUMENTATION", label: "Documentation", emoji: "📚" },
  { value: "PEER REVIEW", label: "Peer Review", emoji: "👥" },
  { value: "MENTORSHIP", label: "Mentorship", emoji: "🎓" },
  { value: "OPEN SOURCE", label: "Open Source", emoji: "💻" },
  { value: "WORKSHOP", label: "Workshop", emoji: "🎪" },
  { value: "OTHER", label: "Other", emoji: "✨" },
];

export const getExplorerUrl = (objectId, network = CONTRACTS.NETWORK) => {
  return `https://suiscan.xyz/${network}/object/${objectId}`;
};

export const getTxExplorerUrl = (txDigest, network = CONTRACTS.NETWORK) => {
  return `https://suiscan.xyz/${network}/tx/${txDigest}`;
};
