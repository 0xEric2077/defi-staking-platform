import { useState } from "react";
import { useContractWrite, useWaitForTransaction } from "wagmi";
import toast from "react-hot-toast";

export function useTransaction(contractMethod) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);

  // Wrapper for contract transactions
  const { write: execute, isLoading: writeLoading } = useContractWrite({
    ...contractMethod,
    onError: (err) => {
      setError(err);
      toast.error(`Transaction failed: ${err.message}`);
      setIsLoading(false);
    },
    onSuccess: (data) => {
      setTransactionHash(data.hash);
      toast.success("Transaction submitted! Waiting for confirmation...");
      setIsLoading(true);
    },
  });

  // Wait for confirmations
  const { isSuccess: waitSuccess } = useWaitForTransaction({
    hash: transactionHash,
    onSuccess: () => {
      toast.success("Transaction confirmed!");
      setIsSuccess(true);
      setIsLoading(false);
    },
    onError: (err) => {
      toast.error(`Confirmation failed: ${err.message}`);
      setIsLoading(false);
    },
  });

  // Reset function
  const reset = () => {
    setIsLoading(false);
    setIsSuccess(false);
    setError(null);
    setTransactionHash(null);
  };

  return {
    execute: (params) => {
      reset(); // Reset state before executing
      return execute({ args: params });
    },
    isLoading: isLoading || writeLoading,
    isSuccess: isSuccess || waitSuccess,
    error,
    reset,
  };
}
