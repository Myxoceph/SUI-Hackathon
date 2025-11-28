import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Shield, Code, Users, Activity, Globe } from "lucide-react";

const StatCard = ({ label, value, icon: Icon }) => (
  <Card className="border-border bg-card/50 hover:bg-card transition-colors">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground font-mono">
        {label}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold font-sans">{value}</div>
    </CardContent>
  </Card>
);

const Home = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="flex flex-col items-start gap-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="inline-flex items-center rounded border border-border bg-muted px-3 py-1 text-sm font-mono text-muted-foreground">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-blink"></span>
          INITIALIZING TRUST_PROTOCOL...
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
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="TOTAL CONTRIBUTIONS" value="1,284" icon={Code} />
        <StatCard label="VERIFIED USERS" value="843" icon={Users} />
        <StatCard label="ENDORSEMENTS" value="3,921" icon={Shield} />
        <StatCard label="NETWORK ACTIVITY" value="98.2%" icon={Activity} />
      </section>

      {/* Features / Why TrustChain */}
      <section className="grid gap-8 md:grid-cols-3">
        <div className="space-y-4 border border-border p-6 bg-card/30">
          <div className="h-10 w-10 bg-primary/10 flex items-center justify-center border border-primary/20">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold font-sans">Verifiable Proof</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Every contribution is hashed and stored on Sui. Immutable proof of your work history that cannot be forged or deleted.
          </p>
        </div>
        
        <div className="space-y-4 border border-border p-6 bg-card/30">
          <div className="h-10 w-10 bg-primary/10 flex items-center justify-center border border-primary/20">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold font-sans">Peer Endorsements</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Reputation is built by peers, not platforms. Get endorsed by other verified builders in the ecosystem.
          </p>
        </div>
        
        <div className="space-y-4 border border-border p-6 bg-card/30">
          <div className="h-10 w-10 bg-primary/10 flex items-center justify-center border border-primary/20">
            <Globe className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold font-sans">Universal CV</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            One passport for all hackathons, jobs, and grants. Connect your wallet and show what you've built.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
