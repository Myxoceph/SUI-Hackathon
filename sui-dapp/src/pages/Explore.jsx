import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Explore = () => {
  const handleEndorse = (id) => {
    toast.success("Contribution endorsed!", {
      description: "Transaction submitted to Sui network.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-sans">Explore Contributions</h1>
          <p className="text-muted-foreground font-mono text-sm">
            Discover what the community is building.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9 rounded-none border-border bg-background"
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-none">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="group border border-border bg-card hover:border-primary/50 transition-colors p-6 space-y-4 flex flex-col">
            <div className="flex justify-between items-start">
              <Badge variant="outline" className="rounded-none font-mono text-xs">
                DEV TOOL
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">2h ago</span>
            </div>
            
            <div className="space-y-2 flex-1">
              <h3 className="font-bold text-lg font-sans group-hover:text-primary transition-colors">
                Sui Move Analyzer v2.0
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                A static analysis tool for Move smart contracts that detects common vulnerabilities and gas inefficiencies before deployment.
              </p>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-muted rounded-full border border-border" />
                <span className="text-xs font-mono">0x2a...9f</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs font-mono hover:bg-primary hover:text-primary-foreground gap-2"
                onClick={() => handleEndorse(i)}
              >
                <ThumbsUp className="h-3 w-3" />
                ENDORSE
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
