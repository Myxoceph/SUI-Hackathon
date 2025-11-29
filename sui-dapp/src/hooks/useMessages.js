import { useState, useCallback, useEffect, useMemo } from "react";
import { useMessaging } from "@/contexts/MessagingContext";

/**
 * Mesajlaşma işlevleri için hook
 * On-chain mesajlaşma özelliklerini kolayca kullanmak için
 */
export const useMessages = (recipientAddress = null) => {
  const {
    messagingClient,
    clientReady,
    userAddress,
    channels,
    activeChannel,
    messages: allMessages,
    loading,
    sendMessage: contextSendMessage,
    fetchChannels,
    openConversation,
    getConversationMessages,
    getConversations,
  } = useMessaging();

  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  // Bu konuşmaya ait mesajları filtrele
  const messages = useMemo(() => {
    if (!recipientAddress) return allMessages;
    return getConversationMessages(recipientAddress);
  }, [allMessages, recipientAddress, getConversationMessages]);

  // Konuşmaları getir
  const conversations = useMemo(() => {
    return getConversations();
  }, [getConversations]);

  // Belirli bir alıcıya mesaj gönder
  const sendMessage = useCallback(async (content, recipient = recipientAddress) => {
    if (!recipient) {
      setError("Alıcı adresi gerekli");
      return null;
    }

    if (!content?.trim()) {
      setError("Mesaj içeriği gerekli");
      return null;
    }

    setSending(true);
    setError(null);

    try {
      const result = await contextSendMessage(recipient, content);
      return result;
    } catch (err) {
      setError(err.message || "Mesaj gönderilemedi");
      console.error("Mesaj gönderme hatası:", err);
      return null;
    } finally {
      setSending(false);
    }
  }, [contextSendMessage, recipientAddress]);

  // Konuşmaları yükle
  const loadConversations = useCallback(async () => {
    setError(null);
    try {
      return await fetchChannels();
    } catch (err) {
      setError(err.message || "Konuşmalar yüklenemedi");
      return [];
    }
  }, [fetchChannels]);

  // Bir kullanıcıyla konuşma başlat
  const startConversation = useCallback((recipient = recipientAddress) => {
    if (!recipient) {
      setError("Alıcı adresi gerekli");
      return null;
    }

    setError(null);
    return openConversation(recipient);
  }, [openConversation, recipientAddress]);

  // Adres kısaltma yardımcı fonksiyonu
  const formatAddress = useCallback((address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Mesaj zaman damgası formatla
  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    
    // Bugün mü?
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("tr-TR", { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    }
    
    // Bu yıl mı?
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString("tr-TR", { 
        day: "numeric", 
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    
    return date.toLocaleDateString("tr-TR", { 
      day: "numeric", 
      month: "short", 
      year: "numeric" 
    });
  }, []);

  // Bağlantı durumu - sadece userAddress kontrol et
  const isConnected = !!userAddress;

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
    clientReady,

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
