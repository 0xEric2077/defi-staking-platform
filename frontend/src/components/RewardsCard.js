"use client";

import { useState, useEffect } from "react";
import { FaGift, FaLayerGroup } from "react-icons/fa";
import { useStakingContract } from "@/hooks/useStakingContract";

export default function RewardsCard({ rewards, stakedAmount, onSuccess }) {
  const [displayRewards, setDisplayRewards] = useState(parseFloat(rewards));
  const { claimRewards, compound, isPending } = useStakingContract();
  const [action, setAction] = useState("");

  // Animate rewards counter
  useEffect(() => {
    const rewardRate = 0.15 / 365 / 24 / 60 / 60; // 15% APY per second
    const interval = setInterval(() => {
      setDisplayRewards((prev) => {
        const increment = parseFloat(stakedAmount) * rewardRate;
        return prev + increment;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stakedAmount]);

  // Sync with actual rewards
  useEffect(() => {
    setDisplayRewards(parseFloat(rewards));
  }, [rewards]);

  const handleClaim = async () => {
    setAction("claim");
    try {
      await claimRewards();
      setTimeout(() => {
        onSuccess();
        setAction("");
      }, 2000);
    } catch (error) {
      console.error(error);
      setAction("");
    }
  };

  const handleCompound = async () => {
    setAction("compound");
    try {
      await compound();
      setTimeout(() => {
        onSuccess();
        setAction("");
      }, 2000);
    } catch (error) {
      console.error(error);
      setAction("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <FaGift className="text-2xl text-green-500 mr-2" />
        <h2 className="text-xl font-bold">Rewards</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Pending Rewards</p>
          <p className="text-2xl font-bold text-green-600">
            {displayRewards.toFixed(6)} MTK
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ≈ ${(displayRewards * 1).toFixed(2)} USD
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleClaim}
            disabled={isPending || displayRewards <= 0}
            className={`py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
              isPending || displayRewards <= 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isPending && action === "claim" ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <>
                <FaGift className="mr-2" />
                Claim
              </>
            )}
          </button>

          <button
            onClick={handleCompound}
            disabled={isPending || displayRewards <= 0}
            className={`py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
              isPending || displayRewards <= 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-purple-500 hover:bg-purple-600 text-white"
            }`}
          >
            {isPending && action === "compound" ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <>
                <FaLayerGroup className="mr-2" />
                Compound
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
