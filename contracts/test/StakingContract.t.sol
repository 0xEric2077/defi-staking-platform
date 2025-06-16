// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {StakingContract} from "../src/StakingContract.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract StakingContractTest is Test {
    StakingContract public stakingContract;
    MockERC20 public token;

    address public owner = address(1);
    address public alice = address(2);
    address public bob = address(3);

    uint256 public constant INITIAL_BALANCE = 10_000 * 1e18;
    uint256 public constant STAKE_AMOUNT = 1_000 * 1e18;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    function setUp() public {
        vm.startPrank(owner);

        // Deploy token and staking contract
        token = new MockERC20();
        stakingContract = new StakingContract(address(token));

        // Transfer tokens to test users
        token.transfer(alice, INITIAL_BALANCE);
        token.transfer(bob, INITIAL_BALANCE);

        vm.stopPrank();
    }

    // ==================== Deployment Tests ====================

    function test_Deployment() public {
        assertEq(address(stakingContract.stakingToken()), address(token));
        assertEq(stakingContract.totalStaked(), 0);
        assertEq(stakingContract.REWARD_RATE(), 15e16); // 15% APY
    }

    function test_DeploymentWithZeroAddress() public {
        vm.expectRevert("StakingContract: zero address");
        new StakingContract(address(0));
    }

    // ==================== Staking Tests ====================

    function test_SuccessfulStake() public {
        uint256 amountToStake = STAKE_AMOUNT;

        vm.startPrank(alice);
        token.approve(address(stakingContract), amountToStake);

        // Expect Staked event to be emitted
        vm.expectEmit(true, false, false, true);
        emit Staked(alice, amountToStake);

        stakingContract.stake(amountToStake);
        vm.stopPrank();

        // Verify state changes
        (uint256 stakedAmount, ) = stakingContract.getStakeInfo(alice);
        assertEq(stakedAmount, amountToStake);
        assertEq(stakingContract.totalStaked(), amountToStake);
        assertEq(token.balanceOf(address(stakingContract)), amountToStake);
        assertEq(token.balanceOf(alice), INITIAL_BALANCE - amountToStake);
    }

    function test_StakeZeroAmount() public {
        vm.startPrank(alice);
        token.approve(address(stakingContract), 1);

        vm.expectRevert("StakingContract: cannot stake 0");
        stakingContract.stake(0);

        vm.stopPrank();
    }

    function test_StakeWithoutApproval() public {
        vm.startPrank(alice);

        vm.expectRevert(); // ERC20 insufficient allowance error
        stakingContract.stake(STAKE_AMOUNT);

        vm.stopPrank();
    }

    function test_MultipleStakes() public {
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT * 2);

        stakingContract.stake(STAKE_AMOUNT);

        // Fast forward 10 days
        vm.warp(block.timestamp + 10 days);

        // Get rewards before second stake
        uint256 rewardsBefore = stakingContract.calculateRewards(alice);
        assertTrue(rewardsBefore > 0, "Should have rewards after 10 days");

        // Stake more
        stakingContract.stake(STAKE_AMOUNT);

        // Verify state
        (uint256 stakedAmount, uint256 rewards) = stakingContract.getStakeInfo(
            alice
        );
        assertEq(stakedAmount, STAKE_AMOUNT * 2);

        // Rewards should be accumulated in rewardDebt, not immediately available
        // So we don't check rewards directly
        vm.stopPrank();
    }

    // ==================== Reward Calculation Tests ====================

    function test_RewardsAfterOneDay() public {
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        stakingContract.stake(STAKE_AMOUNT);
        vm.stopPrank();

        // Fast forward 1 day
        vm.warp(block.timestamp + 1 days);

        // Calculate expected rewards: amount * rate * time / (secondsInYear * 1e18)
        uint256 expectedRewards = (STAKE_AMOUNT * 15e16 * 1 days) /
            (365 days * 1e18);
        uint256 actualRewards = stakingContract.calculateRewards(alice);

        // Allow for small rounding errors
        assertApproxEqRel(actualRewards, expectedRewards, 1e15); // 0.1% tolerance
    }

    function test_RewardsAfterThirtyDays() public {
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        stakingContract.stake(STAKE_AMOUNT);
        vm.stopPrank();

        // Fast forward 30 days
        vm.warp(block.timestamp + 30 days);

        // Calculate expected rewards: amount * rate * time / (secondsInYear * 1e18)
        uint256 expectedRewards = (STAKE_AMOUNT * 15e16 * 30 days) /
            (365 days * 1e18);
        uint256 actualRewards = stakingContract.calculateRewards(alice);

        // Allow for small rounding errors
        assertApproxEqRel(actualRewards, expectedRewards, 1e15); // 0.1% tolerance
    }

    function test_RewardsAfterOneYear() public {
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        stakingContract.stake(STAKE_AMOUNT);
        vm.stopPrank();

        // Fast forward 365 days
        vm.warp(block.timestamp + 365 days);

        // Calculate expected rewards: 15% of staked amount
        uint256 expectedRewards = (STAKE_AMOUNT * 15e16) / 1e18;
        uint256 actualRewards = stakingContract.calculateRewards(alice);

        // Allow for small rounding errors
        assertApproxEqRel(actualRewards, expectedRewards, 1e15); // 0.1% tolerance
    }

    // ==================== Unstaking Tests ====================

    function test_PartialUnstake() public {
        // Setup: Alice stakes tokens
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        stakingContract.stake(STAKE_AMOUNT);

        // Fast forward 10 days
        vm.warp(block.timestamp + 10 days);

        // Get rewards before unstaking
        uint256 rewardsBefore = stakingContract.calculateRewards(alice);

        // Unstake half the amount
        uint256 unstakeAmount = STAKE_AMOUNT / 2;

        vm.expectEmit(true, false, false, true);
        emit Unstaked(alice, unstakeAmount);

        stakingContract.unstake(unstakeAmount);
        vm.stopPrank();

        // Verify state changes
        (uint256 remainingStake, ) = stakingContract.getStakeInfo(alice);
        assertEq(remainingStake, STAKE_AMOUNT - unstakeAmount);
        assertEq(stakingContract.totalStaked(), STAKE_AMOUNT - unstakeAmount);
        assertEq(
            token.balanceOf(address(stakingContract)),
            STAKE_AMOUNT - unstakeAmount
        );
        assertEq(
            token.balanceOf(alice),
            INITIAL_BALANCE - STAKE_AMOUNT + unstakeAmount
        );
    }

    function test_FullUnstake() public {
        // Setup: Alice stakes tokens
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        stakingContract.stake(STAKE_AMOUNT);

        // Fast forward 10 days
        vm.warp(block.timestamp + 10 days);

        // Unstake all
        stakingContract.unstake(STAKE_AMOUNT);
        vm.stopPrank();

        // Verify state changes
        (uint256 remainingStake, ) = stakingContract.getStakeInfo(alice);
        assertEq(remainingStake, 0);
        assertEq(stakingContract.totalStaked(), 0);
        assertEq(token.balanceOf(address(stakingContract)), 0);
        assertEq(token.balanceOf(alice), INITIAL_BALANCE);
    }

    function test_UnstakeMoreThanStaked() public {
        // Setup: Alice stakes tokens
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        stakingContract.stake(STAKE_AMOUNT);

        // Try to unstake more than staked
        vm.expectRevert("StakingContract: insufficient stake");
        stakingContract.unstake(STAKE_AMOUNT + 1);

        vm.stopPrank();
    }

    function test_UnstakeZeroAmount() public {
        // Setup: Alice stakes tokens
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        stakingContract.stake(STAKE_AMOUNT);

        // Try to unstake 0
        vm.expectRevert("StakingContract: cannot unstake 0");
        stakingContract.unstake(0);

        vm.stopPrank();
    }

    // ==================== Claim Rewards Tests ====================

    function test_ClaimRewards() public {
        // Setup: Alice stakes tokens
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        stakingContract.stake(STAKE_AMOUNT);

        // Fast forward 30 days
        vm.warp(block.timestamp + 30 days);

        // Calculate expected rewards
        uint256 expectedRewards = stakingContract.calculateRewards(alice);
        assertTrue(expectedRewards > 0, "Should have rewards after 30 days");

        // Claim rewards
        vm.expectEmit(true, false, false, true);
        emit RewardsClaimed(alice, expectedRewards);

        stakingContract.claimRewards();
        vm.stopPrank();

        // Verify state changes
        (uint256 stakedAmount, uint256 pendingRewards) = stakingContract
            .getStakeInfo(alice);
        assertEq(stakedAmount, STAKE_AMOUNT); // Stake amount unchanged
        assertEq(pendingRewards, 0); // Rewards reset

        // Balance should include claimed rewards
        assertEq(
            token.balanceOf(alice),
            INITIAL_BALANCE - STAKE_AMOUNT + expectedRewards
        );
    }

    function test_ClaimWithNoRewards() public {
        // Setup: Alice stakes tokens
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        stakingContract.stake(STAKE_AMOUNT);

        // Try to claim immediately (no rewards yet)
        vm.expectRevert("StakingContract: no rewards to claim");
        stakingContract.claimRewards();

        vm.stopPrank();
    }

    // ==================== Compound Tests ====================

    function test_Compound() public {
        // Setup: Alice stakes tokens
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        stakingContract.stake(STAKE_AMOUNT);

        // Fast forward 30 days
        vm.warp(block.timestamp + 30 days);

        // Calculate expected rewards
        uint256 expectedRewards = stakingContract.calculateRewards(alice);
        assertTrue(expectedRewards > 0, "Should have rewards after 30 days");

        // Compound rewards
        stakingContract.compound();
        vm.stopPrank();

        // Verify state changes
        (uint256 stakedAmount, uint256 pendingRewards) = stakingContract
            .getStakeInfo(alice);
        assertEq(stakedAmount, STAKE_AMOUNT + expectedRewards); // Stake increased by rewards
        assertEq(pendingRewards, 0); // Rewards reset
        assertEq(stakingContract.totalStaked(), STAKE_AMOUNT + expectedRewards);

        // Balance should remain unchanged as rewards were restaked
        assertEq(token.balanceOf(alice), INITIAL_BALANCE - STAKE_AMOUNT);
    }

    function test_CompoundWithNoRewards() public {
        // Setup: Alice stakes tokens
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        stakingContract.stake(STAKE_AMOUNT);

        // Try to compound immediately (no rewards yet)
        vm.expectRevert("StakingContract: no rewards to compound");
        stakingContract.compound();

        vm.stopPrank();
    }

    // ==================== Pause/Unpause Tests ====================

    function test_PauseUnpause() public {
        // Only owner can pause
        vm.prank(owner);
        stakingContract.pause();
        assertTrue(stakingContract.paused());

        // Staking should fail when paused
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        vm.expectRevert("EnforcedPause()");
        stakingContract.stake(STAKE_AMOUNT);
        vm.stopPrank();

        // Only owner can unpause
        vm.prank(owner);
        stakingContract.unpause();
        assertFalse(stakingContract.paused());

        // Staking should work after unpausing
        vm.startPrank(alice);
        stakingContract.stake(STAKE_AMOUNT);
        vm.stopPrank();

        // Verify stake went through
        (uint256 stakedAmount, ) = stakingContract.getStakeInfo(alice);
        assertEq(stakedAmount, STAKE_AMOUNT);
    }

    function test_NonOwnerCannotPause() public {
        vm.prank(alice);
        vm.expectRevert(); // Ownable: caller is not the owner
        stakingContract.pause();
    }

    // ==================== Gas Optimization Tests ====================

    function test_StakeGasUsage() public {
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);

        uint256 gasBefore = gasleft();
        stakingContract.stake(STAKE_AMOUNT);
        uint256 gasUsed = gasBefore - gasleft();

        console.log("Gas used for stake:", gasUsed);
        vm.stopPrank();

        // No strict assertion, just logging for comparison
    }

    function test_UnstakeGasUsage() public {
        // Setup: Alice stakes tokens
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        stakingContract.stake(STAKE_AMOUNT);

        uint256 gasBefore = gasleft();
        stakingContract.unstake(STAKE_AMOUNT);
        uint256 gasUsed = gasBefore - gasleft();

        console.log("Gas used for unstake:", gasUsed);
        vm.stopPrank();

        // No strict assertion, just logging for comparison
    }

    function test_ClaimRewardsGasUsage() public {
        // Setup: Alice stakes tokens
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        stakingContract.stake(STAKE_AMOUNT);

        // Fast forward 30 days
        vm.warp(block.timestamp + 30 days);

        uint256 gasBefore = gasleft();
        stakingContract.claimRewards();
        uint256 gasUsed = gasBefore - gasleft();

        console.log("Gas used for claimRewards:", gasUsed);
        vm.stopPrank();

        // No strict assertion, just logging for comparison
    }

    function test_CompoundGasUsage() public {
        // Setup: Alice stakes tokens
        vm.startPrank(alice);
        token.approve(address(stakingContract), STAKE_AMOUNT);
        stakingContract.stake(STAKE_AMOUNT);

        // Fast forward 30 days
        vm.warp(block.timestamp + 30 days);

        uint256 gasBefore = gasleft();
        stakingContract.compound();
        uint256 gasUsed = gasBefore - gasleft();

        console.log("Gas used for compound:", gasUsed);
        vm.stopPrank();

        // No strict assertion, just logging for comparison
    }
}
