import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { MESSAGING_CONFIG } from "@/config/contracts";

const MessagingContext = createContext(null);

// Get config from contracts.js
const MESSAGING_PACKAGE_ID = MESSAGING_CONFIG.PACKAGE_ID;
const MESSAGE_SENT_EVENT = MESSAGING_CONFIG.MESSAGE_SENT_EVENT;

export const MessagingProvider = ({ children }) => {
  const suiClient = useSuiClient();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeChannel, setActiveChannel] = useState(null);
  const [loading, setLoading] = useState(false);

  const userAddress = account?.address;
  const isConnected = !!userAddress;

  // Load messages from blockchain events
  const fetchOnChainMessages = useCallback(async (recipientAddress) => {
    if (!userAddress || !suiClient) return [];

    try {
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: MESSAGE_SENT_EVENT,
        },
        limit: 100,
        order: "ascending",
      });

      const relevantMessages = events.data
        .filter(event => {
          const { sender, recipient } = event.parsedJson || {};
          return (
            (sender === userAddress && recipient === recipientAddress) ||
            (sender === recipientAddress && recipient === userAddress)
          );
        })
        .map(event => ({
          id: event.id.txDigest + "_" + event.id.eventSeq,
          sender: event.parsedJson.sender,
          recipient: event.parsedJson.recipient,
          content: event.parsedJson.content,
          timestamp: parseInt(event.parsedJson.timestamp),
          txDigest: event.id.txDigest,
          onChain: true,
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

      const conversationKey = [userAddress, recipientAddress].sort().join("-");
      setMessages(prev => ({
        ...prev,
        [conversationKey]: relevantMessages,
      }));

      return relevantMessages;
    } catch (error) {
      console.error("Failed to fetch on-chain messages:", error);
      return [];
    }
  }, [userAddress, suiClient]);

  // Send message on-chain
  const sendMessage = useCallback(async (recipientAddress, content) => {
    if (!userAddress) {
      throw new Error("Wallet not connected");
    }

    if (!recipientAddress || !content?.trim()) {
      throw new Error("Invalid parameters");
    }

    setLoading(true);
    try {
      const tx = new Transaction();
      
      // Call the messaging module
      tx.moveCall({
        target: `${MESSAGING_PACKAGE_ID}::messaging::send_message`,
        arguments: [
          tx.pure.address(recipientAddress),
          tx.pure.string(content.trim()),
          tx.pure.u64(Date.now()),
        ],
      });

      const result = await signAndExecute({
        transaction: tx,
      });

      const newMessage = {
        id: result.digest + "_0",
        sender: userAddress,
        recipient: recipientAddress,
        content: content.trim(),
        timestamp: Date.now(),
        txDigest: result.digest,
        onChain: true,
      };

      // Update local state
      const conversationKey = [userAddress, recipientAddress].sort().join("-");
      setMessages(prev => ({
        ...prev,
        [conversationKey]: [...(prev[conversationKey] || []), newMessage],
      }));

      // Update conversations list
      updateConversation(recipientAddress, newMessage);

      return { digest: result.digest, success: true };
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userAddress, signAndExecute]);

  // Update conversation in list
  const updateConversation = useCallback((recipientAddress, lastMessage) => {
    setConversations(prev => {
      const existing = prev.find(c => 
        c.participants?.includes(recipientAddress) && c.participants?.includes(userAddress)
      );

      if (existing) {
        return prev.map(c => 
          c === existing 
            ? { ...c, lastMessage, updatedAt: Date.now() }
            : c
        ).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      }

      return [{
        id: `conv-${Date.now()}`,
        participants: [userAddress, recipientAddress],
        lastMessage,
        updatedAt: Date.now(),
      }, ...prev];
    });
  }, [userAddress]);

  // Load all conversations from blockchain
  const loadConversations = useCallback(async () => {
    if (!userAddress || !suiClient) return;

    setLoading(true);
    try {
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: MESSAGE_SENT_EVENT,
        },
        limit: 100,
        order: "descending",
      });

      const conversationMap = new Map();
      
      events.data.forEach(event => {
        const { sender, recipient, content, timestamp } = event.parsedJson || {};
        
        if (sender === userAddress || recipient === userAddress) {
          const otherParty = sender === userAddress ? recipient : sender;
          const key = [userAddress, otherParty].sort().join("-");
          
          const existing = conversationMap.get(key);
          const msgTimestamp = parseInt(timestamp);
          
          if (!existing || msgTimestamp > existing.lastMessage.timestamp) {
            conversationMap.set(key, {
              id: key,
              participants: [userAddress, otherParty],
              lastMessage: {
                sender,
                recipient,
                content,
                timestamp: msgTimestamp,
              },
              updatedAt: msgTimestamp,
            });
          }
        }
      });

      const convList = Array.from(conversationMap.values())
        .sort((a, b) => b.updatedAt - a.updatedAt);

      setConversations(convList);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [userAddress, suiClient]);

  // Get messages for a specific conversation
  const getConversationMessages = useCallback((recipientAddress) => {
    if (!userAddress || !recipientAddress) return [];
    const conversationKey = [userAddress, recipientAddress].sort().join("-");
    return messages[conversationKey] || [];
  }, [messages, userAddress]);

  // Get all conversations
  const getConversations = useCallback(() => {
    return conversations;
  }, [conversations]);

  // Open a conversation
  const openConversation = useCallback(async (recipientAddress) => {
    if (!userAddress) return null;

    const conversationId = [userAddress, recipientAddress].sort().join("-");
    
    setActiveChannel({
      id: conversationId,
      participants: [userAddress, recipientAddress],
      recipientAddress,
    });

    // Fetch messages for this conversation
    await fetchOnChainMessages(recipientAddress);

    return conversationId;
  }, [userAddress, fetchOnChainMessages]);

  // Fetch channels (alias for loadConversations)
  const fetchChannels = useCallback(async () => {
    return loadConversations();
  }, [loadConversations]);

  const value = {
    userAddress,
    isConnected,
    conversations,
    activeChannel,
    messages,
    loading,
    sendMessage,
    fetchChannels,
    loadConversations,
    openConversation,
    getConversationMessages,
    getConversations,
    setActiveChannel,
    fetchOnChainMessages,
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
