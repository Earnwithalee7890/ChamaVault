"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";

export default function WalletConnect() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ width: 150, height: 40, background: "rgba(255,255,255,0.05)", borderRadius: 10 }}></div>;
  }

  return <ConnectButton />;
}
