import React from "react";
import { useStakeInfo } from "../hooks/useStakeInfo"; // Adjust the import path as necessary
import { useTokenContract } from "../hooks/useTokenContract"; // Adjust the import path as necessary
import { formatNumber } from "../utils/format"; // Adjust the import path as necessary
import { Skeleton } from "react-loading-skeleton"; // Ensure you have react-loading-skeleton installed
import "react-loading-skeleton/dist/skeleton.css";

const StakingStats = () => {
  const { stakedAmount, pendingRewards, totalValue, isLoading } =
    useStakeInfo();
  const { balance } = useTokenContract(); // Assuming this returns the user's token balance

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <div className="stat-card glass-effect p-4 rounded-lg flex flex-col items-center">
        <div className="icon">💰</div>
        <h3>Total Value Locked (TVL)</h3>
        <p>
          {isLoading ? (
            <Skeleton width={100} />
          ) : (
            `$${formatNumber(totalValue)}`
          )}
        </p>
      </div>
      <div className="stat-card glass-effect p-4 rounded-lg flex flex-col items-center">
        <div className="icon">📈</div>
        <h3>Current APY</h3>
        <p>{isLoading ? <Skeleton width={100} /> : "15%"}</p>
      </div>
      <div className="stat-card glass-effect p-4 rounded-lg flex flex-col items-center">
        <div className="icon">🙋‍♂️</div>
        <h3>Your Staked Amount</h3>
        <p>
          {isLoading ? (
            <Skeleton width={100} />
          ) : (
            `$${formatNumber(stakedAmount)}`
          )}
        </p>
      </div>
      <div className="stat-card glass-effect p-4 rounded-lg flex flex-col items-center">
        <div className="icon">🏆</div>
        <h3>Your Pending Rewards</h3>
        <p>
          {isLoading ? (
            <Skeleton width={100} />
          ) : (
            `$${formatNumber(pendingRewards)}`
          )}
        </p>
      </div>
    </div>
  );
};

export default StakingStats;
