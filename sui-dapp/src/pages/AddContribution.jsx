import { useState } from 'react';
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

const AddContribution = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
    toast.success("Contribution submitted to the blockchain!");
  };

  if (isSuccess) {
    return <SuccessScreen onReset={() => setIsSuccess(false)} />;
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
              <Select required>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-mono uppercase text-xs">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe what you built, the technologies used, and the impact..." 
                className="rounded-none border-border bg-background min-h-[120px]"
                required
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
