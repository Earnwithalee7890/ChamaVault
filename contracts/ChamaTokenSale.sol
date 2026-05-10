// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IChamaToken {
    function mint(address to, uint256 amount) external;
}

/**
 * @title ChamaTokenSale
 * @notice Users can purchase CHAMA tokens using cUSD or native CELO.
 *         Rate: $1 cUSD = 10,000 CHAMA tokens
 *         CELO purchases use a fixed rate set by the owner.
 */
contract ChamaTokenSale is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IChamaToken public chamaToken;
    IERC20 public cusd;
    address public owner;

    // 1 cUSD (18 decimals) = 10,000 CHAMA (18 decimals)
    uint256 public constant CHAMA_PER_CUSD = 10000;

    // CELO price in USD (e.g., 0.5 USD = 500 with 3 decimals precision)
    // This means 1 CELO = celoPriceUsd / 1000 USD
    uint256 public celoPriceUsd = 500; // Default: $0.50 per CELO

    uint256 public totalCusdRaised;
    uint256 public totalCeloRaised;
    uint256 public totalChamaSold;

    event TokensPurchasedWithCUSD(address indexed buyer, uint256 cusdAmount, uint256 chamaAmount);
    event TokensPurchasedWithCELO(address indexed buyer, uint256 celoAmount, uint256 chamaAmount);
    event CeloPriceUpdated(uint256 newPrice);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _chamaToken, address _cusd) {
        chamaToken = IChamaToken(_chamaToken);
        cusd = IERC20(_cusd);
        owner = msg.sender;
    }

    /**
     * @notice Buy CHAMA tokens with cUSD.
     * @param cusdAmount The amount of cUSD to spend (18 decimals).
     *        e.g., 1 cUSD = 1e18 → receives 10,000 CHAMA = 10000e18
     */
    function buyWithCUSD(uint256 cusdAmount) external nonReentrant {
        require(cusdAmount > 0, "Amount must be > 0");

        uint256 chamaAmount = cusdAmount * CHAMA_PER_CUSD;

        // Transfer cUSD from buyer to this contract
        cusd.safeTransferFrom(msg.sender, address(this), cusdAmount);

        // Mint CHAMA to buyer
        chamaToken.mint(msg.sender, chamaAmount);

        totalCusdRaised += cusdAmount;
        totalChamaSold += chamaAmount;

        emit TokensPurchasedWithCUSD(msg.sender, cusdAmount, chamaAmount);
    }

    /**
     * @notice Buy CHAMA tokens with native CELO.
     *         Amount of CHAMA = (CELO sent * celoPriceUsd / 1000) * CHAMA_PER_CUSD
     */
    function buyWithCELO() external payable nonReentrant {
        require(msg.value > 0, "Send some CELO");

        // Calculate USD equivalent: celoAmount * celoPriceUsd / 1000
        // Then multiply by CHAMA_PER_CUSD for total CHAMA
        uint256 chamaAmount = (msg.value * celoPriceUsd * CHAMA_PER_CUSD) / 1000;

        chamaToken.mint(msg.sender, chamaAmount);

        totalCeloRaised += msg.value;
        totalChamaSold += chamaAmount;

        emit TokensPurchasedWithCELO(msg.sender, msg.value, chamaAmount);
    }

    /**
     * @notice Owner can update the CELO/USD price.
     * @param newPrice Price in thousandths of USD (e.g., 500 = $0.50)
     */
    function setCeloPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be > 0");
        celoPriceUsd = newPrice;
        emit CeloPriceUpdated(newPrice);
    }

    /**
     * @notice Owner withdraws collected cUSD.
     */
    function withdrawCUSD() external onlyOwner {
        uint256 balance = cusd.balanceOf(address(this));
        require(balance > 0, "No cUSD to withdraw");
        cusd.safeTransfer(owner, balance);
        emit FundsWithdrawn(owner, balance);
    }

    /**
     * @notice Owner withdraws collected CELO.
     */
    function withdrawCELO() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No CELO to withdraw");
        (bool success, ) = owner.call{value: balance}("");
        require(success, "CELO transfer failed");
        emit FundsWithdrawn(owner, balance);
    }

    receive() external payable {}
}
