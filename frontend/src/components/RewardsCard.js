import React from "react";
import { formatNumber } from "../utils/format"; // Adjust the import path as necessary
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const RewardsCard = ({
  pendingRewards,
  onClaim,
  onCompound,
  lastClaimTime,
  isLoadingClaim,
  isLoadingCompound,
}) => {
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [timeSinceLastClaim, setTimeSinceLastClaim] = useState("");

  useEffect(() => {
    // Calculate estimated daily and monthly earnings based on pending rewards
    const estimatedDaily =
      (pendingRewards * 24) /
      (lastClaimTime ? (Date.now() - lastClaimTime) / 1000 : 1);
    const estimatedMonthly = estimatedDaily * 30;

    setDailyEarnings(estimatedDaily);
    setMonthlyEarnings(estimatedMonthly);

    // Calculate time since last claim
    if (lastClaimTime) {
      const timeDiff = Math.floor((Date.now() - lastClaimTime) / 1000);
      const hours = Math.floor(timeDiff / 3600);
      const minutes = Math.floor((timeDiff % 3600) / 60);
      setTimeSinceLastClaim(`${hours}h ${minutes}m ago`);
    }
  }, [pendingRewards, lastClaimTime]);

  return (
    <div className="p-4 glass-effect rounded-lg">
      <h2 className="text-xl font-bold mb-4">Rewards</h2>
      <div className="mb-4">
        <p className="text-lg">
          Pending Rewards: ${formatNumber(pendingRewards)}
        </p>
        <p className="text-lg">
          Estimated Daily Earnings: ${formatNumber(dailyEarnings)}
        </p>
        <p className="text-lg">
          Estimated Monthly Earnings: ${formatNumber(monthlyEarnings)}
        </p>
        <p className="text-sm text-gray-500">
          Last claimed: {timeSinceLastClaim}
        </p>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={onClaim}
          className="bg-green-500 text-white p-2 rounded"
          disabled={isLoadingClaim}
        >
          {isLoadingClaim ? "Claiming..." : "Claim"}
        </button>
        <button
          onClick={onCompound}
          className="bg-blue-500 text-white p-2 rounded"
          disabled={isLoadingCompound}
        >
          {isLoadingCompound ? "Compounding..." : "Compound"}
        </button>
      </div>
    </div>
  );
};

export default RewardsCard;
