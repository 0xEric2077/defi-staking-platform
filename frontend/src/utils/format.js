// Format wei to human readable (e.g., "1.2345 MTK")
export function formatTokenAmount(value, decimals = 18, displayDecimals = 4) {
  const amount = value / 10 ** decimals;
  return `${amount.toFixed(displayDecimals)} MTK`; // Replace "MTK" with the actual token symbol if needed
}

// Format number with commas (e.g., "1,234.56")
export function formatNumber(value, decimals = 2) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Shorten address (e.g., "0x1234...5678")
export function shortenAddress(address, chars = 4) {
  return `${address.slice(0, 6)}...${address.slice(-chars)}`;
}

// Calculate real-time rewards based on APY
export function calculateRewards(principal, startTime, apy = 15) {
  const timeElapsed = Date.now() / 1000 - startTime; // in seconds
  const rewards =
    principal * (apy / 100) * (timeElapsed / (365 * 24 * 60 * 60)); // APY is annual
  return rewards;
}

// Format time duration (e.g., "2 days 3 hours")
export function formatDuration(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);

  const parts = [];
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

  return parts.join(" ");
}

// Parse user input to wei
export function parseTokenAmount(value, decimals = 18) {
  const amount = parseFloat(value);
  if (isNaN(amount)) throw new Error("Invalid number");
  return Math.floor(amount * 10 ** decimals);
}
