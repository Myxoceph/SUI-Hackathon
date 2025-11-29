import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const SuccessScreen = ({ onReset, contribution }) => {
  const txId = contribution?.txDigest || "0x8f...3k9";
  const shortTxId = txId.length > 20 ? `${txId.slice(0, 8)}...${txId.slice(-6)}` : txId;

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-sans">Submission Verified</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your contribution has been recorded on the Sui blockchain.
        </p>
        
        {contribution && (
          <div className="border border-border bg-card/50 p-4 rounded space-y-3 max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">TYPE</span>
              <Badge variant="secondary" className="rounded-none">{contribution.type}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">TITLE</span>
              <span className="text-sm font-medium">{contribution.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">TX ID</span>
              <span className="text-xs font-mono text-primary">{shortTxId}</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <Button onClick={onReset} variant="outline">Submit Another</Button>
        <Link to="/passport">
          <Button>
            View Passport <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SuccessScreen;
