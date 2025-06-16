import { useContractRead, useContractWrite } from "wagmi";
import { getContractInstance } from "../lib/contracts"; // Adjust the import path as necessary
import { parseEther } from "viem";
import { useAccount } from "wagmi";

export function useTokenContract() {
  const { address } = useAccount();

  // Get token balance
  const { data: balance, refetch: refetchBalance } = useContractRead({
    ...getContractInstance("token", address),
    functionName: "balanceOf",
    args: [address],
  });

  // Check allowance
  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    ...getContractInstance("token", address),
    functionName: "allowance",
    args: [address, process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS], // Replace with the staking contract address
  });

  // Approve spending
  const { write: approve, isLoading: isApproving } = useContractWrite({
    ...getContractInstance("token", address),
    functionName: "approve",
    onError: (error) => {
      console.error(`Approval failed: ${error.message}`);
    },
  });

  // Check if the amount is approved
  const isApproved = (amount) => {
    return allowance && allowance.gte(parseEther(amount.toString()));
  };

  return {
    balance,
    allowance,
    approve: (amount) =>
      approve({
        args: [
          process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS,
          parseEther(amount.toString()),
        ],
      }),
    isApproved,
    refetchBalance,
    refetchAllowance,
  };
}
