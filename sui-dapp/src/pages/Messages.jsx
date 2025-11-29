import { useState, useEffect } from "react";
import { MessageSquare, Plus, Search, Loader2, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";
import { useMessages } from "@/hooks/useMessages";
import Chat from "@/components/Chat";

/**
 * Messages Page - On-chain mesajlaşma sayfası
 */
const Messages = () => {
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

  // Sayfa yüklendiğinde konuşmaları getir
  useEffect(() => {
    if (isConnected) {
      loadConversations();
    }
  }, [isConnected, loadConversations]);

  // Yeni konuşma başlat
  const handleStartNewChat = () => {
    if (!newRecipientAddress.trim()) return;
    
    // SUI adresi validasyonu (0x ile başlamalı, 64+ karakter)
    if (!newRecipientAddress.startsWith("0x") || newRecipientAddress.length < 66) {
      alert("Geçerli bir SUI adresi girin (0x ile başlamalı)");
      return;
    }

    setSelectedRecipient(newRecipientAddress.trim());
    setNewRecipientAddress("");
    setShowNewChat(false);
  };

  // Bağlı değilse
  if (!isConnected) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Mesajlaşmaya Başlayın</h2>
            <p className="text-muted-foreground text-center mb-4">
              On-chain mesajlaşma için cüzdanınızı bağlayın.
            </p>
            <p className="text-xs text-muted-foreground">
              Tüm mesajlar SUI blockchain üzerinde güvenli şekilde saklanır.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Aktif sohbet varsa
  if (selectedRecipient) {
    return (
      <div className="container max-w-4xl mx-auto py-4 px-4 h-[calc(100vh-8rem)]">
        <Card className="h-full flex flex-col">
          <CardHeader className="py-3 px-4 border-b">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRecipient(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-lg">Sohbet</CardTitle>
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
            Mesajlar
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            SUI blockchain üzerinde güvenli mesajlaşma
          </p>
        </div>
        <Button onClick={() => setShowNewChat(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Sohbet
        </Button>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <Card className="mb-6 border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Yeni Sohbet Başlat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={newRecipientAddress}
                onChange={(e) => setNewRecipientAddress(e.target.value)}
                placeholder="Alıcı SUI adresi (0x...)"
                className="font-mono text-sm"
              />
              <Button onClick={handleStartNewChat}>
                Başlat
              </Button>
              <Button variant="outline" onClick={() => setShowNewChat(false)}>
                İptal
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Mesaj göndermek istediğiniz kişinin SUI cüzdan adresini girin.
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
          placeholder="Konuşma ara..."
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
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Henüz konuşma yok</p>
              <p className="text-xs text-muted-foreground text-center">
                "Yeni Sohbet" butonuna tıklayarak ilk mesajınızı gönderin.
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
              
              return (
                <Card
                  key={conversation.id || index}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedRecipient(otherParticipant)}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {formatAddress(otherParticipant)}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage?.content || "Konuşmayı başlat..."}
                      </p>
                    </div>
                    {conversation.lastMessage?.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.lastMessage.timestamp).toLocaleDateString("tr-TR")}
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium text-sm mb-2">🔐 On-Chain Mesajlaşma</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Tüm mesajlar SUI blockchain üzerinde saklanır</li>
          <li>• Mesaj göndermek için gas ücreti gerekir</li>
          <li>• Mesajlar değiştirilemez ve kalıcıdır</li>
          <li>• Transaction ID ile her mesaj doğrulanabilir</li>
        </ul>
      </div>
    </div>
  );
};

export default Messages;
