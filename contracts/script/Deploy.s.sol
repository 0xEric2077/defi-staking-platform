// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {StakingContract} from "../src/StakingContract.sol";

contract DeployScript is Script {
    MockERC20 public mockERC20;
    StakingContract public stakingContract;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        mockERC20 = new MockERC20();
        stakingContract = new StakingContract(address(mockERC20));

        vm.stopBroadcast();
    }
} 