import { ethers } from "ethers";

// Staking contract ABI
const STAKING_CONTRACT_ABI = [
  "function stake(uint256 amount) external",
  "function unstake(uint256 amount) external",
  "function claimRewards() external",
  "function compound() external",
  "function getStakeInfo(address account) external view returns (uint256, uint256)",
];

// ERC20 token ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

// Contract addresses from environment variables
const CONTRACT_ADDRESSES = {
  staking: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS,
  token: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS,
};

// Helper function to get contract instances with signer
export const getContractInstance = (contractName, signer) => {
  const address = CONTRACT_ADDRESSES[contractName];
  let abi;

  if (contractName === "staking") {
    abi = STAKING_CONTRACT_ABI;
  } else if (contractName === "token") {
    abi = ERC20_ABI;
  } else {
    throw new Error("Invalid contract name");
  }

  return new ethers.Contract(address, abi, signer);
};
