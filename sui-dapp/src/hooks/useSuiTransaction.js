import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { toast } from "sonner";

export const useSuiTransaction = () => {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();

  const PACKAGE_ID = "0x27dda6835781110023b80f31ad82a4b39638edf32bc82882ec4b92a830c2b4d7";

  const submitContribution = async (contributionData) => {
    try {
      const tx = new Transaction();
      
      // Call your Move smart contract
      tx.moveCall({
        target: `${PACKAGE_ID}::contributions::submit_contribution`,
        arguments: [
          tx.pure.string(contributionData.title),
          tx.pure.string(contributionData.description),
          tx.pure.string(contributionData.proof),
          tx.pure.u8(contributionData.type),
        ],
      });

      return new Promise((resolve, reject) => {
        signAndExecute(
          {
            transaction: tx,
          },
          {
            onSuccess: (result) => {
              toast.success("Transaction successful!", {
                description: `Digest: ${result.digest}`,
              });
              resolve(result);
            },
            onError: (error) => {
              toast.error("Transaction failed", {
                description: error.message,
              });
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      toast.error("Failed to create transaction", {
        description: error.message,
      });
      throw error;
    }
  };

  const endorseContribution = async (contributionId) => {
    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::contributions::endorse`,
        arguments: [
          tx.object(contributionId),
        ],
      });

      return new Promise((resolve, reject) => {
        signAndExecute(
          {
            transaction: tx,
          },
          {
            onSuccess: (result) => {
              toast.success("Endorsement recorded!");
              resolve(result);
            },
            onError: (error) => {
              toast.error("Endorsement failed");
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      throw error;
    }
  };

  const getUserBadges = async (userAddress) => {
    try {
      // Query all SoulboundBadge objects owned by the user
      const badges = await client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${PACKAGE_ID}::soulbound_badge::SoulboundBadge`
        },
        options: {
          showContent: true,
          showDisplay: true,
        },
      });
      
      return badges.data;
    } catch (error) {
      console.error("Failed to fetch badges:", error);
      return [];
    }
  };

  return {
    submitContribution,
    endorseContribution,
    getUserBadges,
  };
};
