"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

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
            retry: 0,
          },
        },
      })
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 检查钱包是否已连接
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // 请求账户访问
          await window.ethereum.request({ method: "eth_accounts" });

          // 检查当前网络
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          if (chainId !== "0x7a69") {
            // 31337 in hex
            // 尝试切换到 localhost 网络
            try {
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x7a69" }],
              });
            } catch (switchError) {
              // 如果网络不存在，则添加网络
              if (switchError.code === 4902) {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0x7a69",
                      chainName: "Localhost",
                      nativeCurrency: {
                        name: "Ethereum",
                        symbol: "ETH",
                        decimals: 18,
                      },
                      rpcUrls: ["http://127.0.0.1:8545"],
                    },
                  ],
                });
              }
            }
          }
        } catch (error) {
          console.error("Failed to check wallet connection:", error);
        }
      }
    };

    checkConnection();

    // 监听钱包连接状态变化
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", checkConnection);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", checkConnection);
        window.ethereum.removeListener("chainChanged", () =>
          window.location.reload()
        );
      }
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
