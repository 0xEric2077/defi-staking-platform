# DeFi Staking Platform - Cursor 开发文档

## 目录
- [项目概述](#项目概述)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [智能合约详解](#智能合约详解)
- [前端应用详解](#前端应用详解)
- [开发工作流](#开发工作流)
- [Cursor 提示词模板](#cursor-提示词模板)
- [常见开发任务](#常见开发任务)
- [调试与测试](#调试与测试)
- [部署流程](#部署流程)
- [故障排除](#故障排除)

## 项目概述

DeFi Staking Platform 是一个去中心化的代币质押平台，用户可以质押 ERC-20 代币并获得 15% 年化收益率（APY）的奖励。

### 核心功能
- **代币质押**：用户可以质押 MTK 代币
- **取消质押**：随时取回质押的代币
- **奖励计算**：实时计算 15% APY 的奖励
- **领取奖励**：单独领取累积的奖励
- **复投功能**：将奖励直接复投以获得复利
- **紧急暂停**：管理员可以在紧急情况下暂停合约

### 技术栈
- **智能合约**: Solidity ^0.8.20, Foundry, OpenZeppelin v5.0.0
- **前端**: Next.js 15.3.3 (App Router), wagmi v2, viem, RainbowKit, Tailwind CSS

## 快速开始

### 1. 克隆并设置项目
```bash
# 创建项目目录
mkdir defi-staking-platform
cd defi-staking-platform

# 初始化合约项目
mkdir contracts && cd contracts
forge init --no-commit

# 返回根目录，创建前端项目
cd ..
npx create-next-app@latest frontend --js --no-typescript --tailwind --app --import-alias "@/*"
```

### 2. 安装依赖
```bash
# 合约依赖
cd contracts
forge install OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-commit

# 前端依赖
cd ../frontend
npm install ethers@6 @rainbow-me/rainbowkit wagmi viem@2.x react-hot-toast react-icons @tanstack/react-query
```

### 3. 环境配置
```bash
# contracts/.env
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY

# frontend/.env.local
NEXT_PUBLIC_STAKING_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHAIN_ID=31337
```

### 4. 快速运行
```bash
# 终端 1: 启动本地区块链
cd contracts && anvil

# 终端 2: 部署合约
cd contracts
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# 终端 3: 启动前端
cd frontend && npm run dev
```

## 项目结构

```
defi-staking-platform/
├── contracts/                    # 智能合约项目
│   ├── src/
│   │   ├── MockERC20.sol        # 测试用 ERC20 代币
│   │   └── StakingContract.sol  # 质押合约
│   ├── script/
│   │   └── Deploy.s.sol         # 部署脚本
│   ├── test/
│   │   └── StakingContract.t.sol # 测试文件
│   ├── lib/                     # 依赖库 (OpenZeppelin)
│   ├── out/                     # 编译输出
│   ├── foundry.toml             # Foundry 配置
│   └── .env                     # 环境变量
│
└── frontend/                     # 前端项目
    ├── app/                     # Next.js App Router
    │   ├── layout.js            # 根布局
    │   ├── page.js              # 主页面 (标记为 'use client')
    │   ├── providers.js         # Web3 提供者 (标记为 'use client')
    │   └── globals.css          # 全局样式
    ├── components/              # React 组件
    │   ├── StakingCard.js       # 质押卡片 (标记为 'use client')
    │   ├── RewardsCard.js       # 奖励卡片 (标记为 'use client')
    │   └── StatsCard.js         # 统计卡片 (标记为 'use client')
    ├── hooks/                   # 自定义 Hooks
    │   ├── useStakingContract.js # 质押合约交互 (标记为 'use client')
    │   ├── useTokenContract.js   # 代币合约交互 (标记为 'use client')
    │   └── useStakeInfo.js      # 查询链上数据 (标记为 'use client')
    ├── utils/
    │   └── abis.js              # 合约 ABI 定义
    ├── public/                  # 静态资源
    ├── .env.local               # 环境变量
    ├── next.config.js           # Next.js 配置
    └── package.json             # 项目依赖
```

## 智能合约详解

### MockERC20.sol - 测试代币合约
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC20 is ERC20, Ownable {
    constructor() ERC20("Mock Token", "MTK") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**18);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

### StakingContract.sol - 核心质押合约

#### 合约结构
```solidity
contract StakingContract is ReentrancyGuard, Pausable, Ownable {
    // 状态变量
    IERC20 public stakingToken;
    uint256 public constant REWARD_RATE = 15; // 15% APY
    uint256 public totalStaked;
    
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 rewardDebt;
    }
    
    mapping(address => Stake) public stakes;
}
```

#### 核心函数实现细节

1. **质押函数**
```solidity
function stake(uint256 _amount) external nonReentrant whenNotPaused {
    require(_amount > 0, "Amount must be greater than 0");
    
    // 保存待领取奖励
    uint256 pending = calculateRewards(msg.sender);
    
    // 转入代币
    stakingToken.transferFrom(msg.sender, address(this), _amount);
    
    // 更新状态
    stakes[msg.sender].amount += _amount;
    stakes[msg.sender].timestamp = block.timestamp;
    stakes[msg.sender].rewardDebt += pending;
    totalStaked += _amount;
    
    emit Staked(msg.sender, _amount);
}
```

2. **奖励计算公式**
```solidity
function calculateRewards(address _user) public view returns (uint256) {
    Stake memory userStake = stakes[_user];
    if (userStake.amount == 0) return userStake.rewardDebt;
    
    uint256 timeElapsed = block.timestamp - userStake.timestamp;
    uint256 rewards = (userStake.amount * REWARD_RATE * timeElapsed) / (365 days * 100);
    
    return rewards + userStake.rewardDebt;
}
```

### Deploy.s.sol - 部署脚本
```solidity
contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        MockERC20 token = new MockERC20();
        StakingContract staking = new StakingContract(address(token));
        
        // 为奖励池铸造代币
        token.mint(address(staking), 100000 * 10**18);
        
        // 为测试账户铸造代币
        address testUser = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        token.mint(testUser, 10000 * 10**18);

        console.log("MockERC20 deployed at:", address(token));
        console.log("StakingContract deployed at:", address(staking));

        vm.stopBroadcast();
    }
}
```

## 前端应用详解

### 应用配置

#### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false,
    };
    
    return config;
  },
}

module.exports = nextConfig
```

#### app/providers.js
```javascript
'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { localhost } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

const config = getDefaultConfig({
  appName: 'DeFi Staking Platform',
  projectId: 'a3d5e9c4f8b2a1d6e9c4f8b2a1d6e9c4',
  chains: [localhost],
  ssr: true,
});

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {mounted && children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### ABI 定义 (utils/abis.js)
```javascript
export const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

export const STAKING_ABI = [
  "function stake(uint256 amount)",
  "function unstake(uint256 amount)",
  "function claimRewards()",
  "function compound()",
  "function calculateRewards(address user) view returns (uint256)",
  "function getStakeInfo(address user) view returns (uint256 amount, uint256 rewards)",
  "function totalStaked() view returns (uint256)",
  "function stakingToken() view returns (address)",
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount)",
  "event RewardsClaimed(address indexed user, uint256 amount)",
  "event Compounded(address indexed user, uint256 amount)"
];
```

### 自定义 Hooks 实现

#### hooks/useStakingContract.js
```javascript
'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { STAKING_ABI } from '@/utils/abis';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const STAKING_ADDRESS = process.env.NEXT_PUBLIC_STAKING_ADDRESS;

export function useStakingContract() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirming) {
      toast.loading('Transaction is being confirmed...', { id: 'tx' });
    }
    if (isSuccess) {
      toast.success('Transaction confirmed!', { id: 'tx' });
    }
    if (error) {
      toast.error(error.message || 'Transaction failed', { id: 'tx' });
    }
  }, [isConfirming, isSuccess, error]);

  const stake = async (amount) => {
    try {
      await writeContract({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'stake',
        args: [parseEther(amount)],
      });
    } catch (err) {
      console.error('Stake error:', err);
    }
  };

  // unstake, claimRewards, compound 函数类似实现...

  return {
    stake,
    unstake,
    claimRewards,
    compound,
    isPending: isPending || isConfirming,
  };
}
```

## 开发工作流

### 1. 合约开发流程
```bash
# 1. 修改合约代码
# 2. 编译合约
forge build

# 3. 运行测试
forge test -vvv

# 4. 部署到本地
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# 5. 更新前端合约地址
```

### 2. 前端开发流程
```bash
# 1. 修改组件/Hook
# 2. 热重载会自动更新
# 3. 检查浏览器控制台错误
# 4. 使用 React Developer Tools 调试
```

### 3. 联调测试流程
1. 确保 Anvil 运行中
2. 部署最新合约
3. 更新前端合约地址
4. 清除浏览器缓存
5. 重新连接钱包

## Cursor 提示词模板

### 添加新功能
```
Add a new feature to the DeFi staking platform:
- Feature: [描述功能]
- Contract changes: [需要的合约修改]
- Frontend changes: [需要的前端修改]
- Keep the existing 15% APY reward rate
- Maintain security with ReentrancyGuard
- Update tests accordingly
```

### 修复 Bug
```
Fix the following issue in the DeFi staking platform:
- Issue: [描述问题]
- Error message: [错误信息]
- Expected behavior: [期望行为]
- File location: [文件路径]
```

### 优化代码
```
Optimize the [component/contract] for:
- Gas efficiency (for contracts)
- Performance (for frontend)
- User experience
- Keep all existing functionality
```

### 添加测试
```
Write comprehensive tests for [function/component]:
- Test file location: [路径]
- Cover edge cases
- Test both success and failure scenarios
- Use Foundry for contracts, Jest/React Testing Library for frontend
```

## 常见开发任务

### 1. 修改 APY 率
```solidity
// 在 StakingContract.sol 中
uint256 public constant REWARD_RATE = 20; // 改为 20% APY
```

### 2. 添加最小质押限制
```solidity
// 在 stake 函数中添加
uint256 public constant MIN_STAKE = 100 * 10**18; // 100 tokens
require(_amount >= MIN_STAKE, "Below minimum stake");
```

### 3. 添加质押时间锁
```solidity
// 添加到 Stake 结构体
uint256 lockEndTime;

// 在 unstake 函数中检查
require(block.timestamp >= stakes[msg.sender].lockEndTime, "Still locked");
```

### 4. 添加手续费
```solidity
uint256 public constant FEE_RATE = 100; // 1%
uint256 fee = (_amount * FEE_RATE) / 10000;
```

### 5. 前端添加交易历史
```javascript
// 使用 wagmi 的 useContractEvents
const { data: events } = useContractEvents({
  address: STAKING_ADDRESS,
  abi: STAKING_ABI,
  eventName: 'Staked',
  fromBlock: 'earliest',
});
```

## 调试与测试

### 合约测试命令
```bash
# 运行所有测试
forge test

# 运行特定测试
forge test --match-test testStakeTokens

# 显示详细日志
forge test -vvvv

# 显示 gas 报告
forge test --gas-report

# 测试覆盖率
forge coverage
```

### 前端调试技巧
1. **网络请求调试**
   - 浏览器 Network 标签查看 RPC 调用
   - 检查请求和响应数据

2. **状态调试**
   ```javascript
   console.log('Current state:', {
     stakedAmount,
     pendingRewards,
     tokenBalance,
     allowance
   });
   ```

3. **交易调试**
   - 检查 MetaMask 的 Activity 标签
   - 使用 Etherscan (或本地 Anvil 日志)

### 常见错误及解决方案

#### 1. "Insufficient allowance"
```javascript
// 确保先调用 approve
await approve(amount);
// 等待交易确认后再 stake
```

#### 2. "Transaction reverted"
```bash
# 查看详细错误
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 -vvvv
```

#### 3. "Module not found"
```bash
# 清除缓存并重新安装
rm -rf node_modules .next
npm install
```

## 部署流程

### 本地部署检查清单
- [ ] Anvil 正在运行
- [ ] 合约已编译 (`forge build`)
- [ ] 测试全部通过 (`forge test`)
- [ ] 环境变量已设置
- [ ] 前端依赖已安装

### Sepolia 部署步骤
```bash
# 1. 获取 Sepolia ETH
# https://sepoliafaucet.com/

# 2. 设置环境变量
export PRIVATE_KEY=<your-private-key>
export SEPOLIA_RPC_URL=<your-rpc-url>

# 3. 部署并验证
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY

# 4. 更新前端配置
# - 修改 providers.js 中的 chain
# - 更新 .env.local 中的地址和链 ID
```

### 生产部署注意事项
1. **安全审计**：部署前进行代码审计
2. **多签钱包**：使用多签作为 owner
3. **监控设置**：设置事件监控
4. **紧急响应**：准备暂停机制
5. **文档更新**：更新用户文档

## 故障排除

### MetaMask 问题
```javascript
// 重置账户
Settings -> Advanced -> Reset Account

// 切换网络
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0x7A69' }], // 31337 in hex
});
```

### 合约问题
```solidity
// 添加调试日志
import "forge-std/console.sol";

function stake(uint256 _amount) external {
    console.log("Staking amount:", _amount);
    console.log("Sender balance:", stakingToken.balanceOf(msg.sender));
    // ...
}
```

### 前端问题
```javascript
// 添加错误边界
export default function ErrorBoundary({ children }) {
  return (
    <ErrorBoundaryComponent
      fallback={<div>Something went wrong</div>}
      onError={(error) => console.error('Error:', error)}
    >
      {children}
    </ErrorBoundaryComponent>
  );
}
```

## 性能优化建议

### 合约优化
1. **状态变量打包**
```solidity
// 优化前
uint256 amount;
uint256 timestamp;
uint256 rewardDebt;

// 优化后
uint128 amount;
uint64 timestamp;
uint128 rewardDebt;
```

2. **批量操作**
```solidity
function batchStake(uint256[] calldata amounts) external {
    for (uint i = 0; i < amounts.length; i++) {
        stake(amounts[i]);
    }
}
```

### 前端优化
1. **查询优化**
```javascript
// 使用 multicall 批量查询
const { data } = useContractReads({
  contracts: [
    { ...stakingContract, functionName: 'totalStaked' },
    { ...stakingContract, functionName: 'getStakeInfo', args: [address] },
    { ...tokenContract, functionName: 'balanceOf', args: [address] },
  ],
});
```

2. **渲染优化**
```javascript
// 使用 React.memo
export default React.memo(StatsCard, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value;
});
```

## 安全最佳实践

1. **输入验证**
```solidity
require(_amount > 0, "Invalid amount");
require(_amount <= stakingToken.balanceOf(msg.sender), "Insufficient balance");
```

2. **重入防护**
```solidity
// 始终使用 ReentrancyGuard
function withdraw() external nonReentrant {
    // ...
}
```

3. **权限控制**
```solidity
modifier onlyOwner() {
    require(msg.sender == owner(), "Not authorized");
    _;
}
```

4. **紧急机制**
```solidity
function emergencyPause() external onlyOwner {
    _pause();
    emit EmergencyPause(block.timestamp);
}
```