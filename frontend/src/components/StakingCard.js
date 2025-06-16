// src/components/StakingCard.js

import React, { useState } from "react";
import { useTokenContract } from "../hooks/useTokenContract"; // Adjust the import path as necessary
import { useTransaction } from "../hooks/useTransaction"; // Adjust the import path as necessary
import toast from "react-hot-toast";

const StakingCard = ({
  onStake,
  onUnstake,
  balance,
  stakedAmount,
  isLoading,
}) => {
  const [amount, setAmount] = useState("");
  const [isStaking, setIsStaking] = useState(true);
  const { approve } = useTokenContract(); // Assuming this returns the approve function
  const {
    execute,
    isLoading: isTransactionLoading,
    error,
  } = useTransaction(isStaking ? onStake : onUnstake);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleMaxClick = () => {
    setAmount(balance); // Set amount to the user's balance
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    try {
      if (isStaking) {
        // Approve and then stake
        await approve(amount);
        await execute([amount]);
      } else {
        await execute([amount]);
      }
    } catch (err) {
      toast.error(`Transaction failed: ${err.message}`);
    }
  };

  return (
    <div className="p-4 glass-effect rounded-lg">
      <h2 className="text-xl font-bold mb-4">Staking</h2>
      <div className="flex justify-between mb-4">
        <button
          className={`tab ${isStaking ? "active" : ""}`}
          onClick={() => setIsStaking(true)}
        >
          Stake
        </button>
        <button
          className={`tab ${!isStaking ? "active" : ""}`}
          onClick={() => setIsStaking(false)}
        >
          Unstake
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount"
            className="border p-2 rounded w-full"
            disabled={isLoading || isTransactionLoading}
          />
          <button type="button" onClick={handleMaxClick} className="ml-2">
            MAX
          </button>
        </div>
        <div className="mb-4">
          <p>Balance: {balance}</p>
          <p>Staked Amount: {stakedAmount}</p>
          <p>
            Estimated Rewards: {/* Calculate and display estimated rewards */}
          </p>
          <p>
            Transaction Fee Estimate: {/* Display transaction fee estimate */}
          </p>
        </div>
        {error && <p className="text-red-500">{error.message}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded"
          disabled={isLoading || isTransactionLoading}
        >
          {isStaking ? "Approve & Stake" : "Unstake"}
        </button>
      </form>
    </div>
  );
};

export default StakingCard;
