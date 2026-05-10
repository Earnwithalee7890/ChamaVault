const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ChamaVault to", hre.network.name, "...");

  const ChamaVault = await hre.ethers.getContractFactory("ChamaVault");
  const chamaVault = await ChamaVault.deploy();
  await chamaVault.waitForDeployment();

  const address = await chamaVault.getAddress();
  console.log("✅ ChamaVault deployed to:", address);

  console.log("🚀 Deploying ChamaToken (Custom Staking Token)...");
  const ChamaToken = await hre.ethers.getContractFactory("ChamaToken");
  const chamaToken = await ChamaToken.deploy();
  await chamaToken.waitForDeployment();
  const tokenAddress = await chamaToken.getAddress();
  console.log("✅ ChamaToken deployed to:", tokenAddress);

  console.log("🚀 Deploying ChamaMiner with ChamaToken:", tokenAddress);
  const ChamaMiner = await hre.ethers.getContractFactory("ChamaMiner");
  const chamaMiner = await ChamaMiner.deploy(tokenAddress);
  await chamaMiner.waitForDeployment();
  const minerAddress = await chamaMiner.getAddress();
  console.log("✅ ChamaMiner deployed to:", minerAddress);

  console.log("🚀 Deploying ChamaQuests with ChamaToken:", tokenAddress);
  const ChamaQuests = await hre.ethers.getContractFactory("ChamaQuests");
  const chamaQuests = await ChamaQuests.deploy(tokenAddress);
  await chamaQuests.waitForDeployment();
  const questsAddress = await chamaQuests.getAddress();
  console.log("✅ ChamaQuests deployed to:", questsAddress);

  // Deploy the Token Sale contract
  // Use cUSD on Alfajores: 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
  // Use cUSD on Mainnet:   0x765DE816845861e75A25fCA122bb6898B8B1282a
  const cusdAddress = hre.network.name === "celo"
    ? "0x765DE816845861e75A25fCA122bb6898B8B1282a"
    : "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  console.log("🚀 Deploying ChamaTokenSale with ChamaToken:", tokenAddress, "and cUSD:", cusdAddress);
  const ChamaTokenSale = await hre.ethers.getContractFactory("ChamaTokenSale");
  const chamaTokenSale = await ChamaTokenSale.deploy(tokenAddress, cusdAddress);
  await chamaTokenSale.waitForDeployment();
  const saleAddress = await chamaTokenSale.getAddress();
  console.log("✅ ChamaTokenSale deployed to:", saleAddress);

  console.log("");
  console.log("📋 Next steps:");
  console.log(`   1. Add to .env: NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`   2. Add to .env: NEXT_PUBLIC_CUSD_ADDRESS=${tokenAddress}`);
  console.log(`   3. Add to .env: NEXT_PUBLIC_MINER_ADDRESS=${minerAddress}`);
  console.log(`   4. Add to .env: NEXT_PUBLIC_QUESTS_ADDRESS=${questsAddress}`);
  console.log(`   5. Add to .env: NEXT_PUBLIC_SALE_ADDRESS=${saleAddress}`);
  console.log("   6. Restart your Next.js dev server");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
