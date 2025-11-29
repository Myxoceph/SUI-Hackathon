import { useState, useRef, useEffect } from "react";
import { Send, Loader2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMessages } from "@/hooks/useMessages";

/**
 * Chat Component - On-chain mesajlaşma UI
 * SUI blockchain üzerinde mesaj gönderme ve görüntüleme
 */
const Chat = ({ recipientAddress, recipientName = null, className }) => {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  
  const {
    messages,
    loading,
    sending,
    error,
    isConnected,
    userAddress,
    sendMessage,
    formatAddress,
    formatTimestamp,
    clearError,
  } = useMessages(recipientAddress);

  // Mesajlar değiştiğinde en alta scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || sending) return;

    const content = inputMessage.trim();
    setInputMessage("");
    clearError();

    const result = await sendMessage(content);
    
    if (result) {
      console.log("Mesaj on-chain gönderildi:", result.digest);
    }
  };

  // Bağlı değilse uyarı göster
  if (!isConnected) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Cüzdan Bağlantısı Gerekli</h3>
        <p className="text-muted-foreground text-sm">
          Mesaj göndermek için lütfen cüzdanınızı bağlayın.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold">
            {recipientName || formatAddress(recipientAddress)}
          </h3>
          <p className="text-xs text-muted-foreground font-mono">
            {recipientAddress}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            On-Chain
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground mb-2">Henüz mesaj yok</p>
            <p className="text-xs text-muted-foreground">
              İlk on-chain mesajınızı gönderin!
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender === userAddress;
            
            return (
              <div
                key={message.id || index}
                className={cn(
                  "flex",
                  isOwn ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2",
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <div className={cn(
                    "flex items-center gap-2 mt-1",
                    isOwn ? "justify-end" : "justify-start"
                  )}>
                    <span className="text-[10px] opacity-70">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.txDigest && (
                      <a
                        href={`https://suiscan.xyz/testnet/tx/${message.txDigest}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-70 hover:opacity-100 transition-opacity"
                        title="Transaction'ı görüntüle"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {isOwn && message.txDigest && (
                      <CheckCircle2 className="h-3 w-3 opacity-70" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <p className="text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            disabled={sending}
            className="flex-1"
            autoComplete="off"
          />
          <Button 
            type="submit" 
            disabled={!inputMessage.trim() || sending}
            size="icon"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Mesajlar SUI blockchain üzerinde saklanır • Gas ücreti gerektirir
        </p>
      </form>
    </div>
  );
};

export default Chat;
