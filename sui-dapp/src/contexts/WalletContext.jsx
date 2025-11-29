import { createContext, useContext, useState, useEffect } from "react";
import { useCurrentAccount, useSuiClient, useDisconnectWallet } from "@mysten/dapp-kit";
import { getUserProfile } from "@/lib/userProfile";

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: disconnect } = useDisconnectWallet();
  const [balance, setBalance] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  
  const activeAddress = account?.address;

  useEffect(() => {
    if (activeAddress) {
      checkUserProfile();
      fetchWalletData();
    } else {
      setBalance(null);
      setProjects([]);
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
    // Username setup iptal edilince bağlantıyı kes
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

      // Fetch projects from blockchain or localStorage
      const { getUserProjects } = await import("@/lib/suiTransactions");
      const { CONTRACTS } = await import("@/config/contracts");
      
      if (CONTRACTS.PACKAGE_ID === "TO_BE_DEPLOYED") {
        // Mock mode: load from localStorage
        const stored = localStorage.getItem(`projects_${activeAddress}`);
        if (stored) {
          setProjects(JSON.parse(stored));
        } else {
          setProjects([]);
        }
      } else {
        // On-chain mode: fetch user's Project NFTs with timeout
        const onChainProjects = await Promise.race([
          getUserProjects(client, activeAddress),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Projects fetch timeout')), 15000)
          )
        ]);
        setProjects(onChainProjects);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      // Sessizce devam et - kullanıcıyı rahatsız etme
    } finally {
      setLoading(false);
    }
  };

  const addProject = (projectData) => {
    const newProject = {
      id: `mock_${Date.now()}`,
      owner: activeAddress,
      ...projectData,
      endorsements: 0,
      createdAt: Date.now(),
      txDigest: `mock_tx_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updated = [...projects, newProject];
    setProjects(updated);
    localStorage.setItem(`projects_${activeAddress}`, JSON.stringify(updated));
    
    return newProject;
  };

  /**
   * @deprecated Use addProject instead
   */
  const addContribution = addProject;

  const endorseProject = (projectId) => {
    // Find and update the project across all users
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('projects_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const updated = data.map(p => 
            p.id === projectId 
              ? { ...p, endorsements: p.endorsements + 1 }
              : p
          );
          
          // Check if anything changed
          if (JSON.stringify(data) !== JSON.stringify(updated)) {
            localStorage.setItem(key, JSON.stringify(updated));
            
            // If this is current user's projects, update state
            if (key === `projects_${activeAddress}`) {
              setProjects(updated);
            }
            break;
          }
        } catch (error) {
          console.error('Error updating endorsement:', error);
        }
      }
    }
  };

  /**
   * @deprecated Use endorseProject instead
   */
  const endorseContribution = endorseProject;

  const value = {
    account,
    address: activeAddress,
    balance,
    projects,
    contributions: projects, // Backward compat
    loading,
    isConnected: !!activeAddress,
    userProfile,
    showUsernameSetup,
    isNewUser: !userProfile && !!activeAddress,
    refreshData: fetchWalletData,
    handleUsernameSetup,
    handleCancelSetup,
    addProject,
    endorseProject,
    addContribution, // Backward compat
    endorseContribution, // Backward compat
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
