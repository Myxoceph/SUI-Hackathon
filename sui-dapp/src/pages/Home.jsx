import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ConnectButton } from "@mysten/dapp-kit";
import StatCard from "@/components/StatCard";
import FeatureCard from "@/components/FeatureCard";
import { STATS, FEATURES } from "@/constants/home";
import { useWallet } from "@/contexts/WalletContext";
import { useState, useEffect } from "react";

const Home = () => {
  const { isConnected, userProfile } = useWallet();
  const [stats, setStats] = useState(STATS);

  useEffect(() => {
    // Calculate real stats from localStorage
    const calculateStats = () => {
      let totalContributions = 0;
      let totalEndorsements = 0;
      let totalUsers = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('contributions_')) {
          const data = JSON.parse(localStorage.getItem(key));
          totalContributions += data.length;
          totalEndorsements += data.reduce((sum, c) => sum + (c.endorsements || 0), 0);
        }
        
        if (key && key.startsWith('user_')) {
          totalUsers++;
        }
      }

      setStats([
        { label: "TOTAL CONTRIBUTIONS", value: totalContributions.toString(), icon: STATS[0].icon },
        { label: "VERIFIED USERS", value: totalUsers.toString(), icon: STATS[1].icon },
        { label: "ENDORSEMENTS", value: totalEndorsements.toString(), icon: STATS[2].icon },
        { label: "NETWORK ACTIVITY", value: totalContributions > 0 ? "LIVE" : "0%", icon: STATS[3].icon },
      ]);
    };

    calculateStats();
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
        On-Chain Contribution <br className="hidden sm:inline" />
        Passport for Builders.
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
            <ConnectButton className="font-mono" />
            <span className="text-sm text-muted-foreground">Connect wallet to get started</span>
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
