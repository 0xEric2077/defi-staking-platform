"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

// 错误类型定义
const ERROR_TYPES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  WALLET_ERROR: "WALLET_ERROR",
  CONNECTION_ERROR: "CONNECTION_ERROR",
  PERMISSION_ERROR: "PERMISSION_ERROR",
};

// 错误处理和日志记录
const logError = (error, type, context = {}) => {
  console.error(`[${type}] Error:`, {
    message: error.message,
    code: error.code,
    context,
    timestamp: new Date().toISOString(),
    stack: error.stack,
  });

  // 这里可以添加错误上报逻辑
  // reportErrorToAnalytics(error, type, context);
};

// 自定义 localhost chain 配置
const localhostChain = {
  id: 31337,
  name: "Localhost",
  network: "localhost",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["ws://127.0.0.1:8545"],
    },
    public: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["ws://127.0.0.1:8545"],
    },
  },
  blockExplorers: {
    default: { name: "Local", url: "http://localhost:8545" },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 0,
    },
  },
};

const config = getDefaultConfig({
  appName: "DeFi Staking Platform",
  projectId: "a3d5e9c4f8b2a1d6e9c4f8b2a1d6e9c4",
  chains: [localhostChain],
  ssr: false,
});

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error) => {
              if (error.code === 4001) return false; // User rejected
              if (failureCount > 3) return false; // Max 3 retries
              return true;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{mounted && children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
