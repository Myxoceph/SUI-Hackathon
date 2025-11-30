import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

// Use official Mysten Labs RPC endpoints
const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
    },
  });

// Export RPC URL for direct usage
export const TESTNET_RPC_URL = getFullnodeUrl("testnet");

export { useNetworkVariable, useNetworkVariables, networkConfig };
