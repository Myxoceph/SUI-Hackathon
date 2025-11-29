import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Coins } from 'lucide-react';
import { useZKLogin } from '@/contexts/ZKLoginContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * ZKLoginButton - Button component for Google OAuth login with ZKLogin
 */
const ZKLoginButton = ({ className, variant = "default" }) => {
  const { isZkConnected, loading, loginWithGoogle, logout, zkAccount } = useZKLogin();

  const requestTestnetSUI = async () => {
    if (!zkAccount?.address) return;
    
    try {
      toast.loading('Requesting testnet SUI...');
      
      const response = await fetch('https://faucet.testnet.sui.io/v1/gas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FixedAmountRequest: {
            recipient: zkAccount.address
          }
        })
      });

      if (response.ok) {
        toast.success('✅ Testnet SUI received! You can now create your username.');
      } else {
        const error = await response.text();
        toast.error('Faucet request failed. Try again in a few minutes.');
        console.error('Faucet error:', error);
      }
    } catch (error) {
      toast.error('Failed to request testnet SUI');
      console.error('Faucet error:', error);
    }
  };

  // If connected, show user info and logout button
  if (isZkConnected && zkAccount) {
    return (
      <div className="flex items-center gap-2">
        {zkAccount.picture && (
          <img 
            src={zkAccount.picture} 
            alt={zkAccount.name || 'User'} 
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium font-mono">
            {zkAccount.address.slice(0, 6)}...{zkAccount.address.slice(-4)}
          </span>
          {zkAccount.email && (
            <span className="text-xs text-muted-foreground">
              {zkAccount.email}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={requestTestnetSUI}
          className="h-8"
          title="Get testnet SUI for gas fees"
        >
          <Coins className="h-4 w-4 mr-1" />
          Get SUI
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="h-8 w-8"
          title="Disconnect"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Show login button
  return (
    <Button
      onClick={loginWithGoogle}
      disabled={loading}
      variant={variant}
      className={cn("font-mono text-xs", className)}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Login with Google
        </>
      )}
    </Button>
  );
};

export default ZKLoginButton;
