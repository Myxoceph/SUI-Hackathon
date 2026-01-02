import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import SuccessScreen from "@/components/SuccessScreen";
import { PROJECT_TYPES } from "@/constants/forms";
import { useWallet } from "@/contexts/WalletContext";
import { createProject } from "@/lib/suiTransactions";
import { CONTRACTS } from "@/config/contracts";

const CreateProject = () => {
  const { t } = useTranslation();
  const { isConnected, address, refreshData } = useWallet();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [projectData, setProjectData] = useState({
    type: '',
    title: '',
    description: '',
    proofLink: '',
  });
  const [lastProject, setLastProject] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Please connect your wallet first!");
      return;
    }

    // Check if contracts are deployed
    if (CONTRACTS.PACKAGE_ID === "TO_BE_DEPLOYED") {
      toast.error("Smart contracts not deployed yet! Please deploy contracts first.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create project NFT on-chain - WAIT for transaction confirmation
      const result = await createProject(signAndExecute, projectData);
      
      // Transaction confirmed! Now refresh data
      await refreshData();
      
      // Store for success screen
      setLastProject({
        ...projectData,
        timestamp: Date.now(),
        txDigest: result.digest,
      });
      
      setIsSuccess(true);
      toast.success("Project NFT created successfully! 🎉", {
        description: `Transaction: ${result.digest?.slice(0, 8)}...`,
      });
      
      // Reset form
      setProjectData({
        type: '',
        title: '',
        description: '',
        proofLink: '',
      });
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error("Transaction failed: " + (error.message || "Unknown error"));
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
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-sans">{t('wallet.connect')}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('errors.walletRequired')}
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <SuccessScreen 
        onReset={() => {
          setIsSuccess(false);
          setLastProject(null);
        }}
        project={lastProject}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-sans">{t('contribute.title')}</h1>
        <p className="text-muted-foreground font-mono text-sm">
          Record your work on-chain. All submissions are subject to peer verification.
        </p>
      </div>

      <Card className="border-border bg-card/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="font-mono uppercase text-xs">{t('contribute.projectType')}</Label>
              <Select 
                required
                value={projectData.type}
                onValueChange={(value) => setProjectData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="rounded-none border-border bg-background">
                  <SelectValue placeholder={t('contribute.selectType')} />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border">
                  {PROJECT_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="font-mono uppercase text-xs">{t('contribute.projectTitle')}</Label>
              <Input 
                id="title" 
                placeholder="e.g. Implemented Staking Module" 
                className="rounded-none border-border bg-background"
                required
                value={projectData.title}
                onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-mono uppercase text-xs">{t('contribute.description')}</Label>
              <Textarea 
                id="description" 
                placeholder="Describe what you built, the technologies used, and the impact..." 
                className="rounded-none border-border bg-background min-h-[120px]"
                required
                value={projectData.description}
                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proof" className="font-mono uppercase text-xs">{t('contribute.proofLink')}</Label>
              <Input 
                id="proof" 
                type="url"
                placeholder={t('contribute.proofPlaceholder')} 
                className="rounded-none border-border bg-background"
                required
                value={projectData.proofLink}
                onChange={(e) => setProjectData(prev => ({ ...prev, proofLink: e.target.value }))}
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
                    {t('contribute.creating').toUpperCase()}
                  </>
                ) : (
                  t('contribute.createProject').toUpperCase()
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

export default CreateProject;
