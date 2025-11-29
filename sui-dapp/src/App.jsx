import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { networkConfig } from "@/config/networkConfig";
import { WalletProvider as CustomWalletProvider, useWallet } from "@/contexts/WalletContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Passport from "@/pages/Passport";
import CreateProject from "@/pages/CreateProject";
import Explore from "@/pages/Explore";
import Leaderboard from "@/pages/Leaderboard";
import Settings from "@/pages/Settings";
import AuthCallback from "@/pages/AuthCallback";
import RegisterEnokiWallets from "@/components/RegisterEnokiWallets";
import UsernameSetup from "@/components/UsernameSetup";
import { Toaster } from "@/components/ui/sonner";
import { MessagingProvider } from "@/contexts/MessagingContext";
import Messages from "@/pages/Messages";
import "@mysten/dapp-kit/dist/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    },
  },
});

const AppContent = () => {
  const { showUsernameSetup, address, handleUsernameSetup, handleCancelSetup } = useWallet();

  return (
    <>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/passport" element={<Passport />} />
              <Route path="/contribute" element={<CreateProject />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        } />
      </Routes>
      
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
    <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
      <RegisterEnokiWallets />
      <WalletProvider autoConnect>
        <CustomWalletProvider>
          <MessagingProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </MessagingProvider>
        </CustomWalletProvider>
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
);

export default App;
