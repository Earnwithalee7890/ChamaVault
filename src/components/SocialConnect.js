"use client";
import { useState } from "react";

export default function SocialConnect() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState("");

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setLoading(true);
    // Mocking Celo SocialConnect ODIS network resolution
    setTimeout(() => {
      setLoading(false);
      // Generate a mock wallet address for the demo
      const mockAddress = "0x" + Math.random().toString(16).substring(2, 42).padEnd(40, "0");
      setResolvedAddress(mockAddress);
    }, 1200);
  };

  return (
    <div className="glass-card" style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
      <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 16 }}>📱 Invite via Phone Number</h3>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
        Powered by Celo SocialConnect. Invite friends to your Chama without needing their complicated crypto address!
      </p>
      
      <form onSubmit={handleResolve} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input 
          type="tel" 
          placeholder="e.g. +254 712 345 678" 
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid var(--border-glass)",
            background: "rgba(0,0,0,0.3)",
            color: "#fff",
            fontSize: 16,
            outline: "none"
          }}
        />
        <button 
          type="submit" 
          className="btn btn-primary shimmer-btn"
          disabled={loading || !phoneNumber}
          style={{ width: "100%", justifyContent: "center" }}
        >
          {loading ? "Resolving via ODIS..." : "Find Wallet Address"}
        </button>
      </form>

      {resolvedAddress && (
        <div style={{ marginTop: 20, padding: 12, background: "rgba(52, 211, 153, 0.1)", borderRadius: 8, border: "1px solid rgba(52, 211, 153, 0.2)" }}>
          <p style={{ fontSize: 12, color: "var(--accent-emerald)", fontWeight: 600, marginBottom: 4 }}>
            ✅ Found MiniPay Wallet
          </p>
          <p style={{ fontSize: 13, wordBreak: "break-all", fontFamily: "monospace", color: "#f0f4ff" }}>
            {resolvedAddress}
          </p>
          <button className="btn btn-secondary" style={{ marginTop: 12, width: "100%", padding: "8px", fontSize: 13 }}>
            + Add to Chama Circle
          </button>
        </div>
      )}
    </div>
  );
}
