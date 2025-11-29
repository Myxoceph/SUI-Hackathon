import { createContext, useContext, useState, useEffect } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { getUserProfile, isNewUser } from "@/lib/userProfile";

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const account = useCurrentAccount();
  const client = useSuiClient();
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

  const fetchWalletData = async () => {
    if (!account?.address) return;
    
    setLoading(true);
    try {
      // Fetch balance
      const balanceData = await client.getBalance({
        owner: account.address,
      });
      setBalance(balanceData.totalBalance);

      // Fetch user objects/contributions (mock for now)
      // TODO: Replace with actual smart contract calls
      const objects = await client.getOwnedObjects({
        owner: account.address,
      });
      
      // Mock contributions based on owned objects
      setContributions([
        {
          type: "ON-CHAIN",
          title: "Connected Wallet",
          description: `Wallet address: ${account.address.slice(0, 8)}...${account.address.slice(-6)}`,
          date: new Date().toISOString().split('T')[0],
          endorsements: 0,
        }
      ]);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
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
