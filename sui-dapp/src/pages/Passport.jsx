import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Loader2 } from "lucide-react";
import ContributionCard from "@/components/ContributionCard";
import { MOCK_CONTRIBUTIONS } from "@/constants/mockData";
import { useWallet } from "@/contexts/WalletContext";
import { formatAddress, formatBalance } from "@/lib/formatters";

const Passport = () => {
  const { isConnected, address, balance, contributions, loading, userProfile } = useWallet();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center border border-border">
          <span className="text-3xl">🔒</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-sans">Connect Your Wallet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Connect your Sui wallet to view your contribution passport and build your on-chain reputation.
          </p>
        </div>
      </div>
    );
  }

  const allContributions = [...contributions, ...MOCK_CONTRIBUTIONS];
  const totalScore = allContributions.reduce((sum, c) => sum + (c.endorsements || 0), 0) * 100;

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
              {userProfile?.username || "builder.sui"}
            </h1>
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <span>{formatAddress(address)}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4"
                onClick={() => window.open(`https://suiscan.xyz/devnet/account/${address}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="rounded-none">
                {formatBalance(balance)} SUI
              </Badge>
              <Badge variant="secondary" className="rounded-none">CONTRIBUTOR</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground font-mono">TOTAL SCORE</div>
            <div className="text-2xl font-bold">{totalScore.toLocaleString()}</div>
          </div>
          <div className="w-[1px] bg-border h-12" />
          <div className="text-right">
            <div className="text-sm text-muted-foreground font-mono">CONTRIBUTIONS</div>
            <div className="text-2xl font-bold">{allContributions.length}</div>
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
            value="endorsements" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-mono"
          >
            ENDORSEMENTS
          </TabsTrigger>
          <TabsTrigger 
            value="achievements" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-mono"
          >
            ACHIEVEMENTS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contributions" className="pt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : allContributions.length > 0 ? (
            allContributions.map((contribution, index) => (
              <ContributionCard key={index} {...contribution} />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No contributions yet. Start building!
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Passport;
