"use client";

import React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import dynamic from "next/dynamic";

// Dynamically import components to avoid SSR issues
const StakingHistoryChart = dynamic(() =>
  import("../../components/StakingHistoryChart")
);
const ROICalculator = dynamic(() => import("../../components/ROICalculator"));
const TransactionHistoryTable = dynamic(() =>
  import("../../components/TransactionHistoryTable")
);
const RewardClaimingHistory = dynamic(() =>
  import("../../components/RewardClaimingHistory")
);
const PerformanceMetrics = dynamic(() =>
  import("../../components/PerformanceMetrics")
);
const ExportDataButton = dynamic(() =>
  import("../../components/ExportDataButton")
);

const Dashboard = () => {
  return (
    <main className="min-h-screen gradient-bg p-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Dashboard</h1>

        {/* Staking History Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4">Staking History</h2>
          <StakingHistoryChart />
        </motion.section>

        {/* ROI Calculator */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4">ROI Calculator</h2>
          <ROICalculator />
        </motion.section>

        {/* Transaction History Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
          <TransactionHistoryTable />
        </motion.section>

        {/* Reward Claiming History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4">
            Reward Claiming History
          </h2>
          <RewardClaimingHistory />
        </motion.section>

        {/* Performance Metrics */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4">Performance Metrics</h2>
          <PerformanceMetrics />
        </motion.section>

        {/* Export Data Functionality */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <ExportDataButton />
        </motion.section>
      </div>
    </main>
  );
};

export default Dashboard;
