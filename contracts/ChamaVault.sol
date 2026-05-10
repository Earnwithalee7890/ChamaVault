// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ChamaVault
 * @notice Trustless Rotating Savings Circles (Chama/Susu/Tontine) on Celo
 * @dev Each Chama is a group where members contribute a fixed amount per round.
 *      Each round, one member receives the full pot. The cycle continues until
 *      every member has received their payout.
 */
contract ChamaVault is ReentrancyGuard {

    // ──────────────────────────────────────────────
    //  Data Structures
    // ──────────────────────────────────────────────

    enum ChamaState { Forming, Active, Completed }

    struct Chama {
        string name;
        address creator;
        address token;              // cUSD / USDC address
        uint256 contributionAmount; // per member per round
        uint256 frequency;          // seconds between rounds
        uint256 maxMembers;
        uint256 currentRound;
        uint256 roundStartTime;
        uint256 totalRounds;
        ChamaState state;
        address[] members;
        mapping(uint256 => mapping(address => bool)) contributions; // round => member => paid
        mapping(uint256 => uint256) roundContributions;             // round => count
        mapping(uint256 => address) roundRecipient;                 // round => who gets paid
        mapping(address => uint256) reputationScore;
    }

    // ──────────────────────────────────────────────
    //  Storage
    // ──────────────────────────────────────────────

    uint256 public chamaCount;
    mapping(uint256 => Chama) public chamas;
    mapping(address => uint256[]) public memberChamas;    // user => list of chama IDs
    mapping(address => uint256) public globalReputation;  // cumulative reputation

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    event ChamaCreated(uint256 indexed chamaId, string name, address creator, uint256 contributionAmount, uint256 maxMembers);
    event MemberJoined(uint256 indexed chamaId, address member, uint256 memberCount);
    event ContributionMade(uint256 indexed chamaId, uint256 round, address member, uint256 amount);
    event PayoutReleased(uint256 indexed chamaId, uint256 round, address recipient, uint256 amount);
    event ChamaStarted(uint256 indexed chamaId);
    event ChamaCompleted(uint256 indexed chamaId);
    event ReputationUpdated(address member, uint256 newScore);

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────

    modifier chamaExists(uint256 _chamaId) {
        require(_chamaId < chamaCount, "Chama does not exist");
        _;
    }

    modifier onlyMember(uint256 _chamaId) {
        require(_isMember(_chamaId, msg.sender), "Not a member");
        _;
    }

    // ──────────────────────────────────────────────
    //  Core Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Create a new Chama savings circle
     * @param _name Name of the circle
     * @param _token ERC20 token address (cUSD)
     * @param _contributionAmount Amount each member contributes per round
     * @param _frequency Time between rounds in seconds
     * @param _maxMembers Maximum number of members
     */
    function createChama(
        string calldata _name,
        address _token,
        uint256 _contributionAmount,
        uint256 _frequency,
        uint256 _maxMembers
    ) external returns (uint256) {
        require(_maxMembers >= 2 && _maxMembers <= 20, "Members: 2-20");
        require(_contributionAmount > 0, "Amount must be > 0");
        require(_frequency >= 1 days, "Min frequency: 1 day");

        uint256 chamaId = chamaCount++;
        Chama storage c = chamas[chamaId];
        c.name = _name;
        c.creator = msg.sender;
        c.token = _token;
        c.contributionAmount = _contributionAmount;
        c.frequency = _frequency;
        c.maxMembers = _maxMembers;
        c.state = ChamaState.Forming;
        c.totalRounds = _maxMembers; // each member receives once

        // Creator auto-joins
        c.members.push(msg.sender);
        memberChamas[msg.sender].push(chamaId);

        emit ChamaCreated(chamaId, _name, msg.sender, _contributionAmount, _maxMembers);
        emit MemberJoined(chamaId, msg.sender, 1);

        return chamaId;
    }

    /**
     * @notice Join an existing Chama
     */
    function joinChama(uint256 _chamaId) external chamaExists(_chamaId) {
        Chama storage c = chamas[_chamaId];
        require(c.state == ChamaState.Forming, "Not accepting members");
        require(!_isMember(_chamaId, msg.sender), "Already a member");
        require(c.members.length < c.maxMembers, "Circle is full");

        c.members.push(msg.sender);
        memberChamas[msg.sender].push(_chamaId);

        emit MemberJoined(_chamaId, msg.sender, c.members.length);

        // Auto-start when full
        if (c.members.length == c.maxMembers) {
            c.state = ChamaState.Active;
            c.currentRound = 0;
            c.roundStartTime = block.timestamp;
            _assignRecipients(_chamaId);
            emit ChamaStarted(_chamaId);
        }
    }

    /**
     * @notice Contribute to the current round
     */
    function contribute(uint256 _chamaId) external nonReentrant chamaExists(_chamaId) onlyMember(_chamaId) {
        Chama storage c = chamas[_chamaId];
        require(c.state == ChamaState.Active, "Chama not active");
        require(!c.contributions[c.currentRound][msg.sender], "Already contributed this round");

        // Transfer tokens from member to contract
        IERC20(c.token).transferFrom(msg.sender, address(this), c.contributionAmount);

        c.contributions[c.currentRound][msg.sender] = true;
        c.roundContributions[c.currentRound]++;
        c.reputationScore[msg.sender]++;
        globalReputation[msg.sender]++;

        emit ContributionMade(_chamaId, c.currentRound, msg.sender, c.contributionAmount);
        emit ReputationUpdated(msg.sender, globalReputation[msg.sender]);

        // If all members contributed, release payout
        if (c.roundContributions[c.currentRound] == c.members.length) {
            _releasePayout(_chamaId);
        }
    }

    // ──────────────────────────────────────────────
    //  Internal Functions
    // ──────────────────────────────────────────────

    function _releasePayout(uint256 _chamaId) internal {
        Chama storage c = chamas[_chamaId];
        address recipient = c.roundRecipient[c.currentRound];
        uint256 totalPot = c.contributionAmount * c.members.length;

        IERC20(c.token).transfer(recipient, totalPot);

        emit PayoutReleased(_chamaId, c.currentRound, recipient, totalPot);

        // Move to next round or complete
        if (c.currentRound + 1 >= c.totalRounds) {
            c.state = ChamaState.Completed;
            emit ChamaCompleted(_chamaId);
        } else {
            c.currentRound++;
            c.roundStartTime = block.timestamp;
        }
    }

    function _assignRecipients(uint256 _chamaId) internal {
        Chama storage c = chamas[_chamaId];
        // Simple rotation: members receive in join order
        // Future: can add randomization via VRF
        for (uint256 i = 0; i < c.members.length; i++) {
            c.roundRecipient[i] = c.members[i];
        }
    }

    function _isMember(uint256 _chamaId, address _addr) internal view returns (bool) {
        address[] storage members = chamas[_chamaId].members;
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == _addr) return true;
        }
        return false;
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    function getChamaMembers(uint256 _chamaId) external view returns (address[] memory) {
        return chamas[_chamaId].members;
    }

    function getChamaInfo(uint256 _chamaId) external view returns (
        string memory name,
        address creator,
        uint256 contributionAmount,
        uint256 maxMembers,
        uint256 currentRound,
        uint256 totalRounds,
        uint256 memberCount,
        ChamaState state
    ) {
        Chama storage c = chamas[_chamaId];
        return (c.name, c.creator, c.contributionAmount, c.maxMembers, c.currentRound, c.totalRounds, c.members.length, c.state);
    }

    function hasContributed(uint256 _chamaId, uint256 _round, address _member) external view returns (bool) {
        return chamas[_chamaId].contributions[_round][_member];
    }

    function getRoundRecipient(uint256 _chamaId, uint256 _round) external view returns (address) {
        return chamas[_chamaId].roundRecipient[_round];
    }

    function getMemberReputation(uint256 _chamaId, address _member) external view returns (uint256) {
        return chamas[_chamaId].reputationScore[_member];
    }

    function getGlobalReputation(address _member) external view returns (uint256) {
        return globalReputation[_member];
    }

    function getMemberChamas(address _member) external view returns (uint256[] memory) {
        return memberChamas[_member];
    }
}
