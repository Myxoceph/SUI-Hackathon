import { useState, useCallback, useEffect, useMemo } from "react";
import { useMessaging } from "@/contexts/MessagingContext";

/**
 * Hook for messaging functionality
 * Provides easy access to on-chain messaging features
 */
export const useMessages = (recipientAddress = null) => {
  const {
    userAddress,
    isConnected,
    conversations: contextConversations,
    activeChannel,
    messages: allMessages,
    loading,
    sendMessage: contextSendMessage,
    fetchChannels,
    openConversation,
    getConversationMessages,
    getConversations,
    fetchOnChainMessages,
  } = useMessaging();

  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  // Filter messages for this conversation
  const messages = useMemo(() => {
    if (!recipientAddress) return [];
    return getConversationMessages(recipientAddress);
  }, [allMessages, recipientAddress, getConversationMessages]);

  // Get conversations list
  const conversations = useMemo(() => {
    return getConversations();
  }, [getConversations, contextConversations]);

  // Load messages when recipient changes
  useEffect(() => {
    if (recipientAddress && isConnected) {
      fetchOnChainMessages(recipientAddress);
    }
  }, [recipientAddress, isConnected, fetchOnChainMessages]);

  // Send message to recipient
  const sendMessage = useCallback(async (content, recipient = recipientAddress) => {
    if (!recipient) {
      setError("Recipient address required");
      return null;
    }

    if (!content?.trim()) {
      setError("Message content required");
      return null;
    }

    setSending(true);
    setError(null);

    try {
      const result = await contextSendMessage(recipient, content);
      return result;
    } catch (err) {
      setError(err.message || "Failed to send message");
      console.error("Send message error:", err);
      return null;
    } finally {
      setSending(false);
    }
  }, [contextSendMessage, recipientAddress]);

  // Load all conversations
  const loadConversations = useCallback(async () => {
    setError(null);
    try {
      return await fetchChannels();
    } catch (err) {
      setError(err.message || "Failed to load conversations");
      return [];
    }
  }, [fetchChannels]);

  // Start a conversation with user
  const startConversation = useCallback(async (recipient = recipientAddress) => {
    if (!recipient) {
      setError("Recipient address required");
      return null;
    }

    setError(null);
    return await openConversation(recipient);
  }, [openConversation, recipientAddress]);

  // Format address helper
  const formatAddress = useCallback((address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Format timestamp helper
  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    
    // Today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    }
    
    // This year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString("en-US", { 
        day: "numeric", 
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    
    return date.toLocaleDateString("en-US", { 
      day: "numeric", 
      month: "short", 
      year: "numeric" 
    });
  }, []);

  return {
    // State
    messages,
    conversations,
    activeConversation: activeChannel,
    loading: loading || sending,
    sending,
    error,
    isConnected,
    userAddress,

    // Actions
    sendMessage,
    loadConversations,
    startConversation,

    // Helpers
    formatAddress,
    formatTimestamp,
    
    // Clear error
    clearError: () => setError(null),
  };
};

export default useMessages;
