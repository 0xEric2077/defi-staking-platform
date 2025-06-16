'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider, createClient, chain, configureChains } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AlchemyProvider } from 'wagmi/providers/alchemy';

// Create a client for wagmi
const { provider, webSocketProvider } = configureChains(
  [sepolia],
  [AlchemyProvider(process.env.NEXT_PUBLIC_ALCHEMY_API_KEY)]
);

const wagmiClient = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

// Custom theme with brand colors
const theme = {
  colors: {
    accentColor: '#FF5733', // Replace with your brand color
    accentColorForeground: '#FFFFFF', // Replace with your brand color
    // Add more custom colors as needed
  },
};

export function Providers({ children }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider client={wagmiClient}>
        <RainbowKitProvider
          chains={[sepolia]}
          theme={theme}
          modalSize="compact"
          showRecentTransactions={true}
          accountModal={{ open: true }}
        >
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
