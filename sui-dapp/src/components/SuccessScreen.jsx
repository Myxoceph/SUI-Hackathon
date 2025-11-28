import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const SuccessScreen = ({ onReset }) => (
  <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center animate-in fade-in zoom-in duration-500">
    <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
      <CheckCircle2 className="h-10 w-10 text-green-500" />
    </div>
    <div className="space-y-2">
      <h2 className="text-2xl font-bold font-sans">Submission Verified</h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        Your contribution has been hashed and recorded on the Sui blockchain. 
        Transaction ID: <span className="font-mono text-primary">0x8f...3k9</span>
      </p>
    </div>
    <div className="flex gap-4">
      <Button onClick={onReset} variant="outline">Submit Another</Button>
      <Button>View on Explorer</Button>
    </div>
  </div>
);

export default SuccessScreen;
