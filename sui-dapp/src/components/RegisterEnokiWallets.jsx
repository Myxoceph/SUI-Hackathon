import { useEffect } from 'react';
import { useSuiClientContext } from '@mysten/dapp-kit';
import { registerEnokiWallets } from '@mysten/enoki';

/**
 * Adds Enoki wallets to dapp-kit wallet list
 * This component should render before WalletProvider
 */
function RegisterEnokiWallets() {
  const { client, network } = useSuiClientContext();
  
  useEffect(() => {
    const apiKey = import.meta.env.VITE_ENOKI_PUBLIC_KEY;
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!apiKey || apiKey.includes('YOUR_KEY_HERE')) {
      console.warn('⚠️ Enoki API key not configured. Get your key from https://portal.enoki.mystenlabs.com/');
      return;
    }
    
    if (!googleClientId) {
      console.warn('⚠️ Google Client ID not configured');
      return;
    }
    
    console.log('🔐 Registering Enoki wallets...');
    
    try {
      const { unregister } = registerEnokiWallets({
        apiKey,
        client,
        network: network || 'testnet',
        windowFeatures: 'width=600,height=700,popup=yes',
        // Sponsorship enabled - transactions will be sponsored if configured in Enoki Portal
        providers: {
          google: {
            clientId: googleClientId,
            redirectUrl: `${window.location.origin}/auth/callback`,
          },
        },
      });
      
      console.log('✅ Enoki wallets registered successfully');
      console.log('💰 Gas sponsorship: Check Enoki Portal configuration');
      
      // Cleanup: unregister wallets on component unmount
      return unregister;
    } catch (error) {
      console.error('❌ Error registering Enoki wallets:', error);
    }
  }, [client, network]);
  
  return null; // This component doesn't render UI
}

export default RegisterEnokiWallets;
