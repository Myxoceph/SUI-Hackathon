import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ConnectButton } from "@mysten/dapp-kit";
import { toast } from "sonner";
import SuccessScreen from "@/components/SuccessScreen";
import { CONTRIBUTION_TYPES } from "@/constants/forms";
import { useWallet } from "@/contexts/WalletContext";

const AddContribution = () => {
  const { isConnected, address, addContribution } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [contributionData, setContributionData] = useState({
    type: '',
    title: '',
    description: '',
    proofLink: '',
  });
  const [lastContribution, setLastContribution] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Please connect your wallet first!");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual smart contract transaction
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add contribution to mock storage
      const result = addContribution(contributionData);
      setLastContribution(result);
      
      setIsSuccess(true);
      toast.success("Contribution submitted to the blockchain!");
      
      // Reset form
      setContributionData({
        type: '',
        title: '',
        description: '',
        proofLink: '',
      });
    } catch (error) {
      toast.error("Transaction failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center border border-border">
          <span className="text-3xl">🔒</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-sans">Connect Your Wallet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Connect your Sui wallet to submit contributions on-chain.
          </p>
          <ConnectButton className="font-mono" />
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <SuccessScreen 
        onReset={() => {
          setIsSuccess(false);
          setLastContribution(null);
        }}
        contribution={lastContribution}
      />
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
                value={contributionData.type}
                onValueChange={(value) => setContributionData(prev => ({ ...prev, type: value }))}
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
                placeholder="e.g. Implemented Staking Module" 
                className="rounded-none border-border bg-background"
                required
                value={contributionData.title}
                onChange={(e) => setContributionData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-mono uppercase text-xs">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe what you built, the technologies used, and the impact..." 
                className="rounded-none border-border bg-background min-h-[120px]"
                required
                value={contributionData.description}
                onChange={(e) => setContributionData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proof" className="font-mono uppercase text-xs">Proof Link (Github, Figma, etc)</Label>
              <Input 
                id="proof" 
                type="url"
                placeholder="https://github.com/..." 
                className="rounded-none border-border bg-background"
                required
                value={contributionData.proofLink}
                onChange={(e) => setContributionData(prev => ({ ...prev, proofLink: e.target.value }))}
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
                Gas Fee: ~0.002 SUI
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddContribution;
