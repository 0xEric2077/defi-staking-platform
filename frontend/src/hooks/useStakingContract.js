"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { STAKING_ABI } from "@/utils/abis";
import toast from "react-hot-toast";
import { useEffect } from "react";

const STAKING_ADDRESS = process.env.NEXT_PUBLIC_STAKING_ADDRESS;

export function useStakingContract() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Transaction is being confirmed...", { id: "tx" });
    }
    if (isSuccess) {
      toast.success("Transaction confirmed!", { id: "tx" });
    }
    if (error) {
      toast.error(error.message || "Transaction failed", { id: "tx" });
    }
  }, [isConfirming, isSuccess, error]);

  const stake = async (amount) => {
    try {
      await writeContract({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "stake",
        args: [parseEther(amount)],
      });
    } catch (err) {
      console.error("Stake error:", err);
    }
  };

  const unstake = async (amount) => {
    try {
      await writeContract({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "unstake",
        args: [parseEther(amount)],
      });
    } catch (err) {
      console.error("Unstake error:", err);
    }
  };

  const claimRewards = async () => {
    try {
      await writeContract({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "claimRewards",
      });
    } catch (err) {
      console.error("Claim error:", err);
    }
  };

  const compound = async () => {
    try {
      await writeContract({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "compound",
      });
    } catch (err) {
      console.error("Compound error:", err);
    }
  };

  return {
    stake,
    unstake,
    claimRewards,
    compound,
    isPending: isPending || isConfirming,
  };
}
