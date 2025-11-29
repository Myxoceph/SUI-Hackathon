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
  const [userEndorsements, setUserEndorsements] = useState(new Set());

  useEffect(() => {
    loadAllContributions();
    
    // Auto-refresh every 30 seconds (balanced)
    const interval = setInterval(() => {
      loadAllContributions();
    }, 30000);

    return () => clearInterval(interval);
  }, []); // Empty dependency - sadece mount/unmount'ta çalışır

  // Wallet değiştiğinde contributions'ı yeniden yükle (endorsement check içinde)
  useEffect(() => {
    if (address && projects.length > 0) {
      // Sadece endorsement check yap, contributions zaten yüklü
      const contributionIds = projects.map(p => p.id);
      checkUserEndorsements(contributionIds);
    } else if (!address) {
      // Wallet disconnected - clear endorsements
      setUserEndorsements(new Set());
    }
  }, [address]); // Sadece address değiştiğinde çalışır

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
        
        // Check which contributions current user has endorsed
        if (address) {
          await checkUserEndorsements(contributionIds);
        }
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

  const checkUserEndorsements = async (contributionIds) => {
    if (!address || !contributionIds || contributionIds.length === 0) {
      return;
    }
    
    try {
      const registry = await client.getObject({
        id: CONTRACTS.CONTRIBUTION_REGISTRY,
        options: { showContent: true },
      });

      const endorsersTableId = registry.data?.content?.fields?.endorsers?.fields?.id?.id;
      if (!endorsersTableId) {
        setUserEndorsements(new Set());
        return;
      }

      const endorsed = new Set();
      
      // Check each contribution sequentially to avoid race conditions
      for (const contributionId of contributionIds) {
        try {
          // Get endorsers table for this contribution
          const endorsersForContribution = await client.getDynamicFieldObject({
            parentId: endorsersTableId,
            name: {
              type: "0x2::object::ID",
              value: contributionId,
            },
          });

          const innerTableId = endorsersForContribution.data?.content?.fields?.value?.fields?.id?.id;
          if (!innerTableId) {
            continue;
          }

          // Check if current user is in this table
          try {
            const userEndorsement = await client.getDynamicFieldObject({
              parentId: innerTableId,
              name: {
                type: "address",
                value: address,
              },
            });
            
            if (userEndorsement.data) {
              endorsed.add(contributionId);
            }
          } catch (e) {
            // User hasn't endorsed this one - expected
          }
        } catch (e) {
          // No endorsers yet for this contribution - expected
        }
      }
      
      setUserEndorsements(endorsed);
    } catch (error) {
      console.error('Error checking user endorsements:', error);
      // Clear on error to prevent stale state
      setUserEndorsements(new Set());
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
    
    // Check if already endorsed
    if (userEndorsements.has(contributionId)) {
      toast.error("You already endorsed this contribution!");
      return;
    }
    
    setEndorsingId(contributionId);
    
    try {
      const result = await endorseContribution(signAndExecute, contributionId, contribution.owner);
      
      toast.success("Contribution endorsed!", {
        description: `Transaction: ${result.digest?.slice(0, 8)}...`,
      });

      // Add to local endorsements set immediately
      setUserEndorsements(prev => new Set([...prev, contributionId]));
      
      // Reload contributions after endorsement is confirmed
      await loadAllContributions();
    } catch (error) {
      console.error("Endorsement error:", error);
      
      // Parse Move abort error codes
      if (error.message?.includes("MoveAbort")) {
        if (error.message?.includes("3")) {
          toast.error("You cannot endorse your own contribution!");
        } else if (error.message?.includes("2")) {
          toast.error("You already endorsed this contribution!");
        } else {
          toast.error("Endorsement failed: " + (error.message || "Unknown error"));
        }
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
              hasEndorsed={userEndorsements.has(project.id)}
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
