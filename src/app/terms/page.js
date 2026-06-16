"use client";
import React from "react";
import "../globals.css";

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingTop: 100, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Back Link */}
        <div style={{ marginBottom: 24 }}>
          <a href="/" style={{ color: "var(--accent-emerald)", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
            ← Back to Home
          </a>
        </div>

        {/* Terms Document */}
        <div className="glass-card" style={{ padding: "48px", border: "1px solid var(--border-glass)" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, marginBottom: 16 }} className="text-gradient">
            Terms of Service
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>Last Updated: June 16, 2026</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            <section>
              <h2 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. Agreement to Terms</h2>
              <p>
                By accessing or using ChamaVault, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application. ChamaVault is a decentralized, non-custodial interface built on the Celo blockchain.
              </p>
            </section>

            <section>
              <h2 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. Decentralized Protocols</h2>
              <p>
                ChamaVault provides a user interface to interact with decentralized smart contracts. We do not control, manage, or hold custody of your funds. All contributions, savings rounds, and yield generation operations occur directly on-chain through smart contracts. You assume full responsibility for all transactions signed by your wallet.
              </p>
            </section>

            <section>
              <h2 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. Savings Circle Mechanics & Defaults</h2>
              <p>
                Savings circles (Chamas) rely on regular contributions. In the event of a contribution default, the group may vote to kick a defaulting member using the governance mechanism. Kicked members forfeit future rounds and may have their global reputation score penalized on-chain.
              </p>
            </section>

            <section>
              <h2 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Risks of Blockchain Technology</h2>
              <p>
                Using blockchain systems involves risks, including but not limited to: fluctuations in network gas fees, smart contract vulnerabilities, stablecoin peg variation (e.g., cUSD, USDC), and wallet security breaches. You acknowledge that ChamaVault is not liable for losses resulting from these systemic risks.
              </p>
            </section>

            <section>
              <h2 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>5. Limitation of Liability</h2>
              <p>
                ChamaVault is provided "as is" and "as available" without any warranties of any kind. We do not warrant that the application will be uninterrupted, secure, or free from bugs or errors.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
