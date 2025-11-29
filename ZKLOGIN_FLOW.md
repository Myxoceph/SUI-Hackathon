# ZKLogin Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ZKLogin Flow Diagram                         │
└─────────────────────────────────────────────────────────────────────┘

Step 1: User Clicks "Login with Google"
┌──────────┐
│  User    │  Clicks button
│  Browser │────────────────────────┐
└──────────┘                        │
                                    ▼
                            ┌───────────────┐
                            │  ZKLogin      │  Generate ephemeral keypair
                            │  Context      │  Generate nonce
                            └───────┬───────┘
                                    │
                                    │ Store in sessionStorage
                                    │
                                    ▼
                            Build OAuth URL with nonce
                                    │
                                    │ Redirect
                                    ▼
                            ┌───────────────┐
                            │    Google     │
                            │    OAuth      │
                            └───────┬───────┘


Step 2: OAuth Authentication
                                    │
                            User authenticates
                                    │
                                    ▼
                            Google returns JWT token
                                    │
                                    │ Redirect to /auth/callback
                                    ▼
┌──────────────────────────────────────────────────────────────┐
│                    /auth/callback                            │
│                                                              │
│  1. Extract JWT from URL hash                               │
│  2. Retrieve ephemeral keypair from sessionStorage          │
│  3. Generate deterministic salt                             │
│  4. Derive ZK address: jwtToAddress(jwt, salt)             │
│  5. Save session to localStorage                            │
│  6. Redirect to /passport                                   │
└──────────────────────────────────────────────────────────────┘


Step 3: User Makes Transaction
┌──────────┐
│  User    │  Submits contribution
│          │────────────────────────┐
└──────────┘                        │
                                    ▼
                            ┌───────────────┐
                            │  Transaction  │  Build transaction
                            │  Builder      │
                            └───────┬───────┘
                                    │
                                    ▼
                    signAndExecuteZkTransaction()
                                    │
                                    ├─► Sign with ephemeral key
                                    │
                                    ├─► Get ZK proof from prover
                                    │   (Mysten Labs service)
                                    │
                                    ├─► Combine signature + proof
                                    │
                                    └─► Execute on Sui blockchain
                                            │
                                            ▼
                                    ┌───────────────┐
                                    │  Sui Network  │
                                    │   (Testnet)   │
                                    └───────────────┘


Key Components:
═══════════════

📁 config/zklogin.js
   - OAuth configuration
   - Helper functions (nonce generation, JWT decoding)

📁 contexts/ZKLoginContext.jsx
   - Login state management
   - Transaction signing with ZK proof
   - Session persistence

📁 pages/AuthCallback.jsx
   - Handles OAuth redirect
   - Completes authentication flow

📁 components/ZKLoginButton.jsx
   - UI for login/logout
   - Shows user info when connected

📁 components/Navbar.jsx
   - Shows both wallet & ZKLogin options
   - Intelligent connection UI


Data Flow:
══════════

Ephemeral Keypair
    └─► generates nonce
            └─► sent to Google OAuth
                    └─► returns JWT
                            └─► derives ZK address
                                    └─► signs transactions


Security Notes:
═══════════════

✓ Ephemeral keys are temporary (valid for ~10 days)
✓ JWT tokens expire (typically 1 hour)
✓ Salt should be managed by backend in production
✓ ZK proofs prove ownership without revealing private key
✗ Current salt generation is client-side (demo only!)


Authentication Methods:
═══════════════════════

Traditional Wallet          vs          ZKLogin
─────────────────                      ───────
• Browser extension                    • OAuth provider
• Private key in wallet                • No crypto wallet needed
• Transaction signing via wallet       • Ephemeral key + ZK proof
• Familiar to crypto users             • Familiar to web2 users


Session Storage:
════════════════

sessionStorage (temporary)
┌────────────────────────────┐
│ ephemeralPrivateKey        │  ← Cleared after login
│ randomness                 │  ← Used once
│ nonce                      │  ← For OAuth
└────────────────────────────┘

localStorage (persistent)
┌────────────────────────────┐
│ address                    │  ← ZK address
│ email, name, picture       │  ← User info
│ jwtToken                   │  ← For proof generation
│ salt                       │  ← For address derivation
│ ephemeralPrivateKey        │  ← For signing
│ expiresAt                  │  ← Session expiry
└────────────────────────────┘
```
