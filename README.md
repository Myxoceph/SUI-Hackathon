# PeerFlow - Decentralized Collaboration Platform on Sui

<div align="center">

[![Sui Network](https://img.shields.io/badge/Sui-Testnet-4DA2FF?style=for-the-badge&logo=sui&logoColor=white)](https://sui.io/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Move](https://img.shields.io/badge/Move-Smart_Contracts-4DA2FF?style=for-the-badge&logo=blockchain&logoColor=white)](https://docs.sui.io/concepts/sui-move-concepts)
[![Walrus](https://img.shields.io/badge/Walrus-Hosting-FF6B6B?style=for-the-badge)](https://docs.walrus.site/)

**A decentralized platform for project collaboration, freelance jobs, and on-chain messaging built on Sui blockchain.**

[Live Demo](https://5muxfwg5tka1x7pra18ky54i5pqzo8zae9i2y8fkfhtwfp58g0.trwal.app/) • [Sui Explorer](https://suiscan.xyz/testnet/object/0xdb0f5cdf05d5e03ceee2c00c4bfafe7e6a95a12f198362c7080017d1c57d28fb) • [Documentation](#documentation)

</div>

---

## 🌟 Features

### 🔐 **zkLogin Authentication**
- Passwordless login via Google OAuth
- Powered by Mysten Labs Enoki
- Gas sponsorship for seamless UX

### 👤 **User Profiles**
- On-chain username registration as NFT
- Unique user identity across the platform
- Profile verification via blockchain

### 💼 **Project Management**
- Create and showcase projects on-chain
- Multiple project types: Pull Requests, Hackathons, Documentation, etc.
- Immutable proof of contributions
- Community endorsements

### 🎯 **Freelance Jobs**
- Post job listings with SUI token budgets
- Apply for jobs with cover letters
- Job assignment and completion tracking
- On-chain payment settlements

### 💬 **On-Chain Messaging**
- Peer-to-peer encrypted messaging
- All messages stored on Sui blockchain
- Transaction-verified message authenticity
- Permanent and immutable communication history

### 🏆 **Leaderboard & Community**
- Top contributors ranking
- Community profiles discovery
- Achievement tracking

---

## 🏗️ Architecture

### **Smart Contracts (Move)**

Located in `/move` directory:

```
move/
├── sources/
│   ├── username.move       # User profile NFTs
│   ├── contribution.move   # Project registry
│   ├── messaging.move      # On-chain messaging
│   └── jobs.move          # Freelance job platform
└── tests/
    └── contribution_tests.move
```

**Deployed Contracts (Testnet):**
- **Main Package**: `0xdb0f5cdf05d5e03ceee2c00c4bfafe7e6a95a12f198362c7080017d1c57d28fb`
- **Username Registry**: `0x4e893f556ca298e3ce4ce63c7e6c0f4311f6fa774b3d32f0349a59287e10b11e`
- **Project Registry**: `0x373ca7995f0c408bc88355504633516a4a0e0aaffd3e93c9deb9d28000232861`
- **Jobs Package**: `0x7051e5fc1852ef619b7b6893eb623059c47359dde27b8c35bb23f64506f78b31`

### **Frontend (React + TypeScript)**

Located in `/sui-dapp` directory:

```
sui-dapp/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Application pages
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and helpers
│   ├── config/          # Configuration files
│   └── constants/       # Application constants
├── public/              # Static assets
└── move/               # Local Move contract reference
```

**Tech Stack:**
- **Frontend**: React 18.3, Vite 7.1, TailwindCSS 3.4
- **Blockchain**: @mysten/dapp-kit 0.19, @mysten/sui 1.43
- **Authentication**: @mysten/enoki 0.12 (zkLogin)
- **State Management**: React Query, Context API
- **UI Components**: Radix UI, Lucide Icons

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **Sui CLI**: Latest version ([Installation Guide](https://docs.sui.io/guides/developer/getting-started/sui-install))
- **Walrus CLI** (for deployment): [Installation Guide](https://docs.walrus.site/usage/setup.html)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Myxoceph/SUI-Hackathon.git
   cd SUI-Hackathon
   ```

2. **Install frontend dependencies**
   ```bash
   cd sui-dapp
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` file in `sui-dapp/` directory:
   ```env
   VITE_ENOKI_PUBLIC_KEY=your_enoki_public_key
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   VITE_SUI_NETWORK=testnet
   ```

   > **Note**: Get your Enoki API key from [Mysten Labs Enoki Portal](https://portal.enoki.mystenlabs.com/)

### Development

**Start development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

**Key development commands:**
```bash
npm run build          # Build for production
npm run build:prod     # Production build with optimizations
npm run typecheck      # TypeScript type checking
npm run lint           # ESLint code analysis
npm run lint:fix       # Auto-fix linting issues
npm run clean          # Clean build artifacts
```

---

## 🌐 Deployment

### Walrus Deployment

PeerFlow is deployed on [Walrus](https://docs.walrus.site/), a decentralized storage network for Sui.

**Deploy to Walrus (10 days):**
```bash
npm run deploy:walrus
```

**Deploy to Walrus (30 days):**
```bash
npm run deploy:walrus:30d
```

**Manual deployment:**
```bash
# Build production bundle
npm run build:prod

# Publish to Walrus
site-builder publish --epochs 10 dist/
```

After deployment, your site will be accessible at:
```
https://{site-id}.trwal.app/
```

### Vercel/Netlify Deployment

The app can also be deployed to traditional hosting platforms:

1. Build the project: `npm run build`
2. Deploy the `dist/` directory
3. Configure environment variables in hosting dashboard

---

## 🎮 Usage Guide

### 1. **Connect Wallet**
- Click "Connect Wallet" button
- Choose Google OAuth for zkLogin
- Grant permissions

### 2. **Create Profile**
- Enter a unique username (3-20 characters)
- Username is minted as an NFT on-chain
- Gas fees sponsored by Enoki

### 3. **Create a Project**
- Navigate to "Contribute" page
- Fill in project details:
  - Type (Pull Request, Hackathon, etc.)
  - Title and description
  - Proof link (GitHub, etc.)
- Submit transaction

### 4. **Post a Job**
- Go to "Jobs" page
- Click "Post New Job"
- Specify:
  - Job title and description
  - Required skills
  - Budget in SUI tokens
- Confirm transaction

### 5. **Send Messages**
- Navigate to "Messages" page
- Click "New Chat"
- Enter recipient's SUI address
- Start on-chain messaging

### 6. **Explore Projects**
- Browse all projects in "Explore" page
- Endorse projects you like
- View project details on-chain

---

## 📖 Documentation

### Smart Contract Functions

#### Username Module
```move
public entry fun register_username(
    registry: &mut UsernameRegistry,
    username: String,
    ctx: &mut TxContext
)
```

#### Contribution Module
```move
public entry fun create_project(
    registry: &mut ProjectRegistry,
    project_type: String,
    title: String,
    description: String,
    proof_link: String,
    ctx: &mut TxContext
)

public entry fun endorse_project(
    registry: &mut ProjectRegistry,
    project_id: ID,
    ctx: &mut TxContext
)
```

#### Jobs Module
```move
public entry fun create_job(
    registry: &mut JobRegistry,
    title: String,
    description: String,
    tags: vector<String>,
    budget_sui: u64,
    ctx: &mut TxContext
)

public entry fun assign_job(
    registry: &mut JobRegistry,
    job_id: ID,
    worker: address,
    ctx: &mut TxContext
)
```

### Gas Budget Configuration

All transactions have optimized gas budgets:

| Transaction Type | Gas Budget |
|-----------------|-----------|
| Username Registration | 0.05 SUI |
| Create Project | 0.05 SUI |
| Create Job | 0.05 SUI |
| Endorse Project | 0.03 SUI |
| Apply for Job | 0.03 SUI |
| Assign Job | 0.03 SUI |
| Send Message | 0.02 SUI |

---

## 🔧 Configuration

### Enoki Gas Sponsorship

To enable automatic gas sponsorship:

1. Visit [Enoki Portal](https://portal.enoki.mystenlabs.com/)
2. Navigate to **Gas Sponsorship** section
3. Add Move Call Targets:
   ```
   0xdb0f5cdf05d5e03ceee2c00c4bfafe7e6a95a12f198362c7080017d1c57d28fb::username::register_username
   0xdb0f5cdf05d5e03ceee2c00c4bfafe7e6a95a12f198362c7080017d1c57d28fb::contribution::create_project
   0x7051e5fc1852ef619b7b6893eb623059c47359dde27b8c35bb23f64506f78b31::jobs::create_job
   ```
4. Click **SAVE**

### Network Configuration

The app defaults to Sui Testnet. To change networks:

```typescript
// sui-dapp/src/config/networkConfig.js
export const networkConfig = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});
```

---

## 🧪 Testing

### Frontend Tests
```bash
npm run test
```

### Smart Contract Tests
```bash
cd move
sui move test
```

### Manual Testing Checklist

- [ ] Wallet connection (zkLogin)
- [ ] Username registration
- [ ] Project creation
- [ ] Job posting
- [ ] Message sending
- [ ] Transaction confirmations
- [ ] Error handling

---

## 🛠️ Troubleshooting

### Common Issues

**1. "No valid gas coins found"**
- **Solution**: Get testnet SUI from [Sui Faucet](https://faucet.sui.io/)
- Or ensure Enoki sponsorship is configured correctly

**2. "Username already taken"**
- **Solution**: Try a different username
- Check on-chain registry for availability

**3. Black screen after deployment**
- **Solution**: Clear browser cache
- Check browser console for errors
- Verify environment variables

**4. Transaction failures**
- **Solution**: Check gas budget
- Verify wallet has sufficient balance
- Ensure network connectivity

---

## 📝 Project Structure

```
SUI-Hackathon/
├── move/                          # Move smart contracts
│   ├── sources/
│   │   ├── username.move
│   │   ├── contribution.move
│   │   ├── messaging.move
│   │   └── jobs.move
│   ├── tests/
│   └── Move.toml
│
├── sui-dapp/                      # React frontend
│   ├── src/
│   │   ├── components/           # UI components
│   │   │   ├── Chat.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── UsernameSetup.jsx
│   │   │   └── ui/              # Radix UI components
│   │   ├── pages/               # Application pages
│   │   │   ├── Home.jsx
│   │   │   ├── Explore.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── Messages.jsx
│   │   │   └── Passport.jsx
│   │   ├── contexts/            # React contexts
│   │   │   ├── WalletContext.jsx
│   │   │   └── MessagingContext.jsx
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Utilities
│   │   │   ├── suiTransactions.js
│   │   │   ├── jobTransactions.js
│   │   │   └── userProfile.js
│   │   ├── config/              # Configuration
│   │   │   ├── contracts.js
│   │   │   └── networkConfig.js
│   │   └── constants/           # Constants
│   ├── public/                  # Static assets
│   ├── index.html
│   ├── package.json
│   └── vite.config.mts
│
└── README.md                     # This file
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Live Application**: [https://5muxfwg5tka1x7pra18ky54i5pqzo8zae9i2y8fkfhtwfp58g0.trwal.app/](https://5muxfwg5tka1x7pra18ky54i5pqzo8zae9i2y8fkfhtwfp58g0.trwal.app/)
- **Sui Explorer**: [View Contracts](https://suiscan.xyz/testnet/object/0xdb0f5cdf05d5e03ceee2c00c4bfafe7e6a95a12f198362c7080017d1c57d28fb)
- **Sui Documentation**: [https://docs.sui.io/](https://docs.sui.io/)
- **Enoki Portal**: [https://portal.enoki.mystenlabs.com/](https://portal.enoki.mystenlabs.com/)
- **Walrus Documentation**: [https://docs.walrus.site/](https://docs.walrus.site/)

---

## 👥 Team

**AYS Team**
- Decentralized collaboration platform built for the Sui Hackathon 2025

---

## 🙏 Acknowledgments

- [Mysten Labs](https://mystenlabs.com/) - For Sui blockchain and Enoki infrastructure
- [Walrus](https://walrus.site/) - For decentralized hosting
- [Radix UI](https://www.radix-ui.com/) - For accessible UI components
- [Lucide Icons](https://lucide.dev/) - For beautiful icons

---

<div align="center">

**Built with ❤️ on Sui blockchain**

[⬆ Back to Top](#peerflow---decentralized-collaboration-platform-on-sui)

</div>
