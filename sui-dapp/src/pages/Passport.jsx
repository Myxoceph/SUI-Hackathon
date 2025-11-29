import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Loader2 } from "lucide-react";
import ContributionCard from "@/components/ContributionCard";
import BadgeCard from "@/components/BadgeCard";
import { MOCK_CONTRIBUTIONS } from "@/constants/mockData";
import { useSuiTransaction } from "@/hooks/useSuiTransaction";

const Passport = () => {
  const account = useCurrentAccount();
  const { getUserBadges } = useSuiTransaction();
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (account?.address) {
      loadBadges();
    }
  }, [account]);

  const loadBadges = async () => {
    setIsLoading(true);
    try {
      const userBadges = await getUserBadges(account.address);
      setBadges(userBadges);
    } catch (error) {
      console.error("Failed to load badges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-4 py-20">
        <h2 className="text-2xl font-bold font-sans">Connect Your Wallet</h2>
        <p className="text-muted-foreground">Please connect your Sui wallet to view your passport.</p>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-b border-border pb-8">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 bg-muted border border-border flex items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground">0x</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-sans">
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </h1>
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <span>{account.address}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4"
                onClick={() => window.open(`https://suiscan.xyz/testnet/account/${account.address}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="rounded-none">{badges.length} BADGES</Badge>
              <Badge variant="secondary" className="rounded-none">CONTRIBUTOR</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground font-mono">TOTAL SCORE</div>
            <div className="text-2xl font-bold">8,492</div>
          </div>
          <div className="w-[1px] bg-border h-12" />
          <div className="text-right">
            <div className="text-sm text-muted-foreground font-mono">RANK</div>
            <div className="text-2xl font-bold">#12</div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="contributions" className="w-full">
        <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger 
            value="contributions" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-mono"
          >
            CONTRIBUTIONS
          </TabsTrigger>
          <TabsTrigger 
            value="badges" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-mono"
          >
            BADGES ({badges.length})
          </TabsTrigger>
          <TabsTrigger 
            value="endorsements" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-mono"
          >
            ENDORSEMENTS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contributions" className="pt-6 space-y-4">
          {MOCK_CONTRIBUTIONS.map((contribution, index) => (
            <ContributionCard key={index} {...contribution} />
          ))}
        </TabsContent>

        <TabsContent value="badges" className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <BadgeCard key={badge.data?.objectId} badge={badge} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-2">
              <p className="text-muted-foreground font-mono">No badges earned yet</p>
              <p className="text-sm text-muted-foreground">Submit contributions to earn soulbound badges!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="endorsements" className="pt-6">
          <div className="text-center py-12 text-muted-foreground font-mono">
            Endorsements coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Passport;
