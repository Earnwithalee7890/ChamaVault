// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IChamaToken {
    function mint(address to, uint256 amount) external;
}

/**
 * @title ChamaQuests
 * @notice Daily check-in system with escalating CHAMA token rewards.
 *         Day 1: 10 CHAMA, Day 2: 20 CHAMA, ... Day 7: 70 CHAMA
 *         After 7 days the reward amount resets to 10, but the streak keeps counting.
 */
contract ChamaQuests {
    struct UserStats {
        uint256 xp;
        uint256 streak;          // Total consecutive days (never resets unless broken)
        uint256 lastCheckIn;
        uint256 totalClaimed;    // Total CHAMA tokens claimed
    }

    IChamaToken public chamaToken;
    uint256 public constant BASE_REWARD = 10 * 1e18; // 10 CHAMA tokens (18 decimals)

    mapping(address => UserStats) public stats;
    address[] public allUsers;
    mapping(address => bool) public isUser;

    event CheckedIn(address indexed user, uint256 newXp, uint256 streak);
    event RewardClaimed(address indexed user, uint256 chamaAmount, uint256 dayInCycle);

    constructor(address _chamaToken) {
        chamaToken = IChamaToken(_chamaToken);
    }

    /**
     * @notice Calculate the CHAMA reward for a given streak.
     *         Uses a 7-day cycle: day 1 = 10, day 2 = 20, ... day 7 = 70, then resets.
     *         Streak itself keeps incrementing (never resets unless broken).
     */
    function getRewardForStreak(uint256 streak) public pure returns (uint256) {
        if (streak == 0) return BASE_REWARD; // First check-in
        uint256 dayInCycle = ((streak - 1) % 7) + 1; // 1-7 repeating
        return dayInCycle * BASE_REWARD;
    }

    /**
     * @notice Daily check-in: earns XP + mints escalating CHAMA token rewards.
     */
    function checkIn() external {
        UserStats storage user = stats[msg.sender];
        
        if (!isUser[msg.sender]) {
            allUsers.push(msg.sender);
            isUser[msg.sender] = true;
        }

        // Allow check-in if 24 hours have passed, or if it's their first time
        if (user.lastCheckIn != 0) {
            require(block.timestamp >= user.lastCheckIn + 1 days, "Already checked in today");
        }

        // Update streak
        if (user.lastCheckIn != 0 && block.timestamp <= user.lastCheckIn + 2 days) {
            user.streak += 1; // Maintained streak
        } else {
            user.streak = 1; // Broken streak or first time
        }

        // Calculate reward based on 7-day cycle
        uint256 dayInCycle = ((user.streak - 1) % 7) + 1;
        uint256 chamaReward = dayInCycle * BASE_REWARD;

        // Update XP (10 XP per check-in + bonus for streaks)
        user.xp += 10 + (dayInCycle * 5); // Extra XP bonus per day in cycle
        user.lastCheckIn = block.timestamp;
        user.totalClaimed += chamaReward;

        // Mint CHAMA tokens to the user
        chamaToken.mint(msg.sender, chamaReward);

        emit CheckedIn(msg.sender, user.xp, user.streak);
        emit RewardClaimed(msg.sender, chamaReward, dayInCycle);
    }

    /**
     * @notice View the next reward the caller will receive.
     */
    function getNextReward(address account) external view returns (uint256 chamaAmount, uint256 dayInCycle) {
        UserStats storage user = stats[account];
        uint256 nextStreak;
        
        if (user.lastCheckIn != 0 && block.timestamp <= user.lastCheckIn + 2 days) {
            nextStreak = user.streak + 1;
        } else {
            nextStreak = 1;
        }
        
        dayInCycle = ((nextStreak - 1) % 7) + 1;
        chamaAmount = dayInCycle * BASE_REWARD;
    }

    function getAllUsersStats() external view returns (address[] memory, uint256[] memory, uint256[] memory) {
        uint256 count = allUsers.length;
        address[] memory users = new address[](count);
        uint256[] memory xps = new uint256[](count);
        uint256[] memory streaks = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            address u = allUsers[i];
            users[i] = u;
            xps[i] = stats[u].xp;
            streaks[i] = stats[u].streak;
        }

        return (users, xps, streaks);
    }
}
