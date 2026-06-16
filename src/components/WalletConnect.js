"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useState, useEffect } from "react";

export default function WalletConnect() {
  const { login, authenticated, user, logout } = usePrivy();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address: wagmiAddress, isConnected } = useAccount();
  const [hasInjected, setHasInjected] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && window.ethereum) {
      setHasInjected(true);
    }
  }, []);

  // Auto-connect inside MiniPay or other auto-connect dApp browsers
  useEffect(() => {
    if (hasInjected && typeof window !== "undefined" && window.ethereum?.isMiniPay && !isConnected && mounted) {
      connect({ connector: injected() });
    }
  }, [hasInjected, isConnected, mounted, connect]);

  if (!mounted) {
    return <div style={{ width: 150, height: 40, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}></div>;
  }

  // Connected via Wagmi (Injected / WalletConnect)
  if (isConnected && wagmiAddress) {
    const displayAddress = `${wagmiAddress.slice(0, 6)}...${wagmiAddress.slice(-4)}`;
    return (
      <button 
        className="btn btn-secondary" 
        onClick={() => disconnect()}
        style={{ padding: "8px 16px", fontSize: 14 }}
      >
        {displayAddress} (Disconnect)
      </button>
    );
  }

  // Connected via Privy (Embedded/Social)
  if (authenticated && user) {
    const address = user.wallet?.address || "";
    const displayAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected";

    return (
      <button 
        className="btn btn-secondary" 
        onClick={logout} 
        style={{ padding: "8px 16px", fontSize: 14 }}
      >
        {displayAddress} (Logout)
      </button>
    );
  }

  // Inside a dApp browser or extension present -> connect injected wallet directly
  if (hasInjected) {
    const label = (typeof window !== "undefined" && window.ethereum?.isMiniPay) ? "Connect MiniPay" : "Connect Wallet";
    return (
      <button 
        className="btn btn-primary" 
        onClick={() => connect({ connector: injected() })} 
        style={{ padding: "8px 16px", fontSize: 14 }}
      >
        {label}
      </button>
    );
  }

  // Desktop without extension / standard browser -> Privy login
  return (
    <button className="btn btn-primary" onClick={login} style={{ padding: "8px 16px", fontSize: 14 }}>
      Connect Wallet
    </button>
  );
}
