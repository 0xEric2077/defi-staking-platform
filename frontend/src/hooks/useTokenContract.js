"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { TOKEN_ABI } from "@/utils/abis";
import toast from "react-hot-toast";
import { useEffect } from "react";

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
const STAKING_ADDRESS = process.env.NEXT_PUBLIC_STAKING_ADDRESS;

export function useTokenContract() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Approval in progress...", { id: "approve" });
    }
    if (isSuccess) {
      toast.success("Approved successfully!", { id: "approve" });
    }
    if (error) {
      toast.error(error.message || "Approval failed", { id: "approve" });
    }
  }, [isConfirming, isSuccess, error]);

  const approve = async (amount) => {
    try {
      await writeContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "approve",
        args: [STAKING_ADDRESS, parseEther(amount)],
      });
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  return {
    approve,
    isPending: isPending || isConfirming,
  };
}
