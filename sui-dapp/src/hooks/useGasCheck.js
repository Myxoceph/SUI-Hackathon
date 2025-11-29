import { useState, useEffect } from 'react';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';

/**
 * Check if user has enough gas for transaction
 * @param {number} minBalance - Minimum SUI required (default 0.01)
 * @returns {Object} { hasGas, balance, isLoading, checkBalance }
 */
export function useGasCheck(minBalance = 0.01) {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkBalance = async () => {
    if (!account?.address) {
      setBalance(null);
      return false;
    }

    setIsLoading(true);
    try {
      const balanceData = await client.getBalance({
        owner: account.address,
      });
      
      const balanceInSui = Number(balanceData.totalBalance) / 1_000_000_000;
      setBalance(balanceInSui);
      
      return balanceInSui >= minBalance;
    } catch (error) {
      console.error('Error checking balance:', error);
      setBalance(0);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account?.address) {
      checkBalance();
    }
  }, [account?.address]);

  const hasGas = balance !== null && balance >= minBalance;

  return {
    hasGas,
    balance,
    isLoading,
    checkBalance,
    address: account?.address,
  };
}
