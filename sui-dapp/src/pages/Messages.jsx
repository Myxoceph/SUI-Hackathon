import { useState, useEffect } from "react";
import { MessageSquare, Plus, Search, Loader2, Users, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import { useWallet } from "@/contexts/WalletContext";
import { useMessages } from "@/hooks/useMessages";
import Chat from "@/components/Chat";

/**
 * Messages Page - On-chain messaging
 */
const Messages = () => {
  const { t } = useTranslation();
  const { isConnected, address } = useWallet();
  const {
    conversations,
    loading,
    loadConversations,
    formatAddress,
  } = useMessages();

  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [newRecipientAddress, setNewRecipientAddress] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load conversations on page load
  useEffect(() => {
    if (isConnected) {
      loadConversations();
    }
  }, [isConnected, loadConversations]);

  // Get consistent color for address
  const getAddressColor = (addr) => {
    if (!addr) return "bg-gray-500";
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500",
      "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-cyan-500"
    ];
    const hash = addr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Start new conversation
  const handleStartNewChat = () => {
    if (!newRecipientAddress.trim()) return;
    
    // SUI address validation (must start with 0x, 64+ characters)
    if (!newRecipientAddress.startsWith("0x") || newRecipientAddress.length < 66) {
      alert("Please enter a valid SUI address (must start with 0x)");
      return;
    }

    setSelectedRecipient(newRecipientAddress.trim());
    setNewRecipientAddress("");
    setShowNewChat(false);
  };

  // Not connected
  if (!isConnected) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Start Messaging</h2>
            <p className="text-muted-foreground text-center mb-4">
              Connect your wallet for on-chain messaging.
            </p>
            <p className="text-xs text-muted-foreground">
              All messages are securely stored on the SUI blockchain.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Aktif sohbet varsa - tam ekran chatbox
  if (selectedRecipient) {
    return (
      <div className="container max-w-4xl mx-auto py-4 px-4 h-[calc(100vh-8rem)]">
        <Card className="h-full flex flex-col overflow-hidden shadow-lg">
          <CardHeader className="py-3 px-4 border-b flex-shrink-0 bg-card">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRecipient(null)}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className={cn("h-9 w-9 rounded-full flex items-center justify-center text-white", getAddressColor(selectedRecipient))}>
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{formatAddress(selectedRecipient)}</CardTitle>
                <p className="text-xs text-muted-foreground truncate font-mono">{selectedRecipient}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <Chat 
              recipientAddress={selectedRecipient}
              className="h-full"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Message
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Secure messaging on SUI blockchain
          </p>
        </div>
        <Button onClick={() => setShowNewChat(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <Card className="mb-6 border-primary shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Start New Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={newRecipientAddress}
                onChange={(e) => setNewRecipientAddress(e.target.value)}
                placeholder={t('messages.recipientPlaceholder')}
                className="font-mono text-sm"
                onKeyPress={(e) => e.key === "Enter" && handleStartNewChat()}
              />
              <Button onClick={handleStartNewChat}>
                {t('messages.start')}
              </Button>
              <Button variant="outline" onClick={() => setShowNewChat(false)}>
                {t('common.cancel')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('messages.recipientHelp')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('messages.searchPlaceholder')}
          className="pl-10"
        />
      </div>

      {/* Conversations List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium mb-2">{t('messages.noConversations')}</p>
              <p className="text-xs text-muted-foreground text-center max-w-sm">
                {t('messages.noConversationsDesc')}
              </p>
            </CardContent>
          </Card>
        ) : (
          conversations
            .filter(conv => {
              if (!searchQuery) return true;
              const otherParticipant = conv.participants?.find(p => p !== address);
              return otherParticipant?.toLowerCase().includes(searchQuery.toLowerCase());
            })
            .map((conversation, index) => {
              const otherParticipant = conversation.participants?.find(p => p !== address);
              const lastMsg = conversation.lastMessage;
              const isLastMsgOwn = lastMsg?.sender === address;
              
              return (
                <Card
                  key={conversation.id || index}
                  className="cursor-pointer hover:bg-muted/50 hover:shadow-md transition-all"
                  onClick={() => setSelectedRecipient(otherParticipant)}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    {/* Avatar */}
                    <div className={cn("h-12 w-12 rounded-full flex items-center justify-center text-white flex-shrink-0", getAddressColor(otherParticipant))}>
                      <User className="h-6 w-6" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold truncate">
                          {formatAddress(otherParticipant)}
                        </p>
                        {lastMsg?.timestamp && (
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {new Date(lastMsg.timestamp).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMsg ? (
                          <>
                            {isLastMsgOwn && <span className="text-primary">You: </span>}
                            {lastMsg.content}
                          </>
                        ) : (
                          <span className="italic">Start the conversation...</span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
          🔐 On-Chain Messaging
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• All messages are stored on the SUI blockchain</li>
          <li>• Gas fees required to send messages</li>
          <li>• Messages are immutable and permanent</li>
          <li>• Every message can be verified with a transaction ID</li>
        </ul>
      </div>
    </div>
  );
};

export default Messages;
