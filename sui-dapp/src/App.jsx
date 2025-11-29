import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { networkConfig } from "@/config/networkConfig";
import { WalletProvider as CustomWalletProvider, useWallet } from "@/contexts/WalletContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Passport from "@/pages/Passport";
import AddContribution from "@/pages/AddContribution";
import Explore from "@/pages/Explore";
import Settings from "@/pages/Settings";
import UsernameSetup from "@/components/UsernameSetup";
import { Toaster } from "@/components/ui/sonner";
import "@mysten/dapp-kit/dist/index.css";

const queryClient = new QueryClient();

const AppContent = () => {
  const { showUsernameSetup, address, handleUsernameSetup, handleCancelSetup } = useWallet();

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/passport" element={<Passport />} />
          <Route path="/contribute" element={<AddContribution />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      
      {showUsernameSetup && (
        <UsernameSetup 
          address={address} 
          onComplete={handleUsernameSetup}
          onCancel={handleCancelSetup}
        />
      )}
      
      <Toaster />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SuiClientProvider networks={networkConfig} defaultNetwork="devnet">
      <WalletProvider>
        <CustomWalletProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </CustomWalletProvider>
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
);

export default App;
