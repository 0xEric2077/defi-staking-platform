"use client";

import { useReadContract, useAccount } from "wagmi";
import { STAKING_ABI, TOKEN_ABI } from "@/utils/abis";
import { formatEther } from "viem";

const STAKING_ADDRESS = process.env.NEXT_PUBLIC_STAKING_ADDRESS;
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;

export function useStakeInfo() {
  const { address } = useAccount();

  // Get stake info
  const { data: stakeInfo, refetch: refetchStakeInfo } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "getStakeInfo",
    args: [address],
    enabled: !!address,
  });

  // Get token balance
  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: "balanceOf",
    args: [address],
    enabled: !!address,
  });

  // Get allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: "allowance",
    args: [address, STAKING_ADDRESS],
    enabled: !!address,
  });

  // Get total staked
  const { data: totalStaked } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "totalStaked",
  });

  const refetch = () => {
    refetchStakeInfo();
    refetchBalance();
    refetchAllowance();
  };

  return {
    stakedAmount: stakeInfo ? formatEther(stakeInfo[0]) : "0",
    pendingRewards: stakeInfo ? formatEther(stakeInfo[1]) : "0",
    tokenBalance: tokenBalance ? formatEther(tokenBalance) : "0",
    allowance: allowance ? formatEther(allowance) : "0",
    totalStaked: totalStaked ? formatEther(totalStaked) : "0",
    refetch,
  };
}
