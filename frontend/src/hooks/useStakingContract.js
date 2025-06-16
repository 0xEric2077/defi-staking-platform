import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';
import { getContractInstance } from '../lib/contracts'; // Adjust the import path as necessary
import { useAccount } from 'wagmi';

export function useStakingContract() {
  const { address } = useAccount();

  // Stake function with approval check
  const { write: stake, isLoading: isStaking } = useContractWrite({
    // Replace with your staking contract address and ABI
    ...getContractInstance('staking', address),
    functionName: 'stake',
    onError: (error) => {
      toast.error();
    },
  });

  // Unstake function with validation
  const { write: unstake, isLoading: isUnstaking } = useContractWrite({
    ...getContractInstance('staking', address),
    functionName: 'unstake',
    onError: (error) => {
      toast.error();
    },
  });

  // Claim rewards function
  const { write: claimRewards, isLoading: isClaimingRewards } = useContractWrite({
    ...getContractInstance('staking', address),
    functionName: 'claimRewards',
    onError: (error) => {
      toast.error();
    },
  });

  // Compound function
  const { write: compound, isLoading: isCompounding } = useContractWrite({
    ...getContractInstance('staking', address),
    functionName: 'compound',
    onError: (error) => {
      toast.error();
    },
  });

  return {
    stake: (amount) => stake({ args: [parseEther(amount.toString())] }),
    unstake: (amount) => unstake({ args: [parseEther(amount.toString())] }),
    claimRewards,
    compound,
    isLoading: {
      stake: isStaking,
      unstake: isUnstaking,
      claimRewards: isClaimingRewards,
      compound: isCompounding,
    },
  };
}

