# 🏦 ChamaVault
**Built for Celo Proof of Ship**

![ChamaVault Banner](https://via.placeholder.com/1200x400/111827/34d399?text=ChamaVault+-+On-Chain+Savings+Circles)

Africa's centuries-old rotating savings tradition (Chama/Susu/Tontine) — now trustless, transparent, and powered by Celo stablecoins (cUSD). Create or join a Chama circle and let smart contracts handle the trust.

## 🌟 The Problem
Traditional savings circles rely on immense interpersonal trust. Middlemen or treasurers hold the funds, which can lead to delays, mismanagement, or outright theft. Furthermore, members cannot build verifiable, portable financial reputations from their positive savings habits.

## 💡 The ChamaVault Solution
ChamaVault replaces the trusted treasurer with immutable smart contracts on the Celo blockchain:
- **Trustless:** Funds are locked in a smart contract and paid out automatically when a round concludes.
- **Stable:** All contributions and payouts are handled in **cUSD** to prevent volatility.
- **Global & Accessible:** Integrated with MiniPay, making onboarding instant for everyday users without needing crypto knowledge.
- **Reputation-based:** Users build an on-chain "Trust Score" by making timely contributions.

---

## 🚀 Features

### 1. 🤝 Trustless Rotating Savings Circles
Users can deploy a custom savings circle with parameters:
- Contribution Amount (e.g., 10 cUSD)
- Contribution Frequency (Daily, Weekly, Bi-weekly, Monthly)
- Max Members

### 2. ⛏️ The ChamaMiner System
A built-in staking and yielding protocol that allows users to deposit their cUSD to passively mine **yCHAMA** (Yield Chama) tokens.
- **Upgradable Mining Machines:** Users can spend cUSD to upgrade their mining tier.
- **LITE Tier (1.5x Multiplier):** Costs 10 cUSD.
- **PRO Tier (3x Multiplier):** Costs 50 cUSD.
- Generates continuous on-chain activity and yields!

### 3. 🎯 Daily Quests & Streaks
Users can check in daily using a zero-value Celo transaction to build an on-chain streak, rewarding active ecosystem participants.

### 4. 📊 Live Reputation Leaderboard
Track the most reliable savers through an on-chain global reputation index.

---

## 🛠 Tech Stack
- **Blockchain:** Celo Alfajores & Celo Mainnet
- **Smart Contracts:** Solidity, Hardhat, OpenZeppelin
- **Frontend:** Next.js, React, Web3.js / viem / wagmi
- **Wallet Connection:** ConnectKit / Wagmi (Optimized for MiniPay)
- **Styling:** Vanilla CSS, CSS Modules

---

## ⚙️ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Earnwithalee7890/ChamaVault.git
cd chamavault
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_MINER_ADDRESS=0x...
NEXT_PUBLIC_CUSD_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## 📜 Smart Contract Deployment

To deploy the `ChamaVault` and `ChamaMiner` contracts to the Celo testnet:

```bash
npx hardhat run scripts/deploy.js --network alfajores
```
*(Make sure you have your private key configured in `hardhat.config.js`)*

---

## 🏆 Celo Proof of Ship Goals
- Demonstrates real-world utility by bringing a culturally significant financial practice on-chain.
- Leverages Celo's mobile-first ecosystem (MiniPay).
- Uses stablecoins (cUSD) for predictable financial planning.

---
Built with ❤️ by the ChamaVault Team.
