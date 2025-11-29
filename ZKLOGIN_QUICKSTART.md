# 🚀 Quick Start: ZKLogin Integration

ZKLogin has been integrated! Follow these 3 simple steps:

## 1️⃣ Get Google OAuth Credentials

Visit: https://console.cloud.google.com/apis/credentials

- Create OAuth 2.0 Client ID
- Add redirect URI: `http://localhost:5173/auth/callback`
- Copy your Client ID

## 2️⃣ Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Client ID
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

## 3️⃣ Run Your App

```bash
npm run dev
```

That's it! Users can now login with Google! 🎉

---

**See [ZKLOGIN_SETUP.md](./ZKLOGIN_SETUP.md) for detailed documentation.**
