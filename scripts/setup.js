/**
 * setup.js - Quick setup script for ChamaVault developers
 */
const fs = require('fs');
const path = require('path');

async function setup() {
  console.log('🚀 Starting ChamaVault Setup...');

  // 1. Create .env if it doesn't exist
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');

  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env created.');
  } else {
    console.log('ℹ️ .env already exists or .env.example is missing. Skipping.');
  }

  // 2. Check for node_modules
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('⚠️ node_modules not found. Remember to run "npm install"');
  }

  console.log('\n✨ Setup complete!');
  console.log('👉 To start development, run: npm run dev');
  console.log('👉 To deploy contracts, run: npx hardhat run scripts/deploy.js --network alfajores');
}

setup().catch(console.error);
