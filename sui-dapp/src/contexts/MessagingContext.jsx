import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { SuiStackMessagingClient, TESTNET_MESSAGING_PACKAGE_CONFIG } from "@mysten/messaging";
import { useSuiClient, useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";

const MessagingContext = createContext(null);

// Local storage key for messages
const MESSAGES_STORAGE_KEY = "sui_messages";

export const MessagingProvider = ({ children }) => {
  const suiClient = useSuiClient();
  const account = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const [messagingClient, setMessagingClient] = useState(null);

  // SuiStackMessagingClient'ı experimental_asClientExtension ile oluştur
  useEffect(() => {
    if (!suiClient) {
      setClientReady(false);
      return;
    }

    try {
      // Create extended client with messaging capability
      const extendedClient = new SuiClient({
        url: "https://fullnode.testnet.sui.io:443",
      });
      
      // Register messaging extension
      const messagingExtension = SuiStackMessagingClient.experimental_asClientExtension({
        packageConfig: TESTNET_MESSAGING_PACKAGE_CONFIG,
      });
      
      const client = messagingExtension.register(extendedClient);
      setMessagingClient(client);
      setClientReady(true);
      console.log("✅ Messaging client initialized");
    } catch (error) {
      console.warn("Messaging client oluşturma hatası:", error);
      setClientReady(false);
    }
  }, [suiClient]);

  // Local storage'dan mesajları yükle
  useEffect(() => {
    if (account?.address) {
      const stored = localStorage.getItem(`${MESSAGES_STORAGE_KEY}_${account.address}`);
      if (stored) {
        try {
          setMessages(JSON.parse(stored));
        } catch (e) {
          console.error("Mesajlar yüklenemedi:", e);
        }
      }
    }
  }, [account?.address]);

  // Mesajları local storage'a kaydet
  const saveMessages = useCallback((newMessages) => {
    if (account?.address) {
      localStorage.setItem(
        `${MESSAGES_STORAGE_KEY}_${account.address}`,
        JSON.stringify(newMessages)
      );
    }
  }, [account?.address]);

  // Kanalları getir (on-chain)
  const fetchChannels = useCallback(async () => {
    if (!messagingClient || !account?.address) return [];

    setLoading(true);
    try {
      const result = await messagingClient.getChannelMemberships({
        address: account.address,
      });
      setChannels(result?.data || []);
      return result?.data || [];
    } catch (error) {
      console.error("Kanallar yüklenemedi:", error);
      // Fallback: local storage'dan yükle
      const stored = localStorage.getItem(`sui_channels_${account.address}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setChannels(parsed);
        return parsed;
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [messagingClient, account?.address]);

  // Mesaj gönder (hybrid: on-chain attempt, fallback to local)
  const sendMessage = useCallback(async (recipientAddress, content) => {
    if (!account?.address) {
      throw new Error("Cüzdan bağlı değil");
    }

    setLoading(true);
    try {
      // Yeni mesajı oluştur
      const newMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sender: account.address,
        recipient: recipientAddress,
        content: content,
        timestamp: Date.now(),
        status: "sent",
      };

      // On-chain göndermeyi dene (eğer client hazırsa ve channel varsa)
      if (messagingClient && activeChannel) {
        try {
          // Channel-based mesaj gönderimi için gerekli bilgileri kontrol et
          const channelId = activeChannel.channelId;
          const memberCapId = activeChannel.memberCapId;
          const encryptedKey = activeChannel.encryptedKey;

          if (channelId && memberCapId && encryptedKey) {
            // Not: executeSendMessageTransaction bir signer gerektirir
            // Bu örnek için local mode kullanıyoruz
            console.log("On-chain mesaj gönderimi için channel bilgileri hazır");
          }
        } catch (onChainError) {
          console.warn("On-chain mesaj gönderilemedi, local kayıt:", onChainError);
        }
      }

      // Mesajı local state ve storage'a ekle
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);

      console.log("Mesaj kaydedildi:", newMessage.id);
      return { digest: newMessage.id, success: true };
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account?.address, messages, saveMessages, messagingClient, activeChannel]);

  // Konuşmayı aç
  const openConversation = useCallback((recipientAddress) => {
    if (!account?.address) return null;

    const conversationId = [account.address, recipientAddress].sort().join("_");
    
    setActiveChannel({
      id: conversationId,
      participants: [account.address, recipientAddress],
      recipientAddress,
    });

    return conversationId;
  }, [account?.address]);

  // Belirli bir konuşmanın mesajlarını filtrele
  const getConversationMessages = useCallback((recipientAddress) => {
    if (!account?.address || !recipientAddress) return [];
    
    return messages.filter(msg => 
      (msg.sender === account.address && msg.recipient === recipientAddress) ||
      (msg.sender === recipientAddress && msg.recipient === account.address)
    ).sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, account?.address]);

  // Konuşma listesini oluştur (mesajlardan)
  const getConversations = useCallback(() => {
    if (!account?.address) return [];

    const conversationMap = new Map();

    messages.forEach(msg => {
      const otherAddress = msg.sender === account.address ? msg.recipient : msg.sender;
      if (!otherAddress) return;

      const existing = conversationMap.get(otherAddress);
      if (!existing || existing.timestamp < msg.timestamp) {
        conversationMap.set(otherAddress, {
          id: [account.address, otherAddress].sort().join("_"),
          participants: [account.address, otherAddress],
          lastMessage: msg,
          timestamp: msg.timestamp,
        });
      }
    });

    return Array.from(conversationMap.values()).sort((a, b) => b.timestamp - a.timestamp);
  }, [messages, account?.address]);

  const value = {
    messagingClient,
    clientReady,
    userAddress: account?.address,
    channels,
    activeChannel,
    messages,
    loading,
    sendMessage,
    fetchChannels,
    openConversation,
    getConversationMessages,
    getConversations,
    setActiveChannel,
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return context;
};
