// Contract configuration - Deployed on Sui Testnet
// Deployed: 29 Kasım 2025
// Transaction: 5CYpRXhDC9eTDhrwJhd3vXeSYwqcHWPEmFfkjoQt7imR
// ✅ Double endorsement prevention enabled
// ✅ Frontend endorsement tracking enabled

export const CONTRACTS = {
  PACKAGE_ID: "0x57b7774f8e6d7eb8bf474f521d28aff50334697ef9d0a3cd7501337564629b39",
  CONTRIBUTION_REGISTRY: "0x51aff48f8de0c98860ade1d88053ea17a655b7b2b3ee7e550feedfa61a871c7e",
  USERNAME_REGISTRY: "0x94573a9a419609df8393d42d8ba829b81475c3861edfbd17d627654688710ac6",
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
