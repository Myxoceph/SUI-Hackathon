# On-Chain Talent Passport & Task Marketplace

A decentralized talent marketplace built on Sui blockchain that enables verifiable skill profiles, transparent task management, and non-transferable skill credentials (SBTs).

## 🎯 Overview

This MVP enables communities to:
- Create verifiable on-chain skill profiles
- Publish tasks with SUI token rewards
- Apply to and complete tasks
- Earn non-transferable Soul-Bound Tokens (SBTs) as skill credentials
- Build reputation through successful task completion

## 🏗️ Architecture

### Smart Contracts (Move)
- **ProfileModule** (`profile.move`): User profile management with reputation tracking
- **TaskModule** (`task.move`): Task lifecycle management (create, apply, accept, submit, confirm)
- **SBTModule** (`sbt.move`): Non-transferable skill badge minting

### Frontend (Next.js + React)
- Profile management page
- Task browsing and creation
- Task application and submission flows
- Wallet integration via Sui dApp Kit

## 📋 Prerequisites

- Node.js 18+ and npm
- Sui CLI installed ([installation guide](https://docs.sui.io/build/install))
- A Sui wallet (Sui Wallet browser extension recommended)
- Testnet SUI tokens ([faucet](https://discord.com/channels/916379725201563759/971488439931392130))

## 🚀 Quick Start

### 1. Deploy Smart Contracts

```bash
# Navigate to contracts directory
cd contracts

# Build the Move package
sui move build

# Deploy to testnet
sui client publish --gas-budget 100000000

# Save the Package ID from the output
```

After deployment, note the **Package ID** from the output.

### 2. Set Up Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local and add your deployed Package ID
# NEXT_PUBLIC_PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📖 User Flow Demo

### Complete Demo Workflow

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve connection in Sui Wallet

2. **Create Profile**
   - Navigate to "Profile" page
   - Upload profile metadata to IPFS (use [Pinata](https://pinata.cloud/) or similar)
   - Paste IPFS URI (e.g., `ipfs://QmXXX...`)
   - Click "Create Profile"
   - Approve transaction in wallet

3. **Create a Task** (Task Creator)
   - Click "Create New Task"
   - Enter reward amount in SUI (e.g., 1.5)
   - Upload task description and requirements to IPFS
   - Paste IPFS URIs for skills and description
   - Click "Create Task"
   - Approve transaction (SUI will be locked in escrow)

4. **Apply to Task** (Contributor)
   - Browse available tasks on "Tasks" page
   - Click "View Details" on a task
   - Click "Apply to Task"
   - Approve transaction

5. **Accept Applicant** (Task Creator)
   - View applicants on task detail page
   - Select an applicant
   - Click "Accept Applicant"
   - Task status changes to "In Progress"

6. **Submit Work** (Selected Contributor)
   - Upload completed work to IPFS
   - Navigate to task detail page
   - Click "Submit Work"
   - Approve transaction

7. **Confirm Completion** (Task Creator)
   - Review submitted work
   - Click "Confirm Completion"
   - This triggers:
     - SUI reward transfer to contributor
     - Reputation increase (+10 points)
     - SBT (Skill Badge) minted to contributor
   - Task status changes to "Completed"

## 🔧 Smart Contract Functions

### ProfileModule
```move
// Create a new user profile
create_profile(metadata_uri: vector<u8>)

// Update profile metadata
update_metadata_uri(profile: &mut UserProfile, new_uri: vector<u8>)

// Internal: Increase reputation
increase_reputation(profile: &mut UserProfile, score: u64)
```

### TaskModule
```move
// Create a new task with reward
create_task(reward: Coin<SUI>, required_skills_uri: vector<u8>, description_uri: vector<u8>)

// Apply to an open task
apply_to_task(task: &mut Task)

// Accept an applicant (creator only)
accept_applicant(task: &mut Task, applicant: address)

// Submit work (selected applicant only)
submit_work(task: &mut Task)

// Confirm completion and distribute rewards (creator only)
confirm_completion(task: &mut Task, applicant_profile: &mut UserProfile)
```

### SBTModule
```move
// Mint a non-transferable skill badge (internal)
mint_skill_badge(holder: address, task_id: address, metadata_uri: String)
```

## 🏆 Key Features

### On-Chain Verification
- All profiles, tasks, and credentials stored on Sui blockchain
- Transparent and immutable history
- Public verification of skill badges

### Non-Transferable Credentials
- SBTs use only `key` ability (no `store`)
- Cannot be sold or transferred after minting
- Permanently linked to original holder

### Escrow System
- Task rewards locked in Task object upon creation
- Automatic release upon task completion
- No third-party custody required

### Reputation System
- Reputation score increases with each successful task
- Displayed on user profiles
- Foundation for future skill matching

## 📂 Project Structure

```
.
├── contracts/
│   ├── sources/
│   │   ├── profile.move      # Profile management
│   │   ├── task.move          # Task lifecycle
│   │   └── sbt.move           # Soul-Bound Tokens
│   └── Move.toml              # Package configuration
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx     # Root layout
    │   │   ├── page.tsx       # Home page
    │   │   ├── profile/       # Profile pages
    │   │   ├── tasks/         # Task pages
    │   │   └── my-tasks/      # User's tasks
    │   ├── components/        # React components
    │   ├── config/            # Configuration
    │   └── styles/            # Global styles
    ├── package.json
    └── tsconfig.json
```

## 🔌 Optional Integrations (Bonus)

The architecture supports these enhancements:

1. **zkLogin**: Replace wallet connect with zkLogin for social auth
2. **AI Skill Matcher**: External API endpoint for matching tasks to profiles
3. **Event Subscriptions**: Real-time updates via Sui event listeners
4. **Custom Token**: Replace SUI with project-specific token

## 🛠️ Development Commands

```bash
# Smart Contracts
sui move build              # Compile contracts
sui move test               # Run tests
sui client publish          # Deploy to network

# Frontend
npm run dev                 # Development server
npm run build              # Production build
npm run start              # Production server
npm run lint               # Lint code
```

## 🧪 Testing

### Test on Sui Testnet

1. Get testnet SUI from [Discord faucet](https://discord.com/channels/916379725201563759/971488439931392130)
2. Deploy contracts to testnet
3. Test complete user flow with multiple wallets
4. Verify objects on [Sui Explorer](https://suiexplorer.com/?network=testnet)

## 📝 IPFS Metadata Format

### Profile Metadata
```json
{
  "name": "Alice Developer",
  "bio": "Full-stack developer with 5 years experience",
  "skills": ["React", "Move", "TypeScript"],
  "avatar": "ipfs://QmXXX..."
}
```

### Task Metadata
```json
{
  "title": "Build Smart Contract",
  "description": "Develop a token staking contract in Move",
  "requirements": ["Move programming", "Smart contract security"],
  "deliverables": ["Audited code", "Documentation"],
  "deadline": "2025-12-31"
}
```

## 🤝 Contributing

Contributions welcome! Areas for enhancement:
- Enhanced UI/UX
- Advanced querying and filtering
- Dispute resolution mechanism
- Multi-stage task milestones
- Rating and review system

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Resources

- [Sui Documentation](https://docs.sui.io/)
- [Move Book](https://move-book.com/)
- [Sui dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [IPFS Documentation](https://docs.ipfs.tech/)

## 💡 Support

For issues or questions:
1. Check existing documentation
2. Review Sui Move examples
3. Open an issue in the repository

---

**Built with ❤️ for the Sui Hackathon**
