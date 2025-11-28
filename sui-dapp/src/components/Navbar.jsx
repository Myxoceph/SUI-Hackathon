import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, APP_NAME } from "@/constants/navigation";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = () => setWalletAddress("0x71C...9A2");
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            T
          </div>
          <span className="font-sans text-xl font-bold tracking-tighter hidden sm:inline-block">
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                location.pathname === path ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button 
            variant={walletAddress ? "outline" : "default"}
            onClick={connectWallet}
            className="font-mono text-xs h-9"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {walletAddress || "CONNECT WALLET"}
          </Button>
          
          <button className="md:hidden p-2" onClick={toggleMenu}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-border bg-background p-4">
          <div className="flex flex-col gap-4">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={closeMenu}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 p-2 hover:bg-muted",
                  location.pathname === path ? "text-foreground bg-muted" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
