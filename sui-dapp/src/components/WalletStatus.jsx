import { useWallet } from "@/contexts/WalletContext";
import { formatAddress, formatBalance } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const WalletStatus = ({ className = "" }) => {
  const { isConnected, address, balance, loading } = useWallet();

  if (!isConnected) return null;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-mono text-muted-foreground">
              {formatAddress(address)}
            </span>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {formatBalance(balance)} SUI
          </Badge>
        </>
      )}
    </div>
  );
};

export default WalletStatus;
