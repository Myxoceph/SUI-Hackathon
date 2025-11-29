import { createContext, useContext, useState, useEffect } from "react";
import { useCurrentAccount, useSuiClient, useDisconnectWallet } from "@mysten/dapp-kit";
import { getUserProfile } from "@/lib/userProfile";

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: disconnect } = useDisconnectWallet();
  const [balance, setBalance] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);

  useEffect(() => {
    if (account?.address) {
      checkUserProfile();
      fetchWalletData();
    } else {
      setBalance(null);
      setContributions([]);
      setUserProfile(null);
      setShowUsernameSetup(false);
    }
  }, [account?.address]);

  const checkUserProfile = () => {
    const profile = getUserProfile(account.address);
    
    if (!profile) {
      // Yeni kullanıcı - username setup göster
      setShowUsernameSetup(true);
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
    if (!account?.address) return;
    
    setLoading(true);
    try {
      // Fetch balance
      const balanceData = await client.getBalance({
        owner: account.address,
      });
      setBalance(balanceData.totalBalance);

      // TODO: Fetch contributions from Move smart contract
      // For now, load from localStorage for testing
      const stored = localStorage.getItem(`contributions_${account.address}`);
      if (stored) {
        setContributions(JSON.parse(stored));
      } else {
        setContributions([]);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addContribution = (contributionData) => {
    const newContribution = {
      id: `mock_${Date.now()}`,
      owner: account.address,
      ...contributionData,
      endorsements: 0,
      createdAt: Date.now(),
      txDigest: `mock_tx_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updated = [...contributions, newContribution];
    setContributions(updated);
    localStorage.setItem(`contributions_${account.address}`, JSON.stringify(updated));
    
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
            if (key === `contributions_${account.address}`) {
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
    address: account?.address,
    balance,
    contributions,
    loading,
    isConnected: !!account,
    userProfile,
    showUsernameSetup,
    isNewUser: !userProfile && !!account,
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
