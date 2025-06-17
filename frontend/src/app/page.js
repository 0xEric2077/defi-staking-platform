"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import {
  FaChartLine,
  FaCoins,
  FaDollarSign,
  FaPercentage,
} from "react-icons/fa";
import StakingCard from "@/components/StakingCard";
import RewardsCard from "@/components/RewardsCard";
import StatsCard from "@/components/StatsCard";
import { useStakeInfo } from "@/hooks/useStakeInfo";

export default function Home() {
  const [activeTab, setActiveTab] = useState("stake");
  const { isConnected } = useAccount();
  const {
    stakedAmount,
    pendingRewards,
    tokenBalance,
    allowance,
    totalStaked,
    refetch,
  } = useStakeInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                DeFi Staking Platform
              </h1>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to DeFi Staking Platform
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Connect your wallet to start staking and earning rewards
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Value Locked"
                value={parseFloat(totalStaked).toFixed(2)}
                suffix="MTK"
                icon={FaDollarSign}
                color="bg-blue-500"
              />
              <StatsCard
                title="APY"
                value="15"
                suffix="%"
                icon={FaPercentage}
                color="bg-green-500"
              />
              <StatsCard
                title="Your Staked"
                value={parseFloat(stakedAmount).toFixed(2)}
                suffix="MTK"
                icon={FaCoins}
                color="bg-purple-500"
              />
              <StatsCard
                title="Your Rewards"
                value={parseFloat(pendingRewards).toFixed(4)}
                suffix="MTK"
                icon={FaChartLine}
                color="bg-yellow-500"
              />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Staking Card */}
              <div>
                <div className="flex space-x-1 mb-4">
                  <button
                    onClick={() => setActiveTab("stake")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === "stake"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Stake
                  </button>
                  <button
                    onClick={() => setActiveTab("unstake")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === "unstake"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Unstake
                  </button>
                </div>
                <StakingCard
                  type={activeTab}
                  balance={tokenBalance}
                  stakedAmount={stakedAmount}
                  allowance={allowance}
                  onSuccess={refetch}
                />
              </div>

              {/* Rewards Card */}
              <RewardsCard
                rewards={pendingRewards}
                stakedAmount={stakedAmount}
                onSuccess={refetch}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
