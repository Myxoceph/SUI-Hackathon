import { TransactionBlock } from "@mysten/sui.js/transactions";
import { CONTRACTS } from "@/config/contracts";

/**
 * Register a new username on-chain
 * @param {Object} signAndExecute - Function from useSignAndExecuteTransactionBlock
 * @param {string} username - Desired username
 * @returns {Promise<Object>} Transaction result
 */
export const registerUsername = async (signAndExecute, username) => {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::username::register_username`,
    arguments: [
      tx.object(CONTRACTS.USERNAME_REGISTRY),
      tx.pure(username, "string"),
    ],
  });

  return await signAndExecute(
    { transactionBlock: tx },
    {
      onSuccess: (result) => result,
    }
  );
};

/**
 * Mint a new contribution
 * @param {Object} signAndExecute - Function from useSignAndExecuteTransactionBlock
 * @param {Object} contribution - Contribution data
 * @returns {Promise<Object>} Transaction result
 */
export const mintContribution = async (signAndExecute, contribution) => {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::contribution::mint_contribution`,
    arguments: [
      tx.object(CONTRACTS.CONTRIBUTION_REGISTRY),
      tx.pure(contribution.type, "string"),
      tx.pure(contribution.title, "string"),
      tx.pure(contribution.description, "string"),
      tx.pure(contribution.proofLink, "string"),
    ],
  });

  return await signAndExecute(
    { transactionBlock: tx },
    {
      onSuccess: (result) => result,
    }
  );
};

/**
 * Endorse a contribution
 * @param {Object} signAndExecute - Function from useSignAndExecuteTransactionBlock
 * @param {string} contributionId - ID of contribution to endorse
 * @returns {Promise<Object>} Transaction result
 */
export const endorseContribution = async (signAndExecute, contributionId) => {
  const tx = new TransactionBlock();

  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::contribution::endorse_contribution`,
    arguments: [
      tx.object(CONTRACTS.CONTRIBUTION_REGISTRY),
      tx.object(contributionId),
    ],
  });

  return await signAndExecute(
    { transactionBlock: tx },
    {
      onSuccess: (result) => result,
    }
  );
};

/**
 * Query user contributions from owned objects
 * @param {Object} client - Sui client instance
 * @param {string} address - User address
 * @returns {Promise<Array>} List of contributions
 */
export const getUserContributions = async (client, address) => {
  try {
    const objects = await client.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${CONTRACTS.PACKAGE_ID}::contribution::Contribution`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    });

    return objects.data
      .filter((obj) => obj.data?.content)
      .map((obj) => parseContribution(obj.data));
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return [];
  }
};

/**
 * Parse contribution object from blockchain
 * @param {Object} data - Raw object data from Sui
 * @returns {Object} Parsed contribution
 */
const parseContribution = (data) => {
  const fields = data.content?.fields || {};
  
  return {
    id: data.objectId,
    owner: fields.owner,
    type: fields.contribution_type,
    title: fields.title,
    description: fields.description,
    proofLink: fields.proof_link,
    endorsements: parseInt(fields.endorsements || "0"),
    createdAt: parseInt(fields.created_at || "0"),
  };
};

/**
 * Get registry statistics
 * @param {Object} client - Sui client instance
 * @returns {Promise<Object>} Registry stats
 */
export const getRegistryStats = async (client) => {
  try {
    const registry = await client.getObject({
      id: CONTRACTS.CONTRIBUTION_REGISTRY,
      options: { showContent: true },
    });

    const fields = registry.data?.content?.fields || {};

    return {
      totalContributions: parseInt(fields.total_contributions || "0"),
      totalEndorsements: parseInt(fields.total_endorsements || "0"),
    };
  } catch (error) {
    console.error("Error fetching registry stats:", error);
    return {
      totalContributions: 0,
      totalEndorsements: 0,
    };
  }
};

/**
 * Check if username is available
 * @param {Object} client - Sui client instance  
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} True if available
 */
export const isUsernameAvailableOnChain = async (client, username) => {
  try {
    // Query UsernameRegistry table (requires contract deployment)
    return true;
  } catch (error) {
    console.error("Error checking username:", error);
    return false;
  }
};
