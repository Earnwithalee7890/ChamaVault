// ChamaVault contract ABI — matches ChamaVault.sol
// After deploying, update the address below
export const CHAMAVAULT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

export const CHAMAMINER_ADDRESS = 
  process.env.NEXT_PUBLIC_MINER_ADDRESS ||
  "0xebc8fA36E059F616e4b3B3904BBC8D2951e072a2";

export const CHAMAQUESTS_ADDRESS =
  process.env.NEXT_PUBLIC_QUESTS_ADDRESS ||
  "0x4B5FB224Dd3599D14aaf850b594A46279EEDb0A0";

// Custom ChamaToken (CHMT) used instead of cUSD
export const CUSD_ADDRESS =
  process.env.NEXT_PUBLIC_CUSD_ADDRESS ||
  "0xC7bE21448A1c518d7Bb982d96D3D93CA62E2b9E8";

// cUSD on Alfajores testnet
export const CUSD_TESTNET_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

// ChamaToken address (the CHMT token itself)
export const CHAMATOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_CUSD_ADDRESS ||
  "0xC7bE21448A1c518d7Bb982d96D3D93CA62E2b9E8";

// ChamaTokenSale address
export const CHAMASALE_ADDRESS =
  process.env.NEXT_PUBLIC_SALE_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

// Real cUSD address on the network (for purchasing CHAMA)
export const REAL_CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

export const CHAMAVAULT_ABI = [
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "chamaId",
        "type": "uint256"
      }
    ],
    "name": "ChamaCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "chamaId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "contributionAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxMembers",
        "type": "uint256"
      }
    ],
    "name": "ChamaCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "chamaId",
        "type": "uint256"
      }
    ],
    "name": "ChamaStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "chamaId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "member",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "ContributionMade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "chamaId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "member",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "memberCount",
        "type": "uint256"
      }
    ],
    "name": "MemberJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "chamaId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "PayoutReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "member",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newScore",
        "type": "uint256"
      }
    ],
    "name": "ReputationUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "chamaCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "chamas",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "contributionAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "frequency",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxMembers",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentRound",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "roundStartTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalRounds",
        "type": "uint256"
      },
      {
        "internalType": "enum ChamaVault.ChamaState",
        "name": "state",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_chamaId",
        "type": "uint256"
      }
    ],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_contributionAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_frequency",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_maxMembers",
        "type": "uint256"
      }
    ],
    "name": "createChama",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_chamaId",
        "type": "uint256"
      }
    ],
    "name": "getChamaInfo",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "contributionAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxMembers",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentRound",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalRounds",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "memberCount",
        "type": "uint256"
      },
      {
        "internalType": "enum ChamaVault.ChamaState",
        "name": "state",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_chamaId",
        "type": "uint256"
      }
    ],
    "name": "getChamaMembers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_member",
        "type": "address"
      }
    ],
    "name": "getGlobalReputation",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_member",
        "type": "address"
      }
    ],
    "name": "getMemberChamas",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_chamaId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_member",
        "type": "address"
      }
    ],
    "name": "getMemberReputation",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_chamaId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_round",
        "type": "uint256"
      }
    ],
    "name": "getRoundRecipient",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "globalReputation",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_chamaId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_round",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_member",
        "type": "address"
      }
    ],
    "name": "hasContributed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_chamaId",
        "type": "uint256"
      }
    ],
    "name": "joinChama",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "memberChamas",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const CHAMAMINER_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "harvest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "newTier", type: "uint8" }],
    name: "upgradeTier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "pendingRewards",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "userTiers",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balances",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "liteUpgradeCost",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proUpgradeCost",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  }
];

// ERC20 ABI for cUSD approve + balanceOf
export const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

// Categories for Chama circles
export const CATEGORIES = [
  { id: "general", name: "General Savings", icon: "💰", color: "#34d399" },
  { id: "housing", name: "Housing Fund", icon: "🏠", color: "#fbbf24" },
  { id: "education", name: "Education", icon: "📚", color: "#a78bfa" },
  { id: "health", name: "Health Emergency", icon: "🏥", color: "#fb7185" },
  { id: "business", name: "Business Capital", icon: "💼", color: "#22d3ee" },
  { id: "community", name: "Community Aid", icon: "🤝", color: "#f59e0b" },
];

// Celo chain definitions for wagmi/viem
export const celoMainnet = {
  id: 42220,
  name: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://forno.celo.org"] },
  },
  blockExplorers: {
    default: { name: "Celoscan", url: "https://celoscan.io" },
  },
};

export const celoAlfajores = {
  id: 44787,
  name: "Celo Alfajores",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://alfajores-forno.celo-testnet.org"] },
  },
  blockExplorers: {
    default: { name: "Celoscan", url: "https://alfajores.celoscan.io" },
  },
  testnet: true,
};

export const CHAMAQUESTS_ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"newXp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"streak","type":"uint256"}],"name":"CheckedIn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"chamaAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"dayInCycle","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allUsers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"checkIn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"chamaToken","outputs":[{"internalType":"contract IChamaToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BASE_REWARD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllUsersStats","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getNextReward","outputs":[{"internalType":"uint256","name":"chamaAmount","type":"uint256"},{"internalType":"uint256","name":"dayInCycle","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"streak","type":"uint256"}],"name":"getRewardForStreak","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isUser","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"stats","outputs":[{"internalType":"uint256","name":"xp","type":"uint256"},{"internalType":"uint256","name":"streak","type":"uint256"},{"internalType":"uint256","name":"lastCheckIn","type":"uint256"},{"internalType":"uint256","name":"totalClaimed","type":"uint256"}],"stateMutability":"view","type":"function"}];

export const CHAMASALE_ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"cusdAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"chamaAmount","type":"uint256"}],"name":"TokensPurchasedWithCUSD","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"celoAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"chamaAmount","type":"uint256"}],"name":"TokensPurchasedWithCELO","type":"event"},{"inputs":[{"internalType":"uint256","name":"cusdAmount","type":"uint256"}],"name":"buyWithCUSD","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"buyWithCELO","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"CHAMA_PER_CUSD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"celoPriceUsd","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalCusdRaised","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalCeloRaised","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalChamaSold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

