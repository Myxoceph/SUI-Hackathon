import { useState } from 'react';
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SuccessScreen from "@/components/SuccessScreen";
import { CONTRIBUTION_TYPES } from "@/constants/forms";
import { useSuiTransaction } from "@/hooks/useSuiTransaction";

const AddContribution = () => {
  const account = useCurrentAccount();
  const { submitContribution } = useSuiTransaction();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    proof: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitContribution(formData);
      setIsSuccess(true);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return <SuccessScreen onReset={() => setIsSuccess(false)} />;
  }

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-4 py-20">
        <h2 className="text-2xl font-bold font-sans">Connect Your Wallet</h2>
        <p className="text-muted-foreground">Please connect your Sui wallet to submit contributions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-sans">Submit Contribution</h1>
        <p className="text-muted-foreground font-mono text-sm">
          Record your work on-chain. All submissions are subject to peer verification.
        </p>
      </div>

      <Card className="border-border bg-card/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="font-mono uppercase text-xs">Contribution Type</Label>
              <Select 
                required 
                value={formData.type}
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger className="rounded-none border-border bg-background">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border">
                  {CONTRIBUTION_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="font-mono uppercase text-xs">Project Name / Title</Label>
              <Input 
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Implemented Staking Module" 
                className="rounded-none border-border bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-mono uppercase text-xs">Description</Label>
              <Textarea 
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what you built, the technologies used, and the impact..." 
                className="rounded-none border-border bg-background min-h-[120px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proof" className="font-mono uppercase text-xs">Proof Link (Github, Figma, etc)</Label>
              <Input 
                id="proof"
                value={formData.proof}
                onChange={(e) => setFormData({...formData, proof: e.target.value})}
                type="url"
                placeholder="https://github.com/..." 
                className="rounded-none border-border bg-background"
                required
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full font-mono h-12 text-base" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    SIGNING TRANSACTION...
                  </>
                ) : (
                  "SUBMIT ON-CHAIN"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4 font-mono">
                Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddContribution;
