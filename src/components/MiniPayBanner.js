"use client";
import { useEffect, useState } from "react";

export default function MiniPayBanner() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // MiniPay injects window.ethereum with isMiniPay = true
    if (typeof window !== "undefined" && window.ethereum?.isMiniPay) {
      setIsMiniPay(true);
    }
  }, []);

  if (!isMounted) return null;

  return (
    <div style={{
      background: isMiniPay ? "linear-gradient(90deg, #34d399, #059669)" : "linear-gradient(90deg, #f59e0b, #d97706)",
      color: "#fff",
      textAlign: "center",
      padding: "8px 16px",
      fontSize: "13px",
      fontWeight: "600",
      letterSpacing: "0.02em",
      zIndex: 1000,
      position: "relative"
    }}>
      {isMiniPay 
        ? "✨ Operating in MiniPay environment! Celo network optimized."
        : "⚠️ For the best experience on mobile, open this app inside Opera MiniPay on the Celo network."}
    </div>
  );
}
