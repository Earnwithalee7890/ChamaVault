Remove-Item -Recurse -Force .git -ErrorAction Ignore
git init
git remote add origin https://github.com/Earnwithalee7890/ChamaVault.git
git config user.name "Alee"
git config user.email "Earnwithalee7890@users.noreply.github.com"

# Commit 1: Project Setup
git add package.json package-lock.json next.config.mjs jsconfig.json
git add postcss.config.mjs hardhat.config.js eslint.config.mjs .gitignore
git commit -m "chore: Initialize Next.js & Hardhat project structure

- Configure Next.js environment and ESLint rules
- Setup Hardhat configuration for Celo Alfajores and Mainnet
- Define core dependencies (React, Wagmi, ConnectKit, Tailwind)"

# Commit 2: Smart Contracts
git add contracts/
git commit -m "feat(contracts): Implement ChamaVault and ChamaMiner contracts

- Create ChamaVault for trustless rotating savings circles
- Add ChamaMiner for yielding yCHAMA rewards on staked cUSD
- Implement LITE (1.5x) and PRO (3x) subscription multiplier tiers
- Ensure non-reentrant security patterns across core functions"

# Commit 3: Web3 Configuration & Providers
git add src/config/ src/components/Web3Provider.js src/components/WalletConnect.js scripts/deploy.js
git commit -m "feat(web3): Add blockchain providers and deployment scripts

- Setup Wagmi Config and ConnectKit Provider optimized for MiniPay
- Export ABIs and dynamic contract addresses for ChamaVault & Miner
- Build deployment scripts to deploy contracts sequentially to Celo"

# Commit 4: Landing Page & 3D Components
git add src/components/Logo3D.js src/components/HeroScene.js src/app/globals.css src/app/layout.js src/app/page.js src/app/favicon.ico
git add public/logo.png
git commit -m "feat(ui): Design interactive 3D landing page

- Build dynamic 3D logo and hero scenes using Three.js / React Three Fiber
- Implement sleek, responsive global CSS themes and glassmorphism elements
- Add smooth scrolling and intersection observers for feature sections"

# Commit 5: App Dashboard
git add src/app/app/
git commit -m "feat(app): Build complete DApp dashboard with yielding interface

- Implement full cycle creation and exploration interfaces
- Add detailed live state tracking for Chama rounds and members
- Build real-time yielding dashboard with dynamic visual updates
- Connect LITE and PRO subscription buttons to ChamaMiner on-chain logic"

# Commit 6: Documentation
git add README.md
git commit -m "docs: Add comprehensive project README

- Detail ChamaVault and ChamaMiner architecture
- Provide instructions for quick-start and testnet deployment
- Outline alignment with Celo Proof of Ship hackathon goals"

# Fallback for any remaining uncommitted files (like CLAUDE.md etc)
git add .
git commit -m "chore: Finalize remaining documentation and assets"

git branch -M main
git push -u origin main --force
