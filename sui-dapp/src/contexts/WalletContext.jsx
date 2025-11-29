import { createContext, useContext, useState, useEffect } from "react";
import { useCurrentAccount, useSuiClient, useDisconnectWallet } from "@mysten/dapp-kit";
import { useZKLogin } from "@/contexts/ZKLoginContext";
import { getUserProfile } from "@/lib/userProfile";

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const account = useCurrentAccount();
  const { zkAccount, isZkConnected } = useZKLogin();
  const client = useSuiClient();
  const { mutate: disconnect } = useDisconnectWallet();
  const [balance, setBalance] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);

  // Determine active address: ZKLogin takes precedence if connected
  const activeAddress = isZkConnected ? zkAccount?.address : account?.address;
  const isConnected = isZkConnected || !!account;

  useEffect(() => {
    if (activeAddress) {
      checkUserProfile();
      fetchWalletData();
    } else {
      // Wallet disconnected
      setBalance(null);
      setContributions([]);
      setUserProfile(null);
      setShowUsernameSetup(false);
    }
  }, [activeAddress]);

  const checkUserProfile = () => {
    if (!activeAddress) return;
    
    const profile = getUserProfile(activeAddress);
    
    if (!profile) {
      // Yeni kullanıcı - username setup göster
      setShowUsernameSetup(true);
      setUserProfile(null);
    } else {
      // Mevcut kullanıcı - profilini yükle
      setUserProfile(profile);
      setShowUsernameSetup(false);
    }
  };

  const handleUsernameSetup = (userData) => {
    setUserProfile(userData);
    setShowUsernameSetup(false);
  };

  const handleCancelSetup = () => {
    // Username setup iptal edilince wallet bağlantısını kes
    disconnect();
    setShowUsernameSetup(false);
    setUserProfile(null);
  };

  const fetchWalletData = async () => {
    if (!activeAddress) return;
    
    setLoading(true);
    try {
      // Fetch balance with timeout
      const balanceData = await Promise.race([
        client.getBalance({ owner: activeAddress }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Balance fetch timeout')), 10000)
        )
      ]);
      setBalance(balanceData.totalBalance);

      // Fetch contributions from blockchain or localStorage
      const { getUserContributions } = await import("@/lib/suiTransactions");
      const { CONTRACTS } = await import("@/config/contracts");
      
      if (CONTRACTS.PACKAGE_ID === "TO_BE_DEPLOYED") {
        // Mock mode: load from localStorage
        const stored = localStorage.getItem(`contributions_${activeAddress}`);
        if (stored) {
          setContributions(JSON.parse(stored));
        } else {
          setContributions([]);
        }
      } else {
        // On-chain mode: fetch user's Contribution NFTs with timeout
        const onChainContributions = await Promise.race([
          getUserContributions(client, activeAddress),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Contributions fetch timeout')), 15000)
          )
        ]);
        setContributions(onChainContributions);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      // Sessizce devam et - kullanıcıyı rahatsız etme
    } finally {
      setLoading(false);
    }
  };

  const addContribution = (contributionData) => {
    const newContribution = {
      id: `mock_${Date.now()}`,
      owner: activeAddress,
      ...contributionData,
      endorsements: 0,
      createdAt: Date.now(),
      txDigest: `mock_tx_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updated = [...contributions, newContribution];
    setContributions(updated);
    localStorage.setItem(`contributions_${activeAddress}`, JSON.stringify(updated));
    
    return newContribution;
  };

  const endorseContribution = (contributionId) => {
    // Find and update the contribution across all users
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('contributions_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const updated = data.map(c => 
            c.id === contributionId 
              ? { ...c, endorsements: c.endorsements + 1 }
              : c
          );
          
          // Check if anything changed
          if (JSON.stringify(data) !== JSON.stringify(updated)) {
            localStorage.setItem(key, JSON.stringify(updated));
            
            // If this is current user's contributions, update state
            if (key === `contributions_${activeAddress}`) {
              setContributions(updated);
            }
            break;
          }
        } catch (error) {
          console.error('Error updating endorsement:', error);
        }
      }
    }
  };

  const value = {
    account,
    address: activeAddress,
    balance,
    contributions,
    loading,
    isConnected,
    isZkLogin: isZkConnected,
    zkAccount,
    userProfile,
    showUsernameSetup,
    isNewUser: !userProfile && isConnected,
    refreshData: fetchWalletData,
    handleUsernameSetup,
    handleCancelSetup,
    addContribution,
    endorseContribution,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
};
