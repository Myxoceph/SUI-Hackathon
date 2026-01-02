import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Languages } from "lucide-react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const account = useCurrentAccount();
  const [loggedAddress, setLoggedAddress] = useState(null);
  const { t, i18n } = useTranslation();

  const NAV_ITEMS = [
    { path: "/", label: t('nav.home'), icon: Menu },
    { path: "/passport", label: t('nav.passport'), icon: Menu },
    { path: "/contribute", label: t('nav.contribute'), icon: Menu },
    { path: "/explore", label: t('nav.explore'), icon: Menu },
    { path: "/jobs", label: t('nav.jobs'), icon: Menu },
    { path: "/community", label: t('nav.community'), icon: Menu },
    { path: "/leaderboard", label: t('nav.leaderboard'), icon: Menu },
    { path: "/messages", label: t('nav.messages'), icon: Menu },
    { path: "/settings", label: t('nav.settings'), icon: Menu },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  // Log wallet address once for faucet (only when address changes)
  useEffect(() => {
    if (account?.address && account.address !== loggedAddress) {
      console.log('🔑 Connected Wallet Address:', account.address);
      console.log('💰 Get testnet SUI: https://faucet.sui.io/', '\nPaste address:', account.address);
      setLoggedAddress(account.address);
    } else if (!account?.address && loggedAddress) {
      console.log('👋 Wallet disconnected');
      setLoggedAddress(null);
    }
  }, [account?.address, loggedAddress]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
          <img 
            src="/Logo.png" 
            alt={APP_NAME} 
            className="h-10 w-10 object-contain"
          />
          <span className="font-sans text-xl font-bold tracking-tighter hidden sm:inline-block">
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2 overflow-x-auto flex-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "text-xs font-medium transition-colors hover:text-primary flex items-center gap-1.5 px-2 py-1.5 rounded-md whitespace-nowrap",
                location.pathname === path 
                  ? "text-foreground bg-muted" 
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Languages className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none border-border">
              <DropdownMenuItem 
                onClick={() => changeLanguage('en')}
                className={cn(
                  "cursor-pointer",
                  i18n.language === 'en' && "bg-muted"
                )}
              >
                🇬🇧 English
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => changeLanguage('tr')}
                className={cn(
                  "cursor-pointer",
                  i18n.language === 'tr' && "bg-muted"
                )}
              >
                🇹🇷 Türkçe
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ConnectButton className="font-mono text-xs" />
          
          <button className="lg:hidden p-2" onClick={toggleMenu}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden border-b border-border bg-background p-4">
          <div className="flex flex-col gap-2">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={closeMenu}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 p-2 rounded-md",
                  location.pathname === path ? "text-foreground bg-muted" : "text-muted-foreground hover:bg-muted/50"
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
