"use client";
import { useEffect, useState } from "react";

export default function MiniPayBanner() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    // MiniPay injects window.ethereum with isMiniPay = true
    if (typeof window !== "undefined" && window.ethereum?.isMiniPay) {
      setIsMiniPay(true);
    }

    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  if (!isMounted || !visible) return null;

  return (
    <>
      <div className="minipay-floating-banner">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <span style={{ fontSize: "18px" }}>{isMiniPay ? "✨" : "⚠️"}</span>
          <span style={{ fontSize: "12px", fontWeight: "600", lineHeight: 1.4 }}>
            {isMiniPay 
              ? "Operating in MiniPay environment! Celo network optimized."
              : "For the best experience on mobile, open this app inside Opera MiniPay."}
          </span>
        </div>
        <button 
          onClick={() => setVisible(false)}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.7)",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.color = "#fff"}
          onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.7)"}
        >
          ✕
        </button>
      </div>

      <style jsx>{`
        .minipay-floating-banner {
          background: ${isMiniPay ? "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"};
          color: #fff;
          padding: 12px 20px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3), 0 0 20px ${isMiniPay ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)"};
          z-index: 11000;
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 360px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .minipay-floating-banner {
            bottom: 84px !important;
            left: 16px !important;
            right: 16px !important;
            width: auto !important;
          }
        }
      `}</style>
    </>
  );
}
