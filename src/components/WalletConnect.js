"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useConnect, useAccount } from "wagmi";
import { injected } from "wagmi/connectors";
import { useState, useEffect } from "react";

export default function WalletConnect() {
  const { login, authenticated, user, logout } = usePrivy();
  const { connect } = useConnect();
  const { address: wagmiAddress, isConnected } = useAccount();
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && window.ethereum?.isMiniPay) {
      setIsMiniPay(true);
    }
  }, []);

  if (!mounted) {
    return <div style={{ width: 150, height: 40, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}></div>;
  }

  if (authenticated && user) {
    // Determine the primary wallet address
    const address = user.wallet?.address || "";
    const displayAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected";

    return (
      <button className="btn btn-secondary" onClick={logout} style={{ padding: "8px 16px", fontSize: 14 }}>
        {displayAddress}
      </button>
    );
  }

  return (
    <button className="btn btn-primary" onClick={login} style={{ padding: "8px 16px", fontSize: 14 }}>
      Connect Wallet
    </button>
  );
}
