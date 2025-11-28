# Deployment Guide

## Prerequisites Checklist

- [ ] Sui CLI installed and configured
- [ ] Active wallet with testnet SUI tokens
- [ ] Node.js 18+ installed
- [ ] IPFS account (Pinata, Web3.Storage, etc.)

## Step 1: Deploy Smart Contracts

### 1.1 Configure Sui CLI

```bash
# Check Sui CLI version
sui --version

# Set active network to testnet
sui client switch --env testnet

# Check active address
sui client active-address

# Get testnet tokens (if needed)
# Join Sui Discord and use #testnet-faucet channel
```

### 1.2 Build and Test Contracts

```bash
cd contracts

# Build the package
sui move build

# Run tests (if any)
sui move test

# Check for compilation errors
# Fix any issues before proceeding
```

### 1.3 Deploy to Testnet

```bash
# Publish the package
sui client publish --gas-budget 100000000

# IMPORTANT: Save the output!
# Look for "Published Objects" section
# Find the Package ID (format: 0xABCDEF...)
```

Example output:
```
----- Transaction Digest ----
ABC123XYZ...

----- Published Objects ----
0x1234567890abcdef1234567890abcdef12345678  # <-- THIS IS YOUR PACKAGE_ID
```

### 1.4 Verify Deployment

Visit Sui Explorer:
```
https://suiexplorer.com/object/YOUR_PACKAGE_ID?network=testnet
```

## Step 2: Configure Frontend

### 2.1 Install Dependencies

```bash
cd ../frontend

# Install npm packages
npm install

# This will install:
# - Next.js framework
# - Sui dApp Kit
# - Tailwind CSS
# - TypeScript dependencies
```

### 2.2 Set Environment Variables

```bash
# Copy example env file
cp .env.local.example .env.local

# Edit .env.local
# Replace with your actual Package ID from Step 1.3
```

`.env.local` should contain:
```env
NEXT_PUBLIC_PACKAGE_ID=0xYOUR_ACTUAL_PACKAGE_ID
```

### 2.3 Start Development Server

```bash
npm run dev

# Frontend will be available at:
# http://localhost:3000
```

## Step 3: Test the Application

### 3.1 Connect Wallet

1. Install [Sui Wallet extension](https://chrome.google.com/webstore/detail/sui-wallet)
2. Create or import a wallet
3. Switch to Testnet in wallet settings
4. Get testnet SUI from faucet
5. Visit http://localhost:3000
6. Click "Connect Wallet"

### 3.2 Create IPFS Metadata

**Option A: Using Pinata**

1. Sign up at https://pinata.cloud
2. Upload JSON files for profiles and tasks
3. Copy the IPFS CID (e.g., `QmXXX...`)
4. Use format: `ipfs://YOUR_CID`

**Option B: Using Web3.Storage**

1. Sign up at https://web3.storage
2. Upload files via web interface or CLI
3. Get the IPFS gateway URL

**Profile Metadata Example:**
```json
{
  "name": "Test User",
  "bio": "Software Developer",
  "skills": ["Move", "Rust", "TypeScript"]
}
```

**Task Metadata Example:**
```json
{
  "title": "Test Task",
  "description": "Complete a test assignment",
  "requirements": ["Basic coding skills"],
  "deadline": "2025-12-31"
}
```

### 3.3 Run Complete Flow

**Test with Two Wallets (Creator & Contributor):**

1. **Wallet A (Creator):**
   - Connect and create profile
   - Create a task with 0.5 SUI reward
   - Wait for Wallet B to apply
   - Accept Wallet B's application
   - Review submitted work
   - Confirm completion

2. **Wallet B (Contributor):**
   - Connect and create profile
   - Browse tasks and apply to the task
   - Wait for acceptance
   - Submit work
   - Receive reward and SBT

### 3.4 Verify Results

Check on Sui Explorer:
- Profile objects created
- Task object status updated
- SBT minted to contributor
- SUI transferred to contributor
- Events emitted

## Step 4: Production Deployment

### 4.1 Deploy to Mainnet (Optional)

```bash
# Switch to mainnet
sui client switch --env mainnet

# Deploy contracts
cd contracts
sui client publish --gas-budget 100000000

# Update frontend .env with mainnet Package ID
```

### 4.2 Deploy Frontend

**Option A: Vercel**
```bash
npm run build
# Connect GitHub repo to Vercel
# Set environment variables in Vercel dashboard
```

**Option B: Netlify**
```bash
npm run build
# Deploy via Netlify CLI or drag-and-drop
```

**Option C: Self-hosted**
```bash
npm run build
npm run start
# Use PM2 or similar process manager
```

## Troubleshooting

### Contract Deployment Issues

**Error: "Insufficient gas"**
```bash
# Request more SUI from faucet or increase gas budget
sui client publish --gas-budget 200000000
```

**Error: "Module verification failed"**
```bash
# Check Move.toml for correct dependencies
# Ensure Sui framework version matches your CLI
```

### Frontend Issues

**Error: "Cannot find module @mysten/dapp-kit"**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Error: "Transaction failed"**
- Check wallet has sufficient SUI
- Verify Package ID in .env.local is correct
- Check network (testnet vs mainnet)
- Review transaction in Sui Explorer

**UI not connecting to wallet**
- Ensure Sui Wallet extension is installed
- Check wallet is on correct network
- Clear browser cache and reload

## Security Considerations

### Before Mainnet Deployment:

1. **Smart Contract Audit**
   - Review all Move code
   - Test edge cases
   - Check for reentrancy issues
   - Verify access controls

2. **Frontend Security**
   - Use environment variables for sensitive data
   - Implement rate limiting
   - Add input validation
   - Use HTTPS in production

3. **Testing**
   - Test with multiple scenarios
   - Simulate malicious inputs
   - Check gas consumption
   - Verify event emissions

## Monitoring

### Track Deployment Health

1. **Smart Contract Events**
   - Monitor on-chain events
   - Track transaction success rates
   - Watch for unusual patterns

2. **Frontend Analytics**
   - User connection rates
   - Transaction completion rates
   - Error tracking (use Sentry)

3. **Performance**
   - API response times
   - Transaction confirmation times
   - IPFS retrieval speed

## Next Steps

After successful deployment:

1. Document your Package ID publicly
2. Share demo video
3. Gather user feedback
4. Plan feature enhancements
5. Consider security audit for mainnet

## Resources

- [Sui CLI Reference](https://docs.sui.io/references/cli)
- [Move Language Guide](https://move-book.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [IPFS Best Practices](https://docs.ipfs.tech/concepts/best-practices/)

---

**Questions?** Check the main README or open an issue.
