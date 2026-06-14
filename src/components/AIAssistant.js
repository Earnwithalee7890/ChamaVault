"use client";
import { useState } from "react";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const askAgent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        body: JSON.stringify({ currentPot: 150, history: { missed: 0 } })
      });
      const data = await res.json();
      setAdvice(data.advice);
    } catch (e) {
      setAdvice("Error connecting to AI agent.");
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", bottom: 40, right: 40, zIndex: 1000 }}>
      {isOpen && (
        <div className="glass-card" style={{ padding: 24, width: 320, marginBottom: 16, borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h4 style={{ margin: 0, color: "#f0f4ff", display: "flex", alignItems: "center", gap: 8 }}>
              🤖 Chama AI
            </h4>
            <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>✕</button>
          </div>
          
          <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 12, minHeight: 80, fontSize: 14, color: "#94a3b8" }}>
            {loading ? "Analyzing your on-chain history..." : (advice || "Ask me for personalized savings advice based on your Celo transaction history!")}
          </div>
          
          <button 
            onClick={askAgent}
            className="btn btn-primary" 
            style={{ width: "100%", marginTop: 16, padding: "10px", fontSize: 14 }}
            disabled={loading}
          >
            {loading ? "Thinking..." : "Generate Insights ✨"}
          </button>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary shimmer-btn"
        style={{ width: 60, height: 60, borderRadius: 30, padding: 0, fontSize: 24, boxShadow: "0 4px 20px rgba(52, 211, 153, 0.4)", float: "right" }}
      >
        🤖
      </button>
    </div>
  );
}
