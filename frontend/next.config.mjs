import { withSentryConfig } from "@sentry/nextjs";
import * as dotenv from "dotenv";
import { withImages } from "next-images";

// Load environment variables from .env file
dotenv.config();

// Validate environment variables
const requiredEnvVars = [
  "NEXT_PUBLIC_ALCHEMY_API_KEY",
  "NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS",
  "NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS",
];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Next.js configuration
const nextConfig = {
  images: {
    domains: ["example.com"], // Replace with your image domains
  },
  swcMinify: true, // Enable SWC minification
};

export default withImages(nextConfig);
