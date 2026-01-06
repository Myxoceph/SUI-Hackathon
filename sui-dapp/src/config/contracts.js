// Contract configuration - Deployed on Sui Testnet
// Deployed: 21 December 2024
// Transaction: HpP6ibbddPUkp9eiTMgEPgUHK3mzwpY5Z9MEbedPznLQ

export const CONTRACTS = {
  PACKAGE_ID:
    '0xc18934d5c07c01281333e47ca46f592cd90fe344de1b9290305a76b741d72661',
  PROJECT_REGISTRY:
    '0x9d62782afa87cb6b409dee1072e66774c160322b038acdfaf6888a09584cad55',
  USERNAME_REGISTRY:
    '0x5e7351755264e59ad23ffa4444c805c4b07655ecb55fc2951b5ab0728ecd1971',
  JOBS_REGISTRY:
    '0xa26a08b5a24039f4e51f9937136994a20470bf8c451bf9a67377213d40df85b4',
  JOBS_PACKAGE_ID:
    '0xc18934d5c07c01281333e47ca46f592cd90fe344de1b9290305a76b741d72661',
  NETWORK: 'testnet',

  // Backward compatibility aliases
  get CONTRIBUTION_REGISTRY() {
    return this.PROJECT_REGISTRY
  },
}

// Project Types
export const PROJECT_TYPES = [
  { value: 'Smart Contract', label: 'Smart Contract' },
  { value: 'DApp', label: 'DApp' },
  { value: 'Tool', label: 'Tool' },
  { value: 'Research', label: 'Research' },
  { value: 'Documentation', label: 'Documentation' },
  { value: 'Other', label: 'Other' },
]

// Contribution Types (alias for PROJECT_TYPES)
export const CONTRIBUTION_TYPES = PROJECT_TYPES

// Job Status Constants
export const JOB_STATUS = {
  OPEN: 0,
  ASSIGNED: 1,
  COMPLETED: 2,
  CANCELLED: 3,
}

export const JOB_STATUS_LABELS = {
  [JOB_STATUS.OPEN]: 'Open',
  [JOB_STATUS.ASSIGNED]: 'In Progress',
  [JOB_STATUS.COMPLETED]: 'Completed',
  [JOB_STATUS.CANCELLED]: 'Cancelled',
}

// Popular skill tags for jobs
export const SKILL_TAGS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Vue',
  'Angular',
  'Node.js',
  'Python',
  'Rust',
  'Move',
  'Solidity',
  'C++',
  'C#',
  'Java',
  'Go',
  'Swift',
  'UI/UX',
  'Figma',
  'Design',
  'Frontend',
  'Backend',
  'Smart Contracts',
  'DeFi',
  'NFT',
  'Web3',
  'Blockchain',
  'API',
  'Database',
  'DevOps',
  'Testing',
  'Security',
]

// Jobs configuration
export const JOBS_CONFIG = {
  PACKAGE_ID:
    '0xc18934d5c07c01281333e47ca46f592cd90fe344de1b9290305a76b741d72661',
  JOB_CREATED_EVENT:
    '0xc18934d5c07c01281333e47ca46f592cd90fe344de1b9290305a76b741d72661::jobs::JobCreated',
  JOB_ASSIGNED_EVENT:
    '0xc18934d5c07c01281333e47ca46f592cd90fe344de1b9290305a76b741d72661::jobs::JobAssigned',
  JOB_COMPLETED_EVENT:
    '0xc18934d5c07c01281333e47ca46f592cd90fe344de1b9290305a76b741d72661::jobs::JobCompleted',
}

// Messaging configuration
export const MESSAGING_CONFIG = {
  PACKAGE_ID:
    '0xc18934d5c07c01281333e47ca46f592cd90fe344de1b9290305a76b741d72661',
  MESSAGE_SENT_EVENT:
    '0xc18934d5c07c01281333e47ca46f592cd90fe344de1b9290305a76b741d72661::messaging::MessageSent',
}

// Utility function to get explorer URL
export const getExplorerUrl = (id, type = 'object') => {
  const baseUrl = 'https://suiscan.xyz/testnet'
  return `${baseUrl}/${type}/${id}`
}
