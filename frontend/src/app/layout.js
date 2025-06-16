// src/app/layout.js

import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';
import './globals.css';

// Configure Inter font
const inter = Inter({ subsets: ['latin'] });

// Metadata with title and description
export const metadata = {
  title: 'Your App Title', // Replace with your app title
  description: 'Your app description goes here.', // Replace with your app description
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

