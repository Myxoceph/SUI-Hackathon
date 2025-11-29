import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ConnectButton, useSuiClient } from "@mysten/dapp-kit";
import StatCard from "@/components/StatCard";
import FeatureCard from "@/components/FeatureCard";
import { STATS, FEATURES } from "@/constants/home";
import { useWallet } from "@/contexts/WalletContext";
import { useState, useEffect } from "react";
import { CONTRACTS } from "@/config/contracts";

const Home = () => {
  const { isConnected, userProfile } = useWallet();
  const client = useSuiClient();
  const [stats, setStats] = useState(STATS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRealStats = async () => {
      if (CONTRACTS.PACKAGE_ID === "TO_BE_DEPLOYED") {
        // Fallback to localStorage if contracts not deployed
        calculateLocalStats();
        return;
      }

      setLoading(true);
      try {
        // Fetch all ProjectCreated events
        const events = await client.queryEvents({
          query: {
            MoveEventType: `${CONTRACTS.PACKAGE_ID}::contribution::ProjectCreated`,
          },
          limit: 1000,
          order: 'descending',
        });

        const totalProjects = events.data.length;

        // Get unique project owners (users)
        const uniqueOwners = new Set(events.data.map(e => e.parsedJson.owner));
        const totalUsers = uniqueOwners.size;

        // Fetch registry for total endorsements
        let totalEndorsements = 0;
        try {
          const registry = await client.getObject({
            id: CONTRACTS.PROJECT_REGISTRY,
            options: { showContent: true },
          });

          const endorsementCountsTableId = registry.data?.content?.fields?.endorsement_counts?.fields?.id?.id;
          if (endorsementCountsTableId) {
            // Get all dynamic fields (each represents a project's endorsement count)
            const dynamicFields = await client.getDynamicFields({
              parentId: endorsementCountsTableId,
              limit: 1000,
            });

            // Sum up all endorsement counts
            for (const field of dynamicFields.data) {
              try {
                const fieldObject = await client.getDynamicFieldObject({
                  parentId: endorsementCountsTableId,
                  name: field.name,
                });
                const count = parseInt(fieldObject.data?.content?.fields?.value || "0");
                totalEndorsements += count;
              } catch (e) {
                // Skip if can't read
              }
            }
          }
        } catch (error) {
          console.error('Error fetching endorsements:', error);
        }

        const activityPercentage = totalProjects > 0 
          ? Math.min(100, Math.round((totalEndorsements / totalProjects) * 10)) + "%"
          : "0%";

        setStats([
          { label: "TOTAL PROJECTS", value: totalProjects.toString(), icon: STATS[0].icon },
          { label: "VERIFIED USERS", value: totalUsers.toString(), icon: STATS[1].icon },
          { label: "ENDORSEMENTS", value: totalEndorsements.toString(), icon: STATS[2].icon },
          { label: "NETWORK ACTIVITY", value: activityPercentage, icon: STATS[3].icon },
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
        calculateLocalStats();
      } finally {
        setLoading(false);
      }
    };

    const calculateLocalStats = () => {
      let totalProjects = 0;
      let totalEndorsements = 0;
      let totalUsers = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('projects_')) {
          const data = JSON.parse(localStorage.getItem(key));
          totalProjects += data.length;
          totalEndorsements += data.reduce((sum, p) => sum + (p.endorsements || 0), 0);
        }
        
        if (key && key.startsWith('user_')) {
          totalUsers++;
        }
      }

      setStats([
        { label: "TOTAL PROJECTS", value: totalProjects.toString(), icon: STATS[0].icon },
        { label: "VERIFIED USERS", value: totalUsers.toString(), icon: STATS[1].icon },
        { label: "ENDORSEMENTS", value: totalEndorsements.toString(), icon: STATS[2].icon },
        { label: "NETWORK ACTIVITY", value: totalProjects > 0 ? "LIVE" : "0%", icon: STATS[3].icon },
      ]);
    };

    fetchRealStats();

    // Auto-refresh stats every 30 seconds
    const interval = setInterval(fetchRealStats, 30000);
    return () => clearInterval(interval);
  }, [isConnected]);

  return (
  <div className="space-y-16 py-8">
    {/* Hero Section */}
    <section className="flex flex-col items-start gap-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
      <div className="inline-flex items-center rounded border border-border bg-muted px-3 py-1 text-sm font-mono text-muted-foreground">
        <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-blink" />
        {isConnected && userProfile 
          ? `WELCOME_BACK, ${userProfile.username.toUpperCase()}`
          : "INITIALIZING TRUST_PROTOCOL..."}
      </div>
      
      <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1] font-sans max-w-3xl">
        On-Chain Project <br className="hidden sm:inline" />
        Portfolio for Builders.
      </h1>
      
      <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl font-mono">
        Verify your skills. Endorse peers. Build your reputation on Sui.
        A decentralized CV that speaks code, not buzzwords.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {isConnected ? (
          <>
            <Link to="/passport">
              <Button size="lg" className="w-full sm:w-auto font-mono text-base h-12 px-8">
                VIEW PASSPORT <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contribute">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-mono text-base h-12 px-8">
                SUBMIT WORK
              </Button>
            </Link>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <ConnectButton className="font-mono text-base h-12 px-8" />
            <span className="text-sm text-muted-foreground">Connect your wallet or sign in with Google to get started</span>
          </div>
        )}
      </div>
    </section>

    {/* Stats Grid */}
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </section>

    {/* Features */}
    <section className="grid gap-8 md:grid-cols-3">
      {FEATURES.map((feature) => (
        <FeatureCard key={feature.title} {...feature} />
      ))}
    </section>
  </div>
  );
};

export default Home;
