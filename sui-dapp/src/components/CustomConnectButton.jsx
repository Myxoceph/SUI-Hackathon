import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import { ConnectButton } from "@mysten/dapp-kit";
import { zkLoginService } from "@/lib/zkLogin";

const CustomConnectButton = ({ className = "" }) => {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { address, isZkLogin, userProfile } = useWallet();
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    if (isZkLogin) {
      // zkLogin logout
      zkLoginService.clearSession();
      window.location.reload();
    } else {
      // Wallet disconnect
      disconnect();
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = zkLoginService.getGoogleAuthUrl();
  };

  // If not connected at all, show custom menu with wallet + Google options
  if (!address) {
    return (
      <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={className}>
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Choose connection method</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="p-2">
            <ConnectButton 
              className="w-full mb-2" 
              connectText="Connect Sui Wallet"
            />
            
            <div className="flex items-center gap-2 my-2">
              <div className="h-[1px] flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-[1px] flex-1 bg-border" />
            </div>
            
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleGoogleLogin}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Connected - show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Wallet className="h-4 w-4 mr-2" />
          {userProfile?.username || `${address.slice(0, 6)}...${address.slice(-4)}`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {userProfile?.username || "Account"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Connection Type */}
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          {isZkLogin ? "⚡ zkLogin (Google)" : "🔐 Wallet Connected"}
        </div>
        
        {/* Address */}
        <DropdownMenuItem onClick={copyAddress} className="font-mono text-xs">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              {address.slice(0, 8)}...{address.slice(-8)}
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Logout */}
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          {isZkLogin ? "Sign Out" : "Disconnect"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomConnectButton;
