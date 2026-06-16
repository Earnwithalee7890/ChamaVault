"use client";
import React from "react";
import "../globals.css";

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingTop: 100, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Back Link */}
        <div style={{ marginBottom: 24 }}>
          <a href="/" style={{ color: "var(--accent-emerald)", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
            ← Back to Home
          </a>
        </div>

        {/* Privacy Document */}
        <div className="glass-card" style={{ padding: "48px", border: "1px solid var(--border-glass)" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, marginBottom: 16 }} className="text-gradient">
            Privacy Policy
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>Last Updated: June 16, 2026</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            <section>
              <h2 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. Collection of Information</h2>
              <p>
                As a decentralized application, ChamaVault does not collect, store, or track personal identifiable information (PII) such as your real name, physical address, or IP address. The only data processed is public cryptographic wallet addresses and associated on-chain transaction data necessary to interact with Celo smart contracts.
              </p>
            </section>

            <section>
              <h2 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. Privy Authentication</h2>
              <p>
                We use Privy to facilitate wallet connection and social logins. If you choose to log in using third-party social accounts or email, Privy handles authentication securely in accordance with their privacy standard. ChamaVault does not store your login credentials or email address.
              </p>
            </section>

            <section>
              <h2 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. On-Chain Data Visibility</h2>
              <p>
                All actions performed inside your savings circles (such as contributions, voting to kick members, and payouts) are written directly to the Celo public ledger. This data is immutable, permanent, and publicly auditable by anyone.
              </p>
            </section>

            <section>
              <h2 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Cookies & Analytics</h2>
              <p>
                ChamaVault does not employ marketing cookies, tracking pixels, or third-party advertising trackers. We may use anonymous, server-side performance analytics to monitor application stability and optimize user interface speeds.
              </p>
            </section>

            <section>
              <h2 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>5. Security</h2>
              <p>
                Because you control your own private keys and connected wallets (including MiniPay), the security of your funds rests on your security habits. We recommend never sharing your private key or seed phrase with anyone.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
