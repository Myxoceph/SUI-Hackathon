// Contract configuration - Deployed on Sui Testnet
// Deployed: 29 Kasım 2025
// Transaction: 2wEa1Wj6S6bhVwK8GoJQ93AkWLF4maniAUFzEJzBEUkA
// ✅ Double endorsement prevention enabled
// ✅ Frontend endorsement tracking enabled
// ✅ Display Standard enabled (NFT visualization)

export const CONTRACTS = {
  PACKAGE_ID: "0x0e6ef829edda622eb8cfb55b605990af681d80baa6ea12064f204cc24da63d0a",
  CONTRIBUTION_REGISTRY: "0x9e6711ee5ee1992d1e39bcb7b4acf764735edbfa16e662133b8d47f4d7d8b1df",
  USERNAME_REGISTRY: "0xa9d0610686d3a216972600389fce546d6720fb7684e8f5c1033428bb6cc4837b",
  NETWORK: "testnet",
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
