"use client";

import { useState } from "react";
import { FaCoins } from "react-icons/fa";
import { useStakingContract } from "@/hooks/useStakingContract";
import { useTokenContract } from "@/hooks/useTokenContract";

export default function StakingCard({
  type,
  balance,
  stakedAmount,
  allowance,
  onSuccess,
}) {
  const [amount, setAmount] = useState("");
  const { stake, unstake, isPending: isStakingPending } = useStakingContract();
  const { approve, isPending: isApprovePending } = useTokenContract();

  const isStake = type === "stake";
  const maxAmount = isStake ? balance : stakedAmount;
  const needsApproval =
    isStake && parseFloat(allowance) < parseFloat(amount || "0");
  const loading = isStakingPending || isApprovePending;

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      if (needsApproval) {
        await approve(amount);
        // Wait a bit for the state to update
        setTimeout(() => onSuccess(), 2000);
      } else if (isStake) {
        await stake(amount);
        setTimeout(() => {
          setAmount("");
          onSuccess();
        }, 2000);
      } else {
        await unstake(amount);
        setTimeout(() => {
          setAmount("");
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <FaCoins className="text-2xl text-yellow-500 mr-2" />
        <h2 className="text-xl font-bold">
          {isStake ? "Stake Tokens" : "Unstake Tokens"}
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={() => setAmount(maxAmount)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600 hover:text-blue-800"
            >
              MAX
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Available: {parseFloat(maxAmount).toFixed(4)} MTK
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            loading || !amount || parseFloat(amount) <= 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : needsApproval
              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
              Processing...
            </span>
          ) : needsApproval ? (
            "Approve"
          ) : isStake ? (
            "Stake"
          ) : (
            "Unstake"
          )}
        </button>
      </div>
    </div>
  );
}
