// src/app/layout.js

import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';
import './globals.css';

// Configure Inter font
const inter = Inter({ subsets: ['latin'] });

// Updated metadata
export const metadata = {
  title: "DeFi Staking Platform | Earn 15% APY",
  description:
    "Stake your tokens and earn 15% APY with our secure DeFi staking platform on Ethereum Sepolia testnet",
  keywords: ["DeFi", "Staking", "Ethereum", "Web3", "Yield Farming"],
  openGraph: {
    title: "DeFi Staking Platform",
    description: "Earn 15% APY on your staked tokens",
    images: ["/og-image.png"],
  },
};

// Custom toast styling
const toastStyle = {
  style: {
    background: '#333', // Background color for toast
    color: '#fff', // Text color for toast
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Toaster toastOptions={toastStyle} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

