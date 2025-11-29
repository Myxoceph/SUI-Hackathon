import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ProjectCard from "@/components/ProjectCard";
import { useWallet } from "@/contexts/WalletContext";
import { useState, useEffect } from "react";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { endorseContribution } from "@/lib/suiTransactions";
import { CONTRACTS } from "@/config/contracts";

const Explore = () => {
  const { isConnected, address } = useWallet();
  const client = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [endorsingId, setEndorsingId] = useState(null);

  useEffect(() => {
    loadAllContributions();
    
    // Auto-refresh every 30 seconds (balanced)
    const interval = setInterval(() => {
      loadAllContributions();
    }, 30000);

    return () => clearInterval(interval);
  }, []); // Empty dependency - sadece mount/unmount'ta çalışır

  const loadAllContributions = async (retryCount = 0) => {
    // Concurrent load varsa iptal et
    if (loading && retryCount === 0) return;
    
    setLoading(true);
    try {
      // If contracts not deployed, show mock data
      if (CONTRACTS.PACKAGE_ID === "TO_BE_DEPLOYED") {
        // Load from localStorage (mock data)
        const allContributions = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('contributions_')) {
            const data = JSON.parse(localStorage.getItem(key));
            allContributions.push(...data);
          }
        }
        allContributions.sort((a, b) => b.createdAt - a.createdAt);
        setProjects(allContributions);
      } else {
        // Load from on-chain using dynamic field query
        // Since Contribution objects are owned, we need to use multiGetObjects or events
        
        // Option 1: Query via events (most efficient for global view)
        const events = await client.queryEvents({
          query: {
            MoveEventType: `${CONTRACTS.PACKAGE_ID}::contribution::ContributionCreated`,
          },
          limit: 50,
          order: 'descending',
        });

        // Get contribution IDs from events
        const contributionIds = events.data.map(event => event.parsedJson.contribution_id);

        if (contributionIds.length === 0) {
          setProjects([]);
          return;
        }

        // Fetch actual contribution objects
        const objectsResponse = await client.multiGetObjects({
          ids: contributionIds,
          options: {
            showContent: true,
            showOwner: true,
          },
        });

        const contributions = objectsResponse
          .filter(obj => obj.data?.content)
          .map(obj => {
            const fields = obj.data.content.fields || {};
            return {
              id: obj.data.objectId,
              owner: fields.owner,
              type: fields.contribution_type,
              title: fields.title,
              description: fields.description,
              proofLink: fields.proof_link,
              endorsements: parseInt(fields.endorsements || "0"),
              createdAt: parseInt(fields.created_at || "0"),
            };
          });

        // Fetch endorsement counts from registry for all contributions
        const registry = await client.getObject({
          id: CONTRACTS.CONTRIBUTION_REGISTRY,
          options: { showContent: true },
        });

        // Update endorsement counts from registry
        for (const contribution of contributions) {
          try {
            const tableId = registry.data?.content?.fields?.endorsement_counts?.fields?.id?.id;
            if (tableId) {
              const dynamicField = await client.getDynamicFieldObject({
                parentId: tableId,
                name: {
                  type: "0x2::object::ID",
                  value: contribution.id,
                },
              });
              contribution.endorsements = parseInt(dynamicField.data?.content?.fields?.value || "0");
            }
          } catch (error) {
            // Field might not exist yet, keep default 0
            console.log(`No endorsements yet for ${contribution.id}`);
          }
        }

        contributions.sort((a, b) => b.createdAt - a.createdAt);
        setProjects(contributions);
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
      
      // Sadece ilk yükleme hatalarında toast göster
      // Auto-refresh hatalarını sessizce logla (UX için)
      if (projects.length === 0) {
        toast.error("Failed to load contributions. Please refresh the page.", {
          duration: 5000,
        });
      }
      // Eğer zaten data varsa, sessizce devam et (auto-refresh hatası)
    } finally {
      setLoading(false);
    }
  };

  const handleEndorse = async (contributionId) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to endorse!");
      return;
    }

    if (CONTRACTS.PACKAGE_ID === "TO_BE_DEPLOYED") {
      toast.error("Smart contracts not deployed yet!");
      return;
    }

    // Check if user is trying to endorse their own contribution
    const contribution = projects.find(p => p.id === contributionId);
    if (contribution && address && contribution.owner.toLowerCase() === address.toLowerCase()) {
      toast.error("You cannot endorse your own contribution!");
      return;
    }
    
    setEndorsingId(contributionId);
    
    try {
      const result = await endorseContribution(signAndExecute, contributionId, contribution.owner);
      
      toast.success("Contribution endorsed!", {
        description: `Transaction: ${result.digest?.slice(0, 8)}...`,
      });

      // Reload contributions after endorsement is confirmed
      await loadAllContributions();
    } catch (error) {
      console.error("Endorsement error:", error);
      
      // Parse Move abort error
      if (error.message?.includes("MoveAbort") && error.message?.includes("3")) {
        toast.error("You cannot endorse your own contribution!");
      } else {
        toast.error("Endorsement failed: " + (error.message || "Unknown error"));
      }
    } finally {
      setEndorsingId(null);
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
          projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              {...project} 
              onEndorse={handleEndorse}
              currentUserAddress={address}
              isEndorsing={endorsingId === project.id}
            />
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
