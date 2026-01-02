import { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Send, Loader2, AlertCircle, CheckCircle2, ExternalLink, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMessages } from "@/hooks/useMessages";

/**
 * Chat Component - On-chain messaging UI
 * Send and view messages on SUI blockchain
 */
const Chat = ({ recipientAddress, recipientName = null, className, onBack }) => {
  const { t } = useTranslation();
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

  // Scroll to bottom when messages change
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
      console.log("Message sent:", result.digest);
    }
  };

  // Get consistent color for each address
  const getAddressColor = (address) => {
    if (!address) return "bg-gray-500";
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500",
      "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-cyan-500"
    ];
    const hash = address.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Show warning if not connected
  if (!isConnected) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('components.chat.walletRequired')}</h3>
        <p className="text-muted-foreground">
          {t('components.chat.connectToMessage')}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-white", getAddressColor(recipientAddress))}>
          <User className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">
            {recipientName || formatAddress(recipientAddress)}
          </h3>
          <p className="text-xs text-muted-foreground font-mono truncate">
            {recipientAddress}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
            {t('components.chat.online')}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className={cn("h-16 w-16 rounded-full flex items-center justify-center text-white mb-4", getAddressColor(recipientAddress))}>
              <User className="h-8 w-8" />
            </div>
            <p className="font-medium mb-1">{formatAddress(recipientAddress)}</p>
            <p className="text-muted-foreground text-sm mb-4">{t('components.chat.noMessages')}</p>
            <p className="text-xs text-muted-foreground">
              {t('components.chat.startConversation')}
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender === userAddress;
            const senderAddress = message.sender;
            const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender !== senderAddress);
            
            return (
              <div
                key={message.id || index}
                className={cn(
                  "flex gap-2",
                  isOwn ? "justify-end" : "justify-start"
                )}
              >
                {/* Avatar (only for other party) */}
                {!isOwn && (
                  <div className="w-8 flex-shrink-0">
                    {showAvatar && (
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white text-xs", getAddressColor(senderAddress))}>
                        {formatAddress(senderAddress).slice(0, 2)}
                      </div>
                    )}
                  </div>
                )}

                <div className={cn("max-w-[70%] flex flex-col", isOwn ? "items-end" : "items-start")}>
                  {/* Sender info (only for other party) */}
                  {!isOwn && showAvatar && (
                    <span className="text-xs text-muted-foreground mb-1 ml-1">
                      {formatAddress(senderAddress)}
                    </span>
                  )}

                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2 shadow-sm",
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border rounded-bl-md"
                    )}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Zaman ve durum */}
                  <div className={cn(
                    "flex items-center gap-1.5 mt-1 px-1",
                    isOwn ? "flex-row-reverse" : "flex-row"
                  )}>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.txDigest && (
                      <a
                        href={`https://suiscan.xyz/testnet/tx/${message.txDigest}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="View transaction"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {isOwn && (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                </div>

                {/* Right side spacing (for own messages) */}
                {isOwn && <div className="w-8 flex-shrink-0" />}
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
      <form onSubmit={handleSend} className="p-4 border-t border-border bg-card">
        <div className="flex gap-2 items-center">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t('components.chat.typePlaceholder')}
            disabled={sending}
            className="flex-1 rounded-full bg-muted/50 border-0 focus-visible:ring-1"
            autoComplete="off"
          />
          <Button 
            type="submit" 
            disabled={!inputMessage.trim() || sending}
            size="icon"
            className="rounded-full h-10 w-10"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
