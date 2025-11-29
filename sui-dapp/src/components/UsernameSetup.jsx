import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const UsernameSetup = ({ address, onComplete }) => {
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters!");
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      toast.error("Username can only contain letters, numbers, _ and -");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Check username availability on smart contract
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage
      const userData = {
        username,
        address,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem(`user_${address}`, JSON.stringify(userData));
      
      toast.success(`Welcome, ${username}!`);
      onComplete(userData);
    } catch (error) {
      toast.error("Failed to create username");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold font-sans">Welcome to TrustChain</h2>
            <p className="text-sm text-muted-foreground font-mono">
              Choose a username to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="font-mono uppercase text-xs">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="e.g. builder_42"
                className="rounded-none border-border bg-background font-mono"
                autoFocus
                required
                minLength={3}
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                3-20 characters, letters, numbers, _ and - only
              </p>
            </div>

            <Button
              type="submit"
              className="w-full font-mono h-12 text-base"
              disabled={isSubmitting || username.length < 3}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  CREATING PROFILE...
                </>
              ) : (
                "CREATE PROFILE"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-muted-foreground font-mono">
              Connected: {address?.slice(0, 8)}...{address?.slice(-6)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsernameSetup;
