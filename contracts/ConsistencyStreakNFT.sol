// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ConsistencyStreakNFT
 * @notice Replaces generic, low-quality "daily check-ins" with a premium
 *         Consistency Streak Badge protocol. Users record their daily consistency
 *         and claim a free, dynamic on-chain badge NFT.
 *         The contract is free to mint (zero developer fees); users only pay standard Celo network gas.
 */
contract ConsistencyStreakNFT is ERC721, Ownable {
    using Strings for uint256;

    struct BadgeData {
        uint256 streak;
        uint256 claimTimestamp;
        address achiever;
    }

    struct UserStreak {
        uint256 currentStreak;
        uint256 lastClaimTimestamp;
        uint256 highestStreak;
    }

    uint256 private _nextTokenId;
    
    mapping(uint256 => BadgeData) public badgeDetails;
    mapping(address => UserStreak) public userStreaks;

    event BadgeClaimed(address indexed user, uint256 indexed tokenId, uint256 streak);

    constructor() 
        ERC721("Consistency Streak Badge", "CSB") 
        Ownable(msg.sender)
    {}

    /**
     * @notice Records daily engagement consistency and claims/mints a dynamic on-chain NFT.
     * @dev Replaces typical boring "daily check-in" buttons with a Consistency Streak Badge NFT.
     */
    function recordConsistency() external returns (uint256) {
        address user = msg.sender;
        UserStreak storage stats = userStreaks[user];

        // 20 hours enforces daily claim without strict 24 hour micro-management
        require(
            stats.lastClaimTimestamp == 0 || block.timestamp >= stats.lastClaimTimestamp + 20 hours,
            "Already recorded consistency today. Try again in a few hours."
        );

        // Streak check: must be claimed within 48 hours to maintain
        if (stats.lastClaimTimestamp != 0 && block.timestamp <= stats.lastClaimTimestamp + 48 hours) {
            stats.currentStreak += 1;
        } else {
            stats.currentStreak = 1;
        }

        stats.lastClaimTimestamp = block.timestamp;
        if (stats.currentStreak > stats.highestStreak) {
            stats.highestStreak = stats.currentStreak;
        }

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(user, tokenId);

        badgeDetails[tokenId] = BadgeData({
            streak: stats.currentStreak,
            claimTimestamp: block.timestamp,
            achiever: user
        });

        emit BadgeClaimed(user, tokenId, stats.currentStreak);
        return tokenId;
    }

    /**
     * @notice Returns metadata and dynamic on-chain SVG representation for the given token ID.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        BadgeData memory badge = badgeDetails[tokenId];
        
        (string memory tierName, string memory color1, string memory color2) = getTierInfo(badge.streak);
        
        string memory svg = generateSVG(badge.achiever, badge.streak, tierName, color1, color2);
        
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Consistency Badge #',
                        tokenId.toString(),
                        '", "description": "This NFT serves as cryptographic proof of consistency within the ChamaVault protocol on Celo.", ',
                        '"image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '", "attributes": [',
                        '{"trait_type": "Streak Duration (Days)", "value": ', badge.streak.toString(), '},',
                        '{"trait_type": "Consistency Tier", "value": "', tierName, '"},',
                        '{"trait_type": "Loyal Achiever", "value": "', Strings.toHexString(badge.achiever), '"}',
                        ']}'
                    )
                )
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /**
     * @notice Helper to get color and tier settings based on streak counts.
     */
    function getTierInfo(uint256 streak) public pure returns (string memory name, string memory primaryColor, string memory secondaryColor) {
        if (streak >= 100) {
            return ("Legend Tier", "#10b981", "#06b6d4"); // emerald to cyan
        } else if (streak >= 30) {
            return ("Diamond Tier", "#22d3ee", "#3b82f6"); // cyan to blue
        } else if (streak >= 10) {
            return ("Gold Tier", "#fbbf24", "#f59e0b"); // gold to amber
        } else if (streak >= 4) {
            return ("Silver Tier", "#9ca3af", "#4b5563"); // silver to gray
        } else {
            return ("Bronze Tier", "#b45309", "#78350f"); // bronze/brown
        }
    }

    /**
     * @notice Renders the badge image SVG on-chain dynamically.
     */
    function generateSVG(
        address achiever,
        uint256 streak,
        string memory tierName,
        string memory color1,
        string memory color2
    ) public pure returns (string memory) {
        string memory addressStr = Strings.toHexString(achiever);
        string memory shortAddress = string(
            abi.encodePacked(
                substring(addressStr, 0, 6),
                "...",
                substring(addressStr, 38, 42)
            )
        );

        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">',
                '<defs>',
                '<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:', color1, ';stop-opacity:1" />',
                '<stop offset="100%" style="stop-color:', color2, ';stop-opacity:1" />',
                '</linearGradient>',
                '</defs>',
                '<rect width="400" height="500" rx="24" fill="#0d121f" />',
                '<rect x="2" y="2" width="396" height="496" rx="22" fill="none" stroke="url(#grad)" stroke-width="3" />',
                '<circle cx="200" cy="220" r="100" fill="url(#grad)" opacity="0.08" style="filter:blur(30px);" />',
                '<text x="200" y="55" fill="', color1, '" font-family="system-ui, sans-serif" font-size="12" font-weight="800" letter-spacing="4" text-anchor="middle">CHAMAVAULT</text>',
                '<text x="200" y="80" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="700" text-anchor="middle">Consistency Protocol</text>',
                '<circle cx="200" cy="220" r="70" fill="none" stroke="url(#grad)" stroke-width="4" stroke-dasharray="5 3" />',
                '<circle cx="200" cy="220" r="60" fill="#111827" fill-opacity="0.8" stroke="rgba(255,255,255,0.05)" stroke-width="1" />',
                '<path d="M185 220 l10 10 l20 -20" fill="none" stroke="', color1, '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />',
                '<text x="200" y="340" fill="#ffffff" font-family="system-ui, sans-serif" font-size="36" font-weight="900" text-anchor="middle">', streak.toString(), '</text>',
                '<text x="200" y="370" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="13" font-weight="600" letter-spacing="2" text-anchor="middle">CONSECUTIVE DAYS</text>',
                '<rect x="130" y="395" width="140" height="28" rx="14" fill="url(#grad)" opacity="0.15" />',
                '<text x="200" y="414" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle">', tierName, '</text>',
                '<text x="200" y="465" fill="#4b5563" font-family="monospace" font-size="12" text-anchor="middle">Owner: ', shortAddress, '</text>',
                '</svg>'
            )
        );
    }

    /**
     * @notice Helper substring utility function.
     */
    function substring(string memory str, uint256 startIndex, uint256 endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for(uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }
}
