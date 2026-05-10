// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ChamaToken is ERC20 {
    constructor() ERC20("Chama Token", "CHMT") {
        // Mint 1,000,000 tokens to the deployer instantly
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // A faucet function so users can get free CHMT to test the miner
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
