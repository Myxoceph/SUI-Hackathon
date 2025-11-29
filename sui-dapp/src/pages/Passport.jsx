import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import { useWallet } from "@/contexts/WalletContext";
import { formatAddress, formatBalance } from "@/lib/formatters";
import { useEffect } from "react";

const Passport = () => {
  const { isConnected, address, balance, projects, loading, userProfile, refreshData } = useWallet();

  // Auto-refresh on mount and periodically
  useEffect(() => {
    if (isConnected) {
      refreshData();
      
      // Daha uzun interval - sadece gerektiğinde refresh
      const interval = setInterval(() => {
        refreshData();
      }, 60000); // 1 dakika - agresif değil

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center border border-border">
          <span className="text-3xl">🔒</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-sans">Connect Your Wallet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Connect your Sui wallet to view your project portfolio and build your on-chain reputation.
          </p>
        </div>
      </div>
    );
  }

  const totalScore = projects.reduce((sum, p) => sum + (p.endorsements || 0), 0) * 100;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-b border-border pb-8">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 bg-muted border border-border flex items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground">0x</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-sans">
                {userProfile?.username || "builder.sui"}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={refreshData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <span>{formatAddress(address)}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4"
                onClick={() => window.open(`https://suiscan.xyz/testnet/account/${address}`, '_blank')}
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
            <div className="text-sm text-muted-foreground font-mono">PROJECTS</div>
            <div className="text-2xl font-bold">{projects.length}</div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger 
            value="projects" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-mono"
          >
            PROJECTS
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

        <TabsContent value="projects" className="pt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length > 0 ? (
            projects.map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No projects yet. Start building!
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Passport;
