import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Terminal, Wallet, Plus, User, Globe, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = () => {
    // Mock wallet connection
    setWalletAddress("0x71C...9A2");
  };

  const navItems = [
    { path: "/", label: "HOME", icon: Terminal },
    { path: "/passport", label: "PASSPORT", icon: User },
    { path: "/contribute", label: "CONTRIBUTE", icon: Plus },
    { path: "/explore", label: "EXPLORE", icon: Globe },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            T
          </div>
          <span className="font-sans text-xl font-bold tracking-tighter hidden sm:inline-block">
            TrustChain
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                location.pathname === item.path
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant={walletAddress ? "outline" : "default"}
            onClick={connectWallet}
            className="font-mono text-xs h-9"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {walletAddress ? walletAddress : "CONNECT WALLET"}
          </Button>
          
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-border bg-background p-4">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 p-2 hover:bg-muted",
                  location.pathname === item.path
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background font-mono selection:bg-primary selection:text-primary-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <footer className="border-t border-border py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for Sui Hackathon. Inspired by 42.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>v0.1.0-alpha</span>
            <div className="h-4 w-[1px] bg-border" />
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              System Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
