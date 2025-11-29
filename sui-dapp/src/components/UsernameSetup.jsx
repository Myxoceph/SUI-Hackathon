import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { isUsernameTaken } from "@/lib/userProfile";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useZKLogin } from "@/contexts/ZKLoginContext";
import { registerUsername } from "@/lib/suiTransactions";
import { CONTRACTS } from "@/config/contracts";

const UsernameSetup = ({ address, onComplete, onCancel }) => {
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTaken, setIsTaken] = useState(false);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { zkAccount, isZkConnected, signAndExecuteZkTransaction } = useZKLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters!");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      toast.error("Username can only contain letters, numbers, _ and -");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check if contracts are deployed
      if (CONTRACTS.PACKAGE_ID === "TO_BE_DEPLOYED") {
        // Mock mode: save to localStorage (works for both wallet and ZKLogin)
        if (isUsernameTaken(username)) {
          toast.error("Username is already taken!");
          setIsSubmitting(false);
          return;
        }

        const userData = {
          username,
          address,
          createdAt: new Date().toISOString(),
          // Add ZKLogin user info if available
          ...(isZkConnected && zkAccount && {
            email: zkAccount.email,
            name: zkAccount.name,
            picture: zkAccount.picture,
            authProvider: 'google'
          })
        };
        
        localStorage.setItem(`user_${address}`, JSON.stringify(userData));
        toast.success(`Welcome, ${username}!`);
        onComplete(userData);
      } else {
        // On-chain mode: register on Sui blockchain
        let result;
        
        if (isZkConnected) {
          // Use ZKLogin transaction signing
          const txb = await registerUsername(null, username, address);
          result = await signAndExecuteZkTransaction(txb);
        } else {
          // Use normal wallet transaction signing
          result = await registerUsername(signAndExecute, username);
        }
        
        const userData = {
          username,
          address,
          createdAt: new Date().toISOString(),
          txDigest: result.digest,
          // Add ZKLogin user info if available
          ...(isZkConnected && zkAccount && {
            email: zkAccount.email,
            name: zkAccount.name,
            picture: zkAccount.picture,
            authProvider: 'google'
          })
        };
        
        // Also save locally for quick access
        localStorage.setItem(`user_${address}`, JSON.stringify(userData));
        
        toast.success(`Welcome, ${username}! Profile NFT minted on Sui.`, {
          description: `Transaction: ${result.digest?.slice(0, 8)}...`,
        });
        onComplete(userData);
      }
    } catch (error) {
      console.error("Username registration error:", error);
      
      // Parse Move abort errors for better user feedback
      if (error.message?.includes('MoveAbort') || error.message?.includes('abort')) {
        if (error.message.includes(', 1)')) {
          toast.error("Username is already taken! Please choose another.");
        } else if (error.message.includes(', 2)')) {
          toast.error("You already have a username registered!");
        } else {
          toast.error("Invalid username. Please try a different one.");
        }
      } else {
        toast.error("Failed to create username: " + (error.message || "Unknown error"));
      }
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold font-sans">Welcome to TrustChain</h2>
            {isZkConnected && zkAccount?.name ? (
              <p className="text-sm text-muted-foreground font-mono">
                Hi {zkAccount.name}! Choose a username to complete your profile
              </p>
            ) : (
              <p className="text-sm text-muted-foreground font-mono">
                Choose a username to get started
              </p>
            )}
          </div>

          {isZkConnected && zkAccount && (
            <div className="flex items-center gap-3 p-3 rounded border border-border bg-muted/50">
              {zkAccount.picture && (
                <img 
                  src={zkAccount.picture} 
                  alt={zkAccount.name || 'User'} 
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{zkAccount.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{zkAccount.email}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="font-mono uppercase text-xs">
                Username
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="e.g. builder_42"
                  className={`rounded-none border-border bg-background font-mono pr-10 ${
                    username.length >= 3 && (isTaken ? 'border-destructive' : 'border-green-500')
                  }`}
                  autoFocus
                  required
                  minLength={3}
                  maxLength={20}
                />
                {username.length >= 3 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isTaken ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                )}
              </div>
              <p className={`text-xs ${
                username.length >= 3 && isTaken 
                  ? 'text-destructive font-semibold' 
                  : 'text-muted-foreground'
              }`}>
                {username.length >= 3 && isTaken 
                  ? '⚠️ Username already taken' 
                  : '3-20 characters, letters, numbers, _ and - only'
                }
              </p>
            </div>

            <Button
              type="submit"
              className="w-full font-mono h-12 text-base"
              disabled={isSubmitting || username.length < 3 || isTaken}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  CREATING PROFILE...
                </>
              ) : (
                "CREATE PROFILE"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full font-mono h-12 text-base"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              GO BACK
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-muted-foreground font-mono">
              Connected: {address?.slice(0, 8)}...{address?.slice(-6)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsernameSetup;
