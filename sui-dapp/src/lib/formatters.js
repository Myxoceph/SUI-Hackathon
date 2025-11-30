export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance) => {
  if (!balance) return "0";
  // Convert from MIST to SUI (1 SUI = 10^9 MIST)
  return (Number(balance) / 1_000_000_000).toFixed(4);
};

export const formatSui = (mist) => {
  if (!mist) return "0";
  // Convert from MIST to SUI (1 SUI = 10^9 MIST)
  const sui = Number(mist) / 1_000_000_000;
  // Format with appropriate decimal places
  if (sui >= 1000) {
    return sui.toLocaleString('en-US', { maximumFractionDigits: 0 });
  } else if (sui >= 1) {
    return sui.toLocaleString('en-US', { maximumFractionDigits: 2 });
  } else {
    return sui.toLocaleString('en-US', { maximumFractionDigits: 4 });
  }
};

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
