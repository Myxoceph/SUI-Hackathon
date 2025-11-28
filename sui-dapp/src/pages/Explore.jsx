import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { toast } from "sonner";
import ProjectCard from "@/components/ProjectCard";

const MOCK_PROJECTS = Array(6).fill({
  badge: "DEV TOOL",
  title: "Sui Move Analyzer v2.0",
  description: "A static analysis tool for Move smart contracts that detects common vulnerabilities and gas inefficiencies before deployment.",
  author: "0x2a...9f",
  time: "2h ago",
});

const Explore = () => {
  const handleEndorse = () => {
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
        {MOCK_PROJECTS.map((project, i) => (
          <ProjectCard key={i} {...project} onEndorse={handleEndorse} />
        ))}
      </div>
    </div>
  );
};

export default Explore;
