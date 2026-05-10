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
  console.log("🚀 Deploying ChamaQuests...");
  const ChamaQuests = await hre.ethers.getContractFactory("ChamaQuests");
  const chamaQuests = await ChamaQuests.deploy();
  await chamaQuests.waitForDeployment();
  const questsAddress = await chamaQuests.getAddress();
  console.log("✅ ChamaQuests deployed to:", questsAddress);

  console.log("");
  console.log("📋 Next steps:");
  console.log(`   1. Add to .env: NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`   2. Add to .env: NEXT_PUBLIC_MINER_ADDRESS=${minerAddress}`);
  console.log(`   3. Add to .env: NEXT_PUBLIC_QUESTS_ADDRESS=${questsAddress}`);
  console.log("   4. Restart your Next.js dev server");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
