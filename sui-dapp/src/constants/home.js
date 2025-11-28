import { Code, Users, Shield, Activity, Globe } from "lucide-react";

export const STATS = [
  { label: "TOTAL CONTRIBUTIONS", value: "1,284", icon: Code },
  { label: "VERIFIED USERS", value: "843", icon: Users },
  { label: "ENDORSEMENTS", value: "3,921", icon: Shield },
  { label: "NETWORK ACTIVITY", value: "98.2%", icon: Activity },
];

export const FEATURES = [
  {
    icon: Shield,
    title: "Verifiable Proof",
    description: "Every contribution is hashed and stored on Sui. Immutable proof of your work history that cannot be forged or deleted.",
  },
  {
    icon: Users,
    title: "Peer Endorsements",
    description: "Reputation is built by peers, not platforms. Get endorsed by other verified builders in the ecosystem.",
  },
  {
    icon: Globe,
    title: "Open Network",
    description: "A public graph of contributions. Portable reputation that follows you across projects and communities.",
  },
];
