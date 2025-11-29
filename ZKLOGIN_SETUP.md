# ZKLogin Setup Guide for TrustChain

ZKLogin has been successfully integrated into your TrustChain project! This allows users to authenticate using Google OAuth instead of traditional wallet connections.

## 🎉 What's Been Added

### New Files Created:
1. **`src/config/zklogin.js`** - Configuration and helper functions for ZKLogin
2. **`src/contexts/ZKLoginContext.jsx`** - React context for managing ZKLogin state
3. **`src/pages/AuthCallback.jsx`** - OAuth callback handler page
4. **`src/components/ZKLoginButton.jsx`** - Google login button component
5. **`.env.example`** - Environment variables template

### Modified Files:
1. **`src/components/Navbar.jsx`** - Now shows both wallet and ZKLogin options
2. **`src/App.jsx`** - Wrapped with ZKLoginProvider and added `/auth/callback` route

## 📋 Setup Instructions

### Step 1: Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Configure the consent screen if prompted
6. For **Application type**, select **Web application**
7. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` (for development)
   - Your production domain (for production)
8. Add **Authorized redirect URIs**:
   - `http://localhost:5173/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)
9. Click **Create** and copy your **Client ID**

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Google Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
   VITE_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

### Step 3: Restart Development Server

```bash
npm run dev
```

## 🚀 How to Use

### For Users:
1. Visit your TrustChain app
2. Click **"Login with Google"** button in the navbar
3. Complete Google OAuth authentication
4. Your ZKLogin address will be derived and you'll be redirected to your passport

### For Developers:
```jsx
import { useZKLogin } from '@/contexts/ZKLoginContext';

function MyComponent() {
  const { 
    zkAccount,           // Current ZKLogin account
    isZkConnected,       // Boolean: is user logged in with ZKLogin
    loginWithGoogle,     // Function: initiate Google login
    logout,              // Function: logout user
    signAndExecuteZkTransaction  // Function: sign transactions with ZKLogin
  } = useZKLogin();

  // Use zkAccount.address for the user's address
  // Use signAndExecuteZkTransaction(txb) to execute transactions
}
```

## 🔐 How ZKLogin Works

1. **User clicks "Login with Google"**: Ephemeral keypair is generated
2. **OAuth redirect**: User authenticates with Google
3. **Callback processing**: JWT token is received and ZK address is derived
4. **Session storage**: Account info is stored locally for future sessions
5. **Transaction signing**: Uses ephemeral key + ZK proof to sign transactions

## 📝 Important Notes

### Salt Management
The current implementation generates salts **deterministically on the client side**. This is **suitable for hackathons and demos** but NOT production.

**For production**, you should:
- Create a backend service to generate and store salts securely
- Update the `generateSalt()` function in `ZKLoginContext.jsx` to call your backend
- Never expose salt generation logic to the client

### ZK Proof Generation
The current implementation calls Mysten Labs' prover service. This is free for testnet but may have rate limits.

**For production**, consider:
- Running your own prover service
- Implementing proper error handling and retries
- Adding loading states during proof generation

### Session Expiration
JWT tokens expire after a certain time (typically 1 hour). The app checks expiration before transactions but you may want to:
- Add automatic re-authentication
- Show expiration warnings
- Implement refresh token logic

## 🔧 Troubleshooting

### "Google Client ID not configured" error
- Make sure you've created a `.env` file (not just `.env.example`)
- Verify `VITE_GOOGLE_CLIENT_ID` is set correctly
- Restart your development server after adding environment variables

### "No ephemeral data found" error
- This happens if you interrupt the OAuth flow
- Clear your browser's session storage and try again
- Make sure popup blockers aren't interfering with the redirect

### "Failed to get ZK proof" error
- Check your internet connection (needs to reach Mysten Labs prover)
- Verify the JWT token is valid
- Check browser console for detailed error messages

### Redirect URI mismatch
- Ensure the redirect URI in Google Cloud Console **exactly matches** `VITE_REDIRECT_URI`
- Include protocol (`http://` or `https://`)
- No trailing slashes

## 🎯 Next Steps

### Enhance Your Integration:

1. **Update WalletContext** to support ZKLogin:
   ```jsx
   // In WalletContext.jsx, check both wallet and ZKLogin
   const { zkAccount, isZkConnected } = useZKLogin();
   const walletAddress = account?.address || (isZkConnected ? zkAccount.address : null);
   ```

2. **Add ZKLogin to contribution signing**:
   ```jsx
   // In your contribution submission
   if (isZkConnected) {
     result = await signAndExecuteZkTransaction(txb);
   } else {
     result = await signAndExecuteTransaction({ transaction: txb });
   }
   ```

3. **Create username for ZKLogin users**:
   - Modify `UsernameSetup` to detect ZKLogin accounts
   - Use `zkAccount.address` for ZKLogin users

4. **Add more OAuth providers**:
   - Facebook, Apple, Twitter, etc.
   - Update `ZKLOGIN_CONFIG` with new provider URLs
   - Add corresponding login buttons

## 📚 Resources

- [Sui ZKLogin Documentation](https://docs.sui.io/concepts/cryptography/zklogin)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Mysten Labs ZKLogin Examples](https://github.com/MystenLabs/zklogin-example)

## 🐛 Known Limitations

- Currently only supports Google OAuth (can be extended to other providers)
- Salt generation is client-side (should use backend for production)
- No automatic session refresh (user must re-login after JWT expires)
- ZK proof generation requires internet connection to Mysten Labs service

---

**Need Help?** Check the browser console for detailed error messages or refer to the Sui ZKLogin documentation.
