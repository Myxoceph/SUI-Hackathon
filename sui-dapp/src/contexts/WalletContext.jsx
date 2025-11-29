import { createContext, useContext, useState, useEffect } from "react";
import { useCurrentAccount, useSuiClient, useDisconnectWallet } from "@mysten/dapp-kit";
import { getUserProfile, isNewUser } from "@/lib/userProfile";

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
      // Fetch user objects/contributions
      const objects = await client.getOwnedObjects({
        owner: account.address,
      });
      
      // Parse contributions from on-chain objects
      setContributions([]);
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
    handleCancelSetup,
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
