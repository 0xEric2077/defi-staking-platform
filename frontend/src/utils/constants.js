export const CHAIN_ID = 11155111; // Sepolia
export const APY_RATE = 15;
export const BLOCK_TIME = 12; // seconds
export const DECIMALS = 18;
export const MIN_STAKE_AMOUNT = "0.01";
export const CONTRACT_ADDRESSES = {
  staking: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS,
  token: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS,
};
