import { Code, Users, Shield, Activity, Globe } from 'lucide-react'

// Stats will be fetched from Move smart contract
export const STATS = [
  { label: 'TOTAL PROJECTS', value: '0', icon: Code },
  { label: 'VERIFIED USERS', value: '0', icon: Users },
  { label: 'ENDORSEMENTS', value: '0', icon: Shield },
  { label: 'NETWORK ACTIVITY', value: '0%', icon: Activity },
]

export const FEATURES = [
  {
    icon: Shield,
    title: 'Verifiable Proof',
    description:
      'Every project is hashed and stored on Sui. Immutable proof of your work history that cannot be forged or deleted.',
  },
  {
    icon: Users,
    title: 'Peer Endorsements',
    description:
      'Reputation is built by peers, not platforms. Get endorsed by other verified builders in the ecosystem.',
  },
  {
    icon: Globe,
    title: 'Open Network',
    description:
      'A public graph of projects. Portable reputation that follows you across projects and communities.',
  },
]
