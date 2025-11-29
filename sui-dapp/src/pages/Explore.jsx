import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ProjectCard from "@/components/ProjectCard";
import { useWallet } from "@/contexts/WalletContext";
import { useState, useEffect } from "react";

const Explore = () => {
  const { isConnected, endorseContribution: endorseInContext } = useWallet();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load all contributions from all users (mock data from localStorage)
    loadAllContributions();
  }, []);

  const loadAllContributions = () => {
    setLoading(true);
    try {
      // Get all contributions from localStorage
      const allContributions = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('contributions_')) {
          const data = JSON.parse(localStorage.getItem(key));
          allContributions.push(...data);
        }
      }
      // Sort by newest first
      allContributions.sort((a, b) => b.createdAt - a.createdAt);
      setProjects(allContributions);
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndorse = async (contributionId) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to endorse!");
      return;
    }
    
    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update endorsement count
      endorseInContext(contributionId);
      loadAllContributions(); // Reload to show updated count
      
      toast.success("Contribution endorsed!", {
        description: "Transaction submitted to Sui network.",
      });
    } catch (error) {
      toast.error("Endorsement failed: " + error.message);
    }
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
