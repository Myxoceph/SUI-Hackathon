import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Fuel, ExternalLink, Server } from 'lucide-react';
import { getSponsorshipMode } from '@/lib/backendSponsorship';

/**
 * Banner for gas sponsorship status
 * Shows different messages based on sponsorship state
 */
function GasSponsorBanner({ 
  hasGas, 
  balance, 
  isSponsored, 
  address,
  onRequestGas 
}) {
  const sponsorshipMode = getSponsorshipMode();
  
  // Backend or Enoki sponsorship aktif
  if (isSponsored || sponsorshipMode.mode !== 'none') {
    const isBackend = sponsorshipMode.mode === 'backend';
    
    return (
      <Alert className="border-green-500/50 bg-green-500/10">
        {isBackend ? (
          <Server className="h-4 w-4 text-green-500" />
        ) : (
          <Fuel className="h-4 w-4 text-green-500" />
        )}
        <AlertDescription className="text-sm">
          ⚡ <strong>{sponsorshipMode.label}</strong> - {sponsorshipMode.description}
        </AlertDescription>
      </Alert>
    );
  }

  // User'ın gas'ı var
  if (hasGas) {
    return (
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <Fuel className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-sm">
          💰 Balance: <strong>{balance?.toFixed(4)} SUI</strong>
        </AlertDescription>
      </Alert>
    );
  }

  // Gas yok - Faucet link göster
  return (
    <Alert className="border-orange-500/50 bg-orange-500/10">
      <Fuel className="h-4 w-4 text-orange-500" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="text-sm">
          <strong>No gas available.</strong> Get free testnet SUI to continue.
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            window.open(`https://faucet.sui.io/?address=${address}`, '_blank');
            if (onRequestGas) onRequestGas();
          }}
          className="shrink-0"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Get Free SUI
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export default GasSponsorBanner;
