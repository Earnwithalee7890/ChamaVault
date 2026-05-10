// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ChamaQuests {
    struct UserStats {
        uint256 xp;
        uint256 streak;
        uint256 lastCheckIn;
    }

    mapping(address => UserStats) public stats;
    address[] public allUsers;
    mapping(address => bool) public isUser;

    event CheckedIn(address indexed user, uint256 newXp, uint256 streak);

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

        if (user.lastCheckIn != 0 && block.timestamp <= user.lastCheckIn + 2 days) {
            user.streak += 1; // Maintained streak
        } else {
            user.streak = 1; // Broken streak or first time
        }

        user.xp += 10;
        user.lastCheckIn = block.timestamp;

        emit CheckedIn(msg.sender, user.xp, user.streak);
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
