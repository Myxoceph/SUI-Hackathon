import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink } from "lucide-react";
import ContributionCard from "@/components/ContributionCard";
import { MOCK_CONTRIBUTIONS } from "@/constants/mockData";

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
          {MOCK_CONTRIBUTIONS.map((contribution, index) => (
            <ContributionCard key={index} {...contribution} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Passport;
