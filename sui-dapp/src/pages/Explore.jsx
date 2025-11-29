import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ProjectCard from "@/components/ProjectCard";
import { useWallet } from "@/contexts/WalletContext";
import { useState, useEffect } from "react";

const Explore = () => {
  const { isConnected } = useWallet();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch projects from Move smart contract
    setLoading(true);
    // Placeholder for smart contract call
    setProjects([]);
    setLoading(false);
  }, []);

  const handleEndorse = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to endorse!");
      return;
    }
    // TODO: Call Move smart contract to endorse
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
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length > 0 ? (
          projects.map((project, i) => (
            <ProjectCard key={i} {...project} onEndorse={handleEndorse} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 space-y-4">
            <div className="text-4xl">📦</div>
            <div className="space-y-2">
              <p className="text-lg font-semibold">No Contributions Yet</p>
              <p className="text-sm text-muted-foreground">
                Be the first to submit a contribution to the network!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
