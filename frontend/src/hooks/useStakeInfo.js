import { useEffect, useState } from "react";
import { useContractRead } from "wagmi";
import { calculateRewards } from "../utils/format"; // Adjust the import path as necessary
import { getContractInstance } from "../lib/contracts"; // Adjust the import path as necessary
import { useAccount } from "wagmi";

export function useStakeInfo() {
  const { address } = useAccount();
  const [pendingRewards, setPendingRewards] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch staked amount
  const { data: stakedAmount, refetch: refetchStakedAmount } = useContractRead({
    ...getContractInstance("staking", address),
    functionName: "getStakeInfo",
    args: [address], // Adjust based on your contract's function signature
  });

  // Calculate real-time rewards
  const calculateRealTimeRewards = () => {
    if (stakedAmount) {
      const rewards = calculateRewards(
        stakedAmount,
        Date.now() / 1000 - /* startTime */ 0
      ); // Replace 0 with actual start time
      setPendingRewards(rewards);
      setTotalValue(stakedAmount + rewards); // Assuming total value is staked amount + rewards
    }
  };

  useEffect(() => {
    setIsLoading(true);
    refetchStakedAmount().then(() => {
      calculateRealTimeRewards();
      setIsLoading(false);
    });

    const interval = setInterval(() => {
      calculateRealTimeRewards();
    }, 5000); // Auto-refresh every 5 seconds

    return () => clearInterval(interval);
  }, [stakedAmount, refetchStakedAmount]);

  return {
    stakedAmount,
    pendingRewards,
    totalValue,
    isLoading,
    refetch: refetchStakedAmount,
  };
}
