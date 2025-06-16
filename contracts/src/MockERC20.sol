// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title MockERC20
 * @dev A mock ERC20 token for testing purposes
 */
contract MockERC20 is ERC20, Ownable {
    uint8 private constant _DECIMALS = 18;
    uint256 private constant _INITIAL_SUPPLY = 1_000_000 * 10**18;

    /**
     * @dev Constructor that mints 1,000,000 tokens to deployer
     */
    constructor() ERC20("Mock Token", "MTK") Ownable(msg.sender) {
        _mint(msg.sender, _INITIAL_SUPPLY);
    }

    /**
     * @dev Function to mint tokens
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     * @return A boolean that indicates if the operation was successful
     */
    function mint(address to, uint256 amount) public onlyOwner returns (bool) {
        _mint(to, amount);
        return true;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     */
    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }
} 