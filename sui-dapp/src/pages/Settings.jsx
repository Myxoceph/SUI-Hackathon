import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useWallet } from "@/contexts/WalletContext";
import { formatBalance } from "@/lib/formatters";
import { toast } from "sonner";

const Settings = () => {
  const { t } = useTranslation();
  const { isConnected, address, balance, userProfile } = useWallet();
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
          <h2 className="text-2xl font-bold font-sans">{t('wallet.connect')}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('errors.walletRequired')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-sans">{t('settings.title')}</h1>
        <p className="text-muted-foreground font-mono text-sm">
          Manage your account and profile information
        </p>
      </div>

      {/* Account Information */}
      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="font-sans">{t('settings.profile')}</CardTitle>
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
                onClick={() => window.open(`https://suiscan.xyz/testnet/account/${address}`, '_blank')}
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
            <Badge className="rounded-none font-mono">TESTNET</Badge>
          </div>
          
          <div className="text-xs text-muted-foreground font-mono">
            ⚠️ You are on Sui Testnet. Transactions are not real.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
