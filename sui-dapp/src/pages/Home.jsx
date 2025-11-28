import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import StatCard from "@/components/StatCard";
import FeatureCard from "@/components/FeatureCard";
import { STATS, FEATURES } from "@/constants/home";

const Home = () => (
  <div className="space-y-16 py-8">
    {/* Hero Section */}
    <section className="flex flex-col items-start gap-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
      <div className="inline-flex items-center rounded border border-border bg-muted px-3 py-1 text-sm font-mono text-muted-foreground">
        <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-blink" />
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
      {STATS.map((stat) => (
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

export default Home;
