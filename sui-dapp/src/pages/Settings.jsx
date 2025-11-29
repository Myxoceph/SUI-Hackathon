import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { formatAddress, formatBalance } from "@/lib/formatters";
import { updateUserProfile } from "@/lib/userProfile";
import { toast } from "sonner";

const Settings = () => {
  const { isConnected, address, balance, userProfile, refreshData } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center border border-border">
          <span className="text-3xl">🔒</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-sans">Connect Your Wallet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Connect your Sui wallet to access settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-sans">Profile Settings</h1>
        <p className="text-muted-foreground font-mono text-sm">
          Manage your account and profile information
        </p>
      </div>

      {/* Account Information */}
      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="font-sans">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-mono uppercase text-xs">Username</Label>
              <div className="p-3 border border-border bg-background rounded font-mono">
                {userProfile?.username || "Not set"}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-mono uppercase text-xs">Member Since</Label>
              <div className="p-3 border border-border bg-background rounded font-mono text-sm">
                {userProfile?.createdAt 
                  ? new Date(userProfile.createdAt).toLocaleDateString()
                  : "Unknown"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-mono uppercase text-xs">Wallet Address</Label>
            <div className="flex gap-2">
              <Input
                value={address}
                readOnly
                className="font-mono text-sm rounded-none border-border bg-background"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyAddress}
                className="rounded-none"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(`https://suiscan.xyz/devnet/account/${address}`, '_blank')}
                className="rounded-none"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-mono uppercase text-xs">Balance</Label>
            <div className="p-3 border border-border bg-background rounded">
              <Badge variant="secondary" className="rounded-none font-mono">
                {formatBalance(balance)} SUI
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Information */}
      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="font-sans">Network</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-border bg-background rounded">
            <span className="font-mono text-sm">Current Network</span>
            <Badge className="rounded-none font-mono">DEVNET</Badge>
          </div>
          
          <div className="text-xs text-muted-foreground font-mono">
            ⚠️ You are on Sui Devnet. Transactions are not real.
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 bg-card/50">
        <CardHeader>
          <CardTitle className="font-sans text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Clear Local Data</p>
              <p className="text-sm text-muted-foreground">
                Remove your username and profile from this browser
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Are you sure? This will clear your local profile data.")) {
                  localStorage.removeItem(`user_${address}`);
                  toast.success("Local data cleared. Please reconnect your wallet.");
                  window.location.reload();
                }
              }}
            >
              Clear Data
            </Button>
          </div>

          <div className="border-t border-destructive/20 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-destructive">Clear All Users</p>
                <p className="text-sm text-muted-foreground">
                  Remove all user profiles from localStorage (Developer Tool)
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm("⚠️ This will delete ALL user profiles from localStorage. Continue?")) {
                    let count = 0;
                    for (let i = localStorage.length - 1; i >= 0; i--) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith('user_')) {
                        localStorage.removeItem(key);
                        count++;
                      }
                    }
                    toast.success(`Cleared ${count} user profile(s)`);
                    window.location.reload();
                  }
                }}
              >
                Clear All Users
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
