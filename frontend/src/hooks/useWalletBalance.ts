import { ethers } from "ethers";
import { useEffect, useState, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../hooks/use-toast";

export const useWalletBalance = () => {
    const { account, provider } = useWallet();
    const [balance, setBalance] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchWalletBalance = useCallback(async () => {
        if (!account || !provider) return;

        setLoading(true);
        try {
            const balanceInWei = await provider.getBalance(account);
            const balanceInEth = ethers.formatEther(balanceInWei);
            setBalance(balanceInEth);
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast({
                    variant: "destructive",
                    title: "Error fetching wallet balance",
                    description: error.message || "An error occurred",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error fetching wallet balance",
                    description: "An unknown error occurred",
                });
            }
        } finally {
            setLoading(false);
        }
    }, [account, provider, toast]);

    useEffect(() => {
        fetchWalletBalance();
    }, [fetchWalletBalance]);

    const refreshWalletBalance = async () => {
        await fetchWalletBalance();
      };

    return { balance, loading, refreshWalletBalance };
};
