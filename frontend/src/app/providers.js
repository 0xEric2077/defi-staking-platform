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
  const [isConnected, setIsConnected] = useState(false);

  // 处理断开连接
  const handleDisconnect = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // 获取当前连接的账户
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts && accounts.length > 0) {
          // 直接调用 eth_disconnect 方法
          await window.ethereum.request({
            method: "wallet_revokePermissions",
            params: [
              {
                eth_accounts: {},
              },
            ],
          });

          // 清除所有授权
          await window.ethereum
            .request({
              method: "eth_requestAccounts",
              params: [],
            })
            .catch(() => {});
        }

        // 清除连接状态
        setIsConnected(false);

        // 刷新页面以确保状态完全重置
        window.location.reload();
      } catch (error) {
        console.error("Failed to disconnect:", error);
        // 即使出错也尝试刷新页面
        window.location.reload();
      }
    }
  };

  useEffect(() => {
    setMounted(true);

    // 检查钱包是否已连接
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // 请求账户访问
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          setIsConnected(accounts && accounts.length > 0);

          if (accounts && accounts.length > 0) {
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
          }
        } catch (error) {
          console.error("Failed to check wallet connection:", error);
          setIsConnected(false);
        }
      }
    };

    checkConnection();

    // 监听钱包连接状态变化
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        setIsConnected(accounts && accounts.length > 0);
        if (!accounts || accounts.length === 0) {
          handleDisconnect();
        } else {
          checkConnection();
        }
      };

      const handleChainChanged = () => {
        checkConnection();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("disconnect", handleDisconnect);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("disconnect", handleDisconnect);
      };
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider onDisconnect={handleDisconnect}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
