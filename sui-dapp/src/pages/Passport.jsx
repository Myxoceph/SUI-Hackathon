import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, CheckCircle, Clock, ThumbsUp } from "lucide-react";

const ContributionCard = ({ type, title, description, date, endorsements, status }) => (
  <div className="flex gap-4 p-4 border border-border bg-card hover:bg-accent/5 transition-colors group">
    <div className="flex flex-col items-center gap-2 pt-1">
      <div className="h-2 w-2 rounded-full bg-primary" />
      <div className="w-[1px] h-full bg-border group-last:hidden" />
    </div>
    <div className="flex-1 space-y-2">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs uppercase rounded-none border-primary/50 text-primary">
              {type}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{date}</span>
          </div>
          <h3 className="font-bold text-lg font-sans">{title}</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      
      <div className="flex items-center gap-4 pt-2">
        <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
          <ThumbsUp className="h-3 w-3" />
          {endorsements} Endorsements
        </div>
        <div className="flex items-center gap-1 text-xs font-mono text-green-500">
          <CheckCircle className="h-3 w-3" />
          Verified on Sui
        </div>
      </div>
    </div>
  </div>
);

const Passport = () => {
  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-b border-border pb-8">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 bg-muted border border-border flex items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground">0x</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-sans">builder.sui</h1>
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <span>0x71C...9A2</span>
              <Button variant="ghost" size="icon" className="h-4 w-4">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="rounded-none">LVL 42</Badge>
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
          <ContributionCard 
            type="PULL REQUEST"
            title="Implemented Zero-Knowledge Proof Verification"
            description="Added ZK-SNARK verification logic to the core protocol smart contracts. Optimized gas usage by 15%."
            date="2024-03-15"
            endorsements={12}
            status="verified"
          />
          <ContributionCard 
            type="HACKATHON"
            title="Sui Overflow 2024 - 1st Place DeFi Track"
            description="Built a decentralized lending protocol with undercollateralized loans using on-chain reputation."
            date="2024-02-28"
            endorsements={45}
            status="verified"
          />
          <ContributionCard 
            type="DOCUMENTATION"
            title="Updated Move Language Tutorial"
            description="Rewrote the beginner guide for Move smart contract development, adding examples for object-centric models."
            date="2024-01-10"
            endorsements={8}
            status="verified"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Passport;
