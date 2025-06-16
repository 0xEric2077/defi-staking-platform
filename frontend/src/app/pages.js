import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useStakeInfo } from "../hooks/useStakeInfo"; // Adjust the import path as necessary
import { useTokenContract } from "../hooks/useTokenContract"; // Adjust the import path as necessary

// Dynamically import components to avoid SSR issues
const StakingStats = dynamic(() => import("../components/StakingStats"));
const StakingCard = dynamic(() => import("../components/StakingCard"));
const RewardsCard = dynamic(() => import("../components/RewardsCard"));
const SecurityInfo = dynamic(() => import("../components/SecurityInfo"));
const FAQSection = dynamic(() => import("../components/FAQSection"));

export default function Home() {
  const { address, isConnected } = useAccount();
  const {
    stakedAmount,
    pendingRewards,
    totalValue,
    isLoading: isLoadingStakeInfo,
    refetch: refetchStakeInfo,
  } = useStakeInfo();
  const { balance } = useTokenContract(); // Assuming this returns the user's token balance
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        refetchStakeInfo();
      }
    }, 5000); // Auto-refresh every 5 seconds

    return () => clearInterval(interval);
  }, [isConnected, refetchStakeInfo]);

  if (!isConnected) {
    return (
      <main className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl">Please connect your wallet</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold">DeFi Staking Platform</h1>
          <p className="text-lg">Earn 15% APY on your tokens</p>
        </section>

        {/* Stats Grid */}
        {isLoadingStakeInfo ? <p>Loading stats...</p> : <StakingStats />}

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Staking Card */}
          <StakingCard
            onStake={(amount) => {
              /* Implement staking logic */
            }}
            onUnstake={(amount) => {
              /* Implement unstaking logic */
            }}
            balance={balance}
            stakedAmount={stakedAmount}
            isLoading={isLoadingStakeInfo}
          />

          {/* Rewards Card */}
          <RewardsCard
            pendingRewards={pendingRewards}
            onClaim={() => {
              /* Implement claim logic */
            }}
            onCompound={() => {
              /* Implement compound logic */
            }}
            lastClaimTime={Date.now()} // Replace with actual last claim time
            isLoadingClaim={false} // Replace with actual loading state
            isLoadingCompound={false} // Replace with actual loading state
          />
        </div>

        {/* Additional Info */}
        <section className="mt-12">
          <SecurityInfo />
          <FAQSection />
        </section>
      </div>
    </main>
  );
}
