// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "../lib/openzeppelin-contracts/contracts/utils/Pausable.sol";
import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title StakingContract
 * @dev A contract for staking tokens and earning rewards
 */
contract StakingContract is ReentrancyGuard, Pausable, Ownable {
    // State variables
    IERC20 public stakingToken;
    uint256 public constant REWARD_RATE = 15e16; // 15% APY
    uint256 public constant SECONDS_IN_YEAR = 365 days;
    uint256 public totalStaked;

    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 rewardDebt;
    }

    // Mapping from user address to stake info
    mapping(address => Stake) public stakes;

    // Events
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    /**
     * @dev Constructor sets the staking token address
     * @param _stakingToken The address of the token that can be staked
     */
    constructor(address _stakingToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "StakingContract: zero address");
        stakingToken = IERC20(_stakingToken);
    }

    /**
     * @dev Allows users to stake tokens
     * @param amount The amount of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "StakingContract: cannot stake 0");
        
        // Update rewards before changing stake
        uint256 pendingRewards = calculateRewards(msg.sender);
        
        // Update stake info
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].rewardDebt += pendingRewards;
        
        // Update total staked
        totalStaked += amount;
        
        // Transfer tokens to contract
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "StakingContract: transfer failed");
        
        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Allows users to unstake tokens
     * @param amount The amount of tokens to unstake
     */
    function unstake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "StakingContract: cannot unstake 0");
        require(stakes[msg.sender].amount >= amount, "StakingContract: insufficient stake");
        
        // Update rewards before changing stake
        uint256 pendingRewards = calculateRewards(msg.sender);
        
        // Update stake info
        stakes[msg.sender].amount -= amount;
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].rewardDebt += pendingRewards;
        
        // Update total staked
        totalStaked -= amount;
        
        // Transfer tokens back to user
        require(stakingToken.transfer(msg.sender, amount), "StakingContract: transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev Allows users to claim their rewards
     */
    function claimRewards() external nonReentrant whenNotPaused {
        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "StakingContract: no rewards to claim");
        
        // Reset timestamp and rewardDebt
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].rewardDebt = 0;
        
        // Transfer rewards to user
        require(stakingToken.transfer(msg.sender, rewards), "StakingContract: transfer failed");
        
        emit RewardsClaimed(msg.sender, rewards);
    }

    /**
     * @dev Allows users to compound their rewards (claim and restake)
     */
    function compound() external nonReentrant whenNotPaused {
        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "StakingContract: no rewards to compound");
        
        // Update stake info
        stakes[msg.sender].amount += rewards;
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].rewardDebt = 0;
        
        // Update total staked
        totalStaked += rewards;
        
        emit Staked(msg.sender, rewards);
        emit RewardsClaimed(msg.sender, rewards);
    }

    /**
     * @dev Returns stake info for a user
     * @param user The address of the user
     * @return amount The staked amount
     * @return rewards The pending rewards
     */
    function getStakeInfo(address user) external view returns (uint256 amount, uint256 rewards) {
        amount = stakes[user].amount;
        rewards = calculateRewards(user);
    }

    /**
     * @dev Calculates the pending rewards for a user
     * @param user The address of the user
     * @return The pending rewards
     */
    function calculateRewards(address user) public view returns (uint256) {
        Stake memory userStake = stakes[user];
        
        if (userStake.amount == 0) {
            return 0;
        }
        
        // Calculate time elapsed since last update
        uint256 timeElapsed = block.timestamp - userStake.timestamp;
        
        // Calculate rewards: amount * rate * timeElapsed / secondsInYear
        uint256 rewards = (userStake.amount * REWARD_RATE * timeElapsed) / (SECONDS_IN_YEAR * 1e18);
        
        // Add any previously accumulated rewards
        return rewards + userStake.rewardDebt;
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
} 