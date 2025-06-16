import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useNetwork } from "wagmi";

const Header = () => {
  const { chain } = useNetwork();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md glass-effect p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        {/* Logo/Title */}
        <span>Your Logo/Title</span>
      </div>
      <div className="flex items-center">
        {/* Network Status Indicator */}
        <span className="mr-4">
          {chain ? `Connected to ${chain.name}` : "Not connected"}
        </span>
        {/* Connect Wallet Button */}
        <ConnectButton />
      </div>
    </header>
  );
};

export default Header;
