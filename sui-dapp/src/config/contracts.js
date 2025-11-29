// Contract configuration - Deployed on Sui Testnet
// Deployed: 29 Kasım 2025
// Transaction: 8VBqtyapTAAotntqphZxFnTA8ufP6GH4pGLLb4AboSBG

export const CONTRACTS = {
  PACKAGE_ID: "0xfde88a1bc4f40e2cbed9a602f2072ee28b28acc45ebf56784b34f26b35f9415b",
  CONTRIBUTION_REGISTRY: "0x6a8bb7948cef285aa58c815eda6cf185f026e02421ab222dc1021bcfd10c1edc",
  USERNAME_REGISTRY: "0x817f133d7cab749234ae66c200653d979b71ca7d2ea53f0e49dcec1ffe36d8c1",
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
