export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance) => {
  if (!balance) return "0";
  // Convert from MIST to SUI (1 SUI = 10^9 MIST)
  return (Number(balance) / 1_000_000_000).toFixed(4);
};

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
