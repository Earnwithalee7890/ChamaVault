// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// The custom reward token that gets "mined"
contract ChamaRewardToken is ERC20 {
    address public minter;

    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter can mint");
        _;
    }

    constructor() ERC20("Chama Yield", "yCHAMA") {
        minter = msg.sender;
    }

    function setMinter(address _minter) external onlyMinter {
        minter = _minter;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
}

/**
 * @title ChamaMiner
 * @notice A real on-chain yield farming contract. Users deposit cUSD and mine yCHAMA rewards per block.
 */
contract ChamaMiner is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public stakingToken; // cUSD address
    ChamaRewardToken public rewardToken; // Mined token

    // Mining rate: How many reward tokens are generated per second per staked token
    uint256 public rewardRate = 500000; 

    enum Tier { FREE, LITE, PRO }
    mapping(address => Tier) public userTiers;

    uint256 public liteUpgradeCost = 10 * 1e18; // 10 cUSD
    uint256 public proUpgradeCost = 50 * 1e18; // 50 cUSD

    mapping(address => uint256) public balances;
    mapping(address => uint256) public rewardDebt;
    mapping(address => uint256) public lastUpdateTime;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardHarvested(address indexed user, uint256 reward);
    event TierUpgraded(address indexed user, Tier newTier);

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
        
        // Auto-deploy the reward token and link it to this miner
        rewardToken = new ChamaRewardToken();
        rewardToken.setMinter(address(this));
    }

    modifier updateReward(address account) {
        if (account != address(0)) {
            uint256 earned = pendingRewards(account);
            rewardDebt[account] = earned;
            lastUpdateTime[account] = block.timestamp;
        }
        _;
    }

    function getMultiplier(address account) public view returns (uint256) {
        if (userTiers[account] == Tier.PRO) return 300; // 3x
        if (userTiers[account] == Tier.LITE) return 150; // 1.5x
        return 100; // 1x
    }

    // Read real-time pending rewards from the blockchain
    function pendingRewards(address account) public view returns (uint256) {
        if (balances[account] == 0) {
            return rewardDebt[account];
        }
        uint256 timeElapsed = block.timestamp - lastUpdateTime[account];
        uint256 multiplier = getMultiplier(account);
        uint256 newReward = (balances[account] * timeElapsed * rewardRate * multiplier) / (1e18 * 100);
        return rewardDebt[account] + newReward;
    }

    function deposit(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot deposit 0");
        balances[msg.sender] += amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function harvest() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewardDebt[msg.sender];
        if (reward > 0) {
            rewardDebt[msg.sender] = 0;
            rewardToken.mint(msg.sender, reward);
            emit RewardHarvested(msg.sender, reward);
        }
    }

    function upgradeTier(Tier newTier) external nonReentrant updateReward(msg.sender) {
        require(newTier > userTiers[msg.sender], "Can only upgrade");
        require(newTier <= Tier.PRO, "Invalid tier");
        
        uint256 cost;
        if (newTier == Tier.LITE) {
            cost = liteUpgradeCost;
        } else if (newTier == Tier.PRO) {
            cost = proUpgradeCost;
        }
        
        stakingToken.safeTransferFrom(msg.sender, address(this), cost);
        userTiers[msg.sender] = newTier;
        emit TierUpgraded(msg.sender, newTier);
    }
}

// Integrated Lite and Pro Tiers
