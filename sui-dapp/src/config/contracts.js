// Contract configuration - Deployed on Sui Testnet
// Deployed: 30 November 2025
// Transaction: Ar9dmdHJTF46nms2LPBjTLhLQrsGph3BAsRnvghyVHWQ

export const CONTRACTS = {
  PACKAGE_ID: "0xdb0f5cdf05d5e03ceee2c00c4bfafe7e6a95a12f198362c7080017d1c57d28fb",
  PROJECT_REGISTRY: "0x373ca7995f0c408bc88355504633516a4a0e0aaffd3e93c9deb9d28000232861",
  USERNAME_REGISTRY: "0x4e893f556ca298e3ce4ce63c7e6c0f4311f6fa774b3d32f0349a59287e10b11e",
  // Jobs module - deployed 30 November 2025
  JOBS_REGISTRY: "0x438007120bd441b7863729f7f163bf9472b34b9ecb4c7cb56580389ea52fcf9f",
  JOBS_PACKAGE_ID: "0x7051e5fc1852ef619b7b6893eb623059c47359dde27b8c35bb23f64506f78b31",
  NETWORK: "testnet",
  
  // Backward compatibility aliases
  get CONTRIBUTION_REGISTRY() { return this.PROJECT_REGISTRY; },
};

// Jobs configuration
export const JOBS_CONFIG = {
  PACKAGE_ID: "0x7051e5fc1852ef619b7b6893eb623059c47359dde27b8c35bb23f64506f78b31",
  JOB_CREATED_EVENT: "0x7051e5fc1852ef619b7b6893eb623059c47359dde27b8c35bb23f64506f78b31::jobs::JobCreated",
  JOB_ASSIGNED_EVENT: "0x7051e5fc1852ef619b7b6893eb623059c47359dde27b8c35bb23f64506f78b31::jobs::JobAssigned",
  JOB_COMPLETED_EVENT: "0x7051e5fc1852ef619b7b6893eb623059c47359dde27b8c35bb23f64506f78b31::jobs::JobCompleted",
};

// Job status constants (matching Move contract)
export const JOB_STATUS = {
  OPEN: 0,
  ASSIGNED: 1,
  COMPLETED: 2,
  CANCELLED: 3,
};

export const JOB_STATUS_LABELS = {
  [JOB_STATUS.OPEN]: "Open",
  [JOB_STATUS.ASSIGNED]: "In Progress",
  [JOB_STATUS.COMPLETED]: "Completed",
  [JOB_STATUS.CANCELLED]: "Cancelled",
};

// Popular skill tags for jobs
export const SKILL_TAGS = [
  "JavaScript", "TypeScript", "React", "Vue", "Angular",
  "Node.js", "Python", "Rust", "Move", "Solidity",
  "C++", "C#", "Java", "Go", "Swift",
  "UI/UX", "Figma", "Design", "Frontend", "Backend",
  "Smart Contracts", "DeFi", "NFT", "Web3", "Blockchain",
  "API", "Database", "DevOps", "Testing", "Security",
];

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
